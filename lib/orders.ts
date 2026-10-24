// Prototype order store.
//
// Orders are kept in localStorage on the device that placed them, so the checkout →
// tracking demo works with no backend. Swap `readOrders`/`saveOrder` for Supabase
// tables when the real order pipeline lands — the Order shape is what the pages use.

import { images } from "@/lib/images";

export type OrderItem = {
    name: string;
    options: string[];
    qty: number;
    price: number;
    image: string;
};

export type Totals = {
    subtotal: number;
    shipping: number;
    total: number;
};

export type Recipient = {
    name: string;
    phone: string;
    city: string;
    address: string;
    notes: string;
};

export type Order = {
    id: string;
    placedAt: string; // ISO
    eta: string; // ISO
    recipient: Recipient;
    items: OrderItem[];
    totals: Totals;
};

export type StepState = "done" | "current" | "next";
export type TrackingStep = {
    title: string;
    place: string;
    detail: string;
    at: string; // ISO, empty until the step is reached
    state: StepState;
};

const STORAGE_KEY = "organic-ghee-orders-v1";
const MAX_STORED = 20;
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 — read out over the phone

// Prototype pacing: the parcel visibly moves a few minutes after checkout so the
// demo shows progress. Replace with status updates from the courier.
const STEP_MINUTES = [0, 1, 3, 6, 12];
const ETA_HOURS = 48;

export const DEMO_ORDER_ID = "OG-DEMO24";

export function makeOrderId(): string {
    let out = "";
    for (let i = 0; i < 6; i++) out += CHARS[Math.floor(Math.random() * CHARS.length)];
    return `OG-${out}`;
}

export const etaFrom = (placedAt: string) =>
    new Date(new Date(placedAt).getTime() + ETA_HOURS * 3_600_000).toISOString();

export function readOrders(): Order[] {
    if (typeof window === "undefined") return [];
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
        return Array.isArray(parsed) ? (parsed as Order[]) : [];
    } catch {
        return [];
    }
}

export function saveOrder(order: Order): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...readOrders()].slice(0, MAX_STORED)));
    } catch {
        /* private mode / quota — the confirmation screen still works */
    }
}

const lastDigits = (s: string) => s.replace(/\D/g, "").slice(-7);

/** Looks up a stored order by Order ID, or by the phone number it was placed with. */
export function findOrder(query: string, now = Date.now()): Order | null {
    const q = query.trim();
    if (!q) return null;
    const digits = q.replace(/\D/g, "");
    const byPhone = digits.length >= 7 ? lastDigits(digits) : "";

    const match = (o: Order) =>
        o.id.toUpperCase() === q.toUpperCase() || (!!byPhone && lastDigits(o.recipient.phone) === byPhone);

    const demo = demoOrder(now);
    return readOrders().find(match) ?? (match(demo) ? demo : null);
}

/** A ready-made parcel so the tracking page can be demonstrated without checking out first. */
export function demoOrder(now = Date.now()): Order {
    const placedAt = new Date(now - 8 * 60_000).toISOString();
    return {
        id: DEMO_ORDER_ID,
        placedAt,
        eta: etaFrom(placedAt),
        recipient: {
            name: "Ayla Shireen",
            phone: "+92 300 1234567",
            city: "Lahore",
            address: "House 24, Street 7, Gulberg III, near Liberty Market",
            notes: "Ring the bell twice.",
        },
        items: [
            {
                name: "Bilona Organic Ghee",
                options: ["1 kg"],
                qty: 1,
                price: 3250,
                image: images.jar1kg,
            },
        ],
        totals: { subtotal: 3250, shipping: 0, total: 3250 },
    };
}

function route(order: Order) {
    const city = order.recipient.city || "Lahore";
    return [
        {
            title: "Order confirmed",
            place: "Organic Ghee — Gulberg III, Lahore",
            detail: "COD order received and confirmed by our team.",
        },
        {
            title: "Packed & sealed",
            place: "Dairy Fulfilment Centre — Sundar Estate, Lahore",
            detail: "Jar hand-checked, sealed and boxed for transit.",
        },
        {
            title: "In transit",
            place: `Courier sort facility — ${city}`,
            detail: `Scanned and loaded onto the line-haul to ${city}.`,
        },
        {
            title: "Out for delivery",
            place: `Local delivery station — ${city}`,
            detail: "Assigned to a rider. Please keep this phone reachable.",
        },
        {
            title: "Delivered",
            place: `${city} — delivery address`,
            detail: "Handed over and paid in cash. Thank you.",
        },
    ];
}

function stageIndex(placedAt: string, now: number): number {
    const mins = (now - new Date(placedAt).getTime()) / 60_000;
    let idx = 0;
    STEP_MINUTES.forEach((m, i) => {
        if (mins >= m) idx = i;
    });
    return idx;
}

export function buildTracking(order: Order, now = Date.now()): TrackingStep[] {
    const placed = new Date(order.placedAt).getTime();
    const idx = stageIndex(order.placedAt, now);
    return route(order).map((s, i) => ({
        ...s,
        at: i <= idx ? new Date(placed + STEP_MINUTES[i] * 60_000).toISOString() : "",
        state: i < idx ? "done" : i === idx ? "current" : "next",
    }));
}

export const currentStep = (steps: TrackingStep[]) => steps.find((s) => s.state === "current") ?? steps[0];

export const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export const fmtDay = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
