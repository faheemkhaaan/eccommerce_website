import Link from "next/link";
import { FREE_DELIVERY_FROM, DELIVERY_FLAT, money } from "@/lib/cart-math";

// Links point only at pages that exist; the rest stay as plain text rather than dead links.
const cols = [
  {
    title: "Shop",
    links: [
      { label: "All Ghee", href: "/collections" },
      { label: "Bilona Organic Ghee", href: "/products/bilona-organic-ghee" },
      { label: "Why Ghee", href: "/#why" },
      { label: "Our Process", href: "/#process" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track Your Order", href: "/track-order" },
      { label: "Delivery & COD", href: "/#delivery" },
      { label: "My Account", href: "/account" },
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
          <Link href="/" className="font-serif text-lg tracking-[0.16em]">ORGANIC GHEE</Link>
          <p className="my-4 max-w-72 text-xs text-muted">
            Small-batch bilona ghee, churned from cultured curd and grass-fed desi cow milk.
            Delivered anywhere in Pakistan with cash on delivery.
          </p>
          <form action="#">
            <label htmlFor="nl" className="label-sm mb-2 block text-[10px]">Batch notes by email</label>
            <div className="flex max-w-sm gap-2">
              <input id="nl" type="email" placeholder="Your email address" className="flex-1 rounded-[3px] border border-line bg-white px-3 py-2 text-xs" />
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
          <h4 className={h4}>Reach Us</h4>
          <address className="mb-4 text-[0.8rem] not-italic">
            Dairy &amp; packing house, Sundar Estate<br />Lahore, Pakistan
          </address>
          <ul className="space-y-1 text-[0.8rem]">
            <li>
              <a href="tel:+923001234567" className={hover}>+92 300 1234567</a>
            </li>
            <li className="text-muted">
              Delivery {money(DELIVERY_FLAT)} · free above {money(FREE_DELIVERY_FROM)}
            </li>
          </ul>
        </div>
      </div>

      <div className="wrap label-sm flex flex-wrap justify-between gap-4 border-t border-line py-5 text-[10px] tracking-[0.08em] text-muted">
        <span>© 2026 Organic Ghee. All rights reserved.</span>
        <ul className="flex gap-6">
          {["Privacy Policy", "Terms of Service", "Delivery & Returns"].map((l) => (<li key={l}>{l}</li>))}
        </ul>
      </div>
    </footer>
  );
}
