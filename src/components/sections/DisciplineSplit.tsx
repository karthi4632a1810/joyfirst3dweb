"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { gsap } from "@/lib/gsap";
import { useHasFinePointer, useReducedMotion } from "@/lib/hooks";

const PANELS = [
  {
    href: "/architecture",
    label: "Architecture",
    caption: "Houses, workplaces and hospitality — from concept through execution.",
    image: "/images/architecture.jpg",
    alt: "Concrete and glass residential elevation in raking afternoon light",
  },
  {
    href: "/interiors",
    label: "Interiors",
    caption: "Interiors planned as architecture, delivered turnkey.",
    image: "/images/interiors.jpg",
    alt: "Oak-lined interior with travertine floor and soft directional daylight",
  },
] as const;

/**
 * Split-screen entry to the two disciplines.
 *
 * Hovering one side expands it and pushes the other back — a single continuous
 * gesture across the whole section rather than two independent hover states.
 * Below md the panels stack and both stay fully open.
 */
export function DisciplineSplit() {
  const [active, setActive] = useState<number | null>(null);
  const finePointer = useHasFinePointer();
  const reducedMotion = useReducedMotion();
  const animate = finePointer && !reducedMotion;

  // The hovered side takes more of the split. Animating grid-template-columns
  // moves both panels as one gesture — two independently scaling panels would
  // read as two separate effects and leave a seam between them.
  const columns =
    active === 0
      ? "md:grid-cols-[1.18fr_0.82fr]"
      : active === 1
        ? "md:grid-cols-[0.82fr_1.18fr]"
        : "md:grid-cols-[1fr_1fr]";

  return (
    <section
      aria-label="Disciplines"
      className={`relative grid bg-paper transition-[grid-template-columns] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:h-[86vh] ${columns}`}
      onPointerLeave={() => setActive(null)}
    >
      {PANELS.map((panel, i) => (
        <Panel
          key={panel.href}
          panel={panel}
          index={i}
          active={active}
          animate={animate}
          onActivate={() => animate && setActive(i)}
        />
      ))}
    </section>
  );
}

interface PanelProps {
  panel: (typeof PANELS)[number];
  index: number;
  active: number | null;
  animate: boolean;
  onActivate: () => void;
}

function Panel({ panel, index, active, animate, onActivate }: PanelProps) {
  const root = useRef<HTMLAnchorElement>(null);
  const isActive = active === index;
  const isDimmed = active !== null && !isActive;

  const onEnter = () => {
    onActivate();
    if (!animate || !root.current) return;
    gsap.to(root.current.querySelector("[data-panel-image]"), {
      scale: 1.08,
      duration: 1.3,
      ease: "power3.out",
    });
    gsap.to(root.current.querySelector("[data-panel-caption]"), {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    if (!animate || !root.current) return;
    gsap.to(root.current.querySelector("[data-panel-image]"), {
      scale: 1,
      duration: 1.3,
      ease: "power3.out",
    });
    gsap.to(root.current.querySelector("[data-panel-caption]"), {
      y: 16,
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  return (
    <Link
      ref={root}
      href={panel.href}
      data-cursor="view"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      className="group relative flex min-h-[60svh] items-center justify-center overflow-hidden border-line md:min-h-0 md:border-l md:first:border-l-0"
    >
      <div data-panel-image className="absolute inset-0 will-change-transform">
        <Image
          src={panel.image}
          alt={panel.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-paper transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isActive ? "opacity-25" : isDimmed ? "opacity-70" : "opacity-45"
        }`}
      />

      <div className="relative z-10 px-[var(--spacing-gutter)] text-center">
        <h2
          className={`text-display text-ink transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isActive ? "md:-translate-y-3" : ""
          }`}
        >
          {panel.label}
        </h2>

        <p
          data-panel-caption
          style={animate ? { opacity: 0, transform: "translateY(16px)" } : undefined}
          className="mx-auto mt-6 max-w-[34ch] text-[0.9375rem] leading-relaxed text-graphite"
        >
          {panel.caption}
        </p>

        <span className="mt-8 inline-flex items-center gap-3 text-[0.75rem] uppercase tracking-[0.18em] text-bronze">
          View work
          <svg viewBox="0 0 20 14" fill="none" aria-hidden="true" className="h-3 w-5">
            <path
              d="M0 7h18M12 1l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="square"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
