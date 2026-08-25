import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectExperience } from "@/components/projects/ProjectExperience";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { CtaSection } from "@/components/sections/CtaSection";
import { ArrowLink } from "@/components/ui/MagneticButton";
import { Reveal, RevealText } from "@/components/ui/RevealText";
import {
  getProjectBySlug,
  getProjectSlugs,
  getRelatedProjects,
} from "@/lib/content";
import { breadcrumbJsonLd, JsonLd, projectJsonLd } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Every project is known at build time, so all detail pages are static. */
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: "Project not found" };
  }

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title: `${project.title} | JOYFIRST`,
      description: project.summary,
      url: `/projects/${project.slug}`,
      images: [
        { url: project.coverImage, width: 2400, height: 1500, alt: project.coverAlt },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | JOYFIRST`,
      description: project.summary,
      images: [project.coverImage],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const related = await getRelatedProjects(slug, 3);

  return (
    <>
      <JsonLd
        data={[
          projectJsonLd(project),
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Projects", url: "/projects" },
            { name: project.title, url: `/projects/${project.slug}` },
          ]),
        ]}
      />

      {/* ---- Full-bleed hero -------------------------------------------- */}
      <section className="relative h-[78svh] min-h-[30rem] w-full overflow-hidden bg-bone md:h-[92svh]">
        <Image
          src={project.coverImage}
          alt={project.coverAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-paper via-paper/45 to-paper/10"
        />

        <div className="absolute inset-x-0 bottom-0 pb-[clamp(3rem,8vh,5rem)]">
          <div className="container-arch">
            <p className="label-arch mb-6 text-bronze">{project.category}</p>
            <RevealText
              as="h1"
              className="text-display max-w-[14ch] text-ink"
              lines={[project.title]}
              immediate
            />
          </div>
        </div>
      </section>

      {/* ---- Project information ---------------------------------------- */}
      <section
        aria-label="Project information"
        className="container-arch py-[clamp(3.5rem,9vh,6rem)]"
      >
        <dl className="grid gap-x-8 gap-y-10 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="Location" value={project.location} />
          <Fact label="Category" value={project.category} />
          <Fact label="Year" value={project.year} />
          {project.area && <Fact label="Area" value={project.area} />}
        </dl>
      </section>

      {/* ---- Design story ------------------------------------------------ */}
      <section
        aria-labelledby="story-heading"
        className="container-arch pb-[clamp(4rem,10vh,7rem)]"
      >
        <div className="grid gap-[clamp(2.5rem,6vw,5rem)] md:grid-cols-12">
          <div className="md:col-span-4">
            <Reveal>
              <h2 id="story-heading" className="label-arch text-bronze">
                The design
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-8 max-w-[34ch] text-title text-ink">
                {project.summary}
              </p>
            </Reveal>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            {project.description.map((paragraph, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <p className="mb-6 max-w-[60ch] text-lede text-graphite last:mb-0">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Gallery ----------------------------------------------------- */}
      <section aria-label="Project gallery" className="container-arch pb-[clamp(4rem,10vh,7rem)]">
        <ProjectGallery images={project.gallery} />
      </section>

      {/* ---- 3D model ----------------------------------------------------- */}
      <ProjectExperience
        modelSrc={project.model}
        eyebrow="In three dimensions"
        heading="Walk the plan."
        fallbackImage={project.gallery[0]?.src ?? project.coverImage}
        fallbackAlt={project.gallery[0]?.alt ?? project.coverAlt}
      />

      {/* ---- Project details --------------------------------------------- */}
      <section
        aria-labelledby="details-heading"
        className="container-arch pb-[clamp(4rem,10vh,7rem)]"
      >
        <Reveal>
          <h2 id="details-heading" className="label-arch mb-10 text-bronze">
            Project details
          </h2>
        </Reveal>

        <dl className="grid gap-x-8 gap-y-10 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-3">
          {project.facts.map((fact) => (
            <Fact key={fact.label} label={fact.label} value={fact.value} />
          ))}
        </dl>
      </section>

      {/* ---- Related ------------------------------------------------------ */}
      {related.length > 0 && (
        <section
          aria-labelledby="related-heading"
          className="container-arch pb-[clamp(5rem,12vh,8rem)]"
        >
          <div className="mb-[clamp(2.5rem,6vh,4rem)] flex flex-wrap items-end justify-between gap-6">
            <h2 id="related-heading" className="text-headline text-ink">
              More work
            </h2>
            <ArrowLink href="/projects">All projects</ArrowLink>
          </div>

          <div className="grid gap-x-[clamp(1.5rem,3vw,2.5rem)] gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, i) => (
              <Reveal key={item.slug} delay={i * 0.07}>
                <ProjectCard
                  project={item}
                  index={String(i + 1).padStart(2, "0")}
                  ratio="portrait"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 32vw"
                />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <CtaSection />
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label-arch mb-3 text-stone">{label}</dt>
      <dd className="text-[0.9375rem] leading-relaxed text-ink">{value}</dd>
    </div>
  );
}
