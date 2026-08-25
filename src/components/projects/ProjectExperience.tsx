"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { EXPERIENCE_KEYFRAMES } from "@/lib/camera";
import { ModelFallback } from "@/components/three/ModelFallback";
import { ScrollTrigger } from "@/lib/gsap";
import { useScrollProgress } from "@/lib/useScrollProgress";

const ArchitectureScene = dynamic(
  () => import("@/components/hero/ArchitectureScene").then((m) => m.ArchitectureScene),
  { ssr: false },
);

const STAGES = [
  { index: "01", title: "Exterior", body: "The approach — massing, shade and the way the building meets its site." },
  { index: "02", title: "Entrance", body: "The threshold. A compression before the volume opens up." },
  { index: "03", title: "Living", body: "The shared heart of the plan, opening on two sides." },
  { index: "04", title: "Interior", body: "Material, joinery and light at the scale of a hand." },
  { index: "05", title: "Landscape", body: "Back out — water, planting and the long view." },
];

interface ProjectExperienceProps {
  /** Optional GLB for this project. Falls back to the built-in villa. */
  modelSrc?: string;
  eyebrow?: string;
  heading?: string;
  fallbackImage?: string;
  fallbackAlt?: string;
}

/**
 * The scroll-driven architectural walkthrough.
 *
 * The section is five viewports tall; the frame is sticky inside it and the
 * camera advances through five stops as it scrolls. The stage caption is driven
 * from the same trigger, and only re-renders when the stage index actually
 * changes — not on every scroll frame.
 */
export function ProjectExperience({
  modelSrc,
  eyebrow = "03 — Walkthrough",
  heading = "Enter the space.",
  fallbackImage = "/images/experience.jpg",
  fallbackAlt = "Walkthrough of a contemporary residence",
}: ProjectExperienceProps = {}) {
  const section = useRef<HTMLElement>(null);
  const progress = useScrollProgress(section, { start: "top top", end: "bottom bottom" });
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const element = section.current;
    if (!element) return;

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const next = Math.min(
          STAGES.length - 1,
          Math.floor(self.progress * STAGES.length),
        );
        setStage((current) => (current === next ? current : next));
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section
      ref={section}
      aria-labelledby="experience-heading"
      className="relative h-[320vh] bg-paper md:h-[500vh]"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Server-rendered base layer; the opaque canvas covers it when 3D
            is available, and it is what remains when it is not. */}
        <div className="absolute inset-0">
          <ModelFallback src={fallbackImage} alt={fallbackAlt} priority={false} />
        </div>

        <ArchitectureScene
          className="absolute inset-0 h-full w-full"
          keyframes={EXPERIENCE_KEYFRAMES}
          progress={progress}
          modelSrc={modelSrc}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-paper via-transparent to-paper/70"
        />

        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between py-[clamp(5rem,12vh,8rem)]">
          <div className="container-arch">
            <p className="label-arch mb-5 text-bronze">{eyebrow}</p>
            <h2 id="experience-heading" className="text-headline max-w-[12ch] text-ink">
              {heading}
            </h2>
          </div>

          <div className="container-arch">
            <div className="grid gap-8 md:grid-cols-12 md:items-end">
              {/* Stage list — the current stop is the only one at full weight. */}
              <ol className="hidden md:col-span-5 md:block">
                {STAGES.map((item, i) => (
                  <li
                    key={item.index}
                    aria-current={i === stage ? "step" : undefined}
                    className={`flex items-baseline gap-5 py-1.5 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      i === stage
                        ? "text-ink opacity-100"
                        : "text-stone opacity-40"
                    }`}
                  >
                    <span className="w-8 shrink-0 text-[0.6875rem] uppercase tracking-[0.18em]">
                      {item.index}
                    </span>
                    <span className="text-[1.0625rem] uppercase tracking-[0.14em]">
                      {item.title}
                    </span>
                    <span
                      className={`ml-2 h-px flex-1 origin-left bg-bronze transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        i === stage ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </li>
                ))}
              </ol>

              <div className="md:col-span-5 md:col-start-8">
                {/* Mobile stage marker */}
                <p className="label-arch mb-3 text-bronze md:hidden">
                  {STAGES[stage].index} — {STAGES[stage].title}
                </p>
                <p
                  key={stage}
                  className="max-w-[40ch] text-lede text-graphite motion-safe:animate-[stageIn_0.7s_cubic-bezier(0.22,1,0.36,1)_both]"
                >
                  {STAGES[stage].body}
                </p>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes stageIn {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </section>
  );
}
