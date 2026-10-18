import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Motion";
import LoginPromo from "@/components/auth/LoginPromo";
import LoginCard from "@/components/auth/LoginCard";
import TrustStrip from "@/components/auth/TrustStrip";

export const metadata: Metadata = { title: "Sign in — ÉPURE Atelier" };

export default function LoginPage() {
    return (
        <>
            <header className="flex justify-center py-8 md:py-10">
                <Link href="/" className="font-serif text-xl tracking-[0.16em]">ÉPURE</Link>
            </header>

            <main className="wrap pb-12 md:pb-20">
                <div className="grid items-start gap-6 lg:grid-cols-[5fr_7fr] lg:gap-8">
                    <Reveal className="order-2 lg:order-1">
                        <LoginPromo />
                    </Reveal>
                    <Reveal delay={0.08} className="order-1 lg:order-2 lg:mt-4">
                        <LoginCard />
                    </Reveal>
                </div>

                <Reveal className="mt-10">
                    <TrustStrip />
                </Reveal>
            </main>

            <footer className="label-sm pb-10 text-center text-[10px] tracking-[0.14em] text-muted">
                © 2025 ÉPURE Atelier S.A. • All rights reserved
            </footer>
        </>
    );
}