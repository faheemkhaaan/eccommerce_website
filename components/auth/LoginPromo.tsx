import Image from "next/image";
import { ids, u } from "@/lib/images";
import { ShieldIcon } from "../Icons";

export default function LoginPromo() {
    return (
        <aside className="rounded-4xl bg-linear-to-br from-[#f9e6de] via-[#f6ece6] to-sand p-6 sm:p-10 md:rounded-[2.5rem]">
            <span className="label-sm inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-[10px] tracking-[0.12em]">
                <i className="size-1.5 rounded-full bg-accent" /> Festive Couture Edition
            </span>

            <h2 className="mt-6 font-serif text-[clamp(1.8rem,2.6vw,2.4rem)] leading-tight tracking-tight">
                Pure Mulberry Silks &amp; Hand-Zari Unstitched Suits
            </h2>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-muted">
                Each piece is custom-loomed in Varanasi and Lahore, crafted for celebratory grace and effortless heirloom style.
            </p>

            <figure className="group relative mt-8 aspect-16/15 overflow-hidden rounded-3xl bg-[#d8d0c2] shadow-[0_20px_40px_-24px_rgba(60,40,20,0.5)]">
                <Image
                    src={u(ids.knitStack, 900)}
                    alt="A folded embroidered kurti suit on a stone plinth"
                    fill
                    sizes="(max-width:1024px) 100vw, 35vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="label-sm text-[10px] tracking-[0.12em] opacity-85">Atelier Archive</p>
                    <p className="mt-1 font-serif text-xl">Noor-e-Kashmir Kurti Suite</p>
                </figcaption>
            </figure>

            <div className="mt-6 flex items-center gap-4 rounded-3xl bg-white/80 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#fbe4dc] text-accent">
                    <ShieldIcon size={18} />
                </span>
                <div>
                    <p className="text-sm">Seamless Eid Order Dispatch</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">Priority stitching pipeline active for registered clients.</p>
                </div>
            </div>
        </aside>
    );
}