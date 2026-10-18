import { images } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";
import Carousel from "./Carousel";

const shots = images.community;

export default function Community() {
  return (
    <section className="py-16 md:py-28">
      <div className="wrap">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="eyebrow mb-2">Living with ÉPURE</p>
            <h2 className="font-serif text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight tracking-tight">The Atelier Community</h2>
          </div>
          <Link href="#" className="label-sm text-[11px] tracking-[0.12em] text-muted hover:text-ink">Follow @epure.atelier</Link>
        </div>

        <Carousel label="Community photos" gap="gap-3">
          {shots.map((src, i) => (
            <li
              key={`${src}-${i}`}
              className="relative aspect-square w-[42%] shrink-0 snap-start overflow-hidden rounded-[3px] bg-[#d8d0c2] sm:w-[30%] lg:w-[calc((100%_-_3rem)/5)]"
            >
              <Image src={src} alt={`Community photo ${i + 1}`} fill sizes="(max-width:640px) 42vw, (max-width:1024px) 30vw, 20vw" className="object-cover" />
            </li>
          ))}
        </Carousel>
      </div>
    </section>
  );
}