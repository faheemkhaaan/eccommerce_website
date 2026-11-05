/**
 * Review rules shared by the storefront form and the server action.
 *
 * Deliberately free of `server-only` and of any Supabase import: the client
 * component that renders the form validates with the same limits the action
 * enforces, so the two can never drift.
 */

/** Where a review sits in moderation. Only `published` is public. */
export type ReviewStatus = "pending" | "published";

export type Review = {
    id: string;
    productId: string;
    /** 1–5. */
    rating: number;
    title: string | null;
    body: string;
    /** First name from the delivery address, set by the database — not the reviewer. */
    authorName: string;
    status: ReviewStatus;
    createdAt: string;
};

/** Mirrors the CHECK constraints on product_reviews in migration 0010. */
export const MIN_REVIEW_BODY = 10;
export const MAX_REVIEW_BODY = 1500;
export const MAX_REVIEW_TITLE = 80;

export type ReviewSummary = { average: number; count: number };

/** What `submitReview` reports back. It returns instead of redirecting so the
 * form can show the outcome without losing what the reviewer typed. */
export type ReviewResult = { ok: true } | { ok: false; message: string };

/** Mean score and how many reviews it is based on. */
export function summarise(reviews: Pick<Review, "rating">[]): ReviewSummary {
    if (reviews.length === 0) return { average: 0, count: 0 };
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return { average: Math.round((total / reviews.length) * 10) / 10, count: reviews.length };
}

/**
 * The first thing wrong with a submitted review, or null when it is fine.
 * Returns a sentence for the reader rather than a code, since both the form and
 * the action show it verbatim.
 */
export function reviewProblem(input: { rating: number; title: string; body: string }): string | null {
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
        return "Pick a rating between 1 and 5 stars.";
    }
    if (input.title.trim().length > MAX_REVIEW_TITLE) {
        return `Please keep the headline under ${MAX_REVIEW_TITLE} characters.`;
    }

    const body = input.body.trim();
    if (body.length < MIN_REVIEW_BODY) return `Please write at least ${MIN_REVIEW_BODY} characters.`;
    if (body.length > MAX_REVIEW_BODY) return `Please keep the review under ${MAX_REVIEW_BODY} characters.`;

    return null;
}

/** "12 Mar 2026" — dates only ever render on the server, so no locale drift. */
export const fmtReviewDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
