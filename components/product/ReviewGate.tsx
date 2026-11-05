import Link from "next/link";
import { getReviewAccess } from "@/lib/review-queries";
import { fmtReviewDate, type Review } from "@/lib/reviews";
import ReviewForm from "./ReviewForm";

/** Where the visitor's own review stands, shown instead of the form. */
function MyReview({ review }: { review: Review }) {
    const published = review.status === "published";

    return (
        <div className={`rounded-xl border p-5 ${published ? "border-leaf/40 bg-leaf/10" : "border-line bg-sand/40"}`}>
            <div className="flex flex-wrap items-center gap-3">
                <p className="text-[0.9rem] text-ink">
                    {published ? "Your review is published." : "Your review is waiting to be read."}
                </p>
                <span className="label-sm rounded-full bg-muted/15 px-2 py-1 text-[9px] text-muted">
                    {published ? "Published" : "In review"}
                </span>
            </div>

            <p className="mt-3 text-[0.85rem] text-muted">
                {review.rating} out of 5 · {fmtReviewDate(review.createdAt)}
            </p>
            {review.title && <p className="mt-2 font-serif text-lg tracking-tight">{review.title}</p>}
            <p className="mt-1 text-[0.9rem] leading-relaxed text-muted">{review.body}</p>

            {!published && (
                <p className="mt-4 text-[0.78rem] text-muted">
                    We read every review before it goes live, so it may take a little while to appear above.
                </p>
            )}
        </div>
    );
}

/**
 * Decides what a visitor sees where the review form would be: their own review,
 * the form, or why they cannot write one.
 *
 * Session-bound, so the product page renders it inside its own Suspense boundary
 * — that keeps the published reviews above it in the prerendered HTML.
 */
export default async function ReviewGate({ productId }: { productId: string }) {
    const { signedIn, canReview, myReview } = await getReviewAccess(productId);

    if (myReview) return <MyReview review={myReview} />;
    if (canReview) return <ReviewForm productId={productId} />;

    return (
        <p className="max-w-2xl text-[0.9rem] leading-relaxed text-muted">
            {signedIn ? (
                <>
                    Reviews are open to customers whose order has been delivered. Once your jar arrives,
                    the form appears here.
                </>
            ) : (
                <>
                    Reviews come only from customers who have received this product.{" "}
                    <Link href={`/login?next=/products/${productId}`} className="text-ink underline">
                        Sign in
                    </Link>{" "}
                    to see whether yours is ready.
                </>
            )}
        </p>
    );
}
