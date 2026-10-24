import { CashIcon, HeadsetIcon, LeafIcon, ReturnIcon } from "../Icons";

const items = [
    { icon: <LeafIcon size={18} />, title: "100% Pure Ghee", text: "No vanaspati, no additives" },
    { icon: <CashIcon size={18} />, title: "Cash on Delivery", text: "Pay when it reaches you" },
    { icon: <ReturnIcon size={18} />, title: "7-Day Returns", text: "Unopened jars, no questions" },
    { icon: <HeadsetIcon size={18} />, title: "Direct Support", text: "We answer on WhatsApp" },
];

export default function RegisterTrust() {
    return (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((it) => (
                <li key={it.title} className="flex items-center gap-4 rounded-full bg-sand px-6 py-4">
                    <span className="text-accent">{it.icon}</span>
                    <div>
                        <p className="label-sm text-[11px] tracking-[0.08em]">{it.title}</p>
                        <p className="text-[11px] text-muted">{it.text}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}
