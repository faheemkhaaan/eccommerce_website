"use server";

import { createClient } from "@/lib/supabase/server";
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "Sign in before placing an order." };

    // Cash on Delivery is only deliverable if the rider can ring the number on the parcel,
    // so the order goes through only from a number the account confirmed by SMS.
    if (!user.phone_confirmed_at)
        return { ok: false, message: "Verify your mobile number before placing the order." };
    if (user.phone !== recipient.phone)
        return { ok: false, message: "Use the mobile number you verified to place this order." };

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
