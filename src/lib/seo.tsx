import { site } from "@/data/site";
import type { Project } from "@/types";

/**
 * JSON-LD builders.
 *
 * Only facts that are actually known about the studio are emitted — inventing
 * ratings, founding dates or price ranges to fill a schema is a good way to
 * earn a manual action.
 */

export function organisationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "GeneralContractor"],
    "@id": `${site.url}/#organisation`,
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    description: site.description,
    slogan: site.tagline,
    image: `${site.url}/images/og.jpg`,
    logo: `${site.url}/brand/jflogo.png`,
    email: site.contact.email,
    telephone: site.contact.phone,
    founder: { "@type": "Person", name: site.founder },
    address: {
      "@type": "PostalAddress",
      streetAddress: "#17, Shanthi Flats, C1, N.V. Street, Mylapore",
      addressLocality: "Chennai",
      addressRegion: "Tamil Nadu",
      postalCode: "600004",
      addressCountry: "IN",
    },
    areaServed: site.network.map((region) => ({
      "@type": "AdministrativeArea",
      name: region,
    })),
    sameAs: site.social.map((item) => item.href),
    hasCredential: site.certifications.map((certification) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "certification",
      name: certification,
    })),
    knowsAbout: [
      "Architecture",
      "Interior Design",
      "Turnkey Interior Fit-Out",
      "3D Architectural Visualisation",
      "Project Management",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    description: site.description,
    publisher: { "@id": `${site.url}/#organisation` },
    inLanguage: "en-IN",
  };
}

export function projectJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${site.url}/projects/${project.slug}#project`,
    name: project.title,
    description: project.summary,
    url: `${site.url}/projects/${project.slug}`,
    image: `${site.url}${project.coverImage}`,
    dateCreated: project.year,
    creator: { "@id": `${site.url}/#organisation` },
    locationCreated: { "@type": "Place", name: project.location },
    genre: project.category,
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${site.url}${item.url}`,
    })),
  };
}

/** Renders a JSON-LD block. Content is authored in this file, never user input. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
