import Link from "next/link";
import { Reveal } from "./Motion";

export default function CollectionHero({ count }: { count: number }) {
    return (
        <section className="border-b border-line">
            <div className="wrap pb-12 pt-6 md:pb-16">
                <nav aria-label="Breadcrumb" className="label-sm mb-10 text-[10px] tracking-[0.14em] text-muted md:mb-14">
                    <ol className="flex flex-wrap items-center gap-2">
                        <li><Link href="/" className="hover:text-ink">Home</Link></li>
                        <li aria-hidden>/</li>
                        <li aria-current="page" className="text-ink">Shop</li>
                    </ol>
                </nav>

                <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl">
                        <Reveal>
                            <p className="eyebrow mb-5 flex items-center gap-3 text-accent">
                                <span className="h-px w-8 bg-current" /> Small batch — churned weekly
                            </p>
                        </Reveal>
                        <Reveal delay={0.08}>
                            <h1 className="font-serif text-[clamp(2.6rem,7vw,4.75rem)] leading-[1.05] tracking-tight">
                                Our Ghee
                            </h1>
                        </Reveal>
                        <Reveal delay={0.16}>
                            <p className="mt-6 max-w-lg text-sm text-muted">
                                One product, made properly: bilona ghee churned from cultured
                                curd and grass-fed desi cow milk. Available in four pack sizes,
                                delivered across Pakistan with cash on delivery.
                            </p>
                        </Reveal>
                    </div>

                    <Reveal delay={0.24} className="md:text-right">
                        <p className="font-serif text-4xl leading-none">
                            {count}
                            <span className="label-sm ml-2 font-sans text-[10px] text-muted">
                                {count === 1 ? "product" : "products"} in the pantry
                            </span>
                        </p>
                        <p className="mt-2 inline-flex items-center gap-2 text-xs text-accent">
                            <i className="size-1.5 rounded-full bg-leaf" />
                            More pantry staples coming soon
                        </p>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
