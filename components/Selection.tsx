import { images } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";
import Carousel from "./Carousel";
import { HeartIcon, ArrowIcon } from "./Icons";

type Product = {
  name: string; price: string; material: string; image: string;
  badge?: string; swatches: string[];
};

const products: Product[] = [
  { name: "Cocoon Trench Coat", price: "$780", material: "100% Raw Silk", image: images.p1, badge: "Limited 40", swatches: ["#d9cdb8", "#2b2824"] },
  { name: "Asymmetric Turtleneck Knit", price: "$320", material: "Virgin Cashmere", image: images.p2, swatches: ["#8a5a3b", "#c9b9a0", "#2b2824"] },
  { name: "Pleated Atelier Trouser", price: "$340", material: "Belgian Linen", image: images.p3, swatches: ["#d9cdb8", "#2b2824"] },
  { name: "Kyoto Fume Vase No. 3", price: "$460", material: "Hand-fired Stoneware", image: images.p4, badge: "Studio Only", swatches: ["#2b2824", "#8a7f70"] },
  { name: "Boiled Wool Cardigan", price: "$410", material: "Boiled Merino", image: images.p5, swatches: ["#8a7f70", "#2b2824"] },
  { name: "Draped Linen Overshirt", price: "$260", material: "Belgian Linen", image: images.p6, swatches: ["#d9cdb8", "#c9b9a0"] },
];

export default function Selection() {
  return (
    <section className="bg-sand py-16 md:py-28">
      <div className="wrap">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="eyebrow mb-2">New Release</p>
            <h2 className="font-serif text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight tracking-tight">The Édition 08 Selection</h2>
          </div>
          <Link href="#" className="label-sm inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-[11px] tracking-[0.12em] transition hover:border-current">
            View all 32 pieces <ArrowIcon size={12} />
          </Link>
        </div>

        <Carousel label="New release products">
          {products.map((p) => (
            <li
              key={p.name}
              className="w-[68%] shrink-0 snap-start sm:w-[44%] lg:w-[calc((100%-3.75rem)/4)]"
            >
              <div className="relative aspect-3/4 overflow-hidden rounded bg-[#d8d0c2]">
                <Image src={p.image} alt={p.name} fill sizes="(max-width:640px) 68vw, (max-width:1024px) 44vw, 25vw" className="object-cover" />
                {p.badge && (
                  <span className="label-sm absolute left-3 top-3 rounded-full bg-white px-2.5 py-0.5 text-[9px] tracking-widest">{p.badge}</span>
                )}
                <button type="button" aria-label={`Save ${p.name}`} className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-white transition hover:scale-110">
                  <HeartIcon size={14} />
                </button>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-y-0.5 pt-3">
                <small className="label-sm text-[10px] text-muted">{p.material}</small>
                <div className="flex items-center justify-end gap-1">
                  {p.swatches.map((c) => (
                    <i key={c} style={{ background: c }} className="size-2 rounded-full border border-line" />
                  ))}
                </div>
                <h3 className="text-[0.85rem] font-medium">{p.name}</h3>
                <span className="text-right text-[0.85rem] text-muted">{p.price}</span>
              </div>
            </li>
          ))}
        </Carousel>
      </div>
    </section>
  );
}