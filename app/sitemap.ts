import type { MetadataRoute } from "next";
import { allDetailIds } from "@/lib/product-details";
import { absolute } from "@/lib/seo";

/**
 * The pages worth indexing: the storefront plus one entry per product. Signed-in
 * and staff surfaces are left out on purpose — they are also disallowed in
 * robots.ts, since half of them would redirect a crawler to /login anyway.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const products = await allDetailIds();

    return [
        { url: absolute("/"), changeFrequency: "weekly", priority: 1 },
        { url: absolute("/collections"), changeFrequency: "weekly", priority: 0.8 },
        ...products.map((p) => ({
            url: absolute(`/products/${p.id}`),
            changeFrequency: "weekly" as const,
            priority: 0.9,
        })),
        { url: absolute("/contact"), changeFrequency: "yearly", priority: 0.5 },
        { url: absolute("/track-order"), changeFrequency: "monthly", priority: 0.3 },
    ];
}
