import { ids, u } from "@/lib/images";
import { PALETTE, PRODUCTS } from "@/lib/products";

export type Photo = { full: string; thumb: string };

export type Detail = {
    id: string;
    edition: string;
    article: string;
    name: string;
    price: number;
    rating: number;
    reviews: number;
    badge: string;
    breadcrumb: string[];
    colorways: { name: string; hex: string }[];
    sizes: string[];
    defaultSize: string;
    stockLeft?: number;
    modelNote: string;
    gallery: Photo[];
    sections: { title: string; body: string; bullets?: string[] }[];
    ensemble: { id: string; category: string; name: string; price: number; image: string }[];
};

const photos = (list: string[]): Photo[] =>
    list.map((id) => ({ full: u(id, 1400), thumb: u(id, 240) }));

const trench: Detail = {
    id: "sculptural-wool-trench",
    edition: "Edition 04 — Atelier Release",
    article: "842-10",
    name: "The Sculptural Wool Trench Coat",
    price: 680,
    rating: 4.9,
    reviews: 42,
    badge: "Spring 2025 • Edition 04",
    breadcrumb: ["Archive", "Apparel", "Outerwear"],
    colorways: [
        { name: "Oatmeal Beige", hex: "#e6dfd3" },
        { name: "Obsidian Noir", hex: "#1d1b18" },
        { name: "Saddle Tan", hex: "#8a5a3b" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    defaultSize: "S",
    stockLeft: 3,
    modelNote: "Model is 5′10″ (178cm) wearing size S",
    gallery: photos([ids.trench, ids.rack, ids.jackets, ids.hangers]),
    sections: [
        {
            title: "Material & Craftsmanship",
            body: "Constructed from 100% ethically sourced double-faced virgin wool spun in Biella, Italy, tailored with uncompromised precision in Porto, Portugal.",
            bullets: [
                "540 GSM density for structured drape and warmth",
                "Genuine carved buffalo horn hardware",
                "Biodegradable organic natural fibers",
            ],
        },
        {
            title: "Fit & Tailoring Dimensions",
            body: "A relaxed, sculpted silhouette with generous volume through the shoulder and a belted waist. Size S measures 104 cm across the chest and 112 cm in length. Between sizes, we suggest sizing down for a cleaner line.",
        },
        {
            title: "Carbon-Neutral Dispatch",
            body: "Every order ships in recycled, plastic-free packaging with offset carriers. Delivery takes 2–4 business days within Europe and 4–7 worldwide. Returns are free within 14 days.",
        },
    ],
    ensemble: [
        { id: "wide-leg-architectural-pleated-pant", category: "Tailored Trousers", name: "Wide-Leg Architectural Pleated Pant", price: 340, image: u(ids.jackets, 700) },
        { id: "saddle-calfskin-porter-tote", category: "Leather Goods", name: "Saddle Calfskin Porter Tote", price: 520, image: u(ids.rack, 700) },
        { id: "hand-thrown-sandstone-vessel", category: "Objects & Living", name: "Hand-Thrown Sandstone Vessel", price: 85, image: u(ids.hangers, 700) },
    ],
};

// Build a detail page from a listing entry so every card on the collection page resolves.
function fromListing(id: string): Detail | undefined {
    const i = PRODUCTS.findIndex((x) => x.id === id);
    if (i < 0) return undefined;
    const p = PRODUCTS[i];
    const pool = Object.values(ids);
    const apparel = p.category === "Apparel";

    return {
        ...trench,
        id: p.id,
        name: p.name,
        price: p.price,
        article: String(800 + i * 7).padStart(3, "0") + "-" + String(10 + i),
        edition: `${p.badge ?? "Atelier Release"} — Spring 2025`,
        breadcrumb: ["Archive", p.category, p.material],
        colorways: p.palette.map((n) => ({ name: n, hex: PALETTE[n] })),
        sizes: apparel ? trench.sizes : ["One size"],
        defaultSize: apparel ? "S" : "One size",
        stockLeft: p.badge === "Only 2 Left" ? 2 : undefined,
        modelNote: apparel ? trench.modelNote : "",
        gallery: photos([0, 1, 2, 3].map((k) => pool[(i + k) % pool.length])),
        sections: [
            { ...trench.sections[0], body: `${p.detail}. Made in small, numbered batches by our partner ateliers.`, bullets: undefined },
            ...trench.sections.slice(1),
        ],
    };
};

export const getDetail = (id: string) => (id === trench.id ? trench : fromListing(id));
export const allDetailIds = () => [trench.id, ...PRODUCTS.map((p) => p.id)];