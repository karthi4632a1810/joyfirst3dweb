"use client";

import Image from "next/image";
import { useRef } from "react";

import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect, useReducedMotion } from "@/lib/hooks";

interface ImageRevealProps {
  src: string;
  alt: string;
  className?: string;
  /** Aspect ratio applied to the frame, e.g. "4/5" or "16/9". */
  ratio?: string;
  priority?: boolean;
  sizes?: string;
  /** Vertical drift of the image inside its frame, in percent of height. */
  parallax?: number;
  /** Disables the mask wipe — useful when the frame is already animating. */
  noMask?: boolean;
}

/**
 * Architectural image frame: the photograph is over-scaled inside a fixed
 * aspect frame and drifts slowly as the frame crosses the viewport, so images
 * feel bedded into the page rather than pasted on.
 *
 * Both the wipe and the parallax are skipped under prefers-reduced-motion.
 */
export function ImageReveal({
  src,
  alt,
  className = "",
  ratio = "4/5",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  parallax = 8,
  noMask = false,
}: ImageRevealProps) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const frameEl = frame.current;
    const innerEl = inner.current;
    if (!frameEl || !innerEl) return;

    if (reducedMotion) {
      gsap.set(frameEl, { clipPath: "inset(0% 0 0 0)" });
      gsap.set(innerEl, { yPercent: 0, scale: 1 });
      return;
    }

    const context = gsap.context(() => {
      if (!noMask) {
        gsap.fromTo(
          frameEl,
          { clipPath: "inset(100% 0 0 0)" },
          {
            clipPath: "inset(0% 0 0 0)",
            duration: 1.4,
            ease: "power3.inOut",
            scrollTrigger: { trigger: frameEl, start: "top 92%", once: true },
          },
        );
      }

      if (parallax > 0) {
        gsap.fromTo(
          innerEl,
          { yPercent: -parallax / 2 },
          {
            yPercent: parallax / 2,
            ease: "none",
            scrollTrigger: {
              trigger: frameEl,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
    }, frameEl);

    return () => context.revert();
  }, [reducedMotion, parallax, noMask]);

  return (
    <div
      ref={frame}
      className={`relative overflow-hidden bg-bone ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {/* Over-scaled so the parallax drift never exposes an edge. */}
      <div ref={inner} className="absolute inset-0 scale-[1.12] will-change-transform">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    </div>
  );
}
