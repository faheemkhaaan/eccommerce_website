"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addProductImages, removeProductImage, setProductCover } from "@/app/admin/actions";
import { IMAGE_MIME_TYPES, type ImageResult, type ProductImage } from "@/lib/product-images";
import { uploadProductPhotos } from "./image-upload";

/**
 * The photo gallery on the product editor: upload, delete, and pick the cover.
 *
 * The database owns the rows and the storefront's cover, so every successful
 * change finishes with a refresh rather than guessing the new state here.
 */
export default function ProductImages({
    productId,
    images,
}: {
    productId: string;
    /** Gallery rows, cover first. */
    images: ProductImage[];
}) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /** Runs one gallery change, reporting a failure inline and re-reading on success. */
    async function run(work: () => Promise<ImageResult>) {
        setError(null);
        setBusy(true);

        const result = await work();
        if (!result.ok) setError(result.message);
        else router.refresh();

        setBusy(false);
    }

    async function onPick(event: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []);
        // Empty the input: it lets the same file be picked again after a failure, and
        // stops the File objects riding along with the surrounding form.
        event.target.value = "";
        if (files.length === 0) return;

        await run(async () => {
            try {
                return await addProductImages(productId, await uploadProductPhotos(productId, files));
            } catch (e) {
                return { ok: false, message: e instanceof Error ? e.message : "The upload failed." };
            }
        });
    }

    return (
        <div>
            <div className="flex flex-wrap items-center gap-3">
                <p className="text-[0.8rem] text-muted">
                    {images.length === 0
                        ? "No photos yet."
                        : `${images.length} photo${images.length === 1 ? "" : "s"} · the first one is the cover.`}
                </p>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={busy}
                    className="btn btn-solid ml-auto hover:opacity-85 disabled:opacity-50"
                >
                    {busy ? "Working…" : "Upload photos"}
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept={IMAGE_MIME_TYPES.join(",")}
                    multiple
                    onChange={onPick}
                    className="sr-only"
                />
            </div>

            {error && (
                <p
                    role="alert"
                    className="mt-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-[0.8rem] text-accent"
                >
                    {error}
                </p>
            )}

            {images.length > 0 && (
                <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {images.map((im, i) => (
                        <li key={im.id} className="overflow-hidden rounded-lg border border-line">
                            <div className="relative aspect-3/4 bg-sand">
                                <Image
                                    src={im.url}
                                    alt={im.alt ?? ""}
                                    fill
                                    sizes="(max-width:640px) 50vw, 220px"
                                    className="object-cover"
                                />
                                {i === 0 && (
                                    <span className="label-sm absolute left-2 top-2 rounded-full bg-ink px-2 py-1 text-[9px] text-white">
                                        Cover
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-2 p-2">
                                {i === 0 ? (
                                    <span className="text-[0.72rem] text-muted">Shown in the shop</span>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={busy}
                                        onClick={() => run(() => setProductCover(im.id))}
                                        className="text-[0.72rem] underline underline-offset-4 hover:text-ink disabled:opacity-50"
                                    >
                                        Make cover
                                    </button>
                                )}
                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => run(() => removeProductImage(im.id))}
                                    className="text-[0.72rem] text-muted underline underline-offset-4 hover:text-accent disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
