import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { CtaSection } from "@/components/sections/CtaSection";
import { Reveal } from "@/components/ui/RevealText";
import { getAllProjects } from "@/lib/content";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Houses, interiors, workplaces and hospitality projects by JOYFIRST — across Tamil Nadu, Kerala, Karnataka and beyond.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Projects", url: "/projects" },
        ])}
      />

      <PageHeader
        eyebrow="Work"
        lines={["Every project", "starts on site."]}
        intro="A selection of completed architecture, interior and turnkey projects. Each one is shown with the thinking behind it, not just the finished photograph."
        meta={[
          { label: "Projects shown", value: String(projects.length) },
          { label: "Disciplines", value: "Architecture, Interiors, Fit-Out" },
          { label: "Regions", value: "Tamil Nadu, Kerala, Karnataka" },
          { label: "Years", value: "2024 — 2026" },
        ]}
      />

      <section
        aria-labelledby="all-projects-heading"
        className="container-arch pb-[clamp(5rem,14vh,9rem)]"
      >
        {/* Keeps the heading order intact between the page h1 and the h3 on
            each project card. */}
        <Reveal>
          <h2
            id="all-projects-heading"
            className="text-headline mb-[clamp(2.5rem,6vh,4rem)] break-words text-ink"
          >
            All projects
          </h2>
        </Reveal>

        <ProjectGrid projects={projects} />
      </section>

      <CtaSection />
    </>
  );
}
