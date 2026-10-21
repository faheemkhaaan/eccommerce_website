"use client";

import { images } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Update your HERO_IMAGES with actual image paths or objects from your images lib
const HERO_IMAGES = [
  {
    src: images.hero, // or your specific image source/object
    alt: "Edition No. 08 - Slide 1",
    subtitle: "Edition No. 08 — 2025",
    title: "Quiet Modernity",
    description: "Sculpted silhouettes shaped from unprocessed raw silk, hand-spun Andean alpaca, and unbleached Belgian linen. Built for permanence and calm authority.",
  },
  {
    src: images.hero2 || images.hero, // Replace with your secondary images
    alt: "Edition No. 08 - Slide 2",
    subtitle: "Edition No. 09 — 2025",
    title: "Raw & Refined",
    description: "Organic textures and earthy palettes reflecting architectural silhouettes designed for effortless transitional wear.",
  },
  {
    src: images.hero3 || images.hero, // Replace with your tertiary images
    alt: "Edition No. 08 - Slide 3",
    subtitle: "Edition No. 10 — 2026",
    title: "The Minimalistsp Edit",
    description: "Fluid drapery meets structured tailoring. Crafted with sustainable luxury and uncompromising attention to detail.",
  },
  {
    src: images.hero4 || images.hero, // Replace with your secondary images
    alt: "Edition No. 08 - Slide 2",
    subtitle: "Edition No. 09 — 2025",
    title: "Raw & Refined",
    description: "Organic textures and earthy palettes reflecting architectural silhouettes designed for effortless transitional wear.",
  },
  {
    src: images.hero5 || images.hero, // Replace with your secondary images
    alt: "Edition No. 08 - Slide 2",
    subtitle: "Edition No. 09 — 2025",
    title: "Raw & Refined",
    description: "Organic textures and earthy palettes reflecting architectural silhouettes designed for effortless transitional wear.",
  },
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Optional: Autoplay carousel every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = HERO_IMAGES[currentIndex];
  const totalSlides = HERO_IMAGES.length;
  const progressPercentage = ((currentIndex + 1) / totalSlides) * 100;

  return (
    <section className="relative flex min-h-[min(88vh,820px)] flex-col justify-end overflow-hidden bg-[#d8d0c2] text-white">
      {/* Background Image Carousel with Framer Motion AnimatePresence */}
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

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-linear-to-b from-black/35 via-transparent via-30% to-black/55 pointer-events-none" />

      {/* Content Area with smooth fade & slide transitions */}
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
            <h1 className="mb-4 font-serif text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.05] tracking-tight">
              {currentSlide.title}
            </h1>
            <p className="mb-7 max-w-120 text-[0.95rem] opacity-90">
              {currentSlide.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="collections"
                className="label-sm inline-flex h-10 items-center rounded-full bg-white px-6 text-ink transition hover:bg-sand"
              >
                Explore Collection
              </Link>
              <Link
                href="/journal"
                className="label-sm inline-flex h-10 items-center rounded-full bg-ink/55 px-6 backdrop-blur-md transition hover:bg-ink/75"
              >
                Read the Journal
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Bar: Interactive Counters & Progress Indicator */}
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

        {/* Clickable Slide Indicators / Thumbnails */}
        <div className="flex items-center gap-3">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 transition-all duration-300 rounded-full ${currentIndex === index ? "w-8 bg-white" : "w-3 bg-white/40 hover:bg-white/70"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <span>Atelier Shibuya</span>
      </div>
    </section>
  );
}