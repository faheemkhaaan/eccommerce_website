import { images } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "./Icons";

const linkCls = "label-sm inline-flex items-center gap-2 text-[11px] tracking-[0.12em]";
const cardCls = "group relative flex min-h-64 items-end overflow-hidden rounded bg-[#d8d0c2] text-white";
const imgCls = "object-cover transition-transform duration-700 group-hover:scale-[1.03]";
const shade = "absolute inset-0 bg-gradient-to-b from-transparent from-40% to-black/65";

export default function Categories() {
  return (
    <section className="py-16 md:py-28">
      <div className="wrap">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="eyebrow mb-2">Architectural Forms</p>
            <h2 className="font-serif text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight tracking-tight">Curated Categories</h2>
          </div>
          <p className="max-w-sm text-sm text-muted">
            Structured volumes meeting tactile sensuality. Each object and garment is
            registered with a serialized atelier certificate.
          </p>
        </div>

        <div className="grid min-h-[34rem] gap-4 md:grid-cols-[1.55fr_1fr] md:grid-rows-2">
          <article className={`${cardCls} min-h-96 md:row-span-2`}>
            <Image src={images.catOuterwear} alt="" fill sizes="(max-width:768px) 100vw, 60vw" className={imgCls} />
            <div className={shade} />
            <div className="relative max-w-[30rem] p-6">
              <small className="label-sm mb-1 block text-[10px] opacity-80">Series 01</small>
              <h3 className="mb-2 font-serif text-2xl leading-snug">Tailored Outerwear</h3>
              <p className="mb-4 text-xs opacity-85">
                Unlined double-faced cashmere blazers, oversized trench coats with hand-stitched closures, and structured linen jackets.
              </p>
              <Link href="/collections?category=Apparel" className={linkCls}>Discover Outerwear <ArrowIcon size={12} /></Link>
            </div>
          </article>

          <article className={cardCls}>
            <Image src={images.catCeramics} alt="" fill sizes="(max-width:768px) 100vw, 40vw" className={imgCls} />
            <div className={shade} />
            <div className="relative p-6">
              <small className="label-sm mb-1 block text-[10px] opacity-80">Series 02</small>
              <h3 className="mb-3 font-serif text-2xl leading-snug">Artisanal Ceramics &amp; Living</h3>
              <Link href="/collections?category=Objects%20%26%20Living" className={linkCls}>View Objects <ArrowIcon size={12} /></Link>
            </div>
          </article>

          <article className={cardCls}>
            <Image src={images.catLeather} alt="" fill sizes="(max-width:768px) 100vw, 40vw" className={imgCls} />
            <div className={shade} />
            <div className="relative p-6">
              <small className="label-sm mb-1 block text-[10px] opacity-80">Series 03</small>
              <h3 className="mb-3 font-serif text-2xl leading-snug">Leather Goods &amp; Footwear</h3>
              <Link href="/collections?category=Accessories" className={linkCls}>Browse Accessories <ArrowIcon size={12} /></Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
