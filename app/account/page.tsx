import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountProfile from "@/components/account/AccountProfile";

export const metadata: Metadata = { title: "My account — ÉPURE Atelier" };

export default function AccountPage() {
    return (
        <>
            <Header variant="solid" />
            <main className="wrap py-10 md:py-14">
                <header className="mb-8">
                    <p className="eyebrow">Client Suite</p>
                    <h1 className="mt-3 font-serif text-[clamp(2.1rem,4.4vw,3.2rem)] leading-[1.05] tracking-tight">
                        Your atelier account
                    </h1>
                    <p className="mt-4 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
                        Your details, your delivery address, and every parcel you have ordered from this browser.
                    </p>
                </header>
                <AccountProfile />
            </main>
            <Footer />
        </>
    );
}
