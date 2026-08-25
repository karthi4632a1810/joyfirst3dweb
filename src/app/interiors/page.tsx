import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { CtaSection } from "@/components/sections/CtaSection";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/RevealText";
import { getProjectsByDiscipline } from "@/lib/content";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Interiors",
  description:
    "Residential, commercial and hospitality interiors by JOYFIRST — planned as architecture and delivered turnkey, from joinery to services.",
  alternates: { canonical: "/interiors" },
};

const PRINCIPLES = [
  {
    title: "Plan before finish",
    body: "The best interiors are decided in plan — where light falls, how you move, what you see from the door. Materials come after that, not instead of it.",
  },
  {
    title: "Joinery does the work",
    body: "Storage, services and doors disappear into full-height cabinetry so walls stay calm. It costs more in drawing time and less in visual noise.",
  },
  {
    title: "Delivered turnkey",
    body: "Civil, HVAC, electrical, fire detection and networking are coordinated in-house against one programme, so the interior lands complete and on time.",
  },
];

export default async function InteriorsPage() {
  const projects = await getProjectsByDiscipline("interiors");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Interiors", url: "/interiors" },
        ])}
      />

      <PageHeader
        eyebrow="Discipline"
        lines={["Rooms designed", "around living."]}
        intro="Interiors for homes, workplaces and hospitality — planned with the same rigour as the building around them, and delivered as a single turnkey package."
      />

      <section className="container-arch pb-[clamp(4rem,10vh,7rem)]">
        <ImageReveal
          src="/images/interiors.jpg"
          alt="Oak-lined interior with travertine floor and soft directional daylight"
          ratio="21/9"
          sizes="100vw"
          priority
        />
      </section>

      <section
        aria-labelledby="interiors-principles"
        className="container-arch pb-[clamp(4rem,10vh,7rem)]"
      >
        <Reveal>
          <h2 id="interiors-principles" className="label-arch mb-12 text-bronze">
            How we work
          </h2>
        </Reveal>

        <dl className="grid gap-x-[clamp(2rem,4vw,4rem)] gap-y-12 border-t border-line pt-12 md:grid-cols-3">
          {PRINCIPLES.map((principle, i) => (
            <Reveal key={principle.title} delay={i * 0.08}>
              <dt className="text-title text-ink">{principle.title}</dt>
              <dd className="mt-5 max-w-[42ch] text-[0.9375rem] leading-relaxed text-stone">
                {principle.body}
              </dd>
            </Reveal>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="interior-projects-heading"
        className="container-arch pb-[clamp(5rem,14vh,9rem)]"
      >
        <Reveal>
          <h2
            id="interior-projects-heading"
            className="text-headline mb-[clamp(2.5rem,6vh,4rem)] text-ink"
          >
            Interior projects
          </h2>
        </Reveal>

        <ProjectGrid projects={projects} />
      </section>

      <CtaSection />
    </>
  );
}
