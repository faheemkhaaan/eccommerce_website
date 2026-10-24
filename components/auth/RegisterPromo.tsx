import Image from "next/image";
import { images } from "@/lib/images";
import { BellIcon, TruckIcon } from "../Icons";

export default function RegisterPromo() {
    return (
        <aside className="space-y-4">
            <figure className="group relative aspect-16/11 overflow-hidden rounded-[2rem] bg-[#d8d0c2] md:rounded-[2.5rem]">
                <Image
                    src={images.benChurn}
                    alt="Fresh cream being hand-churned into butter for ghee"
                    fill
                    sizes="(max-width:1024px) 100vw, 35vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <p className="label-sm text-[10px] tracking-[0.14em] opacity-85">Small Batch · Lahore</p>
                    <p className="mt-2 font-serif text-2xl leading-snug">Hand-Churned Bilona Ghee, Poured to Order</p>
                    <p className="mt-2 text-xs leading-relaxed opacity-85">
                        Never blended, never deodorised. One herd, one recipe, one jar at a time.
                    </p>
                </figcaption>
            </figure>

            <ul className="space-y-5 rounded-[2rem] bg-sand p-6 md:rounded-[2.5rem]">
                <li className="flex items-start gap-4">
                    <span className="mt-0.5 text-accent"><TruckIcon size={18} /></span>
                    <div>
                        <h3 className="label-sm text-[11px] tracking-[0.1em]">100% Cash on Delivery</h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted">
                            Open the jar at your doorstep, then pay. No card, no advance deposit.
                        </p>
                    </div>
                </li>
                <li className="flex items-start gap-4">
                    <span className="mt-0.5 text-accent"><BellIcon size={18} /></span>
                    <div>
                        <h3 className="label-sm text-[11px] tracking-[0.1em]">Dispatch Alerts by Email</h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted">
                            We email the moment your jar leaves the dairy, with a live tracking link.
                        </p>
                    </div>
                </li>
            </ul>
        </aside>
    );
}
