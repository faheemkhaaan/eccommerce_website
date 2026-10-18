"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowIcon } from "./Icons";

type Props = { label: string; gap?: string; children: ReactNode };

export default function Carousel({ label, gap = "gap-5", children }: Props) {
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
        const step = a && b ? b.offsetLeft - a.offsetLeft : el.clientWidth;
        el.scrollBy({ left: dir * step, behavior: "smooth" });
    };

    const hasOverflow = edge.prev || edge.next;
    const btn =
        "grid size-10 place-items-center rounded-full border border-ink/20 transition hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-30";

    return (
        <div role="region" aria-roledescription="carousel" aria-label={label}>
            <ul
                ref={track}
                onScroll={update}
                tabIndex={0}
                className={`flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden ${gap}`}
            >
                {children}
            </ul>

            <div className={`mt-6 flex h-10 justify-end gap-2 ${hasOverflow ? "" : "invisible"}`}>
                <button type="button" className={btn} aria-label="Previous" disabled={!edge.prev} onClick={() => scrollByCard(-1)}>
                    <span className="inline-flex rotate-180"><ArrowIcon size={14} /></span>
                </button>
                <button type="button" className={btn} aria-label="Next" disabled={!edge.next} onClick={() => scrollByCard(1)}>
                    <ArrowIcon size={14} />
                </button>
            </div>
        </div>
    );
}