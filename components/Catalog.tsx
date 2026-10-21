"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PRODUCTS, PALETTE, BADGES, CATEGORIES, MATERIALS } from "@/lib/products";
import ProductCard from "./ProductCard";
import { ChevronIcon, CloseIcon, GridIcon, RowsIcon } from "./Icons";

const PAGE = 8;

type PriceBand = "all" | "under300" | "300to500" | "over500";
type Sort = "featured" | "low" | "high";
type Option = { value: string; label: string };

const priceOptions: Option[] = [
    { value: "all", label: "All" },
    { value: "under300", label: "Under $300" },
    { value: "300to500", label: "$300 – $500" },
    { value: "over500", label: "$500+" },
];
const sortOptions: Option[] = [
    { value: "featured", label: "Featured Atelier" },
    { value: "low", label: "Price: Low to High" },
    { value: "high", label: "Price: High to Low" },
];
const toOptions = (list: string[]): Option[] => [
    { value: "All", label: "All" },
    ...list.map((v) => ({ value: v, label: v })),
];
const categoryOptions = toOptions(CATEGORIES);
const materialOptions = toOptions(MATERIALS);
const badgeOptions = toOptions(BADGES);
const paletteOptions = toOptions(Object.keys(PALETTE));

// Header links deep-link into the catalogue, so the incoming param must match a real facet.
// Anything unrecognised falls back to "All" instead of emptying the grid.
const seed = (value: string | undefined, options: Option[]): string =>
    value && options.some((o) => o.value === value) ? value : "All";

const inBand = (price: number, band: PriceBand) =>
    band === "all" ||
    (band === "under300" ? price < 300 : band === "300to500" ? price >= 300 && price <= 500 : price > 500);

const labelOf = (opts: Option[], value: string) => opts.find((o) => o.value === value)?.label ?? value;

function FilterSelect({
    label, value, options, onChange,
}: { label: string; value: string; options: Option[]; onChange: (v: string) => void }) {
    return (
        <label className="relative inline-flex shrink-0 items-center rounded-full bg-sand text-[10px] uppercase tracking-widest transition hover:bg-line">
            <span className="pointer-events-none pl-4 text-muted">{label}:</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="cursor-pointer appearance-none bg-transparent py-2.5 pl-1.5 pr-9 uppercase tracking-widest text-ink outline-none"
            >
                {options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
            <span className="pointer-events-none absolute right-3.5"><ChevronIcon size={12} /></span>
        </label>
    );
}

export default function Catalog({
    initialCategory, initialMaterial, initialBadge,
}: { initialCategory?: string; initialMaterial?: string; initialBadge?: string }) {
    const [category, setCategory] = useState(() => seed(initialCategory, categoryOptions));
    const [material, setMaterial] = useState(() => seed(initialMaterial, materialOptions));
    const [badge, setBadge] = useState(() => seed(initialBadge, badgeOptions));
    const [palette, setPalette] = useState("All");
    const [price, setPrice] = useState<PriceBand>("all");
    const [sort, setSort] = useState<Sort>("featured");
    const [cols, setCols] = useState<4 | 2>(4);
    const [visible, setVisible] = useState(PAGE);

    // any filter change starts the list from the first page again
    const apply = (fn: () => void) => { fn(); setVisible(PAGE); };

    const filtered = useMemo(() => {
        const list = PRODUCTS.filter(
            (p) =>
                (category === "All" || p.category === category) &&
                (material === "All" || p.material === material) &&
                (badge === "All" || p.badge === badge) &&
                (palette === "All" || p.palette.includes(palette as keyof typeof PALETTE)) &&
                inBand(p.price, price),
        );
        if (sort === "low") return [...list].sort((a, b) => a.price - b.price);
        if (sort === "high") return [...list].sort((a, b) => b.price - a.price);
        return list;
    }, [category, material, badge, palette, price, sort]);

    const chips = [
        category !== "All" && { key: "category", label: `Category: ${category}`, clear: () => setCategory("All") },
        material !== "All" && { key: "material", label: `Material: ${material}`, clear: () => setMaterial("All") },
        badge !== "All" && { key: "badge", label: `Edit: ${badge}`, clear: () => setBadge("All") },
        palette !== "All" && { key: "palette", label: `Tone: ${palette}`, clear: () => setPalette("All") },
        price !== "all" && { key: "price", label: `Price: ${labelOf(priceOptions, price)}`, clear: () => setPrice("all") },
    ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

    const clearAll = () => apply(() => {
        setCategory("All"); setMaterial("All"); setBadge("All"); setPalette("All"); setPrice("all");
    });

    const shown = filtered.slice(0, visible);
    const pct = filtered.length ? Math.round((shown.length / filtered.length) * 100) : 0;
    const done = shown.length >= filtered.length;

    return (
        <section className="wrap py-8 md:py-12">
            {/* Filter bar */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
                    <FilterSelect label="Category" value={category} options={categoryOptions} onChange={(v) => apply(() => setCategory(v))} />
                    <FilterSelect label="Material" value={material} options={materialOptions} onChange={(v) => apply(() => setMaterial(v))} />
                    <FilterSelect label="Edit" value={badge} options={badgeOptions} onChange={(v) => apply(() => setBadge(v))} />
                    <FilterSelect label="Palette" value={palette} options={paletteOptions} onChange={(v) => apply(() => setPalette(v))} />
                    <FilterSelect label="Price" value={price} options={priceOptions} onChange={(v) => apply(() => setPrice(v as PriceBand))} />
                </div>

                <div className="flex items-center gap-2">
                    <FilterSelect label="Sort" value={sort} options={sortOptions} onChange={(v) => setSort(v as Sort)} />
                    <div className="hidden rounded-full bg-sand p-1 lg:flex" role="group" aria-label="Grid size">
                        {([4, 2] as const).map((n) => (
                            <button
                                key={n}
                                type="button"
                                aria-pressed={cols === n}
                                aria-label={n === 4 ? "Compact grid" : "Large grid"}
                                onClick={() => setCols(n)}
                                className={`grid size-8 place-items-center rounded-full transition ${cols === n ? "bg-white shadow-sm" : "text-muted hover:text-ink"}`}
                            >
                                {n === 4 ? <GridIcon size={14} /> : <RowsIcon size={14} />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active criteria */}
            <AnimatePresence initial={false}>
                {chips.length > 0 && (
                    <motion.div
                        key="chips"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-wrap items-center gap-2 pt-4">
                            <span className="label-sm text-[10px] text-muted">Active criteria:</span>
                            {chips.map((c) => (
                                <button
                                    key={c.key}
                                    type="button"
                                    onClick={() => apply(c.clear)}
                                    aria-label={`Remove filter ${c.label}`}
                                    className="label-sm inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[10px] transition hover:border-ink"
                                >
                                    {c.label} <CloseIcon size={10} />
                                </button>
                            ))}
                            <button type="button" onClick={clearAll} className="label-sm ml-1 text-[10px] underline underline-offset-4">
                                Clear all ({chips.length})
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <p className="sr-only" aria-live="polite">{filtered.length} styles match your selection</p>

            {/* Grid */}
            <div className="mt-8 border-t border-line pt-8 md:mt-10 md:pt-10">
                {filtered.length === 0 ? (
                    <div className="py-24 text-center">
                        <p className="font-serif text-2xl">Nothing matches that edit.</p>
                        <button type="button" onClick={clearAll} className="label-sm mt-4 text-[11px] underline underline-offset-4">
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <ul className={`grid gap-x-3 gap-y-10 sm:gap-x-5 sm:gap-y-12 ${cols === 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:mx-auto lg:max-w-4xl"}`}>
                        <AnimatePresence mode="popLayout">
                            {shown.map((p, i) => (<ProductCard key={p.id} product={p} index={i % PAGE} />))}
                        </AnimatePresence>
                    </ul>
                )}
            </div>

            {/* Load more */}
            {filtered.length > 0 && (
                <div className="mx-auto mt-16 flex max-w-xs flex-col items-center gap-6">
                    <div className="w-full">
                        <div className="label-sm mb-2 flex justify-between text-[10px] text-muted">
                            <span>Showing {shown.length} of {filtered.length} styles</span>
                            <span>{pct}%</span>
                        </div>
                        <div className="h-0.5 w-full bg-line">
                            <motion.span
                                className="block h-full bg-ink"
                                initial={false}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            />
                        </div>
                    </div>

                    {done ? (
                        <p className="label-sm text-[10px] text-muted">You’ve seen the full edit</p>
                    ) : (
                        <motion.button
                            type="button"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setVisible((v) => v + PAGE)}
                            className="label-sm inline-flex h-12 items-center gap-2 rounded-full bg-ink px-8 text-[11px] text-white"
                        >
                            Load next {Math.min(PAGE, filtered.length - shown.length)} edits <ChevronIcon size={12} />
                        </motion.button>
                    )}
                </div>
            )}
        </section>
    );
}