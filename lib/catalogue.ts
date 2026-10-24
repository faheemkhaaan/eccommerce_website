import "server-only";
import { cacheTag } from "next/cache";
import { publicClient } from "@/lib/supabase/public";

/** Invalidate this after any write to products or product_packs. */
export const CATALOGUE_TAG = "catalogue";

export type Pack = {
    label: string;
    grams: number;
    price: number;
    note?: string;
    stock: number;
};

export type CatalogueProduct = {
    id: string;
    name: string;
    short: string;
    image: string;
    badge?: string;
    /** Cheapest pack, so listings can say "from Rs X". */
    fromPrice: number;
    packs: Pack[];
};

type PackRow = {
    label: string;
    grams: number;
    price: number | string;
    note: string | null;
    stock: number;
    sort_order: number;
};

type ProductRow = {
    id: string;
    name: string;
    short: string;
    image: string;
    badge: string | null;
    product_packs: PackRow[] | null;
};

const COLUMNS = "id, name, short, image, badge, product_packs (label, grams, price, note, stock, sort_order)";

function toProduct(row: ProductRow): CatalogueProduct {
    const packs: Pack[] = [...(row.product_packs ?? [])]
        .sort((a, b) => a.sort_order - b.sort_order || a.grams - b.grams)
        .map((k) => ({
            label: k.label,
            grams: k.grams,
            // PostgREST returns numeric as a string, so coerce before any arithmetic.
            price: Number(k.price),
            note: k.note ?? undefined,
            stock: k.stock,
        }));

    return {
        id: row.id,
        name: row.name,
        short: row.short,
        image: row.image,
        badge: row.badge ?? undefined,
        fromPrice: packs.length ? Math.min(...packs.map((k) => k.price)) : 0,
        packs,
    };
}

/**
 * The live catalogue. Cached and tagged, so the storefront keeps its prerendered
 * shell and an admin save just calls revalidateTag(CATALOGUE_TAG, 'max').
 */
export async function getCatalogue(): Promise<CatalogueProduct[]> {
    "use cache";
    cacheTag(CATALOGUE_TAG);

    const { data, error } = await publicClient
        .from("products")
        .select(COLUMNS)
        .eq("is_active", true)
        .order("sort_order")
        .order("sort_order", { referencedTable: "product_packs" });

    if (error) throw new Error(`Could not load the catalogue: ${error.message}`);

    return (data as unknown as ProductRow[]).map(toProduct);
}

export async function getCatalogueProduct(id: string): Promise<CatalogueProduct | undefined> {
    const all = await getCatalogue();
    return all.find((p) => p.id === id);
}
