# JOYFIRST — Addendum A: Real Furniture Assets + Depth of Field Fix

**This supersedes §9 of the main spec.** Section 9 asked for furniture built from box and
cylinder primitives. That was wrong. Primitives are correct for architecture — walls,
soffits, counters, joinery, slat walls, stairs. They are incapable of producing a
believable chair, sofa, task chair, armchair, or plant. Those must be loaded as 3D models.

Apply Fix 1 immediately (5 minutes, large visible improvement). Fix 2 is the real work.

---

## FIX 1 — Depth of field is blurring the subject (do this first)

Current symptom: the entire frame is soft, including the wall the camera is aimed at.
`focusDistance` is in **normalised units of the camera's near→far range**, not metres. The
main spec's formula was divided by `camera.far` but is clearly not being fed a live value.

Replace the DOF block with this, and verify by scrolling — the object at the centre of
frame must be sharp at every scroll position:

```jsx
// in the render loop, NOT in the JSX
const dist = camera.position.distanceTo(lookTarget)          // metres
const normalised = THREE.MathUtils.clamp(dist / camera.far, 0, 1)
dofRef.current.circleOfConfusionMaterial.uniforms.focusDistance.value =
  THREE.MathUtils.damp(current, normalised, 4, delta)
```

```jsx
<DepthOfField
  ref={dofRef}
  focalLength={0.02}      // was 0.045 — halve it
  bokehScale={1.4}        // was 2.2 — reduce
  height={480}
/>
```

**If the focus still misbehaves, delete the DepthOfField effect entirely.** A sharp scene
looks professional. A uniformly blurred scene looks broken. DOF is a refinement, not a
requirement — do not spend more than 30 minutes on it.

While you are in the post chain: confirm **N8AO is actually running**. There is no visible
contact shadow anywhere in the current frame — where the chair legs meet the floor, where
the table meets the wall, in the ceiling junctions. If AO were on, those would be dark.
Everything floating is the AO signature being absent.

---

## FIX 2 — Replace every piece of furniture with a real model

### 2.1 Delete

Remove all code-generated: chairs, task chairs, stools, sofas, armchairs, plants,
monitors, laptops, mugs, books, lamps, espresso machine, planters.

### 2.2 Keep as primitives (these are fine and should not change)

Walls, floors, soffits, ceiling rafts, slat walls, skirting, door leaves and frames,
glazing and mullions, reception counter, kitchen island, worktops, desk tops and legs
(simple rectilinear desks are acceptable as primitives), shelving carcasses, the floating
stair, balustrades, handrails, light fixture housings, pinned drawings, sample tiles.

The split is: **anything with a straight-edged rectilinear form stays in code; anything
with a curve, a taper, an upholstered surface, or organic geometry becomes an asset.**

### 2.3 Asset list — minimum viable

You need **11 models**. Not 60. Reuse aggressively; a real office buys the same chair 18
times.

| # | Model | Used in | Instances |
|---|---|---|---|
| 1 | Mesh task chair | Workspace, studio | 18 |
| 2 | Cantilever / dining chair | Meeting room, collaboration | 14 |
| 3 | Lounge armchair (upholstered) | Reception, lounge, collaboration | 6 |
| 4 | Modular 3-seat sofa | Lounge | 1 |
| 5 | Bar stool | Pantry, studio | 6 |
| 6 | Executive leather chair | Executive office | 1 |
| 7 | Ficus / tall indoor tree | Atrium ×2, reception, lounge | 4 |
| 8 | Snake plant or similar (low) | Pantry, workspace dividers, studio | 8 |
| 9 | Monitor on stand | Workspace, studio | 14 |
| 10 | Laptop (open) | Scattered | 6 |
| 11 | Floor lamp | Lounge, executive | 3 |

Optional if time allows: mug, book stack, coffee machine, framed art, rug (a rug can stay
a textured plane).

### 2.4 Where to get them

Filter every source by **licence** before downloading — you are shipping this on a
commercial client site.

- **Poly Haven** (polyhaven.com/models) — CC0, no attribution, commercial use. Small
  catalogue but excellent quality and already GLTF. Check here first.
- **Sketchfab** — filter Downloadable + licence CC0 or CC-BY. Large furniture selection.
  CC-BY requires an attribution line; put it in your site footer or a `/credits` page.
- **ambientCG** — CC0, textures rather than models, but useful for §3 of the main spec.
- **Manufacturer 3D downloads** — this is the one most people miss and it is the best fit
  for an interiors firm. Herman Miller, Vitra, Hay, Muuto, Knoll and similar publish
  accurate 3D product files for specifiers, and BIMobject aggregates many of them. These
  are the actual chairs an interior designer would specify, so the render becomes a real
  proposal rather than a generic scene. Read each manufacturer's terms — most permit use
  in project visualisation, some restrict redistribution.

Availability and licence terms on all of these change, so verify at download time rather
than trusting this list.

### 2.5 Optimisation pipeline — mandatory

Downloaded models are far too heavy for the web. A single Sketchfab armchair can be
200k triangles with four 4K textures. Run every asset through this before it enters the
project:

```bash
npm i -D @gltf-transform/cli

gltf-transform optimize input.glb output.glb \
  --compress meshopt \
  --texture-compress webp \
  --texture-size 1024 \
  --simplify-error 0.002
```

Then inspect and confirm the budget:

```bash
gltf-transform inspect output.glb
```

Per-asset budget:

| Asset type | Max triangles | Max texture |
|---|---|---|
| Task chair, dining chair, stool | 8 000 | 1024² |
| Armchair, sofa, executive chair | 15 000 | 1024² |
| Plant | 6 000 | 1024² (alpha) |
| Monitor, laptop, lamp, prop | 3 000 | 512² |

Total furniture budget across the whole scene: **under 500k triangles after instancing**.

Note: meshopt compression requires `MeshoptDecoder` to be registered on the loader. In
drei: `useGLTF(url, true)` handles Draco; for meshopt, set it up once via
`GLTFLoader.setMeshoptDecoder(MeshoptDecoder)`. If this causes friction, use
`--compress draco` instead — drei supports it out of the box.

### 2.6 Loading and instancing

Load once, instance many. Do **not** call `useGLTF` per chair.

```jsx
// src/components/three/Furniture.tsx
const { nodes, materials } = useGLTF('/models/task-chair.glb')

<Instances geometry={nodes.Chair.geometry} material={materials.ChairMat} limit={24}>
  {chairPlacements.map((p, i) => (
    <Instance key={i} position={p.pos} rotation={[0, p.rotY, 0]} />
  ))}
</Instances>
```

Preload all 11 at boot with `useGLTF.preload(...)` and gate the hero behind a
`<Suspense>` with the existing loading state so nothing pops in mid-scroll.

### 2.7 Placement rules — this is where "fake" comes from

Even correct models look wrong when placed like a spreadsheet.

- **Never a perfect grid.** Every chair gets `rotY ± 4–22°` random and `position ± 0.03–0.14 m`
  random. Seed the randomness so it is stable across reloads.
- **Pull chairs out from desks** by 0.15–0.35 m, varied. A chair tucked perfectly under
  every desk reads as unoccupied CG.
- **Two or three chairs turned sideways**, as if someone stood up mid-conversation.
- **Sit everything on the floor.** Check each model's origin — many are authored with the
  origin at the geometry centre, not the base. A chair floating 4 mm above the floor kills
  the AO contact shadow and the whole shot with it.
- **Scale check.** Import each asset and measure it against a 1.7 m reference box before
  placing. Sketchfab models arrive in centimetres, inches and arbitrary units routinely.
  Your seat heights must land at 0.42–0.46 m, task chair seats 0.44–0.52 m, table tops
  0.74 m.

### 2.8 Colour

Assets arrive with their own materials, which will fight your palette. After loading,
override base colours to the §3.4 table in the main spec — task chairs `#1E1E1F`,
upholstery `#B9AFA0`, wood `#8A5F38`. Keep the asset's normal and roughness maps; replace
only `color`. That is what makes bought furniture look like it belongs to one project.

---

## FIX 3 — Composition

The current frame is a 0.6 m close-up of a table edge with a wall filling two thirds of
the image. Even with perfect assets that is not a photograph anyone would publish.

Interior photography rule: stand in a corner, shoot the long diagonal, keep the camera
1.5–1.8 m off the ground, and get **three depth layers** in frame — something near (a chair
back, a plant), something mid (the table, the desks), something far (a window, a doorway
through to the next room).

Check every waypoint in §5.3 of the main spec against this. Any waypoint where the nearest
surface is under 1.2 m away and there is no visible opening or window in frame should be
pulled back and re-aimed. The meeting room shot in particular should be taken from the
corner near the door, looking diagonally across the table toward the glazed wall — not
from beside the table looking at a blank partition.

---

## Sequencing

1. Fix 1 (DOF + confirm AO). ~30 minutes. Screenshot.
2. Source and optimise the 11 assets. This is the bulk of the time — budget half a day and
   do not rush the licence check.
3. Replace furniture room by room, starting with **reception, meeting room and lounge** —
   those three carry the client presentation. Workspace next. Studio and pantry last.
4. Re-run the clipping validator (`scripts/validate-camera-path.mjs`). Real furniture has
   different bounds than boxes and will intrude on the camera path in places where boxes
   did not.
5. Fix 3, then recapture all 20 frames.

## What to tell the client if they see it before step 3

Show them the architecture, not the furniture: the exterior approach, the entrance, the
atrium and stair, the corridor and the glazed meeting room box from outside. Those are
built from primitives and are legitimately finished. Skip the interior close-ups until the
assets are in.
