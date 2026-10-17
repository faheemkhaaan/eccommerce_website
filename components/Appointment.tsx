import Link from "next/link";
import { CalendarIcon } from "./Icons";

export default function Appointment() {
  return (
    <section className="border-y border-line py-7">
      <div className="wrap flex flex-wrap items-center gap-4">
        <span className="grid size-10 place-items-center rounded-full bg-sand"><CalendarIcon size={16} /></span>
        <div className="mr-auto">
          <h3 className="text-sm font-medium">Private Atelier Appointment</h3>
          <p className="text-xs text-muted">Experience individual fitting consultations in our Paris or Tokyo salons.</p>
        </div>
        <Link href="#" className="label-sm inline-flex h-10 items-center rounded-full border border-ink px-6 transition hover:bg-ink hover:text-white">
          Reserve Private Session
        </Link>
      </div>
    </section>
  );
}
