import { ArrowRight, ArrowUpRight } from "lucide-react";
import { products } from "@/lib/atelier-data";

export function ProductShowcase() {
    return (
        <section
            id="curated"
            aria-labelledby="curated-title"
            className="mx-auto max-w-360 px-4 pb-20 sm:px-6 lg:px-10"
        >
            {/* section head */}
            <div className="flex flex-wrap items-end justify-between gap-4 border-t border-[#e2ded6] pt-12">
                <div>
                    <p className="eyebrow text-[#8a6d4a]">Curated Destinations</p>
                    <h2
                        id="curated-title"
                        className="mt-2.5 font-display text-2xl font-medium tracking-[-0.01em] text-[#23201b] sm:text-[28px]"
                    >
                        Perhaps You Intended One of These Pieces
                    </h2>
                </div>
                <a
                    href="#"
                    className="group eyebrow inline-flex items-center gap-1.5 text-[#4b463f] transition-colors hover:text-[#191713]"
                >
                    View Entire Spring Run
                    <ArrowUpRight
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        strokeWidth={1.5}
                    />
                </a>
            </div>

            {/* cards */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {products.map((product) => (
                    <article
                        key={product.id}
                        className="group flex flex-col rounded-2xl border border-[#e9e5dd] bg-[#fcfbf9] p-3 shadow-[0_1px_3px_rgba(25,23,19,0.04)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(25,23,19,0.09)]"
                    >
                        <div className="relative overflow-hidden rounded-xl bg-[#eceae4]">
                            <div className="aspect-[4/5] w-full">
                                <img
                                    src={product.image}
                                    alt={product.alt}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                                />
                            </div>
                            <span className="absolute left-3 top-3 rounded-full bg-[#f6f4f0]/95 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#4b463f] shadow-sm backdrop-blur-sm">
                                {product.badge}
                            </span>
                        </div>

                        <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a39c90]">
                                {product.category}
                            </p>
                            <h3 className="mt-1.5 font-display text-lg font-medium leading-snug text-[#23201b]">
                                {product.name}
                            </h3>
                            <div className="mt-4 flex items-center justify-between border-t border-[#efebe3] pt-4">
                                <p className="text-sm font-medium tracking-[0.02em] text-[#191713]">
                                    {product.price}
                                </p>
                                <a
                                    href="#"
                                    className="group/link inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4b463f] transition-colors hover:text-[#191713]"
                                    aria-label={`Explore ${product.name}`}
                                >
                                    Explore
                                    <ArrowRight
                                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1"
                                        strokeWidth={1.5}
                                    />
                                </a>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
