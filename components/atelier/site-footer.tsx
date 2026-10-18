import { footerColumns, boutiques, journalLinks, policies } from "@/lib/atelier-data";

export function SiteFooter() {
    return (
        <footer className="mt-auto border-t border-[#e2ded6] bg-[#eceae4]">
            <div className="mx-auto max-w-[1400px] px-4 pb-8 pt-14 sm:px-6 lg:px-10">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
                    {/* brand + newsletter */}
                    <div className="max-w-sm">
                        <p className="font-display text-lg font-medium tracking-[0.06em] text-[#191713]">
                            ÉPURE ATELIER
                        </p>
                        <p className="mt-3.5 text-sm leading-relaxed text-[#75706a]">
                            Deliberate aesthetics, archival silhouettes, and sustainable
                            artisanal craftsmanship engineered for high discernment.
                        </p>

                        <p className="eyebrow mt-8 text-[#4b463f]">Dispatch Newsletter</p>
                        <form
                            action="#"
                            className="mt-3 flex h-12 items-center rounded-full border border-[#d8d2c6] bg-[#fcfbf9] p-1.5 pl-5 transition-colors focus-within:border-[#b8b0a2]"
                        >
                            <input
                                type="email"
                                required
                                aria-label="Email address for newsletter"
                                placeholder="Enter your correspondence email"
                                className="h-full w-full min-w-0 bg-transparent text-sm text-[#2b2823] outline-none placeholder:text-[#a39c90]"
                            />
                            <button
                                type="submit"
                                className="h-9 shrink-0 rounded-full bg-[#191713] px-5 eyebrow text-[#f6f4f0] transition-colors hover:bg-[#332e27]"
                            >
                                Join
                            </button>
                        </form>
                    </div>

                    {/* link columns */}
                    {footerColumns.map((col) => (
                        <nav key={col.title} aria-label={col.title}>
                            <p className="eyebrow text-[#4b463f]">{col.title}</p>
                            <ul className="mt-5 space-y-3.5">
                                {col.links.map((link) => (
                                    <li key={link}>
                                        <a
                                            href="#"
                                            className="text-sm text-[#75706a] transition-colors hover:text-[#191713]"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}

                    {/* presence */}
                    <div>
                        <p className="eyebrow text-[#4b463f]">Presence</p>
                        <ul className="mt-5 space-y-3.5">
                            {boutiques.map((b) => (
                                <li key={b} className="text-sm text-[#75706a]">
                                    {b}
                                </li>
                            ))}
                        </ul>

                        <ul className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2">
                            {journalLinks.map((link, i) => (
                                <li key={link} className="flex items-center gap-3">
                                    {i > 0 && (
                                        <span className="text-[#b8b0a2]" aria-hidden="true">
                                            •
                                        </span>
                                    )}
                                    <a
                                        href="#"
                                        className="eyebrow text-[#4b463f] transition-colors hover:text-[#191713]"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* bottom bar */}
                <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[#d8d2c6] pt-7 pb-2 sm:flex-row">
                    <p className="text-[11px] tracking-[0.08em] text-[#8a8378]">
                        © 2025 ÉPURE ATELIER S.A. ALL RIGHTS RESERVED.
                    </p>
                    <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
                        {policies.map((policy) => (
                            <li key={policy}>
                                <a
                                    href="#"
                                    className="text-[11px] uppercase tracking-[0.14em] text-[#6b6459] transition-colors hover:text-[#191713]"
                                >
                                    {policy}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
}
