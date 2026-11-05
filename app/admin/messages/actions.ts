"use server";

import { redirect } from "next/navigation";
import { assertRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

const PATH = "/admin/messages";
const text = (value: FormDataEntryValue | null) => String(value ?? "").trim();

/**
 * Marks a customer message as dealt with.
 *
 * Unlike the catalogue and review actions this invalidates no cache: nothing on
 * the storefront reads `contact_messages`, and the inbox itself is uncached, so
 * the redirect alone shows the new state.
 */
export async function markHandled(formData: FormData) {
    await assertRole("admin");

    const id = text(formData.get("id"));
    if (!id) redirect(`${PATH}?status=message-missing`);

    const supabase = await createClient();
    const { error } = await supabase
        .from("contact_messages")
        .update({ status: "handled", handled_at: new Date().toISOString() })
        .eq("id", id);

    if (error) redirect(`${PATH}?status=denied`);
    redirect(`${PATH}?status=message-handled`);
}

/** Clears a message out of the inbox once it has been answered. */
export async function deleteMessage(formData: FormData) {
    await assertRole("admin");

    const id = text(formData.get("id"));
    if (!id) redirect(`${PATH}?status=message-missing`);

    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);

    if (error) redirect(`${PATH}?status=denied`);
    redirect(`${PATH}?status=message-removed`);
}
