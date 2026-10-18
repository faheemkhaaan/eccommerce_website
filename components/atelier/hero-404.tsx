import { Search, ArrowRight } from "lucide-react";
import { quickLinks } from "@/lib/atelier-data";

export function Hero404() {
    return (
        <section className="relative overflow-hidden" aria-labelledby="hero-404-title">
            {/* ghost 404 watermark */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-[13%] z-0 flex select-none justify-center"
            >
                <span className="font-display text-[34vw] font-medium leading-none tracking-tight text-[#d9d3c7]/55 sm:text-[240px] lg:text-[300px]">
                    404
                </span>
            </div>

            {/* faint unraveling thread */}
            <svg
                aria-hidden="true"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                className="pointer-events-none absolute left-1/2 top-[38%] z-0 hidden w-[900px] max-w-full -translate-x-1/2 lg:block"
            >
                <path
                    d="M0,60 C150,20 260,95 400,55 C540,15 660,100 800,60 C920,26 1060,88 1200,50"
                    fill="none"
                    stroke="#cfc7b8"
                    strokeWidth="0.8"
                    strokeDasharray="5 7"
                    opacity="0.7"
                />
            </svg>

            <div className="relative z-10 mx-auto max-w-3xl px-4 pb-20 pt-14 text-center sm:pb-24 sm:pt-20">
                {/* status pill */}
                <p className="animate-rise inline-flex items-center gap-2.5 rounded-full border border-[#e2ded6] bg-[#fcfbf9] px-4 py-2 eyebrow text-[#4b463f] shadow-[0_1px_2px_rgba(25,23,19,0.04)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#b0713e]" aria-hidden="true" />
                    Error 404
                    <span className="text-[#c9c2b5]" aria-hidden="true">•</span>
                    Atelier Archive
                </p>

                {/* headline */}
                <h1
                    id="hero-404-title"
                    className="animate-rise rise-1 mt-8 font-display text-4xl font-medium leading-[1.12] tracking-[-0.01em] text-[#23201b] sm:text-5xl lg:text-[56px]"
                >
                    This Thread Has Unraveled
                </h1>

                {/* copy */}
                <p className="animate-rise rise-2 mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[#75706a] sm:text-base">
                    The bespoke silhouette or editorial page you followed may have been
                    archived, transferred to private vaults, or temporarily relocated
                    while our artisans curate the latest Festive release.
                </p>

                {/* search */}
                <form
                    action="#"
                    className="animate-rise rise-3 mx-auto mt-9 flex h-14 max-w-md items-center gap-3 rounded-full border border-[#e2ded6] bg-[#fcfbf9] py-2 pl-6 pr-2 shadow-[0_2px_12px_rgba(25,23,19,0.05)] transition-colors focus-within:border-[#b8b0a2]"
                    role="search"
                >
                    <Search className="h-[18px] w-[18px] shrink-0 text-[#8a8378]" strokeWidth={1.5} />
                    <input
                        type="search"
                        aria-label="Search the atelier"
                        placeholder="Search unstitched silks, festive kurtis, organza dupattas..."
                        className="h-full w-full min-w-0 bg-transparent text-sm text-[#2b2823] outline-none placeholder:text-[#a39c90]"
                    />
                    <button
                        type="submit"
                        aria-label="Search"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#191713] text-[#f6f4f0] transition-transform duration-300 hover:scale-105"
                    >
                        <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                </form>

                {/* CTAs */}
                <div className="animate-rise rise-4 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <a
                        href="#"
                        className="inline-flex h-12 w-full max-w-xs items-center justify-center rounded-full bg-[#191713] px-8 eyebrow text-[#f6f4f0] transition-all duration-300 hover:bg-[#332e27] hover:shadow-[0_8px_20px_rgba(25,23,19,0.18)] sm:w-auto"
                    >
                        Return to Storefront
                    </a>
                    <a
                        href="#curated"
                        className="inline-flex h-12 w-full max-w-xs items-center justify-center rounded-full border border-[#d8d2c6] bg-transparent px-8 eyebrow text-[#2b2823] transition-all duration-300 hover:border-[#b8b0a2] hover:bg-[#fcfbf9] sm:w-auto"
                    >
                        Explore Festive Collection
                    </a>
                </div>

                {/* quick links */}
                <div className="animate-rise rise-5 mt-9 flex flex-wrap items-center justify-center gap-2.5">
                    <span className="eyebrow mr-1 text-[#a39c90]">Quick links:</span>
                    {quickLinks.map((link) => (
                        <a
                            key={link}
                            href="#"
                            className="rounded-full border border-[#e2ded6] bg-[#fcfbf9] px-4 py-2 text-xs tracking-[0.04em] text-[#4b463f] transition-all duration-300 hover:border-[#b8b0a2] hover:text-[#191713]"
                        >
                            {link}
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
