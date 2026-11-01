/** One free-text query for both the embed and the "open in Maps" link. */
export function mapQuery(address: string, city: string) {
    return [address, city, "Pakistan"].filter(Boolean).join(", ");
}

/** Embedded map. Returns null when no key is configured, so the page degrades to the link only. */
export function embedUrl(query: string) {
    const key = process.env.GOOGLE_MAPS_EMBED_KEY;
    if (!key) return null;
    return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(query)}&zoom=16`;
}

/** Opens Google Maps (the app on a phone) with driving directions already started. */
export function directionsUrl(query: string) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=driving`;
}