import { CashIcon, HeadsetIcon, LeafIcon } from "../Icons";

const items = [
    { icon: <CashIcon size={20} />, title: "100% Cash on Delivery", text: "Pay at your doorstep anywhere in Pakistan. No card, no advance deposit." },
    { icon: <LeafIcon size={20} />, title: "Churned Fresh Weekly", text: "Small batches made to order, never warehoused for months." },
    { icon: <HeadsetIcon size={20} />, title: "Direct WhatsApp Support", text: "Questions about purity, storage or your parcel answered by the dairy." },
];

export default function TrustStrip() {
    return (
        <ul className="grid gap-6 rounded-4xl bg-sand p-6 sm:p-8 md:grid-cols-3 md:gap-8 md:rounded-[2.5rem]">
            {items.map((it) => (
                <li key={it.title} className="flex items-start gap-4">
                    <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#fbe4dc] text-accent">{it.icon}</span>
                    <div>
                        <h3 className="text-[0.95rem]">{it.title}</h3>
                        <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">{it.text}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}
