import { ArrowLink } from "@/components/ui/MagneticButton";
import { Reveal, RevealText } from "@/components/ui/RevealText";
import { site } from "@/data/site";

/**
 * Closing call to action. One instruction, one link, and the two ways to reach
 * the studio directly for anyone who would rather not fill in a form.
 */
export function CtaSection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative overflow-hidden border-t border-line bg-bone py-[clamp(6rem,18vh,12rem)]"
    >
      <div className="container-arch">
        <Reveal>
          <p className="label-arch mb-[clamp(2.5rem,6vh,4rem)] text-bronze">
            07 — Next
          </p>
        </Reveal>

        <RevealText
          as="h2"
          id="cta-heading"
          className="text-display max-w-[14ch] break-words text-ink"
          lines={["Let's create", "something beautiful."]}
        />

        <div className="mt-[clamp(3rem,8vh,5rem)] flex min-w-0 flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <Reveal delay={0.1}>
            <ArrowLink href="/contact" variant="solid">
              Start your project
            </ArrowLink>
          </Reveal>

          <Reveal delay={0.16} className="min-w-0">
            <div className="flex min-w-0 flex-col gap-3 md:items-end">
              <a
                href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                data-cursor="hover"
                className="inline-block min-h-[44px] touch-manipulation break-words text-[clamp(1.125rem,2vw,1.5rem)] tracking-[-0.01em] text-graphite transition-colors duration-500 hover:text-bronze"
              >
                {site.contact.phone}
              </a>
              <a
                href={`mailto:${site.contact.email}`}
                data-cursor="hover"
                className="inline-block min-h-[44px] touch-manipulation break-words text-[clamp(1.125rem,2vw,1.5rem)] tracking-[-0.01em] text-graphite transition-colors duration-500 hover:text-bronze"
              >
                {site.contact.email}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
