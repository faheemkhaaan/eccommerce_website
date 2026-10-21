import { images } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "./Icons";

const stats = [
  { value: "100%", label: "Traceable fibers" },
  { value: "14", label: "Artisan studios" },
  { value: "0", label: "Synthetic blends" },
];

export default function Philosophy() {
  return (
    <section className="py-16 md:py-28">
      <div className="wrap grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="relative aspect-[1/1.05]">
          <div className="absolute bottom-[22%] left-0 right-[28%] top-0 overflow-hidden rounded-[3px] bg-[#d8d0c2]">
            <Image src={images.craftHands} alt="Hands stitching leather" fill sizes="30vw" className="object-cover object-[100%_50%]" />
          </div>
          <div className="absolute bottom-0 left-[32%] right-0 top-[30%] overflow-hidden rounded-[3px] bg-[#c9bfae] shadow-[0_24px_50px_-20px_rgba(40,30,20,0.45)]">
            <Image src={images.craftLoom} alt="A weaving loom in the atelier" fill sizes="30vw" className="object-cover" />
          </div>
        </div>

        <div>
          <p className="eyebrow mb-2">Our Philosophy</p>
          <h2 className="mb-7 max-w-sm font-serif text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight tracking-tight">
            Designed for the Discerning, Crafted for the Decades.
          </h2>
          <blockquote className="mb-6 border-l-2 border-accent pl-5 font-serif text-[1.05rem] italic leading-relaxed">
            “True luxury does not clamor for attention. It lives in the weight of an
            unlined seam, the cadence of natural fibers, and respect for the hands that weave them.”
          </blockquote>
          <p className="mb-8 max-w-120 text-sm text-muted">
            At ÉPURE, we deliberately reject the seasonal calendar of planned obsolescence.
            Every garment and homeware piece begins in independent family-run mills across
            Biella, Kyoto, and Porto. We produce in strictly numbered small-batch runs to
            ensure zero textile waste.
          </p>
          <dl className="mb-8 flex gap-12 border-t border-line pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-serif text-3xl leading-none">{s.value}</dt>
                <dd className="label-sm mt-2 text-[10px] text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
          <Link href="/journal" className="label-sm inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-[11px] tracking-[0.12em] transition hover:border-current">
            Explore our sourcing manifesto <ArrowIcon size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}
