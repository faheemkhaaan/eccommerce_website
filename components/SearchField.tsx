"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "./Icons";

/** Header search. Submitting hands the term to /search, which owns the results. */
export default function SearchField({ solid }: { solid: boolean }) {
    const router = useRouter();
    const [term, setTerm] = useState("");

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const q = term.trim();
        if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
    };

    return (
        <form
            role="search"
            onSubmit={submit}
            className={`hidden items-center gap-2 rounded-full border px-3.5 py-1.5 md:flex ${solid ? "border-line bg-sand" : "border-white/25 bg-white/15 backdrop-blur-md"
                }`}
        >
            <SearchIcon size={14} />
            <input
                type="search"
                name="q"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search atelier collection…"
                aria-label="Search the collection"
                className={`w-36 bg-transparent text-xs outline-none lg:w-44 ${solid ? "placeholder:text-muted" : "text-white placeholder:text-white/70"}`}
            />
            <button type="submit" className="sr-only">Search</button>
        </form>
    );
}
