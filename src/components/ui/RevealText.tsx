"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect, useReducedMotion } from "@/lib/hooks";

interface RevealTextProps {
  /** One entry per visual line. Each line is masked and rises independently. */
  lines: ReactNode[];
  /** Restricted to real text elements so the heading level stays deliberate. */
  as?: "h1" | "h2" | "h3" | "h4" | "p";
  id?: string;
  className?: string;
  lineClassName?: string;
  /** Seconds between consecutive lines. */
  stagger?: number;
  delay?: number;
  /** Play immediately on mount instead of waiting for the element to scroll in. */
  immediate?: boolean;
}

/**
 * Editorial line reveal: each line sits inside an overflow-hidden mask and
 * rises into place. This is the primary headline treatment across the site.
 *
 * Lines are passed explicitly rather than measured from wrapped text — it keeps
 * the markup honest (real elements, readable by assistive tech and by search
 * engines) and avoids a layout-thrashing split on every resize.
 */
export function RevealText({
  lines,
  as: Tag = "h2",
  id,
  className = "",
  lineClassName = "",
  stagger = 0.09,
  delay = 0,
  immediate = false,
}: RevealTextProps) {
  const root = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const element = root.current;
    if (!element) return;

    const targets = element.querySelectorAll<HTMLElement>(".reveal-line > span");
    if (!targets.length) return;

    if (reducedMotion) {
      gsap.set(targets, { yPercent: 0, opacity: 1 });
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        targets,
        { yPercent: 108, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.15,
          ease: "power3.out",
          stagger,
          delay,
          scrollTrigger: immediate
            ? undefined
            : {
                trigger: element,
                start: "top 88%",
                once: true,
              },
        },
      );
    }, element);

    return () => context.revert();
  }, [reducedMotion, stagger, delay, immediate, lines.length]);

  return (
    <Tag ref={root} id={id} className={className} data-reveal="">
      {lines.map((line, index) => (
        <span key={index} className={`reveal-line ${lineClassName}`}>
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  );
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Distance in pixels the block travels upward as it fades in. */
  distance?: number;
  start?: string;
}

/**
 * Generic scroll-in for blocks that are not headlines — paragraphs, metadata
 * rows, images. Deliberately quieter than RevealText.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  distance = 28,
  start = "top 88%",
}: RevealProps) {
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const element = root.current;
    if (!element) return;

    if (reducedMotion) {
      gsap.set(element, { opacity: 1, y: 0 });
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        element,
        { opacity: 0, y: distance },
        {
          opacity: 1,
          y: 0,
          duration: 1.05,
          ease: "power3.out",
          delay,
          scrollTrigger: { trigger: element, start, once: true },
        },
      );
    }, element);

    return () => context.revert();
  }, [reducedMotion, delay, distance, start]);

  return (
    <div
      ref={root}
      data-reveal=""
      className={className}
      style={{ opacity: reducedMotion ? 1 : 0 }}
    >
      {children}
    </div>
  );
}
