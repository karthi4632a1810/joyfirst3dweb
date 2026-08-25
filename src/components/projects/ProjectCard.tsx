"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { gsap } from "@/lib/gsap";
import { useHasFinePointer, useReducedMotion } from "@/lib/hooks";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  /** Displayed index, e.g. "01". */
  index: string;
  /** Portrait for grid columns, landscape for full-width editorial rows. */
  ratio?: "portrait" | "landscape" | "square";
  priority?: boolean;
  sizes?: string;
  className?: string;
}

const RATIOS = {
  portrait: "3/4",
  landscape: "16/10",
  square: "1/1",
};

/**
 * A project in a listing.
 *
 * All metadata sits in a typographic row beneath the frame rather than over the
 * photograph. On a light palette an overlay would need a scrim heavy enough to
 * dull the image on every card, and the contrast would still depend on whatever
 * the photograph happens to be doing in that corner — so the image is left
 * alone and the type does the work.
 *
 * Hover pulls three things at once — the image scales, a rule draws across the
 * caption, and the arrow advances — slow enough to read as one gesture. The
 * whole card is a single link, so keyboard users get one stop per project.
 */
export function ProjectCard({
  project,
  index,
  ratio = "portrait",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw",
  className = "",
}: ProjectCardProps) {
  const root = useRef<HTMLAnchorElement>(null);
  const finePointer = useHasFinePointer();
  const reducedMotion = useReducedMotion();
  const animate = finePointer && !reducedMotion;

  const onEnter = () => {
    if (!animate || !root.current) return;
    gsap.to(root.current.querySelector("[data-card-image]"), {
      scale: 1.05,
      duration: 1.2,
      ease: "power3.out",
    });
    gsap.to(root.current.querySelector("[data-card-rule]"), {
      scaleX: 1,
      duration: 0.9,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    if (!animate || !root.current) return;
    gsap.to(root.current.querySelector("[data-card-image]"), {
      scale: 1,
      duration: 1.2,
      ease: "power3.out",
    });
    gsap.to(root.current.querySelector("[data-card-rule]"), {
      scaleX: 0,
      duration: 0.6,
      ease: "power2.out",
    });
  };

  return (
    <Link
      ref={root}
      href={`/projects/${project.slug}`}
      data-cursor="view"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      className={`group block ${className}`}
      aria-label={`${project.title} — ${project.location}, ${project.year}`}
    >
      <div
        className="relative overflow-hidden bg-bone"
        style={{ aspectRatio: RATIOS[ratio] }}
      >
        <div data-card-image className="absolute inset-0 will-change-transform">
          <Image
            src={project.coverImage}
            alt={project.coverAlt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        </div>
      </div>

      {/* Caption. The hairline is the card's only hover surface — it draws in
          from the left as the image scales. */}
      <div className="relative mt-5 border-t border-line pt-4">
        <span
          data-card-rule
          aria-hidden="true"
          className="absolute -top-px left-0 h-px w-full origin-left bg-bronze"
          style={animate ? { transform: "scaleX(0)" } : undefined}
        />

        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[0.6875rem] uppercase tracking-[0.18em] text-stone">
            {index} <span className="mx-1 text-line-strong">/</span>{" "}
            {project.category}
          </span>
          <span className="shrink-0 text-[0.6875rem] uppercase tracking-[0.14em] text-stone">
            {project.year}
          </span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h3 className="text-title text-ink transition-colors duration-500 group-hover:text-bronze">
              {project.title}
            </h3>
            <p className="mt-1.5 text-[0.8125rem] text-stone">{project.location}</p>
          </div>

          <span
            aria-hidden="true"
            className="mb-1.5 block h-3 w-5 shrink-0 text-stone transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5 group-hover:text-bronze"
          >
            <svg viewBox="0 0 20 14" fill="none" className="h-full w-full">
              <path
                d="M0 7h18M12 1l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="square"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
