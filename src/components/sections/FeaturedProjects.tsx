import { ProjectCard } from "@/components/projects/ProjectCard";
import { ArrowLink } from "@/components/ui/MagneticButton";
import { Reveal, RevealText } from "@/components/ui/RevealText";
import type { Project } from "@/types";

/**
 * Selected work on the homepage.
 *
 * Alternating wide and narrow frames, offset from a twelve-column grid — the
 * asymmetry is what separates this from a project catalogue.
 */
export function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <section
      aria-labelledby="featured-heading"
      className="relative bg-paper py-[clamp(5rem,14vh,9rem)]"
    >
      <div className="container-arch">
        <div className="mb-[clamp(3rem,8vh,5rem)] flex flex-wrap items-end justify-between gap-8">
          <div>
            <Reveal>
              <p className="label-arch mb-6 text-bronze">02 — Selected work</p>
            </Reveal>
            <RevealText
              as="h2"
              id="featured-heading"
              className="text-headline max-w-[14ch] text-ink"
              lines={["Projects", "we've built."]}
            />
          </div>

          <Reveal delay={0.1} className="pb-2">
            <ArrowLink href="/projects">All Projects</ArrowLink>
          </Reveal>
        </div>

        <div className="flex flex-col gap-[clamp(4rem,12vw,10rem)]">
          {projects.map((project, i) => {
            const wide = i % 2 === 0;

            return (
              <Reveal key={project.slug} distance={40}>
                <div className="grid md:grid-cols-12">
                  <div
                    className={
                      wide
                        ? "md:col-span-8 md:col-start-1"
                        : "md:col-span-6 md:col-start-7"
                    }
                  >
                    <ProjectCard
                      project={project}
                      index={String(i + 1).padStart(2, "0")}
                      ratio={wide ? "landscape" : "portrait"}
                      priority={i === 0}
                      sizes={
                        wide
                          ? "(max-width: 768px) 100vw, 66vw"
                          : "(max-width: 768px) 100vw, 50vw"
                      }
                    />
                  </div>

                  {/* Summary sits in the empty half of the grid. */}
                  <div
                    className={`mt-8 md:mt-0 md:self-end md:pb-6 ${
                      wide
                        ? "md:col-span-3 md:col-start-10"
                        : "md:col-span-4 md:col-start-1 md:row-start-1"
                    }`}
                  >
                    <p className="text-[0.9375rem] leading-relaxed text-stone">
                      {project.summary}
                    </p>
                    {project.area && (
                      <p className="mt-5 text-[0.75rem] uppercase tracking-[0.14em] text-stone/80">
                        {project.area}
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
