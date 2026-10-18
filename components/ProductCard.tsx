"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PALETTE, type Product } from "@/lib/products";

const badgeStyle = {
    "New In": "bg-white text-ink",
    Bestseller: "bg-[#efe6d8]/90 text-accent",
    "Only 2 Left": "bg-[#fde4e1] text-[#b4372b]",
} as const;

export default function ProductCard({ product: p, index }: { product: Product; index: number }) {
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
                <div className="relative aspect-3/4 overflow-hidden rounded bg-[#d8d0c2]">
                    <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="(max-width:1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {p.badge && (
                        <span className={`label-sm absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9px] tracking-widest backdrop-blur-sm ${badgeStyle[p.badge]}`}>
                            {p.badge}
                        </span>
                    )}
                    <span
                        aria-hidden
                        className="label-sm absolute inset-x-3 bottom-3 hidden translate-y-2 rounded-full bg-white/90 py-2 text-center text-[10px] opacity-0 backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block"
                    >
                        Quick view
                    </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between gap-3">
                    <h3 className="text-[0.85rem] font-medium">{p.name}</h3>
                    <span className="shrink-0 text-[0.85rem]">${p.price.toLocaleString("en-US")}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{p.detail}</p>
                <div className="mt-2 flex gap-1.5">
                    {p.palette.map((n) => (
                        <i key={n} title={n} style={{ background: PALETTE[n] }} className="size-2.5 rounded-full border border-line" />
                    ))}
                </div>
            </Link>
        </motion.li>
    );
}