import { images } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "./Icons";
import type { CatalogueProduct } from "@/lib/catalogue";
import { DELIVERY_FLAT, FREE_DELIVERY_FROM, money } from "@/lib/cart-math";

export default function Feature({ product: p }: { product: CatalogueProduct }) {
  return (
    <section className="bg-sand py-16 md:py-28">
      <div className="wrap grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <div className="relative aspect-4/5 overflow-hidden rounded bg-[#e6dcc6]">
          <Image
            src={images.jarBoard}
            alt="A jar of bilona ghee beside a wooden spoon"
            fill
            sizes="(max-width:1024px) 100vw, 45vw"
            className="object-cover"
          />
        </div>

        <div>
          <p className="eyebrow mb-3">The Ghee</p>
          <h2 className="font-serif text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight tracking-tight">{p.name}</h2>
          <p className="mt-4 max-w-lg text-sm text-muted">
            {p.short}. Cooked from a live curd culture and clarified slowly enough that
            the caramel notes survive — which is the whole difference between ghee you
            cook with and ghee you can taste.
          </p>

          <ul className="mt-8 border-y border-line">
            {p.packs.map((pack) => (
              <li
                key={pack.label}
                className="grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-3 border-b border-line py-3.5 last:border-b-0"
              >
                <span className="font-serif text-lg">{pack.label}</span>
                <span className="text-[0.72rem] text-muted">{pack.note}</span>
                <span className="text-[0.9rem]">{money(pack.price)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={`/products/${p.id}`}
              className="label-sm inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 text-[11px] text-white transition hover:bg-ink/85"
            >
              Choose your pack <ArrowIcon size={14} />
            </Link>
            <p className="text-xs text-muted">
              Cash on delivery · {money(DELIVERY_FLAT)} delivery, free above {money(FREE_DELIVERY_FROM)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
