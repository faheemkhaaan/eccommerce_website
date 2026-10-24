"use client";

import { images } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
  {
    src: images.hero,
    alt: "A jar of golden ghee with a spoon",
    subtitle: "Small batch — churned weekly",
    title: "Ghee the Slow Way",
    description:
      "Whole milk from grass-fed desi cows, set into curd overnight, then hand-churned and simmered until the butterfat turns clear and golden. Nothing added, nothing rushed.",
  },
  {
    src: images.hero3,
    alt: "Desi cows grazing in an open field",
    subtitle: "One herd — grass-fed",
    title: "From Cows, Not Cream Separators",
    description:
      "Industrial ghee starts with machine-separated cream. Ours starts with cultured curd from a single herd, which is why it smells of caramel and toasted milk instead of tasting flat.",
  },
  {
    src: images.hero5,
    alt: "A warm kitchen with a pan of ghee on the stove",
    subtitle: "High smoke point — about 250 °C",
    title: "Cook Hotter, Taste More",
    description:
      "Tadka, karahi, biryani dum, paratha and halwa — ghee holds its structure where refined oils break down, and it carries the aroma of whatever you cook in it.",
  },
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Autoplay carousel every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = SLIDES[currentIndex];
  const totalSlides = SLIDES.length;
  const progressPercentage = ((currentIndex + 1) / totalSlides) * 100;

  return (
    <section className="relative flex min-h-[min(88vh,820px)] flex-col justify-end overflow-hidden bg-sand text-white">
      {/* Background image carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={currentSlide.src}
              alt={currentSlide.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-[30%_40%]"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10 bg-linear-to-b from-black/35 via-transparent via-30% to-black/55 pointer-events-none" />

      {/* Copy */}
      <div className="wrap relative z-20 pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="label-sm mb-5 inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] backdrop-blur-md">
              {currentSlide.subtitle}
            </span>
            <h1 className="mb-4 max-w-3xl font-serif text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.05] tracking-tight">
              {currentSlide.title}
            </h1>
            <p className="mb-7 max-w-120 text-[0.95rem] opacity-90">
              {currentSlide.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/collections"
                className="label-sm inline-flex h-10 items-center rounded-full bg-white px-6 text-ink transition hover:bg-sand"
              >
                Shop the ghee
              </Link>
              <Link
                href="/#why"
                className="label-sm inline-flex h-10 items-center rounded-full bg-ink/55 px-6 backdrop-blur-md transition hover:bg-ink/75"
              >
                Why organic ghee
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Counters, progress and slide pickers */}
      <div className="wrap label-sm relative z-20 flex flex-col items-start gap-3 pb-7 text-[10px] tracking-[0.14em] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span>
            {String(currentIndex + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
          </span>
          <span className="block h-px w-32 bg-white/35 overflow-hidden">
            <motion.span
              className="block h-full bg-white"
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </span>
        </div>

        <div className="flex items-center gap-3">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 transition-all duration-300 rounded-full ${currentIndex === index ? "w-8 bg-white" : "w-3 bg-white/40 hover:bg-white/70"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <span>Lahore, Pakistan</span>
      </div>
    </section>
  );
}
