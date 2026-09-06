import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { CtaSection } from "@/components/sections/CtaSection";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/RevealText";
import { getProjectsByDiscipline } from "@/lib/content";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Architecture",
  description:
    "Residential, commercial and hospitality architecture by JOYFIRST — designed around climate, site and the way people actually live.",
  alternates: { canonical: "/architecture" },
};

const PRINCIPLES = [
  {
    title: "Climate first",
    body: "Orientation, shade and cross-ventilation do most of the work before a single machine is specified. In this climate that is not a sustainability gesture — it is what makes a house comfortable.",
  },
  {
    title: "Few materials, well used",
    body: "A short material palette, detailed properly and left to show what it is. Concrete reads as concrete, teak as teak.",
  },
  {
    title: "Plans that hold up",
    body: "Rooms that work when the family grows, when guests arrive, and when it is just two people on a Tuesday.",
  },
];

export default async function ArchitecturePage() {
  const projects = await getProjectsByDiscipline("architecture");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Architecture", url: "/architecture" },
        ])}
      />

      <PageHeader
        eyebrow="Discipline"
        lines={["Buildings shaped", "by their site."]}
        intro="We design houses, workplaces and hospitality projects from first sketch through to handover — and because we execute as well as design, the detail that was drawn is the detail that gets built."
      />

      <section className="container-arch pb-[clamp(4rem,10vh,7rem)]">
        <ImageReveal
          src="/images/architecture.jpg"
          alt="Concrete and glass residential elevation in raking afternoon light"
          ratio="21/9"
          sizes="100vw"
          priority
        />
      </section>

      <section
        aria-labelledby="principles-heading"
        className="container-arch pb-[clamp(4rem,10vh,7rem)]"
      >
        <Reveal>
          <h2 id="principles-heading" className="label-arch mb-12 text-bronze">
            How we work
          </h2>
        </Reveal>

        <dl className="grid gap-x-[clamp(2rem,4vw,4rem)] gap-y-12 border-t border-line pt-12 md:grid-cols-3">
          {PRINCIPLES.map((principle, i) => (
            <Reveal key={principle.title} delay={i * 0.08}>
              <dt className="text-title break-words text-ink">{principle.title}</dt>
              <dd className="mt-5 max-w-[42ch] break-words text-[0.9375rem] leading-relaxed text-stone">
                {principle.body}
              </dd>
            </Reveal>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="arch-projects-heading"
        className="container-arch pb-[clamp(5rem,14vh,9rem)]"
      >
        <Reveal>
          <h2
            id="arch-projects-heading"
            className="text-headline mb-[clamp(2.5rem,6vh,4rem)] break-words text-ink"
          >
            Architecture projects
          </h2>
        </Reveal>

        <ProjectGrid projects={projects} />
      </section>

      <CtaSection />
    </>
  );
}
