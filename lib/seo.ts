import type { ReviewSummary } from "@/lib/reviews";

/**
 * The site's canonical origin, used for sitemap entries and structured data.
 *
 * Set NEXT_PUBLIC_SITE_URL in production and previews; otherwise Vercel supplies
 * its own host, and local development falls back to localhost. Trailing slashes
 * are stripped so `absolute()` never produces a double slash.
 */
export const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : undefined) ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    "http://localhost:3000"
).replace(/\/+$/, "");

/** Turns an app path into the absolute URL search engines and rich results need. */
export const absolute = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export type ProductSchema = {
    name: string;
    description: string;
    /** Absolute image URLs; the first is treated as the main one. */
    images: string[];
    /** The product id doubles as the SKU. */
    sku: string;
    priceFrom: number;
    priceTo: number;
    packCount: number;
    inStock: boolean;
    /** Omitted from the markup entirely when there are no reviews yet. */
    rating: ReviewSummary;
};

const AVAILABILITY = {
    in: "https://schema.org/InStock",
    out: "https://schema.org/OutOfStock",
} as const;

/**
 * Product structured data for the detail page.
 *
 * `aggregateRating` only appears once real reviews exist — Google penalises a
 * rating with nothing behind it, and a product with no reviews is simply a
 * product, not an error.
 */
export function productSchema(p: ProductSchema) {
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        description: p.description,
        sku: p.sku,
        image: p.images,
        ...(p.rating.count > 0
            ? {
                aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: p.rating.average,
                    reviewCount: p.rating.count,
                    bestRating: 5,
                    worstRating: 1,
                },
            }
            : {}),
        offers: {
            "@type": "AggregateOffer",
            priceCurrency: "PKR",
            lowPrice: p.priceFrom,
            highPrice: p.priceTo,
            offerCount: p.packCount,
            availability: p.inStock ? AVAILABILITY.in : AVAILABILITY.out,
            url: absolute(`/products/${p.sku}`),
        },
    };
}
