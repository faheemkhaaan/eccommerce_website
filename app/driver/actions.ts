"use server";

import { redirect } from "next/navigation";
import { assertRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { DRIVER_STATUSES, type OrderStatus } from "@/lib/orders";

const text = (v: FormDataEntryValue | null) => String(v ?? "").trim();

function back(path: string, status: string): never {
    redirect(`${path}?status=${status}`);
}

export async function reportDelivery(formData: FormData) {
    await assertRole("driver");

    const id = text(formData.get("order_id"));
    const status = text(formData.get("status")) as OrderStatus;
    const note = text(formData.get("note"));
    const path = text(formData.get("next")) || "/driver";

    if (!id || !DRIVER_STATUSES.includes(status)) back(path, "invalid");

    const supabase = await createClient();
    const { error } = await supabase.rpc("set_order_status", {
        p_order_id: id,
        p_status: status,
        p_note: note || null,
    });

    if (error) {
        const m = (error.message ?? "").toLowerCase();
        if (m.includes("already closed")) back(path, "closed");
        if (m.includes("not authorised") || m.includes("not authorized")) back(path, "denied");
        back(path, "invalid");
    }

    back(path, "status-updated");
}

export async function signOutDriver() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}
