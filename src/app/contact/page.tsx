import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/sections/ContactForm";
import { Reveal } from "@/components/ui/RevealText";
import { site } from "@/data/site";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a project with JOYFIRST. Architecture, interiors and turnkey fit-out from Chennai, across India.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ])}
      />

      <PageHeader
        eyebrow="Contact"
        lines={["Let's create", "something beautiful."]}
        intro="Tell us about the site, the brief and roughly when you would like to start. If a phone call is easier, the studio number is below."
      />

      <section className="container-arch pb-[clamp(5rem,14vh,9rem)]">
        <div className="grid gap-[clamp(3rem,7vw,6rem)] md:grid-cols-12">
          {/* Form */}
          <div className="md:col-span-7">
            <ContactForm />
          </div>

          {/* Direct details */}
          <div className="md:col-span-4 md:col-start-9">
            <Reveal>
              <div className="border-t border-line pt-8">
                <p className="label-arch mb-5 text-stone">Speak to us</p>
                <ul className="flex flex-col gap-3">
                  <li>
                    <a
                      href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                      data-cursor="hover"
                      className="text-[1.125rem] text-ink transition-colors duration-500 hover:text-bronze"
                    >
                      {site.contact.phone}
                    </a>
                  </li>
                  <li>
                    <a
                      href={`tel:${site.contact.phoneSecondary.replace(/\s/g, "")}`}
                      data-cursor="hover"
                      className="text-[1.125rem] text-graphite transition-colors duration-500 hover:text-bronze"
                    >
                      {site.contact.phoneSecondary}
                    </a>
                  </li>
                  <li>
                    <a
                      href={`tel:${site.contact.landline.replace(/\s/g, "")}`}
                      data-cursor="hover"
                      className="text-[1.125rem] text-graphite transition-colors duration-500 hover:text-bronze"
                    >
                      {site.contact.landline}
                    </a>
                  </li>
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-10 border-t border-line pt-8">
                <p className="label-arch mb-5 text-stone">Email</p>
                <ul className="flex flex-col gap-3">
                  <li>
                    <a
                      href={`mailto:${site.contact.email}`}
                      data-cursor="hover"
                      className="text-[1.0625rem] text-ink transition-colors duration-500 hover:text-bronze"
                    >
                      {site.contact.email}
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${site.contact.emailSecondary}`}
                      data-cursor="hover"
                      className="text-[1.0625rem] text-graphite transition-colors duration-500 hover:text-bronze"
                    >
                      {site.contact.emailSecondary}
                    </a>
                  </li>
                </ul>
              </div>
            </Reveal>

            {[site.addresses.registered, site.addresses.studio].map((address, i) => (
              <Reveal key={address.label} delay={0.14 + i * 0.06}>
                <div className="mt-10 border-t border-line pt-8">
                  <p className="label-arch mb-5 text-stone">{address.label}</p>
                  <address className="not-italic text-[0.9375rem] leading-relaxed text-graphite">
                    {address.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </div>
              </Reveal>
            ))}

            <Reveal delay={0.28}>
              <div className="mt-10 border-t border-line pt-8">
                <p className="label-arch mb-5 text-stone">Follow</p>
                <ul className="flex flex-wrap gap-x-6 gap-y-3">
                  {site.social.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-cursor="hover"
                        className="text-[0.8125rem] uppercase tracking-[0.14em] text-graphite transition-colors duration-500 hover:text-bronze"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
