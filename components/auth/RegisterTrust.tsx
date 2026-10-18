import { FabricIcon, HeadsetIcon, ReturnIcon, RulerIcon } from "../Icons";

const items = [
    { icon: <FabricIcon size={18} />, title: "Chiffon & Organza", text: "Authentic yarn-dyed silks" },
    { icon: <RulerIcon size={18} />, title: "Custom Fit Vault", text: "Stores your exact silhouette" },
    { icon: <ReturnIcon size={18} />, title: "Hassle-Free Exchange", text: "7-day doorstep collection" },
    { icon: <HeadsetIcon size={18} />, title: "WhatsApp Stylist", text: "Direct artisan assistance" },
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