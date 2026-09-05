# JOYFIRST — Architecture & Interior Design

Production website for [joyfirst.in](https://joyfirst.in) — Joy First Interiors,
Chennai.

Immersive 3D hero, scroll-driven architectural walkthrough, editorial
typography, and a contact pipeline that runs entirely on server actions.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

Production:

```bash
npm run build
npm run start
```

Other scripts:

| Script              | What it does                                              |
| ------------------- | --------------------------------------------------------- |
| `npm run lint`      | ESLint (flat config, `eslint-config-next` 16)              |
| `npm run typecheck` | `tsc --noEmit`                                             |
| `npm run assets`    | Regenerates every placeholder image under `public/images`  |

Node 20.9+ is required.

---

## Stack

| Layer          | Choice                                            |
| -------------- | ------------------------------------------------- |
| Framework      | Next.js 16 (App Router, Turbopack), React 19       |
| Language       | TypeScript, strict                                 |
| Styling        | Tailwind CSS v4 (CSS-first `@theme` config)        |
| 3D             | Three.js, React Three Fiber 9, drei 10             |
| Animation      | GSAP 3 + ScrollTrigger                             |
| Smooth scroll  | Lenis                                              |
| Validation     | Zod 4                                              |
| CMS            | Sanity (schemas ready, not yet connected)          |
| Hosting        | Vercel                                             |

---

## Routes

```
/                       Homepage — 3D hero, work, walkthrough, services, process
/projects               All projects
/projects/[slug]        Project detail (8 static pages)
/architecture           Architecture discipline + filtered work
/interiors              Interiors discipline + filtered work
/services               Services in detail, in-house trades, process
/about                  Studio, philosophy, values
/contact                Enquiry form + direct contact details
/robots.txt  /sitemap.xml
```

All 19 routes prerender as static HTML.

---

## Architecture

### Content

Components never import `src/data/*`. They call `src/lib/content.ts`, which is
the single seam between the site and its data source. Every function there is
`async` specifically so that swapping local data for `sanityClient.fetch()`
touches one file and nothing else.

```
src/types/index.ts      Domain types
src/data/               Local content (projects, services, site settings)
src/lib/content.ts      ← the swap point
sanity/schemas/         Sanity schemas mirroring the same shapes
```

### 3D

Three layers of fallback, so the hero can never render as a broken canvas:

1. **`<ModelFallback />`** — a server-rendered architectural photograph, always
   present as the base layer. It is the LCP element and paints immediately.
2. **`<ArchitectureScene />`** — the R3F canvas, dynamically imported with
   `ssr: false`. It is opaque, so it simply covers the photograph. It renders
   `null` on devices without WebGL or with very constrained hardware, leaving
   the photograph in place.
3. **`<ModelLoader />`** — resolves the subject inside the canvas. A GLB if one
   is supplied and loads; otherwise the procedural villa in
   `ArchitectureModel.tsx`, which is built from primitives and needs no asset
   at all. A failed GLB is caught by an error boundary and falls through to the
   same procedural scene.

Device tiers (`src/lib/device.ts`): `desktop` gets full geometry, shadow maps
and DPR up to 1.75; `mobile` gets reduced geometry, no shadows and DPR capped
at 1.25; `low`/`none` get the photograph.

The environment map is built from drei `<Lightformer>` planes rather than an
HDRI preset — presets fetch from a CDN at runtime, which would add a
third-party request and break the scene offline.

### Scroll

Lenis drives the page, wired to GSAP so ScrollTrigger reads the same position:

- `lenis.on("scroll", ScrollTrigger.update)`
- Lenis is ticked from `gsap.ticker` — one animation frame for the page
- `gsap.ticker.lagSmoothing(0)` so a long task cannot desynchronise the camera

There is deliberately **no `scrollerProxy`**. Lenis moves the real window scroll
position, so ScrollTrigger's default scroller is already correct; adding a proxy
switches pinning from `fixed` to `transform`, which is the usual cause of
"Lenis breaks my pinned section".

Scroll-driven camera sections use a tall parent with a `sticky` child rather
than ScrollTrigger pinning — same effect, far fewer failure modes, and it
degrades correctly without JavaScript.

Under `prefers-reduced-motion` Lenis is never instantiated at all.

### Contact

`src/app/actions/contact.ts` is a server action. It validates with the same Zod
schema the client uses (`src/lib/validation.ts`), applies a small in-process
rate limit, drops honeypot submissions silently, and POSTs the enquiry to
`CONTACT_WEBHOOK_URL`.

With no webhook configured the enquiry is logged server-side and the visitor
still gets a success state — the form is never broken by missing config.

The form is a real `<form>` bound to the action, so it works before hydration
and without JavaScript.

---

## Environment variables

Copy `.env.example` to `.env.local`. **The site runs with none of them set** —
each one enables an optional feature.

| Variable                         | Scope    | Purpose                                        |
| -------------------------------- | -------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | public   | Canonical origin for metadata, OG, sitemap      |
| `CONTACT_WEBHOOK_URL`            | server   | Where validated enquiries are POSTed as JSON    |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`  | public   | Sanity project (once a Studio exists)           |
| `NEXT_PUBLIC_SANITY_DATASET`     | public   | Sanity dataset                                  |
| `SANITY_API_READ_TOKEN`          | server   | Draft/preview reads                             |

`CONTACT_WEBHOOK_URL` and `SANITY_API_READ_TOKEN` must never be prefixed with
`NEXT_PUBLIC_` — that would ship them to the browser.

---

## Accessibility

- Semantic landmarks, one `<h1>` per page, ordered headings
- Skip link, visible bronze focus rings, full keyboard navigation
- Mobile menu: `inert` when closed, focus trap and Escape to dismiss, focus
  returned to the toggle
- Form errors bound with `aria-describedby`; outcome announced via a live region
- Descriptive `alt` on every content image; decorative images have `alt=""`
- Custom cursor and magnetic buttons only mount on fine pointers, never on touch
- `prefers-reduced-motion` disables Lenis, parallax, camera animation, the
  custom cursor and the horizontal process track
- Zoom is not capped (`maximumScale: 5`)
- A `<noscript>` style reveals all scroll-animated content when JS is off

---

## ⚠️ Placeholder content — replace before launch

### Real, verified content (do not change without confirming)

Contact numbers, email addresses, both office addresses, ISO certifications,
regions served, founder name and social links in `src/data/site.ts` were taken
from the existing joyfirst.in site and are accurate.

### Placeholder content (must be replaced)

**All eight projects** in `src/data/projects.ts` are illustrative. Titles,
locations, areas, years, descriptions and client fields are **not real JOYFIRST
commissions**. The file carries a banner comment saying so.

**All 59 images** under `public/images/` are procedurally generated
architectural compositions from `scripts/lib/scene.mjs`, not photographs. They
exist so the layouts can be judged at full fidelity, and they are licence-clean.

To replace them: drop real photography in at the same paths and filenames and
nothing in the code changes. Suggested sizes:

| Path                                     | Size        | Use                 |
| ---------------------------------------- | ----------- | ------------------- |
| `projects/<slug>/cover.jpg`              | 2400 × 1500 | Listing + hero      |
| `projects/<slug>/01.jpg`, `05.jpg`       | 2400 × 1350 | Full-bleed gallery  |
| `projects/<slug>/02.jpg`, `03.jpg`       | 1600 × 2000 | Paired gallery      |
| `projects/<slug>/04.jpg`                 | 2000 × 1500 | Offset gallery      |
| `services/*.jpg`                         | 1600 × 2000 | Service rows        |
| `hero-fallback.jpg`, `experience.jpg`    | 2400 × 1500 | 3D fallback layers  |
| `architecture.jpg`, `interiors.jpg`      | 1600 × 2000 | Split section       |
| `og.jpg`                                 | 1200 × 630  | Open Graph          |

Once real photography is in, delete `scripts/` and the `assets` script.

**Alt text** lives beside each image path in `src/data/projects.ts` and must be
rewritten to describe the real photograph.

**Logo**: `public/brand/jflogo.png` and `favi.png` were taken from the existing
site. The wordmark is currently set in Inter rather than the logo image —
swap `Navbar.tsx` if the studio wants the mark itself.

---

## Remaining production tasks

1. Replace all project content and photography (above).
2. Point `CONTACT_WEBHOOK_URL` at a real destination, and put a proper rate
   limiter (Vercel WAF or Upstash) in front of the action — the in-process one
   resets per instance.
3. Connect Sanity: create the Studio from `sanity/schemas`, then rewrite the
   bodies in `src/lib/content.ts`.
4. Add real GLB models if wanted. Set `model` on a project and drop the file in
   `public/models/`. Draco-compressed models need the decoder in
   `public/draco/` — the loader points there deliberately rather than at the
   gstatic CDN.
5. Verify Lighthouse on a real device; confirm the 3D frame rate on mid-range
   Android.
6. Add analytics if wanted (`NEXT_PUBLIC_GA_ID` is stubbed in `.env.example`).
7. Confirm the placeholder testimonials/clients from the old site (Siemens,
   Ocean Lifespaces, Adithyaram Group) may be named publicly before adding a
   clients section.

---

## Project structure

```
src/
├── app/
│   ├── actions/contact.ts        Server action
│   ├── layout.tsx                Shell, fonts, metadata, JSON-LD
│   ├── page.tsx                  Homepage
│   ├── error.tsx  not-found.tsx
│   ├── robots.ts  sitemap.ts
│   └── <route>/page.tsx
├── components/
│   ├── layout/       Navbar, Footer, PageTransition, PageHeader
│   ├── hero/         Hero, ArchitectureScene, HeroContent
│   ├── three/        ModelLoader, ModelFallback, CameraController,
│   │                 Lighting, ArchitectureModel
│   ├── projects/     ProjectCard, ProjectGrid, ProjectGallery,
│   │                 ProjectExperience
│   ├── sections/     Intro, Featured, DisciplineSplit, Services, Process,
│   │                 About, Cta, ContactForm
│   ├── providers/    SmoothScroll
│   └── ui/           RevealText, MagneticButton, CustomCursor, ImageReveal
├── data/             site.ts, projects.ts, services.ts
├── lib/              content.ts, gsap.ts, hooks.ts, device.ts, seo.tsx,
│                     validation.ts, useScrollProgress.ts
└── types/index.ts

sanity/schemas/       Sanity schema definitions (not yet wired)
scripts/              Placeholder image generator
public/
├── brand/            Logo and favicon from the existing site
├── images/           Generated placeholder photography
└── models/           Drop GLB files here
```
#   j o y f i r s t  
 "# joyfirst3dweb" 
