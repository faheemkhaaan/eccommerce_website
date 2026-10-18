export type Product = {
    id: string;
    badge: string;
    category: string;
    name: string;
    price: string;
    image: string;
    alt: string;
};

export const products: Product[] = [
    {
        id: "zari-kurti",
        badge: "Festive Edit",
        category: "Silk & Organza",
        name: "Zari-Embroidered Kurti Set",
        price: "Rs. 4,850",
        image:
            "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/44046d1f25da.jpg",
        alt: "Ivory raw silk drape cascading over a marble console beside a linen curtain",
    },
    {
        id: "raw-silk-column",
        badge: "Limited Drop",
        category: "Atelier Pure Silk",
        name: "Raw Silk Column Ensemble",
        price: "Rs. 6,200",
        image:
            "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/440626245a77.jpg",
        alt: "Champagne raw silk column dress photographed against a plaster arch and sheer curtain",
    },
    {
        id: "botanical-threadwork",
        badge: "Heirloom Series",
        category: "Resham Craft",
        name: "Botanical Threadwork Panel",
        price: "Rs. 5,400",
        image:
            "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c60334c06752.jpg",
        alt: "White botanical resham embroidery stitched onto sheer tulle",
    },
    {
        id: "chikan-chiffon",
        badge: "Festive Vault",
        category: "Chiffon & Bullion",
        name: "Chikan Chiffon Formal",
        price: "Rs. 8,900",
        image:
            "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/86e5d499a8d5.jpg",
        alt: "Champagne chiffon formal with gold bullion embroidery and pearl jewellery",
    },
];

export const quickLinks = [
    "Festive Lawn",
    "Hand-Zari Kurtis",
    "Unstitched Suits",
    "Track Order",
];

export const navLinks = [
    "New In",
    "Apparel",
    "Objects & Living",
    "Editorial",
    "Archive",
];

export const footerColumns = [
    {
        title: "Collections",
        links: [
            "Spring/Summer 2025",
            "Tailored Apparel",
            "Objects & Living",
            "Past Archives",
        ],
    },
    {
        title: "Client Care",
        links: [
            "Concierge Support",
            "Shipping & Returns",
            "Atelier Boutiques",
            "Sourcing & Ethics",
        ],
    },
];

export const boutiques = ["Galerie Vivienne, 75002 Paris", "Omotesando, Shibuya, Tokyo"];

export const journalLinks = ["Editorial", "Journal", "Instagram"];

export const policies = ["Privacy Policy", "Terms of Service", "Accessibility"];
