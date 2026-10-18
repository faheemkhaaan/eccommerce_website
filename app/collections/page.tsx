import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MotionProvider } from "@/components/Motion";
// import CollectionHero from "@/components/collection/CollectionHero";
// import Catalog from "@/components/collection/Catalog";
// import Provenance from "@/components/collection/Provenance";
import { PRODUCTS } from "@/lib/products";
import CollectionHero from "@/components/CollectionHero";
import Catalog from "@/components/Catalog";
import Provenance from "@/components/Provenance";

export const metadata: Metadata = { title: "The Spring Wardrobe — ÉPURE Atelier" };

export default function CollectionPage() {
    return (
        <MotionProvider>
            <Header variant="solid" active="Apparel" />
            <main>
                <CollectionHero count={PRODUCTS.length} />
                <Catalog />
                <Provenance />
            </main>
            <Footer />
        </MotionProvider>
    );
}