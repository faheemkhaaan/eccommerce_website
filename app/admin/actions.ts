"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CATALOGUE_TAG } from "@/lib/catalogue";
import { assertRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

// Every action authorises itself before it touches the database. proxy.ts and the
// admin layout only decide what a person can reach; this decides what they can
// change, and the RLS policies on products/product_packs are the last line — a
// signed-in customer posting to these endpoints writes nothing.
//
// Each action finishes by redirecting back to the page that posted it with a
// ?status= flag, so the dashboard can report the outcome without any client JS.

const text = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const int = (v: FormDataEntryValue | null) => Number.parseInt(String(v ?? ""), 10);
const num = (v: FormDataEntryValue | null) => Number.parseFloat(String(v ?? ""));

/** Postgres unique_violation, raised by the (product_id, label) constraint. */
const isDuplicate = (code?: string) => code === "23505";

function back(path: string, status: string): never {
    redirect(`${path}?status=${status}`);
}

export async function saveProduct(formData: FormData) {
    await assertRole("admin");

    const id = text(formData.get("id"));
    const path = `/admin/products/${id}`;

    const name = text(formData.get("name"));
    const short = text(formData.get("short"));
    const image = text(formData.get("image"));
    const badge = text(formData.get("badge"));
    const sortOrder = int(formData.get("sort_order"));

    if (!id || !name || !short || !image || !Number.isFinite(sortOrder)) back(path, "invalid");

    const supabase = await createClient();
    const { error } = await supabase
        .from("products")
        .update({
            name,
            short,
            image,
            badge: badge || null,
            sort_order: sortOrder,
            // An unchecked box sends nothing at all.
            is_active: formData.get("is_active") === "on",
        })
        .eq("id", id);

    if (error) back(path, "invalid");

    updateTag(CATALOGUE_TAG);
    back(path, "saved");
}

export async function savePack(formData: FormData) {
    await assertRole("admin");

    const id = text(formData.get("id"));
    const productId = text(formData.get("product_id"));
    const path = `/admin/products/${productId}`;

    const label = text(formData.get("label"));
    const grams = int(formData.get("grams"));
    const price = num(formData.get("price"));
    const stock = int(formData.get("stock"));
    const note = text(formData.get("note"));

    if (!id || !productId || !label) back(path, "invalid");
    if (!Number.isFinite(grams) || grams <= 0) back(path, "invalid");
    if (!Number.isFinite(price) || price < 0) back(path, "invalid");
    if (!Number.isFinite(stock) || stock < 0) back(path, "invalid");

    const supabase = await createClient();
    const { error } = await supabase
        .from("product_packs")
        .update({ label, grams, price, stock, note: note || null })
        .eq("id", id)
        .eq("product_id", productId);

    if (error) back(path, isDuplicate(error.code) ? "duplicate" : "invalid");

    updateTag(CATALOGUE_TAG);
    back(path, "saved");
}

export async function createPack(formData: FormData) {
    await assertRole("admin");

    const productId = text(formData.get("product_id"));
    const path = `/admin/products/${productId}`;

    const label = text(formData.get("label"));
    const grams = int(formData.get("grams"));
    const price = num(formData.get("price"));
    const stock = int(formData.get("stock"));
    const note = text(formData.get("note"));

    if (!productId || !label) back(path, "invalid");
    if (!Number.isFinite(grams) || grams <= 0) back(path, "invalid");
    if (!Number.isFinite(price) || price < 0) back(path, "invalid");
    if (!Number.isFinite(stock) || stock < 0) back(path, "invalid");

    const supabase = await createClient();

    // Append after the existing packs so the shop keeps its small-to-large order.
    const { data: last } = await supabase
        .from("product_packs")
        .select("sort_order")
        .eq("product_id", productId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

    const { error } = await supabase.from("product_packs").insert({
        product_id: productId,
        label,
        grams,
        price,
        stock,
        note: note || null,
        sort_order: (last?.sort_order ?? -1) + 1,
    });

    if (error) back(path, isDuplicate(error.code) ? "duplicate" : "invalid");

    updateTag(CATALOGUE_TAG);
    back(path, "created");
}

export async function saveStock(formData: FormData) {
    await assertRole("admin");

    const id = text(formData.get("id"));
    const stock = int(formData.get("stock"));

    if (!id || !Number.isFinite(stock) || stock < 0) back("/admin/products", "invalid");

    const supabase = await createClient();
    const { error } = await supabase.from("product_packs").update({ stock }).eq("id", id);

    if (error) back("/admin/products", "invalid");

    updateTag(CATALOGUE_TAG);
    back("/admin/products", "saved");
}

export async function deletePack(formData: FormData) {
    await assertRole("admin");

    const id = text(formData.get("id"));
    const productId = text(formData.get("product_id"));
    const path = `/admin/products/${productId}`;

    if (!id || !productId) back(path, "invalid");

    const supabase = await createClient();
    const { error } = await supabase
        .from("product_packs")
        .delete()
        .eq("id", id)
        .eq("product_id", productId);

    if (error) back(path, "invalid");

    updateTag(CATALOGUE_TAG);
    back(path, "deleted");
}

export async function signOut() {
    const supabase = await createClient();
    // Safe here, unlike in a Server Component: actions may write cookies.
    await supabase.auth.signOut();
    redirect("/login");
}
