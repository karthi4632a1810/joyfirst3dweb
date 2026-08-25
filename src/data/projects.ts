import type { Project } from "@/types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PLACEHOLDER PROJECT CONTENT
 * ─────────────────────────────────────────────────────────────────────────────
 * Every project below is illustrative placeholder content written to show the
 * layouts at full fidelity. Titles, locations, areas, years and copy are NOT
 * real JOYFIRST commissions and must be replaced before launch.
 *
 * Replacing content:
 *   1. Swap the image files under `public/images/projects/<slug>/` — keep the
 *      filenames and the site picks them up with no code change.
 *   2. Edit the fields here, or point `src/lib/content.ts` at Sanity.
 *
 * Real studio facts (contact, addresses, certifications) live in `site.ts`.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const img = (slug: string, name: string) => `/images/projects/${slug}/${name}.jpg`;

export const projects: Project[] = [
  {
    slug: "modern-residence",
    title: "Modern Residence",
    category: "Residential Architecture",
    discipline: "architecture",
    location: "Chennai, Tamil Nadu",
    year: "2026",
    area: "3,500 sq.ft",
    summary:
      "A four-bedroom home organised around a shaded central court that keeps the interior cool through the Chennai summer.",
    description: [
      "The site is a narrow east-facing plot hemmed in on three sides. Rather than push the house to the boundary, we hollowed out its centre — a double-height court that draws light deep into the plan and gives every room a second aspect.",
      "A folded concrete screen wraps the western face. It reads as a single continuous surface from the street, but from inside it dissolves into a rhythm of light and shadow that moves across the floor over the course of the day.",
      "Materials are deliberately few: board-formed concrete, teak, lime plaster and Kota stone. Nothing is applied as finish; every surface is the structure showing itself.",
    ],
    coverImage: img("modern-residence", "cover"),
    coverAlt:
      "Modern Residence, Chennai — board-formed concrete façade with deep shaded openings at dusk",
    gallery: [
      { src: img("modern-residence", "01"), alt: "Street elevation and entrance court", span: "full" },
      {
        src: img("modern-residence", "02"),
        alt: "Double-height central courtyard",
        span: "half",
        caption: "The court is the lung of the plan.",
      },
      { src: img("modern-residence", "03"), alt: "Living room with full-height glazing", span: "half" },
      { src: img("modern-residence", "04"), alt: "Stair volume in board-formed concrete", span: "offset" },
      { src: img("modern-residence", "05"), alt: "Upper terrace looking back over the court", span: "full" },
    ],
    facts: [
      { label: "Client", value: "Private" },
      { label: "Status", value: "Completed" },
      { label: "Scope", value: "Architecture, Interiors, Execution" },
      { label: "Site Area", value: "4,800 sq.ft" },
      { label: "Built-up Area", value: "3,500 sq.ft" },
      { label: "Team", value: "JOYFIRST" },
    ],
    featured: true,
    order: 1,
  },
  {
    slug: "contemporary-villa",
    title: "Contemporary Villa",
    category: "Residential Architecture",
    discipline: "architecture",
    location: "Coimbatore, Tamil Nadu",
    year: "2025",
    area: "6,200 sq.ft",
    summary:
      "A long, low villa set into a gentle slope, where the roof plane does most of the architectural work.",
    description: [
      "The brief asked for a house that could hold a large family at festivals and feel unhurried for two people the rest of the year. The plan answers with a spine of shared space and two quiet wings that can be closed off entirely.",
      "A single cantilevered roof runs the full length of the building, deep enough to shade the glazing through the hottest hours and to make the verandah usable in monsoon. Everything below it is kept light — glass, thin steel, and lime-washed masonry.",
      "The pool sits on the low side of the slope so that from the living room the water reads as continuous with the landscape beyond.",
    ],
    coverImage: img("contemporary-villa", "cover"),
    coverAlt:
      "Contemporary Villa, Coimbatore — cantilevered roof plane over a glazed living pavilion",
    gallery: [
      { src: img("contemporary-villa", "01"), alt: "Approach elevation with cantilevered roof", span: "full" },
      { src: img("contemporary-villa", "02"), alt: "Shaded verandah running the length of the plan", span: "half" },
      {
        src: img("contemporary-villa", "03"),
        alt: "Living pavilion opening to the pool",
        span: "half",
        caption: "Glazing slides fully away in the dry season.",
      },
      { src: img("contemporary-villa", "04"), alt: "Pool terrace at dusk", span: "offset" },
      { src: img("contemporary-villa", "05"), alt: "Guest wing courtyard", span: "full" },
    ],
    facts: [
      { label: "Client", value: "Private" },
      { label: "Status", value: "Completed" },
      { label: "Scope", value: "Architecture, Landscape, Interiors" },
      { label: "Site Area", value: "18,000 sq.ft" },
      { label: "Built-up Area", value: "6,200 sq.ft" },
      { label: "Team", value: "JOYFIRST" },
    ],
    featured: true,
    order: 2,
  },
  {
    slug: "urban-residence",
    title: "Urban Residence",
    category: "Residential Architecture",
    discipline: "architecture",
    location: "Chennai, Tamil Nadu",
    year: "2025",
    area: "2,800 sq.ft",
    summary:
      "A compact city house that turns its back on the road and opens completely to a rear garden.",
    description: [
      "On a dense street, privacy and daylight usually trade against each other. Here a perforated brick screen resolves both — solid enough to block sightlines from the road, open enough that the stair behind it is lit all day.",
      "The ground floor is a single continuous room. Kitchen, dining and living are separated only by a change in ceiling height and a low masonry bench that runs through all three.",
      "Bedrooms sit above, each with a small private terrace cut into the volume. The cuts are what give the street elevation its depth.",
    ],
    coverImage: img("urban-residence", "cover"),
    coverAlt: "Urban Residence, Chennai — perforated brick screen façade with recessed terraces",
    gallery: [
      { src: img("urban-residence", "01"), alt: "Perforated brick street elevation", span: "full" },
      { src: img("urban-residence", "02"), alt: "Stair lit through the brick screen", span: "half" },
      { src: img("urban-residence", "03"), alt: "Open ground floor living space", span: "half" },
      { src: img("urban-residence", "04"), alt: "Rear garden elevation", span: "offset" },
      { src: img("urban-residence", "05"), alt: "Bedroom terrace cut into the upper volume", span: "full" },
    ],
    facts: [
      { label: "Client", value: "Private" },
      { label: "Status", value: "Completed" },
      { label: "Scope", value: "Architecture, Interiors" },
      { label: "Site Area", value: "2,400 sq.ft" },
      { label: "Built-up Area", value: "2,800 sq.ft" },
      { label: "Team", value: "JOYFIRST" },
    ],
    featured: true,
    order: 3,
  },
  {
    slug: "luxury-interior",
    title: "Luxury Interior",
    category: "Interior Design",
    discipline: "interiors",
    location: "Chennai, Tamil Nadu",
    year: "2026",
    area: "4,100 sq.ft",
    summary:
      "A full interior for a sea-facing apartment, built around a restrained palette of oak, travertine and brushed bronze.",
    description: [
      "The apartment came to us as a developer shell with good proportions and no character. We kept the structural grid, removed almost every partition, and rebuilt the plan around a single long axis running from entrance to sea view.",
      "Joinery does the heavy lifting. Full-height oak cabinetry conceals storage, services and three doorways, so the walls read as calm planes rather than a collection of openings.",
      "Bronze appears only where a hand touches the building — pulls, switch plates, the stair rail. It is the one warm note in an otherwise cool palette.",
    ],
    coverImage: img("luxury-interior", "cover"),
    coverAlt: "Luxury Interior, Chennai — oak-lined living room with travertine floor and sea view",
    gallery: [
      { src: img("luxury-interior", "01"), alt: "Living room along the main axis", span: "full" },
      {
        src: img("luxury-interior", "02"),
        alt: "Full-height oak joinery wall",
        span: "half",
        caption: "Storage, services and three doors, concealed.",
      },
      { src: img("luxury-interior", "03"), alt: "Dining area with bronze detailing", span: "half" },
      { src: img("luxury-interior", "04"), alt: "Principal bedroom in muted tones", span: "offset" },
      { src: img("luxury-interior", "05"), alt: "Travertine bathroom", span: "full" },
    ],
    facts: [
      { label: "Client", value: "Private" },
      { label: "Status", value: "Completed" },
      { label: "Scope", value: "Interior Design, Joinery, Turnkey Fit-Out" },
      { label: "Carpet Area", value: "4,100 sq.ft" },
      { label: "Duration", value: "11 months" },
      { label: "Team", value: "JOYFIRST" },
    ],
    featured: true,
    order: 4,
  },
  {
    slug: "courtyard-house",
    title: "Courtyard House",
    category: "Residential Architecture",
    discipline: "architecture",
    location: "Puducherry",
    year: "2024",
    area: "4,600 sq.ft",
    summary:
      "A contemporary reading of the Tamil courtyard house, built in lime plaster and reclaimed teak.",
    description: [
      "The traditional courtyard house works because it is a climate device, not because it is picturesque. We took the device and left the ornament behind.",
      "Four wings enclose a planted court open to the sky. Rain falls into it, air moves through it, and every habitable room touches it on at least one side.",
      "Reclaimed teak columns salvaged from a demolished house nearby carry the verandah. They are the oldest thing on site and the first thing you touch.",
    ],
    coverImage: img("courtyard-house", "cover"),
    coverAlt: "Courtyard House, Puducherry — lime-plastered verandah with reclaimed teak columns",
    gallery: [
      { src: img("courtyard-house", "01"), alt: "Planted central courtyard", span: "full" },
      { src: img("courtyard-house", "02"), alt: "Teak colonnade along the verandah", span: "half" },
      { src: img("courtyard-house", "03"), alt: "Living wing opening to the court", span: "half" },
      { src: img("courtyard-house", "04"), alt: "Lime plaster detail in raking light", span: "offset" },
      { src: img("courtyard-house", "05"), alt: "Court at dusk", span: "full" },
    ],
    facts: [
      { label: "Client", value: "Private" },
      { label: "Status", value: "Completed" },
      { label: "Scope", value: "Architecture, Interiors, Execution" },
      { label: "Site Area", value: "9,200 sq.ft" },
      { label: "Built-up Area", value: "4,600 sq.ft" },
      { label: "Team", value: "JOYFIRST" },
    ],
    featured: false,
    order: 5,
  },
  {
    slug: "corporate-workplace",
    title: "Corporate Workplace",
    category: "Turnkey Fit-Out",
    discipline: "interiors",
    location: "Chennai, Tamil Nadu",
    year: "2025",
    area: "24,000 sq.ft",
    summary:
      "A single-floor workplace fit-out delivered turnkey, from services coordination to furniture handover.",
    description: [
      "Two floors of open plan had to hold four teams that work in very different ways. Instead of drawing departmental boundaries, we varied the ceiling — acoustic rafts over the quiet zones, exposed services over the collaborative ones.",
      "All MEP, fire detection and networking were designed and executed in-house alongside the interior packages, which kept the coordination overhead — and the programme — under control.",
      "The project was handed over complete, tested and occupied in twenty-two weeks.",
    ],
    coverImage: img("corporate-workplace", "cover"),
    coverAlt: "Corporate Workplace, Chennai — open-plan office with acoustic ceiling rafts",
    gallery: [
      { src: img("corporate-workplace", "01"), alt: "Open plan workstation floor", span: "full" },
      { src: img("corporate-workplace", "02"), alt: "Reception and waiting area", span: "half" },
      { src: img("corporate-workplace", "03"), alt: "Meeting rooms along the glazed edge", span: "half" },
      { src: img("corporate-workplace", "04"), alt: "Break-out and pantry", span: "offset" },
      { src: img("corporate-workplace", "05"), alt: "Exposed services over the collaborative zone", span: "full" },
    ],
    facts: [
      { label: "Client", value: "Confidential" },
      { label: "Status", value: "Completed" },
      { label: "Scope", value: "Fit-Out, Civil, HVAC, Electrical, FAS, Networking" },
      { label: "Carpet Area", value: "24,000 sq.ft" },
      { label: "Duration", value: "22 weeks" },
      { label: "Team", value: "JOYFIRST" },
    ],
    featured: false,
    order: 6,
  },
  {
    slug: "coastal-retreat",
    title: "Coastal Retreat",
    category: "Hospitality",
    discipline: "architecture",
    location: "Kochi, Kerala",
    year: "2024",
    area: "12,400 sq.ft",
    summary:
      "Eight guest pavilions and a shared dining hall, raised above a coconut grove on a flood-prone coastal site.",
    description: [
      "The whole site floods in monsoon. Rather than fight it, the buildings are lifted clear on slender columns and the ground is left to do what it does.",
      "Each pavilion is a simple pitched volume in laterite and timber, oriented to catch the sea breeze and to face away from its neighbours. Privacy comes from geometry, not from screens.",
      "The dining hall is the only shared building — a single tall room with louvred walls that can be opened on all four sides.",
    ],
    coverImage: img("coastal-retreat", "cover"),
    coverAlt: "Coastal Retreat, Kochi — timber and laterite guest pavilion raised above a coconut grove",
    gallery: [
      { src: img("coastal-retreat", "01"), alt: "Guest pavilion raised on columns", span: "full" },
      { src: img("coastal-retreat", "02"), alt: "Timber deck and louvred wall", span: "half" },
      { src: img("coastal-retreat", "03"), alt: "Dining hall interior", span: "half" },
      { src: img("coastal-retreat", "04"), alt: "Walkway through the coconut grove", span: "offset" },
      { src: img("coastal-retreat", "05"), alt: "Pavilions at dusk", span: "full" },
    ],
    facts: [
      { label: "Client", value: "Private Hospitality Group" },
      { label: "Status", value: "Completed" },
      { label: "Scope", value: "Architecture, Landscape, Interiors" },
      { label: "Site Area", value: "1.8 acres" },
      { label: "Built-up Area", value: "12,400 sq.ft" },
      { label: "Team", value: "JOYFIRST" },
    ],
    featured: false,
    order: 7,
  },
  {
    slug: "penthouse-interiors",
    title: "Penthouse Interiors",
    category: "Interior Design",
    discipline: "interiors",
    location: "Bengaluru, Karnataka",
    year: "2025",
    area: "5,300 sq.ft",
    summary:
      "A duplex penthouse reworked around a new sculptural stair and a single continuous stone floor.",
    description: [
      "The original stair was tucked into a corner and made the two levels feel like separate flats. We moved it to the centre of the plan and made it the reason the apartment holds together.",
      "It is a folded plate in blackened steel with solid oak treads, lit from a rooflight directly above so that it changes character completely between morning and evening.",
      "Everything else is quiet by comparison. One stone runs across the whole lower level and up onto the stair landing, so the eye never finds an edge.",
    ],
    coverImage: img("penthouse-interiors", "cover"),
    coverAlt: "Penthouse Interiors, Bengaluru — blackened steel stair with oak treads under a rooflight",
    gallery: [
      { src: img("penthouse-interiors", "01"), alt: "Sculptural stair under the rooflight", span: "full" },
      { src: img("penthouse-interiors", "02"), alt: "Living level with continuous stone floor", span: "half" },
      { src: img("penthouse-interiors", "03"), alt: "Dining and terrace edge", span: "half" },
      { src: img("penthouse-interiors", "04"), alt: "Upper landing", span: "offset" },
      { src: img("penthouse-interiors", "05"), alt: "Principal suite", span: "full" },
    ],
    facts: [
      { label: "Client", value: "Private" },
      { label: "Status", value: "Completed" },
      { label: "Scope", value: "Interior Design, Joinery, Lighting" },
      { label: "Carpet Area", value: "5,300 sq.ft" },
      { label: "Duration", value: "14 months" },
      { label: "Team", value: "JOYFIRST" },
    ],
    featured: false,
    order: 8,
  },
];
