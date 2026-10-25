import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPack, deletePack, savePack, saveProduct } from "@/app/admin/actions";
import StatusNote from "@/components/admin/StatusNote";
import { getProduct } from "@/lib/admin-catalogue";

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ status?: string }>;
};

export default function AdminProductPage({ params, searchParams }: Props) {
    return (
        <Suspense fallback={<p className="text-[0.85rem] text-muted">Loading the product…</p>}>
            <ResolvedProduct params={params} searchParams={searchParams} />
        </Suspense>
    );
}

async function ResolvedProduct({ params, searchParams }: Props) {
    const [{ id }, { status }] = await Promise.all([params, searchParams]);
    const product = await getProduct(id);
    if (!product) notFound();

    const units = product.packs.reduce((sum, k) => sum + k.stock, 0);

    return (
        <div className="max-w-3xl">
            <Link href="/admin/products" className="label-sm text-[10px] text-muted hover:text-ink">
                ← Products &amp; stock
            </Link>

            <header className="mt-4 flex flex-wrap items-start gap-5">
                <Image
                    src={product.image}
                    alt=""
                    width={64}
                    height={80}
                    className="hidden h-20 w-16 shrink-0 rounded object-cover sm:block"
                />
                <div className="min-w-0">
                    <p className="eyebrow">Product</p>
                    <h1 className="mt-3 font-serif text-[clamp(1.8rem,3vw,2.4rem)] leading-tight tracking-tight">
                        {product.name}
                    </h1>
                    <p className="mt-2 text-[0.78rem] text-muted">
                        /products/{product.id} · {product.packs.length === 1 ? "1 pack size" : `${product.packs.length} pack sizes`}
                        {" · "}
                        {units} in stock
                    </p>
                    <p className="mt-3 flex flex-wrap items-center gap-3 text-[0.78rem]">
                        {!product.is_active && (
                            <span className="label-sm rounded-full bg-muted/15 px-2 py-1 text-[9px] text-muted">
                                Hidden from shop
                            </span>
                        )}
                        {product.packs.length === 0 && (
                            <span className="label-sm rounded-full bg-accent/15 px-2 py-1 text-[9px] text-accent">
                                Not for sale yet
                            </span>
                        )}
                        <Link
                            href={`/products/${product.id}`}
                            className="label-sm text-[10px] text-accent hover:underline"
                        >
                            View in shop ↗
                        </Link>
                    </p>
                    <StatusNote status={status} />
                </div>
            </header>

            <section className="mt-8 rounded-xl border border-line p-5 md:p-6">
                <h2 className="label-sm text-[10px] text-muted">Listing</h2>
                <form action={saveProduct} className="mt-4 space-y-4">
                    <input type="hidden" name="id" value={product.id} />

                    <label className="block">
                        <span className="label-sm text-[10px] text-muted">Name</span>
                        <input name="name" defaultValue={product.name} required className="field mt-1.5" />
                    </label>

                    <label className="block">
                        <span className="label-sm text-[10px] text-muted">Short summary</span>
                        <input name="short" defaultValue={product.short} required className="field mt-1.5" />
                    </label>

                    <label className="block">
                        <span className="label-sm text-[10px] text-muted">Image URL</span>
                        <input
                            name="image"
                            type="url"
                            defaultValue={product.image}
                            required
                            className="field mt-1.5"
                        />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="label-sm text-[10px] text-muted">Badge</span>
                            <input
                                name="badge"
                                defaultValue={product.badge ?? ""}
                                placeholder="e.g. Bestseller"
                                className="field mt-1.5"
                            />
                        </label>
                        <label className="block">
                            <span className="label-sm text-[10px] text-muted">Sort order</span>
                            <input
                                name="sort_order"
                                type="number"
                                step={1}
                                defaultValue={product.sort_order}
                                required
                                className="field mt-1.5"
                            />
                        </label>
                    </div>

                    <label className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            name="is_active"
                            defaultChecked={product.is_active}
                            className="mt-0.5 size-4 accent-ink"
                        />
                        <span className="text-[0.85rem]">
                            Visible in the shop
                            <span className="block text-[0.75rem] text-muted">
                                Uncheck to hide this product from the storefront without deleting it.
                            </span>
                        </span>
                    </label>

                    <button type="submit" className="btn btn-solid hover:opacity-85">
                        Save listing
                    </button>
                </form>
            </section>

            <section className="mt-8">
                <h2 className="label-sm text-[10px] text-muted">Pack sizes</h2>
                <div className="mt-4 space-y-4">
                    {product.packs.map((k) => (
                        <div key={k.id} className="rounded-xl border border-line p-5">
                            <form action={savePack}>
                                <input type="hidden" name="id" value={k.id} />
                                <input type="hidden" name="product_id" value={product.id} />

                                <div className="grid gap-4 sm:grid-cols-4">
                                    <label className="block sm:col-span-2">
                                        <span className="label-sm text-[10px] text-muted">Label</span>
                                        <input name="label" defaultValue={k.label} required className="field mt-1.5" />
                                    </label>
                                    <label className="block">
                                        <span className="label-sm text-[10px] text-muted">Grams</span>
                                        <input
                                            name="grams"
                                            type="number"
                                            min={1}
                                            step={1}
                                            defaultValue={k.grams}
                                            required
                                            className="field mt-1.5"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="label-sm text-[10px] text-muted">Stock</span>
                                        <input
                                            name="stock"
                                            type="number"
                                            min={0}
                                            step={1}
                                            defaultValue={k.stock}
                                            required
                                            className="field mt-1.5"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="label-sm text-[10px] text-muted">Price (Rs)</span>
                                        <input
                                            name="price"
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            defaultValue={k.price}
                                            required
                                            className="field mt-1.5"
                                        />
                                    </label>
                                    <label className="block sm:col-span-3">
                                        <span className="label-sm text-[10px] text-muted">Note</span>
                                        <input
                                            name="note"
                                            defaultValue={k.note ?? ""}
                                            placeholder="e.g. Glass jar · ~45 servings"
                                            className="field mt-1.5"
                                        />
                                    </label>
                                </div>

                                <button type="submit" className="btn btn-solid mt-4 hover:opacity-85">
                                    Save pack
                                </button>
                            </form>

                            {/* Sibling of the save form, since a form cannot nest another one. */}
                            <form action={deletePack} className="mt-3 border-t border-line pt-3">
                                <input type="hidden" name="id" value={k.id} />
                                <input type="hidden" name="product_id" value={product.id} />
                                <button
                                    type="submit"
                                    className="label-sm text-[10px] text-muted transition hover:text-accent"
                                >
                                    Delete this pack
                                </button>
                            </form>
                        </div>
                    ))}

                    {product.packs.length === 0 && (
                        <p className="text-[0.85rem] text-muted">
                            No packs yet. The storefront needs at least one before it can sell anything.
                        </p>
                    )}
                </div>
            </section>

            <section className="mt-8 rounded-xl border border-dashed border-line p-5">
                <h2 className="label-sm text-[10px] text-muted">Add a pack size</h2>
                <form action={createPack} className="mt-4">
                    <input type="hidden" name="product_id" value={product.id} />
                    <div className="grid gap-4 sm:grid-cols-4">
                        <label className="block sm:col-span-2">
                            <span className="label-sm text-[10px] text-muted">Label</span>
                            <input name="label" placeholder="e.g. 250 g" required className="field mt-1.5" />
                        </label>
                        <label className="block">
                            <span className="label-sm text-[10px] text-muted">Grams</span>
                            <input
                                name="grams"
                                type="number"
                                min={1}
                                step={1}
                                defaultValue={250}
                                required
                                className="field mt-1.5"
                            />
                        </label>
                        <label className="block">
                            <span className="label-sm text-[10px] text-muted">Stock</span>
                            <input
                                name="stock"
                                type="number"
                                min={0}
                                step={1}
                                defaultValue={0}
                                required
                                className="field mt-1.5"
                            />
                        </label>
                        <label className="block">
                            <span className="label-sm text-[10px] text-muted">Price (Rs)</span>
                            <input
                                name="price"
                                type="number"
                                min={0}
                                step="0.01"
                                required
                                className="field mt-1.5"
                            />
                        </label>
                        <label className="block sm:col-span-3">
                            <span className="label-sm text-[10px] text-muted">Note</span>
                            <input name="note" className="field mt-1.5" />
                        </label>
                    </div>
                    <button type="submit" className="btn btn-solid mt-4 hover:opacity-85">
                        Add pack
                    </button>
                </form>
            </section>
        </div>
    );
}
