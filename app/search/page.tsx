import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { ArrowIcon, SearchIcon } from "@/components/Icons";
import { PRODUCTS, type Product } from "@/lib/products";
import { ENTRIES, type Entry } from "@/lib/journal";

export const metadata: Metadata = { title: "Search — ÉPURE Atelier" };

const SUGGESTIONS = ["linen", "cashmere", "wool", "stoneware", "brass", "leather", "vessel", "New In"];

// Small prototype index: every word of the query has to appear somewhere in the record.
const productText = (p: Product) =>
    [p.name, p.detail, p.category, p.material, ...p.palette, p.badge ?? ""].join(" ").toLowerCase();

const entryText = (e: Entry) =>
    [e.title, e.standfirst, e.place, e.body.join(" ")].join(" ").toLowerCase();

const matches = (haystack: string, words: string[]) => words.every((w) => haystack.includes(w));

export default function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    return (
        <>
            <Header variant="solid" />
            <main className="wrap py-10 md:py-14">
                {/* Reading searchParams needs a Suspense boundary while the page is prerendered */}
                <Suspense fallback={<div className="h-100 animate-pulse rounded-[2rem] bg-muted/10" />}>
                    <SearchResults searchParams={searchParams} />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}

// Helper async component so the query can seed the results on first render
async function SearchResults({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams;
    const term = (typeof q === "string" ? q : "").trim();
    const words = term.toLowerCase().split(/\s+/).filter(Boolean);

    const products = words.length ? PRODUCTS.filter((p) => matches(productText(p), words)) : [];
    const entries = words.length ? ENTRIES.filter((e) => matches(entryText(e), words)) : [];
    const total = products.length + entries.length;

    return (
        <>
            <header className="max-w-3xl">
                    <p className="eyebrow">Search</p>
                    <h1 className="mt-3 font-serif text-[clamp(2.1rem,4.4vw,3.2rem)] leading-[1.05] tracking-tight">
                        {term ? <>Results for “{term}”</> : "Search the atelier"}
                    </h1>
                    <p className="mt-4 text-[0.9rem] leading-relaxed text-muted">
                        {term
                            ? `${total} match${total === 1 ? "" : "es"} across the collection and the journal.`
                            : "Look up a piece by name, a material, a tone, or something you read in the journal."}
                    </p>
                </header>

                {/* Plain GET form: the results page works with or without JavaScript */}
                <form action="/search" method="get" role="search" className="mt-7 flex max-w-xl items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5">
                    <SearchIcon size={15} />
                    <input
                        type="search"
                        name="q"
                        defaultValue={term}
                        placeholder="Linen, brass, overcoat…"
                        aria-label="Search the collection"
                        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                    />
                    <button type="submit" className="label-sm shrink-0 rounded-full bg-ink px-5 py-2 text-[10px] text-white">
                        Search
                    </button>
                </form>

                {/* Products */}
                {products.length > 0 && (
                    <section className="mt-12">
                        <h2 className="font-serif text-2xl">The collection</h2>
                        <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-4">
                            {products.map((p, i) => (
                                <ProductCard key={p.id} product={p} index={i} />
                            ))}
                        </ul>
                    </section>
                )}

                {/* Journal */}
                {entries.length > 0 && (
                    <section className="mt-14">
                        <h2 className="font-serif text-2xl">From the journal</h2>
                        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                            {entries.map((e) => (
                                <li key={e.slug}>
                                    <Link href={`/journal/${e.slug}`} className="group flex h-full flex-col rounded-[1.5rem] bg-white p-6 transition hover:bg-sand">
                                        <p className="label-sm text-[10px] text-accent">Issue {e.issue}</p>
                                        <p className="mt-2 font-serif text-lg leading-snug">{e.title}</p>
                                        <p className="mt-2 text-xs leading-relaxed text-muted">{e.standfirst}</p>
                                        <span className="label-sm mt-4 inline-flex items-center gap-2 text-[10px]">
                                            Read <ArrowIcon size={11} />
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Nothing found, or nothing typed yet */}
                {total === 0 && (
                    <section className="mt-12 rounded-[2rem] bg-white p-8 text-center sm:p-12">
                        <span className="mx-auto grid size-12 place-items-center rounded-full bg-sand text-muted">
                            <SearchIcon size={18} />
                        </span>
                        <p className="mt-4 font-serif text-2xl">
                            {term ? <>Nothing matches “{term}”.</> : "What are you looking for?"}
                        </p>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                            Try a material, a tone, or one of the edits below. Or browse the full wardrobe.
                        </p>
                        <ul className="mt-6 flex flex-wrap justify-center gap-2">
                            {SUGGESTIONS.map((s) => (
                                <li key={s}>
                                    <Link
                                        href={`/search?q=${encodeURIComponent(s)}`}
                                        className="label-sm inline-flex rounded-full border border-line px-4 py-2 text-[10px] transition hover:border-ink"
                                    >
                                        {s}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <Link href="/collections" className="label-sm mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-6 text-[10px] text-white">
                            Browse the collection <ArrowIcon size={12} />
                        </Link>
                    </section>
                )}
        </>
    );
}
