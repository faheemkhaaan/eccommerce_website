import { MessageCircle, PackageSearch } from "lucide-react";

export function ClientCare() {
    return (
        <section
            aria-labelledby="care-title"
            className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-10"
        >
            <div className="flex flex-col gap-8 rounded-3xl bg-[#eceae4] px-6 py-10 sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
                <div className="max-w-xl">
                    <p className="eyebrow inline-flex items-center gap-2.5 text-[#4b463f]">
                        <span
                            className="live-dot h-2 w-2 rounded-full bg-[#22965e]"
                            aria-hidden="true"
                        />
                        Atelier Client Care
                        <span className="text-[#b8b0a2]" aria-hidden="true">•</span>
                        Live
                    </p>
                    <h2
                        id="care-title"
                        className="mt-3.5 font-display text-2xl font-medium tracking-[-0.01em] text-[#23201b] sm:text-[28px]"
                    >
                        Need Assistance with an Order or Sizing?
                    </h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-[#75706a]">
                        Our bespoke stylists and dispatch concierge are available on
                        WhatsApp to instantly locate unlisted drops, check size
                        allotments, or retrieve order status.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                    <a
                        href="#"
                        className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#191713] px-7 eyebrow text-[#f6f4f0] transition-all duration-300 hover:bg-[#332e27] hover:shadow-[0_8px_20px_rgba(25,23,19,0.18)]"
                    >
                        <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                        Chat on WhatsApp
                    </a>
                    <a
                        href="#"
                        className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-[#d2ccc0] bg-[#f6f4f0]/60 px-7 eyebrow text-[#2b2823] transition-all duration-300 hover:border-[#b8b0a2] hover:bg-[#fcfbf9]"
                    >
                        <PackageSearch className="h-4 w-4" strokeWidth={1.5} />
                        Track Order
                    </a>
                </div>
            </div>
        </section>
    );
}
