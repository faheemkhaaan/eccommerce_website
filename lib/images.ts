export const ids = {
    trench: "L0UEzixY27s",
    rack: "my5cwTzhmNI",
    jackets: "KBE_Bvq1U30",
    hangers: "Yy4sN6QzboU",
    knitStack: "JSyMOOsk0K8",
    greyKnit: "b4pfclnkxJU",
} as const;

// The CDN asset behind each photo slug. `unsplash.com/photos/{slug}/download` is an HTML
// page behind bot mitigation, and Vercel's image optimizer answers 502 when it follows the
// redirect — so the CDN asset is linked directly instead.
const cdn: Record<string, string> = {
    [ids.trench]: "1724709972210-4beb408de580",
    [ids.rack]: "1604882767135-b41fac508fff",
    [ids.jackets]: "1534702718617-c141fb9f99d0",
    [ids.hangers]: "1517502166878-35c93a0072f0",
    [ids.knitStack]: "1758537698215-af1e35acb911",
    [ids.greyKnit]: "1603906650843-b58e94d9df4d",
};

export const u = (id: string, w = 1600) =>
    `https://images.unsplash.com/photo-${cdn[id] ?? id}?q=80&fm=jpg&fit=crop&w=${w}`;

export const images = {
    hero: u(ids.trench, 2000),
    hero2: u(ids.greyKnit, 2000),
    hero3: u(ids.jackets, 2000),
    hero4: u(ids.hangers, 2000),
    hero5: u(ids.knitStack, 2000),
    avatar: u(ids.trench, 200),
    catOuterwear: u(ids.rack),
    catCeramics: u(ids.jackets),
    catLeather: u(ids.rack),
    p1: u(ids.trench, 900),
    p2: u(ids.knitStack, 900),
    p3: u(ids.jackets, 900),
    p4: u(ids.hangers, 900),
    p5: u(ids.greyKnit, 900),
    p6: u(ids.rack, 900),
    craftHands: u(ids.jackets, 900),
    craftLoom: u(ids.hangers, 900),
    community: [
        ids.trench, ids.knitStack, ids.rack, ids.greyKnit,
        ids.jackets, ids.hangers, ids.trench, ids.knitStack,
    ].map((id) => u(id, 600)),
    provenance: u(ids.hangers, 1200),

};