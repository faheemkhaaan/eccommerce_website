import Link from "next/link";

// Links point only at pages that exist; the rest stay as plain text rather than dead links.
const cols = [
  {
    title: "Collections",
    links: [
      { label: "Spring Summer 2025", href: "/collections" },
      { label: "Tailored Apparel", href: "/collections?category=Apparel" },
      { label: "Objects & Living", href: "/collections?category=Objects%20%26%20Living" },
      { label: "Past Archives", href: "/journal#archive" },
    ],
  },
  {
    title: "Client Care",
    links: [
      { label: "Concierge Support" },
      { label: "Shipping & Returns", href: "/track-order" },
      { label: "Atelier Boutiques" },
      { label: "Sourcing & Ethics", href: "/journal" },
    ],
  },
];

const h4 = "label-sm mb-4 text-[10px] font-medium tracking-[0.14em] text-muted";
const li = "mb-2 text-[0.8rem]";
const hover = "underline-offset-4 hover:underline";

export default function Footer() {
  return (
    <footer className="pt-16">
      <div className="wrap grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
        <div>
          <Link href="/" className="font-serif text-lg tracking-[0.16em]">ÉPURE ATELIER</Link>
          <p className="my-4 max-w-72 text-xs text-muted">
            Deliberate aesthetics, archival silhouettes, and sustainable artisanal craftsmanship engineered for high discernment.
          </p>
          <form action="#">
            <label htmlFor="nl" className="label-sm mb-2 block text-[10px]">Dispatch Newsletter</label>
            <div className="flex max-w-sm gap-2">
              <input id="nl" type="email" placeholder="Enter your correspondence email" className="flex-1 rounded-[3px] border border-line bg-white px-3 py-2 text-xs" />
              <button type="submit" className="label-sm rounded-[3px] bg-ink px-4 text-[11px] text-white">Join</button>
            </div>
          </form>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h4 className={h4}>{c.title}</h4>
            <ul>
              {c.links.map((l) => (
                <li key={l.label} className={li}>
                  {l.href ? <Link href={l.href} className={hover}>{l.label}</Link> : <span className="text-muted">{l.label}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className={h4}>Presence</h4>
          <address className="mb-4 text-[0.8rem] not-italic">
            Galerie Vivienne, 75002 Paris<br />Omotesando, Shibuya, Tokyo
          </address>
          <ul className="flex gap-4 text-[0.8rem]">
            {[{ label: "Editorial", href: "/journal" }, { label: "Journal", href: "/journal#archive" }, { label: "Instagram" }].map((l) => (
              <li key={l.label}>{l.href ? <Link href={l.href} className={hover}>{l.label}</Link> : <span className="text-muted">{l.label}</span>}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="wrap label-sm flex flex-wrap justify-between gap-4 border-t border-line py-5 text-[10px] tracking-[0.08em] text-muted">
        <span>© 2025 ÉPURE ATELIER S.A. All rights reserved.</span>
        <ul className="flex gap-6">
          {["Privacy Policy", "Terms of Service", "Accessibility"].map((l) => (<li key={l}>{l}</li>))}
        </ul>
      </div>
    </footer>
  );
}
