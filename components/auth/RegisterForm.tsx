"use client";

import { useId, useMemo, useState, type FormEvent, type InputHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Field, { inputCls } from "./Field";
import { ArrowIcon, BoxIcon, CashIcon, CheckIcon, ChevronIcon, EyeIcon, EyeOffIcon } from "../Icons";
import { registerAccount } from "@/lib/auth-client";

const COUNTRIES = {
    PK: { code: "+92", label: "+92 (PK)", name: "Pakistan", placeholder: "300 1234567", re: /^3\d{9}$/ },
    IN: { code: "+91", label: "+91 (IN)", name: "India", placeholder: "987 6543210", re: /^[6-9]\d{9}$/ },
    AE: { code: "+971", label: "+971 (AE)", name: "the UAE", placeholder: "501 234567", re: /^5\d{8}$/ },
    GB: { code: "+44", label: "+44 (UK)", name: "the UK", placeholder: "740 0123456", re: /^7\d{9}$/ },
    US: { code: "+1", label: "+1 (US)", name: "the US", placeholder: "415 5550123", re: /^\d{10}$/ },
} as const;
type CountryKey = keyof typeof COUNTRIES;

const SIZES = ["XS", "S", "M", "L", "XL", "Unstitched"] as const;
const CITIES = ["Lahore", "Karachi", "Islamabad", "Dubai", "Delhi", "Mumbai"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ease = [0.22, 1, 0.36, 1] as const;

type Values = {
    name: string; country: CountryKey; phone: string; email: string;
    size: string; city: string; address: string;
    password: string; confirm: string; notify: boolean;
};
type Key = "name" | "phone" | "email" | "city" | "address" | "password" | "confirm";

const fmtPhone = (d: string) => (d.length > 3 ? `${d.slice(0, 3)} ${d.slice(3)}` : d);

function validate(v: Values): Partial<Record<Key, string>> {
    const e: Partial<Record<Key, string>> = {};
    const c = COUNTRIES[v.country];
    if (v.name.trim().length < 2) e.name = "Enter your full name.";
    if (!c.re.test(v.phone)) e.phone = `Enter a valid mobile number for ${c.name}.`;
    if (v.email && !EMAIL_RE.test(v.email)) e.email = "Enter a valid email address, or leave it blank.";
    if (v.city.trim().length < 2) e.city = "Enter your delivery city.";
    if (v.address.trim().length < 10) e.address = "Add your house number, street and a landmark.";
    if (v.password.length < 8 || !/[a-z]/i.test(v.password) || !/\d/.test(v.password))
        e.password = "Use 8+ characters with a letter and a number.";
    if (v.confirm !== v.password) e.confirm = "Passwords don’t match.";
    return e;
}

function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input {...props} type={show ? "text" : "password"} className={`${inputCls} pr-12`} />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                aria-pressed={show}
                className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center text-muted transition hover:text-ink"
            >
                {show ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
        </div>
    );
}

export default function RegisterForm() {
    const router = useRouter();
    const uid = useId();

    const [v, setV] = useState<Values>({
        name: "", country: "PK", phone: "", email: "", size: "M",
        city: "", address: "", password: "", confirm: "", notify: true,
    });
    const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const set = <K extends keyof Values>(k: K, val: Values[K]) => setV((p) => ({ ...p, [k]: val }));
    const errors = useMemo(() => validate(v), [v]);
    const shown = (k: Key) => (touched[k] || submitted ? errors[k] : undefined);

    // shared props for every validated control
    const f = (k: Key) => ({
        id: `${uid}-${k}`,
        "aria-invalid": shown(k) ? (true as const) : undefined,
        "aria-describedby": shown(k) ? `${uid}-${k}-error` : undefined,
        onBlur: () => setTouched((t) => ({ ...t, [k]: true })),
    });

    const country = COUNTRIES[v.country];

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        setSubmitted(true);
        setFormError(null);

        if (Object.keys(errors).length) {
            setTimeout(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 50);
            return;
        }

        setSubmitting(true);
        try {
            await registerAccount({
                name: v.name.trim(),
                phone: `${country.code}${v.phone}`,
                email: v.email.trim() || undefined,
                size: v.size,
                city: v.city.trim(),
                address: v.address.trim(),
                password: v.password,
                notifyWhatsApp: v.notify,
            });
            setSuccess(true);
            setTimeout(() => router.push("/"), 900); // TODO: send to your account or welcome page
        } catch {
            setFormError("We couldn’t create your account. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rounded-4xl bg-white p-6 shadow-[0_30px_70px_-40px_rgba(60,40,20,0.35)] sm:p-10 md:rounded-[2.5rem]">
            <span className="label-sm inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 text-[10px] tracking-[0.12em]">
                <i className="size-1.5 rounded-full bg-accent" /> Atelier Registry
            </span>
            <h1 className="mt-5 font-serif text-[clamp(2.1rem,4.4vw,3.2rem)] leading-[1.05] tracking-tight">
                Create Your Atelier Account
            </h1>
            <p className="mt-4 max-w-xl text-[0.9rem] leading-relaxed text-muted">
                Join ÉPURE Studio to unlock seamless Cash on Delivery ordering, save your measurements &amp;
                delivery addresses, and track festive drops before Eid.
            </p>

            <form onSubmit={submit} noValidate className="mt-9 space-y-6">
                <Field id={`${uid}-name`} label="Full name" required error={shown("name")}>
                    <input {...f("name")} value={v.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" placeholder="e.g. Ayla Shireen Malik" className={inputCls} />
                </Field>

                <Field
                    id={`${uid}-phone`}
                    label="WhatsApp mobile number"
                    required
                    hint={<span className="inline-flex items-center gap-1.5"><span className="grid size-3.5 place-items-center rounded-full border border-accent text-accent"><CheckIcon size={8} /></span>For order status &amp; rider call</span>}
                    error={shown("phone")}
                >
                    <div className="grid grid-cols-[8.5rem_1fr] gap-2">
                        <div className="relative">
                            <select
                                aria-label="Country code"
                                value={v.country}
                                onChange={(e) => setV((p) => ({ ...p, country: e.target.value as CountryKey, phone: "" }))}
                                className={`${inputCls} cursor-pointer appearance-none pr-9`}
                            >
                                {(Object.keys(COUNTRIES) as CountryKey[]).map((k) => (
                                    <option key={k} value={k}>{COUNTRIES[k].label}</option>
                                ))}
                            </select>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"><ChevronIcon size={12} /></span>
                        </div>
                        <input
                            {...f("phone")}
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            value={fmtPhone(v.phone)}
                            onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 10))}
                            placeholder={country.placeholder}
                            className={inputCls}
                        />
                    </div>
                </Field>

                <Field id={`${uid}-email`} label="Email address" hint={<span className="label-sm text-[10px] tracking-[0.14em]">Optional</span>} error={shown("email")}>
                    <input {...f("email")} type="email" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} placeholder="ayla@example.com" className={inputCls} />
                </Field>

                <Field id={`${uid}-size`} group label="Preferred silhouette / sizing" hint={<span className="text-accent">Ensures correct tailoring cuts</span>}>
                    <div role="radiogroup" aria-labelledby={`${uid}-size-label`} className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                        {SIZES.map((s) => {
                            const sel = v.size === s;
                            return (
                                <button
                                    key={s}
                                    type="button"
                                    role="radio"
                                    aria-checked={sel}
                                    onClick={() => set("size", s)}
                                    className="relative h-10 rounded-md bg-sand text-xs transition hover:bg-line"
                                >
                                    {sel && <motion.span layoutId="reg-size" transition={{ duration: 0.25, ease }} className="absolute inset-0 rounded-md bg-ink" />}
                                    <span className={`relative z-10 transition-colors ${sel ? "text-white" : ""}`}>{s}</span>
                                </button>
                            );
                        })}
                    </div>
                </Field>

                <div className="space-y-3">
                    <Field id={`${uid}-city`} label="Delivery city & shipping address" required error={shown("city")}>
                        <ul className="mb-3 flex flex-wrap gap-2">
                            {CITIES.map((c) => (
                                <li key={c}>
                                    <button
                                        type="button"
                                        onClick={() => { set("city", c); setTouched((t) => ({ ...t, city: true })); }}
                                        aria-pressed={v.city === c}
                                        className={`rounded-full px-3 py-1 text-[11px] transition ${v.city === c ? "bg-ink text-white" : "bg-sand hover:bg-line"}`}
                                    >
                                        {c}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <input {...f("city")} autoComplete="address-level2" value={v.city} onChange={(e) => set("city", e.target.value)} placeholder="City (e.g. Lahore, Gulberg)" className={inputCls} />
                    </Field>
                    <div>
                        <label htmlFor={`${uid}-address`} className="sr-only">House, street and landmark</label>
                        <textarea
                            {...f("address")}
                            rows={3}
                            autoComplete="street-address"
                            value={v.address}
                            onChange={(e) => set("address", e.target.value)}
                            placeholder="House / Apartment number, Street address, Landmark"
                            className={`${inputCls} resize-none`}
                        />
                        <AnimatePresence initial={false}>
                            {shown("address") && (
                                <motion.p id={`${uid}-address-error`} role="alert" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-1.5 text-xs text-[#b4372b]">
                                    {errors.address}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <Field id={`${uid}-password`} label="Password" required error={shown("password")}>
                        <PasswordInput {...f("password")} autoComplete="new-password" value={v.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" />
                    </Field>
                    <Field id={`${uid}-confirm`} label="Confirm password" required error={shown("confirm")}>
                        <PasswordInput {...f("confirm")} autoComplete="new-password" value={v.confirm} onChange={(e) => set("confirm", e.target.value)} placeholder="••••••••" />
                    </Field>
                </div>

                <label className="flex cursor-pointer items-start gap-3">
                    <input type="checkbox" checked={v.notify} onChange={(e) => set("notify", e.target.checked)} className="mt-1 size-4 shrink-0 accent-ink" />
                    <span>
                        <span className="block text-[0.85rem]">Notify me of new Eid Kurti drops and limited artisan releases via WhatsApp</span>
                        <span className="mt-0.5 block text-[11px] text-muted">Includes priority reservation windows and unstitched suit fabric previews.</span>
                    </span>
                </label>

                <div className="grid gap-3 rounded-3xl bg-sand px-5 py-3.5 text-[11px] tracking-wide text-accent sm:grid-cols-2 sm:divide-x sm:divide-line sm:rounded-full sm:px-6">
                    <p className="flex items-center gap-3"><CashIcon size={16} /> No Credit Card Needed — Always 100% Cash on Delivery</p>
                    <p className="flex items-center gap-3 sm:pl-5"><BoxIcon size={16} /> Free Delivery on Festive Collections</p>
                </div>

                <AnimatePresence initial={false}>
                    {formError && (
                        <motion.p role="alert" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden text-xs text-[#b4372b]">
                            {formError}
                        </motion.p>
                    )}
                </AnimatePresence>

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
                            {success ? (<>Account created <CheckIcon size={14} /></>) : submitting ? "Creating account…" : (<>Create account &amp; start shopping <ArrowIcon size={14} /></>)}
                        </motion.span>
                    </AnimatePresence>
                </motion.button>
            </form>

            <p className="mt-7 text-center text-[0.85rem] text-muted">
                Already have an account?{" "}
                <Link href="/login" className="text-ink underline underline-offset-4">Sign In</Link>
            </p>
        </div>
    );
}