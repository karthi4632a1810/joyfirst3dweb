import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { CtaSection } from "@/components/sections/CtaSection";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal, RevealText } from "@/components/ui/RevealText";
import { site } from "@/data/site";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About",
  description:
    "JOYFIRST is a Chennai architecture and interiors studio founded by J. Arjun, delivering design and execution in-house across India.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    index: "01",
    title: "Design philosophy",
    body: "Architecture is a climate device before it is an image. We start with orientation, shade and airflow, and let the form follow from what the site is actually doing.",
  },
  {
    index: "02",
    title: "Functionality",
    body: "A plan has to work on an ordinary Tuesday, not just in a photograph. Storage, circulation and services are designed at the same time as the spaces they serve.",
  },
  {
    index: "03",
    title: "Creativity with constraint",
    body: "Budget and programme are part of the brief, not obstacles to it. The interesting decisions are usually the ones made inside a limit.",
  },
  {
    index: "04",
    title: "Attention to detail",
    body: "Junctions, reveals and shadow gaps are resolved on paper before anyone is on site. It is slower at the start and much faster afterwards.",
  },
  {
    index: "05",
    title: "Client collaboration",
    body: "You see the same 3D models and drawings we do, at every stage. Decisions get made looking at the space, not at a specification.",
  },
  {
    index: "06",
    title: "Quality execution",
    body: "ISO-certified processes across quality, environment and site safety — and the same team from concept to handover.",
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "About", url: "/about" },
        ])}
      />

      <PageHeader
        eyebrow="Studio"
        lines={["Designed with purpose.", "Built for life."]}
        intro={`${site.legalName} is an architecture and interiors studio based in Chennai, founded by ${site.founder}. We design and execute, which means one team is accountable from the first sketch to the day you move in.`}
        meta={[
          { label: "Founded by", value: site.founder },
          { label: "Based in", value: "Chennai, Tamil Nadu" },
          { label: "Coverage", value: "PAN India" },
          { label: "Certifications", value: site.certifications.join(", ") },
        ]}
      />

      <section className="container-arch pb-[clamp(4rem,10vh,7rem)]">
        <ImageReveal
          src="/images/about.jpg"
          alt="Planted courtyard enclosed by lime-plastered walls"
          ratio="21/9"
          sizes="100vw"
          priority
        />
      </section>

      {/* ---- Statement ---------------------------------------------------- */}
      <section
        aria-labelledby="statement-heading"
        className="container-arch pb-[clamp(4rem,12vh,8rem)]"
      >
        <div className="grid gap-[clamp(2.5rem,6vw,5rem)] md:grid-cols-12">
          <div className="md:col-span-6">
            <RevealText
              as="h2"
              id="statement-heading"
              className="text-headline max-w-[16ch] break-words text-ink"
              lines={["One team,", "start to finish."]}
            />
          </div>

          <div className="md:col-span-5 md:col-start-8">
            <Reveal>
              <p className="text-lede break-words text-graphite">
                Most projects lose something in the handover between designer and
                contractor. We removed the handover.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-6 max-w-[54ch] break-words text-[0.9375rem] leading-relaxed text-stone">
                Our interior, civil, HVAC, electrical, fire-detection and
                networking teams work alongside the design team from the start,
                against a single programme. Coordination that would normally
                happen through RFIs and site meetings happens in the drawing,
                weeks earlier and at a fraction of the cost.
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-6 max-w-[54ch] break-words text-[0.9375rem] leading-relaxed text-stone">
                We work across {site.network.slice(0, -1).join(", ")} and{" "}
                {site.network.at(-1)}, and manage cross-country projects with the
                same team that designed them.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Values -------------------------------------------------------- */}
      <section
        aria-labelledby="values-heading"
        className="container-arch pb-[clamp(5rem,14vh,9rem)]"
      >
        <Reveal>
          <h2 id="values-heading" className="label-arch mb-12 text-bronze">
            What we hold to
          </h2>
        </Reveal>

        <dl className="grid gap-x-[clamp(2rem,4vw,4rem)] border-t border-line md:grid-cols-2">
          {VALUES.map((value, i) => (
            <div
              key={value.index}
              className="border-b border-line py-[clamp(2rem,4vw,3rem)]"
            >
              <Reveal delay={(i % 2) * 0.08}>
                <dt className="flex items-baseline gap-5">
                  <span className="text-[0.75rem] uppercase tracking-[0.2em] text-bronze">
                    {value.index}
                  </span>
                  <span className="text-title break-words text-ink">{value.title}</span>
                </dt>
                <dd className="mt-5 max-w-[48ch] break-words pl-[calc(0.75rem+1.25rem)] text-[0.9375rem] leading-relaxed text-stone">
                  {value.body}
                </dd>
              </Reveal>
            </div>
          ))}
        </dl>
      </section>

      <CtaSection />
    </>
  );
}
