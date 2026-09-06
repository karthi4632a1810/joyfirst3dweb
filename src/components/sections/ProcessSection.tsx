"use client";

import { useRef } from "react";

import { Reveal, RevealText } from "@/components/ui/RevealText";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect, useReducedMotion } from "@/lib/hooks";
import type { ProcessStep } from "@/types";

/**
 * The four stages of a project.
 *
 * On desktop the track scrolls sideways while the section is pinned, so the
 * process reads as a sequence you move along. Below lg — and whenever motion is
 * reduced — it is a plain vertical list, which is the right shape for a narrow
 * screen anyway rather than a compromise.
 */
export function ProcessSection({ steps }: { steps: ProcessStep[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const sectionEl = section.current;
    const trackEl = track.current;
    if (!sectionEl || !trackEl) return;

    const context = gsap.context(() => {
      // gsap.matchMedia handles both the breakpoint and the motion preference,
      // and reverts everything it created when either stops matching.
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const distance = () => trackEl.scrollWidth - window.innerWidth;
        if (distance() <= 0) return;

        const tween = gsap.to(trackEl, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(trackEl, { x: 0 });
        };
      });

      return () => mm.revert();
    }, sectionEl);

    return () => context.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={section}
      aria-labelledby="process-heading"
      className="relative overflow-hidden bg-paper py-[clamp(5rem,14vh,9rem)] lg:py-0"
    >
      <div className="lg:flex lg:h-[100svh] lg:flex-col lg:justify-center">
        <div className="container-arch lg:shrink-0">
          <Reveal>
            <p className="label-arch mb-6 text-bronze">05 — Process</p>
          </Reveal>
          <RevealText
            as="h2"
            id="process-heading"
            className="text-headline mb-[clamp(3rem,8vh,5rem)] max-w-[18ch] break-words text-ink"
            lines={["How a project", "actually happens."]}
          />
        </div>

        <div
          ref={track}
          className="flex flex-col gap-px lg:w-max lg:flex-row lg:gap-0 lg:will-change-transform"
        >
          {steps.map((step, i) => (
            <Reveal
              key={step.index}
              delay={i * 0.06}
              className="lg:w-[clamp(22rem,34vw,32rem)] lg:shrink-0"
            >
              <article className="h-full border-t border-line py-[clamp(2rem,5vw,3rem)] lg:border-l lg:border-t-0 lg:px-[clamp(2rem,4vw,3.5rem)] lg:first:pl-[var(--spacing-gutter)] lg:last:pr-[var(--spacing-gutter)]">
                <p className="mb-8 text-[0.75rem] uppercase tracking-[0.2em] text-bronze">
                  {step.index}
                </p>
                <h3 className="break-words text-[clamp(1.75rem,4vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.03em] text-ink">
                  {step.title}
                </h3>
                <p className="mt-6 max-w-[42ch] break-words text-[0.9375rem] leading-relaxed text-stone">
                  {step.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
