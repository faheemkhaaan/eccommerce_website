import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
    return (
        <>
            <Header variant="solid" />
            <main className="wrap flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
                <p className="eyebrow mb-4">Error 404</p>
                <h1 className="font-serif text-[clamp(2rem,5vw,3.2rem)] leading-tight tracking-tight">
                    That page is not on the shelf.
                </h1>
                <p className="mt-5 max-w-md text-sm text-muted">
                    The link you followed no longer exists. The ghee, however, very much does.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link href="/collections" className="label-sm inline-flex h-11 items-center rounded-full bg-ink px-6 text-[11px] text-white transition hover:bg-ink/85">
                        Shop the ghee
                    </Link>
                    <Link href="/" className="label-sm inline-flex h-11 items-center rounded-full border border-line px-6 text-[11px] transition hover:border-ink">
                        Back home
                    </Link>
                </div>
            </main>
            <Footer />
        </>
    );
}
