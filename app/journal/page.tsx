import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Motion";
import { ArrowIcon } from "@/components/Icons";
import { ENTRIES, FEATURED, fmtDate } from "@/lib/journal";

export const metadata: Metadata = {
    title: "The Atelier Journal — ÉPURE Atelier",
    description: "Field notes from the atelier: craft, provenance and the people behind each numbered batch.",
};

export default function JournalPage() {
    const rest = ENTRIES.filter((e) => e.slug !== FEATURED.slug);

    return (
        <>
            <Header variant="solid" active="Editorial" />
            <main className="wrap py-10 md:py-14">
                <header className="max-w-3xl">
                    <p className="eyebrow">Atelier Journal</p>
                    <h1 className="mt-3 font-serif text-[clamp(2.1rem,4.4vw,3.2rem)] leading-[1.05] tracking-tight">
                        Field notes from the workshop
                    </h1>
                    <p className="mt-4 text-[0.9rem] leading-relaxed text-muted">
                        How the pieces are made, who makes them, and the decisions we would rather explain than
                        hide. Published between collections, whenever there is something worth writing down.
                    </p>
                </header>

                {/* Latest issue */}
                <Reveal className="mt-10">
                    <Link
                        href={`/journal/${FEATURED.slug}`}
                        className="group grid overflow-hidden rounded-[2.5rem] bg-white md:grid-cols-2"
                    >
                        <figure className="relative aspect-16/11 md:aspect-auto md:min-h-100">
                            <Image
                                src={FEATURED.image}
                                alt={FEATURED.alt}
                                fill
                                sizes="(max-width:768px) 100vw, 50vw"
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        </figure>
                        <div className="flex flex-col justify-center p-8 md:p-12">
                            <p className="label-sm text-[10px] text-accent">
                                Issue {FEATURED.issue} · Latest
                            </p>
                            <h2 className="mt-4 font-serif text-[clamp(1.7rem,3vw,2.4rem)] leading-tight tracking-tight">
                                {FEATURED.title}
                            </h2>
                            <p className="mt-4 text-[0.9rem] leading-relaxed text-muted">{FEATURED.standfirst}</p>
                            <p className="label-sm mt-6 text-[10px] text-muted">
                                {FEATURED.place} · {fmtDate(FEATURED.date)} · {FEATURED.readTime}
                            </p>
                            <span className="label-sm mt-7 inline-flex items-center gap-2 text-[11px] tracking-[0.12em]">
                                Read issue {FEATURED.issue} <ArrowIcon size={12} />
                            </span>
                        </div>
                    </Link>
                </Reveal>

                {/* Archive */}
                <h2 id="archive" className="mt-16 scroll-mt-28 font-serif text-2xl">From the archive</h2>
                <ul className="mt-6 grid gap-6 sm:grid-cols-2">
                    {rest.map((e, i) => (
                        <li key={e.slug}>
                            <Reveal delay={i * 0.06}>
                                <Link href={`/journal/${e.slug}`} className="group block">
                                    <figure className="relative aspect-16/11 overflow-hidden rounded-[2rem] bg-[#d8d0c2]">
                                        <Image
                                            src={e.image}
                                            alt={e.alt}
                                            fill
                                            sizes="(max-width:640px) 100vw, 45vw"
                                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                    </figure>
                                    <p className="label-sm mt-4 text-[10px] text-accent">Issue {e.issue}</p>
                                    <h3 className="mt-2 font-serif text-xl leading-snug">{e.title}</h3>
                                    <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">{e.standfirst}</p>
                                    <p className="label-sm mt-3 text-[10px] text-muted">
                                        {fmtDate(e.date)} · {e.readTime}
                                    </p>
                                </Link>
                            </Reveal>
                        </li>
                    ))}
                </ul>
            </main>
            <Footer />
        </>
    );
}
