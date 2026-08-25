"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef } from "react";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";

interface SmoothScrollApi {
  /** The live instance, or null under reduced motion. Read it, do not store it. */
  getLenis: () => Lenis | null;
  /** Used by the mobile menu to lock the page without breaking ScrollTrigger. */
  stop: () => void;
  start: () => void;
  scrollTo: (target: string | number | HTMLElement) => void;
}

const SmoothScrollContext = createContext<SmoothScrollApi>({
  getLenis: () => null,
  stop: () => {},
  start: () => {},
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

/**
 * Lenis smooth scrolling, wired to GSAP so ScrollTrigger reads Lenis' virtual
 * scroll position rather than the native one.
 *
 * The integration has three required parts:
 *   1. `lenis.on("scroll", ScrollTrigger.update)` — triggers stay in sync.
 *   2. Lenis is driven from `gsap.ticker`, not its own rAF loop, so there is a
 *      single animation frame for the whole page.
 *   3. `lagSmoothing(0)` — GSAP must not skip frames after a long task, which
 *      would desynchronise the scroll-driven camera.
 *
 * Under `prefers-reduced-motion` Lenis is never instantiated and the browser's
 * native scrolling is used unchanged.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const instance = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Native scrolling on touch: Lenis' touch smoothing fights iOS momentum
      // and is the usual source of "scroll feels stuck" reports on mobile.
      syncTouch: false,
      autoRaf: false,
    });

    lenisRef.current = instance;

    const onScroll = () => ScrollTrigger.update();
    instance.on("scroll", onScroll);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Deliberately no scrollerProxy. Lenis moves the real window scroll
    // position, so ScrollTrigger's default scroller is already correct — adding
    // a proxy makes ScrollTrigger switch pinning from `fixed` to `transform`,
    // which is what breaks pinned sections and sticky headers in most reports
    // of "Lenis fights ScrollTrigger".
    ScrollTrigger.refresh();

    return () => {
      instance.off("scroll", onScroll);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      instance.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  // Every route change starts at the top and re-measures triggers, otherwise
  // the new page inherits the previous page's scroll offset.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);

    // Two frames: one for React to commit, one for layout/fonts to settle.
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => ScrollTrigger.refresh()),
    );
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  const api: SmoothScrollApi = {
    getLenis: () => lenisRef.current,
    stop: () => {
      lenisRef.current?.stop();
      if (reducedMotion) document.documentElement.style.overflow = "hidden";
    },
    start: () => {
      lenisRef.current?.start();
      if (reducedMotion) document.documentElement.style.overflow = "";
    },
    scrollTo: (target) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, { offset: 0, duration: 1.2 });
        return;
      }
      const element =
        typeof target === "string" ? document.querySelector(target) : target;
      if (element instanceof HTMLElement) {
        element.scrollIntoView({ behavior: "auto", block: "start" });
      } else if (typeof target === "number") {
        window.scrollTo(0, target);
      }
    },
  };

  return (
    <SmoothScrollContext.Provider value={api}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
