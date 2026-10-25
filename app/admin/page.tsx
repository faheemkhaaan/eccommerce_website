import Image from "next/image";
import Link from "next/link";
import { listProducts } from "@/lib/admin-catalogue";
import { money } from "@/lib/cart-math";
import { listBoardOrders } from "@/lib/order-queries";

export default async function AdminOverview() {
    const [products, orders] = await Promise.all([listProducts(), listBoardOrders()]);
    const packs = products.flatMap((p) => p.packs);
    const units = packs.reduce((sum, k) => sum + k.stock, 0);
    const soldOut = packs.filter((k) => k.stock === 0);
    const live = products.filter((p) => p.is_active).length;

    const pending = orders.filter((o) => o.status === "pending").length;

    const stats = [
        { label: "Live products", value: String(live), sub: `${products.length} in the catalogue` },
        { label: "Units in stock", value: String(units), sub: "jars and tins ready to ship" },
        { label: "Pending COD", value: String(pending), sub: "waiting on a confirmation call" },
        { label: "Sold out", value: String(soldOut.length), sub: soldOut.length ? soldOut.map((k) => k.label).join(", ") : "every pack is available" },
    ];

    return (
        <div className="max-w-4xl">
            <header>
                <p className="eyebrow">Staff</p>
                <h1 className="mt-3 font-serif text-[clamp(1.8rem,3vw,2.4rem)] leading-tight tracking-tight">
                    Store overview
                </h1>
                <p className="mt-3 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
                    Everything the shop sells lives here. Prices and stock you change are live on the
                    storefront as soon as you save.
                </p>
            </header>

            <dl className="mt-8 grid gap-3 sm:grid-cols-2">
                {stats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-line bg-sand/40 p-5">
                        <dt className="label-sm text-[10px] text-muted">{s.label}</dt>
                        <dd className="mt-2 font-serif text-3xl leading-none">{s.value}</dd>
                        <dd className="mt-2 text-[0.78rem] text-muted">{s.sub}</dd>
                    </div>
                ))}
            </dl>

            <p className="mt-6 text-[0.85rem]">
                <Link href="/admin/orders" className="underline underline-offset-4 hover:text-accent">
                    Open the COD status board
                </Link>
            </p>

            <section className="mt-10">
                <div className="flex flex-wrap items-center gap-4 border-b border-line pb-3">
                    <h2 className="label-sm text-[10px] text-muted">Catalogue</h2>
                    <Link href="/admin/products/new" className="btn btn-solid ml-auto hover:opacity-85">
                        New product
                    </Link>
                </div>

                <ul className="divide-y divide-line">
                    {products.map((p) => {
                        const units = p.packs.reduce((sum, k) => sum + k.stock, 0);
                        return (
                            <li key={p.id} className="flex flex-wrap items-center gap-4 py-4">
                                <Image
                                    src={p.image}
                                    alt=""
                                    width={40}
                                    height={50}
                                    className="hidden h-[50px] w-10 shrink-0 rounded object-cover sm:block"
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate text-[0.95rem]">{p.name}</p>
                                        {!p.is_active && (
                                            <span className="label-sm rounded-full bg-muted/15 px-2 py-1 text-[9px] text-muted">
                                                Hidden
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-[0.78rem] text-muted">
                                        {p.packs.length === 0
                                            ? "No packs yet — not for sale"
                                            : `${money(p.packs[0].price)} to ${money(p.packs[p.packs.length - 1].price)} · ${units} in stock`}
                                    </p>
                                </div>
                                <Link
                                    href={`/admin/products/${p.id}`}
                                    className="btn border border-line bg-paper text-ink hover:opacity-70"
                                >
                                    Edit
                                </Link>
                            </li>
                        );
                    })}
                    {products.length === 0 && (
                        <li className="py-6 text-[0.85rem] text-muted">
                            The catalogue is empty.{" "}
                            <Link href="/admin/products/new" className="underline hover:text-ink">
                                Create the first product
                            </Link>
                            .
                        </li>
                    )}
                </ul>
            </section>
        </div>
    );
}
