"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowIcon, CheckIcon, ChevronIcon, MinusIcon, PlusIcon, StarIcon } from "../Icons";
import { Detail } from "@/lib/product-details";
import type { Pack } from "@/lib/catalogue";
import { useCart } from "../cart/CartProvider";
import { money } from "@/lib/cart-math";

const perks = [
    { title: "Free delivery", sub: "Over Rs 5,000" },
    { title: "Cash on", sub: "Delivery" },
    { title: "7-day", sub: "Returns" },
];
const ease = [0.22, 1, 0.36, 1] as const;

export default function PurchasePanel({ product: p }: { product: Detail }) {
    const [packLabel, setPackLabel] = useState(p.defaultPack);
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);
    const [open, setOpen] = useState<number | null>(0);
    const [showBar, setShowBar] = useState(false);
    const addRef = useRef<HTMLButtonElement>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const { add, open: openBag } = useCart();

    // Mobile bar appears once the main button has scrolled out above the viewport
    useEffect(() => {
        const el = addRef.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) =>
            setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0),
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);
    useEffect(() => () => clearTimeout(timer.current), []);

    const pack = p.packs.find((k) => k.label === packLabel) ?? p.packs[0];
    const maxQty = Math.max(pack.stock, 1);
    const soldOut = pack.stock === 0;
    const total = money(pack.price * qty);

    // Clamp on change rather than in an effect, so the stepper can never strand
    // the quantity above a smaller pack's stock.
    const selectPack = (next: Pack) => {
        setPackLabel(next.label);
        setQty((q) => Math.min(q, Math.max(next.stock, 1)));
    };

    const addToBag = () => {
        add({
            id: p.id,
            name: p.name,
            image: p.gallery[0].thumb,
            options: [pack.label],
            price: pack.price,
            qty,
        });
        openBag();

        setAdded(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 2000);
    };
    return (
        <div>
            <p className="label-sm flex justify-between gap-4 text-[10px] tracking-[0.14em]">
                <span className="text-accent">{p.edition}</span>
                <span className="text-muted">Batch {p.article}</span>
            </p>
            <h1 className="mt-3 font-serif text-[clamp(1.9rem,3.4vw,2.6rem)] leading-tight tracking-tight">{p.name}</h1>

            <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="flex gap-0.5 [&_svg]:fill-current" aria-hidden><StarIcon size={12} /><StarIcon size={12} /><StarIcon size={12} /><StarIcon size={12} /><StarIcon size={12} /></span>
                <span className="text-muted">{p.rating} ({p.reviews} reviews)</span>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
                <span className="font-serif text-3xl">{money(pack.price)}</span>
                <span className="label-sm text-[10px] text-muted">for {pack.label} · no tax on COD orders</span>
            </div>
            <p className="mt-1 text-xs text-muted">
                Paid in cash when the rider hands over your parcel. Nothing is charged up front.
            </p>

            <div className="mt-6 border-t border-line pt-6">
                {/* Pack size — the only thing that changes the price */}
                <div className="mb-3 flex items-center justify-between">
                    <span className="label-sm text-[10px] text-muted">
                        Choose a pack: <b className="font-medium text-ink">{pack.label}</b>
                    </span>
                </div>
                <div role="radiogroup" aria-label="Pack size" className="grid grid-cols-2 gap-2">
                    {p.packs.map((k) => {
                        const sel = k.label === pack.label;
                        const out = k.stock === 0;
                        return (
                            <button
                                key={k.label}
                                type="button"
                                role="radio"
                                aria-checked={sel}
                                disabled={out}
                                onClick={() => selectPack(k)}
                                className="relative px-3 py-3 text-left transition hover:bg-line/60 bg-sand disabled:cursor-not-allowed disabled:opacity-45"
                            >
                                {sel && (
                                    <motion.span layoutId="pack-pill" transition={{ duration: 0.25, ease }} className="absolute inset-0 bg-ink" />
                                )}
                                <span className={`relative z-10 block text-[0.8rem] transition-colors ${sel ? "text-white" : ""}`}>{k.label}</span>
                                <span className={`relative z-10 mt-0.5 block text-[0.7rem] transition-colors ${sel ? "text-white/70" : "text-muted"}`}>
                                    {money(k.price)}
                                </span>
                                {out && (
                                    <span className={`label-sm relative z-10 mt-1 block text-[9px] tracking-widest ${sel ? "text-white/70" : "text-accent"}`}>
                                        Sold out
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <p className="mt-3 flex justify-between gap-4 text-[11px] text-muted">
                    <span>{p.packNote}</span>
                    {soldOut ? (
                        <span className="label-sm shrink-0 text-[10px]">Sold out</span>
                    ) : (
                        <span className="label-sm shrink-0 text-[10px] text-accent">{pack.stock} left</span>
                    )}
                </p>

                {/* Purchase row */}
                <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-12 items-center rounded-full bg-sand px-1">
                        <button type="button" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)} className="grid size-9 place-items-center disabled:opacity-30">
                            <MinusIcon size={12} />
                        </button>
                        <span aria-live="polite" className="w-6 text-center text-xs">{qty}</span>
                        <button type="button" aria-label="Increase quantity" disabled={qty >= maxQty} onClick={() => setQty((q) => q + 1)} className="grid size-9 place-items-center disabled:opacity-30">
                            <PlusIcon size={12} />
                        </button>
                    </div>

                    <motion.button
                        ref={addRef}
                        type="button"
                        disabled={soldOut}
                        whileHover={soldOut ? undefined : { y: -2 }}
                        whileTap={soldOut ? undefined : { scale: 0.98 }}
                        onClick={addToBag}
                        aria-live="polite"
                        className="label-sm flex h-12 flex-1 items-center justify-center rounded-full bg-ink px-6 text-[11px] text-white disabled:cursor-not-allowed disabled:bg-muted"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={soldOut ? "out" : added ? "added" : "idle"}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.18 }}
                                className="inline-flex items-center gap-2"
                            >
                                {soldOut ? (<>Sold out</>) : added ? (<>Added to bag <CheckIcon size={14} /></>) : (<>Add to bag • {total} <ArrowIcon size={14} /></>)}
                            </motion.span>
                        </AnimatePresence>
                    </motion.button>
                </div>

                {/* Perks */}
                <ul className="mt-4 grid grid-cols-3 gap-2">
                    {perks.map((k) => (
                        <li key={k.title} className="bg-sand px-2 py-3 text-center">
                            <p className="label-sm text-[10px] font-medium">{k.title}</p>
                            <p className="label-sm mt-0.5 text-[9px] text-muted">{k.sub}</p>
                        </li>
                    ))}
                </ul>

                {/* Accordions */}
                <div className="mt-6 space-y-2">
                    {p.sections.map((s, i) => {
                        const isOpen = open === i;
                        return (
                            <div key={s.title} className="bg-sand">
                                <h2>
                                    <button
                                        type="button"
                                        aria-expanded={isOpen}
                                        aria-controls={`acc-${i}`}
                                        onClick={() => setOpen(isOpen ? null : i)}
                                        className="label-sm flex w-full items-center justify-between px-5 py-4 text-left text-[11px] tracking-widest"
                                    >
                                        {s.title}
                                        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }} className="inline-flex">
                                            <ChevronIcon size={14} />
                                        </motion.span>
                                    </button>
                                </h2>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            id={`acc-${i}`}
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pb-5 text-xs leading-relaxed text-muted">
                                                <p>{s.body}</p>
                                                {s.bullets && (
                                                    <ul className="mt-3 list-disc space-y-1 pl-4">
                                                        {s.bullets.map((b) => (<li key={b}>{b}</li>))}
                                                    </ul>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile add-to-bag bar */}
            <AnimatePresence>
                {showBar && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ duration: 0.3, ease }}
                        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-line bg-paper/95 px-5 py-3 backdrop-blur lg:hidden"
                    >
                        <div className="min-w-0">
                            <p className="truncate text-xs font-medium">{p.name}</p>
                            <p className="text-xs text-muted">{money(pack.price)} · {pack.label}</p>
                        </div>
                        <button type="button" disabled={soldOut} onClick={addToBag} className="label-sm h-11 shrink-0 rounded-full bg-ink px-6 text-[11px] text-white disabled:cursor-not-allowed disabled:bg-muted">
                            {soldOut ? "Sold out" : added ? "Added" : "Add to bag"}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
