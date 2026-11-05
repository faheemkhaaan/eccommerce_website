import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/contact/ContactForm";
import { ChatIcon, HeadsetIcon, MailIcon, ReturnIcon } from "@/components/Icons";
import { isTopic, SUPPORT, whatsappHref, type ContactTopic } from "@/lib/contact";
import { localPhone } from "@/lib/phone";
import { getCurrentUser } from "@/lib/roles";

export const metadata: Metadata = {
    title: "Contact us — Organic Ghee",
    description:
        "Questions about an order, a jar, or the ghee itself — reach the dairy on WhatsApp, by phone, or by email.",
};

type Props = { searchParams: Promise<{ order?: string; topic?: string }> };

export default function ContactPage({ searchParams }: Props) {
    return (
        <>
            <Header variant="solid" active="Contact" />
            <main className="wrap py-10 md:py-14">
                <header className="mb-8">
                    <p className="eyebrow">Reach us</p>
                    <h1 className="mt-3 font-serif text-[clamp(2.1rem,4.4vw,3.2rem)] leading-[1.05] tracking-tight">
                        Talk to the dairy
                    </h1>
                    <p className="mt-4 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
                        Something wrong with a parcel, a question about the ghee, or a jar that did not
                        arrive as it should — WhatsApp is fastest, and the form below reaches the same
                        people. You do not need an account to write to us.
                    </p>
                </header>

                <div className="grid items-start gap-6 lg:grid-cols-[5fr_7fr] lg:gap-8">
                    <div className="space-y-4">
                        {SUPPORT.whatsapp && (
                            <a
                                href={whatsappHref("Assalam o Alaikum — I have a question about my order.")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-[2rem] bg-ink p-6 text-white transition hover:opacity-90 sm:p-8"
                            >
                                <span className="grid size-11 place-items-center rounded-full bg-white/12">
                                    <ChatIcon size={19} />
                                </span>
                                <p className="mt-5 label-sm text-[10px] opacity-70">Fastest</p>
                                <p className="mt-1 font-serif text-2xl leading-tight">WhatsApp us</p>
                                <p className="mt-2 text-[0.85rem] text-white/75">{SUPPORT.whatsapp.label}</p>
                            </a>
                        )}

                        <div className="rounded-[2rem] bg-white p-6 sm:p-8">
                            <p className="eyebrow text-accent">Other ways</p>
                            <ul className="mt-5 space-y-4 text-sm">
                                {SUPPORT.whatsapp && (
                                    <li className="flex items-start gap-3">
                                        <span className="mt-0.5 shrink-0 text-accent">
                                            <HeadsetIcon size={17} />
                                        </span>
                                        <div>
                                            <p className="label-sm text-[10px] text-muted">Call the shop</p>
                                            <a href={SUPPORT.whatsapp.tel} className="underline underline-offset-4">
                                                {SUPPORT.whatsapp.label}
                                            </a>
                                        </div>
                                    </li>
                                )}
                                {SUPPORT.email && (
                                    <li className="flex items-start gap-3">
                                        <span className="mt-0.5 shrink-0 text-accent">
                                            <MailIcon size={17} />
                                        </span>
                                        <div>
                                            <p className="label-sm text-[10px] text-muted">Email</p>
                                            <a href={SUPPORT.email.href} className="underline underline-offset-4">
                                                {SUPPORT.email.label}
                                            </a>
                                        </div>
                                    </li>
                                )}
                                <li className="flex items-start gap-3">
                                    <span className="mt-0.5 shrink-0 text-accent">
                                        <ReturnIcon size={17} />
                                    </span>
                                    <div>
                                        <p className="label-sm text-[10px] text-muted">Packing house</p>
                                        <address className="not-italic leading-relaxed text-muted">
                                            {SUPPORT.address.map((line) => (
                                                <span key={line} className="block">
                                                    {line}
                                                </span>
                                            ))}
                                        </address>
                                    </div>
                                </li>
                            </ul>

                            <p className="mt-6 border-t border-line pt-5 text-xs leading-relaxed text-muted">
                                Chasing a parcel? Your{" "}
                                <Link href="/track-order" className="underline underline-offset-4">
                                    order tracking
                                </Link>{" "}
                                page shows where it is right now — including whether it has left with a rider.
                            </p>
                        </div>
                    </div>

                    <div>
                        {/* Reading searchParams and the session needs a Suspense boundary
                            while the page is prerendered. */}
                        <Suspense fallback={<FormSkeleton />}>
                            <ResolvedForm searchParams={searchParams} />
                        </Suspense>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

/**
 * Fills the form in from whatever context the visitor arrived with: an order ID
 * carried over from an order page, and the account when there is one.
 */
async function ResolvedForm({ searchParams }: Props) {
    const [{ order, topic }, user] = await Promise.all([searchParams, getCurrentUser()]);

    const orderRef = typeof order === "string" ? order.trim() : "";

    // An order in the URL almost certainly means an order question; otherwise the
    // safest guess for a storefront contact page is a question about the product.
    const chosen: ContactTopic =
        typeof topic === "string" && isTopic(topic) ? topic : orderRef ? "order" : "product";

    return (
        <ContactForm
            name=""
            email={user?.email ?? ""}
            phone={user?.phone ? localPhone(user.phone) : ""}
            orderRef={orderRef}
            topic={chosen}
            signedIn={Boolean(user)}
        />
    );
}

/** Shape-matched fallback so the form does not shift the page as it streams in. */
function FormSkeleton() {
    return (
        <div className="rounded-xl border border-line bg-sand/30 p-5 sm:p-6">
            <div className="h-10 w-full animate-pulse rounded-md bg-muted/10" />
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="h-12 animate-pulse rounded-md bg-muted/10" />
                <div className="h-12 animate-pulse rounded-md bg-muted/10" />
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="h-12 animate-pulse rounded-md bg-muted/10" />
                <div className="h-12 animate-pulse rounded-md bg-muted/10" />
            </div>
            <div className="mt-5 h-32 animate-pulse rounded-md bg-muted/10" />
            <div className="mt-5 h-12 w-40 animate-pulse rounded-full bg-muted/15" />
        </div>
    );
}
