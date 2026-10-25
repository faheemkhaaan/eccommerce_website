"use server";

import { redirect } from "next/navigation";
import { assertRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/roles";

const text = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const ROLES: AppRole[] = ["customer", "admin", "driver"];

function back(status: string, query = ""): never {
    const q = new URLSearchParams();
    q.set("status", status);
    if (query) q.set("q", query);
    redirect(`/admin/team?${q.toString()}`);
}

export async function grantRole(formData: FormData) {
    await assertRole("admin");

    const userId = text(formData.get("user_id"));
    const role = text(formData.get("role")) as AppRole;
    const query = text(formData.get("q"));

    if (!userId || !ROLES.includes(role)) back("invalid", query);

    const supabase = await createClient();
    const { error } = await supabase.rpc("grant_role", {
        p_user_id: userId,
        p_role: role,
    });

    if (error) {
        const m = (error.message ?? "").toLowerCase();
        if (m.includes("own admin")) back("self-demote", query);
        back("invalid", query);
    }

    back("role-granted", query);
}
