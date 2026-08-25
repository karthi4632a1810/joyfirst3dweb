/**
 * Domain types for JOYFIRST.
 *
 * These mirror the Sanity schemas in `sanity/schemas` so the data layer can be
 * swapped from local mock data to a Sanity-backed fetch without touching any
 * component. See `src/lib/content.ts` for the swap point.
 */

export type ProjectCategory =
  | "Residential Architecture"
  | "Commercial Architecture"
  | "Interior Design"
  | "Turnkey Fit-Out"
  | "Hospitality";

export type Discipline = "architecture" | "interiors";

export interface ProjectImage {
  src: string;
  alt: string;
  /** Optional caption shown beneath the image in the detail gallery. */
  caption?: string;
  /** Layout hint for the editorial gallery: full-bleed, half, or offset. */
  span?: "full" | "half" | "offset";
}

export interface ProjectFact {
  label: string;
  value: string;
}

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  /** Drives the /architecture and /interiors index pages. */
  discipline: Discipline;
  location: string;
  year: string;
  area?: string;
  /** One-line summary used in listings and meta descriptions. */
  summary: string;
  /** Long-form design story, one paragraph per entry. */
  description: string[];
  coverImage: string;
  coverAlt: string;
  gallery: ProjectImage[];
  /** Optional GLB. Absent models fall back to <ModelFallback /> automatically. */
  model?: string;
  facts: ProjectFact[];
  featured: boolean;
  /** Display order in listings (ascending). */
  order: number;
}

export interface Service {
  slug: string;
  index: string;
  title: string;
  summary: string;
  capabilities: string[];
  image: string;
  imageAlt: string;
}

export interface ProcessStep {
  index: string;
  title: string;
  body: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  image?: string;
}
