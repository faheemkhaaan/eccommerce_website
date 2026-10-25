"use server";

import { redirect } from "next/navigation";
import { assertRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";

const text = (v: FormDataEntryValue | null) => String(v ?? "").trim();

function back(path: string, status: string): never {
    redirect(`${path}?status=${status}`);
}

function rpcStatus(message?: string) {
    const m = (message ?? "").toLowerCase();
    if (m.includes("not a rider")) return "not-a-rider";
    if (m.includes("already closed")) return "closed";
    if (m.includes("not authorised") || m.includes("not authorized")) return "denied";
    if (m.includes("no such")) return "missing";
    return "invalid";
}

export async function setOrderStatus(formData: FormData) {
    await assertRole("admin");

    const id = text(formData.get("order_id"));
    const status = text(formData.get("status")) as OrderStatus;
    const note = text(formData.get("note"));
    const path = text(formData.get("next")) || `/admin/orders/${id}`;

    if (!id || !ORDER_STATUSES.includes(status)) back(path, "invalid");

    const supabase = await createClient();
    const { error } = await supabase.rpc("set_order_status", {
        p_order_id: id,
        p_status: status,
        p_note: note || null,
    });

    if (error) back(path, rpcStatus(error.message));
    back(path, "status-updated");
}

export async function assignDriver(formData: FormData) {
    await assertRole("admin");

    const id = text(formData.get("order_id"));
    const driverId = text(formData.get("driver_id"));
    const path = text(formData.get("next")) || `/admin/orders/${id}`;

    if (!id) back(path, "invalid");

    const supabase = await createClient();
    const { error } = await supabase.rpc("assign_driver", {
        p_order_id: id,
        p_driver_id: driverId || null,
    });

    if (error) back(path, rpcStatus(error.message));
    back(path, driverId ? "assigned" : "unassigned");
}
