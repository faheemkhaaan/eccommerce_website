import { TruckIcon, CashIcon, ReturnIcon } from "./Icons";
import { DELIVERY_FLAT, FREE_DELIVERY_FROM, money } from "@/lib/cart-math";

const items = [
  {
    icon: TruckIcon,
    title: "48-hour dispatch",
    body: `Orders placed before 4 pm are packed the same day. Lahore, Karachi and Islamabad usually arrive within 48 hours. Delivery is ${money(DELIVERY_FLAT)}, free on orders above ${money(FREE_DELIVERY_FROM)}.`,
  },
  {
    icon: CashIcon,
    title: "Cash on delivery",
    body: "Inspect the jar at your door, then pay the rider in cash. No card details, no advance transfer, no account needed to browse.",
  },
  {
    icon: ReturnIcon,
    title: "7-day returns",
    body: "If a jar arrives damaged or unopened and unwanted, tell us within 7 days and we will replace it or refund it — delivery cost on us.",
  },
];

export default function Delivery() {
  return (
    <section id="delivery" className="scroll-mt-24 py-16 md:py-20">
      <div className="wrap">
        <p className="eyebrow mb-3">Delivery &amp; Payment</p>
        <h2 className="max-w-xl font-serif text-[clamp(1.9rem,3.2vw,2.4rem)] leading-tight tracking-tight">
          Ordered Today, Churned Fresh, Paid at the Door.
        </h2>

        <ul className="mt-10 grid gap-8 sm:grid-cols-3">
          {items.map((it) => (
            <li key={it.title}>
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-sand text-accent">
                <it.icon size={18} />
              </span>
              <h3 className="mt-4 font-serif text-lg">{it.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">{it.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
