const NOTES: Record<string, { ok: boolean; text: string }> = {
    saved: { ok: true, text: "Changes saved. The shop is updated." },
    created: { ok: true, text: "Pack added." },
    deleted: { ok: true, text: "Pack removed." },
    duplicate: { ok: false, text: "That pack label is already used on this product." },
    "product-created": {
        ok: true,
        text: "Product created. Add a pack size below before it can go on sale.",
    },
    "duplicate-product": {
        ok: false,
        text: "That product URL is already taken. Pick a different one.",
    },
    invalid: { ok: false, text: "Those values were rejected. Check the required fields and try again." },
};

/** Renders the ?status= flag a server action redirected back with. */
export default function StatusNote({ status }: { status?: string }) {
    const note = status ? NOTES[status] : undefined;
    if (!note) return null;

    return (
        <p
            role="status"
            className={`mt-4 rounded-lg border px-4 py-3 text-[0.8rem] ${
                note.ok ? "border-leaf/40 bg-leaf/10 text-leaf" : "border-accent/40 bg-accent/10 text-accent"
            }`}
        >
            {note.text}
        </p>
    );
}
