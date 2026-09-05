"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";

import { ModelFallback } from "@/components/three/ModelFallback";
import { useScrollProgress } from "@/lib/useScrollProgress";

import { HeroContent } from "./HeroContent";

/**
 * The scene is client-only and code-split: three, R3F and drei are the largest
 * things on the site by a wide margin, and nothing above the fold depends on
 * them. The architectural photograph underneath holds the frame until — or
 * instead of — the canvas.
 */
const ArchitectureScene = dynamic(
  () => import("@/components/hero/ArchitectureScene").then((m) => m.ArchitectureScene),
  { ssr: false },
);

/**
 * Full-screen 3D hero.
 *
 * The section is three viewports tall and the visible frame is sticky inside
 * it, so scrolling the section drives the camera from a wide exterior shot to
 * the interior without pinning anything. Pinning through Lenis is where most
 * "the page won't scroll" bugs come from; sticky positioning has none of that
 * fragility and degrades correctly when JavaScript is unavailable.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const progress = useScrollProgress(section, { start: "top top", end: "bottom bottom" });

  return (
    <section
      ref={section}
      aria-label="Introduction"
      className="relative h-[480vh] md:h-[680vh]"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-bone">
        {/* Server-rendered base layer. This is the LCP element: it paints
            immediately, and the opaque canvas covers it once 3D is ready. */}
        <div className="absolute inset-0">
          <ModelFallback alt="Contemporary residence at dusk, lit from within" />
        </div>

        <ArchitectureScene
          className="absolute inset-0 h-full w-full"
          progress={progress}
        />

        {/* Section 11 UI protection: Subtle text column scrim */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(105deg, rgba(20,18,16,0.34) 0%, rgba(20,18,16,0.10) 42%, transparent 62%)",
          }}
        />

        <HeroContent sectionRef={section} />

        <ScrollCue />
      </div>
    </section>
  );
}

function ScrollCue() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-8 right-[var(--spacing-gutter)] z-20 hidden items-center gap-4 md:flex"
    >
      <span className="label-arch text-stone">Scroll</span>
      <span className="relative block h-14 w-px overflow-hidden bg-line-strong">
        <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollCue_2.4s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-bronze" />
      </span>
      <style>{`
        @keyframes scrollCue {
          0%   { transform: translateY(-100%); }
          55%  { transform: translateY(200%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </div>
  );
}
