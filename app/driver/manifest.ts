import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Organic Ghee Rider",
        short_name: "Rider",
        description: "Assigned COD parcels, call the customer, collect cash.",
        start_url: "/driver",
        scope: "/driver",
        display: "standalone",
        background_color: "#faf7ef",
        theme_color: "#2b231b",
        icons: [
            { src: "/driver-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/driver-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
    };
}
