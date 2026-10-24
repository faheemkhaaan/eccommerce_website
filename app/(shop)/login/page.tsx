import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Reveal } from "@/components/Motion";
import LoginPromo from "@/components/auth/LoginPromo";
import LoginCard from "@/components/auth/LoginCard";
import TrustStrip from "@/components/auth/TrustStrip";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Sign in — Organic Ghee" };

type Props = { searchParams: Promise<{ next?: string }> };

export default function LoginPage({ searchParams }: Props) {
    return (
        <>
            <header className="flex justify-center py-8 md:py-10">
                <Link href="/" className="font-serif text-xl tracking-[0.16em]">Organic Ghee</Link>
            </header>

            <main className="wrap pb-12 md:pb-20">
                <div className="grid items-start gap-6 lg:grid-cols-[5fr_7fr] lg:gap-8">
                    <Reveal className="order-2 lg:order-1">
                        <LoginPromo />
                    </Reveal>

                    <Reveal delay={0.08} className="order-1 lg:order-2 lg:mt-4">
                        {/* Wrap the component relying on searchParams in Suspense */}
                        <Suspense fallback={<div className="h-100 animate-pulse rounded-lg bg-muted/20" />}>
                            <ResolvedLoginCard searchParams={searchParams} />
                        </Suspense>
                    </Reveal>
                </div>

                <Reveal className="mt-10">
                    <TrustStrip />
                </Reveal>
            </main>

            <footer className="label-sm pb-10 text-center text-[10px] tracking-[0.14em] text-muted">
                © 2026 Organic Ghee • Lahore, Pakistan
            </footer>
        </>
    );
}

// Helper async component to safely handle the searchParams promise
async function ResolvedLoginCard({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const { next } = await searchParams;
    return <LoginCard next={safeNext(next)} />;
}