import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { createProduct } from "@/app/admin/actions";
import StatusNote, { NotesType } from "@/components/admin/StatusNote";
import { listProducts } from "@/lib/admin-catalogue";

export const metadata: Metadata = { title: "New product — Organic Ghee" };

type Props = { searchParams: Promise<{ status?: NotesType }> };

export default function NewProductPage({ searchParams }: Props) {
    return (
        <Suspense fallback={<p className="text-[0.85rem] text-muted">Loading the form…</p>}>
            <ResolvedNewProduct searchParams={searchParams} />
        </Suspense>
    );
}

async function ResolvedNewProduct({ searchParams }: Props) {
    const [{ status }, products] = await Promise.all([searchParams, listProducts()]);

    // A new product belongs at the end of the shop ordering unless the owner says
    // otherwise, so prefill the next free slot instead of making them guess.
    const nextSort = products.reduce((max, p) => Math.max(max, p.sort_order + 1), 0);

    return (
        <div className="max-w-3xl">
            <Link href="/admin/products" className="label-sm text-[10px] text-muted hover:text-ink">
                ← Products &amp; stock
            </Link>

            <header className="mt-4">
                <p className="eyebrow">Catalogue</p>
                <h1 className="mt-3 font-serif text-[clamp(1.8rem,3vw,2.4rem)] leading-tight tracking-tight">
                    New product
                </h1>
                <p className="mt-3 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
                    Create the listing first, then add its pack sizes and prices on the next screen. A
                    product with no pack sizes has nothing to sell, so it stays out of the shop until
                    you tick it live.
                </p>
                <StatusNote status={status} />
            </header>

            <section className="mt-8 rounded-xl border border-line p-5 md:p-6">
                <form action={createProduct} className="space-y-4">
                    <label className="block">
                        <span className="label-sm text-[10px] text-muted">Product URL</span>
                        <input
                            name="id"
                            required
                            // Mirrors the slug rule the action enforces: lowercase words
                            // joined by single hyphens. This is the /products/<id> segment.
                            pattern="[a-z0-9]+(-[a-z0-9]+)*"
                            title="Lowercase letters, numbers and single hyphens, e.g. bilona-organic-ghee"
                            placeholder="e.g. desi-cow-ghee"
                            className="field mt-1.5"
                        />
                        <span className="mt-1.5 block text-[0.72rem] text-muted">
                            Becomes the storefront address, /products/your-url. It cannot be changed later.
                        </span>
                    </label>

                    <label className="block">
                        <span className="label-sm text-[10px] text-muted">Name</span>
                        <input name="name" required placeholder="e.g. Desi Cow Ghee" className="field mt-1.5" />
                    </label>

                    <label className="block">
                        <span className="label-sm text-[10px] text-muted">Short summary</span>
                        <input
                            name="short"
                            required
                            placeholder="e.g. Hand-churned in small batches"
                            className="field mt-1.5"
                        />
                        <span className="mt-1.5 block text-[0.72rem] text-muted">
                            One line, shown under the name on cards and the product page.
                        </span>
                    </label>

                    <label className="block">
                        <span className="label-sm text-[10px] text-muted">Image URL</span>
                        <input
                            name="image"
                            type="url"
                            required
                            placeholder="https://images.unsplash.com/…"
                            className="field mt-1.5"
                        />
                        <span className="mt-1.5 block text-[0.72rem] text-muted">
                            A direct image link. Unsplash pages that end in /download will not load.
                        </span>
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="label-sm text-[10px] text-muted">Badge</span>
                            <input name="badge" placeholder="e.g. Bestseller" className="field mt-1.5" />
                        </label>
                        <label className="block">
                            <span className="label-sm text-[10px] text-muted">Sort order</span>
                            <input
                                name="sort_order"
                                type="number"
                                step={1}
                                defaultValue={nextSort}
                                required
                                className="field mt-1.5"
                            />
                            <span className="mt-1.5 block text-[0.72rem] text-muted">
                                Lower numbers appear first.
                            </span>
                        </label>
                    </div>

                    <label className="flex items-start gap-3">
                        <input type="checkbox" name="is_active" className="mt-0.5 size-4 accent-ink" />
                        <span className="text-[0.85rem]">
                            Visible in the shop
                            <span className="block text-[0.75rem] text-muted">
                                Leave this off until the pack sizes and prices are in — a visible product
                                with no packs shows as “Coming soon”.
                            </span>
                        </span>
                    </label>

                    <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
                        <button type="submit" className="btn btn-solid hover:opacity-85">
                            Create product
                        </button>
                        <Link href="/admin/products" className="btn border border-line text-ink hover:opacity-70">
                            Cancel
                        </Link>
                    </div>
                </form>
            </section>

            <p className="mt-6 text-[0.78rem] leading-relaxed text-muted">
                Longer editorial copy — gallery, benefits, nutrition table — is still written in code.
                A product created here renders with its image, packs and price only, and every empty
                section hides itself.
            </p>
        </div>
    );
}
