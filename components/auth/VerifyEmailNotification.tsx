"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { MailIcon } from "../Icons";

export default function VerifyEmailNotice({ email, onEdit }: { email: string; onEdit: () => void }) {
    const [cooldown, setCooldown] = useState(60);
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const resend = async () => {
        setStatus("sending");
        const { error } = await createClient().auth.resend({ type: "signup", email });
        setStatus(error ? "error" : "sent");
        if (!error) setCooldown(60);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-4xl bg-white p-8 text-center shadow-[0_30px_70px_-40px_rgba(60,40,20,0.35)] sm:p-14 md:rounded-[2.5rem]"
        >
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#fbe4dc] text-accent">
                <MailIcon size={26} />
            </span>
            <h1 className="mt-6 font-serif text-[clamp(2rem,4vw,2.8rem)] leading-tight">Check your inbox</h1>
            <p className="mx-auto mt-4 max-w-md text-[0.9rem] leading-relaxed text-muted">
                We sent a verification link to <span className="text-ink">{email}</span>. Open it to activate your account.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={resend}
                    disabled={cooldown > 0 || status === "sending"}
                    className="label-sm h-12 rounded-full bg-ink px-8 text-[11px] text-white transition disabled:opacity-50"
                >
                    {status === "sending" ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
                </button>
                <button type="button" onClick={onEdit} className="label-sm h-12 rounded-full bg-sand px-6 text-[11px] transition hover:bg-line">
                    Use a different email
                </button>
            </div>

            <p role="status" className="mt-4 h-4 text-xs text-muted">
                {status === "sent" && "A new link is on its way."}
                {status === "error" && "Couldn’t resend just now. Please try again shortly."}
            </p>
            <p className="mt-6 text-[0.85rem] text-muted">
                Already verified? <Link href="/login" className="text-ink underline underline-offset-4">Sign in</Link>
            </p>
        </motion.div>
    );
}