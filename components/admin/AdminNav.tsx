"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/products", label: "Products & stock" },
];

/**
 * The section links, split out of AdminFrame only because the active state needs
 * usePathname, which is a client hook. AdminFrame itself stays a server component
 * so the shell can render before the role check resolves.
 */
export default function AdminNav() {
    const pathname = usePathname();

    return (
        <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {NAV.map((item) => {
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
                            className={`label-sm block whitespace-nowrap rounded-lg px-3 py-2 text-[10px] transition ${
                                current
                                    ? "bg-paper text-ink shadow-[inset_0_0_0_1px_var(--color-line)]"
                                    : "text-muted hover:bg-paper/70 hover:text-ink"
                            }`}
                        >
                            {item.label}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
