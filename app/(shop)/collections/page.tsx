import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MotionProvider } from "@/components/Motion";
import { getCatalogue } from "@/lib/catalogue";
import CollectionHero from "@/components/CollectionHero";
import Catalog from "@/components/Catalog";
import Provenance from "@/components/Provenance";

export const metadata: Metadata = {
    title: "Shop — Organic Ghee",
    description: "Bilona organic ghee in 500 g, 1 kg, 2 kg and 5 kg packs. Cash on delivery across Pakistan.",
};

export default async function CollectionPage() {
    const products = await getCatalogue();

    return (
        <MotionProvider>
            <Header variant="solid" active="Shop" />
            <main>
                <CollectionHero count={products.length} />
                <Catalog products={products} />
                <Provenance />
            </main>
            <Footer />
        </MotionProvider>
    );
}
