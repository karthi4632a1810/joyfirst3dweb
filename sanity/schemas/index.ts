/**
 * Sanity schema definitions for JOYFIRST.
 *
 * These are ready to drop into a Sanity Studio — they mirror the types in
 * `src/types/index.ts` field for field, so migrating the site is a matter of
 * rewriting the bodies of `src/lib/content.ts` to fetch instead of returning
 * local data. No component changes are required.
 *
 * To connect a studio:
 *   1. `npm create sanity@latest -- --project <id> --dataset production`
 *   2. Point its `schema.types` at this array.
 *   3. Set NEXT_PUBLIC_SANITY_PROJECT_ID / _DATASET in `.env.local`.
 *   4. Replace the function bodies in `src/lib/content.ts`.
 *
 * This file is intentionally not imported by the app — it has no runtime role
 * until a studio exists.
 */

import type { SchemaTypeDefinition } from "sanity";

const project: SchemaTypeDefinition = {
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string", validation: (rule) => rule.required() },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          "Residential Architecture",
          "Commercial Architecture",
          "Interior Design",
          "Turnkey Fit-Out",
          "Hospitality",
        ],
      },
      validation: (rule) => rule.required(),
    },
    {
      name: "discipline",
      title: "Discipline",
      description: "Drives which index page the project appears on.",
      type: "string",
      options: { list: ["architecture", "interiors"], layout: "radio" },
      validation: (rule) => rule.required(),
    },
    { name: "location", title: "Location", type: "string", validation: (rule) => rule.required() },
    { name: "year", title: "Year", type: "string", validation: (rule) => rule.required() },
    { name: "area", title: "Area", type: "string" },
    {
      name: "summary",
      title: "Summary",
      description: "One line. Used in listings and as the meta description.",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(220),
    },
    {
      name: "description",
      title: "Design story",
      description: "One entry per paragraph.",
      type: "array",
      of: [{ type: "text", rows: 4 }],
    },
    {
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string", validation: (rule) => rule.required() }],
      validation: (rule) => rule.required(),
    },
    {
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", title: "Alt text", type: "string", validation: (rule) => rule.required() },
            { name: "caption", title: "Caption", type: "string" },
            {
              name: "span",
              title: "Layout",
              type: "string",
              options: { list: ["full", "half", "offset"], layout: "radio" },
              initialValue: "full",
            },
          ],
        },
      ],
    },
    {
      name: "model",
      title: "3D model (GLB)",
      description: "Optional. Draco-compressed GLB. Falls back to the built-in scene.",
      type: "file",
      options: { accept: ".glb,.gltf" },
    },
    {
      name: "facts",
      title: "Project details",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Label", type: "string" },
            { name: "value", title: "Value", type: "string" },
          ],
        },
      ],
    },
    { name: "featured", title: "Featured on homepage", type: "boolean", initialValue: false },
    { name: "order", title: "Order", type: "number", validation: (rule) => rule.required() },
  ],
  preview: {
    select: { title: "title", subtitle: "location", media: "coverImage" },
  },
};

const service: SchemaTypeDefinition = {
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string", validation: (rule) => rule.required() },
    { name: "slug", title: "Slug", type: "slug", options: { source: "title" } },
    { name: "index", title: "Index", description: 'e.g. "01"', type: "string" },
    { name: "summary", title: "Summary", type: "text", rows: 3 },
    { name: "capabilities", title: "Capabilities", type: "array", of: [{ type: "string" }] },
    {
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    },
  ],
};

const teamMember: SchemaTypeDefinition = {
  name: "teamMember",
  title: "Team member",
  type: "document",
  fields: [
    { name: "name", title: "Name", type: "string", validation: (rule) => rule.required() },
    { name: "role", title: "Role", type: "string", validation: (rule) => rule.required() },
    { name: "bio", title: "Bio", type: "text", rows: 4 },
    {
      name: "image",
      title: "Portrait",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    },
    { name: "order", title: "Order", type: "number" },
  ],
};

const siteSettings: SchemaTypeDefinition = {
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    { name: "name", title: "Studio name", type: "string" },
    { name: "legalName", title: "Legal name", type: "string" },
    { name: "tagline", title: "Tagline", type: "string" },
    { name: "description", title: "Meta description", type: "text", rows: 3 },
    { name: "founder", title: "Founder", type: "string" },
    {
      name: "contact",
      title: "Contact",
      type: "object",
      fields: [
        { name: "email", title: "Email", type: "string" },
        { name: "emailSecondary", title: "Secondary email", type: "string" },
        { name: "phone", title: "Phone", type: "string" },
        { name: "phoneSecondary", title: "Secondary phone", type: "string" },
        { name: "landline", title: "Landline", type: "string" },
      ],
    },
    {
      name: "addresses",
      title: "Addresses",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Label", type: "string" },
            { name: "lines", title: "Lines", type: "array", of: [{ type: "string" }] },
          ],
        },
      ],
    },
    { name: "network", title: "Regions served", type: "array", of: [{ type: "string" }] },
    { name: "certifications", title: "Certifications", type: "array", of: [{ type: "string" }] },
    {
      name: "social",
      title: "Social links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Label", type: "string" },
            { name: "href", title: "URL", type: "url" },
          ],
        },
      ],
    },
  ],
};

export const schemaTypes: SchemaTypeDefinition[] = [
  project,
  service,
  teamMember,
  siteSettings,
];
