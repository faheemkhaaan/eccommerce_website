"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowIcon, CheckIcon } from "../Icons";
import { Detail } from "@/lib/product-details";
import { useCart } from "../cart/CartProvider";

type EnsembleItem = Detail["ensemble"][number];


function QuickAdd({ item }: { item: EnsembleItem }) {
    const [done, setDone] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const { add, open: openBag } = useCart();
    useEffect(() => () => clearTimeout(timer.current), []);

    const handleAdd = () => {
        add({
            id: item.id,
            name: item.name,
            image: item.image,
            options: [item.category],
            price: item.price,
        });
        openBag();

        setDone(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setDone(false), 1800);
    };

    return (
        <button
            type="button"
            onClick={handleAdd}
            aria-label={`Quick add ${item.name} to bag`}
            className="label-sm mt-4 inline-flex w-full items-center justify-center gap-2 bg-white py-2.5 text-[10px] transition hover:bg-ink hover:text-white"
        >
            {done ? (<>Added <CheckIcon size={12} /></>) : "Quick add"}
        </button>
    );
}

export default function CompleteTheLook({ items }: { items: Detail["ensemble"] }) {
    const track = useRef<HTMLUListElement>(null);
    const [edge, setEdge] = useState({ prev: false, next: false });


    const update = useCallback(() => {
        const el = track.current;
        if (!el) return;
        setEdge({
            prev: el.scrollLeft > 4,
            next: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
        });
    }, []);

    useEffect(() => {
        const el = track.current;
        if (!el) return;
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [update]);

    const scrollByCard = (dir: 1 | -1) => {
        const el = track.current;
        if (!el) return;
        const a = el.children[0] as HTMLElement | undefined;
        const b = el.children[1] as HTMLElement | undefined;
        el.scrollBy({ left: dir * (a && b ? b.offsetLeft - a.offsetLeft : el.clientWidth), behavior: "smooth" });
    };

    const btn = "grid size-10 place-items-center rounded-full border border-ink/20 transition hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-30";

    return (
        <div role="region" aria-roledescription="carousel" aria-label="Complete the look">
            <div className="mb-8 flex items-end justify-between gap-6">
                <div>
                    <p className="eyebrow mb-2 text-accent">Curated Ensemble</p>
                    <h2 className="font-serif text-[clamp(1.7rem,3vw,2.2rem)] leading-tight tracking-tight">Complete The Look</h2>
                </div>
                <div className={`flex gap-2 ${edge.prev || edge.next ? "" : "invisible"}`}>
                    <button type="button" className={btn} aria-label="Previous" disabled={!edge.prev} onClick={() => scrollByCard(-1)}>
                        <span className="inline-flex rotate-180"><ArrowIcon size={14} /></span>
                    </button>
                    <button type="button" className={btn} aria-label="Next" disabled={!edge.next} onClick={() => scrollByCard(1)}>
                        <ArrowIcon size={14} />
                    </button>
                </div>
            </div>

            <ul
                ref={track}
                onScroll={update}
                tabIndex={0}
                className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
            >
                {items.map((it, i) => (
                    <motion.li
                        key={it.id}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                        transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className="group w-[78%] shrink-0 snap-start bg-sand p-4 sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
                    >
                        <div className="relative aspect-3/4 overflow-hidden bg-[#d8d0c2]">
                            <Image
                                src={it.image}
                                alt={it.name}
                                fill
                                sizes="(max-width:640px) 78vw, (max-width:1024px) 45vw, 30vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <p className="label-sm mt-4 text-[9px] text-muted">{it.category}</p>
                        <h3 className="mt-1 text-sm">{it.name}</h3>
                        <p className="mt-1 font-serif text-base">${it.price}</p>
                        <QuickAdd item={it} />
                    </motion.li>
                ))}
            </ul>
        </div>
    );
}