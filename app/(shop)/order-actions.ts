"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/roles";
import { parsePlacedOrder, trackOrderByQuery } from "@/lib/order-queries";
import type { Order, TrackedOrder } from "@/lib/orders";

export type PlaceItem = { product_id: string; label: string; qty: number };
export type PlaceRecipient = {
    name: string;
    phone: string;
    city: string;
    address: string;
    notes: string;
};

export type PlaceResult =
    | { ok: true; order: Order }
    | { ok: false; message: string };

export async function placeOrder(items: PlaceItem[], recipient: PlaceRecipient): Promise<PlaceResult> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, message: "Sign in before placing an order." };

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("create_order", {
        p_items: items,
        p_recipient: recipient,
    });

    if (error) return { ok: false, message: error.message || "Could not place the order." };

    const order = parsePlacedOrder(data);
    if (!order) return { ok: false, message: "The order was created but the confirmation could not be read." };
    return { ok: true, order };
}

export async function lookupTrackedOrder(query: string): Promise<TrackedOrder | null> {
    const q = query.trim();
    if (q.length < 4) return null;
    return trackOrderByQuery(q);
}
