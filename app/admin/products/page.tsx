import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { saveStock } from "@/app/admin/actions";
import StatusNote from "@/components/admin/StatusNote";
import { listProducts } from "@/lib/admin-catalogue";
import { money } from "@/lib/cart-math";

export const metadata: Metadata = { title: "Products & stock — Organic Ghee" };

/** Below this many units a pack is worth flagging before it sells out. */
const LOW_STOCK = 5;

type Props = { searchParams: Promise<{ status?: string }> };

export default function AdminProductsPage({ searchParams }: Props) {
    return (
        <Suspense fallback={<p className="text-[0.85rem] text-muted">Loading the catalogue…</p>}>
            <ResolvedProducts searchParams={searchParams} />
        </Suspense>
    );
}

async function ResolvedProducts({ searchParams }: Props) {
    const [{ status }, products] = await Promise.all([searchParams, listProducts()]);

    return (
        <div className="max-w-4xl">
            <header>
                <p className="eyebrow">Catalogue</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                    <h1 className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] leading-tight tracking-tight">
                        Products &amp; stock
                    </h1>
                    <Link href="/admin/products/new" className="btn btn-solid ml-auto hover:opacity-85">
                        New product
                    </Link>
                </div>
                <p className="mt-3 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
                    Restock here after a churn day. Setting a pack to zero marks it sold out on the
                    storefront and blocks the buy button.
                </p>
                <StatusNote status={status} />
            </header>

            <div className="mt-8 space-y-6">
                {products.map((p) => {
                    const units = p.packs.reduce((sum, k) => sum + k.stock, 0);
                    const soldOut = p.packs.filter((k) => k.stock === 0).length;

                    return (
                        <section key={p.id} className="rounded-xl border border-line bg-sand/25 p-5">
                            <div className="flex flex-wrap items-center gap-4">
                                <Image
                                    src={p.image}
                                    alt=""
                                    width={48}
                                    height={60}
                                    className="hidden h-[60px] w-12 shrink-0 rounded object-cover sm:block"
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-serif text-xl tracking-tight">{p.name}</h2>
                                        {!p.is_active && <Badge>Hidden from shop</Badge>}
                                        {soldOut > 0 && <Badge tone="accent">{soldOut} sold out</Badge>}
                                    </div>
                                    <p className="mt-1 text-[0.78rem] text-muted">
                                        {p.packs.length === 1 ? "1 pack size" : `${p.packs.length} pack sizes`}
                                        {" · "}
                                        {units} in stock
                                    </p>
                                </div>
                                <Link
                                    href={`/admin/products/${p.id}`}
                                    className="btn border border-line bg-paper text-ink hover:opacity-70"
                                >
                                    Edit details
                                </Link>
                            </div>

                            <table className="mt-4 w-full border-collapse text-left text-[0.85rem]">
                                <thead>
                                    <tr className="label-sm text-[9px] text-muted">
                                        <th scope="col" className="border-b border-line py-2 pr-3 font-normal">Pack</th>
                                        <th scope="col" className="border-b border-line py-2 pr-3 font-normal">Price</th>
                                        <th scope="col" className="border-b border-line py-2 font-normal">Stock</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {p.packs.map((k) => (
                                        <tr key={k.id}>
                                            <td className="py-3 pr-3 align-middle">
                                                {k.label}
                                                <span className="block text-[0.72rem] text-muted">{k.grams} g</span>
                                            </td>
                                            <td className="py-3 pr-3 align-middle">{money(k.price)}</td>
                                            <td className="py-3 align-middle">
                                                <form action={saveStock} className="flex flex-wrap items-center gap-2">
                                                    <input type="hidden" name="id" value={k.id} />
                                                    <div className="w-24">
                                                        <input
                                                            type="number"
                                                            name="stock"
                                                            defaultValue={k.stock}
                                                            min={0}
                                                            step={1}
                                                            required
                                                            aria-label={`Stock for ${k.label}`}
                                                            className="field"
                                                        />
                                                    </div>
                                                    <button type="submit" className="btn btn-solid hover:opacity-85">
                                                        Save
                                                    </button>
                                                    {k.stock === 0 ? (
                                                        <Badge tone="accent">Sold out</Badge>
                                                    ) : (
                                                        k.stock < LOW_STOCK && <Badge tone="accent">Low</Badge>
                                                    )}
                                                </form>
                                            </td>
                                        </tr>
                                    ))}
                                    {p.packs.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="py-4 text-muted">
                                                No packs yet —{" "}
                                                <Link href={`/admin/products/${p.id}`} className="underline hover:text-ink">
                                                    add one from the product page
                                                </Link>
                                                .
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </section>
                    );
                })}
                {products.length === 0 && (
                    <p className="text-[0.85rem] text-muted">
                        The catalogue is empty.{" "}
                        <Link href="/admin/products/new" className="underline hover:text-ink">
                            Create the first product
                        </Link>
                        .
                    </p>
                )}
            </div>
        </div>
    );
}

function Badge({ tone = "muted", children }: { tone?: "muted" | "accent"; children: React.ReactNode }) {
    return (
        <span
            className={`label-sm shrink-0 rounded-full px-2 py-1 text-[9px] ${
                tone === "accent" ? "bg-accent/15 text-accent" : "bg-muted/15 text-muted"
            }`}
        >
            {children}
        </span>
    );
}
