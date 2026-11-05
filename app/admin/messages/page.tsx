import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { deleteMessage, markHandled } from "@/app/admin/messages/actions";
import StatusNote, { NotesType } from "@/components/admin/StatusNote";
import { MailIcon, HeadsetIcon } from "@/components/Icons";
import { fmtMessageDate, topicLabel, whatsappHref } from "@/lib/contact";
import { listMessageQueue, type ContactMessage } from "@/lib/contact-queries";
import { localPhone, toE164 } from "@/lib/phone";
import { requireRole } from "@/lib/roles";

export const metadata: Metadata = { title: "Messages — Organic Ghee" };

type Props = { searchParams: Promise<{ status?: NotesType }> };

export default function AdminMessagesPage({ searchParams }: Props) {
    return (
        <Suspense fallback={<InboxSkeleton />}>
            <ResolvedInbox searchParams={searchParams} />
        </Suspense>
    );
}

async function ResolvedInbox({ searchParams }: Props) {
    await requireRole("admin", "/admin/messages");

    const [{ status }, messages] = await Promise.all([searchParams, listMessageQueue()]);
    const waiting = messages.filter((m) => m.status === "new");

    return (
        <div className="max-w-3xl">
            <header>
                <p className="eyebrow">Support</p>
                <h1 className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] leading-tight tracking-tight">
                    Messages
                </h1>
                <p className="mt-3 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
                    What customers send through the contact form. Guests can write too, so some of these
                    have no account attached — the reply address on the message is the only way back to
                    them.
                </p>
                <StatusNote status={status} />
            </header>

            {waiting.length > 0 && (
                <p className="mt-6 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-[0.8rem] text-accent">
                    {waiting.length === 1 ? "1 message is" : `${waiting.length} messages are`} waiting on a reply.
                </p>
            )}

            <div className="mt-6 space-y-4">
                {messages.map((message) => (
                    <MessageCard key={message.id} message={message} />
                ))}
                {messages.length === 0 && (
                    <p className="text-[0.85rem] text-muted">
                        Nothing here yet. Messages arrive the moment somebody uses the contact form.
                    </p>
                )}
            </div>
        </div>
    );
}

/** Order IDs look like `OG-XXXXXX`; anything else is text the customer typed. */
const looksLikeOrder = (ref: string) => /^OG-[A-Z0-9]{4,}$/i.test(ref);

function MessageCard({ message }: { message: ContactMessage }) {
    const handled = message.status === "handled";
    const phone = message.phone ? toE164(message.phone) : "";

    return (
        <article className="rounded-xl border border-line bg-sand/25 p-5">
            <div className="flex flex-wrap items-center gap-3">
                <span
                    className={`label-sm rounded-full px-2 py-1 text-[9px] ${handled ? "bg-leaf/15 text-leaf" : "bg-accent/15 text-accent"
                        }`}
                >
                    {handled ? "Handled" : "Waiting"}
                </span>
                <span className="label-sm rounded-full bg-white px-2 py-1 text-[9px] text-muted ring-1 ring-line">
                    {topicLabel(message.topic)}
                </span>
                <span className="label-sm text-[9px] text-muted">
                    {message.name} · {fmtMessageDate(message.createdAt)}
                    {message.userId ? " · account" : " · guest"}
                </span>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-[0.9rem] leading-relaxed">{message.body}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-[0.8rem]">
                {message.email && (
                    <a href={`mailto:${message.email}`} className="inline-flex items-center gap-2 underline underline-offset-4">
                        <MailIcon size={14} />
                        {message.email}
                    </a>
                )}
                {phone && (
                    <>
                        <a href={`tel:${phone}`} className="inline-flex items-center gap-2 underline underline-offset-4">
                            <HeadsetIcon size={14} />
                            {localPhone(message.phone)}
                        </a>
                        {/* Replying on WhatsApp is usually one tap from the inbox. */}
                        <a
                            href={whatsappHref(`Assalam o Alaikum ${message.name}, about your message to us:`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted underline underline-offset-4 hover:text-ink"
                        >
                            WhatsApp
                        </a>
                    </>
                )}
                {message.orderRef && (
                    looksLikeOrder(message.orderRef) ? (
                        <Link
                            href={`/admin/orders/${message.orderRef.toUpperCase()}`}
                            className="ml-auto underline underline-offset-4 hover:text-ink"
                        >
                            Order {message.orderRef.toUpperCase()}
                        </Link>
                    ) : (
                        <span className="ml-auto text-muted">Mentions “{message.orderRef}”</span>
                    )
                )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {!handled && (
                    <form action={markHandled}>
                        <input type="hidden" name="id" value={message.id} />
                        <button type="submit" className="btn btn-solid hover:opacity-85">
                            Mark handled
                        </button>
                    </form>
                )}
                <form action={deleteMessage}>
                    <input type="hidden" name="id" value={message.id} />
                    <button type="submit" className="btn border border-line bg-paper text-ink hover:opacity-70">
                        Delete
                    </button>
                </form>
            </div>
        </article>
    );
}

/** Shape-matched fallback for the inbox. */
function InboxSkeleton() {
    return (
        <div className="max-w-3xl">
            <div className="h-3 w-16 animate-pulse rounded-full bg-muted/15" />
            <div className="mt-4 h-10 w-48 animate-pulse rounded-full bg-muted/15" />
            <div className="mt-3 h-3 w-full max-w-2xl animate-pulse rounded-full bg-muted/10" />

            <div className="mt-8 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <article key={i} className="rounded-xl border border-line bg-sand/25 p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-4 w-16 animate-pulse rounded-full bg-muted/10" />
                            <div className="h-4 w-28 animate-pulse rounded-full bg-muted/10" />
                            <div className="h-3 w-24 animate-pulse rounded-full bg-muted/10" />
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="h-3 w-full animate-pulse rounded-full bg-muted/10" />
                            <div className="h-3 w-4/5 animate-pulse rounded-full bg-muted/10" />
                        </div>
                        <div className="mt-4 flex gap-4 border-t border-line pt-4">
                            <div className="h-3 w-40 animate-pulse rounded-full bg-muted/10" />
                            <div className="h-3 w-28 animate-pulse rounded-full bg-muted/10" />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <div className="h-10 w-32 animate-pulse rounded-lg bg-muted/10" />
                            <div className="h-10 w-24 animate-pulse rounded-lg bg-muted/10" />
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
