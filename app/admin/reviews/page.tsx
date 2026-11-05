import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { approveReview, removeReview } from "@/app/admin/reviews/actions";
import StatusNote, { NotesType } from "@/components/admin/StatusNote";
import { StarIcon } from "@/components/Icons";
import { listReviewQueue, type QueuedReview } from "@/lib/review-queries";
import { fmtReviewDate } from "@/lib/reviews";
import { requireRole } from "@/lib/roles";

export const metadata: Metadata = { title: "Reviews — Organic Ghee" };

type Props = { searchParams: Promise<{ status?: NotesType }> };

export default function AdminReviewsPage({ searchParams }: Props) {
    return (
        <Suspense fallback={<ReviewsSkeleton />}>
            <ResolvedReviews searchParams={searchParams} />
        </Suspense>
    );
}

async function ResolvedReviews({ searchParams }: Props) {
    await requireRole("admin", "/admin/reviews");

    const [{ status }, reviews] = await Promise.all([searchParams, listReviewQueue()]);
    const pending = reviews.filter((r) => r.status === "pending");

    return (
        <div className="max-w-3xl">
            <header>
                <p className="eyebrow">Feedback</p>
                <h1 className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] leading-tight tracking-tight">
                    Reviews
                </h1>
                <p className="mt-3 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
                    Only customers whose order has been delivered can write here, so every review below
                    is a verified purchase. Nothing reaches the shop until you publish it.
                </p>
                <StatusNote status={status} />
            </header>

            {pending.length > 0 && (
                <p className="mt-6 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-[0.8rem] text-accent">
                    {pending.length === 1 ? "1 review is" : `${pending.length} reviews are`} waiting to be read.
                </p>
            )}

            <div className="mt-6 space-y-4">
                {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                ))}
                {reviews.length === 0 && (
                    <p className="text-[0.85rem] text-muted">
                        No reviews yet. They arrive here once a customer whose jar has been delivered
                        writes one.
                    </p>
                )}
            </div>
        </div>
    );
}

function ReviewCard({ review }: { review: QueuedReview }) {
    const published = review.status === "published";

    return (
        <article className="rounded-xl border border-line bg-sand/25 p-5">
            <div className="flex flex-wrap items-center gap-3">
                <span className="flex gap-0.5" aria-hidden>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <span
                            key={n}
                            className={n <= review.rating ? "text-ink [&_svg]:fill-current" : "text-muted/30"}
                        >
                            <StarIcon size={12} />
                        </span>
                    ))}
                </span>
                <span
                    className={`label-sm rounded-full px-2 py-1 text-[9px] ${published ? "bg-leaf/15 text-leaf" : "bg-accent/15 text-accent"
                        }`}
                >
                    {published ? "Published" : "Waiting"}
                </span>
                <span className="label-sm text-[9px] text-muted">
                    {review.authorName} · {fmtReviewDate(review.createdAt)}
                </span>
                <Link
                    href={`/admin/products/${review.productId}`}
                    className="ml-auto text-[0.75rem] text-muted underline hover:text-ink"
                >
                    {review.productName}
                </Link>
            </div>

            {review.title && <h2 className="mt-3 font-serif text-lg leading-snug tracking-tight">{review.title}</h2>}
            <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">{review.body}</p>

            <div className="mt-4 flex flex-wrap gap-2">
                {!published && (
                    <form action={approveReview}>
                        <input type="hidden" name="id" value={review.id} />
                        <button type="submit" className="btn btn-solid hover:opacity-85">
                            Publish
                        </button>
                    </form>
                )}
                <form action={removeReview}>
                    <input type="hidden" name="id" value={review.id} />
                    <button
                        type="submit"
                        className="btn border border-line bg-paper text-ink hover:opacity-70"
                    >
                        {published ? "Withdraw" : "Reject"}
                    </button>
                </form>
            </div>
        </article>
    );
}

/** Shape-matched fallback for the moderation queue. */
function ReviewsSkeleton() {
    return (
        <div className="max-w-3xl">
            <div className="h-3 w-16 animate-pulse rounded-full bg-muted/15" />
            <div className="mt-4 h-10 w-40 animate-pulse rounded-full bg-muted/15" />
            <div className="mt-3 h-3 w-full max-w-2xl animate-pulse rounded-full bg-muted/10" />

            <div className="mt-8 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <article key={i} className="rounded-xl border border-line bg-sand/25 p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-20 animate-pulse rounded-full bg-muted/15" />
                            <div className="h-4 w-16 animate-pulse rounded-full bg-muted/10" />
                            <div className="ml-auto h-3 w-28 animate-pulse rounded-full bg-muted/10" />
                        </div>
                        <div className="mt-4 h-4 w-48 animate-pulse rounded-full bg-muted/15" />
                        <div className="mt-3 space-y-2">
                            <div className="h-3 w-full animate-pulse rounded-full bg-muted/10" />
                            <div className="h-3 w-5/6 animate-pulse rounded-full bg-muted/10" />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <div className="h-10 w-24 animate-pulse rounded-lg bg-muted/10" />
                            <div className="h-10 w-24 animate-pulse rounded-lg bg-muted/10" />
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
