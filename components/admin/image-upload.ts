"use client";

import { PRODUCT_IMAGE_BUCKET, imageFileError, productImagePath } from "@/lib/product-images";
import { createClient } from "@/lib/supabase/client";

/**
 * Puts picked files in the product-images bucket and returns their object keys.
 *
 * The browser uploads straight to Supabase instead of posting the files to a
 * server action: a photo is routinely bigger than the 1 MB action body limit, and
 * the storage policies already refuse the write from anyone without the admin
 * role. A rejected file aborts the batch, so nothing is recorded half-uploaded.
 */
export async function uploadProductPhotos(prefix: string, files: File[]): Promise<string[]> {
    const supabase = createClient();
    const paths: string[] = [];

    for (const file of files) {
        const problem = imageFileError(file);
        if (problem) throw new Error(problem);

        const path = productImagePath(prefix, file.type);
        const { error } = await supabase.storage
            .from(PRODUCT_IMAGE_BUCKET)
            .upload(path, file, { contentType: file.type, cacheControl: "31536000" });

        if (error) throw new Error(`Upload failed: ${error.message}`);
        paths.push(path);
    }

    return paths;
}
