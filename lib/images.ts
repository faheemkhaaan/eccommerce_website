export const ids = {
    gheeHero: "1573812461383-e5f8b759d12e",
    gheeJarA: "1707424124274-689499bbe5e9",
    gheeJarB: "1707425197195-240b7ad69047",
    gheeJarC: "1707425197254-266fec098cae",
    gheeSpoon: "1601232265936-6da280cff563",
    cowsField: "1503349817249-6aa85c2ba125",
    cowsClose: "1440428099904-c6d459a7e7b5",
    churn: "1589985268221-3237e3c20a68",
    churnCream: "1603596310730-360fede58035",
    creamJar: "1589985269102-ff38adf6f00d",
    tin: "1590147315472-e701a4775379",
    tinOpen: "1603596310923-dbb12732f9c7",
    kitchenWarm: "1529423374493-8b2f78fd2437",
    kitchenPot: "1518737003272-dac7c4760d5e",
    kitchenTadka: "1589557944589-c1d0eaabc88e",
    kitchenTable: "1598698628529-78863e5d4b2b",
    kitchenTableB: "1542320260-f8f651de8c12",
    jarOnBoard: "1524411289573-283bf2f298e8",
    jarLid: "1544535754-d429f7a0cf95",
    milkPour: "1558694956-3f409c9c1400",
    milkPail: "1523473827533-2a64d0d36748",
    farmBarn: "1560355107-8f50d1e08edb",
    farmField: "1498408040764-ab6eb772a145",
    fieldSoft: "1529159942819-334f07de4fe5",
    potRustic: "1590794056226-79ef3a8147e1",
    dairyShelf: "1500595046743-cd271d694d30",
} as const;

// These are already-resolved Unsplash CDN asset ids, so the URL builder is a plain
// concatenation: no redirect, no bot-mitigated host, nothing for the image optimizer to trip on.
export const u = (id: string, w = 1600) =>
    `https://images.unsplash.com/photo-${id}?q=80&fm=jpg&fit=crop&w=${w}`;

export const images = {
    // Home hero carousel
    hero: u(ids.gheeHero, 2000),
    hero2: u(ids.gheeJarA, 2000),
    hero3: u(ids.cowsField, 2000),
    hero4: u(ids.churn, 2000),
    hero5: u(ids.kitchenWarm, 2000),

    avatar: u(ids.jarLid, 200),

    // "What makes it different" cards
    benChurn: u(ids.churnCream, 1200),
    benFarm: u(ids.dairyShelf, 1200),
    benKitchen: u(ids.kitchenPot, 1200),

    // Pack shots
    jar500: u(ids.gheeJarB, 900),
    jar1kg: u(ids.gheeJarC, 900),
    tin2kg: u(ids.tin, 900),
    tin5kg: u(ids.tinOpen, 900),
    jarBoard: u(ids.jarOnBoard, 900),
    spoon: u(ids.gheeSpoon, 900),

    // Process collage
    craftHands: u(ids.milkPour, 900),
    craftLoom: u(ids.kitchenTable, 900),

    provenance: u(ids.farmField, 1200),

    community: [
        ids.kitchenTadka, ids.kitchenTableB, ids.fieldSoft, ids.jarOnBoard,
        ids.farmBarn, ids.milkPail, ids.gheeSpoon, ids.potRustic,
    ].map((id) => u(id, 600)),
};
