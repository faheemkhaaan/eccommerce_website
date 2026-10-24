import "server-only";
import { createClient } from "@/lib/supabase/server";

// The staff view of the catalogue. Unlike lib/catalogue.ts this is deliberately
// uncached and uses the session-bound client, because it has to show inactive
// products and the exact stock figures rather than a shared cached snapshot.
// RLS is what makes that safe: anon callers simply get the live rows back.

export type AdminPack = {
    id: string;
    label: string;
    grams: number;
    price: number;
    note: string | null;
    stock: number;
    sort_order: number;
};

export type AdminProduct = {
    id: string;
    name: string;
    short: string;
    image: string;
    badge: string | null;
    sort_order: number;
    is_active: boolean;
    packs: AdminPack[];
};

type PackRow = Omit<AdminPack, "price"> & { price: number | string };

type ProductRow = Omit<AdminProduct, "packs"> & { product_packs: PackRow[] | null };

const COLUMNS =
    "id, name, short, image, badge, sort_order, is_active, product_packs (id, label, grams, price, note, stock, sort_order)";

function toProduct(row: ProductRow): AdminProduct {
    return {
        ...row,
        packs: [...(row.product_packs ?? [])]
            .sort((a, b) => a.sort_order - b.sort_order || a.grams - b.grams)
            // PostgREST returns numeric as a string, so coerce before any arithmetic.
            .map((k) => ({ ...k, price: Number(k.price) })),
    };
}

export async function listProducts(): Promise<AdminProduct[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("products")
        .select(COLUMNS)
        .order("sort_order")
        .order("sort_order", { referencedTable: "product_packs" });

    if (error) throw new Error(`Could not load products: ${error.message}`);

    return (data as unknown as ProductRow[]).map(toProduct);
}

export async function getProduct(id: string): Promise<AdminProduct | undefined> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("products")
        .select(COLUMNS)
        .eq("id", id)
        .maybeSingle();

    if (error) throw new Error(`Could not load ${id}: ${error.message}`);

    return data ? toProduct(data as unknown as ProductRow) : undefined;
}
