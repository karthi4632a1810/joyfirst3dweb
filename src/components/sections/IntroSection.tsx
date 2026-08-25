import { Reveal, RevealText } from "@/components/ui/RevealText";

/**
 * The statement that follows the hero. Nothing but type and space — the first
 * moment on the page where the visitor is asked to read rather than look.
 */
export function IntroSection() {
  return (
    <section
      aria-labelledby="intro-heading"
      className="relative bg-paper py-[clamp(6rem,18vh,12rem)]"
    >
      <div className="container-arch">
        <Reveal className="mb-[clamp(3rem,8vh,5rem)]">
          <p className="label-arch text-bronze">01 — Approach</p>
        </Reveal>

        <RevealText
          as="h2"
          id="intro-heading"
          className="text-display max-w-[16ch] text-ink"
          lines={[
            "We don't just design",
            <span key="b" className="text-stone">
              buildings.
            </span>,
            "We design how",
            <span key="d" className="text-stone">
              life moves through them.
            </span>,
          ]}
        />

        <div className="mt-[clamp(3.5rem,10vh,7rem)] grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5 md:col-start-7">
            <Reveal>
              <p className="text-lede text-graphite">
                Every project starts on site — with the light, the wind, the
                neighbours and the way a family actually lives. The drawing comes
                after.
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-[52ch] text-[0.9375rem] leading-relaxed text-stone">
                We work across architecture, interiors and turnkey delivery, which
                means the people who design a space are the people accountable for
                building it. Fewer handovers, fewer compromises, and a result that
                matches what was promised.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
