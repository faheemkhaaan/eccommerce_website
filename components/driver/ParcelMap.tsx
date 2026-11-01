import { embedUrl, mapQuery } from "@/lib/maps";

export default function ParcelMap({ address, city }: { address: string; city: string }) {
    const query = mapQuery(address, city);
    const src = embedUrl(query);

    if (!src) return null;

    return (
        <div className="mt-4 overflow-hidden rounded-2xl border border-line">
            <iframe
                title={`Map of ${query}`}
                src={src}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="block h-64 w-full border-0"
            />
        </div>
    );
}