import { Reveal, RevealText } from "@/components/ui/RevealText";

interface PageHeaderProps {
  eyebrow: string;
  /** One entry per visual line of the headline. */
  lines: string[];
  intro?: string;
  meta?: { label: string; value: string }[];
}

/**
 * Shared masthead for the interior pages.
 *
 * Generous top padding clears the fixed navigation and gives every page the
 * same quiet opening beat before its content starts.
 */
export function PageHeader({ eyebrow, lines, intro, meta }: PageHeaderProps) {
  return (
    <header className="container-arch pb-[clamp(3rem,8vh,5rem)] pt-[clamp(8rem,20vh,13rem)]">
      <Reveal>
        <p className="label-arch mb-[clamp(2rem,5vh,3rem)] text-bronze">
          {eyebrow}
        </p>
      </Reveal>

      <RevealText
        as="h1"
        className="text-display max-w-[16ch] text-ink"
        lines={lines}
        immediate
      />

      {intro && (
        <Reveal delay={0.15}>
          <p className="mt-[clamp(2rem,5vh,3rem)] max-w-[52ch] text-lede text-graphite">
            {intro}
          </p>
        </Reveal>
      )}

      {meta && meta.length > 0 && (
        <Reveal delay={0.22}>
          <dl className="mt-[clamp(3rem,7vh,4.5rem)] grid gap-x-8 gap-y-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="label-arch mb-3 text-stone">{item.label}</dt>
                <dd className="text-[0.9375rem] leading-relaxed text-ink">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      )}
    </header>
  );
}
