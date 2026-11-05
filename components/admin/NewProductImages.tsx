"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import { IMAGE_MIME_TYPES, productImageUrl } from "@/lib/product-images";
import { uploadProductPhotos } from "./image-upload";

/**
 * Photo picker for the create form, where the product does not exist yet.
 *
 * Files are uploaded under the slug the owner typed and their object keys ride
 * along in hidden inputs for createProduct to record once the product exists.
 */
export default function NewProductImages() {
    const [paths, setPaths] = useState<string[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onPick(event: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []);
        const form = event.target.form;
        // Empty the input first, so the files are not submitted with the form itself.
        event.target.value = "";
        if (files.length === 0) return;

        // The slug sits in the same form and becomes the storage folder.
        const slug = String(new FormData(form ?? undefined).get("id") ?? "").trim().toLowerCase();

        setError(null);
        setBusy(true);
        try {
            const uploaded = await uploadProductPhotos(slug, files);
            setPaths((current) => [...current, ...uploaded]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "The upload failed.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div>
            {paths.map((path) => (
                <input key={path} type="hidden" name="image_paths" value={path} />
            ))}

            <div className="flex flex-wrap items-center gap-3">
                <label className="btn btn-solid cursor-pointer hover:opacity-85">
                    {busy ? "Uploading…" : paths.length ? "Add more photos" : "Choose photos"}
                    <input
                        type="file"
                        accept={IMAGE_MIME_TYPES.join(",")}
                        multiple
                        onChange={onPick}
                        disabled={busy}
                        className="sr-only"
                    />
                </label>
                <span className="text-[0.8rem] text-muted">
                    {paths.length === 0
                        ? "At least one is required."
                        : `${paths.length} ready · the first one is the cover.`}
                </span>
            </div>

            {error && (
                <p
                    role="alert"
                    className="mt-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-[0.8rem] text-accent"
                >
                    {error}
                </p>
            )}

            {paths.length > 0 && (
                <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {paths.map((path, i) => (
                        <li key={path} className="relative aspect-3/4 overflow-hidden rounded-lg border border-line bg-sand">
                            <Image
                                src={productImageUrl(path)}
                                alt=""
                                fill
                                sizes="160px"
                                className="object-cover"
                            />
                            {i === 0 && (
                                <span className="label-sm absolute left-2 top-2 rounded-full bg-ink px-2 py-1 text-[9px] text-white">
                                    Cover
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => setPaths((current) => current.filter((p) => p !== path))}
                                aria-label="Remove this photo"
                                className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-white/90 text-[0.7rem] text-ink hover:bg-white"
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
