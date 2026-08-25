"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";

interface ModelFallbackProps {
  src?: string;
  alt?: string;
  /** Rendered over the image — the hero passes its headline through here. */
  children?: React.ReactNode;
  className?: string;
  priority?: boolean;
}

/**
 * Shown instead of the R3F canvas when WebGL is unavailable or the device is
 * too constrained for real-time 3D.
 *
 * It is a full-bleed architectural photograph with a slow pointer parallax —
 * quieter than the 3D scene but composed the same way, so the page never looks
 * like something failed. A broken or empty canvas is never rendered.
 */
export function ModelFallback({
  src = "/images/hero-fallback.jpg",
  alt = "Contemporary residence at dusk, lit from within",
  children,
  className = "",
  priority = true,
}: ModelFallbackProps) {
  const layer = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = layer.current;
    if (!element || reducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const moveX = gsap.quickTo(element, "x", { duration: 1.4, ease: "power3.out" });
    const moveY = gsap.quickTo(element, "y", { duration: 1.4, ease: "power3.out" });

    const onMove = (event: PointerEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      moveX(nx * -34);
      moveY(ny * -22);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.killTweensOf(element);
    };
  }, [reducedMotion]);

  return (
    <div className={`relative h-full w-full overflow-hidden bg-bone ${className}`}>
      {/* Over-scaled so the parallax drift never exposes an edge. */}
      <div ref={layer} className="absolute inset-0 scale-[1.08] will-change-transform">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Grading to match the lighting of the 3D scene. */}
      <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/35 to-paper/15" />
      <div className="absolute inset-0 bg-gradient-to-r from-paper/70 via-paper/10 to-transparent" />

      {children}
    </div>
  );
}
