import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { getCurrentUser } from "@/lib/roles";

export const metadata: Metadata = { title: "Checkout — Organic Ghee" };

/**
 * Checkout page (session required — see proxy.ts).
 * The verified mobile number is read on the server and handed to the client checkout, so the
 * "verified" state is always the account's real state rather than a stale browser copy.
 */
export default function CheckoutPage() {
    return (
        <>
            <Header variant="solid" />
            <main className="wrap py-10 md:py-14">
                <header className="mb-8">
                    <p className="eyebrow">Cash on Delivery</p>
                    <h1 className="mt-3 font-serif text-[clamp(2.1rem,4.4vw,3.2rem)] leading-[1.05] tracking-tight">Checkout</h1>
                </header>
                <Suspense fallback={<div className="h-100 animate-pulse rounded-4xl bg-muted/10" />}>
                    <ResolvedCheckout />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}

/**
 * Reads the account's confirmed mobile number. Sits behind <Suspense> because reading the
 * session in a page body is a build error under Cache Components.
 */
async function ResolvedCheckout() {
    const me = await getCurrentUser();
    return <CheckoutClient verifiedPhone={me?.phone} />;
}
