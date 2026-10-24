"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { money } from "@/lib/cart-math";
import type { CatalogueProduct } from "@/lib/catalogue";

export default function ProductCard({ product: p, index }: { product: CatalogueProduct; index: number }) {
    return (
        <motion.li
            layout
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="group"
        >
            <Link href={`/products/${p.id}`} className="block">
                <div className="relative aspect-4/5 overflow-hidden rounded bg-sand">
                    <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {p.badge && (
                        <span className="label-sm absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[9px] tracking-widest text-accent backdrop-blur-sm">
                            {p.badge}
                        </span>
                    )}
                </div>

                <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="font-serif text-[1.05rem]">{p.name}</h3>
                    <span className="shrink-0 text-[0.85rem] text-muted">from {money(p.fromPrice)}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{p.short}</p>
                <p className="label-sm mt-2 text-[10px] text-muted">
                    {p.packs.length} pack sizes · Cash on delivery
                </p>
            </Link>
        </motion.li>
    );
}
