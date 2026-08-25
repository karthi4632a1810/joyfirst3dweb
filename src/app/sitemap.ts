import type { MetadataRoute } from "next";

import { site } from "@/data/site";
import { getAllProjects } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getAllProjects();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, changeFrequency: "monthly", priority: 1, lastModified: now },
    { url: `${site.url}/projects`, changeFrequency: "monthly", priority: 0.9, lastModified: now },
    { url: `${site.url}/architecture`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${site.url}/interiors`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${site.url}/services`, changeFrequency: "yearly", priority: 0.7, lastModified: now },
    { url: `${site.url}/about`, changeFrequency: "yearly", priority: 0.7, lastModified: now },
    { url: `${site.url}/contact`, changeFrequency: "yearly", priority: 0.6, lastModified: now },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${site.url}/projects/${project.slug}`,
    changeFrequency: "yearly",
    priority: 0.7,
    lastModified: now,
  }));

  return [...staticRoutes, ...projectRoutes];
}
