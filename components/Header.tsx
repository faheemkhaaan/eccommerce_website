import { images } from "@/lib/images";
import Link from "next/link";
import Image from "next/image";
import { SearchIcon, BagIcon, HeartIcon } from "./Icons";

const links = ["New In", "Apparel", "Objects & Living", "Editorial", "Archive"];

export default function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 text-white">
      <p className="label-sm bg-[#111] px-5 py-2 text-center text-[10px] tracking-widest">
        Complimentary worldwide shipping on orders over $250 · Spring/Summer 2025 now live
      </p>
      <div className="mx-auto flex max-w-[1440px] items-center gap-10 px-5 py-4 md:px-12">
        <Link href="/" className="font-serif text-lg tracking-[0.16em]">ÉPURE</Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex gap-7 text-[11px] uppercase tracking-[0.12em]">
            {links.map((l) => (
              <li key={l}><Link href="#" className="opacity-85 hover:opacity-100">{l}</Link></li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <label className="hidden items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 backdrop-blur-md md:flex">
            <SearchIcon size={14} />
            <input
              type="search"
              placeholder="Search atelier collection…"
              aria-label="Search"
              className="w-36 bg-transparent text-xs text-white outline-none placeholder:text-white/70 lg:w-44"
            />
          </label>
          <button type="button" className="hidden text-[11px] tracking-wider md:block">USD ($)</button>
          <button type="button" aria-label="Wishlist"><HeartIcon /></button>
          <button type="button" aria-label="Bag"><BagIcon /></button>
          <Image src={images.avatar} alt="Your account" width={28} height={28} className="size-7 rounded-full bg-[#d8d0c2] object-cover" />
        </div>
      </div>
    </header>
  );
}
