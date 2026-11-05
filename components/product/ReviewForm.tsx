"use client";

import { useActionState, useState } from "react";
import { StarIcon } from "@/components/Icons";
import { inputCls } from "@/components/auth/Field";
import { MAX_REVIEW_BODY, MAX_REVIEW_TITLE, type ReviewResult } from "@/lib/reviews";
import { submitReview } from "@/app/(shop)/review-actions";

const STARS = [1, 2, 3, 4, 5];
const RATING_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/**
 * The review form, shown only to a customer the database has confirmed received
 * this product.
 *
 * It posts through useActionState rather than a redirect so a rejected review —
 * too short, already posted, no qualifying order — comes back with the text
 * still in the box instead of reloading the page empty.
 */
export default function ReviewForm({ productId }: { productId: string }) {
    const [rating, setRating] = useState(0);
    const [state, action, pending] = useActionState<ReviewResult | null, FormData>(submitReview, null);

    if (state?.ok) {
        return (
            <div className="rounded-xl border border-leaf/40 bg-leaf/10 p-5">
                <p className="text-[0.9rem] text-ink">Thank you — your review is with us.</p>
                <p className="mt-1 text-[0.8rem] text-muted">
                    We read every one before it appears, so it should show up here shortly.
                </p>
            </div>
        );
    }

    return (
        <form action={action} className="rounded-xl border border-line bg-sand/30 p-5">
            <input type="hidden" name="product_id" value={productId} />

            <h3 className="font-serif text-lg tracking-tight">Write a review</h3>
            <p className="mt-1 text-[0.8rem] text-muted">
                You bought this, so we would like to know how it went.
            </p>

            <fieldset className="mt-5">
                <legend className="label-sm text-[10px] tracking-[0.14em]">Your rating</legend>
                <div className="mt-2.5 flex items-center gap-1.5">
                    {STARS.map((n) => (
                        <label key={n} className="cursor-pointer">
                            <input
                                type="radio"
                                name="rating"
                                value={n}
                                checked={rating === n}
                                onChange={() => setRating(n)}
                                required
                                className="peer sr-only"
                            />
                            <span
                                className={`block transition peer-focus-visible:ring-1 peer-focus-visible:ring-ink ${
                                    n <= rating ? "text-ink" : "text-muted/40 hover:text-muted"
                                }`}
                            >
                                <StarIcon size={24} />
                            </span>
                            <span className="sr-only">{n} star{n === 1 ? "" : "s"}</span>
                        </label>
                    ))}
                    {rating > 0 && (
                        <span className="ml-2 text-[0.8rem] text-muted">{RATING_WORDS[rating]}</span>
                    )}
                </div>
            </fieldset>

            <div className="mt-5">
                <label htmlFor="review-title" className="label-sm text-[10px] tracking-[0.14em]">
                    Headline <span className="text-muted/70">(optional)</span>
                </label>
                <input
                    id="review-title"
                    name="title"
                    maxLength={MAX_REVIEW_TITLE}
                    placeholder="Tastes like the ghee we had at home"
                    className={`${inputCls} mt-2.5`}
                />
            </div>

            <div className="mt-5">
                <label htmlFor="review-body" className="label-sm text-[10px] tracking-[0.14em]">
                    Your review
                </label>
                <textarea
                    id="review-body"
                    name="body"
                    rows={5}
                    required
                    minLength={10}
                    maxLength={MAX_REVIEW_BODY}
                    placeholder="What did you cook with it? How was the jar, the aroma, the delivery?"
                    className={`${inputCls} mt-2.5 resize-y`}
                />
            </div>

            {state && !state.ok && (
                <p role="alert" className="mt-4 text-[0.8rem] text-[#b4372b]">
                    {state.message}
                </p>
            )}

            <button type="submit" disabled={pending} className="btn btn-solid mt-5 hover:opacity-85 disabled:opacity-60">
                {pending ? "Sending…" : "Submit review"}
            </button>
            <p className="mt-3 text-[0.75rem] text-muted">
                Reviews are read before they appear. Your first name and the fact that you bought this
                are shown; nothing else about your order is.
            </p>
        </form>
    );
}
