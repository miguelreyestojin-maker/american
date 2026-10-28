"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";
import flatLay from "@/app/images/carrusel2.jpg";
import storefront from "@/app/images/foto1_carrusel.jpg";

const slides: StaticImageData[] = [storefront, flatLay];
const intervalMs = 5000;

export function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [active]);

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" aria-hidden>
        {slides.map((slide, index) => (
          <Image
            key={slide.src}
            src={slide}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className={`object-cover transition-opacity duration-500 ${index === active ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/75 to-white/40" />
      </div>
      <div className="absolute right-4 bottom-6 z-20 flex gap-2 sm:right-6">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Imagen ${index + 1}`}
            aria-current={index === active ? "true" : undefined}
            onClick={() => setActive(index)}
            className={`h-1.5 w-8 transition-colors duration-150 ${index === active ? "bg-black" : "bg-black/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
