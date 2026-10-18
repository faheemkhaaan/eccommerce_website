"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { CloseIcon, ZoomIcon } from "../Icons";
import { Photo } from "@/lib/product-details";

export default function Gallery({ photos, badge, name }: { photos: Photo[]; badge: string; name: string }) {
    const [active, setActive] = useState(0);
    const [zoom, setZoom] = useState(false);

    useEffect(() => {
        if (!zoom) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(false);
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [zoom]);

    return (
        <div className="flex flex-col-reverse gap-3 md:flex-row md:gap-4">
            <ul className="flex gap-2 overflow-x-auto md:w-20 md:shrink-0 md:flex-col md:overflow-visible">
                {photos.map((ph, i) => (
                    <li key={ph.thumb + i} className="w-16 shrink-0 md:w-full">
                        <button
                            type="button"
                            onClick={() => setActive(i)}
                            aria-label={`Show image ${i + 1} of ${photos.length}`}
                            aria-current={i === active}
                            className={`relative block aspect-3/4 w-full overflow-hidden rounded-[3px] bg-[#d8d0c2] transition ${i === active ? "ring-1 ring-ink ring-offset-2 ring-offset-paper" : "opacity-60 hover:opacity-100"
                                }`}
                        >
                            <Image src={ph.thumb} alt="" fill sizes="80px" className="object-cover" />
                        </button>
                    </li>
                ))}
            </ul>

            <div className="relative aspect-3/4 flex-1 overflow-hidden rounded-[3px] bg-[#d8d0c2]">
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                        key={active}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={photos[active].full}
                            alt={`${name}, view ${active + 1}`}
                            fill
                            priority={active === 0}
                            sizes="(max-width:1024px) 100vw, 45vw"
                            className="object-cover"
                        />
                    </motion.div>
                </AnimatePresence>

                <span className="label-sm absolute left-3 top-3 z-10 bg-white px-3 py-1.5 text-[9px] tracking-widest">{badge}</span>
                <button
                    type="button"
                    onClick={() => setZoom(true)}
                    aria-label="Enlarge image"
                    className="absolute bottom-3 right-3 z-10 grid size-10 place-items-center bg-white transition hover:scale-105"
                >
                    <ZoomIcon size={16} />
                </button>
            </div>

            <AnimatePresence>
                {zoom && (
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${name} enlarged`}
                        className="fixed inset-0 z-50 grid place-items-center bg-ink/85 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setZoom(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.96 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.96 }}
                            transition={{ duration: 0.25 }}
                            className="relative h-[90vh] w-full max-w-3xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image src={photos[active].full} alt={name} fill sizes="90vw" className="object-contain" />
                        </motion.div>
                        <button
                            type="button"
                            autoFocus
                            aria-label="Close"
                            onClick={() => setZoom(false)}
                            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white"
                        >
                            <CloseIcon size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}