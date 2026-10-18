import { CashIcon, HeadsetIcon, SendIcon } from "../Icons";

const items = [
    { icon: <CashIcon size={20} />, title: "100% Cash on Delivery", text: "Inspect at doorstep across 18,000+ PIN codes with zero advance deposit." },
    { icon: <SendIcon size={20} />, title: "Pre-Eid Guaranteed Dispatch", text: "Customized tailoring & express air couriers prioritized for celebratory deadlines." },
    { icon: <HeadsetIcon size={20} />, title: "Direct WhatsApp Concierge", text: "Real-time styling advice, custom sleeve alterations, and parcel updates." },
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