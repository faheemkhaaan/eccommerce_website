import Link from "next/link";
import BagButton from "./cart/BagButton";
import AccountMenu from "./auth/AccountMenu";

// Every entry maps onto a real destination — the shop, the two education
// sections on the homepage, or the public tracking lookup.
const links = [
  { label: "Shop", href: "/collections" },
  { label: "Why Ghee", href: "/#why" },
  { label: "Our Process", href: "/#process" },
  { label: "Track Order", href: "/track-order" },
];

type Props = { variant?: "overlay" | "solid"; active?: string };

export default function Header({ variant = "overlay", active }: Props) {
  const solid = variant === "solid";
  const badge = `absolute -right-1.5 -top-1.5 grid size-4 place-items-center rounded-full text-[9px] ${solid ? "bg-ink text-white" : "bg-white text-ink"}`;

  return (
    <header className={solid ? "relative z-20 border-b border-line bg-paper text-ink" : "absolute inset-x-0 top-0 z-20 text-white "}>
      <p className="label-sm bg-[#2b231b] px-5 py-2 text-center text-[10px] tracking-widest text-white">
        Cash on delivery across Pakistan · Free delivery above Rs 5,000
      </p>
      <div className="mx-auto flex max-w-360 items-center gap-10 px-5 py-4 md:px-12">
        <Link href="/" className="font-serif text-lg tracking-[0.16em]">Organic Ghee</Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex gap-7 text-[11px] uppercase tracking-[0.12em]">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  aria-current={active === l.label ? "page" : undefined}
                  className={`pb-1 transition ${active === l.label ? "border-b border-current" : "opacity-80 hover:opacity-100"}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          {/* Guests see the bag too, so browsing → basket → sign-in works from any page.
              AccountMenu renders the sign-in state and swaps to the avatar once signed in. */}
          <div className="flex items-center gap-4">
            <span className="hidden text-[11px] tracking-wider md:block">PKR (Rs)</span>
            <BagButton badgeClass={badge} />
            <AccountMenu solid={solid} />
          </div>

        </div>
      </div >
    </header >
  );
}
