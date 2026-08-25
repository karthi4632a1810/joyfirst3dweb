import type { ProcessStep, Service } from "@/types";

/**
 * Service capabilities. The four disciplines below are the studio-facing
 * offering; the technical trades listed under Project Management reflect the
 * in-house capability described on the existing joyfirst.in site.
 */
export const services: Service[] = [
  {
    slug: "architecture",
    index: "01",
    title: "Architecture",
    summary:
      "From first sketch to handover. We take a site, a budget and a way of living, and resolve them into a building.",
    capabilities: ["Concept", "Planning", "Design Development", "Execution"],
    image: "/images/services/architecture.jpg",
    imageAlt: "Concrete and glass residential elevation in raking afternoon light",
  },
  {
    slug: "interior-design",
    index: "02",
    title: "Interior Design",
    summary:
      "Interiors designed as architecture — planned around light, movement and material rather than decorated after the fact.",
    capabilities: ["Residential", "Commercial", "Hospitality", "Turnkey Fit-Out"],
    image: "/images/services/interior-design.jpg",
    imageAlt: "Oak-lined interior with travertine floor and soft directional daylight",
  },
  {
    slug: "3d-visualisation",
    index: "03",
    title: "3D Visualisation",
    summary:
      "Photoreal models and walkthroughs, so decisions are made looking at the space rather than at a drawing.",
    capabilities: ["3D Modelling", "Rendering", "Walkthrough", "Real-time Web 3D"],
    image: "/images/services/visualisation.jpg",
    imageAlt: "Architectural massing study rendered in monochrome",
  },
  {
    slug: "project-management",
    index: "04",
    title: "Project Management",
    summary:
      "Single-point delivery across every trade — civil, HVAC, electrical, fire detection and networking, coordinated in-house.",
    capabilities: ["Planning", "Coordination", "Execution", "Handover"],
    image: "/images/services/project-management.jpg",
    imageAlt: "Structural frame under construction against an overcast sky",
  },
];

export const processSteps: ProcessStep[] = [
  {
    index: "01",
    title: "Understand",
    body: "We start on site and in conversation. How you use a space, what the light does through the day, what the budget will actually carry. Nothing is drawn until this is clear.",
  },
  {
    index: "02",
    title: "Imagine",
    body: "Options, tested quickly and honestly. Massing studies, sections and 3D walkthroughs let us discard the ideas that do not work before they become expensive.",
  },
  {
    index: "03",
    title: "Design",
    body: "The chosen direction is resolved down to the joint. Materials, services and detailing are coordinated together so the drawings match what gets built.",
  },
  {
    index: "04",
    title: "Build",
    body: "Execution managed by the people who designed it. Every trade is coordinated in-house against one programme, and we hand over complete.",
  },
];

export const projectTypes = [
  "Residential",
  "Commercial",
  "Interior",
  "Renovation",
  "Other",
] as const;

export type ProjectType = (typeof projectTypes)[number];

export const budgetRanges = [
  "Under ₹25 lakh",
  "₹25 – 50 lakh",
  "₹50 lakh – 1 crore",
  "₹1 – 3 crore",
  "Above ₹3 crore",
  "Not yet defined",
] as const;
