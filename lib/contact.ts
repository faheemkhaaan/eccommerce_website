/**
 * How a customer reaches the shop, and the rules their message must satisfy.
 *
 * Free of `server-only` and of any Supabase import, for the same reason as
 * `lib/reviews.ts`: the contact form and the server action both validate against
 * this file, so their limits cannot drift apart.
 *
 * The channel values come from the environment so the owner can change the
 * number without touching code. `NEXT_PUBLIC_` because the footer and the
 * contact page render them, and they are meant to be public.
 */

import { toE164 } from "@/lib/phone";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

/** Fallback is the placeholder the footer has always shown — replace it before launch. */
const WHATSAPP = digitsOnly(process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "923001234567");
const EMAIL = (process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "").trim();

/** "+92 300 1234567" — the number as a person reads it aloud. */
function phoneDisplay(): string {
    const local = WHATSAPP.startsWith("92") ? WHATSAPP.slice(2) : WHATSAPP;
    if (local.length !== 10) return `+${WHATSAPP}`;
    return `+92 ${local.slice(0, 3)} ${local.slice(3)}`;
}

/**
 * The published contact channels. Each is `null` when it is not configured,
 * so callers render only what actually works rather than a dead link.
 */
export const SUPPORT = {
    whatsapp: WHATSAPP
        ? {
            href: `https://wa.me/${WHATSAPP}`,
            tel: `tel:+${WHATSAPP}`,
            label: phoneDisplay(),
        }
        : null,
    email: EMAIL ? { href: `mailto:${EMAIL}`, label: EMAIL } : null,
    address: ["Dairy & packing house, Sundar Estate", "Lahore, Pakistan"],
} as const;

/** The prefilled first message a WhatsApp link opens with. */
export function whatsappHref(text: string): string {
    if (!SUPPORT.whatsapp) return "";
    return `${SUPPORT.whatsapp.href}?text=${encodeURIComponent(text)}`;
}

/** What a message is about. Drives the inbox grouping and how staff triage it. */
export const TOPICS = [
    { value: "order", label: "An order or a delivery" },
    { value: "product", label: "A question about the ghee" },
    { value: "return", label: "A problem with a jar" },
    { value: "other", label: "Something else" },
] as const;

export type ContactTopic = (typeof TOPICS)[number]["value"];

export const isTopic = (value: string): value is ContactTopic =>
    TOPICS.some((t) => t.value === value);

/** The human wording for a topic, for the staff inbox. */
export const topicLabel = (value: string) =>
    TOPICS.find((t) => t.value === value)?.label ?? "Something else";

/** Mirrors the CHECK constraints on contact_messages in migration 0011. */
export const MIN_MESSAGE_BODY = 10;
export const MAX_MESSAGE_BODY = 2000;
export const MAX_CONTACT_NAME = 80;
export const MAX_CONTACT_EMAIL = 160;
export const MAX_ORDER_REF = 40;

/** What `sendMessage` reports back. It returns instead of redirecting so a
 * refusal does not wipe what the customer wrote. */
export type ContactResult = { ok: true } | { ok: false; message: string };

const EMAIL_SHAPE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * The first thing wrong with a message, or null when it is fine.
 *
 * Returns a sentence for the reader rather than a code, since both the form and
 * the action display it verbatim.
 */
export function messageProblem(input: {
    name: string;
    email: string;
    phone: string;
    topic: string;
    orderRef: string;
    body: string;
}): string | null {
    if (!isTopic(input.topic)) return "Pick what your message is about.";

    const name = input.name.trim();
    if (!name) return "Please tell us your name.";
    if (name.length > MAX_CONTACT_NAME) return `Please keep your name under ${MAX_CONTACT_NAME} characters.`;

    // The database requires one or the other, so say so here rather than letting
    // the insert fail with a constraint error the customer cannot act on.
    const email = input.email.trim();
    const phone = input.phone.trim();
    if (!email && !phone) return "Leave an email or a mobile number so we can reply.";
    if (email && !EMAIL_SHAPE.test(email)) return "That email address does not look right.";
    if (email.length > MAX_CONTACT_EMAIL) return `Please keep your email under ${MAX_CONTACT_EMAIL} characters.`;
    if (phone && !/^\+923\d{9}$/.test(toE164(phone))) {
        return "That mobile number does not look like a Pakistani number.";
    }

    if (input.orderRef.trim().length > MAX_ORDER_REF) {
        return `Please keep the order ID under ${MAX_ORDER_REF} characters.`;
    }

    const body = input.body.trim();
    if (body.length < MIN_MESSAGE_BODY) {
        return `Please add a little more detail — at least ${MIN_MESSAGE_BODY} characters.`;
    }
    if (body.length > MAX_MESSAGE_BODY) return `Please keep your message under ${MAX_MESSAGE_BODY} characters.`;

    return null;
}

/** "12 Mar 2026" — messages only ever render on the server, so no locale drift. */
export const fmtMessageDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
