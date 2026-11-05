"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CATALOGUE_TAG } from "@/lib/catalogue";
import { PRODUCT_IMAGE_BUCKET, productImageUrl, type ImageResult } from "@/lib/product-images";
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

/** The product id doubles as the URL segment, so it has to survive a URL intact. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function createProduct(formData: FormData) {
    await assertRole("admin");

    const path = "/admin/products/new";
    const id = text(formData.get("id")).toLowerCase();
    const name = text(formData.get("name"));
    const short = text(formData.get("short"));
    const badge = text(formData.get("badge"));
    const sortOrder = int(formData.get("sort_order"));
    // The browser has already put the files in storage; the form only carries their keys.
    const paths = formData.getAll("image_paths").map(text).filter(Boolean);

    if (!SLUG.test(id) || !name || !short || paths.length === 0) back(path, "invalid");
    if (!Number.isFinite(sortOrder)) back(path, "invalid");

    const supabase = await createClient();
    const { error } = await supabase.from("products").insert({
        id,
        name,
        short,
        // The first photo becomes the cover, so the listing has an image from day one.
        image: productImageUrl(paths[0]),
        badge: badge || null,
        sort_order: sortOrder,
        // Off unless asked for: a product with no pack sizes yet has no price and
        // nothing to buy, so it should not reach the shop until it is ready.
        is_active: formData.get("is_active") === "on",
    });

    if (error) back(path, isDuplicate(error.code) ? "duplicate-product" : "invalid");

    const { error: imagesError } = await supabase
        .from("product_images")
        .insert(paths.map((p, i) => ({ product_id: id, path: p, sort_order: i })));

    if (imagesError) back(path, "invalid");

    updateTag(CATALOGUE_TAG);
    redirect(`/admin/products/${id}?status=product-created`);
}

export async function saveProduct(formData: FormData) {
    await assertRole("admin");

    const id = text(formData.get("id"));
    const path = `/admin/products/${id}`;

    const name = text(formData.get("name"));
    const short = text(formData.get("short"));
    const badge = text(formData.get("badge"));
    const sortOrder = int(formData.get("sort_order"));

    // Photos are not edited here — the gallery below the listing owns products.image.
    if (!id || !name || !short || !Number.isFinite(sortOrder)) back(path, "invalid");

    const supabase = await createClient();
    const { error } = await supabase
        .from("products")
        .update({
            name,
            short,
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

/**
 * Repoints `products.image` at the first gallery photo. Every storefront surface
 * reads that one column, so it has to follow the gallery order.
 */
async function syncCover(supabase: Awaited<ReturnType<typeof createClient>>, productId: string) {
    const { data } = await supabase
        .from("product_images")
        .select("path")
        .eq("product_id", productId)
        .order("sort_order")
        .limit(1)
        .maybeSingle();

    // An empty gallery keeps whatever cover the product already had, which is how a
    // product that has never been photographed still shows something.
    if (!data) return;

    await supabase.from("products").update({ image: productImageUrl(data.path) }).eq("id", productId);
}

/**
 * Records photos the browser has already uploaded. Only the object keys reach the
 * server, so the payload stays small however large the photos were — which is why
 * uploads go straight to storage instead of through this action.
 */
export async function addProductImages(productId: string, paths: string[]): Promise<ImageResult> {
    await assertRole("admin");

    if (!productId || paths.length === 0) return { ok: false, message: "Choose at least one photo." };

    const supabase = await createClient();

    // Append after the existing photos so the cover never jumps around.
    const { data: last } = await supabase
        .from("product_images")
        .select("sort_order")
        .eq("product_id", productId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

    const start = (last?.sort_order ?? -1) + 1;
    const { error } = await supabase
        .from("product_images")
        .insert(paths.map((path, i) => ({ product_id: productId, path, sort_order: start + i })));

    if (error) return { ok: false, message: "Those photos could not be saved. Please try again." };

    await syncCover(supabase, productId);
    updateTag(CATALOGUE_TAG);
    return { ok: true };
}

/** Drops a photo from the gallery and the file from storage. */
export async function removeProductImage(imageId: string): Promise<ImageResult> {
    await assertRole("admin");

    const supabase = await createClient();
    const { data: row } = await supabase
        .from("product_images")
        .select("product_id, path")
        .eq("id", imageId)
        .maybeSingle();

    if (!row) return { ok: false, message: "That photo is already gone." };

    // A product with no photo has nothing for the shop to show, so the last one stays.
    const { count } = await supabase
        .from("product_images")
        .select("id", { count: "exact", head: true })
        .eq("product_id", row.product_id);

    if ((count ?? 0) <= 1) {
        return { ok: false, message: "A product needs at least one photo. Upload a replacement first." };
    }

    // The file first: an orphaned row is easy to spot, an orphaned file is not.
    await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([row.path]);

    const { error } = await supabase.from("product_images").delete().eq("id", imageId);
    if (error) return { ok: false, message: "That photo could not be removed." };

    await syncCover(supabase, row.product_id);
    updateTag(CATALOGUE_TAG);
    return { ok: true };
}

/** Moves a photo to the front of the gallery, which is what makes it the cover. */
export async function setProductCover(imageId: string): Promise<ImageResult> {
    await assertRole("admin");

    const supabase = await createClient();
    const { data: row } = await supabase
        .from("product_images")
        .select("product_id")
        .eq("id", imageId)
        .maybeSingle();

    if (!row) return { ok: false, message: "That photo is gone." };

    const { data: first } = await supabase
        .from("product_images")
        .select("sort_order")
        .eq("product_id", row.product_id)
        .order("sort_order")
        .limit(1)
        .maybeSingle();

    const { error } = await supabase
        .from("product_images")
        .update({ sort_order: (first?.sort_order ?? 0) - 1 })
        .eq("id", imageId);

    if (error) return { ok: false, message: "The cover could not be changed." };

    await syncCover(supabase, row.product_id);
    updateTag(CATALOGUE_TAG);
    return { ok: true };
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
