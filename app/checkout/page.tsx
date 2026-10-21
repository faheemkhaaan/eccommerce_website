import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = { title: "Checkout — ÉPURE Atelier" };

export default function CheckoutPage() {
    return (
        <>
            <Header variant="solid" />
            <main className="wrap py-10 md:py-14">
                <header className="mb-8">
                    <p className="eyebrow">Cash on Delivery</p>
                    <h1 className="mt-3 font-serif text-[clamp(2.1rem,4.4vw,3.2rem)] leading-[1.05] tracking-tight">Checkout</h1>
                </header>
                <CheckoutClient />
            </main>
            <Footer />
        </>
    );
}
