"use client";

import { useEffect, useId, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowIcon, ChatIcon, CheckIcon, EyeIcon, EyeOffIcon, KeyIcon, LockIcon, TruckIcon } from "../Icons";
import { requestOtp, signInWithPassword, verifyOtp } from "@/lib/auth-client";

type Method = "otp" | "email";

const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ease = [0.22, 1, 0.36, 1] as const;

const formatPhone = (d: string) => (d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d);
const fieldCls =
    "w-full rounded-full bg-sand px-6 py-4 text-sm outline-none transition placeholder:text-muted/60 focus:bg-white focus:ring-1 focus:ring-ink";
const labelCls = "label-sm mb-3 block text-[10px] tracking-[0.14em]";

type InputsRef = { current: (HTMLInputElement | null)[] };

function OtpInput({ value, onChange, inputsRef }: { value: string[]; onChange: (v: string[]) => void; inputsRef: InputsRef }) {
    const onInput = (i: number, raw: string) => {
        const digit = raw.replace(/\D/g, "").slice(-1);
        const next = [...value];
        next[i] = digit;
        onChange(next);
        if (digit && i < 3) inputsRef.current[i + 1]?.focus();
    };
    const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !value[i] && i > 0) inputsRef.current[i - 1]?.focus();
        if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
        if (e.key === "ArrowRight" && i < 3) inputsRef.current[i + 1]?.focus();
    };
    const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
        const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
        if (!digits) return;
        e.preventDefault();
        onChange(Array.from({ length: 4 }, (_, i) => digits[i] ?? ""));
        inputsRef.current[Math.min(digits.length, 3)]?.focus();
    };

    return (
        <div className="flex gap-3" role="group" aria-label="4-digit verification code">
            {value.map((d, i) => (
                <input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    value={d}
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    aria-label={`Digit ${i + 1}`}
                    onChange={(e) => onInput(i, e.target.value)}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    onPaste={onPaste}
                    className="size-14 rounded-2xl bg-sand text-center font-serif text-2xl outline-none transition focus:bg-white focus:ring-1 focus:ring-ink"
                />
            ))}
        </div>
    );
}

export default function LoginCard() {
    const router = useRouter();
    const uid = useId();

    const [method, setMethod] = useState<Method>("otp");
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // OTP
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [otpSent, setOtpSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Email
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    useEffect(() => {
        if (otpSent) {
            const t = setTimeout(() => otpRefs.current[0]?.focus(), 350);
            return () => clearTimeout(t);
        }
    }, [otpSent]);

    const switchMethod = (m: Method) => {
        setMethod(m);
        setError(null);
    };

    const sendOtp = async () => {
        setError(null);
        if (!PHONE_RE.test(phone)) {
            setError("Enter a valid 10-digit mobile number.");
            return;
        }
        setSending(true);
        try {
            await requestOtp(`+91${phone}`);
            setOtp(["", "", "", ""]);
            setOtpSent(true);
            setCooldown(30);
        } catch {
            setError("We couldn’t send the code. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const run = async (fn: () => Promise<void>) => {
        setSubmitting(true);
        try {
            await fn();
            setSuccess(true);
            setTimeout(() => router.push("/"), 700); // TODO: redirect to your account page
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (method === "otp") {
            if (!otpSent) {
                await sendOtp(); // Enter in the phone field sends the code
                return;
            }
            const code = otp.join("");
            if (code.length < 4) {
                setError("Enter the 4-digit code we sent to your WhatsApp.");
                return;
            }
            await run(() => verifyOtp(`+91${phone}`, code, remember));
        } else {
            if (!EMAIL_RE.test(email)) { setError("Enter a valid email address."); return; }
            if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
            await run(() => signInWithPassword(email, password, remember));
        }
    };

    const tabs: { id: Method; label: string; icon: React.ReactNode }[] = [
        { id: "otp", label: "WhatsApp / Mobile OTP", icon: <ChatIcon size={14} /> },
        { id: "email", label: "Email & Password", icon: <KeyIcon size={14} /> },
    ];

    return (
        <div className="rounded-4xl bg-white p-6 shadow-[0_30px_70px_-40px_rgba(60,40,20,0.35)] sm:p-10 md:rounded-[2.5rem]">
            <div className="flex items-center justify-between gap-4">
                <p className="eyebrow text-accent">Member Privileges</p>
                <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 text-[11px] text-muted">
                    <span className="text-accent"><LockIcon size={12} /></span> 256-Bit Encrypted
                </span>
            </div>

            <h1 className="mt-6 font-serif text-[clamp(2.6rem,5vw,3.75rem)] leading-none tracking-tight">Welcome Back</h1>
            <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-muted">
                Sign in to track your Eid orders, manage delivery addresses, and view your WhatsApp purchase history.
            </p>

            {/* Tabs */}
            <div role="tablist" aria-label="Sign-in method" className="mt-8 grid grid-cols-2 rounded-full bg-sand p-1.5">
                {tabs.map((t) => {
                    const active = method === t.id;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            role="tab"
                            id={`${uid}-tab-${t.id}`}
                            aria-selected={active}
                            aria-controls={`${uid}-panel`}
                            onClick={() => switchMethod(t.id)}
                            className="label-sm relative flex h-12 items-center justify-center gap-2 rounded-full px-3 text-[10px] tracking-[0.12em]"
                        >
                            {active && (
                                <motion.span layoutId="login-tab" transition={{ duration: 0.3, ease }} className="absolute inset-0 rounded-full bg-ink" />
                            )}
                            <span className={`relative z-10 inline-flex items-center gap-2 transition-colors ${active ? "text-white" : "text-ink"}`}>
                                {t.icon}
                                <span className="hidden sm:inline">{t.label}</span>
                                <span className="sm:hidden">{t.id === "otp" ? "WhatsApp OTP" : "Email"}</span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-8">
                <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${method}`}>
                    <AnimatePresence mode="wait" initial={false}>
                        {method === "otp" ? (
                            <motion.div key="otp" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                                <label htmlFor={`${uid}-phone`} className={labelCls}>Mobile number for WhatsApp verification</label>
                                <div className="flex items-center gap-3 rounded-full bg-sand py-1.5 pl-6 pr-1.5 transition focus-within:bg-white focus-within:ring-1 focus-within:ring-ink">
                                    <span className="text-sm">+91</span>
                                    <span aria-hidden className="h-4 w-px bg-ink/20" />
                                    <input
                                        id={`${uid}-phone`}
                                        type="tel"
                                        inputMode="numeric"
                                        autoComplete="tel-national"
                                        placeholder="98765 43210"
                                        value={formatPhone(phone)}
                                        onChange={(e) => {
                                            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                                            if (otpSent) { setOtpSent(false); setOtp(["", "", "", ""]); setCooldown(0); }
                                        }}
                                        className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted/60"
                                    />
                                    <button
                                        type="button"
                                        onClick={sendOtp}
                                        disabled={sending || cooldown > 0}
                                        className="label-sm shrink-0 rounded-full bg-line px-4 py-3 text-[10px] transition hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-60 sm:px-5"
                                    >
                                        {sending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : otpSent ? "Resend OTP" : "Send OTP"}
                                    </button>
                                </div>

                                <p className="mt-3 flex items-center gap-2 text-xs text-muted">
                                    <span className="grid size-4 shrink-0 place-items-center rounded-full border border-accent text-accent"><CheckIcon size={9} /></span>
                                    Instant 4-digit code dispatched via WhatsApp Business API
                                </p>

                                <AnimatePresence initial={false}>
                                    {otpSent && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease }}
                                            className="overflow-hidden"
                                        >
                                            <p className={`${labelCls} mt-7`}>Enter the 4-digit code</p>
                                            <OtpInput value={otp} onChange={setOtp} inputsRef={otpRefs} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <motion.div key="email" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-5">
                                <div>
                                    <label htmlFor={`${uid}-email`} className={labelCls}>Email address</label>
                                    <input id={`${uid}-email`} type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldCls} />
                                </div>
                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <label htmlFor={`${uid}-pw`} className="label-sm text-[10px] tracking-[0.14em]">Password</label>
                                        <Link href="/forgot-password" className="text-xs text-muted underline underline-offset-4 hover:text-ink">Forgot password?</Link>
                                    </div>
                                    <div className="relative">
                                        <input id={`${uid}-pw`} type={showPw ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={`${fieldCls} pr-14`} />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw((s) => !s)}
                                            aria-label={showPw ? "Hide password" : "Show password"}
                                            aria-pressed={showPw}
                                            className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:text-ink"
                                        >
                                            {showPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <label className="mt-7 flex cursor-pointer items-start gap-3 text-[0.85rem] leading-relaxed">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="mt-1 size-4 shrink-0 accent-ink" />
                    <span>Remember my delivery address &amp; preferences for 1-click Cash on Delivery (COD) orders</span>
                </label>

                <AnimatePresence initial={false}>
                    {error && (
                        <motion.p
                            role="alert"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pt-4 text-xs text-[#b4372b]"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>

                <motion.button
                    type="submit"
                    disabled={submitting || success}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="label-sm mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-[11px] tracking-[0.14em] text-white disabled:opacity-80"
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
                            {success ? (<>Welcome back <CheckIcon size={14} /></>) : submitting ? "Signing in…" : (<>Sign in to my account <ArrowIcon size={14} /></>)}
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
                New to ÉPURE Studio?{" "}
                <Link href="/register" className="text-ink underline underline-offset-4">Create an Account</Link>
            </p>
        </div>
    );
}