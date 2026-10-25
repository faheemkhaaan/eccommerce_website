import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountProfile from "@/components/account/AccountProfile";
import { listMyOrders } from "@/lib/order-queries";

export const metadata: Metadata = { title: "My account — Organic Ghee" };

export default function AccountPage() {
    return (
        <>
            <Header variant="solid" />
            <main className="wrap py-10 md:py-14">
                <header className="mb-8">
                    <p className="eyebrow">Your Account</p>
                    <h1 className="mt-3 font-serif text-[clamp(2.1rem,4.4vw,3.2rem)] leading-[1.05] tracking-tight">
                        Your pantry account
                    </h1>
                    <p className="mt-4 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
                        Your details, your delivery address, and every parcel on this account.
                    </p>
                </header>
                <Suspense fallback={<div className="h-100 animate-pulse rounded-[2rem] bg-muted/10" />}>
                    <ResolvedAccount />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}

async function ResolvedAccount() {
    const orders = await listMyOrders();
    return <AccountProfile orders={orders} />;
}
