"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type StaffRole = "admin" | "driver";

const NAV: { href: string; label: string; roles: StaffRole[] }[] = [
    { href: "/admin", label: "Overview", roles: ["admin"] },
    { href: "/admin/revenue", label: "Revenue", roles: ["admin"] },
    { href: "/admin/orders", label: "COD board", roles: ["admin", "driver"] },
    { href: "/admin/team", label: "Riders & roles", roles: ["admin"] },
    { href: "/admin/products", label: "Products & stock", roles: ["admin"] },
    { href: "/admin/messages", label: "Messages", roles: ["admin"] },
    { href: "/admin/reviews", label: "Reviews", roles: ["admin"] },
];

/**
 * The section links, split out of AdminFrame only because the active state needs
 * usePathname, which is a client hook. AdminFrame itself stays a server component
 * so the shell can render before the role check resolves.
 */
export default function AdminNav({ role }: { role: StaffRole }) {
    const pathname = usePathname();
    const items = NAV.filter((item) => item.roles.includes(role));

    return (
        <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {items.map((item) => {
                // /admin is a prefix of everything, so it only counts as current on
                // an exact match; the deeper sections stay lit on their children.
                const current =
                    item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            aria-current={current ? "page" : undefined}
                            className={`label-sm block whitespace-nowrap rounded-lg px-3 py-2 text-[10px] transition ${current
                                ? "bg-paper text-ink shadow-[inset_0_0_0_1px_var(--color-line)]"
                                : "text-muted hover:bg-paper/70 hover:text-ink"
                                }`}
                        >
                            {role === "driver" && item.href === "/admin/orders" ? "My deliveries" : item.label}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
