"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { inputCls } from "./Field";
import { ArrowIcon, CashIcon, CheckIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, TruckIcon } from "../Icons";
import { AuthError, resendVerification, signInWithPassword } from "@/lib/auth-client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const labelCls = "label-sm mb-2.5 block text-[10px] tracking-[0.14em]";

export default function LoginCard({ next = "/" }: { next?: string }) {
    const router = useRouter();
    const uid = useId();
    // Arriving from the bag: checkout needs an account, so the page explains why.
    const fromCheckout = next.startsWith("/checkout");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [unverified, setUnverified] = useState(false);
    const [resent, setResent] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setUnverified(false);
        setResent(false);

        if (!EMAIL_RE.test(email.trim())) {
            setError("Enter a valid email address.");
            return;
        }
        if (!password) {
            setError("Enter your password.");
            return;
        }

        setSubmitting(true);
        try {
            await signInWithPassword(email.trim(), password);
            setSuccess(true);
            setTimeout(() => { router.push(next); router.refresh(); }, 500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
            setUnverified(err instanceof AuthError && err.code === "email_not_confirmed");
        } finally {
            setSubmitting(false);
        }
    };

    const resend = async () => {
        setError(null);
        setResent(false);
        try {
            await resendVerification(email.trim());
            setResent(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "We couldn’t resend the email. Please try again.");
        }
    };

    return (
        <div className="rounded-4xl bg-white p-6 shadow-[0_30px_70px_-40px_rgba(60,40,20,0.35)] sm:p-10 md:rounded-[2.5rem]">
            <div className="flex items-center justify-between gap-4">
                <p className="eyebrow text-accent">{fromCheckout ? "One step from checkout" : "Member Privileges"}</p>
                <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 text-[11px] text-muted">
                    <span className="text-accent"><LockIcon size={12} /></span> 256-Bit Encrypted
                </span>
            </div>

            <h1 className="mt-6 font-serif text-[clamp(2.6rem,5vw,3.75rem)] leading-none tracking-tight">
                {fromCheckout ? "Sign in to order" : "Welcome Back"}
            </h1>
            <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-muted">
                {fromCheckout
                    ? "Browsing is open to everyone — buying needs an account so we can deliver and track your parcel."
                    : "Sign in with the email and password you registered with."}
            </p>

            {fromCheckout && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl bg-sand px-4 py-3.5">
                    <span className="mt-0.5 text-accent"><CashIcon size={16} /></span>
                    <p className="text-xs leading-relaxed text-muted">
                        Your bag is saved. Confirm your delivery address in the next step — you pay cash when the parcel arrives.
                    </p>
                </div>
            )}

            <form onSubmit={submit} noValidate className="mt-8 space-y-5">
                <div>
                    <label htmlFor={`${uid}-email`} className={labelCls}>Email address</label>
                    <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"><MailIcon size={16} /></span>
                        <input
                            id={`${uid}-email`}
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ayla@example.com"
                            className={`${inputCls} pl-11`}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor={`${uid}-password`} className={labelCls}>Password</label>
                    <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"><LockIcon size={16} /></span>
                        <input
                            id={`${uid}-password`}
                            type={showPw ? "text" : "password"}
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`${inputCls} pl-11 pr-12`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((s) => !s)}
                            aria-label={showPw ? "Hide password" : "Show password"}
                            aria-pressed={showPw}
                            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center text-muted transition hover:text-ink"
                        >
                            {showPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                        </button>
                    </div>
                </div>

                <AnimatePresence initial={false}>
                    {error && (
                        <motion.p
                            role="alert"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden text-xs text-[#b4372b]"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>

                {unverified && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sand px-4 py-3">
                        <p className="text-xs text-muted">Didn’t get the email?</p>
                        <button
                            type="button"
                            onClick={resend}
                            disabled={resent}
                            className="label-sm rounded-full bg-line px-4 py-2.5 text-[10px] transition hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-60"
                        >
                            {resent ? "Verification email sent" : "Resend verification email"}
                        </button>
                    </div>
                )}

                <motion.button
                    type="submit"
                    disabled={submitting || success}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="label-sm flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-[11px] tracking-[0.14em] text-white disabled:opacity-80"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                            key={success ? "ok" : submitting ? "busy" : "idle"}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18 }}
                            className="inline-flex items-center gap-2"
                        >
                            {success ? (<>Welcome back <CheckIcon size={14} /></>) : submitting ? "Signing in…" : (<>Sign in <ArrowIcon size={14} /></>)}
                        </motion.span>
                    </AnimatePresence>
                </motion.button>
            </form>

            {/* Guest order */}
            <div className="mt-8 flex flex-wrap items-center gap-4 rounded-3xl bg-sand/70 px-5 py-4">
                <span className="text-accent"><TruckIcon size={22} /></span>
                <div className="min-w-0 flex-1">
                    <p className="text-sm">Looking for a guest COD order?</p>
                    <p className="text-xs text-muted">Track via Order ID &amp; Phone Number directly</p>
                </div>
                <Link href="/track-order" className="label-sm rounded-full bg-line px-5 py-3 text-[10px] transition hover:bg-ink hover:text-white">
                    Track guest order
                </Link>
            </div>

            <p className="mt-10 text-center text-[0.95rem] text-muted">
                {fromCheckout ? "No account yet? " : "New to Organic Ghee? "}
                <Link href={fromCheckout ? "/register?next=%2Fcheckout" : "/register"} className="text-ink underline underline-offset-4">
                    Create an Account
                </Link>
            </p>
        </div>
    );
}
