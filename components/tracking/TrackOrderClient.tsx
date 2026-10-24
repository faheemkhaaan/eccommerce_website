"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
    DEMO_ORDER_ID, buildTracking, currentStep, findOrder, fmtDay, fmtTime,
    type Order, type TrackingStep,
} from "@/lib/orders";
import { money } from "@/lib/cart-math";
import { BoxIcon, CheckIcon, SearchIcon, TruckIcon } from "@/components/Icons";

const ease = [0.22, 1, 0.36, 1] as const;

const dot = (s: TrackingStep) =>
    s.state === "done"
        ? "bg-ink text-white"
        : s.state === "current"
            ? "bg-white text-accent ring-2 ring-accent"
            : "bg-sand text-muted";

// `initialId` comes from the deep link the checkout receipt links to: /track-order?id=EP-XXXXXX
export default function TrackOrderClient({ initialId = "" }: { initialId?: string }) {
    const [query, setQuery] = useState(initialId.trim());
    const [result, setResult] = useState<Order | null>(null);
    const [steps, setSteps] = useState<TrackingStep[]>([]);
    const [error, setError] = useState<string | null>(null);

    const lookup = useCallback((raw: string) => {
        const q = raw.trim();
        if (!q) {
            setResult(null);
            setSteps([]);
            setError("Enter your Order ID, or the mobile number you ordered with.");
            return;
        }
        const found = findOrder(q);
        if (!found) {
            setResult(null);
            setSteps([]);
            setError(`We couldn’t find an order for “${q}”. Check the ID and try again — or search by mobile number.`);
            return;
        }
        setResult(found);
        setSteps(buildTracking(found));
        setError(null);
    }, []);

    // Orders live in this browser's storage, so the deep link can only resolve after mount.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage is a mount-only sync with an external store
        if (initialId) lookup(initialId);
    }, [initialId, lookup]);

    const live = steps.length ? currentStep(steps) : null;

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[5fr_7fr] lg:gap-8">
            {/* Lookup */}
            <div className="rounded-[2rem] bg-white p-6 sm:p-8 lg:sticky lg:top-8">
                <p className="eyebrow text-accent">Order tracking</p>
                <h2 className="mt-4 font-serif text-2xl leading-tight">Where is my parcel?</h2>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">
                    Enter the Order ID from your confirmation, or the mobile number you used at checkout.
                </p>

                <form
                    onSubmit={(e) => { e.preventDefault(); lookup(query); }}
                    className="mt-6 space-y-3"
                >
                    <label htmlFor="track-q" className="label-sm block text-[10px] tracking-[0.14em]">Order ID or mobile number</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"><SearchIcon size={16} /></span>
                            <input
                                id="track-q"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="EP-XXXXXX or 0300 1234567"
                                className="w-full rounded-md bg-sand py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-muted/60 focus:bg-white focus:ring-1 focus:ring-ink"
                            />
                        </div>
                        <motion.button
                            type="submit"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="label-sm h-12 shrink-0 rounded-full bg-ink px-6 text-[11px] text-white"
                        >
                            Track
                        </motion.button>
                    </div>
                </form>

                <AnimatePresence initial={false}>
                    {error && (
                        <motion.p role="alert" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-4 text-xs text-[#b4372b]">
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>

                <div className="mt-6 rounded-3xl bg-sand p-5">
                    <p className="label-sm text-[10px]">No order handy?</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">
                        Open the sample parcel we keep on hand to preview the live tracking view.
                    </p>
                    <button
                        type="button"
                        onClick={() => { setQuery(DEMO_ORDER_ID); lookup(DEMO_ORDER_ID); }}
                        className="label-sm mt-4 h-11 rounded-full bg-white px-5 text-[10px] transition hover:bg-line"
                    >
                        View sample order {DEMO_ORDER_ID}
                    </button>
                </div>

                <p className="mt-5 text-[11px] leading-relaxed text-muted">
                    Prototype note: orders placed in this browser show up here instantly.
                </p>
            </div>

            {/* Result */}
            <div>
                {!result ? (
                    <div className="grid min-h-80 place-items-center rounded-[2rem] bg-white p-10 text-center">
                        <div>
                            <span className="mx-auto grid size-14 place-items-center rounded-full bg-sand text-muted"><BoxIcon size={22} /></span>
                            <p className="mt-5 font-serif text-2xl">Track a parcel</p>
                            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                                Your dispatch timeline — from our dairy in Lahore to your doorstep — will appear here.
                            </p>
                        </div>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="space-y-4">
                        {/* Summary */}
                        <div className="rounded-[2rem] bg-white p-6 sm:p-8">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="eyebrow text-accent">Order {result.id}</p>
                                    <h2 className="mt-2 font-serif text-[clamp(1.6rem,2.6vw,2.2rem)] leading-tight">{live?.title ?? "Order confirmed"}</h2>
                                    <p className="mt-2 text-[0.85rem] text-muted">
                                        Placed {fmtDay(result.placedAt)} · Estimated arrival {fmtDay(result.eta)}
                                    </p>
                                </div>
                                <span className="label-sm inline-flex items-center gap-2 rounded-full bg-sand px-4 py-2 text-[10px]">
                                    <span className="size-1.5 rounded-full bg-accent" /> Cash on Delivery
                                </span>
                            </div>

                            <div className="mt-6 flex items-center gap-4 rounded-3xl bg-ink p-5 text-white">
                                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/12 text-white"><TruckIcon size={20} /></span>
                                <div className="min-w-0">
                                    <p className="label-sm text-[10px] opacity-70">Current location</p>
                                    <p className="mt-0.5 truncate text-sm">{live?.place}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="label-sm text-[10px] opacity-70">Cash due</p>
                                    <p className="mt-0.5 font-serif text-lg">{money(result.totals.total)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="rounded-[2rem] bg-white p-6 sm:p-8">
                            <p className="eyebrow text-accent">Dispatch timeline</p>
                            <ol className="mt-6">
                                {steps.map((s, i) => (
                                    <li key={s.title} className="relative grid grid-cols-[2.25rem_1fr] gap-4 pb-8 last:pb-0">
                                        {i < steps.length - 1 && (
                                            <span className={`absolute left-[1.05rem] top-9 h-[calc(100%-2.5rem)] w-px ${s.state === "done" ? "bg-ink/25" : "bg-line"}`} />
                                        )}
                                        <span className={`relative grid size-9 place-items-center rounded-full text-[11px] transition ${dot(s)}`}>
                                            {s.state === "done" ? <CheckIcon size={13} /> : i + 1}
                                            {s.state === "current" && (
                                                <motion.span
                                                    className="absolute inset-0 rounded-full ring-2 ring-accent"
                                                    animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
                                                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                                                />
                                            )}
                                        </span>
                                        <div className={s.state === "next" ? "opacity-55" : ""}>
                                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                                <p className="text-sm">{s.title}</p>
                                                <p className="label-sm text-[10px] text-muted">
                                                    {s.at ? `${fmtDay(s.at)} · ${fmtTime(s.at)}` : "Pending"}
                                                </p>
                                            </div>
                                            <p className="mt-1 text-[0.8rem]">{s.place}</p>
                                            <p className="mt-1 text-xs leading-relaxed text-muted">{s.detail}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* Parcel + recipient */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-[2rem] bg-white p-6">
                                <p className="eyebrow text-accent">In this parcel</p>
                                <ul className="mt-5 space-y-4">
                                    {result.items.map((i) => (
                                        <li key={i.name + i.options.join()} className="flex gap-4">
                                            <div className="relative aspect-3/4 w-14 shrink-0 overflow-hidden bg-[#d8d0c2]">
                                                <Image src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm">{i.name}</p>
                                                <p className="label-sm mt-1 text-[10px] text-muted">{i.options.join("  •  ")}</p>
                                                <p className="mt-1 text-xs text-muted">Qty {i.qty}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-5 border-t border-line pt-4 text-xs text-muted">
                                    Pay {money(result.totals.total)} in cash to the rider on handover.
                                </p>
                            </div>

                            <div className="rounded-[2rem] bg-white p-6">
                                <p className="eyebrow text-accent">Delivering to</p>
                                <div className="mt-5 space-y-3 text-sm">
                                    <p>{result.recipient.name}</p>
                                    <p className="text-muted">{result.recipient.phone}</p>
                                    <p className="leading-relaxed text-muted">{result.recipient.address}</p>
                                    {result.recipient.notes && <p className="text-xs italic text-muted">“{result.recipient.notes}”</p>}
                                </div>
                                <p className="mt-5 border-t border-line pt-4 text-[11px] leading-relaxed text-muted">
                                    Need to change something? Call the concierge before the parcel leaves the fulfilment centre.
                                </p>
                                <Link href="/collections" className="label-sm mt-5 inline-flex h-11 items-center rounded-full bg-sand px-6 text-[10px] transition hover:bg-line">
                                    Continue shopping
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
