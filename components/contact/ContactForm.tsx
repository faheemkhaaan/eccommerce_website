"use client";

import { useActionState, useState } from "react";
import { sendMessage } from "@/app/(shop)/contact-actions";
import { inputCls } from "@/components/auth/Field";
import {
    MAX_CONTACT_EMAIL,
    MAX_CONTACT_NAME,
    MAX_MESSAGE_BODY,
    MAX_ORDER_REF,
    MIN_MESSAGE_BODY,
    TOPICS,
    type ContactResult,
    type ContactTopic,
} from "@/lib/contact";

type Props = {
    /** Prefilled from the account when someone is signed in. */
    name?: string;
    email?: string;
    phone?: string;
    /** Order ID carried in from an order page, so it arrives already identified. */
    orderRef?: string;
    topic: ContactTopic;
    signedIn: boolean;
};

/**
 * The message form, open to guests as well as customers.
 *
 * It posts through useActionState rather than a redirect so a refused message —
 * missing reply address, too short — comes back with the text still in the box.
 * The same reasons are re-checked in `sendMessage`, which is the version that
 * counts.
 */
export default function ContactForm({
    name = "",
    email = "",
    phone = "",
    orderRef = "",
    topic,
    signedIn,
}: Props) {
    const [state, action, pending] = useActionState<ContactResult | null, FormData>(sendMessage, null);

    // The confirmation is acknowledged once, then dismissible, so a second message
    // does not need a page reload. Matched by object identity rather than by `ok`,
    // so the panel comes back after the next send.
    const [acknowledged, setAcknowledged] = useState<ContactResult | null>(null);

    if (state?.ok && state !== acknowledged) {
        return (
            <div className="rounded-xl border border-leaf/40 bg-leaf/10 p-5">
                <p className="text-[0.9rem] text-ink">Thank you — your message is with us.</p>
                <p className="mt-1 text-[0.8rem] text-muted">
                    We read these through the day and reply to the email or number you left, so there
                    is nothing to check back on here. If the parcel is already on its way, WhatsApp
                    reaches us fastest.
                </p>
                <button
                    type="button"
                    onClick={() => setAcknowledged(state)}
                    className="mt-4 text-[0.8rem] text-ink underline underline-offset-4"
                >
                    Send another message
                </button>
            </div>
        );
    }

    const label = "label-sm text-[10px] tracking-[0.14em]";

    return (
        <form action={action} className="relative rounded-xl border border-line bg-sand/30 p-5 sm:p-6">
            {signedIn && (
                <p className="mb-5 text-[0.8rem] text-muted">
                    Sending from your account, so we can see your orders alongside your message.
                </p>
            )}

            <div>
                <label htmlFor="contact-name" className={label}>
                    Your name
                </label>
                <input
                    id="contact-name"
                    name="name"
                    required
                    maxLength={MAX_CONTACT_NAME}
                    defaultValue={name}
                    autoComplete="name"
                    className={`${inputCls} mt-2.5`}
                />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                    <label htmlFor="contact-email" className={label}>
                        Email
                    </label>
                    <input
                        id="contact-email"
                        name="email"
                        type="email"
                        maxLength={MAX_CONTACT_EMAIL}
                        defaultValue={email}
                        autoComplete="email"
                        placeholder="you@example.com"
                        className={`${inputCls} mt-2.5`}
                    />
                </div>
                <div>
                    <label htmlFor="contact-phone" className={label}>
                        Mobile
                    </label>
                    <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        defaultValue={phone}
                        autoComplete="tel"
                        placeholder="0300 1234567"
                        className={`${inputCls} mt-2.5`}
                    />
                </div>
            </div>

            <p className="mt-2 text-[0.75rem] text-muted">
                Leave one of the two — that is where the reply goes.
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                    <label htmlFor="contact-topic" className={label}>
                        What is it about?
                    </label>
                    <select id="contact-topic" name="topic" defaultValue={topic} className={`${inputCls} mt-2.5`}>
                        {TOPICS.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="contact-order" className={label}>
                        Order ID <span className="text-muted/70">(if it is about one)</span>
                    </label>
                    <input
                        id="contact-order"
                        name="order_ref"
                        maxLength={MAX_ORDER_REF}
                        defaultValue={orderRef}
                        placeholder="OG-XXXXXX"
                        className={`${inputCls} mt-2.5`}
                    />
                </div>
            </div>

            <div className="mt-5">
                <label htmlFor="contact-body" className={label}>
                    Your message
                </label>
                <textarea
                    id="contact-body"
                    name="body"
                    rows={5}
                    required
                    minLength={MIN_MESSAGE_BODY}
                    maxLength={MAX_MESSAGE_BODY}
                    placeholder="Tell us what happened, and what you would like us to do."
                    className={`${inputCls} mt-2.5 resize-y`}
                />
            </div>

            {/* Not for people — off-screen and out of the tab order. A bot fills it
                in and the action drops the message without saying why. */}
            <div aria-hidden className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
                <label htmlFor="contact-company">Company</label>
                <input id="contact-company" name="company" tabIndex={-1} autoComplete="off" />
            </div>

            {state && !state.ok && (
                <p role="alert" className="mt-4 text-[0.8rem] text-[#b4372b]">
                    {state.message}
                </p>
            )}

            <button type="submit" disabled={pending} className="btn btn-solid mt-5 hover:opacity-85 disabled:opacity-60">
                {pending ? "Sending…" : "Send message"}
            </button>
            <p className="mt-3 text-[0.75rem] text-muted">
                We use what you write here only to answer you. Your address stays with the shop and the
                rider delivering your parcel.
            </p>
        </form>
    );
}
