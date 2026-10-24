"use client";

import type { CatalogueProduct } from "@/lib/catalogue";
import ProductCard from "./ProductCard";

/**
 * One product today, so there is nothing to filter or sort yet. When the range
 * grows past a handful of items, this is where the facet bar comes back.
 */
export default function Catalog({ products }: { products: CatalogueProduct[] }) {
    return (
        <section className="wrap py-8 md:py-12">
            <p className="sr-only" aria-live="polite">{products.length} products available</p>

            <ul className="grid gap-x-5 gap-y-12 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                ))}
            </ul>
        </section>
    );
}
