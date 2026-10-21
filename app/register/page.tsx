import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Reveal } from "@/components/Motion";
import RegisterTrust from "@/components/auth/RegisterTrust";
import RegisterForm from "@/components/auth/RegisterForm";
import RegisterPromo from "@/components/auth/RegisterPromo";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Create your account — ÉPURE Atelier" };

type Props = { searchParams: Promise<{ next?: string }> };

export default function RegisterPage({ searchParams }: Props) {
    return (
        <>
            <header className="flex justify-center py-8 md:py-10">
                <Link href="/" className="font-serif text-xl tracking-[0.16em]">ÉPURE</Link>
            </header>

            <main className="wrap pb-12 md:pb-20">
                <div className="grid items-start gap-6 lg:grid-cols-[2fr_3fr] lg:gap-8">
                    <Reveal className="order-2 lg:sticky lg:top-8 lg:order-1">
                        <RegisterPromo />
                    </Reveal>
                    <Reveal delay={0.08} className="order-1 lg:order-2">
                        {/* Wrap the component relying on searchParams in Suspense */}
                        <Suspense fallback={<div className="h-100 animate-pulse rounded-lg bg-muted/20" />}>
                            <ResolvedRegisterForm searchParams={searchParams} />
                        </Suspense>
                    </Reveal>
                </div>

                <Reveal className="mt-12">
                    <RegisterTrust />
                </Reveal>
            </main>

            <footer className="label-sm pb-10 text-center text-[10px] tracking-[0.14em] text-muted">
                © 2025 ÉPURE Atelier S.A. • All rights reserved
            </footer>
        </>
    );
}

async function ResolvedRegisterForm({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const { next } = await searchParams;
    return <RegisterForm next={safeNext(next)} />;
}