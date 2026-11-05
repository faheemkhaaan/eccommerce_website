import "server-only";
import { cacheTag } from "next/cache";
import { getCurrentUser } from "@/lib/roles";
import { summarise, type Review, type ReviewStatus, type ReviewSummary } from "@/lib/reviews";
import { publicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

/** Invalidate this after any write to product_reviews. */
export const REVIEWS_TAG = "reviews";

type ReviewRow = {
    id: string;
    product_id: string;
    rating: number;
    title: string | null;
    body: string;
    author_name: string;
    status: ReviewStatus;
    created_at: string;
};

const COLUMNS = "id, product_id, rating, title, body, author_name, status, created_at";

const toReview = (row: ReviewRow): Review => ({
    id: row.id,
    productId: row.product_id,
    rating: row.rating,
    title: row.title,
    body: row.body,
    authorName: row.author_name,
    status: row.status,
    createdAt: row.created_at,
});

/**
 * The published reviews for a product, newest first, with their average.
 *
 * Cached and tagged so the text is part of the prerendered product page — which
 * is the whole point of collecting it — and carries no session, so it reads with
 * the anon client and lets RLS decide.
 */
export async function getProductReviews(
    productId: string,
): Promise<{ reviews: Review[]; summary: ReviewSummary }> {
    "use cache";
    cacheTag(REVIEWS_TAG);

    const { data, error } = await publicClient
        .from("product_reviews")
        .select(COLUMNS)
        .eq("product_id", productId)
        .eq("status", "published")
        .order("created_at", { ascending: false });

    if (error) throw new Error(`Could not load reviews: ${error.message}`);

    const reviews = (data as unknown as ReviewRow[]).map(toReview);
    return { reviews, summary: summarise(reviews) };
}

/** What the storefront needs to know about *this* visitor before showing a form. */
export type ReviewAccess = {
    /** Whether anybody is signed in — decides between "sign in" and "not yet delivered". */
    signedIn: boolean;
    /** True only for a signed-in customer who received this product and has not reviewed it. */
    canReview: boolean;
    /** Their own review, published or not, so the page can show where it stands. */
    myReview: Review | null;
};

/**
 * Resolves the visitor's standing on this product in one pass: whether they may
 * review it, and the review they already filed if there is one.
 *
 * `canReview` comes from `can_review_product()` rather than a client-side guess,
 * so the form and the insert policy can never disagree about who is allowed.
 */
export async function getReviewAccess(productId: string): Promise<ReviewAccess> {
    const user = await getCurrentUser();
    if (!user) return { signedIn: false, canReview: false, myReview: null };

    const supabase = await createClient();
    const [{ data }, { data: allowed }] = await Promise.all([
        supabase
            .from("product_reviews")
            .select(COLUMNS)
            .eq("product_id", productId)
            .eq("user_id", user.userId)
            .maybeSingle(),
        supabase.rpc("can_review_product", { p_product_id: productId }),
    ]);

    return {
        signedIn: true,
        canReview: allowed === true,
        myReview: data ? toReview(data as unknown as ReviewRow) : null,
    };
}

/**
 * The delivered order that qualifies a review of this product. Null means the
 * caller has not received one, which is also what the insert policy will say.
 */
export async function reviewableOrder(productId: string): Promise<string | null> {
    const supabase = await createClient();
    const { data } = await supabase.rpc("reviewable_order", { p_product_id: productId });
    return typeof data === "string" ? data : null;
}

export type QueuedReview = Review & { productName: string };

/** Every review, pending first, for the moderation queue. Staff only (RLS). */
export async function listReviewQueue(): Promise<QueuedReview[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("product_reviews")
        .select(`${COLUMNS}, products ( name )`)
        .order("status", { ascending: true })
        .order("created_at", { ascending: false });

    if (error) throw new Error(`Could not load the review queue: ${error.message}`);

    return (data as unknown as (ReviewRow & { products: { name: string } | null })[]).map((row) => ({
        ...toReview(row),
        productName: row.products?.name ?? row.product_id,
    }));
}
