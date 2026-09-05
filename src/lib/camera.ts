import * as THREE from "three";

export interface CameraKeyframe {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov?: number;
}

export const HERO_KEYFRAMES: CameraKeyframe[] = [
  { position: [14, 7.5, 26], lookAt: [0, 3.2, 0], fov: 42 },
  { position: [6.5, 4.6, 19], lookAt: [-0.8, 3.0, 4.0], fov: 42 },
  { position: [-1.4, 1.75, 8.6], lookAt: [-1.4, 1.75, 4.5], fov: 42 },
  { position: [-1.4, 1.62, 5.8], lookAt: [-1.4, 1.62, 3.0], fov: 42 },
  { position: [-0.7, 1.65, 0.9], lookAt: [1.9, 3.90, -1.1], fov: 42 },
];

export const EXPERIENCE_KEYFRAMES: CameraKeyframe[] = [
  { position: [22, 8, 26], lookAt: [0, 4, 0], fov: 36 },
  { position: [-3.5, 3, 15], lookAt: [-2.2, 2.6, 2], fov: 42 },
  { position: [0, 2.6, 5], lookAt: [6, 2.4, -1], fov: 50 },
  { position: [6, 5.8, 2.5], lookAt: [11, 5.6, 2], fov: 46 },
  { position: [4, 6.5, 24], lookAt: [0, 2, 6], fov: 40 },
];

export interface CameraWaypoint {
  s: number;
  p: [number, number, number];
  t: [number, number, number];
  name?: string;
}

export const TOUR_WAYPOINTS: CameraWaypoint[] = [
  { s: 0.00, p: [14.0, 7.5, 26.0], t: [0.0, 3.2, 0.0], name: "Exterior Wide" },
  { s: 0.07, p: [6.5, 4.6, 19.0], t: [-0.8, 3.0, 4.0], name: "Approach" },
  { s: 0.13, p: [0.6, 2.6, 13.5], t: [-1.4, 2.2, 6.0], name: "Walkway" },
  { s: 0.19, p: [-1.4, 1.75, 8.6], t: [-1.4, 1.75, 4.5], name: "Porch" },
  { s: 0.215, p: [-1.4, 1.65, 6.70], t: [-1.4, 1.62, 3.2], name: "O1 Align" },
  { s: 0.24, p: [-1.4, 1.62, 5.80], t: [-1.4, 1.62, 3.0], name: "Door O1" }, // Door O1 threshold
  { s: 0.28, p: [-1.4, 1.62, 4.60], t: [-2.6, 1.60, 3.4], name: "Vestibule" },
  { s: 0.31, p: [-1.2, 1.62, 4.18], t: [-4.2, 1.45, 4.3], name: "Reception Desk" },
  { s: 0.34, p: [-0.5, 1.62, 4.15], t: [1.6, 1.90, 2.2], name: "Reception Pivot" },
  { s: 0.36, p: [0.2, 1.62, 4.10], t: [2.5, 1.75, 2.8], name: "O2 Approach" },
  { s: 0.37, p: [0.60, 1.62, 4.40], t: [3.4, 1.70, 3.0], name: "O2 Pre-threshold" },
  { s: 0.38, p: [0.60, 1.62, 3.60], t: [3.4, 1.70, 3.0], name: "Portal O2" }, // Portal O2
  { s: 0.395, p: [0.60, 1.62, 2.70], t: [3.4, 1.70, 2.7], name: "O2 Square-off" },
  { s: 0.41, p: [3.6, 1.62, 2.70], t: [5.6, 1.60, 2.4], name: "Corridor SE" },
  { s: 0.43, p: [4.1, 1.62, 2.00], t: [6.4, 1.58, 1.6], name: "O3 Align" },
  { s: 0.45, p: [4.80, 1.62, 2.00], t: [7.0, 1.55, 1.2], name: "Portal O3" }, // Portal O3
  { s: 0.49, p: [6.4, 1.62, 1.20], t: [8.2, 1.40, -0.4], name: "Workspace" },
  { s: 0.53, p: [7.1, 1.62, -0.60], t: [7.4, 1.95, -3.2], name: "Workspace Deep" },
  { s: 0.57, p: [7.2, 1.62, -2.40], t: [6.2, 1.85, -4.6], name: "Into Collab" },
  { s: 0.61, p: [6.6, 1.62, -4.00], t: [5.0, 1.30, -5.0], name: "Collab Table" },
  { s: 0.63, p: [5.6, 1.62, -2.60], t: [4.2, 1.58, -3.4], name: "O5 Align" },
  { s: 0.65, p: [4.80, 1.62, -2.60], t: [3.4, 1.60, -4.4], name: "Portal O5" }, // Portal O5
  { s: 0.68, p: [4.0, 1.62, -3.00], t: [2.8, 1.55, -4.8], name: "Corridor N Glass" },
  { s: 0.695, p: [3.60, 1.62, -2.85], t: [3.0, 1.52, -4.8], name: "O6 Align" },
  { s: 0.71, p: [3.60, 1.62, -3.60], t: [2.4, 1.50, -4.9], name: "Door O6" }, // Door O6
  { s: 0.725, p: [3.45, 1.62, -3.95], t: [1.8, 1.35, -4.9], name: "Meeting Entry" },
  { s: 0.74, p: [3.15, 1.62, -4.15], t: [1.2, 1.30, -5.15], name: "Meeting Table" },
  { s: 0.755, p: [1.85, 1.62, -4.15], t: [0.6, 1.45, -3.8], name: "O7 Align" },
  { s: 0.77, p: [1.20, 1.62, -3.60], t: [-0.6, 1.60, -3.2], name: "Door O7" }, // Door O7
  { s: 0.78, p: [0.6, 1.62, -3.00], t: [-1.0, 1.60, -3.8], name: "Corridor N Mid" },
  { s: 0.79, p: [0.0, 1.62, -3.00], t: [-1.2, 1.60, -4.3], name: "Corridor N" },
  { s: 0.80, p: [-1.00, 1.62, -2.85], t: [-1.8, 1.50, -4.6], name: "O8 Align" },
  { s: 0.81, p: [-1.00, 1.62, -3.60], t: [-2.4, 1.45, -4.9], name: "Door O8" }, // Door O8
  { s: 0.83, p: [-1.6, 1.62, -4.20], t: [-3.4, 1.35, -5.0], name: "Executive Desk" },
  { s: 0.84, p: [-3.60, 1.62, -4.35], t: [-4.2, 1.50, -3.6], name: "O9 Align" },
  { s: 0.85, p: [-3.60, 1.62, -3.60], t: [-4.6, 1.60, -3.2], name: "Door O9" }, // Door O9
  { s: 0.86, p: [-4.2, 1.62, -3.00], t: [-5.6, 1.55, -3.4], name: "Corridor NW Corner" },
  { s: 0.87, p: [-4.80, 1.62, -3.00], t: [-6.6, 1.50, -4.2], name: "Portal O10" }, // Portal O10
  { s: 0.89, p: [-6.4, 1.62, -3.20], t: [-8.4, 1.35, -4.4], name: "Design Studio" },
  { s: 0.91, p: [-7.2, 1.62, -1.60], t: [-8.4, 1.25, 0.2], name: "Studio Pantry" },
  { s: 0.93, p: [-7.4, 1.62, 0.20], t: [-8.6, 1.20, 1.6], name: "Pantry Island" },
  { s: 0.95, p: [-7.2, 1.62, 2.20], t: [-8.4, 1.00, 4.0], name: "Lounge" },
  { s: 0.96, p: [-6.4, 1.62, 3.40], t: [-5.0, 1.70, 2.2], name: "Lounge Turn" },
  { s: 0.965, p: [-5.4, 1.62, 2.60], t: [-4.2, 1.75, 2.2], name: "O13 Align" },
  { s: 0.97, p: [-4.80, 1.62, 2.60], t: [-3.2, 2.20, 1.2], name: "Portal O13" }, // Portal O13
  { s: 0.975, p: [-3.40, 1.62, 0.60], t: [-1.4, 2.60, 0.0], name: "O14 Align" },
  { s: 0.98, p: [-2.60, 1.62, 0.60], t: [-0.6, 3.20, -0.2], name: "Portal O14" }, // Portal O14
  { s: 1.00, p: [-0.7, 1.65, 0.90], t: [1.9, 3.90, -1.1], name: "Atrium Finale" }, // Atrium Finale
];



export function sampleTourPosition(scroll: number): THREE.Vector3 {
  const s = Math.max(0, Math.min(1, scroll));
  let idx = 0;
  while (idx < TOUR_WAYPOINTS.length - 2 && TOUR_WAYPOINTS[idx + 1].s <= s) {
    idx++;
  }
  const w0 = TOUR_WAYPOINTS[Math.max(0, idx - 1)];
  const w1 = TOUR_WAYPOINTS[idx];
  const w2 = TOUR_WAYPOINTS[Math.min(TOUR_WAYPOINTS.length - 1, idx + 1)];
  const w3 = TOUR_WAYPOINTS[Math.min(TOUR_WAYPOINTS.length - 1, idx + 2)];

  const span = w2.s - w1.s || 1e-5;
  const localT = Math.max(0, Math.min(1, (s - w1.s) / span));

  function catmullRom1D(p0: number, p1: number, p2: number, p3: number, t: number) {
    const v0 = (p2 - p0) * 0.5;
    const v1 = (p3 - p1) * 0.5;
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
  }

  return new THREE.Vector3(
    catmullRom1D(w0.p[0], w1.p[0], w2.p[0], w3.p[0], localT),
    catmullRom1D(w0.p[1], w1.p[1], w2.p[1], w3.p[1], localT),
    catmullRom1D(w0.p[2], w1.p[2], w2.p[2], w3.p[2], localT)
  );
}

export function sampleTourTarget(scroll: number): THREE.Vector3 {
  const s = Math.max(0, Math.min(1, scroll));
  let idx = 0;
  while (idx < TOUR_WAYPOINTS.length - 2 && TOUR_WAYPOINTS[idx + 1].s <= s) {
    idx++;
  }
  const w0 = TOUR_WAYPOINTS[Math.max(0, idx - 1)];
  const w1 = TOUR_WAYPOINTS[idx];
  const w2 = TOUR_WAYPOINTS[Math.min(TOUR_WAYPOINTS.length - 1, idx + 1)];
  const w3 = TOUR_WAYPOINTS[Math.min(TOUR_WAYPOINTS.length - 1, idx + 2)];

  const span = w2.s - w1.s || 1e-5;
  const localT = Math.max(0, Math.min(1, (s - w1.s) / span));

  function catmullRom1D(p0: number, p1: number, p2: number, p3: number, t: number) {
    const v0 = (p2 - p0) * 0.5;
    const v1 = (p3 - p1) * 0.5;
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
  }

  return new THREE.Vector3(
    catmullRom1D(w0.t[0], w1.t[0], w2.t[0], w3.t[0], localT),
    catmullRom1D(w0.t[1], w1.t[1], w2.t[1], w3.t[1], localT),
    catmullRom1D(w0.t[2], w1.t[2], w2.t[2], w3.t[2], localT)
  );
}
