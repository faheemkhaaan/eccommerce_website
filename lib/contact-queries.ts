import "server-only";

import type { ContactTopic } from "@/lib/contact";
import { createClient } from "@/lib/supabase/server";

export type ContactMessage = {
    id: string;
    /** Null when a guest wrote in. */
    userId: string | null;
    /** Order ID as the customer typed it — not necessarily one of ours. */
    orderRef: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    topic: ContactTopic;
    body: string;
    status: "new" | "handled";
    createdAt: string;
    handledAt: string | null;
};

type MessageRow = {
    id: string;
    user_id: string | null;
    order_ref: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    topic: ContactTopic;
    body: string;
    status: "new" | "handled";
    created_at: string;
    handled_at: string | null;
};

const COLUMNS = "id, user_id, order_ref, name, email, phone, topic, body, status, created_at, handled_at";

const toMessage = (row: MessageRow): ContactMessage => ({
    id: row.id,
    userId: row.user_id,
    orderRef: row.order_ref,
    name: row.name,
    email: row.email,
    phone: row.phone,
    topic: row.topic,
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
    handledAt: row.handled_at,
});

/**
 * The staff inbox, unhandled first.
 *
 * Deliberately uncached and read with the session client: RLS is what keeps the
 * queue to admins, and a cached read would have to bypass it. Nothing on the
 * storefront reads this table, so there is no tag to invalidate when a message
 * is handled.
 */
export async function listMessageQueue(): Promise<ContactMessage[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("contact_messages")
        .select(COLUMNS)
        // `handled` sorts after `new`, which is the order staff want to read in.
        .order("status", { ascending: true })
        .order("created_at", { ascending: false });

    if (error) throw new Error(`Could not load the inbox: ${error.message}`);

    return (data as unknown as MessageRow[]).map(toMessage);
}
