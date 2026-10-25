import { u, ids } from "@/lib/images";
import { getCatalogue, getCatalogueProduct, type CatalogueProduct, type Pack } from "@/lib/catalogue";

export type Photo = { full: string; thumb: string };

export type Detail = {
    id: string;
    edition: string;
    article: string;
    name: string;
    short: string;
    /** Price of the default pack, for the pre-selected state. */
    price: number;
    rating: number;
    reviews: number;
    badge: string;
    breadcrumb: string[];
    packs: Pack[];
    defaultPack: string;
    /** Small print under the pack selector, e.g. how long a jar lasts. */
    packNote: string;
    gallery: Photo[];
    sections: { title: string; body: string; bullets?: string[] }[];
    benefits: { title: string; body: string }[];
    nutrition: { label: string; value: string }[];
    comparison: { label: string; ours: string; others: string }[];
};

/**
 * Everything about a product that is not a commercial field. Pack sizes, prices,
 * stock and names come from the database instead, so the shop owner can change
 * them without a deploy. This is the copy that still needs a developer.
 */
type Editorial = Omit<Detail, "name" | "short" | "packs" | "price">;

const photos = (list: string[]): Photo[] =>
    list.map((id) => ({ full: u(id, 1400), thumb: u(id, 240) }));

const EDITORIAL: Record<string, Editorial> = {
    "bilona-organic-ghee": {
        id: "bilona-organic-ghee",
        edition: "Small batch — churned weekly",
        article: "GH-01",
        rating: 4.9,
        reviews: 312,
        badge: "Grass-fed · Bilona",
        breadcrumb: ["Shop", "Ghee"],
        defaultPack: "1 kg",
        packNote: "A 1 kg jar lasts a family of four about six weeks.",
        gallery: photos([ids.gheeJarC, ids.gheeSpoon, ids.jarOnBoard, ids.tin]),
        sections: [
            {
                title: "Why our ghee is different",
                body: "We start with whole milk from grass-fed desi cows, set it into curd overnight, then churn that curd the way it has been done for centuries. The butter is simmered slowly until the milk solids settle and the fat turns clear and golden. No centrifuge, no bleaching, no deodorising, no blending with vegetable fat.",
                bullets: [
                    "Bilona (curd-churned) method — not machine cream separation",
                    "Grass-fed desi cow milk, single source",
                    "Nothing added: no preservatives, colour or palm shortening",
                ],
            },
            {
                title: "How to use it",
                body: "Ghee is the workhorse fat of a Pakistani kitchen — it takes high heat without turning bitter, and it carries the aroma of whatever you cook in it.",
                bullets: [
                    "Roti, paratha and naan — spread straight from the jar",
                    "Tadka for dal, sabzi and karahi",
                    "Biryani and pulao — a spoon before dum",
                    "Halwa, gulab jamun and other desi sweets",
                    "Bullet coffee, ghee roast dosa, or as a butter substitute in baking",
                    "Traditional use for dry skin and hair",
                ],
            },
            {
                title: "Storage & shelf life",
                body: "Ghee does not need refrigeration. Keep the jar tightly closed in a cool, dark cupboard, away from the stove, and always use a dry spoon. At room temperature it keeps for 12 months; in the fridge it will set hard but lasts longer.",
                bullets: [
                    "12 months from the churn date printed on the label",
                    "Never introduce water or a wet spoon — that is what turns ghee rancid",
                    "A little graininess or settling is natural, not a defect",
                ],
            },
            {
                title: "Delivery, COD & returns",
                body: "We deliver anywhere in Pakistan with cash on delivery. Orders placed before 4 pm are dispatched the same day; Lahore, Karachi and Islamabad usually arrive in 48 hours. Unopened jars can be returned within 7 days.",
                bullets: [
                    "Free delivery on orders above Rs 5,000",
                    "Flat Rs 250 delivery charge below that",
                    "Cash on delivery — no advance payment, no card needed",
                ],
            },
        ],
        benefits: [
            {
                title: "Smoke point around 250 °C",
                body: "Refined cooking oils start breaking down near 180–200 °C, releasing free radicals. Ghee holds its structure through frying, tadka and dum cooking.",
            },
            {
                title: "Vitamins your body can actually absorb",
                body: "Ghee carries vitamins A, D, E and K2, and being a fat it helps you absorb them from the vegetables cooked in it. Refined oils are stripped of these and often artificially fortified.",
            },
            {
                title: "No trans fat, no hydrogenation",
                body: "Vanaspati and heavily refined oils pass through hydrogenation and deodorising, which creates trans fats. Ghee is simply simmered butterfat.",
            },
            {
                title: "Butyrate and CLA",
                body: "Ghee is one of the richest natural sources of butyrate, a short-chain fatty acid that feeds the gut lining. Milk from grass-fed cows also carries more conjugated linoleic acid.",
            },
            {
                title: "Lactose and casein removed",
                body: "The slow simmer separates out the milk solids, so most people who react badly to milk can cook with ghee without the bloating.",
            },
            {
                title: "A flavour you cannot fake",
                body: "Curd-churned ghee smells of caramel and toasted milk. Cheaper ghee is bland because the aroma compounds are boiled off during industrial clarifying.",
            },
        ],
        nutrition: [
            { label: "Energy", value: "900 kcal" },
            { label: "Total fat", value: "100 g" },
            { label: "Saturated fat", value: "62 g" },
            { label: "Monounsaturated", value: "29 g" },
            { label: "Cholesterol", value: "256 mg" },
            { label: "Vitamin A", value: "3069 IU" },
            { label: "Vitamin E", value: "2.8 mg" },
            { label: "Vitamin K2", value: "Present" },
        ],
        comparison: [
            { label: "Smoke point", ours: "~250 °C", others: "180–200 °C refined oil" },
            { label: "Trans fat", ours: "None", others: "Common in vanaspati" },
            { label: "Vitamins A, D, E, K2", ours: "Naturally present", others: "Stripped, sometimes fortified" },
            { label: "How it is made", ours: "Churned from cultured curd", others: "Solvent extracted & refined" },
            { label: "Additives", ours: "Nothing", others: "Antioxidants, colours, anti-foam" },
            { label: "Cooking at high heat", ours: "Stable", others: "Degrades and smokes" },
        ],
    },
};

/**
 * Editorial copy for a product the dashboard created, which by definition has
 * none. The page then renders only what the database knows — image, packs, price,
 * stock — and every empty section hides itself. Better than a 404 for a product
 * the owner can legitimately put on sale.
 */
function fallbackEditorial(product: CatalogueProduct): Editorial {
    const first = product.packs[0];

    return {
        id: product.id,
        edition: "",
        article: "",
        rating: 0,
        reviews: 0,
        badge: product.badge ?? "",
        breadcrumb: ["Shop"],
        defaultPack: first?.label ?? "",
        packNote: "",
        gallery: [{ full: product.image, thumb: product.image }],
        sections: [],
        benefits: [],
        nutrition: [],
        comparison: [],
    };
}

/** Merges the database's commercial fields with the editorial copy above. */
export async function getDetail(id: string): Promise<Detail | undefined> {
    const product = await getCatalogueProduct(id);
    if (!product) return undefined;

    const editorial = EDITORIAL[id] ?? fallbackEditorial(product);

    const preferred =
        product.packs.find((k) => k.label === editorial.defaultPack) ?? product.packs[0];

    return {
        ...editorial,
        name: product.name,
        short: product.short,
        packs: product.packs,
        price: preferred?.price ?? 0,
    };
}

/**
 * Every product the shop should prerender. Products added from the dashboard are
 * included even without editorial copy, since getDetail now resolves them too.
 */
export async function allDetailIds() {
    const products = await getCatalogue();
    return products.map((p) => ({ id: p.id }));
}
