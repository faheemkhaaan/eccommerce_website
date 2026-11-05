"use server";

import { reviewableOrder } from "@/lib/review-queries";
import { reviewProblem, type ReviewResult } from "@/lib/reviews";
import { getCurrentUser } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

/**
 * Files a signed-in customer's review of a product.
 *
 * Returning a result rather than redirecting lets the form report a refusal in
 * place, and keeps what the reviewer typed on screen.
 *
 * None of this is the security boundary. The insert policy in migration 0010
 * re-derives the qualifying order with `reviewable_order()` and pins the status
 * to `pending`, so a request that skips this action still cannot review a jar it
 * never received, or publish itself.
 */
export async function submitReview(
    _previous: ReviewResult | null,
    formData: FormData,
): Promise<ReviewResult> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, message: "Please sign in to review this product." };

    const productId = String(formData.get("product_id") ?? "").trim();
    const rating = Number.parseInt(String(formData.get("rating") ?? ""), 10);
    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();

    if (!productId) return { ok: false, message: "That product could not be identified." };

    const problem = reviewProblem({ rating, title, body });
    if (problem) return { ok: false, message: problem };

    // Asked of the database, so the answer matches what the insert policy will do.
    const orderId = await reviewableOrder(productId);
    if (!orderId) {
        return { ok: false, message: "Only customers whose order has been delivered can review this product." };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("product_reviews").insert({
        product_id: productId,
        user_id: user.userId,
        order_id: orderId,
        rating,
        title: title || null,
        body,
    });

    if (error) {
        // unique (user_id, product_id) — they have already had their say.
        if (error.code === "23505") return { ok: false, message: "You have already reviewed this product." };
        return { ok: false, message: "Your review could not be saved. Please try again." };
    }

    // Nothing to invalidate: a new review is pending, so it is not in the public
    // list the storefront caches. That happens on approval, in the admin action.
    return { ok: true };
}
