import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { saveStock } from "@/app/admin/actions";
import StatusNote from "@/components/admin/StatusNote";
import { listProducts } from "@/lib/admin-catalogue";
import { money } from "@/lib/cart-math";

export const metadata: Metadata = { title: "Products & stock — Organic Ghee" };

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
                <h1 className="mt-3 font-serif text-[clamp(1.8rem,3vw,2.4rem)] leading-tight tracking-tight">
                    Products &amp; stock
                </h1>
                <p className="mt-3 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
                    Restock here after a churn day. Setting a pack to zero marks it sold out on the
                    storefront and blocks the buy button.
                </p>
                <StatusNote status={status} />
            </header>

            <div className="mt-8 space-y-10">
                {products.map((p) => (
                    <section key={p.id}>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="font-serif text-xl tracking-tight">{p.name}</h2>
                            {!p.is_active && (
                                <span className="label-sm rounded-full bg-muted/15 px-2 py-1 text-[9px] text-muted">
                                    Hidden from shop
                                </span>
                            )}
                            <Link
                                href={`/admin/products/${p.id}`}
                                className="btn ml-auto border border-line text-ink hover:opacity-70"
                            >
                                Edit details
                            </Link>
                        </div>

                        <table className="mt-3 w-full border-collapse text-left text-[0.85rem]">
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
                                            <form action={saveStock} className="flex items-center gap-2">
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
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                                {p.packs.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="py-4 text-muted">
                                            No packs yet — add one from the product page.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </section>
                ))}
                {products.length === 0 && (
                    <p className="text-[0.85rem] text-muted">The catalogue is empty.</p>
                )}
            </div>
        </div>
    );
}
