import { images } from "@/lib/images";
import Image from "next/image";

const cardCls = "group relative flex min-h-64 items-end overflow-hidden rounded bg-sand text-white";
const imgCls = "object-cover transition-transform duration-700 group-hover:scale-[1.03]";
const shade = "absolute inset-0 bg-gradient-to-b from-transparent from-40% to-black/70";

const reasons = [
  {
    step: "Reason 01",
    title: "Churned, never centrifuged",
    image: images.benChurn,
    body: "We make ghee the bilona way — milk is set into curd, then churned by hand to butter. Industrial ghee skips straight to machine-separated cream, which loses the aroma and the character.",
    alt: "Fresh cream being churned into butter",
  },
  {
    step: "Reason 02",
    title: "Grass-fed, single source",
    image: images.benFarm,
    body: "Every jar traces back to one herd of desi cows grazing open pasture. Milk from grass-fed animals carries more vitamin K2 and conjugated linoleic acid than grain-fed, confined dairy.",
    alt: "Dairy shelf with milk and butter in a farmhouse",
  },
  {
    step: "Reason 03",
    title: "Stable at high heat",
    image: images.benKitchen,
    body: "With a smoke point around 250 °C, ghee holds up to tadka, frying and dum cooking where refined oils turn rancid and release free radicals. No trans fat, nothing hydrogenated.",
    alt: "A pot of ghee simmering on a kitchen stove",
  },
];

export default function Benefits() {
  return (
    <section id="why" className="scroll-mt-24 py-16 md:py-28">
      <div className="wrap">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="eyebrow mb-2">Why Organic Ghee</p>
            <h2 className="font-serif text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight tracking-tight">
              Three Reasons It Tastes — and Works — Differently
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted">
            Ghee is clarified butter, but how it is clarified decides everything:
            the aroma, the nutrition that survives the process, and what happens
            when it hits a hot pan.
          </p>
        </div>

        <div className="grid min-h-[34rem] gap-4 md:grid-cols-[1.55fr_1fr] md:grid-rows-2">
          <article className={`${cardCls} min-h-96 md:row-span-2`}>
            <Image src={reasons[0].image} alt={reasons[0].alt} fill sizes="(max-width:768px) 100vw, 60vw" className={imgCls} />
            <div className={shade} />
            <div className="relative max-w-[30rem] p-6">
              <small className="label-sm mb-1 block text-[10px] opacity-80">{reasons[0].step}</small>
              <h3 className="mb-2 font-serif text-2xl leading-snug">{reasons[0].title}</h3>
              <p className="text-xs opacity-85">{reasons[0].body}</p>
            </div>
          </article>

          {reasons.slice(1).map((r) => (
            <article key={r.title} className={cardCls}>
              <Image src={r.image} alt={r.alt} fill sizes="(max-width:768px) 100vw, 40vw" className={imgCls} />
              <div className={shade} />
              <div className="relative p-6">
                <small className="label-sm mb-1 block text-[10px] opacity-80">{r.step}</small>
                <h3 className="mb-2 font-serif text-2xl leading-snug">{r.title}</h3>
                <p className="text-xs opacity-85">{r.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
