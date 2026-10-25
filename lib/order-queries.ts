import "server-only";

import { publicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/roles";
import type {
    Order,
    OrderEvent,
    OrderItem,
    OrderRecord,
    OrderStatus,
    OrderSummary,
    TrackedOrder,
} from "@/lib/orders";
import { ORDER_STATUSES } from "@/lib/orders";

export type StaffUser = {
    userId: string;
    email: string;
    role: "customer" | "admin" | "driver";
    joinedAt: string;
};

export type DriverOption = { id: string; email: string };

type ItemRow = {
    name: string;
    pack_label: string;
    qty: number;
    price: number | string;
    image: string | null;
    sort_order?: number;
};

type EventRow = {
    status: OrderStatus | null;
    note: string | null;
    created_at: string;
};

type OrderRow = {
    id: string;
    status: OrderStatus;
    placed_at: string;
    eta_at: string | null;
    customer_name: string;
    customer_phone: string;
    city: string;
    address: string;
    notes: string | null;
    subtotal: number | string;
    shipping: number | string;
    total: number | string;
    driver_id: string | null;
    order_items?: ItemRow[] | null;
    order_events?: EventRow[] | null;
};

const SUMMARY_COLS =
    "id, status, placed_at, eta_at, customer_name, customer_phone, city, address, notes, subtotal, shipping, total, driver_id";

const DETAIL_COLS = `${SUMMARY_COLS}, order_items (name, pack_label, qty, price, image, sort_order), order_events (status, note, created_at)`;

const asStatus = (v: unknown): OrderStatus =>
    ORDER_STATUSES.includes(v as OrderStatus) ? (v as OrderStatus) : "pending";

const moneyN = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

const iso = (v: unknown) => (typeof v === "string" ? v : v ? String(v) : "");

function toItems(rows: ItemRow[] | null | undefined): OrderItem[] {
    return [...(rows ?? [])]
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((i) => ({
            name: i.name,
            options: [i.pack_label],
            qty: Number(i.qty) || 0,
            price: moneyN(i.price),
            image: i.image ?? "",
        }));
}

function toEvents(rows: EventRow[] | null | undefined): OrderEvent[] {
    return [...(rows ?? [])]
        .sort((a, b) => iso(a.created_at).localeCompare(iso(b.created_at)))
        .map((e) => ({
            status: e.status,
            note: e.note,
            at: iso(e.created_at),
        }));
}

function toSummary(row: OrderRow): OrderSummary {
    return {
        id: row.id,
        status: asStatus(row.status),
        placedAt: iso(row.placed_at),
        eta: row.eta_at ? iso(row.eta_at) : null,
        customerName: row.customer_name,
        phone: row.customer_phone,
        city: row.city,
        address: row.address,
        notes: row.notes ?? "",
        total: moneyN(row.total),
        driverId: row.driver_id,
    };
}

function toRecord(row: OrderRow): OrderRecord {
    return {
        id: row.id,
        status: asStatus(row.status),
        placedAt: iso(row.placed_at),
        eta: row.eta_at ? iso(row.eta_at) : null,
        recipient: {
            name: row.customer_name,
            phone: row.customer_phone,
            city: row.city,
            address: row.address,
            notes: row.notes ?? "",
        },
        items: toItems(row.order_items),
        totals: {
            subtotal: moneyN(row.subtotal),
            shipping: moneyN(row.shipping),
            total: moneyN(row.total),
        },
        driverId: row.driver_id,
        events: toEvents(row.order_events),
    };
}

export function parsePlacedOrder(raw: unknown): Order | null {
    if (!raw || typeof raw !== "object") return null;
    const o = raw as Record<string, unknown>;
    const recipient = (o.recipient ?? {}) as Record<string, unknown>;
    const totals = (o.totals ?? {}) as Record<string, unknown>;
    const items = Array.isArray(o.items) ? o.items : [];
    const id = typeof o.id === "string" ? o.id : "";
    if (!id) return null;

    return {
        id,
        placedAt: iso(o.placedAt),
        eta: iso(o.eta),
        recipient: {
            name: String(recipient.name ?? ""),
            phone: String(recipient.phone ?? ""),
            city: String(recipient.city ?? ""),
            address: String(recipient.address ?? ""),
            notes: String(recipient.notes ?? ""),
        },
        items: items.map((item) => {
            const i = (item ?? {}) as Record<string, unknown>;
            return {
                name: String(i.name ?? ""),
                options: Array.isArray(i.options) ? i.options.map(String) : [],
                qty: Number(i.qty) || 0,
                price: moneyN(i.price),
                image: String(i.image ?? ""),
            };
        }),
        totals: {
            subtotal: moneyN(totals.subtotal),
            shipping: moneyN(totals.shipping),
            total: moneyN(totals.total),
        },
    };
}

function parseTracked(raw: unknown): TrackedOrder | null {
    if (!raw || typeof raw !== "object") return null;
    const o = raw as Record<string, unknown>;
    const totals = (o.totals ?? {}) as Record<string, unknown>;
    const items = Array.isArray(o.items) ? o.items : [];
    const events = Array.isArray(o.events) ? o.events : [];
    const id = typeof o.id === "string" ? o.id : "";
    if (!id) return null;

    return {
        id,
        status: asStatus(o.status),
        placedAt: iso(o.placedAt),
        eta: o.eta ? iso(o.eta) : null,
        city: String(o.city ?? ""),
        name: String(o.name ?? ""),
        phoneTail: String(o.phoneTail ?? ""),
        totals: {
            subtotal: moneyN(totals.subtotal),
            shipping: moneyN(totals.shipping),
            total: moneyN(totals.total),
        },
        items: items.map((item) => {
            const i = (item ?? {}) as Record<string, unknown>;
            return {
                name: String(i.name ?? ""),
                options: Array.isArray(i.options) ? i.options.map(String) : [],
                qty: Number(i.qty) || 0,
                price: moneyN(i.price),
                image: String(i.image ?? ""),
            };
        }),
        events: events.map((event) => {
            const e = (event ?? {}) as Record<string, unknown>;
            return {
                status: e.status ? asStatus(e.status) : null,
                note: typeof e.note === "string" ? e.note : null,
                at: iso(e.at),
            };
        }),
    };
}

export async function trackOrderByQuery(query: string): Promise<TrackedOrder | null> {
    const { data, error } = await publicClient.rpc("track_order", { p_query: query.trim() });
    if (error) throw error;
    return parseTracked(data);
}

export async function listBoardOrders(): Promise<OrderSummary[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("orders")
        .select(SUMMARY_COLS)
        .order("placed_at", { ascending: false });

    if (error) throw error;
    return ((data ?? []) as OrderRow[]).map(toSummary);
}

export async function listMyOrders(): Promise<OrderRecord[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("orders")
        .select(DETAIL_COLS)
        .eq("user_id", user.userId)
        .order("placed_at", { ascending: false });

    if (error) throw error;
    return ((data ?? []) as OrderRow[]).map(toRecord);
}

export async function listDriverOrders(): Promise<OrderRecord[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("orders")
        .select(DETAIL_COLS)
        .eq("driver_id", user.userId)
        .order("placed_at", { ascending: false });

    if (error) throw error;
    return ((data ?? []) as OrderRow[]).map(toRecord);
}

export async function getOrder(id: string): Promise<OrderRecord | null> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("orders").select(DETAIL_COLS).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? toRecord(data as OrderRow) : null;
}

export async function listStaffUsers(query?: string): Promise<StaffUser[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("list_users_with_roles", {
        p_query: query?.trim() || null,
    });
    if (error) throw error;

    return ((data ?? []) as { user_id: string; email: string | null; role: StaffUser["role"]; joined_at: string }[]).map(
        (u) => ({
            userId: u.user_id,
            email: u.email ?? "",
            role: u.role ?? "customer",
            joinedAt: iso(u.joined_at),
        }),
    );
}

export async function listDrivers(): Promise<DriverOption[]> {
    const users = await listStaffUsers();
    return users.filter((u) => u.role === "driver").map((u) => ({ id: u.userId, email: u.email || u.userId }));
}
