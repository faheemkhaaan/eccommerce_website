import { StarIcon } from "@/components/Icons";
import { fmtReviewDate, type Review, type ReviewSummary } from "@/lib/reviews";

/** Filled stars out of five, rounded to the nearest whole star. */
function Stars({ value }: { value: number }) {
    const filled = Math.round(value);
    return (
        <span className="flex gap-0.5" aria-hidden>
            {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={n <= filled ? "text-ink" : "text-muted/30"}>
                    <StarIcon size={13} />
                </span>
            ))}
        </span>
    );
}

type Props = {
    reviews: Review[];
    summary: ReviewSummary;
    /** The composer, the visitor's pending review, or a prompt — resolved per visitor. */
    children?: React.ReactNode;
};

/**
 * The published reviews, with the average they add up to.
 *
 * Purely presentational and server-rendered from a cached read, so the text ends
 * up in the page a crawler sees rather than being fetched after hydration. The
 * one thing it cannot know — who is reading — arrives in `children`.
 */
export default function Reviews({ reviews, summary, children }: Props) {
    return (
        <section id="reviews" className="mt-16 border-t border-line pt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">Reviews</p>
                    <h2 className="mt-2 font-serif text-[clamp(1.5rem,2.4vw,2rem)] leading-tight tracking-tight">
                        What customers say
                    </h2>
                </div>

                {summary.count > 0 && (
                    <div className="flex items-center gap-3">
                        <Stars value={summary.average} />
                        <p className="text-[0.85rem] text-muted">
                            <span className="text-ink">{summary.average.toFixed(1)}</span> out of 5 ·{" "}
                            {summary.count} {summary.count === 1 ? "review" : "reviews"}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-6 max-w-2xl">{children}</div>

            {reviews.length === 0 ? (
                <p className="mt-6 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
                    No reviews yet. Every review here comes from a customer whose jar has actually been
                    delivered.
                </p>
            ) : (
                <ul className="mt-8 grid max-w-3xl gap-6 sm:grid-cols-2 sm:gap-8">
                    {reviews.map((r) => (
                        <li key={r.id} className="rounded-xl border border-line bg-sand/25 p-5">
                            <div className="flex items-center gap-3">
                                <Stars value={r.rating} />
                                <span className="label-sm rounded-full bg-leaf/15 px-2 py-1 text-[9px] text-leaf">
                                    Verified purchase
                                </span>
                            </div>

                            {r.title && <h3 className="mt-3 font-serif text-lg leading-snug tracking-tight">{r.title}</h3>}

                            <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">{r.body}</p>

                            <p className="mt-4 text-[0.75rem] text-muted/80">
                                {r.authorName} · <time dateTime={r.createdAt}>{fmtReviewDate(r.createdAt)}</time>
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
