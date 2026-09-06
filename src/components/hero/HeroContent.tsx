"use client";

import { useRef } from "react";

import { ArrowLink } from "@/components/ui/MagneticButton";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect, useReducedMotion } from "@/lib/hooks";
import { site } from "@/data/site";

interface HeroContentProps {
  /** The hero's scroll section, used to fade the copy as the camera advances. */
  sectionRef: React.RefObject<HTMLElement | null>;
}

/**
 * Hero typography.
 *
 * Enters once on load — deliberately unhurried, and never replayed — then
 * dissolves as the camera starts moving toward the building, so the copy is
 * gone by the time the scene reaches the entrance.
 */
export function HeroContent({ sectionRef }: HeroContentProps) {
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const element = root.current;
    if (!element) return;

    const context = gsap.context(() => {
      const lines = element.querySelectorAll<HTMLElement>(".reveal-line > span");
      const meta = element.querySelectorAll<HTMLElement>("[data-hero-meta]");

      if (reducedMotion) {
        gsap.set([...lines, ...meta], { yPercent: 0, opacity: 1 });
        return;
      }

      gsap
        .timeline({ delay: 0.35 })
        .fromTo(
          lines,
          { yPercent: 112, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.5, ease: "power4.out", stagger: 0.1 },
        )
        .fromTo(
          meta,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.12 },
          "-=0.95",
        );

      const section = sectionRef.current;
      if (!section) return;

      // Fade with the camera's approach, not with raw window scroll.
      gsap.to(element, {
        opacity: 0,
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "18% top",
          scrub: true,
        },
      });
    }, element);

    return () => context.revert();
  }, [reducedMotion, sectionRef]);

  return (
    <div
      ref={root}
      className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end pb-[max(clamp(3rem,10vh,7rem),env(safe-area-inset-bottom))]"
    >
      <div className="container-arch">
        <p
          data-hero-meta
          className="label-arch mb-[clamp(1.5rem,4vh,2.75rem)] text-bronze opacity-0"
        >
          {site.name}
          <span className="mx-3 text-stone">/</span>
          <span className="text-graphite">Chennai, India</span>
        </p>

        <h1 className="text-display max-w-[18ch] break-words text-ink">
          <span className="reveal-line">
            <span>Architecture</span>
          </span>
          <span className="reveal-line">
            <span>that feels like home.</span>
          </span>
        </h1>

        <div className="mt-[clamp(2rem,5vh,3.5rem)] flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <p
            data-hero-meta
            className="pointer-events-auto max-w-[42ch] break-words text-lede text-graphite opacity-0"
          >
            {site.description}
          </p>

          <div data-hero-meta className="pointer-events-auto opacity-0">
            <ArrowLink href="/projects" variant="line" cursor="view">
              Explore Projects
            </ArrowLink>
          </div>
        </div>
      </div>
    </div>
  );
}
