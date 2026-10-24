import Image from "next/image";
import Link from "next/link";
import { images } from "@/lib/images";
import { ArrowIcon } from "./Icons";
import { Reveal } from "./Motion";

export default function Provenance() {
    return (
        <section className="wrap pb-16 pt-4 md:pb-24">
            <Reveal className="grid items-center gap-10 rounded-2xl bg-sand p-8 md:grid-cols-2 md:gap-14 md:p-14">
                <div>
                    <p className="eyebrow mb-4 text-accent">Where It Comes From</p>
                    <h2 className="mb-5 font-serif text-[clamp(1.7rem,3vw,2.2rem)] leading-tight tracking-tight">
                        One Herd, One Dairy, One Recipe
                    </h2>
                    <p className="mb-7 max-w-md text-sm text-muted">
                        We do not buy milk from the open market. The herd grazes on open
                        pasture outside Lahore, the milk goes into curd the same day it is
                        drawn, and the whole batch is churned and clarified by hand on site.
                        That is why each jar carries a batch number and a churn date.
                    </p>
                    <Link
                        href="/products/bilona-organic-ghee"
                        className="label-sm inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-[11px] tracking-[0.12em] transition hover:border-current"
                    >
                        See the full product notes <ArrowIcon size={12} />
                    </Link>
                </div>

                <div className="group relative aspect-4/3 overflow-hidden rounded-xl bg-[#e6dcc6] shadow-[0_24px_50px_-20px_rgba(40,30,20,0.45)]">
                    <Image
                        src={images.provenance}
                        alt="Open pasture where the herd grazes"
                        fill
                        sizes="(max-width:768px) 100vw, 45vw"
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                </div>
            </Reveal>
        </section>
    );
}
