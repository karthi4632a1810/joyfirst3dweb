import { projects } from "@/data/projects";
import { processSteps, services } from "@/data/services";
import type { Discipline, ProcessStep, Project, Service } from "@/types";

/**
 * Content access layer.
 *
 * Components never import `@/data/*` directly — they call these functions. That
 * keeps the Sanity migration to a single file: replace each body below with a
 * `sanityClient.fetch(...)` call and every page keeps working unchanged.
 *
 * All functions are async for exactly that reason, even though the local
 * implementation resolves synchronously.
 */

const byOrder = (a: Project, b: Project) => a.order - b.order;

export async function getAllProjects(): Promise<Project[]> {
  return [...projects].sort(byOrder);
}

export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  return [...projects]
    .filter((project) => project.featured)
    .sort(byOrder)
    .slice(0, limit);
}

export async function getProjectsByDiscipline(
  discipline: Discipline,
): Promise<Project[]> {
  return [...projects]
    .filter((project) => project.discipline === discipline)
    .sort(byOrder);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function getProjectSlugs(): Promise<string[]> {
  return projects.map((project) => project.slug);
}

/**
 * Projects shown at the foot of a detail page: same discipline first, then
 * anything else, never the project itself.
 */
export async function getRelatedProjects(
  slug: string,
  limit = 3,
): Promise<Project[]> {
  const current = await getProjectBySlug(slug);
  if (!current) return [];

  const others = projects.filter((project) => project.slug !== slug);
  const sameDiscipline = others.filter(
    (project) => project.discipline === current.discipline,
  );
  const rest = others.filter(
    (project) => project.discipline !== current.discipline,
  );

  return [...sameDiscipline.sort(byOrder), ...rest.sort(byOrder)].slice(0, limit);
}

export async function getServices(): Promise<Service[]> {
  return services;
}

export async function getProcessSteps(): Promise<ProcessStep[]> {
  return processSteps;
}
