import Image from "next/image";
import Link from "next/link";
import { images } from "@/lib/images";
import { ArrowIcon } from "./Icons";
import { FEATURED } from "@/lib/journal";
import { Reveal } from "./Motion";
// import { Reveal } from "../Motion";
// import { ArrowIcon } from "../Icons";

export default function Provenance() {
    return (
        <section className="wrap pb-16 pt-4 md:pb-24">
            <Reveal className="grid items-center gap-10 rounded-2xl bg-sand p-8 md:grid-cols-2 md:gap-14 md:p-14">
                <div>
                    <p className="eyebrow mb-4 text-accent">Craft &amp; Provenance</p>
                    <h2 className="mb-5 font-serif text-[clamp(1.7rem,3vw,2.2rem)] leading-tight tracking-tight">
                        Living With Deliberate Form
                    </h2>
                    <p className="mb-7 max-w-md text-sm text-muted">
                        Every ceramic creation and textile piece in our collection is produced in small, numbered
                        artisan batches between Kyoto’s historic pottery kilns and our atelier in Biella, Italy.
                    </p>
                    <Link href={`/journal/${FEATURED.slug}`} className="label-sm inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-[11px] tracking-[0.12em] transition hover:border-current">
                        Read Atelier Journal {FEATURED.issue} <ArrowIcon size={12} />
                    </Link>
                </div>

                <div className="group relative aspect-4/3 overflow-hidden rounded-xl bg-[#d8d0c2] shadow-[0_24px_50px_-20px_rgba(40,30,20,0.45)]">
                    <Image
                        src={images.provenance}
                        alt="Hands shaping clay at a potter's wheel"
                        fill
                        sizes="(max-width:768px) 100vw, 45vw"
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                </div>
            </Reveal>
        </section>
    );
}