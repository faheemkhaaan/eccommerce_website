"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "./CartProvider";
import { GIFT_PACKAGING_FROM, money, summarize } from "@/lib/cart-math";
import { ArrowIcon, CheckIcon, CloseIcon, GiftIcon, LeafIcon, LockIcon, MinusIcon, PlusIcon, ReturnIcon } from "../Icons";

const ease = [0.22, 1, 0.36, 1] as const;
const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

export default function CartDrawer() {
    const { items, count, subtotal, isOpen, close, setQty, remove } = useCart();
    const panel = useRef<HTMLElement>(null);
    const closeBtn = useRef<HTMLButtonElement>(null);

    const { shipping, tax, total } = summarize(subtotal);
    const pct = Math.min(100, Math.round((subtotal / GIFT_PACKAGING_FROM) * 100));
    const unlocked = subtotal >= GIFT_PACKAGING_FROM;

    // Scroll lock, Escape to close, focus trap, restore focus
    useEffect(() => {
        if (!isOpen) return;
        const previous = document.activeElement as HTMLElement | null;
        document.body.style.overflow = "hidden";
        closeBtn.current?.focus();

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") { close(); return; }
            if (e.key !== "Tab" || !panel.current) return;
            const nodes = panel.current.querySelectorAll<HTMLElement>(FOCUSABLE);
            if (!nodes.length) return;
            const first = nodes[0];
            const last = nodes[nodes.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        };
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
            previous?.focus();
        };
    }, [isOpen, close]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={close}
                    className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
                />
            )}
            {isOpen && (
                <motion.aside
                    key="panel"
                    ref={panel}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="bag-title"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ duration: 0.45, ease }}
                    className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[32rem] flex-col bg-paper shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-6 md:px-8 md:pt-8">
                        <h2 id="bag-title" className="font-serif text-2xl">
                            Shopping Bag
                            <span className="label-sm ml-2 font-sans text-[10px] text-muted">
                                ({count} item{count === 1 ? "" : "s"})
                            </span>
                        </h2>
                        <button
                            ref={closeBtn}
                            type="button"
                            onClick={close}
                            aria-label="Close bag"
                            className="grid size-10 place-items-center rounded-full bg-sand transition hover:bg-line"
                        >
                            <CloseIcon size={16} />
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div className="grid flex-1 place-items-center px-8 text-center">
                            <div>
                                <p className="font-serif text-2xl">Your bag is empty</p>
                                <p className="mt-2 text-sm text-muted">Pieces you add will wait for you here.</p>
                                <Link
                                    href="/collections"
                                    onClick={close}
                                    className="label-sm mt-6 inline-flex h-11 items-center rounded-full bg-ink px-7 text-[11px] text-white"
                                >
                                    Continue browsing
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Gift packaging progress */}
                            <div className="mx-6 mt-5 rounded-2xl bg-sand px-4 py-3 md:mx-8">
                                <div className="label-sm mb-2 flex items-center justify-between gap-3 text-[10px]">
                                    <span className="inline-flex items-center gap-2">
                                        <GiftIcon size={14} />
                                        {unlocked
                                            ? "Free luxury gift packaging unlocked!"
                                            : `${money(GIFT_PACKAGING_FROM - subtotal)} away from free gift packaging`}
                                    </span>
                                    <span className="text-accent">{pct}%</span>
                                </div>
                                <div className="h-1 w-full rounded-full bg-line">
                                    <motion.span
                                        className="block h-full rounded-full bg-ink"
                                        initial={false}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.6, ease }}
                                    />
                                </div>
                            </div>

                            {/* Items */}
                            <ul className="mt-2 flex-1 overflow-y-auto px-6 md:px-8">
                                <AnimatePresence initial={false}>
                                    {items.map((it) => (
                                        <motion.li
                                            key={it.key}
                                            layout
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3, ease }}
                                            className="overflow-hidden"
                                        >
                                            <div className="grid grid-cols-[5.5rem_1fr] gap-4 border-b border-line py-5 sm:grid-cols-[6rem_1fr]">
                                                <div className="relative aspect-3/4 overflow-hidden bg-[#d8d0c2]">
                                                    <Image src={it.image} alt={it.name} fill sizes="96px" className="object-cover" />
                                                </div>
                                                <div className="flex min-w-0 flex-col">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <h3 className="text-sm">{it.name}</h3>
                                                        <button
                                                            type="button"
                                                            onClick={() => remove(it.key)}
                                                            aria-label={`Remove ${it.name}`}
                                                            className="-mr-1 -mt-1 grid size-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-sand hover:text-ink"
                                                        >
                                                            <CloseIcon size={14} />
                                                        </button>
                                                    </div>
                                                    <p className="label-sm mt-2 text-[10px] text-muted">{it.options.join("  •  ")}</p>

                                                    <div className="mt-auto flex items-end justify-between pt-4">
                                                        <div className="inline-flex h-8 items-center rounded-full bg-sand">
                                                            <button type="button" aria-label="Decrease quantity" disabled={it.qty <= 1} onClick={() => setQty(it.key, it.qty - 1)} className="grid size-8 place-items-center disabled:opacity-30">
                                                                <MinusIcon size={11} />
                                                            </button>
                                                            <span aria-live="polite" className="w-5 text-center text-xs">{it.qty}</span>
                                                            <button type="button" aria-label="Increase quantity" disabled={it.qty >= 9} onClick={() => setQty(it.key, it.qty + 1)} className="grid size-8 place-items-center disabled:opacity-30">
                                                                <PlusIcon size={11} />
                                                            </button>
                                                        </div>
                                                        <span className="font-serif text-lg">{money(it.price * it.qty)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </ul>

                            {/* Summary */}
                            <div className="bg-sand px-6 pb-6 pt-5 md:px-8">
                                <dl className="space-y-2 text-[0.8rem]">
                                    <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(subtotal)}</dd></div>
                                    <div className="flex justify-between">
                                        <dt className="inline-flex items-center gap-1.5 text-muted">
                                            Estimated Shipping
                                            {shipping === 0 && (
                                                <span className="grid size-4 place-items-center rounded-full border border-accent text-accent"><CheckIcon size={9} /></span>
                                            )}
                                        </dt>
                                        <dd className={shipping === 0 ? "label-sm text-[11px]" : ""}>{shipping === 0 ? "Free" : money(shipping)}</dd>
                                    </div>
                                    <div className="flex justify-between"><dt className="text-muted">Estimated Taxes (8%)</dt><dd>{money(tax)}</dd></div>
                                </dl>

                                <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
                                    <span className="font-serif text-xl">Total</span>
                                    <motion.span key={total} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="font-serif text-2xl">
                                        {money(total)}
                                    </motion.span>
                                </div>

                                {/* Express checkout: placeholders, swap for the providers' official buttons */}
                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    <button type="button" aria-label="Pay with Apple Pay" className="h-10 rounded-full bg-white text-xs font-medium transition hover:shadow-md">Apple Pay</button>
                                    <button type="button" aria-label="Pay with Google Pay" className="h-10 rounded-full bg-white text-xs font-medium transition hover:shadow-md">G Pay</button>
                                    <button type="button" aria-label="Pay with Shop Pay" className="h-10 rounded-full bg-[#5a31f4] text-xs font-bold italic text-white transition hover:brightness-110">shop Pay</button>
                                </div>

                                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="mt-3">
                                    <Link
                                        href="/checkout"
                                        onClick={close}
                                        className="label-sm flex h-12 items-center justify-center gap-2 rounded-full bg-ink text-[11px] text-white"
                                    >
                                        Proceed to secure checkout <ArrowIcon size={14} />
                                    </Link>
                                </motion.div>

                                <ul className="label-sm mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[9px] text-muted">
                                    <li className="inline-flex items-center gap-1.5"><span className="text-accent"><LockIcon size={11} /></span>256-bit encrypted</li>
                                    <li className="inline-flex items-center gap-1.5"><span className="text-accent"><LeafIcon size={11} /></span>Carbon-neutral</li>
                                    <li className="inline-flex items-center gap-1.5"><span className="text-accent"><ReturnIcon size={11} /></span>30-day returns</li>
                                </ul>
                            </div>
                        </>
                    )}
                </motion.aside>
            )}
        </AnimatePresence>
    );
}