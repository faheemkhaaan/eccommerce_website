"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { confirmPhoneVerification, startPhoneVerification } from "@/lib/auth-client";
import { localPhone } from "@/lib/phone";
import { inputCls } from "./Field";
import { CheckIcon, ShieldIcon } from "../Icons";

// The checkout only ships to Pakistan, so that is the shape we demand before texting.
const PK_MOBILE = /^\+92\d{10}$/;

type Phase = "idle" | "sent" | "done";

type PhoneVerifyProps = {
    /** The E.164 number the customer wants to confirm, e.g. `+923001234567`. */
    phone: string;
    /** The number already confirmed on the account. When it equals `phone` we open in the "done" state. */
    verifiedPhone?: string;
    /**
     * Called after a successful confirm. The parent owns the refresh decision: the checkout
     * just flips a local flag (a refresh there would remount it and wipe the order form).
     */
    onVerified?: () => void;
    /** Optional DOM id, used by the checkout to scroll the block into view. */
    id?: string;
    /** Extra classes for the outer element. */
    className?: string;
};

/**
 * Confirms the account's mobile number with a one-time SMS code.
 * Supabase generates, stores, expires and verifies the code — this component only drives the UI,
 * so there is no OTP storage or brute-force handling of our own to get wrong.
 */
export default function PhoneVerify({ phone, verifiedPhone, onVerified, id, className = "" }: PhoneVerifyProps) {
    const uid = useId();
    const codeRef = useRef<HTMLInputElement>(null);

    // Already confirmed for this exact number? Then there is nothing left to prove.
    const alreadyVerified = Boolean(verifiedPhone) && verifiedPhone === phone;

    const [phase, setPhase] = useState<Phase>(alreadyVerified ? "done" : "idle");
    const [code, setCode] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);

    // The number can change under us (the customer edits it in checkout). Reset the phase, code,
    // error and countdown during render so nothing from the old number leaks into the new one.
    const [seenPhone, setSeenPhone] = useState(phone);
    if (seenPhone !== phone) {
        setSeenPhone(phone);
        setPhase(alreadyVerified ? "done" : "idle");
        setCode("");
        setError(null);
        setCooldown(0);
    }

    const ready = PK_MOBILE.test(phone);

    // Supabase throttles resends per number; mirror that with a visible countdown.
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    useEffect(() => {
        if (phase === "sent") codeRef.current?.focus();
    }, [phase]);

    /** Texts a fresh one-time code to the number. */
    const send = async () => {
        setError(null);
        setCode(""); // a brand-new code replaces anything half-typed from the last one
        setBusy(true);
        try {
            await startPhoneVerification(phone);
            setPhase("sent");
            setCooldown(60);
        } catch (e) {
            setError(e instanceof Error ? e.message : "We couldn’t send the code.");
        } finally {
            setBusy(false);
        }
    };

    /**
     * Confirms the typed code. On success Supabase marks the account's phone verified, so we
     * flip to "done" and hand control to the parent — the parent decides how (or whether) to
     * refresh, because refreshing the checkout would remount it and lose the typed order details.
     */
    const confirm = async () => {
        setError(null);
        setBusy(true);
        try {
            await confirmPhoneVerification(phone, code);
            setPhase("done");
            onVerified?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "That code isn’t right.");
        } finally {
            setBusy(false);
        }
    };

    if (phase === "done") {
        return (
            <p id={id} className={`inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 text-[10px] text-accent ${className}`}>
                <span className="grid size-3.5 place-items-center rounded-full bg-ink text-white"><CheckIcon size={8} /></span>
                Mobile verified
            </p>
        );
    }

    return (
        <div id={id} className={`rounded-2xl bg-sand px-4 py-3.5 ${className}`}>
            <p className="flex items-start gap-2.5 text-[11px] leading-relaxed text-muted">
                <span className="mt-0.5 shrink-0 text-accent"><ShieldIcon size={14} /></span>
                <span>
                    {phase === "idle" ? (
                        <>Confirm <span className="text-ink">{localPhone(phone)}</span> so the rider can reach you. We’ll text a one-time code.</>
                    ) : (
                        <>Enter the code we sent to <span className="text-ink">{localPhone(phone)}</span>.</>
                    )}
                </span>
            </p>

            {phase === "sent" && (
                <div className="mt-3 flex gap-2">
                    <input
                        ref={codeRef}
                        id={`${uid}-code`}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        aria-label="Verification code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                        // The checkout renders this inside its own <form>, so Enter is handled here.
                        // A nested <form> is invalid HTML and an unhandled Enter would submit the
                        // checkout instead — which validates every field and looks like a page reload.
                        onKeyDown={(e) => {
                            if (e.key !== "Enter") return;
                            e.preventDefault();
                            e.stopPropagation();
                            void confirm();
                        }}
                        placeholder="123456"
                        className={`${inputCls} flex-1 tracking-[0.3em]`}
                    />
                    <button
                        type="button"
                        onClick={() => void confirm()}
                        disabled={busy || code.length < 4}
                        className="label-sm h-12 shrink-0 rounded-md bg-ink px-5 text-[10px] text-white transition disabled:opacity-50"
                    >
                        {busy ? "Checking…" : "Confirm"}
                    </button>
                </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                <button
                    type="button"
                    onClick={send}
                    disabled={busy || !ready || cooldown > 0}
                    className="label-sm text-[10px] underline underline-offset-4 transition disabled:opacity-50 disabled:no-underline"
                >
                    {busy && phase === "idle"
                        ? "Sending…"
                        : phase === "idle"
                            ? "Send code"
                            : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
                {!ready && <span className="text-[10px] text-muted">Enter your full number first</span>}
            </div>

            <AnimatePresence initial={false}>
                {error && (
                    <motion.p
                        role="alert"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pt-2 text-[11px] text-[#b4372b]"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
