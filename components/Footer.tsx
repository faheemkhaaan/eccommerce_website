import Link from "next/link";

const cols = [
  { title: "Collections", links: ["Spring Summer 2025", "Tailored Apparel", "Objects & Living", "Past Archives"] },
  { title: "Client Care", links: ["Concierge Support", "Shipping & Returns", "Atelier Boutiques", "Sourcing & Ethics"] },
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
            <ul>{c.links.map((l) => (<li key={l} className={li}><Link href="#" className={hover}>{l}</Link></li>))}</ul>
          </div>
        ))}

        <div>
          <h4 className={h4}>Presence</h4>
          <address className="mb-4 text-[0.8rem] not-italic">
            Galerie Vivienne, 75002 Paris<br />Omotesando, Shibuya, Tokyo
          </address>
          <ul className="flex gap-4 text-[0.8rem]">
            {["Editorial", "Journal", "Instagram"].map((l) => (<li key={l}><Link href="#" className={hover}>{l}</Link></li>))}
          </ul>
        </div>
      </div>

      <div className="wrap label-sm flex flex-wrap justify-between gap-4 border-t border-line py-5 text-[10px] tracking-[0.08em] text-muted">
        <span>© 2025 ÉPURE ATELIER S.A. All rights reserved.</span>
        <ul className="flex gap-6">
          {["Privacy Policy", "Terms of Service", "Accessibility"].map((l) => (<li key={l}><Link href="#">{l}</Link></li>))}
        </ul>
      </div>
    </footer>
  );
}
