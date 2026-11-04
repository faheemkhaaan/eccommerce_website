// Mobile number normalisation for the Pakistan (+92) market.
// Registration stores E.164; the forms collect the local form clients recognise.

export const digits = (value: unknown) => String(value ?? "").replace(/\D/g, "");

/** +923001234567 / 03001234567 / 3001234567 → +923001234567. Empty when there are no digits. */
export function toE164(raw: unknown): string {
    const d = digits(raw);
    if (!d) return "";
    if (d.startsWith("92")) return `+${d}`;
    if (d.startsWith("0")) return `+92${d.slice(1)}`;
    return `+92${d}`;
}

/** …→ 03001234567, the form the checkout and account surfaces display. */
export function localPhone(raw: unknown): string {
    const e = toE164(raw);
    return e ? `0${e.slice(3)}` : "";
}
