"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { Reveal, RevealText } from "@/components/ui/RevealText";
import { gsap } from "@/lib/gsap";
import { useHasFinePointer, useReducedMotion } from "@/lib/hooks";
import type { Service } from "@/types";

/**
 * Services as editorial rows, not cards.
 *
 * On a fine pointer, hovering a row floats the corresponding image alongside
 * the cursor. On touch and under reduced motion the image is dropped entirely
 * and the capabilities read as a plain list — the row is fully usable either
 * way, and nothing important lives only in the hover state.
 */
export function ServicesSection({ services }: { services: Service[] }) {
  const [active, setActive] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const finePointer = useHasFinePointer();
  const reducedMotion = useReducedMotion();
  const showPreview = finePointer && !reducedMotion;

  const onPointerMove = (event: React.PointerEvent) => {
    if (!showPreview || !preview.current) return;
    gsap.to(preview.current, {
      x: event.clientX,
      y: event.clientY,
      duration: 0.9,
      ease: "power3.out",
    });
  };

  return (
    <section
      aria-labelledby="services-heading"
      className="relative bg-bone py-[clamp(5rem,14vh,9rem)]"
      onPointerMove={onPointerMove}
      onPointerLeave={() => setActive(null)}
    >
      <div className="container-arch">
        <Reveal>
          <p className="label-arch mb-6 text-bronze">04 — Capability</p>
        </Reveal>
        <RevealText
          as="h2"
          id="services-heading"
          className="text-headline mb-[clamp(3rem,8vh,5rem)] max-w-[16ch] text-ink"
          lines={["What we do,", "end to end."]}
        />

        <ul>
          {services.map((service, i) => (
            <li key={service.slug}>
              <Link
                href={`/services#${service.slug}`}
                data-cursor="open"
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-6 border-t border-line py-[clamp(1.75rem,4vw,2.75rem)] transition-colors duration-500 last:border-b hover:border-bronze/50 md:gap-x-12"
              >
                <span className="text-[0.75rem] uppercase tracking-[0.18em] text-stone transition-colors duration-500 group-hover:text-bronze">
                  {service.index}
                </span>

                <div>
                  <h3 className="text-[clamp(1.5rem,4vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.025em] text-ink transition-colors duration-500 group-hover:text-bronze">
                    {service.title}
                  </h3>
                  <p className="mt-3 max-w-[46ch] text-[0.875rem] leading-relaxed text-stone">
                    {service.capabilities.join(" · ")}
                  </p>
                </div>

                <span
                  aria-hidden="true"
                  className="block h-3 w-6 text-stone transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 group-hover:text-bronze"
                >
                  <svg viewBox="0 0 20 14" fill="none" className="h-full w-full">
                    <path
                      d="M0 7h18M12 1l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      strokeLinecap="square"
                    />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Cursor-following preview. Purely decorative, so it is hidden from
          assistive tech and never rendered where there is no hover. */}
      {showPreview && (
        <div
          ref={preview}
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-30 hidden md:block"
        >
          {/* The wrapper is the cursor anchor; each image centres itself on it. */}
          <div className="relative">
            {services.map((service, i) => (
              <div
                key={service.slug}
                className={`absolute left-0 top-0 h-[22rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  active === i
                    ? "scale-100 opacity-100"
                    : "scale-95 opacity-0"
                }`}
              >
                <Image
                  src={service.image}
                  alt=""
                  fill
                  sizes="16rem"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-ink/10" />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
