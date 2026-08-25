import { ProjectCard } from "@/components/projects/ProjectCard";
import { Reveal } from "@/components/ui/RevealText";
import type { Project } from "@/types";

interface ProjectGridProps {
  projects: Project[];
  /**
   * `staggered` offsets alternate columns vertically for an editorial rhythm;
   * `even` keeps a plain two-column grid.
   */
  layout?: "staggered" | "even";
  className?: string;
}

/**
 * Project listing.
 *
 * The staggered layout drops every second card down the page, which stops the
 * grid reading as a catalogue and gives the long scroll some cadence. It
 * collapses to a single column below md, where the offsets would only create
 * awkward gaps.
 */
export function ProjectGrid({
  projects,
  layout = "staggered",
  className = "",
}: ProjectGridProps) {
  return (
    <div
      className={`grid gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-[clamp(3.5rem,9vw,7rem)] md:grid-cols-2 ${className}`}
    >
      {projects.map((project, i) => {
        const offset = layout === "staggered" && i % 2 === 1;

        return (
          <Reveal
            key={project.slug}
            className={offset ? "md:mt-[clamp(3rem,10vw,9rem)]" : ""}
            delay={i % 2 === 1 ? 0.08 : 0}
          >
            <ProjectCard
              project={project}
              index={String(i + 1).padStart(2, "0")}
              ratio={i % 3 === 0 ? "portrait" : "landscape"}
              priority={i < 2}
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </Reveal>
        );
      })}
    </div>
  );
}
