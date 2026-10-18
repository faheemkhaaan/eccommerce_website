import Link from "next/link";
import Image from "next/image";
import { images } from "@/lib/images";
import { SearchIcon, HeartIcon } from "./Icons";
import BagButton from "./cart/BagButton";

const links = ["New In", "Apparel", "Objects & Living", "Editorial", "Archive"];
const WISHLIST_COUNT = 2; // replace with real state

type Props = { variant?: "overlay" | "solid"; active?: string, loggedIn?: boolean };

export default function Header({ variant = "overlay", active, loggedIn = false }: Props) {
  const solid = variant === "solid";
  const badge = `absolute -right-1.5 -top-1.5 grid size-4 place-items-center rounded-full text-[9px] ${solid ? "bg-ink text-white" : "bg-white text-ink"}`;

  return (
    <header className={solid ? "relative z-20 border-b border-line bg-paper text-ink" : "absolute inset-x-0 top-0 z-20 text-white "}>
      <p className="label-sm bg-[#111] px-5 py-2 text-center text-[10px] tracking-widest text-white">
        Complimentary worldwide shipping on orders over $250 · Spring/Summer 2025 now live
      </p>
      <div className="mx-auto flex max-w-360 items-center gap-10 px-5 py-4 md:px-12">
        <Link href="/" className="font-serif text-lg tracking-[0.16em]">ÉPURE</Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex gap-7 text-[11px] uppercase tracking-[0.12em]">
            {links.map((l) => (
              <li key={l}>
                <Link
                  href="#"
                  aria-current={active === l ? "page" : undefined}
                  className={`pb-1 transition ${active === l ? "border-b border-current" : "opacity-80 hover:opacity-100"}`}
                >
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <label
            className={`hidden items-center gap-2 rounded-full border px-3.5 py-1.5 md:flex ${solid ? "border-line bg-sand" : "border-white/25 bg-white/15 backdrop-blur-md"
              }`}
          >
            <SearchIcon size={14} />
            <input
              type="search"
              placeholder="Search atelier collection…"
              aria-label="Search"
              className={`w-36 bg-transparent text-xs outline-none lg:w-44 ${solid ? "placeholder:text-muted" : "text-white placeholder:text-white/70"}`}
            />
          </label>


          {
            loggedIn ? (
              <div className="flex gap-4">
                <button type="button" className="hidden text-[11px] tracking-wider md:block">USD ($)</button>
                <button type="button" aria-label={`Wishlist, ${WISHLIST_COUNT} items`} className="relative">
                  <HeartIcon /><span className={badge}>{WISHLIST_COUNT}</span>
                </button>
                <BagButton badgeClass={badge} />
                <Image src={images.avatar} alt="Your account" width={28} height={28} className="size-7 rounded-full bg-[#d8d0c2] object-cover" />
              </div>
            ) : (
              <div className="flex gap-4 text-white">
                <Link className="text-white uppercase text-[11px] tracking-[0.12em] cursor-pointer opacity-80 hover:opacity-100 " href={"/login"}>signin</Link>
                <Link className="text-white uppercase text-[11px] tracking-[0.12em] cursor-pointer opacity-80 hover:opacity-100" href={"/register"}>signup</Link>
              </div>
            )
          }

        </div>
      </div >
    </header >
  );
}