import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MotionProvider, Reveal } from "@/components/Motion";
import Gallery from "@/components/product/Gallery";
import PurchasePanel from "@/components/product/PurchasePanel";
import CompleteTheLook from "@/components/product/CompleteTheLook";
import { CATEGORIES, MATERIALS, type Category } from "@/lib/products";
import { allDetailIds, getDetail } from "@/lib/product-details";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
    return allDetailIds().map((id) => ({ id }));
}

// Trail crumbs that map onto a catalogue facet become links; ranges we cannot filter by stay text.
const crumbHref = (crumb: string) =>
    crumb === "Archive"
        ? "/collections"
        : CATEGORIES.includes(crumb as Category)
            ? `/collections?category=${encodeURIComponent(crumb)}`
            : MATERIALS.includes(crumb)
                ? `/collections?material=${encodeURIComponent(crumb)}`
                : null;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const p = getDetail(id);
    return { title: p ? `${p.name} — ÉPURE Atelier` : "Not found" };
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params;
    const p = getDetail(id);
    if (!p) notFound();

    return (
        <MotionProvider>
            <Header variant="solid" active="Apparel" />
            <main>
                <div className="wrap pb-16 pt-6 md:pb-24">
                    <nav aria-label="Breadcrumb" className="label-sm text-[10px] tracking-[0.14em] text-muted">
                        <ol className="flex flex-wrap items-center gap-2">
                            {p.breadcrumb.map((b) => {
                                const href = crumbHref(b);
                                return (
                                    <li key={b} className="flex items-center gap-2">
                                        {href ? <Link href={href} className="hover:text-ink">{b}</Link> : <span>{b}</span>}
                                        <span aria-hidden>/</span>
                                    </li>
                                );
                            })}
                            <li aria-current="page" className="text-ink">{p.name}</li>
                        </ol>
                    </nav>

                    <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
                        <Reveal y={16}>
                            <Gallery photos={p.gallery} badge={p.badge} name={p.name} />
                        </Reveal>
                        <Reveal y={16} delay={0.08}>
                            <PurchasePanel product={p} />
                        </Reveal>
                    </div>
                </div>

                <section className="wrap border-t border-line py-14 md:py-20">
                    <CompleteTheLook items={p.ensemble} />
                </section>
            </main>
            <Footer />
        </MotionProvider>
    );
}