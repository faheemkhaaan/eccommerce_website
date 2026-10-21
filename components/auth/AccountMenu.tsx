"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

const initials = (s: string) =>
    s.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";

const menu = [
    { href: "/account", label: "My account" },
    { href: "/account#orders", label: "Orders & tracking" },
    { href: "/account#addresses", label: "Delivery addresses" },
];

export default function AccountMenu({ solid }: { solid: boolean }) {
    const user = useAuthStore((s) => s.user);
    const status = useAuthStore((s) => s.status);
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const wrap = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const signOut = async () => {
        setOpen(false);
        await createClient().auth.signOut(); // onAuthStateChange flips the store to "guest"
        router.push("/");
        router.refresh();
    };

    if (status === "loading") {
        return <span aria-hidden className="h-7 w-24 animate-pulse rounded-full bg-current/10" />;
    }

    if (!user) {
        return (
            <div className="flex items-center gap-3">
                <Link href="/login" className="label-sm text-[11px] tracking-[0.1em] opacity-90 transition hover:opacity-100">
                    Sign in
                </Link>
                <Link
                    href="/register"
                    className={`label-sm hidden h-8 items-center rounded-full px-4 text-[10px] tracking-[0.1em] transition sm:inline-flex ${solid ? "bg-ink text-white hover:bg-ink/85" : "bg-white text-ink hover:bg-white/85"
                        }`}
                >
                    Create account
                </Link>
            </div>
        );
    }

    const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Account";
    const avatar = user.user_metadata?.avatar_url as string | undefined;

    return (
        <div ref={wrap} className="relative">
            <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Account menu"
                onClick={() => setOpen((o) => !o)}
                className="grid size-8 place-items-center overflow-hidden rounded-full bg-sand text-[11px] font-medium text-ink ring-offset-2 transition hover:ring-1 hover:ring-current"
            >
                {avatar ? <Image src={avatar} alt="" width={32} height={32} className="size-8 object-cover" /> : initials(name)}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        role="menu"
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-full z-50 mt-3 w-64 origin-top-right rounded-2xl border border-line bg-paper p-2 text-ink shadow-xl"
                    >
                        <div className="border-b border-line px-3 pb-3 pt-2">
                            <p className="truncate text-sm font-medium">{name}</p>
                            <p className="truncate text-xs text-muted">{user.email}</p>
                        </div>
                        <ul className="py-1">
                            {menu.map((m) => (
                                <li key={m.href}>
                                    <Link href={m.href} role="menuitem" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-[0.85rem] transition hover:bg-sand">
                                        {m.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <button type="button" role="menuitem" onClick={signOut} className="w-full rounded-lg border-t border-line px-3 py-2.5 text-left text-[0.85rem] text-muted transition hover:bg-sand hover:text-ink">
                            Sign out
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}