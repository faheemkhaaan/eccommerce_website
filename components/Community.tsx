import { images } from "@/lib/images";
import Image from "next/image";
import Carousel from "./Carousel";

const shots = images.community;

export default function Community() {
  return (
    <section className="py-16 md:py-28">
      <div className="wrap">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="eyebrow mb-2">From Our Kitchen</p>
            <h2 className="font-serif text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight tracking-tight">Where the Ghee Ends Up</h2>
          </div>
          <p className="max-w-sm text-sm text-muted">
            Tadka on the stove, a spoon over hot roti, a jar on the breakfast table —
            sent in by the families cooking with it.
          </p>
        </div>

        <Carousel label="Kitchen photos">
          {shots.map((src, i) => (
            <li
              key={`${src}-${i}`}
              className="relative aspect-square w-[42%] shrink-0 snap-start overflow-hidden rounded-[3px] bg-sand sm:w-[30%] lg:w-[calc((100%_-_3rem)/5)]"
            >
              <Image src={src} alt={`Cooking with ghee ${i + 1}`} fill sizes="(max-width:640px) 42vw, (max-width:1024px) 30vw, 20vw" className="object-cover" />
            </li>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
