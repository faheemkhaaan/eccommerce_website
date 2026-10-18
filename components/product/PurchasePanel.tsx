"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowIcon, CheckIcon, ChevronIcon, HeartIcon, MinusIcon, PlusIcon, RulerIcon, StarIcon } from "../Icons";
import { Detail } from "@/lib/product-details";
import { useCart } from "../cart/CartProvider";

const perks = [
    { title: "Complimentary", sub: "Global Express" },
    { title: "14-Day", sub: "Atelier Returns" },
    { title: "Artisanal", sub: "Porto Workshop" },
];
const ease = [0.22, 1, 0.36, 1] as const;

export default function PurchasePanel({ product: p }: { product: Detail }) {
    const [color, setColor] = useState(p.colorways[0].name);
    const [size, setSize] = useState(p.defaultSize);
    const [qty, setQty] = useState(1);
    const [wished, setWished] = useState(false);
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

    const maxQty = p.stockLeft ?? 9;
    const total = (p.price * qty).toLocaleString("en-US");

    const addToBag = () => {
        add({
            id: p.id,
            name: p.name,
            image: p.gallery[0].thumb,
            options: [p.sizes.length > 1 ? `Size: ${size}` : "", color].filter(Boolean),
            price: p.price,
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
                <span className="text-muted">Art. {p.article}</span>
            </p>
            <h1 className="mt-3 font-serif text-[clamp(1.9rem,3.4vw,2.6rem)] leading-tight tracking-tight">{p.name}</h1>

            <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="flex gap-0.5 [&_svg]:fill-current" aria-hidden><StarIcon size={12} /><StarIcon size={12} /><StarIcon size={12} /><StarIcon size={12} /><StarIcon size={12} /></span>
                <a href="#reviews" className="text-muted underline underline-offset-4">
                    {p.rating} ({p.reviews} atelier appraisals)
                </a>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
                <span className="font-serif text-3xl">${p.price.toLocaleString("en-US")}</span>
                <span className="label-sm text-[10px] text-muted">USD tax included</span>
            </div>
            <p className="mt-1 text-xs text-muted">
                Or 4 interest-free installments of ${Math.round(p.price / 4)} with{" "}
                <span className="label-sm rounded bg-sand px-1.5 py-0.5 text-[9px] font-semibold text-ink">Klarna</span>
            </p>

            <div className="mt-6 border-t border-line pt-6">
                {/* Colorway */}
                <div className="mb-3 flex items-center justify-between">
                    <span className="label-sm text-[10px] text-muted">Colorway:</span>
                    <span className="text-xs">{color}</span>
                </div>
                <div role="radiogroup" aria-label="Colorway" className="flex gap-3">
                    {p.colorways.map((c) => {
                        const sel = c.name === color;
                        return (
                            <button
                                key={c.name}
                                type="button"
                                role="radio"
                                aria-checked={sel}
                                aria-label={c.name}
                                onClick={() => setColor(c.name)}
                                className="relative size-7 rounded-full border border-line"
                                style={{ background: c.hex }}
                            >
                                {sel && (
                                    <motion.span
                                        layoutId="swatch-ring"
                                        transition={{ duration: 0.25, ease }}
                                        className="absolute -inset-1.5 rounded-full border border-ink"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Size */}
                <div className="mb-3 mt-6 flex items-center justify-between">
                    <span className="label-sm text-[10px] text-muted">
                        Select size: <b className="font-medium text-ink">{size}</b>
                    </span>
                    <a href="#size-guide" className="inline-flex items-center gap-1.5 text-[11px] underline underline-offset-4">
                        <RulerIcon size={12} /> Atelier Size Guide
                    </a>
                </div>
                <div role="radiogroup" aria-label="Size" className={`grid gap-2 ${p.sizes.length > 1 ? "grid-cols-5" : "grid-cols-1"}`}>
                    {p.sizes.map((s) => {
                        const sel = s === size;
                        return (
                            <button
                                key={s}
                                type="button"
                                role="radio"
                                aria-checked={sel}
                                onClick={() => setSize(s)}
                                className="relative h-10 bg-sand text-[11px] tracking-wider transition hover:bg-line"
                            >
                                {sel && (
                                    <motion.span layoutId="size-pill" transition={{ duration: 0.25, ease }} className="absolute inset-0 bg-ink" />
                                )}
                                <span className={`relative z-10 transition-colors ${sel ? "text-white" : ""}`}>{s}</span>
                            </button>
                        );
                    })}
                </div>
                {(p.modelNote || p.stockLeft) && (
                    <p className="mt-2 flex justify-between gap-4 text-[11px] text-muted">
                        <span>{p.modelNote}</span>
                        {p.stockLeft && (
                            <span className="label-sm text-[10px] text-accent">
                                Only {p.stockLeft} piece{p.stockLeft > 1 ? "s" : ""} left
                            </span>
                        )}
                    </p>
                )}

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
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={addToBag}
                        aria-live="polite"
                        className="label-sm flex h-12 flex-1 items-center justify-center rounded-full bg-ink px-6 text-[11px] text-white"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={added ? "added" : "idle"}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.18 }}
                                className="inline-flex items-center gap-2"
                            >
                                {added ? (<>Added to bag <CheckIcon size={14} /></>) : (<>Add to bag • ${total} <ArrowIcon size={14} /></>)}
                            </motion.span>
                        </AnimatePresence>
                    </motion.button>

                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.85 }}
                        aria-pressed={wished}
                        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                        onClick={() => setWished((w) => !w)}
                        className={`grid size-12 shrink-0 place-items-center rounded-full bg-sand ${wished ? "[&_svg]:fill-current" : ""}`}
                    >
                        <HeartIcon size={16} />
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
                            <p className="text-xs text-muted">${p.price.toLocaleString("en-US")} · {size}</p>
                        </div>
                        <button type="button" onClick={addToBag} className="label-sm h-11 shrink-0 rounded-full bg-ink px-6 text-[11px] text-white">
                            {added ? "Added" : "Add to bag"}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function add(arg0: { id: string; name: string; image: string; options: string[]; price: number; qty: number; }) {
    throw new Error("Function not implemented.");
}
function openBag() {
    throw new Error("Function not implemented.");
}

