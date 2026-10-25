import { Detail } from "@/lib/product-details";

/**
 * The education layer of the product page: why ghee behaves differently in the
 * kitchen, how it stacks up against the refined oil it usually replaces, and
 * what is actually in the jar. It is what a customer reads before spending
 * Rs 3,000 on a fat — so it carries the real numbers.
 */
export default function ProductFacts({ product: p }: { product: Detail }) {
    // Products added from the dashboard have no editorial copy yet, so every
    // section is empty and the whole block is better left out than rendered as
    // three headings with nothing under them.
    if (!p.benefits.length && !p.comparison.length && !p.nutrition.length) return null;

    return (
        <div className="mt-14 space-y-16 border-t border-line pt-14 md:mt-20 md:space-y-24 md:pt-20">
            {p.benefits.length > 0 && (
                <section>
                    <p className="eyebrow mb-2 text-accent">Why It Matters</p>
                    <h2 className="max-w-2xl font-serif text-[clamp(1.7rem,3vw,2.2rem)] leading-tight tracking-tight">
                        What Ghee Does That Refined Oil Cannot
                    </h2>
                    <ul className="mt-9 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                        {p.benefits.map((b) => (
                            <li key={b.title} className="border-t border-line pt-5">
                                <h3 className="font-serif text-lg leading-snug">{b.title}</h3>
                                <p className="mt-2 text-xs leading-relaxed text-muted">{b.body}</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {p.comparison.length > 0 && (
                <section className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
                    <div>
                        <p className="eyebrow mb-2 text-accent">Compared</p>
                        <h2 className="font-serif text-[clamp(1.7rem,3vw,2.2rem)] leading-tight tracking-tight">
                            Ghee vs. Refined Oil &amp; Vanaspati
                        </h2>
                        <p className="mt-4 max-w-md text-sm text-muted">
                            Most kitchens in Pakistan cook with refined sunflower or canola
                            oil, or with vanaspati shortening. Here is the honest difference,
                            row by row.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-120 border-collapse text-sm">
                            <caption className="sr-only">Our ghee compared with refined cooking oil and vanaspati</caption>
                            <thead>
                                <tr className="label-sm text-[10px] text-muted">
                                    <th scope="col" className="pb-3 text-left font-normal">Property</th>
                                    <th scope="col" className="pb-3 text-left font-normal text-ink">Our ghee</th>
                                    <th scope="col" className="pb-3 text-left font-normal">Refined oil / vanaspati</th>
                                </tr>
                            </thead>
                            <tbody>
                                {p.comparison.map((r) => (
                                    <tr key={r.label} className="border-t border-line align-top">
                                        <th scope="row" className="py-3.5 pr-4 text-left font-normal text-muted">{r.label}</th>
                                        <td className="py-3.5 pr-4">{r.ours}</td>
                                        <td className="py-3.5 text-muted">{r.others}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {p.nutrition.length > 0 && (
                <section>
                    <p className="eyebrow mb-2 text-accent">Nutrition</p>
                    <h2 className="font-serif text-[clamp(1.7rem,3vw,2.2rem)] leading-tight tracking-tight">
                        What Is in 100 g
                    </h2>
                    <p className="mt-4 max-w-lg text-sm text-muted">
                        Ghee is a pure fat, so the numbers are high per 100 g — a normal
                        serving is a teaspoon, about 5 g.
                    </p>
                    <dl className="mt-8 grid gap-x-12 sm:grid-cols-2">
                        {p.nutrition.map((n) => (
                            <div key={n.label} className="flex justify-between border-b border-line py-3 text-sm">
                                <dt className="text-muted">{n.label}</dt>
                                <dd>{n.value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}
        </div>
    );
}
