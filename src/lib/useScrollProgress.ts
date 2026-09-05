"use client";

import { useEffect, useRef } from "react";

import { ScrollTrigger } from "@/lib/gsap";

interface Options {
  start?: string;
  end?: string;
}

/**
 * Reports a section's scroll progress as a mutable ref in the range 0..1.
 *
 * A ref rather than state on purpose: this value changes every frame while
 * scrolling, and the consumer (a useFrame camera loop) reads it directly. Using
 * state here would re-render the tree sixty times a second.
 */
export function useScrollProgress(
  target: React.RefObject<HTMLElement | null>,
  { start = "top top", end = "bottom bottom" }: Options = {},
) {
  const progress = useRef(0);

  useEffect(() => {
    const element = target.current;
    if (!element) return;

    const updateFromBounds = () => {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total > 0) {
        progress.current = Math.max(0, Math.min(1, -rect.top / total));
      }
    };

    window.addEventListener("scroll", updateFromBounds, { passive: true });
    updateFromBounds();

    const trigger = ScrollTrigger.create({
      trigger: element,
      start,
      end,
      scrub: true,
      onUpdate: () => {
        updateFromBounds();
      },
    });

    return () => {
      window.removeEventListener("scroll", updateFromBounds);
      trigger.kill();
    };
  }, [target, start, end]);

  return progress;
}

/**
 * Tracks the pointer as normalised -1..1 coordinates. Stays at the origin on
 * touch devices, so scenes that read it simply get no parallax.
 */
export function usePointerRef() {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return pointer;
}
