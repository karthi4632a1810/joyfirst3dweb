import { ArrowLink } from "@/components/ui/MagneticButton";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal, RevealText } from "@/components/ui/RevealText";
import { site } from "@/data/site";

const PILLARS = [
  {
    title: "Design with intent",
    body: "Every decision answers to something — the climate, the budget, the way the room will actually be used. Nothing is there because it looked good in a reference image.",
  },
  {
    title: "Built to last",
    body: "Detailing is resolved before work starts on site, and the same team carries it through execution. Quality is a process, not an inspection at the end.",
  },
  {
    title: "Client at the table",
    body: "You see the same models and drawings we do, at every stage. No surprises at handover, in either direction.",
  },
];

/**
 * Studio introduction. Short by design — the work above it has already made the
 * argument, so this only has to say who is behind it.
 */
export function AboutSection() {
  return (
    <section
      aria-labelledby="about-heading"
      className="relative bg-paper py-[clamp(5rem,14vh,9rem)]"
    >
      <div className="container-arch">
        <div className="grid gap-[clamp(3rem,7vw,5rem)] md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal>
              <p className="label-arch mb-6 text-bronze">06 — Studio</p>
            </Reveal>

            <RevealText
              as="h2"
              id="about-heading"
              className="text-headline max-w-[14ch] break-words text-ink"
              lines={["Designed with purpose.", "Built for life."]}
            />

            <Reveal delay={0.1} className="min-w-0">
              <p className="mt-[clamp(2rem,5vh,3rem)] max-w-[46ch] break-words text-lede text-graphite">
                {site.legalName} is a Chennai studio working across architecture,
                interiors and turnkey delivery — founded by {site.founder} and
                working on projects from Tamil Nadu to Punjab.
              </p>
            </Reveal>

            <Reveal delay={0.16} className="min-w-0">
              <p className="mt-6 max-w-[52ch] break-words text-[0.9375rem] leading-relaxed text-stone">
                Because design and execution sit under one roof, the drawing that
                gets approved is the thing that gets built. Our civil, HVAC,
                electrical, fire-detection and networking teams work to the same
                programme as the design team, which is how a fit-out lands on
                time without quietly shedding its detail.
              </p>
            </Reveal>

            <Reveal delay={0.22}>
              <ul className="mt-10 flex flex-wrap gap-x-3 gap-y-2">
                {site.certifications.map((certification) => (
                  <li
                    key={certification}
                    className="border border-line px-3 py-1.5 text-[0.6875rem] uppercase tracking-[0.12em] text-stone"
                  >
                    {certification}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.28}>
              <div className="mt-10">
                <ArrowLink href="/about">About the studio</ArrowLink>
              </div>
            </Reveal>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <ImageReveal
              src="/images/about.jpg"
              alt="Planted courtyard enclosed by lime-plastered walls"
              ratio="4/3"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            <dl className="mt-[clamp(2.5rem,6vw,4rem)] grid grid-cols-1 gap-x-8 gap-y-10 min-[26.25rem]:grid-cols-2 sm:grid-cols-3">
              {PILLARS.map((pillar, i) => (
                <Reveal key={pillar.title} delay={i * 0.08} className="col-span-1">
                  <dt className="text-[0.9375rem] font-medium text-ink">
                    {pillar.title}
                  </dt>
                  <dd className="mt-3 text-[0.8125rem] leading-relaxed text-stone">
                    {pillar.body}
                  </dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
