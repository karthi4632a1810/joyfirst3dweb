# JOYFIRST — Mobile Responsive Phase Flow (Section by Section)

> Scope: How every section behaves on mobile (320px -> 768px), in scroll order.
> Stack: Next.js 16 App Router + Tailwind v4 + GSAP ScrollTrigger + Lenis + R3F.
> Order source: `src/app/page.tsx`. Tokens: `src/app/globals.css`.
> Verified: 2026-09-06 against `src/` tree.

## 0. How to read this doc

- Phase = one scroll beat in mobile flow order (Phase 0 = shell, Phase 1 = Hero...).
- Each phase: Desktop baseline -> Mobile adaptation -> Code pointer -> QA check.
- Breakpoints in code:

| Token / query | Value | Where |
|---|---|---|
| `--breakpoint-xs` | 22.5rem (360px) | `globals.css` @theme |
| `(max-width: 30rem)` | 480px, tightens display scale | `globals.css` |
| `(max-width: 48rem)` | 768px, iOS input fix + grid clamp | `globals.css` |
| `md:` | 768px | Tailwind |
| `sm:` | 640px | Tailwind |
| `lg:` | 1024px | Tailwind, Process pin gate |
| `min-[26.25rem]` | 420px, About pillars 1->2 col | `AboutSection.tsx` |
| `(pointer: coarse)` / `(max-width: 767px)` | mobile tier gate | `lib/device.ts` |
| `(hover:hover) and (pointer:fine)` | hover-only gate | `lib/hooks.ts` |
| `(min-width:1024px) and (prefers-reduced-motion:no-preference)` | horizontal Process gate | `ProcessSection.tsx` |

- Global hardening (`src/app/globals.css` bottom): `html,body{overflow-x:clip}`,
  `scroll-padding-top:5.5rem`, `img/video/iframe{max-width:100%}`,
  headings+`p,li,dd{overflow-wrap:break-word}`, tel/mail `anywhere`,
  `p{text-wrap:pretty}`, tel/mail rows `padding-block:0.375rem`.
- At <=480px display tokens tighten (`--text-display` 11vw etc). At <=768px
  inputs forced `1rem` (no iOS zoom jump) and `[class*="grid"]>*{min-width:0}`.
- Every tap target keeps `min-h-[44px] touch-manipulation`.
- Motion off-ramps: `useReducedMotion()` + `useHasFinePointer()` disable
  cursor, magnetic, hover previews, pin, parallax on touch / reduced-motion.

## Phase 0 — Shell: layout + SmoothScroll + Navbar + Footer

### 0A. Viewport / shell — `src/app/layout.tsx`

- `viewport: { width: device-width, initialScale: 1, maximumScale: 5,
  viewportFit: cover }` — zoom left enabled (WCAG 1.4.4).
- `lang="en-IN"`, Inter 400/500/600 only, `bg-paper antialiased`.
- Skip link `Skip to content -> #main` (safe-area aware). `noscript` restores
  `[data-reveal],[data-hero-meta],[data-page-transition],.reveal-line>span` so page never blank w/o JS.
- QA: JS off -> all headlines visible; 200% zoom -> no horizontal scroll.

### 0B. Smooth scroll — `src/components/providers/SmoothScroll.tsx`

- Lenis `duration:1.1, smoothWheel:true, touchMultiplier:1.6`,
  `syncTouch:false` — native scroll on touch (code comment: Lenis touch
  smoothing "fights iOS momentum" and causes "stuck" reports).
- Driven from `gsap.ticker`, `lagSmoothing(0)`,
  `lenis.on("scroll", ScrollTrigger.update)`. No scrollerProxy (keeps sticky).
- Reduced-motion -> Lenis never created. Route change -> scrollTo(0) + double
  rAF `ScrollTrigger.refresh()`.
- QA: iOS momentum feels native; Hero sticky 100svh never janks.

### 0C. Navbar — `src/components/layout/Navbar.tsx`

- Desktop: transparent over hero -> blurred bordered bar after scrollY>24
  (rAF-throttled). Inline links `hidden md:flex` with bronze underline.
- Mobile: hamburger `h-11 w-11 -mr-2`. Full-screen panel
  `fixed inset-0 z-40 bg-paper px-gutter pt-28 pb-safe overflow-y-auto
  overscroll-contain`. Links `clamp(2.25rem,10vw,3.25rem)` with wipe + rise.
  `inert={!open}`, focus trap + Escape + focus return. Address + tel/mail bottom.
- QA: 320px toggle 44px; open -> scroll locked via `stop()`; Tab stays inside;
  route change auto-closes; anchors clear navbar via scroll-padding.

### 0D. Footer — `src/components/layout/Footer.tsx`

- `data-surface="dark" bg-ink pb-safe` — only dark block ("floor to land on").
- Grid `md:grid-cols-12`: Identity 5, Work/Studio nav, Contact, Reach
  (`md:col-span-12 lg:col-span-3`). Mobile: single stacked column.
- `break-words` on mail/phone; socials `min-h-[44px]`; bottom bar
  `flex-col sm:flex-row`.
- QA: long email wraps anywhere; no white gap below (safe-area).

## Phase 1 — Hero (sticky 3D entry)

Files: `hero/Hero.tsx`, `hero/HeroContent.tsx`, `hero/ArchitectureScene.tsx`,
`three/CameraController.tsx`, `three/ModelFallback.tsx`, `lib/camera.ts`,
`lib/useScrollProgress.ts`, `lib/device.ts`.

- Desktop: `section h-[380svh] md:h-[680svh]` with `sticky top-0 h-[100svh]`
  frame. Camera flies TOUR_WAYPOINTS (Exterior Wide -> Atrium Finale) via
  Catmull-Rom + damped lerp, FOV locked 42, roll locked. Copy bottom-left:
  eyebrow, `Architecture / that feels like home.` (`text-display`), lede +
  `Explore Projects` row (`sm:flex-row`). Scroll cue `hidden md:flex`.
- Mobile: shorter scroll `h-[380svh]` (same story, ~44% scroll). Same sticky
  `100svh` (svh avoids iOS chrome jump). Copy `flex-col gap-8` stacked,
  `pb-[max(clamp(3rem,10vh,7rem),safe)]`. Headline `break-words`, display
  token tightened at <=480px (11vw). No scroll cue. Pointer parallax off.
- 3D tiers (`device.ts`): `none/low` -> no canvas, photo stays. `mobile`
  (coarse pointer or <=767px) -> canvas, `dpr [1,1.25]`, `shadows:false`,
  `quality:low`. `desktop` -> `dpr [1,1.75]`, soft shadows, high.
  `frameloop:demand` under reduced-motion.
- Fallback: `ModelFallback` photo always SSR'd (LCP); opaque canvas covers it
  when ready. Gradient `from-paper via-transparent to-paper/70` keeps text
  legible both ways.
- Fade: `HeroContent` opacity->0, y:-60 over `top top -> 18% top` scrub.
- QA (320/375/430): headline never clips mask; CTA >=44px; svh no jump on
  URL-bar collapse; low-end Android -> photo only; reduced-motion -> static.

## Phase 2 — Intro statement (`sections/IntroSection.tsx`, 01 Approach)

- `py-[clamp(6rem,18vh,12rem)]`, `text-display max-w-[26ch] break-words` headline
  ("We don't just design buildings..."), then `grid md:grid-cols-12` copy
  `md:col-span-5 md:col-start-7`.
- Mobile: single column; lede `text-lede` + 15px body; gaps `gap-10`.
- QA: `leading-[1.06]` + `break-words` -> no overflow at 320px; reveals fire
  at `top 88% once`.

## Phase 3 — Selected work (`FeaturedProjects.tsx` + `ProjectCard.tsx`)

- Desktop: header `flex-wrap justify-between` (02 Selected work + headline +
  All Projects, `break-words max-w-[14ch]`). List `gap-[clamp(4rem,12vw,10rem)]`; alternating
  `md:col-span-8` landscape / `md:col-span-6 col-start-7` portrait; summary in
  empty half (`self-end`, `min-w-0 break-words`).
- Mobile: `flex-col`; every card `100vw`
  (`sizes="(max-width:768px) 100vw"`); summary `mt-8` below image; area
  `0.75rem uppercase break-words`.
- `ProjectCard`: frame `16/10 landscape, 3/4 portrait`, `bg-bone`; caption
  below image (never overlay); bronze rule draws on hover (fine-pointer
  only); meta `index / category - year` (`flex-wrap min-w-0 break-words` so long
  categories wrap at 320px); title `text-title break-words` + location
  `break-words` in `min-w-0` column; arrow `shrink-0`;
  whole card one Link (one tab stop).
- QA: portrait never traps viewport; `priority` only first card.

## Phase 4 — Walkthrough (`ProjectExperience.tsx`, 03 Walkthrough)

- Desktop: `h-[500svh]` sticky `100svh`; 5 stages (Exterior/Entrance/Living/
  Interior/Landscape); left `ol hidden md:block col-span-5` with progress
  rule; right body `col-span-5 col-start-8`.
- Mobile: `h-[300svh]`; list hidden; `label-arch md:hidden` marker
  (01 — Exterior) + body `max-w-[40ch] text-lede break-words` with `stageIn` animation.
  Header `py-[clamp(5rem,12vh,8rem)] pb-safe` stacked.
- Stage index `floor(progress*5)` clamped, setStage only on change (no 60fps
  re-render). Fallback photo when no WebGL. Walkthrough heading
  `max-w-[12ch] break-words`; svh track keeps iOS URL-bar collapse stable.
- QA: 300svh complete not endless; text top/bottom never covers focus center.

## Phase 5 — Discipline split (`DisciplineSplit.tsx`)

- Desktop: `grid md:h-[86vh] md:grid-cols-[1fr_1fr]`; hover -> `1.18fr/0.82fr`
  (900ms arch ease); image scale 1.08 + caption rise; veil 45% -> 25%/70%.
- Mobile: stacked, each Link `min-h-[60svh]` full-width (`min-w-0` panel so long
  titles can't push width); `animate=false` so
  caption always visible; veil fixed 45%; title `text-display break-words`
  centred; caption `max-w-[34ch] break-words`; `View work ->` always shown.
- Images `sizes="(max-width:768px) 100vw, 50vw"`, object-cover.
- QA: each panel >=60svh thumb-reachable; no hover-only content.

## Phase 6 — Services rows (`ServicesSection.tsx`, 04 Capability)

- BG `bg-bone`. Rows `grid-cols-[auto_minmax(0,1fr)_auto] min-h-[44px]
  py-[clamp(1.75rem,4vw,2.75rem)] border-t`: index / title+capabilities /
  arrow. Title `clamp(1.375rem,6vw,2.75rem)` — 6vw drives mobile size.
- Mobile: same 3-col row (`minmax(0,1fr)` center + `min-w-0` title wrapper so long
  titles wrap, arrow `shrink-0`); capabilities `0.875rem break-words`; hover inert.
  Cursor preview (`fixed hidden md:block`) never rendered on touch
  (`showPreview = finePointer && !reducedMotion`) — list complete alone.
- QA: 320px title ~19px fits; row >=44px; link `/services#slug` + scroll-mt.

## Phase 7 — Process (`ProcessSection.tsx`, 05 Process)

- Desktop (>=1024px + motion OK): pinned horizontal — `lg:h-[100svh]
  flex-col justify-center`, track `lg:w-max lg:flex-row` x:-(scrollWidth-vw),
  `scrub:0.8 pin:true anticipatePin:1`. Cards `lg:w-[clamp(22rem,34vw,32rem)]
  lg:border-l`.
- Mobile (<1024px or reduced-motion): vertical list `flex-col gap-px`, each
  `article border-t py-[clamp(2rem,5vw,3rem)]`: bronze index,
  `clamp(1.75rem,4vw,2.75rem)` title (`break-words`), `0.9375rem` body
  (`max-w-[42ch] break-words`). Heading `max-w-[18ch] break-words`. Section
  `overflow-hidden` stops sideways scroll.
- `gsap.matchMedia` auto-reverts pin when query stops matching.
- QA: no pin on phone (avoids "page won't scroll"); rotate recalculates.

## Phase 8 — Studio (`AboutSection.tsx`, 06 Studio)

- Grid `md:grid-cols-12`: text `md:col-span-5`, media+pillars
  `md:col-span-6 col-start-7`.
- Mobile stacked: eyebrow -> `Designed with purpose. / Built for life.`
  (`max-w-[14ch] break-words`) -> lede (`max-w-[46ch] break-words`, `min-w-0`
  Reveal) -> body (`max-w-[52ch] break-words`) -> cert chips `flex-wrap` -> About link -> `ImageReveal 4/3
  100vw` -> pillars `grid-cols-1 -> min-[26.25rem]:grid-cols-2 (420px) ->
  sm:grid-cols-3`.
- QA: 360-420px 1-col (no squeeze); 420px+ 2-col; chips wrap w/o blowout.

## Phase 9 — CTA + close (`CtaSection.tsx`, 07 Next)

- `bg-bone border-t py-[clamp(6rem,18vh,12rem)]`; headline `Let's create /
  something beautiful.` (`text-display break-words max-w-[14ch]`).
- Row `flex-col gap-10 md:flex-row justify-between items-end`: solid
  `Start your project` + phone/email `clamp(1.125rem,2vw,1.5rem)` stacked
  (`md:items-end`), each `min-h-[44px] break-words`. Then dark Footer.
- QA: long email never overflows (`break-words min-w-0`); tap-to-call works.

## Phase 10 — Interior pages (shared `PageHeader.tsx`)

- `PageHeader`: `pt-[clamp(8rem,20vh,13rem)]` clears fixed nav + eyebrow +
  `text-display max-w-[16ch] break-words` h1 + lede `max-w-[52ch]` + optional
  meta `grid sm:2 lg:4` (`min-w-0 break-words`).
- `/projects`: header + 4-meta (stacked -> sm:2) -> `ProjectGrid staggered`
  -> single col mobile (offsets `md:mt-[clamp(3rem,10vw,9rem)]` only >=768px).
- `/projects/[slug]`: hero `h-[78svh] min-h-[30rem] 100vw` + gradient + title
  -> info -> story stacked -> `ProjectGallery`: full `16/9` alone,
  half+half stacked mobile (`4/5`), offset full-width mobile -> Experience
  `Walk the plan.` (300vh) -> facts `sm:2 lg:3` -> related `sm:2 lg:3`
  (1-col phone) -> CTA.
- `/architecture` + `/interiors`: header -> `ImageReveal 21/9 100vw priority`
  -> principles `md:3` stacked (`gap-y-12 border-t pt-12`) -> filtered grid.
- `/services`: header+meta -> articles `grid md:12` stacked (index ->
  title+lede+caps -> `ImageReveal 4/5 100vw`, `scroll-mt-28`) -> trades
  `sm:2 lg:3` -> Process vertical -> CTA.
- `/about`: header+meta -> `21/9` image -> statement stacked -> values `md:2`
  list -> CTA.
- `/contact`: header -> `grid md:12` stacked (form `md:col-7` first, aside
  `md:col-4 start-9`). Form `grid sm:2` -> 1-col phone; inputs `1rem
  min-h-[44px] border-b` (no iOS zoom); select `appearance-none` + chevron;
  honeypot hidden; error `role=status aria-live` + focus to outcome. Aside
  blocks each `border-t pt-8`, links `min-h-[44px] break-words`.

## Phase 11 — Touch micro-interactions (off vs stays)

- `CustomCursor`: desktop dot+ring w/ VIEW/OPEN; mobile NOT rendered
  (gate `finePointer && !reducedMotion`, `data-cursor` never set).
- `Magnetic/ArrowLink`: drift 0.28 desktop; mobile inert wrapper, 44px kept.
- `RevealText/Reveal`: mask rise + block rise at `top 88% once`; reduced ->
  instant `opacity:1 y:0`. Starts `opacity:0`, noscript restores.
- `ImageReveal`: wipe + parallax `scale-[1.12]` scrub; skipped if reduced.
- `ProjectCard/DisciplineSplit` hover: scale + rule draw desktop; mobile
  static image + visible caption.
- Lenis smooth wheel desktop; native touch mobile (`syncTouch:false`).
- 3D full desktop; capped or photo mobile (Phase 1).

## Appendix A — QA matrix (test in scroll order)

| # | Viewport | Assert |
|---|---|---|
| 1 | 320x568 SE1 | No overflow-x; toggle 44px; hero fits mask; pillars 1-col |
| 2 | 375x667 iPhone 8 | Hero 380vh right; walkthrough marker; split 60svh; form 1-col 16px |
| 3 | 390x844 iPhone 14 | svh no URL-bar jump; safe-area visible; CTA tappable |
| 4 | 430x932 Pro Max | Pillars 2-col at 420px; gallery still stacked <768px |
| 5 | 768x1024 iPad | md: asymmetry, side list, 12-col footer, 2-col grid |
| 6 | 360x740 low Android | Photo fallback legible; no WebGL crash |
| 7 | Reduced-motion | No pin/Lenis/cursor; reveals instant; 3D demand |
| 8 | JS off | Copy visible; form posts; photos present |
| 9 | Landscape 667x375 | svh sections don't trap; menu scrolls |
| 10 | 200% zoom | break-words + min-w-0 + pretty wrap hold |

```bash
npm run dev        # device toolbar 320->768
npm run lint       # eslint-config-next 16
npm run typecheck  # tsc --noEmit
npm run build && npm run start  # 19 static routes
```

## Appendix B — File map

```
src/app/page.tsx                  Homepage order
src/app/layout.tsx + globals.css  Viewport, tokens, hardening
src/components/layout/Navbar.tsx  Bar + mobile panel
src/components/layout/Footer.tsx  Dark floor
src/components/layout/PageHeader.tsx  Masthead
src/components/hero/Hero.tsx      380svh mobile / 680svh desktop sticky
src/components/hero/HeroContent.tsx   Copy + fade
src/components/hero/ArchitectureScene.tsx  Canvas tiers
src/components/three/CameraController.tsx  Spline FOV 42
src/components/three/ModelFallback.tsx     Photo base
src/components/sections/IntroSection.tsx
src/components/sections/FeaturedProjects.tsx
src/components/projects/ProjectExperience.tsx  300svh / 500svh
src/components/sections/DisciplineSplit.tsx    Stack vs 86vh
src/components/sections/ServicesSection.tsx    Rows, preview desktop-only
src/components/sections/ProcessSection.tsx     Pin >=1024 else vertical
src/components/sections/AboutSection.tsx       Pillars 1->2->3
src/components/sections/CtaSection.tsx
src/components/sections/ContactForm.tsx        1-col mobile
src/components/projects/ProjectCard/Grid/Gallery.tsx
src/components/providers/SmoothScroll.tsx      Lenis syncTouch:false
src/components/ui/RevealText/ImageReveal/MagneticButton/CustomCursor.tsx
src/lib/device.ts + hooks.ts + camera.ts + useScrollProgress.ts
```

*Edit this doc when you change a breakpoint, an h-[*vh] height, or any
md:/lg: gate — the table in section 0 is the contract.*








