"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { buildTracking, currentStep, type OrderRecord } from "@/lib/orders";
import { money } from "@/lib/cart-math";
import { ArrowIcon, BoxIcon, CheckIcon, MailIcon, TruckIcon } from "@/components/Icons";

const str = (x: unknown) => (typeof x === "string" ? x : "");

// Register stores E.164 (+923001234567); show the local format clients recognise.
const localPhone = (raw: unknown) => {
    const d = str(raw).replace(/\D/g, "");
    return d.startsWith("92") ? `0${d.slice(2)}` : d;
};

const fmtDay = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between gap-6 border-b border-line py-3 last:border-0">
            <dt className="label-sm shrink-0 text-[10px] text-muted">{label}</dt>
            <dd className="text-right text-sm">{value || "—"}</dd>
        </div>
    );
}

export default function AccountProfile({ orders }: { orders: OrderRecord[] }) {
    const user = useAuthStore((s) => s.user);
    const router = useRouter();

    const signOut = async () => {
        await createClient().auth.signOut(); // onAuthStateChange flips the store to "guest"
        router.push("/");
        router.refresh();
    };

    if (!user) return null;

    const m = (user.user_metadata ?? {}) as Record<string, unknown>;
    const name = str(m.full_name) || user.email || "Client";
    const city = str(m.city);
    const address = str(m.address);

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[6fr_6fr] lg:gap-8">
            <div className="space-y-4">
                {/* Identity */}
                <div className="rounded-[2rem] bg-white p-6 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="eyebrow text-accent">My account</p>
                            <h2 className="mt-3 font-serif text-2xl leading-tight">{name}</h2>
                            <p className="mt-1.5 text-sm text-muted">{user.email}</p>
                        </div>
                        <span className="label-sm inline-flex items-center gap-2 rounded-full bg-sand px-4 py-2 text-[10px]">
                            <span className="grid size-3.5 place-items-center rounded-full bg-ink text-white"><CheckIcon size={8} /></span>
                            Email verified
                        </span>
                    </div>

                    <dl className="mt-6">
                        <Row label="Full name" value={str(m.full_name)} />
                        <Row label="Mobile" value={localPhone(m.phone)} />
                        <Row label="Usual jar size" value={str(m.size)} />
                        <Row label="Order updates" value={m.notify_whatsapp ? "Email · on" : "Email · off"} />
                    </dl>

                    <button
                        type="button"
                        onClick={signOut}
                        className="label-sm mt-6 h-11 rounded-full bg-sand px-6 text-[10px] transition hover:bg-line"
                    >
                        Sign out
                    </button>
                </div>

                {/* Default delivery address */}
                <div id="addresses" className="scroll-mt-28 rounded-[2rem] bg-white p-6 sm:p-8">
                    <p className="eyebrow text-accent">Delivery address</p>
                    <h2 className="mt-3 font-serif text-2xl leading-tight">Where we send your parcels</h2>

                    {address || city ? (
                        <address className="mt-5 rounded-2xl bg-sand p-5 text-sm not-italic leading-relaxed">
                            <p className="label-sm text-[10px]">Default</p>
                            <p className="mt-2">{name}</p>
                            <p className="text-muted">{localPhone(m.phone)}</p>
                            <p className="mt-1 text-muted">
                                {address}
                                {city && <>, {city}</>}
                            </p>
                        </address>
                    ) : (
                        <p className="mt-5 rounded-2xl bg-sand p-5 text-sm text-muted">
                            No address saved yet. You can add one at checkout — we keep the last one you used.
                        </p>
                    )}

                    <p className="mt-5 text-xs leading-relaxed text-muted">
                        Cash on Delivery: nothing is charged until the parcel is in your hands.
                    </p>
                    <Link href="/collections" className="label-sm mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-sand px-6 text-[10px] transition hover:bg-line">
                        Start a new order <ArrowIcon size={12} />
                    </Link>
                </div>
            </div>

            <div id="orders" className="scroll-mt-28 rounded-[2rem] bg-white p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                    <p className="eyebrow text-accent">Orders &amp; tracking</p>
                    <span className="label-sm text-[10px] text-muted">{orders.length} on this account</span>
                </div>
                <h2 className="mt-3 font-serif text-2xl leading-tight">Your parcels</h2>

                {orders.length === 0 ? (
                    <div className="mt-6 rounded-2xl bg-sand p-6 text-center">
                        <span className="mx-auto grid size-12 place-items-center rounded-full bg-white text-muted"><BoxIcon size={18} /></span>
                        <p className="mt-4 text-sm">No orders on this account yet.</p>
                        <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-muted">
                            Place an order and it will appear here with its dispatch timeline, on every device you
                            sign in from.
                        </p>
                        <div className="mt-5 flex flex-wrap justify-center gap-2">
                            <Link href="/collections" className="label-sm inline-flex h-11 items-center rounded-full bg-ink px-6 text-[10px] text-white">
                                Browse the collection
                            </Link>
                            <Link href="/track-order" className="label-sm inline-flex h-11 items-center rounded-full bg-white px-6 text-[10px] transition hover:bg-line">
                                Track an order
                            </Link>
                        </div>
                    </div>
                ) : (
                    <ul className="mt-6 space-y-4">
                        {orders.map((o) => {
                            const live = currentStep(
                                buildTracking({ status: o.status, city: o.recipient.city, events: o.events }),
                            );
                            return (
                                <li key={o.id} className="rounded-2xl bg-sand p-5">
                                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                        <p className="font-serif text-lg">{o.id}</p>
                                        <p className="label-sm text-[10px] text-muted">{fmtDay(o.placedAt)}</p>
                                    </div>
                                    <p className="mt-2 inline-flex items-center gap-2 text-xs text-accent">
                                        <TruckIcon size={13} /> {live.title} · {live.place}
                                    </p>
                                    <ul className="mt-4 space-y-1.5 text-xs text-muted">
                                        {o.items.map((i) => (
                                            <li key={i.name + i.options.join()} className="flex justify-between gap-4">
                                                <span className="truncate">{i.name} × {i.qty}</span>
                                                <span>{money(i.price * i.qty)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                                        <span className="text-sm">Cash due {money(o.totals.total)}</span>
                                        <Link href={`/track-order?id=${o.id}`} className="label-sm inline-flex items-center gap-2 text-[10px] underline underline-offset-4">
                                            Track <ArrowIcon size={11} />
                                        </Link>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <p className="mt-6 flex items-start gap-3 rounded-2xl bg-sand p-5 text-xs leading-relaxed text-muted">
                    <span className="mt-0.5 text-accent"><MailIcon size={15} /></span>
                    Questions about an order? Reply to your confirmation email and our team will pick it up.
                </p>
            </div>
        </div>
    );
}
