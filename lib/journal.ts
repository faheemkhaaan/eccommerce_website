import { images } from "./images";

export type Entry = {
    slug: string;
    issue: string; // "08"
    title: string;
    standfirst: string; // one-line summary used on cards
    date: string; // ISO date
    readTime: string;
    place: string;
    image: string;
    alt: string;
    body: string[];
    quote?: { text: string; attribution: string };
};

export const ENTRIES: Entry[] = [
    {
        slug: "deliberate-form",
        issue: "08",
        title: "Living With Deliberate Form",
        standfirst: "How a numbered batch moves from a Kyoto kiln to a Biella loom — and why we keep the batch small.",
        date: "2025-03-18",
        readTime: "6 min read",
        place: "Kyoto · Biella",
        image: images.provenance,
        alt: "Hands shaping clay at a potter's wheel",
        body: [
            "A batch begins as a counting exercise. Before a single thread is dyed, we ask how many pieces can be finished by the same four pairs of hands without anyone rushing. The number is almost always smaller than the order book wants it to be, and that is the point.",
            "At the kiln, form is settled in the first hour. Once the wall is drawn, the piece will carry the pressure of every later decision — the glaze, the firing curve, the long cooling. Our potters work in threes, turning each vessel at the same moment so the set reads as one gesture rather than three.",
            "The textiles follow a slower calendar. Looms in Biella are dressed for a single colourway and then run to completion; changing mid-loom wastes both yarn and a full day of setup. This is why an ensemble appears once, in one weight, and then rests until the next season's yarn arrives.",
            "Nothing here is efficient in the industrial sense. What it buys is a garment or a vessel you can still identify by hand a decade later, and a workshop that keeps its craftspeople instead of replacing them.",
        ],
        quote: {
            text: "Make the batch small enough that one person can still recognise every piece in it.",
            attribution: "Master potter, Kyoto studio",
        },
    },
    {
        slug: "loom-keepers",
        issue: "07",
        title: "The Loom Keepers of Biella",
        standfirst: "Four generations of dye houses, and what they still refuse to do with a colour.",
        date: "2025-02-04",
        readTime: "5 min read",
        place: "Biella, Italy",
        image: images.craftLoom,
        alt: "Wooden textile loom with natural fibres in a workshop",
        body: [
            "The dye house we work with has been in the same family since 1931, and the current keeper can name the year a shade was first mixed by the slight variance in how it takes to raw silk.",
            "Colour here is a matter of patience rather than chemistry alone. A batch rests before it is judged; the fibre keeps moving as it dries, and a tone that looks correct on the first day will read differently on the third. Only the third day counts.",
            "What they refuse is the correction bath — the quick dip that pulls an off-tone batch back toward the reference card. It saves a run, and it flattens the depth that makes the natural dye worth the wait.",
            "For us it means accepting that two unstitched suits from the same season can sit a half step apart in tone. We list it in the product notes instead of hiding it. Clients who care about cloth tend to prefer the honesty.",
        ],
    },
    {
        slug: "archival-silhouettes",
        issue: "06",
        title: "Notes on Archival Silhouettes",
        standfirst: "Why we draft from paper patterns kept in drawers instead of seasonal trend books.",
        date: "2025-01-09",
        readTime: "4 min read",
        place: "Lahore atelier",
        image: images.craftHands,
        alt: "Tailor's hands finishing a garment seam at the atelier table",
        body: [
            "Our pattern drawers hold blocks cut decades apart — a shoulder from 1974, a sleeve head from 1988, a collar that has been re-traced so many times the original pencil line is a groove in the card.",
            "Drafting from archive blocks is slower than starting clean, and it is the reason a jacket falls the way it does at the shoulder. New pattern-making software will give you a symmetrical armhole in seconds; it will not give you a shoulder that has already been corrected by forty years of fittings.",
            "Each season we take one block, change nothing structural, and adjust only what the body underneath it needs. It keeps the collection continuous. A client who bought in Édition 04 can buy in Édition 08 and recognise the same coat.",
        ],
    },
];

export const FEATURED = ENTRIES[0];

export const findEntry = (slug: string) => ENTRIES.find((e) => e.slug === slug);

export const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
