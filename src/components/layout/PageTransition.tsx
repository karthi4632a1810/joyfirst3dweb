"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";

import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect, useReducedMotion } from "@/lib/hooks";

/**
 * Page transition.
 *
 * A short fade-and-lift on the incoming route — no covering panel and no
 * loading animation, because either would sit between the visitor and the work
 * for longer than the navigation itself takes. Around 550ms end to end.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const element = root.current;
    if (!element) return;

    if (reducedMotion) {
      gsap.set(element, { opacity: 1, y: 0 });
      return;
    }

    const tween = gsap.fromTo(
      element,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power2.out", clearProps: "transform" },
    );

    return () => {
      tween.kill();
    };
  }, [pathname, reducedMotion]);

  return (
    <div ref={root} style={{ opacity: reducedMotion ? 1 : 0 }}>
      {children}
    </div>
  );
}
