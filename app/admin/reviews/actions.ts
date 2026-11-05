"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { REVIEWS_TAG } from "@/lib/review-queries";
import { assertRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

const PATH = "/admin/reviews";
const text = (v: FormDataEntryValue | null) => String(v ?? "").trim();

/**
 * Puts a review on the product page.
 *
 * Publishing is what changes what shoppers see, so it is also what invalidates
 * the cached review list — the same tag the storefront read is built on.
 */
export async function approveReview(formData: FormData) {
    await assertRole("admin");

    const id = text(formData.get("id"));
    if (!id) redirect(`${PATH}?status=missing`);

    const supabase = await createClient();
    const { error } = await supabase
        .from("product_reviews")
        .update({ status: "published", published_at: new Date().toISOString() })
        .eq("id", id);

    if (error) redirect(`${PATH}?status=denied`);

    updateTag(REVIEWS_TAG);
    redirect(`${PATH}?status=review-published`);
}

/**
 * Rejects a review by deleting it — which is also the only way a customer gets a
 * second attempt, since one review per product is a uniqueness constraint rather
 * than something the UI enforces.
 */
export async function removeReview(formData: FormData) {
    await assertRole("admin");

    const id = text(formData.get("id"));
    if (!id) redirect(`${PATH}?status=missing`);

    const supabase = await createClient();
    const { error } = await supabase.from("product_reviews").delete().eq("id", id);

    if (error) redirect(`${PATH}?status=denied`);

    updateTag(REVIEWS_TAG);
    redirect(`${PATH}?status=review-removed`);
}
