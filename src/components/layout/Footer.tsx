import Link from "next/link";

import { footerNavigation, site } from "@/data/site";

/**
 * Minimal footer: identity, disciplines, where the studio is, how to reach it.
 * Deliberately typographic — no cards, no logos, no newsletter.
 *
 * The one dark block on an otherwise light site. It gives the page a floor to
 * land on, and keeps the closing contact details from dissolving into the same
 * paper tone as everything above them. `data-surface="dark"` switches the focus
 * ring to the lighter bronze.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer data-surface="dark" className="relative bg-ink pb-[env(safe-area-inset-bottom)]">
      <div className="container-arch py-[clamp(4rem,10vw,7rem)]">
        <div className="grid gap-[clamp(3rem,6vw,4rem)] md:grid-cols-12">
          {/* Identity */}
          <div className="md:col-span-5 lg:col-span-4">
            <p className="text-[1.375rem] font-medium uppercase tracking-[0.3em] text-paper">
              {site.name}
            </p>
            <p className="mt-6 max-w-[34ch] text-[0.9375rem] leading-relaxed text-mist">
              {site.tagline} Architecture, interiors and turnkey delivery from
              Chennai, across India.
            </p>

            <ul className="mt-8 flex flex-wrap gap-x-4 gap-y-2">
              {site.certifications.map((certification) => (
                <li
                  key={certification}
                  className="border border-line-dark px-3 py-1.5 text-[0.6875rem] uppercase tracking-[0.12em] text-mist"
                >
                  {certification}
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer" className="md:col-span-3 lg:col-span-2">
            <p className="label-arch mb-6 text-bronze-soft">Work</p>
            <ul className="flex flex-col gap-3">
              {footerNavigation.work.map((item) => (
                <li key={item.href}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>

            <p className="label-arch mb-6 mt-10 text-bronze-soft">Studio</p>
            <ul className="flex flex-col gap-3">
              {footerNavigation.studio.map((item) => (
                <li key={item.href}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="md:col-span-4 lg:col-span-3">
            <p className="label-arch mb-6 text-bronze-soft">Contact</p>
            <ul className="flex flex-col gap-3">
              <li>
                <FooterLink href={`tel:${site.contact.phone.replace(/\s/g, "")}`} external>
                  {site.contact.phone}
                </FooterLink>
              </li>
              <li>
                <FooterLink href={`tel:${site.contact.landline.replace(/\s/g, "")}`} external>
                  {site.contact.landline}
                </FooterLink>
              </li>
              <li>
                <FooterLink href={`mailto:${site.contact.email}`} external>
                  {site.contact.email}
                </FooterLink>
              </li>
            </ul>

            <p className="label-arch mb-6 mt-10 text-bronze-soft">
              {site.addresses.registered.label}
            </p>
            <address className="not-italic text-[0.9375rem] leading-relaxed text-mist">
              {site.addresses.registered.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>

          {/* Reach */}
          <div className="md:col-span-12 lg:col-span-3">
            <p className="label-arch mb-6 text-bronze-soft">Projects across</p>
            <p className="max-w-[26ch] text-[0.9375rem] leading-relaxed text-mist">
              {site.network.join(" · ")}
            </p>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-1">
              {site.social.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-cursor="hover"
                    className="inline-block min-h-[44px] touch-manipulation py-1.5 text-[0.8125rem] uppercase tracking-[0.14em] text-mist transition-colors duration-500 hover:text-paper"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-[clamp(3.5rem,8vw,6rem)] flex flex-col gap-4 border-t border-line-dark pt-8 text-[0.75rem] uppercase tracking-[0.12em] text-stone sm:flex-row sm:items-center sm:justify-between">
          <p className="text-mist">
            © {year} {site.legalName}
          </p>
          <p className="text-mist">Architecture · Interiors · Visualisation</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const className =
    "inline-block min-h-[44px] touch-manipulation content-center break-words py-1.5 text-[0.9375rem] text-mist transition-colors duration-500 hover:text-paper";

  if (external) {
    return (
      <a href={href} data-cursor="hover" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} data-cursor="hover" className={className}>
      {children}
    </Link>
  );
}
