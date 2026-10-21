import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrackOrderClient from "@/components/tracking/TrackOrderClient";

export const metadata: Metadata = { title: "Track your parcel — ÉPURE Atelier" };

type Props = { searchParams: Promise<{ id?: string }> };

export default function TrackOrderPage({ searchParams }: Props) {
    return (
        <>
            <Header variant="solid" />
            <main className="wrap py-10 md:py-14">
                <header className="mb-8">
                    <p className="eyebrow">Cash on Delivery</p>
                    <h1 className="mt-3 font-serif text-[clamp(2.1rem,4.4vw,3.2rem)] leading-[1.05] tracking-tight">Track your parcel</h1>
                </header>
                {/* Reading searchParams needs a Suspense boundary while the page is prerendered */}
                <Suspense fallback={<div className="h-100 animate-pulse rounded-[2rem] bg-muted/10" />}>
                    <ResolvedTracker searchParams={searchParams} />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}

// Helper async component so the searched Order ID can seed the tracker on first render
async function ResolvedTracker({ searchParams }: Props) {
    const { id } = await searchParams;
    return <TrackOrderClient initialId={typeof id === "string" ? id : ""} />;
}
