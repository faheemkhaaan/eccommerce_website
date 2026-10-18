export const ids = {
    trench: "L0UEzixY27s",
    rack: "my5cwTzhmNI",
    jackets: "KBE_Bvq1U30",
    hangers: "Yy4sN6QzboU",
    knitStack: "JSyMOOsk0K8",
    greyKnit: "b4pfclnkxJU",
} as const;

export const u = (id: string, w = 1600) =>
    `https://unsplash.com/photos/${id}/download?force=true&w=${w}`;

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