import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MotionProvider, Reveal } from "@/components/Motion";
import Gallery from "@/components/product/Gallery";
import PurchasePanel from "@/components/product/PurchasePanel";
import ProductFacts from "@/components/product/ProductFacts";
import { allDetailIds, getDetail } from "@/lib/product-details";

type Props = { params: Promise<{ id: string }> };

// No empty-list fallback here: Cache Components requires this to return at least
// one result, and a catalogue we can't reach at build time is a real failure —
// better to stop the deploy than to ship a site with no product pages.
export async function generateStaticParams() {
    return allDetailIds();
}

// Only the shop landing page is a real destination; the rest of the trail is text.
const crumbHref = (crumb: string) => (crumb === "Shop" ? "/collections" : null);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const p = await getDetail(id);
    return {
        title: p ? `${p.name} — Organic Ghee` : "Not found",
        description: p?.short,
    };
}

export default function ProductPage({ params }: Props) {
    return (
        <MotionProvider>
            <Header variant="solid" active="Shop" />
            <main className="wrap pb-16 pt-6 md:pb-24">
                {/* Reading params needs a Suspense boundary so the shell can still prerender */}
                <Suspense fallback={<ProductSkeleton />}>
                    <ResolvedProduct params={params} />
                </Suspense>
            </main>
            <Footer />
        </MotionProvider>
    );
}

async function ResolvedProduct({ params }: Props) {
    const { id } = await params;
    const p = await getDetail(id);
    if (!p) notFound();

    return (
        <>
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

            {/* ProductFacts carries its own top border and renders nothing at all
                for a product that has no editorial copy yet. */}
            <ProductFacts product={p} />
        </>
    );
}

function ProductSkeleton() {
    return (
        <>
            <div className="h-3 w-40 animate-pulse rounded-full bg-muted/20" />
            <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
                <div className="aspect-4/5 animate-pulse rounded bg-muted/10" />
                <div className="space-y-5">
                    <div className="h-4 w-28 animate-pulse rounded-full bg-muted/20" />
                    <div className="h-9 w-4/5 animate-pulse rounded-full bg-muted/20" />
                    <div className="h-3 w-full animate-pulse rounded-full bg-muted/10" />
                    <div className="h-3 w-3/4 animate-pulse rounded-full bg-muted/10" />
                    <div className="h-14 w-2/3 animate-pulse rounded-full bg-muted/20" />
                </div>
            </div>
        </>
    );
}
