import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Motion";
import { ArrowIcon } from "@/components/Icons";
import { ENTRIES, findEntry, fmtDate } from "@/lib/journal";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
    return ENTRIES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const entry = findEntry(slug);
    if (!entry) return { title: "Journal — ÉPURE Atelier" };
    return { title: `${entry.title} — ÉPURE Atelier`, description: entry.standfirst };
}

export default async function JournalEntryPage({ params }: Props) {
    const { slug } = await params;
    const entry = findEntry(slug);
    if (!entry) notFound();

    const next = ENTRIES[(ENTRIES.indexOf(entry) + 1) % ENTRIES.length];

    return (
        <>
            <Header variant="solid" active="Editorial" />
            <main className="wrap py-10 md:py-14">
                <Link href="/journal" className="label-sm inline-flex items-center gap-2 text-[10px] text-muted transition hover:text-ink">
                    ← All issues
                </Link>

                <article className="mx-auto mt-8 max-w-3xl">
                    <p className="label-sm text-[10px] text-accent">Issue {entry.issue}</p>
                    <h1 className="mt-4 font-serif text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.08] tracking-tight">
                        {entry.title}
                    </h1>
                    <p className="mt-5 text-[1.05rem] leading-relaxed text-muted">{entry.standfirst}</p>
                    <p className="label-sm mt-6 border-t border-line pt-5 text-[10px] text-muted">
                        {entry.place} · {fmtDate(entry.date)} · {entry.readTime}
                    </p>

                    <figure className="relative mt-8 aspect-16/10 overflow-hidden rounded-[2rem] bg-[#d8d0c2]">
                        <Image src={entry.image} alt={entry.alt} fill priority sizes="(max-width:1024px) 100vw, 768px" className="object-cover" />
                    </figure>

                    <div className="mt-10 space-y-6 text-[0.95rem] leading-[1.85]">
                        {entry.body.map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                    </div>

                    {entry.quote && (
                        <blockquote className="mt-10 rounded-[2rem] bg-sand p-8">
                            <p className="font-serif text-[1.35rem] leading-snug">“{entry.quote.text}”</p>
                            <footer className="label-sm mt-4 text-[10px] text-muted">— {entry.quote.attribution}</footer>
                        </blockquote>
                    )}
                </article>

                <Reveal className="mx-auto mt-14 max-w-3xl">
                    <Link
                        href={`/journal/${next.slug}`}
                        className="group flex items-center justify-between gap-6 rounded-[2rem] bg-white p-6 transition hover:bg-sand"
                    >
                        <div>
                            <p className="label-sm text-[10px] text-muted">Next · Issue {next.issue}</p>
                            <p className="mt-2 font-serif text-xl leading-snug">{next.title}</p>
                        </div>
                        <span className="text-accent transition group-hover:translate-x-1"><ArrowIcon size={16} /></span>
                    </Link>
                </Reveal>
            </main>
            <Footer />
        </>
    );
}
