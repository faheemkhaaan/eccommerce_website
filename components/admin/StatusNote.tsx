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
    assigned: { ok: true, text: "Rider assigned. They will see the parcel in their queue." },
    unassigned: { ok: true, text: "Rider removed from this parcel." },
    "status-updated": { ok: true, text: "Status updated. Tracking will show the new step." },
    closed: { ok: false, text: "This order is already closed." },
    denied: { ok: false, text: "You are not allowed to change that." },
    missing: { ok: false, text: "That order was not found." },
    "not-a-rider": { ok: false, text: "That account is not a rider. Grant the driver role first." },
    "role-granted": { ok: true, text: "Role updated." },
    "self-demote": { ok: false, text: "You cannot take away your own admin role." },
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
