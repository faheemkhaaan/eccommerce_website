import Image from "next/image";
import { ids, u } from "@/lib/images";
import { BellIcon, TruckIcon } from "../Icons";

export default function RegisterPromo() {
    return (
        <aside className="space-y-4">
            <figure className="group relative aspect-16/11 overflow-hidden rounded-[2rem] bg-[#d8d0c2] md:rounded-[2.5rem]">
                <Image
                    src={u(ids.greyKnit, 900)}
                    alt="Close-up of hand-embroidered festive fabric"
                    fill
                    sizes="(max-width:1024px) 100vw, 35vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <p className="label-sm text-[10px] tracking-[0.14em] opacity-85">Festive Édition 2025</p>
                    <p className="mt-2 font-serif text-2xl leading-snug">Artisanal Kurtas &amp; Hand-Woven Unstitched Ensembles</p>
                    <p className="mt-2 text-xs leading-relaxed opacity-85">
                        Tailored with uncompromising precision, delivered directly from our master craftspeople to your door.
                    </p>
                </figcaption>
            </figure>

            <ul className="space-y-5 rounded-[2rem] bg-sand p-6 md:rounded-[2.5rem]">
                <li className="flex items-start gap-4">
                    <span className="mt-0.5 text-accent"><TruckIcon size={18} /></span>
                    <div>
                        <h3 className="label-sm text-[11px] tracking-[0.1em]">100% Cash on Delivery</h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted">Inspect your heirloom fabric at your doorstep prior to payment. No card required.</p>
                    </div>
                </li>
                <li className="flex items-start gap-4">
                    <span className="mt-0.5 text-accent"><BellIcon size={18} /></span>
                    <div>
                        <h3 className="label-sm text-[11px] tracking-[0.1em]">Pre-Eid WhatsApp Dispatch</h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted">Instant video dispatches and live tracking notifications straight to your phone.</p>
                    </div>
                </li>
            </ul>
        </aside>
    );
}