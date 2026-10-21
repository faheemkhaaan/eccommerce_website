"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/components/cart/CartProvider";
import { useAuthStore } from "@/stores/auth-store";
import { money, summarize } from "@/lib/cart-math";
import { etaFrom, fmtDay, makeOrderId, saveOrder, type Order } from "@/lib/orders";
import Field, { inputCls } from "@/components/auth/Field";
import { ArrowIcon, BoxIcon, CashIcon, CheckIcon, LockIcon, TruckIcon } from "@/components/Icons";

const CITIES = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Dubai"];
const ease = [0.22, 1, 0.36, 1] as const;

type Values = { name: string; phone: string; city: string; address: string; notes: string };
type Key = keyof Values;

const digits = (s: string) => s.replace(/\D/g, "");
// Register stores E.164 (+923001234567); the field shows the local format (0300 1234567).
const localPhone = (raw: unknown) => {
    const d = digits(String(raw ?? ""));
    return d.startsWith("92") ? `0${d.slice(2)}` : d;
};
const displayPhone = (d: string) => (d.length > 4 ? `${d.slice(0, 4)} ${d.slice(4)}` : d);
const e164 = (d: string) => `+92${digits(d).replace(/^0/, "")}`;

const labelCls = "label-sm mb-2.5 block text-[10px] tracking-[0.14em]";
const str = (x: unknown) => (typeof x === "string" ? x : "");

// Prefill from the account the client registered with, so checkout is one tap.
function fromAccount(meta: Record<string, unknown> | undefined): Values {
    return {
        name: str(meta?.full_name),
        phone: localPhone(meta?.phone),
        city: str(meta?.city),
        address: str(meta?.address),
        notes: "",
    };
}

function validate(v: Values): Partial<Record<Key, string>> {
    const e: Partial<Record<Key, string>> = {};
    const phone = digits(v.phone);
    if (v.name.trim().length < 2) e.name = "Enter the name of the person receiving the parcel.";
    if (phone.length < 10 || phone.length > 12) e.phone = "Enter a valid mobile number — our rider will call it.";
    if (v.city.trim().length < 2) e.city = "Enter your delivery city.";
    if (v.address.trim().length < 10) e.address = "Add your house number, street and a landmark.";
    return e;
}

export default function CheckoutClient() {
    const uid = useId();
    const { items, subtotal, clear, hydrated } = useCart();
    const user = useAuthStore((s) => s.user);

    const [edits, setEdits] = useState<Partial<Values>>({});
    const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
    const [submitted, setSubmitted] = useState(false);
    const [placing, setPlacing] = useState(false);
    const [placed, setPlaced] = useState<Order | null>(null);

    // What the client typed always wins; the rest stays prefilled from their account.
    const defaults = useMemo(() => fromAccount(user?.user_metadata), [user]);
    const v: Values = {
        name: edits.name ?? defaults.name,
        phone: edits.phone ?? defaults.phone,
        city: edits.city ?? defaults.city,
        address: edits.address ?? defaults.address,
        notes: edits.notes ?? defaults.notes,
    };

    const { shipping, tax, total } = summarize(subtotal);
    const errors = validate(v);
    const shown = (k: Key) => (touched[k] || submitted ? errors[k] : undefined);

    const set = <K extends Key>(k: K, val: Values[K]) => setEdits((p) => ({ ...p, [k]: val }));
    const f = (k: Key) => ({
        id: `${uid}-${k}`,
        "aria-invalid": shown(k) ? (true as const) : undefined,
        "aria-describedby": shown(k) ? `${uid}-${k}-error` : undefined,
        onBlur: () => setTouched((t) => ({ ...t, [k]: true })),
    });

    const place = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        setSubmitted(true);
        if (Object.keys(errors).length) {
            setTimeout(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 50);
            return;
        }

        setPlacing(true);
        const placedAt = new Date().toISOString();
        const order: Order = {
            id: makeOrderId(),
            placedAt,
            eta: etaFrom(placedAt),
            recipient: {
                name: v.name.trim(),
                phone: e164(v.phone),
                city: v.city.trim(),
                address: v.address.trim(),
                notes: v.notes.trim(),
            },
            items: items.map((i) => ({ name: i.name, options: i.options, qty: i.qty, price: i.price, image: i.image })),
            totals: { subtotal, shipping, tax, total },
        };
        saveOrder(order);
        setPlaced(order);
        clear();
        setPlacing(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Order placed — receipt + tracking hand-off
    if (placed) {
        const rows = [
            { k: "Order ID", v: placed.id },
            { k: "Cash to pay on delivery", v: money(placed.totals.total) },
            { k: "Estimated arrival", v: fmtDay(placed.eta) },
        ];
        return (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="mx-auto max-w-2xl">
                <div className="rounded-[2.5rem] bg-white p-8 text-center shadow-[0_30px_70px_-40px_rgba(60,40,20,0.35)] sm:p-12">
                    <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#fbe4dc] text-accent">
                        <CheckIcon size={26} />
                    </span>
                    <h1 className="mt-6 font-serif text-[clamp(2rem,4vw,2.8rem)] leading-tight tracking-tight">Order confirmed</h1>
                    <p className="mx-auto mt-4 max-w-md text-[0.9rem] leading-relaxed text-muted">
                        Your pieces are reserved. Keep {money(placed.totals.total)} ready in cash — nothing is charged before
                        the parcel reaches you.
                    </p>

                    <dl className="mt-8 divide-y divide-line rounded-3xl bg-sand px-6 text-left text-sm">
                        {rows.map((r) => (
                            <div key={r.k} className="flex items-center justify-between gap-4 py-3.5">
                                <dt className="text-muted">{r.k}</dt>
                                <dd className="font-medium">{r.v}</dd>
                            </div>
                        ))}
                    </dl>

                    <ul className="mt-6 space-y-3 text-left">
                        {placed.items.map((i) => (
                            <li key={i.name + i.options.join()} className="flex items-center gap-4">
                                <div className="relative aspect-3/4 w-14 shrink-0 overflow-hidden bg-[#d8d0c2]">
                                    <Image src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />
                                </div>
                                <div className="min-w-0 flex-1 text-sm">
                                    <p className="truncate">{i.name}</p>
                                    <p className="label-sm mt-1 text-[10px] text-muted">{i.options.join("  •  ")}</p>
                                </div>
                                <span className="font-serif">×{i.qty}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                        <Link href={`/track-order?id=${placed.id}`} className="label-sm inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 text-[11px] text-white">
                            Track this order <ArrowIcon size={14} />
                        </Link>
                        <Link href="/collections" className="label-sm inline-flex h-12 items-center rounded-full bg-sand px-7 text-[11px] transition hover:bg-line">
                            Continue shopping
                        </Link>
                    </div>

                    <p className="mt-6 text-xs text-muted">
                        We will call {placed.recipient.phone} before dispatch. Save your Order ID to track it any time.
                    </p>
                </div>
            </motion.div>
        );
    }

    if (!hydrated) {
        return <div className="h-100 animate-pulse rounded-[2.5rem] bg-muted/10" />;
    }

    if (!items.length) {
        return (
            <div className="rounded-[2.5rem] bg-white p-10 text-center shadow-[0_30px_70px_-40px_rgba(60,40,20,0.35)]">
                <p className="font-serif text-3xl">Your bag is empty</p>
                <p className="mt-3 text-sm text-muted">Add a piece to your bag and your checkout will appear here.</p>
                <Link href="/collections" className="label-sm mt-7 inline-flex h-12 items-center rounded-full bg-ink px-8 text-[11px] text-white">
                    Browse the collection
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={place} noValidate className="grid items-start gap-6 lg:grid-cols-[7fr_5fr] lg:gap-8">
            {/* Delivery */}
            <div className="space-y-4">
                <div className="rounded-[2rem] bg-white p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-4">
                        <p className="eyebrow text-accent">Delivery details</p>
                        <span className="label-sm text-[10px] text-muted">Step 1 of 2</span>
                    </div>
                    <h2 className="mt-4 font-serif text-2xl leading-tight">Where should the rider bring it?</h2>
                    <p className="mt-2 text-[0.85rem] text-muted">
                        Everything is dispatched from the atelier in Lahore and handed over in person.
                    </p>

                    <div className="mt-7 space-y-5">
                        <Field id={`${uid}-name`} label="Recipient full name" required error={shown("name")}>
                            <input {...f("name")} autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ayla Shireen Malik" className={inputCls} />
                        </Field>

                        <Field
                            id={`${uid}-phone`}
                            label="Mobile number"
                            required
                            hint={<span className="text-accent">Rider calls before arrival</span>}
                            error={shown("phone")}
                        >
                            <input
                                {...f("phone")}
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel-national"
                                value={displayPhone(v.phone)}
                                onChange={(e) => set("phone", digits(e.target.value).replace(/^0+/, "").slice(0, 11))}
                                placeholder="0300 1234567"
                                className={inputCls}
                            />
                        </Field>

                        <Field id={`${uid}-city`} label="Delivery city" required error={shown("city")}>
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

                        <Field id={`${uid}-address`} label="House, street & landmark" required error={shown("address")}>
                            <textarea
                                {...f("address")}
                                rows={3}
                                autoComplete="street-address"
                                value={v.address}
                                onChange={(e) => set("address", e.target.value)}
                                placeholder="House / Apartment number, Street address, Nearby landmark"
                                className={`${inputCls} resize-none`}
                            />
                        </Field>

                        <div>
                            <label htmlFor={`${uid}-notes`} className={labelCls}>Delivery notes <span className="text-muted">(optional)</span></label>
                            <input
                                id={`${uid}-notes`}
                                value={v.notes}
                                onChange={(e) => set("notes", e.target.value)}
                                placeholder="Gate code, best time to call, gift message…"
                                className={inputCls}
                            />
                        </div>
                    </div>
                </div>

                {/* Payment — COD only */}
                <div className="rounded-[2rem] bg-white p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-4">
                        <p className="eyebrow text-accent">Payment</p>
                        <span className="label-sm text-[10px] text-muted">Step 2 of 2</span>
                    </div>

                    <div className="mt-5 flex items-start gap-4 rounded-2xl bg-sand p-5 ring-1 ring-ink">
                        <span className="mt-0.5 text-accent"><CashIcon size={22} /></span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm">Cash on Delivery</p>
                                <span className="grid size-5 place-items-center rounded-full bg-ink text-white"><CheckIcon size={11} /></span>
                            </div>
                            <p className="mt-1.5 text-xs leading-relaxed text-muted">
                                Inspect the parcel at your door, then pay the rider {money(total)}. No card, no prepayment.
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 flex items-center gap-2 text-[11px] text-muted">
                        <LockIcon size={12} /> Your number is used only for delivery updates.
                    </p>
                </div>
            </div>

            {/* Summary */}
            <aside className="rounded-[2rem] bg-white p-6 sm:p-8 lg:sticky lg:top-8">
                <p className="eyebrow text-accent">Your order</p>
                <ul className="mt-5 space-y-5">
                    {items.map((i) => (
                        <li key={i.key} className="flex gap-4">
                            <div className="relative aspect-3/4 w-16 shrink-0 overflow-hidden bg-[#d8d0c2]">
                                <Image src={i.image} alt={i.name} fill sizes="64px" className="object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm">{i.name}</p>
                                <p className="label-sm mt-1 text-[10px] text-muted">{i.options.join("  •  ")}</p>
                                <p className="mt-1 text-xs text-muted">Qty {i.qty}</p>
                            </div>
                            <span className="font-serif">{money(i.price * i.qty)}</span>
                        </li>
                    ))}
                </ul>

                <dl className="mt-6 space-y-2 border-t border-line pt-5 text-[0.8rem]">
                    <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(subtotal)}</dd></div>
                    <div className="flex justify-between">
                        <dt className="inline-flex items-center gap-1.5 text-muted">
                            Shipping
                            {shipping === 0 && <span className="grid size-4 place-items-center rounded-full border border-accent text-accent"><CheckIcon size={9} /></span>}
                        </dt>
                        <dd className={shipping === 0 ? "label-sm text-[11px]" : ""}>{shipping === 0 ? "Free" : money(shipping)}</dd>
                    </div>
                    <div className="flex justify-between"><dt className="text-muted">Taxes (8%)</dt><dd>{money(tax)}</dd></div>
                </dl>

                <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
                    <span className="font-serif text-xl">Due on delivery</span>
                    <motion.span key={total} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="font-serif text-2xl">
                        {money(total)}
                    </motion.span>
                </div>

                <AnimatePresence initial={false}>
                    {submitted && Object.keys(errors).length > 0 && (
                        <motion.p role="alert" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-4 text-xs text-[#b4372b]">
                            Please complete the delivery details above.
                        </motion.p>
                    )}
                </AnimatePresence>

                <motion.button
                    type="submit"
                    disabled={placing}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="label-sm mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-[11px] tracking-[0.14em] text-white disabled:opacity-80"
                >
                    {placing ? "Placing order…" : (<>Place order · {money(total)} <ArrowIcon size={14} /></>)}
                </motion.button>

                <ul className="label-sm mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[9px] text-muted">
                    <li className="inline-flex items-center gap-1.5"><span className="text-accent"><TruckIcon size={11} /></span>Rider-tracked</li>
                    <li className="inline-flex items-center gap-1.5"><span className="text-accent"><BoxIcon size={11} /></span>Gift wrapped</li>
                    <li className="inline-flex items-center gap-1.5"><span className="text-accent"><CashIcon size={11} /></span>No prepayment</li>
                </ul>

                {user?.email && (
                    <p className="mt-5 text-center text-[11px] text-muted">
                        Ordering as <span className="text-ink">{user.email}</span>
                    </p>
                )}
            </aside>
        </form>
    );
}
