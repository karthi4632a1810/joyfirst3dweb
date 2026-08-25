"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { gsap } from "@/lib/gsap";
import { useHasFinePointer, useReducedMotion } from "@/lib/hooks";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** How far the element drifts toward the pointer, as a fraction of offset. */
  strength?: number;
}

/**
 * Wraps any element so it drifts subtly toward the pointer while hovered.
 * Inert on touch devices and under prefers-reduced-motion.
 */
export function Magnetic({ children, className = "", strength = 0.28 }: MagneticProps) {
  const root = useRef<HTMLSpanElement>(null);
  const finePointer = useHasFinePointer();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = root.current;
    if (!element || !finePointer || reducedMotion) return;

    const moveX = gsap.quickTo(element, "x", { duration: 0.6, ease: "power3.out" });
    const moveY = gsap.quickTo(element, "y", { duration: 0.6, ease: "power3.out" });

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      moveX((event.clientX - (rect.left + rect.width / 2)) * strength);
      moveY((event.clientY - (rect.top + rect.height / 2)) * strength);
    };

    const onLeave = () => {
      moveX(0);
      moveY(0);
    };

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(element);
    };
  }, [finePointer, reducedMotion, strength]);

  return (
    <span ref={root} className={`inline-block will-change-transform ${className}`}>
      {children}
    </span>
  );
}

interface ArrowLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  /** Visual weight: `solid` for primary CTAs, `line` for editorial links. */
  variant?: "solid" | "line";
  cursor?: "open" | "view" | "hover";
}

/**
 * The site's only button. One shape, two weights — anything more would fight
 * the typography for attention.
 */
export function ArrowLink({
  href,
  children,
  className = "",
  variant = "line",
  cursor = "open",
}: ArrowLinkProps) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");

  const inner = (
    <span className="group/link relative inline-flex items-center gap-[0.9em] overflow-hidden">
      <span className="relative">
        {children}
        {variant === "line" && (
          <span className="absolute -bottom-[0.35em] left-0 h-px w-full origin-left scale-x-100 bg-current transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:scale-x-0" />
        )}
      </span>
      <span className="relative block h-[0.7em] w-[0.9em] shrink-0 overflow-hidden">
        <Arrow className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:translate-x-[140%]" />
        <Arrow className="absolute inset-0 -translate-x-[140%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:translate-x-0" />
      </span>
    </span>
  );

  const base =
    variant === "solid"
      ? "inline-flex items-center justify-center border border-ink/25 px-8 py-5 text-[0.8125rem] uppercase tracking-[0.16em] text-ink transition-colors duration-500 hover:border-bronze hover:text-bronze"
      : "inline-flex items-center text-[0.8125rem] uppercase tracking-[0.16em] text-ink transition-colors duration-500 hover:text-bronze";

  const classes = `${base} ${className}`;

  if (isExternal) {
    return (
      <Magnetic>
        <a
          href={href}
          className={classes}
          data-cursor={cursor}
          target="_blank"
          rel="noreferrer noopener"
        >
          {inner}
        </a>
      </Magnetic>
    );
  }

  return (
    <Magnetic>
      <Link href={href} className={classes} data-cursor={cursor}>
        {inner}
      </Link>
    </Magnetic>
  );
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 14"
      fill="none"
      aria-hidden="true"
      className={`h-full w-full ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M0 7h18M12 1l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
    </svg>
  );
}
