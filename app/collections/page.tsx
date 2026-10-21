import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MotionProvider } from "@/components/Motion";
import { PRODUCTS } from "@/lib/products";
import CollectionHero from "@/components/CollectionHero";
import Catalog from "@/components/Catalog";
import Provenance from "@/components/Provenance";

export const metadata: Metadata = { title: "The Spring Wardrobe — ÉPURE Atelier" };

type Props = {
    searchParams: Promise<{ category?: string; material?: string; badge?: string }>;
};

export default function CollectionPage({ searchParams }: Props) {
    return (
        <MotionProvider>
            <Header variant="solid" active="Apparel" />
            <main>
                <CollectionHero count={PRODUCTS.length} />
                {/* Reading searchParams needs a Suspense boundary while the page is prerendered */}
                <Suspense fallback={<div className="wrap h-100 animate-pulse rounded-[2rem] bg-muted/10" />}>
                    <ResolvedCatalog searchParams={searchParams} />
                </Suspense>
                <Provenance />
            </main>
            <Footer />
        </MotionProvider>
    );
}

// Helper async component so the header's facets can seed the catalogue on first render
async function ResolvedCatalog({ searchParams }: Props) {
    const { category, material, badge } = await searchParams;
    // Header links arrive as query params; the key restarts the filters when they change.
    return (
        <Catalog
            key={`${category ?? ""}|${material ?? ""}|${badge ?? ""}`}
            initialCategory={category}
            initialMaterial={material}
            initialBadge={badge}
        />
    );
}
