import { images } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "./Icons";

const steps = [
  { n: "01", title: "Morning milk", body: "Whole, unhomogenised milk from our own herd of desi cows, milked the same morning it is used." },
  { n: "02", title: "Set to curd", body: "Inoculated with a live culture and left overnight. This culturing step is what bilona ghee is built on." },
  { n: "03", title: "Hand-churned", body: "Churned the traditional way until the butter lifts out of the buttermilk — no centrifuge, no shortcuts." },
  { n: "04", title: "Slow simmered", body: "Clarified gently until the milk solids settle and the butterfat turns clear, golden and nutty." },
];

const stats = [
  { value: "1 herd", label: "Single source milk" },
  { value: "0", label: "Additives or colour" },
  { value: "12 mo", label: "Shelf life, unopened" },
];

export default function Philosophy() {
  return (
    <section id="process" className="scroll-mt-24 py-16 md:py-28">
      <div className="wrap grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="relative aspect-[1/1.05]">
          <div className="absolute bottom-[22%] left-0 right-[28%] top-0 overflow-hidden rounded-[3px] bg-sand">
            <Image src={images.craftHands} alt="Milk being poured into a churn" fill sizes="30vw" className="object-cover object-[100%_50%]" />
          </div>
          <div className="absolute bottom-0 left-[32%] right-0 top-[30%] overflow-hidden rounded-[3px] bg-[#e6dcc6] shadow-[0_24px_50px_-20px_rgba(40,30,20,0.45)]">
            <Image src={images.craftLoom} alt="A farmhouse kitchen table set for churning" fill sizes="30vw" className="object-cover" />
          </div>
        </div>

        <div>
          <p className="eyebrow mb-2">Our Process</p>
          <h2 className="mb-5 max-w-sm font-serif text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight tracking-tight">
            Four Steps, and Not One of Them Rushed.
          </h2>
          <p className="mb-8 max-w-120 text-sm text-muted">
            A jar of ghee can be made in an afternoon with a cream separator and a
            boiler. We take about two days instead, because that is what it takes for
            the flavour and the nutrients to come through intact.
          </p>

          <ol className="mb-8 grid gap-4 sm:grid-cols-2">
            {steps.map((s) => (
              <li key={s.n} className="border-t border-line pt-4">
                <span className="label-sm text-[10px] text-accent">{s.n}</span>
                <h3 className="mt-1.5 font-serif text-lg">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>

          <dl className="mb-8 flex flex-wrap gap-10 border-t border-line pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-serif text-3xl leading-none">{s.value}</dt>
                <dd className="label-sm mt-2 text-[10px] text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>

          <Link
            href="/products/bilona-organic-ghee"
            className="label-sm inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-[11px] tracking-[0.12em] transition hover:border-current"
          >
            Read the full product notes <ArrowIcon size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}
