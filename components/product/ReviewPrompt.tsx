import Link from "next/link";

/**
 * The nudge to review a jar that has already arrived.
 *
 * It shows from the moment an order is `delivered` and stays until the customer
 * writes something, rather than waiting a fixed number of days. With no email and
 * no push notification there is nothing to bring a customer back later, so the ask
 * has to be standing wherever they happen to land — the wording carries the "only
 * once you have cooked with it" part instead of a timer.
 */
export default function ReviewPrompt({ productId }: { productId: string }) {
    return (
        <div className="rounded-2xl border border-leaf/40 bg-leaf/10 p-5">
            <p className="font-serif text-lg leading-tight">How was your jar?</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
                Once you have cooked with it, a few lines help the next person decide. Only customers
                whose parcel has been delivered can write here.
            </p>
            <Link
                href={`/products/${productId}#reviews`}
                className="label-sm mt-4 inline-flex h-10 items-center rounded-full bg-ink px-5 text-[10px] text-white transition hover:opacity-85"
            >
                Write a review
            </Link>
        </div>
    );
}
