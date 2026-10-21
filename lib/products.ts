import { ids, u } from '@/lib/images'
export const PALETTE = {
    Noir: "#1d1b18",
    Ivory: "#f1ece2",
    Sand: "#cfc4b2",
    Stone: "#8f877a",
    Tan: "#8a5a3b",
    Brass: "#c9a227",
    Oat: "#c9b9a0",
    Cocoa: "#5a4030",
} as const;

export type PaletteName = keyof typeof PALETTE;
export type Category = "Apparel" | "Objects & Living" | "Accessories";
export type Badge = "New In" | "Bestseller" | "Only 2 Left";

export type Product = {
    id: string;
    name: string;
    price: number;
    detail: string;
    image: string;
    badge?: Badge;
    category: Category;
    material: string;
    palette: PaletteName[];
};

// Placeholder photos, cycled. Replace with real product images.
const pool = Object.values(ids);
const img = (i: number) => u(pool[i % pool.length], 800);

export const PRODUCTS: Product[] = [
    { id: "atelier-cocoon-overcoat", name: "Atelier Cocoon Overcoat", price: 890, detail: "Double-faced virgin wool & raw silk lining", badge: "New In", category: "Apparel", material: "Wool", palette: ["Sand", "Noir"], image: img(0) },
    { id: "ode-ceramic-vessel-04", name: "Ode Ceramic Vessel 04", price: 240, detail: "Hand-thrown stoneware, textured sand slip", badge: "Bestseller", category: "Objects & Living", material: "Stoneware", palette: ["Sand", "Stone"], image: img(1) },
    { id: "canyon-pleated-trouser", name: "Canyon Pleated Trouser", price: 380, detail: "Heavyweight Normandy flax linen", badge: "Only 2 Left", category: "Apparel", material: "Linen", palette: ["Noir", "Stone", "Ivory"], image: img(2) },
    { id: "saddle-leather-porter-tote", name: "Saddle Leather Porter Tote", price: 620, detail: "Vegetable-tanned Tuscan calfskin", category: "Accessories", material: "Leather", palette: ["Tan", "Noir"], image: img(3) },
    { id: "komorebi-mandarin-shirt", name: "Komorebi Mandarin Shirt", price: 310, detail: "Organic Japanese slub linen", badge: "New In", category: "Apparel", material: "Linen", palette: ["Ivory", "Sand", "Noir"], image: img(4) },
    { id: "aethel-cast-brass-holder", name: "Aethel Cast Brass Holder", price: 195, detail: "Lost-wax cast raw brushed brass", category: "Objects & Living", material: "Brass", palette: ["Brass", "Noir"], image: img(5) },
    { id: "oatmeal-seamless-turtleneck", name: "Oatmeal Seamless Turtleneck", price: 490, detail: "Grade-A Mongolian 4-ply cashmere", badge: "Bestseller", category: "Apparel", material: "Cashmere", palette: ["Oat", "Noir"], image: img(6) },
    { id: "kuro-asymmetric-wrap-skirt", name: "Kuro Asymmetric Wrap Skirt", price: 410, detail: "Woven worsted twill, side metal pin", badge: "Only 2 Left", category: "Apparel", material: "Wool", palette: ["Noir", "Cocoa"], image: img(7) },
    { id: "tide-linen-overshirt", name: "Tide Linen Overshirt", price: 350, detail: "Stonewashed Belgian linen, shell buttons", category: "Apparel", material: "Linen", palette: ["Oat", "Ivory"], image: img(8) },
    { id: "raku-tea-bowl-set", name: "Raku Tea Bowl Set", price: 180, detail: "Set of two, hand-fired in Kyoto", badge: "New In", category: "Objects & Living", material: "Stoneware", palette: ["Noir", "Stone"], image: img(9) },
    { id: "kaya-leather-slide", name: "Kaya Leather Slide", price: 290, detail: "Unlined calfskin on a cork footbed", category: "Accessories", material: "Leather", palette: ["Tan", "Cocoa", "Noir"], image: img(10) },
    { id: "bellow-merino-cardigan", name: "Bellow Merino Cardigan", price: 430, detail: "Boiled merino with horn buttons", category: "Apparel", material: "Wool", palette: ["Stone", "Oat"], image: img(11) },
];

// Facet values, derived from the catalogue so filters can never drift from the data.
export const CATEGORIES: Category[] = ["Apparel", "Objects & Living", "Accessories"];
export const MATERIALS: string[] = Array.from(new Set(PRODUCTS.map((p) => p.material)));
export const BADGES: Badge[] = Array.from(new Set(PRODUCTS.map((p) => p.badge).filter((b): b is Badge => Boolean(b))));