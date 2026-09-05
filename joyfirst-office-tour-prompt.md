# JOYFIRST — Scroll-Driven Office Interior Tour: Corrective Implementation Spec

**Read this entire document before changing any file.**

The previous implementation produced rooms but failed on three counts: the camera passes
through walls, the render is washed out and flat, and nothing verifies the path. This spec
fixes all three. Sections 1–3 are the highest priority; do them before touching furniture.

**Do not** replace the exterior model, the website UI, the scroll system, or rebuild from
scratch. Everything here is additive to the existing R3F scene.

---

## 0. Diagnosis — what is actually broken

Verified from the current build's screenshots:

| Symptom | Root cause | Fixed in |
|---|---|---|
| Camera crosses partitions between rooms | Floor plan is a 3×3 grid with no corridor; rooms share walls, so any A→B path must cross one | §1 |
| Everything reads as white/grey mush, no depth | No HDRI environment, no ambient occlusion, tone mapping exposure too high, albedo values above 0.85 | §2 |
| Materials look like plastic / flat RGB | Single-colour `MeshStandardMaterial`, no roughness or normal maps, `envMapIntensity` at default | §3 |
| Glass is invisible or milky | `transparent + opacity` instead of transmission; no frames | §3.4 |
| Geometry reads as loose boxes | Zero-thickness walls, no skirting, no ceiling plane, no reveals | §4 |
| Interior looks like exterior daylight | One directional light doing all the work; no fixture-based interior lighting | §6 |
| Nothing "focuses" — the eye has nowhere to land | No depth of field, no contrast hierarchy, no framed compositions | §5, §7 |

**Target look:** the three reference photographs supplied — an open-plan office with a
concrete soffit, black-framed glass partitions, linear pendant lighting and warm oak
joinery; a reception with a planted feature wall, sculptural timber bench and cove-lit
ceiling rafts. Warm, mid-tone, high material contrast. **Not** bright white.

**Honest expectation:** this is real-time WebGL, not an offline path tracer. It will not
match a Corona render pixel for pixel. But ACES tone mapping + an interior HDRI +
roughness/normal maps + screen-space AO + subtle depth of field closes roughly 80% of the
perceived gap. Do those four before adding a single extra prop.

---

## 1. Floor plan — ring corridor around a central atrium

This replaces the 3×3 grid. **The circulation is the fix for camera clipping**: every room
opens onto a continuous 2.2 m corridor, so the camera never needs to cross a partition.
The corridor rings a double-height atrium, which means the finale is glimpsed through
openings during the whole tour and the tour never backtracks — each transition is a corner
reveal into something new.

### 1.1 Grid

- Footprint: **x ∈ [−9.8, +9.8]**, **z ∈ [−5.8, +5.8]** (19.6 m × 11.6 m). Match to the
  existing exterior slab; if it differs, scale these numbers proportionally and keep
  corridor width at 2.2 m minimum.
- Finished floor level y = 0.00. Ceiling soffit y = 3.00 in rooms, y = 2.70 in corridor
  (creates a compression/release rhythm). Atrium void to y = 6.40.
- +z is south (street/entrance side). −z is north. +x is east.

### 1.2 Zones

| # | Space | x range | z range | Notes |
|---|---|---|---|---|
| A | **Atrium core** (finale) | −2.6 … 2.6 | −1.4 … 1.4 | Double height, floating stair on west face, roof light above, 2 × 4 m ficus |
| B | **Ring corridor** | −4.8 … 4.8 | −3.6 … 3.6 | 2.2 m clear on all four legs, wrapping A |
| C | **Entry vestibule + Reception** | −4.8 … 2.0 | 3.6 … 5.8 | Entrance door centred at **x = −1.4, z = 5.8** |
| D | **Open workspace** | 4.8 … 9.6 | −1.0 … 5.6 | East wing |
| E | **Collaboration** | 4.8 … 9.6 | −5.6 … −1.0 | North-east, open to D, timber ceiling raft marks the change |
| F | **Glass meeting room** | 0.4 … 4.8 | −5.6 … −3.6 | Glazed south wall onto corridor |
| G | **Executive office** | −4.4 … 0.4 | −5.6 … −3.6 | Solid walls, single door |
| H | **Design studio** | −9.6 … −4.8 | −5.6 … −1.2 | West-north |
| I | **Pantry / coffee bar** | −9.6 … −4.8 | −1.2 … 1.4 | West-centre, open to corridor |
| J | **Lounge / breakout** | −9.6 … −4.8 | 1.4 … 5.6 | West-south, residential |

### 1.3 Openings — every one must be modelled as a real void in a real wall

| ID | Between | Position | Clear width × height |
|---|---|---|---|
| O1 | Exterior → C | x = −1.4, z = 5.80 | 1.80 × 2.40 (glazed pivot doors, held open) |
| O2 | C → B (south leg) | x = 0.6, z = 3.60 | 2.40 × 2.40 (open portal, no door) |
| O3 | B (east leg) → D | x = 4.80, z = 2.0 | 3.60 × 2.40 (open) |
| O4 | D → E | x = 4.8 … 9.6, z = −1.0 | Fully open; change of ceiling only |
| O5 | E → B (north leg) | x = 4.80, z = −2.6 | 2.40 × 2.40 (open) |
| O6 | B → F | x = 3.60, z = −3.60 | 0.95 × 2.10 (glass door, held open) |
| O7 | F → B (second exit) | x = 1.20, z = −3.60 | 0.95 × 2.10 (glass door, held open) |
| O8 | B → G | x = −1.00, z = −3.60 | 0.95 × 2.10 (walnut door, held open) |
| O9 | G → B (second exit) | x = −3.60, z = −3.60 | 0.95 × 2.10 (held open) |
| O10 | B (west leg) → H | x = −4.80, z = −3.0 | 2.40 × 2.40 (open) |
| O11 | H → I | x = −9.6 … −4.8, z = −1.2 | Fully open; 1.1 m high shelving unit divides |
| O12 | I → J | x = −9.6 … −4.8, z = 1.4 | Fully open |
| O13 | J → B (west leg) | x = −4.80, z = 2.6 | 2.40 × 2.40 (open) |
| O14 | B → A (west face) | x = −2.60, z = 0.0 | 3.20 × 3.00 (open, frameless) |
| O15 | A → C (south face) | x = 0.0, z = 1.40 | 3.20 × 3.00 (open — this is what makes the atrium visible from reception) |

**Rule:** every opening in the table must exist as an actual gap in the wall mesh.
Do not "leave a wall out" — build walls with door voids using a punch-hole helper (§4.2)
so that jambs, reveals and head details are real geometry.

---

## 2. Render pipeline — do this first, before any geometry work

This single section is responsible for most of the visual gap versus the references.

### 2.1 Renderer

```js
<Canvas
  gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
  camera={{ fov: 42, near: 0.05, far: 200 }}
  onCreated={({ gl }) => {
    gl.outputColorSpace     = THREE.SRGBColorSpace
    gl.toneMapping          = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure  = 0.92          // NOT 1.4. Under-expose slightly.
    gl.shadowMap.enabled    = true
    gl.shadowMap.type       = THREE.PCFSoftShadowMap
  }}
>
```

- `antialias: false` because SMAA runs in the post chain (§7).
- FOV **42**, fixed. Never animate it. 42° ≈ a 46 mm lens — what architectural
  photographers actually shoot interiors on. Wider reads as fisheye, narrower feels
  claustrophobic in a 2.2 m corridor.
- `near: 0.05` so the camera can pass a door jamb without the frame vanishing.

### 2.2 Environment — non-negotiable

Every surface in the references gets most of its shading from reflected environment light.
Without this the scene is dead.

```js
<Environment files="/hdr/interior_studio_1k.hdr" background={false} environmentIntensity={0.7} />
```

- Use a **1k** HDRI, warm interior or overcast studio. Not `preset="city"` (too blue),
  not `preset="sunset"` (too orange).
- `background={false}`. The visible sky/backdrop is handled separately by the existing
  exterior scene.
- Blend `environmentIntensity` from **1.0 (exterior)** → **0.55 (interior)** across scroll
  0.24 → 0.32, in the same lerp that handles the daylight transition (§6.5).

### 2.3 Fog — the current haze is wrong

If a white `Fog`/`FogExp2` is currently applied scene-wide, **remove it indoors**. It is
what makes screenshots 2 and 7 look milky. Instead:

```js
// exterior only, fades out on entry
scene.fog = new THREE.Fog('#c9c4bb', 45, 160)
```

Drive `fog.far` from 160 → 400 across scroll 0.24 → 0.30 so it stops affecting interiors,
or set `scene.fog = null` past 0.30. Depth indoors comes from AO and DOF, not fog.

### 2.4 Albedo discipline

Nothing in the scene may have a base colour brighter than **`#E4E0D8`**. Painted white
walls in the references sit around 0.72–0.80 luminance, not 1.0. A pure `#FFFFFF` wall
under ACES clips to a featureless blob — that is exactly what the current build shows.

| Surface | Base colour | Roughness | Metalness |
|---|---|---|---|
| Painted wall (warm white) | `#E4E0D8` | 0.92 | 0 |
| Exposed concrete soffit | `#B8B3AA` | 0.88 | 0 |
| Micro-cement / screed floor | `#B0A79B` | 0.55 | 0 |
| Oak / teak joinery | `#8A5F38` | 0.48 | 0 |
| Dark walnut | `#3E2A1C` | 0.42 | 0 |
| Honed dark stone | `#3A3936` | 0.35 | 0 |
| Charcoal metal frames | `#1E1E1F` | 0.38 | 0.85 |
| Bronze hardware | `#6E5439` | 0.28 | 1.0 |
| Linen upholstery | `#B9AFA0` | 0.95 | 0 |
| Wool rug | `#8E8577` | 1.0 | 0 |
| Foliage | `#3F5B34` | 0.75 | 0 |

Set `envMapIntensity` per material: **1.4** on stone/metal/glass, **0.9** on wood,
**0.5** on paint and fabric. This one property does more for realism than any texture.

---

## 3. Materials — shared library, procedurally textured

Create `src/lib/materials.ts` exporting a **singleton** for each material. Never
instantiate materials inside a render loop or per-mesh — the current build almost
certainly does, which costs both frame time and consistency.

### 3.1 Procedural texture generation

Do **not** ship dozens of image files. Generate 6 tileable 512² canvas textures at boot
and reuse them everywhere:

```ts
function noiseTexture(scale = 4, contrast = 0.35, warp = 0) { /* canvas 2D value noise */ }

const T = {
  concreteRough : noiseTexture(6, 0.30),
  plasterRough  : noiseTexture(9, 0.14),
  woodGrain     : stripeNoise(0.004, 0.22),   // strongly anisotropic along U
  stoneRough    : noiseTexture(3, 0.26),
  fabricRough   : noiseTexture(14, 0.10),
  screedRough   : noiseTexture(5, 0.22),
}
```

Feed each into `roughnessMap` and a normal map derived via a Sobel pass
(`normalScale` 0.12–0.35). Set `repeat` per surface so the grain is ~1 unit = 1 m; a wall
5 m long gets `repeat.set(5, 3)`. **Uniform roughness is the single biggest tell of a
CG render** — breaking it up is what makes the concrete soffit in reference image 3 read
as concrete.

### 3.2 Wood

```ts
export const oak = new THREE.MeshStandardMaterial({
  color: '#8A5F38', roughness: 0.48, metalness: 0,
  roughnessMap: T.woodGrain, normalMap: T.woodGrainN,
  normalScale: new THREE.Vector2(0.22, 0.22), envMapIntensity: 0.9,
})
```

Rotate UVs 90° on vertical slats so grain runs with the member, not across it.

### 3.3 Concrete soffit

The exposed slab in reference image 3 is a major part of its character. Model it as a
flat plane at y = 3.00 with `concreteRough`, plus shallow 40 mm downstand beams on a
3.2 m grid and visible circular formwork tie marks (an instanced disc, 60 mm, slightly
darker). Cheap, and instantly reads as real.

### 3.4 Glass — transmission only where it matters

```ts
export const architecturalGlass = new THREE.MeshPhysicalMaterial({
  color: '#EDF1EF', transmission: 1.0, thickness: 0.012, ior: 1.52,
  roughness: 0.035, metalness: 0, transparent: true,
  clearcoat: 1, clearcoatRoughness: 0.04,
  envMapIntensity: 1.4, side: THREE.DoubleSide,
})
```

`transmission` costs a full extra render pass. Budget it to **the meeting room box and
the entrance doors only**. For all secondary glazing use a cheap stand-in:

```ts
export const glassLite = new THREE.MeshPhysicalMaterial({
  color: '#DCE4E2', transparent: true, opacity: 0.14,
  roughness: 0.05, metalness: 0, envMapIntensity: 1.6,
  clearcoat: 1, depthWrite: false,
})
```

Every glazed panel gets a **frame**: 40 × 60 mm charcoal metal mullions at panel edges,
plus a 25 mm transom at 1.05 m and a bottom rail. Frameless glass reads as a bug.

### 3.5 Foliage

Reference image 2's planted wall carries the whole composition. Use cross-plane billboard
cards with an alpha-tested leaf atlas (`alphaTest: 0.5`, `side: DoubleSide`), instanced,
with 8–12° random rotation per instance. Three plant archetypes only: ficus (2.2 m),
snake plant (0.9 m), monstera (1.4 m). Instanced across all rooms.

---

## 4. Architectural kit of parts

Build `src/lib/arch.ts` with parametric builders. **All rooms are assembled from these** —
that is what makes the whole office read as one project.

### 4.1 Dimensional standards (hard requirements)

| Element | Dimension |
|---|---|
| Partition wall thickness | 0.12 m (internal), 0.30 m (external) |
| Door leaf | 0.95 × 2.10 × 0.045 m |
| Door head to soffit | 0.90 m (soffit 3.00, head 2.10) |
| Skirting | 0.10 m high, 0.012 m proud, **or** a 0.015 m shadow gap (pick one, use everywhere) |
| Ceiling soffit | 3.00 m rooms / 2.70 m corridor / 6.40 m atrium |
| Desk top | 0.74 m |
| Conference table | 3.60 × 1.20 × 0.74 m |
| Reception counter | 1.10 m front, 0.74 m working side |
| Kitchen island | 0.90 m top, 2.20 × 0.90 m |
| Sofa seat height | 0.42 m, back 0.78 m |
| Bar stool | 0.66 m |
| Glass partition head | 3.00 m (floor to soffit) |

### 4.2 `buildWall(a, b, opts)`

Signature: start point, end point, height, thickness, plus an array of openings
`[{ offset, width, height, sillHeight }]`. Must produce:

- Wall mass with **real voids** (use CSG at build time, or compose from 4 boxes per
  opening: below-sill, head, and two jambs — cheaper and sufficient).
- 0.025 m jamb reveal returns on both faces of every opening.
- Skirting or shadow gap along both faces, broken at openings.
- Merge all walls of one room into a single `BufferGeometry` via
  `BufferGeometryUtils.mergeGeometries` before adding to the scene.
- Tag the merged mesh `userData.collider = true` and add to `layers` channel **2**.
  §8 depends on this.

### 4.3 Ceiling systems (one per zone — this is what differentiates rooms)

| Zone | Ceiling |
|---|---|
| Reception | Plasterboard raft, 0.15 m drop, perimeter cove uplight, 0.02 m shadow gap to wall |
| Corridor | Continuous 0.06 m recessed linear slot, 2.70 m soffit |
| Workspace | **Exposed concrete slab** + suspended linear pendants (ref image 3) |
| Collaboration | Suspended oak slat raft, 3.2 × 2.4 m, slats 0.04 × 0.10 @ 0.09 m centres |
| Meeting room | Flush plaster + 4 recessed 90 mm downlights + one linear pendant over table |
| Executive | Plaster with perimeter cove, warmest light in the building |
| Design studio | Exposed slab + surface-mounted track |
| Lounge | Plaster, no downlights — lit entirely by table and floor lamps |
| Pantry | Plaster + 3 pendants over island |
| Atrium | Roof light 4.0 × 2.4 m at y = 6.40, deep 0.6 m reveal |

---

## 5. Camera path — spline, not keyframe lerp

### 5.1 Architecture

Two separate `THREE.CatmullRomCurve3` instances:

```ts
const posCurve    = new THREE.CatmullRomCurve3(POS_WAYPOINTS,    false, 'centripetal', 0.5)
const targetCurve = new THREE.CatmullRomCurve3(TARGET_WAYPOINTS, false, 'centripetal', 0.5)
```

Use `'centripetal'` — `'catmullrom'` overshoots at sharp corners and will push the camera
through the corridor wall. This is likely one of the current bugs.

### 5.2 Per-frame

```ts
const eased = easeInOutCubic(smoothedScroll)          // damped scroll, lambda ≈ 4
const p = posCurve.getPointAt(eased)
const t = targetCurve.getPointAt(eased)

camera.position.lerp(p, 1 - Math.exp(-9 * delta))     // frame-rate independent damping
lookTarget.lerp(t, 1 - Math.exp(-6 * delta))          // target lags position slightly
camera.lookAt(lookTarget)
camera.up.set(0, 1, 0)                                // lock roll every frame
```

The target damping being *slower* than the position damping is what produces natural
head-turn: you arrive, then you look. Do not use `getPoint()` — use `getPointAt()`
(arc-length parameterised) or the camera speeds up and slows down erratically between
unevenly spaced waypoints.

### 5.3 Waypoints

Camera height **1.62 m** everywhere indoors. Targets vary in height — that is what makes
it feel like a person looking around rather than a dolly.

| Scroll | Space | Position (x, y, z) | Look-at (x, y, z) |
|---|---|---|---|
| 0.00 | Exterior wide | 14.0, 7.5, 26.0 | 0.0, 3.2, 0.0 |
| 0.07 | Approach | 6.5, 4.6, 19.0 | −0.8, 3.0, 4.0 |
| 0.13 | Walkway | 0.6, 2.6, 13.5 | −1.4, 2.2, 6.0 |
| 0.19 | Porch | −1.4, 1.75, 8.6 | −1.4, 1.75, 4.5 |
| 0.24 | **Door threshold** | −1.4, 1.62, 5.80 | −1.4, 1.62, 3.0 |
| 0.28 | Vestibule | −1.4, 1.62, 4.60 | −2.6, 1.60, 3.4 |
| 0.31 | Reception, desk left | −1.2, 1.62, 4.10 | −4.2, 1.45, 4.3 |
| 0.34 | Reception, pivot right | −0.5, 1.62, 3.95 | 1.6, 1.90, 2.2 |
| 0.38 | Portal O2 | 0.60, 1.62, 3.60 | 3.4, 1.70, 3.0 |
| 0.41 | Corridor SE | 3.6, 1.62, 3.00 | 5.6, 1.60, 2.4 |
| 0.45 | Portal O3 | 4.80, 1.62, 2.00 | 7.0, 1.55, 1.2 |
| 0.49 | Workspace | 6.4, 1.62, 1.20 | 8.2, 1.40, −0.4 |
| 0.53 | Workspace deep | 7.1, 1.62, −0.60 | 7.4, 1.95, −3.2 |
| 0.57 | Into collaboration | 7.2, 1.62, −2.40 | 6.2, 1.85, −4.6 |
| 0.61 | Collaboration table | 6.6, 1.62, −4.00 | 5.0, 1.30, −5.0 |
| 0.65 | Portal O5 | 4.80, 1.62, −2.60 | 3.4, 1.60, −4.4 |
| 0.68 | Corridor N, glass ahead | 4.0, 1.62, −3.00 | 2.8, 1.55, −4.8 |
| 0.71 | **Door O6** | 3.60, 1.62, −3.60 | 2.4, 1.50, −4.9 |
| 0.74 | Meeting room | 2.6, 1.62, −4.50 | 1.2, 1.30, −4.9 |
| 0.77 | **Door O7** | 1.20, 1.62, −3.60 | −0.6, 1.60, −3.2 |
| 0.79 | Corridor N | 0.0, 1.62, −3.00 | −1.2, 1.60, −4.3 |
| 0.81 | **Door O8** | −1.00, 1.62, −3.60 | −2.4, 1.45, −4.9 |
| 0.83 | Executive desk | −1.9, 1.62, −4.40 | −3.4, 1.35, −5.0 |
| 0.85 | **Door O9** | −3.60, 1.62, −3.60 | −4.6, 1.60, −3.2 |
| 0.87 | Portal O10 | −4.80, 1.62, −3.00 | −6.6, 1.50, −4.2 |
| 0.89 | Design studio | −6.4, 1.62, −3.20 | −8.4, 1.35, −4.4 |
| 0.91 | Studio → pantry | −7.2, 1.62, −1.60 | −8.4, 1.25, 0.2 |
| 0.93 | Pantry island | −7.4, 1.62, 0.20 | −8.6, 1.20, 1.6 |
| 0.95 | Lounge | −7.2, 1.62, 2.20 | −8.4, 1.00, 4.0 |
| 0.96 | Lounge, turn east | −6.4, 1.62, 3.40 | −5.0, 1.70, 2.2 |
| 0.97 | Portal O13 | −4.80, 1.62, 2.60 | −3.2, 2.20, 1.2 |
| 0.98 | **Portal O14 into atrium** | −2.60, 1.62, 0.60 | −0.6, 3.20, −0.2 |
| 1.00 | **Atrium finale** | −0.7, 1.65, 0.90 | 1.9, 3.90, −1.1 |

### 5.4 Threshold rule (this is what stops door clipping)

For every door or portal waypoint marked **bold** above:

1. The waypoint sits **exactly** at the opening's centre plane.
2. The waypoint **immediately before** and **immediately after** must be on the opening's
   normal axis, within ±0.15 m of the same lateral coordinate, and ≥ 0.8 m away.

Example — O6 at (3.60, −3.60), normal along z: previous waypoint (4.0, −3.00) is 0.4 m off
axis. **Insert a correction waypoint at (3.60, 1.62, −2.90)** so the camera squares up
before entering. Do this for every bold row. A camera entering a 0.95 m door at an angle
will clip the jamb — always.

### 5.5 Banned

No FOV animation, no roll (`camera.up` re-locked each frame), no camera shake, no bobbing,
no `lookAt` targets more than 25° above or below horizontal, no position discontinuity
larger than 0.4 m between adjacent 0.001 scroll samples.

---

## 6. Lighting

### 6.1 Budget

Real-time shadow-casting lights are the most expensive thing in the scene. Hard cap:

- **1** `DirectionalLight` (sun) with shadows, 2048² map, tight `shadow.camera` frustum
  retargeted to the camera's current room each frame.
- **3** shadow-casting `SpotLight`s maximum, reassigned by proximity to the active room.
- Unlimited **non-shadow-casting** `PointLight`s with `decay: 2`, `distance: 6`.
- Everything else is **emissive geometry** (`emissive` + `emissiveIntensity` 2–6) plus AO
  and the HDRI. Emissive planes cost nothing and read as fixtures.

### 6.2 Every light needs a visible fixture

An unexplained pool of light on a wall is the second-biggest tell of an amateur render.
Model the fixture, place the light source 20 mm in front of it.

| Fixture | Geometry | Light |
|---|---|---|
| Recessed downlight | 0.09 m disc, emissive `#FFE8CC` @ 4 | PointLight 2700 K, intensity 6, decay 2, dist 5 |
| Linear pendant | 1.8 × 0.05 × 0.06 box, emissive underside @ 3 | 2 PointLights along its length, intensity 4 |
| Cove uplight | 0.03 m emissive strip in ceiling shadow gap | No light source — bounce is faked by a slightly emissive ceiling plane near the cove |
| Table / floor lamp | Shade + 0.12 m emissive sphere @ 6 | PointLight intensity 3, dist 3.5 |
| Roof light (atrium) | Aperture with 0.6 m reveal | The sun DirectionalLight passes through; add one soft SpotLight from above |

### 6.3 Colour temperature

Interior fixtures **3000 K → `#FFD9A8`**. Exterior sun **5600 K → `#FFF4E2`**. Sky ambient
`HemisphereLight('#BFD4E8', '#6B6055', 0.35)`. Never use pure white light indoors.

### 6.4 Per-room mood (target luminance ratios)

| Room | Character | Key:fill ratio |
|---|---|---|
| Reception | Even, calm, cove-dominant | 2:1 |
| Corridor | Darker than the rooms — release on entry | 3:1, overall 40% dimmer |
| Workspace | Bright, neutral, high fill | 1.5:1 |
| Collaboration | Warm pool over the table, dark edges | 4:1 |
| Meeting room | Even, professional, slight pendant key | 2:1 |
| Executive | Warmest, lowest, most contrast | 5:1 |
| Design studio | Cool north daylight + warm task lamps | 2.5:1 |
| Lounge | Lowest overall, lamp-lit, deep shadow | 6:1 |
| Atrium | Daylight-dominant, huge vertical gradient | 3:1 |

**The corridor being dimmer than the rooms is important.** It is what makes each room
entry feel like an arrival.

### 6.5 Outside → inside transition

Across scroll **0.24 → 0.32**, lerp:

- `toneMappingExposure` 1.05 → 0.90
- `environmentIntensity` 1.0 → 0.55
- sun intensity 3.2 → 1.4
- `hemiLight` intensity 0.6 → 0.30
- interior light group master intensity 0 → 1

Never step-change any of these. All lerps share the same eased `t`.

---

## 7. Post-processing (`@react-three/postprocessing`)

Order matters:

```jsx
<EffectComposer multisampling={0} enableNormalPass>
  <N8AO aoRadius={0.9} intensity={2.2} distanceFalloff={0.8} color="#2A2622" halfRes />
  <DepthOfField focusDistance={dofFocus} focalLength={0.045} bokehScale={2.2} height={480} />
  <Bloom luminanceThreshold={0.92} luminanceSmoothing={0.3} intensity={0.16} mipmapBlur />
  <Vignette offset={0.28} darkness={0.42} />
  <SMAA />
</EffectComposer>
```

- **N8AO is the single highest-value effect here.** It is what puts contact shadows under
  every desk leg and in every wall junction. Without it geometry floats.
- `dofFocus` = `camera.position.distanceTo(lookTarget) / camera.far`, damped. This makes
  the tour *focus* on whatever it is looking at — directly addressing the "not clear and
  focused" complaint. Keep `bokehScale` low; heavy bokeh looks like a phone portrait mode.
- Bloom threshold **0.92** and intensity **0.16**. Anything higher recreates the current
  washed-out look.
- Disable DOF and drop N8AO to `halfRes` on `devicePixelRatio > 2` or when
  `navigator.hardwareConcurrency < 8`.

---

## 8. Automated clipping validation — required deliverable

Manual verification does not work. Build `scripts/validate-camera-path.mjs` and wire it
into CI. **The build fails if this fails.**

```js
// Sample the path densely and spherecast against layer 2 (colliders)
const R = 0.35            // camera collision radius, metres
const HEAD = 0.25         // clearance above camera
const FEET = 1.40         // clearance below camera
const DIRS = [ /* 16 horizontal + up + down unit vectors */ ]

const failures = []
for (let i = 0; i <= 4000; i++) {
  const t = i / 4000
  const p = posCurve.getPointAt(t)

  // 1. Proximity — is any wall inside the camera radius?
  for (const d of DIRS) {
    ray.set(p, d); ray.layers.set(2)
    const hit = ray.intersectObjects(colliders, false)[0]
    if (hit && hit.distance < R) failures.push({ t, kind: 'proximity', obj: hit.object.name, dist: hit.distance })
  }

  // 2. Tunnelling — does the segment to the next sample cross a wall?
  const q = posCurve.getPointAt(Math.min(1, t + 1 / 4000))
  const seg = q.clone().sub(p); const len = seg.length()
  if (len > 1e-5) {
    ray.set(p, seg.normalize()); ray.layers.set(2)
    const hit = ray.intersectObjects(colliders, false)[0]
    if (hit && hit.distance < len) failures.push({ t, kind: 'tunnel', obj: hit.object.name })
  }

  // 3. Headroom / floor
  // 4. Sightline — ray from p to targetCurve.getPointAt(t) must not hit an OPAQUE
  //    collider within 90% of the distance. Glass (layer 3) is allowed.
}
```

Output `reports/clipping.json` plus a console table. **Zero `proximity` and zero `tunnel`
failures is the pass condition.** Sightline failures are warnings — fix by nudging the
look-at target, not the position.

Add a second script `scripts/capture-tour.mjs` (Playwright) that screenshots at scroll
0.00, 0.07, 0.13, 0.19, 0.24, 0.28, 0.34, 0.41, 0.49, 0.57, 0.61, 0.68, 0.74, 0.79, 0.83,
0.89, 0.93, 0.95, 0.98, 1.00 at 1920×1080, writes to `reports/tour/`, and fails if any
frame's mean luminance is above 0.82 or below 0.18 (catches blown-out and black frames
automatically).

---

## 9. Room design briefs

Each room must be recognisably part of one project — same skirting detail, same door
family, same floor material family — while having its own identity through **ceiling,
lighting and one signature element**.

**C · Reception — minimal luxury.** Curved 4.2 m monolithic counter, honed dark stone top
returning down one end (waterfall), oak fluted front. Backdrop: full-height oak slat wall
(0.04 × 0.10 @ 0.09 m) with a 1.2 m brushed bronze JOYFIRST logo, indirectly lit from a
recessed strip. Two low lounge chairs, boucle. One 2.2 m ficus. Micro-cement floor with a
2.4 × 1.6 m wool rug. Signature: the slat wall. Reference image 2's planted wall is an
acceptable alternative — if you build it, use instanced billboard foliage (§3.5), not a
green box.

**D · Open workspace — warm productivity.** Three benches of 6 desks (2 × 3 facing), 1.6 m
per position, 1.4 m aisles. **Exposed concrete soffit** with suspended 1.8 m linear
pendants on 2.4 m centres — this is the defining move from reference image 3. Oak-topped
white steel desks. Mesh task chairs, each rotated 5–20° randomly and offset 0.02–0.12 m —
**never place chairs on a perfect grid**, it is the fastest way to look fake. Planted
divider boxes at bench ends (ref image 3). Black-framed glass partition along the corridor
edge. Occupation props: 3 laptops open, 2 closed, 4 mugs, 2 notebook stacks, one jacket on
a chair back.

**E · Collaboration — creative energy.** 3.6 × 1.1 m solid oak communal table, 8 mixed
chairs. Suspended oak slat raft above it. Full-height writable wall on the north face with
6 pinned A1 drawings at slightly varied angles. Low shelf of material samples and books.
Two lounge chairs in the corner. Signature: the slat raft and the drawing wall.

**F · Meeting room — professional elegance.** Floor-to-soffit glazing on the south face,
40 mm charcoal mullions at 1.2 m centres, 25 mm transom at 1.05 m. 3.6 m table, 8 cantilever
chairs. One 3.0 m linear pendant. 75" display on an acoustic felt wall (`#5A5348`, high
roughness). Concealed oak credenza. Signature: the framed glass box read from the corridor.

**G · Executive — sophisticated luxury.** Full-height dark walnut panelling on two walls
with 6 mm shadow-gap joints every 0.6 m. 2.0 × 0.9 m desk, leather chair, two visitor
chairs. Bookshelf with varied-height books (randomise depth 0.01–0.03 m). Framed
architectural photograph. Floor lamp. Perimeter cove only — no downlights. Signature: the
panelling shadow-gap rhythm.

**H · Design studio — material-focused.** Two 2.4 × 1.2 m worktables, stools at 0.66 m.
Full pin-up wall of drawings. **Material sample wall**: 48 instanced 0.2 × 0.2 m tiles in a
6 × 8 grid, cycling through stone/oak/walnut/terracotta/olive/cream/charcoal materials —
cheap, and it communicates "design happens here" better than any prop. Three architectural
massing models under acrylic. Track lighting. Palette adds terracotta `#9C5A3C` and muted
olive `#6B6F4A`. Signature: the sample wall.

**I · Pantry.** 2.2 × 0.9 m island, stone waterfall top, oak base. Three pendants. Two
stools. Espresso machine, integrated tall units, one snake plant. Keep it small.

**J · Lounge — residential warmth.** 2.6 m linen modular sofa, two armchairs, travertine
coffee table, 3.0 × 2.0 m textured wool rug, side table, floor lamp, table lamp, low oak
bookshelf, monstera. **No ceiling downlights** — lamp-lit only. This is the room that has to
sell "architecture that feels like home"; give it the deepest shadows and warmest light in
the building.

**A · Atrium — signature.** 6.4 m volume. Cantilevered oak treads (0.28 × 1.1 × 0.05 m)
projecting from the west wall, 0.18 m rise, 12 treads, 12 mm frameless glass balustrade with
a 50 mm oak handrail. 4.0 × 2.4 m roof light with a 0.6 m reveal casting a moving light
patch on the floor. Two 4 m ficus. Travertine floor. Signature: the stair against the light
patch. **The camera settles here and stops.**

---

## 10. Performance budget

| Metric | Target |
|---|---|
| Draw calls | < 220 |
| Triangles | < 900 k |
| Textures | < 14 (mostly the 6 procedural, §3.1) |
| Shadow-casting lights | ≤ 4 |
| Transmission materials | ≤ 12 panels |
| Desktop frame time | < 12 ms @ 1080p |
| Mobile | Disable DOF + transmission, N8AO half-res, `dpr` capped at 1.5 |

Techniques: merge all static per-room geometry; `InstancedMesh` for chairs, downlights,
slats, sample tiles, books, foliage; frustum culling on per-room groups with
`visible = false` for rooms more than two zones from the camera; single shared material
instances; `KTX2` if you add any image textures.

---

## 11. UI protection

The header, nav, "Architecture that feels like home.", body copy, CTA and scroll indicator
are untouched. To keep them legible over varying interiors, add **one** element: a fixed
`linear-gradient(105deg, rgba(20,18,16,0.34) 0%, rgba(20,18,16,0.10) 42%, transparent 62%)`
scrim behind the text column, `pointer-events: none`, `z-index` between canvas and UI.
Nothing else changes.

Optional editorial labels (`03 / RECEPTION`): 10px, letter-spacing 0.22em, uppercase,
`rgba(255,255,255,0.55)`, bottom-left above the CTA, cross-fading over 0.4 s. If they read
as a game HUD at any point, delete them.

---

## 12. Order of work

Do not proceed to the next step until the current one is visibly correct.

1. **§2 render pipeline + §3 materials on the *existing* geometry.** Stop and screenshot.
   The current rooms should already look dramatically better with zero new geometry. If
   they don't, the problem is in this step — fix it before continuing.
2. **§1 floor plan + §4 kit of parts.** Rebuild walls, openings, ceilings. Grey-box only.
3. **§5 camera path + §8 validator.** Get to zero clipping failures on the grey box.
4. **§6 lighting.**
5. **§7 post-processing.**
6. **§9 furniture and props**, room by room, re-running §8 after each (furniture can
   intrude on the path).
7. **§10 optimisation pass.**
8. Full capture run, review all 20 frames, fix anything reading as placeholder.

## 13. Acceptance criteria

- [ ] `scripts/validate-camera-path.mjs` reports **0** proximity and **0** tunnel failures
- [ ] All 20 capture frames pass the luminance bounds (0.18–0.82 mean)
- [ ] No frame contains a surface with a flat untextured base colour occupying > 25% of the frame
- [ ] Every visible light pool has a visible fixture producing it
- [ ] Every glazed panel has a frame
- [ ] Camera y stays within 1.60–1.66 for all scroll ∈ [0.24, 1.0]
- [ ] Camera roll is exactly 0 at all samples
- [ ] Every one of O1–O15 exists as a real void with real jamb reveals
- [ ] `npm run typecheck` and `npm run lint` clean
- [ ] Desktop frame time < 12 ms at 1080p
- [ ] Header, nav, headline, body copy, CTA, scroll indicator are byte-identical to before
