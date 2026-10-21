import Link from "next/link";

export default function AuthErrorPage() {
    return (
        <main className="wrap grid min-h-[70vh] place-items-center text-center">
            <div>
                <h1 className="font-serif text-4xl">This link has expired</h1>
                <p className="mx-auto mt-4 max-w-md text-sm text-muted">
                    Verification links work once and expire quickly. Sign in to request a fresh one.
                </p>
                <Link href="/login" className="label-sm mt-8 inline-flex h-12 items-center rounded-full bg-ink px-8 text-[11px] text-white">
                    Back to sign in
                </Link>
            </div>
        </main>
    );
}