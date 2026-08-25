import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { CtaSection } from "@/components/sections/CtaSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/RevealText";
import { site } from "@/data/site";
import { getProcessSteps, getServices } from "@/lib/content";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Architecture, interior design, 3D visualisation and turnkey project management — with civil, HVAC, electrical, fire detection and networking delivered in-house.",
  alternates: { canonical: "/services" },
};

/** Trades delivered in-house, from the studio's stated capability. */
const TRADES = [
  "Interior Fit-Out",
  "Civil",
  "HVAC",
  "Electrical",
  "Fire Detection & Alarm",
  "Networking",
  "Project Management Consultancy",
];

export default async function ServicesPage() {
  const [services, processSteps] = await Promise.all([
    getServices(),
    getProcessSteps(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
        ])}
      />

      <PageHeader
        eyebrow="Capability"
        lines={["Design and delivery,", "under one roof."]}
        intro="Four disciplines, one accountable team. Because we design and execute, there is no gap between what was promised and what gets built."
        meta={[
          { label: "Disciplines", value: "4" },
          { label: "Trades in-house", value: String(TRADES.length) },
          { label: "Certifications", value: site.certifications.join(", ") },
          { label: "Coverage", value: "PAN India" },
        ]}
      />

      {/* ---- Detailed services ------------------------------------------- */}
      <section aria-label="Services in detail" className="container-arch pb-[clamp(4rem,10vh,7rem)]">
        <div className="flex flex-col">
          {services.map((service, i) => (
            <article
              key={service.slug}
              id={service.slug}
              className="grid scroll-mt-28 gap-[clamp(2rem,5vw,4rem)] border-t border-line py-[clamp(3rem,7vw,5rem)] last:border-b md:grid-cols-12"
            >
              <div className="md:col-span-1">
                <Reveal>
                  <p className="text-[0.75rem] uppercase tracking-[0.2em] text-bronze">
                    {service.index}
                  </p>
                </Reveal>
              </div>

              <div className="md:col-span-5">
                <Reveal delay={0.05}>
                  <h2 className="text-headline text-ink">{service.title}</h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="mt-6 max-w-[44ch] text-lede text-graphite">
                    {service.summary}
                  </p>
                </Reveal>
                <Reveal delay={0.15}>
                  <ul className="mt-8 flex flex-col gap-3">
                    {service.capabilities.map((capability) => (
                      <li
                        key={capability}
                        className="flex items-center gap-4 text-[0.9375rem] text-stone"
                      >
                        <span
                          aria-hidden="true"
                          className="block h-px w-6 shrink-0 bg-bronze/60"
                        />
                        {capability}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>

              <div className="md:col-span-5 md:col-start-8">
                <ImageReveal
                  src={service.image}
                  alt={service.imageAlt}
                  ratio="4/5"
                  sizes="(max-width: 768px) 100vw, 40vw"
                  priority={i === 0}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---- In-house trades --------------------------------------------- */}
      <section
        aria-labelledby="trades-heading"
        className="container-arch pb-[clamp(4rem,12vh,8rem)]"
      >
        <Reveal>
          <h2 id="trades-heading" className="label-arch mb-10 text-bronze">
            Delivered in-house
          </h2>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mb-12 max-w-[54ch] text-lede text-graphite">
            Every trade below is designed and executed by our own teams, working
            to one programme. It is the reason a fit-out can land in twenty-two
            weeks without losing its detail.
          </p>
        </Reveal>

        <ul className="grid gap-px border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {TRADES.map((trade, i) => (
            <li key={trade} className="border-b border-line">
              <Reveal delay={i * 0.04}>
                <span className="block py-6 text-[1.0625rem] text-ink">{trade}</span>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <ProcessSection steps={processSteps} />
      <CtaSection />
    </>
  );
}
