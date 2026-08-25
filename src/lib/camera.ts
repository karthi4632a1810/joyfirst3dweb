/**
 * Camera paths for the scroll-driven 3D sections.
 *
 * Deliberately free of any `three` import. The sections that consume these
 * constants (`Hero`, `ProjectExperience`) are eagerly loaded, and importing
 * them from `CameraController.tsx` would drag three.js, R3F and drei into the
 * initial bundle — defeating the `next/dynamic` split that keeps ~860KB off
 * first load.
 */

export interface CameraKeyframe {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov?: number;
}

/** Hero: wide exterior → approach → entrance → threshold → interior. */
export const HERO_KEYFRAMES: CameraKeyframe[] = [
  { position: [16, 9, 34], lookAt: [0, 4.4, 0], fov: 36 },
  { position: [9, 6.4, 22], lookAt: [0, 4, 0], fov: 38 },
  { position: [-1.6, 3.4, 13.5], lookAt: [-2.2, 2.6, 0], fov: 42 },
  { position: [-2.2, 2.4, 7.4], lookAt: [-2.2, 2.2, -2], fov: 48 },
  { position: [-2.2, 2.3, 1.5], lookAt: [1.5, 2.2, -6], fov: 54 },
];

/** "Enter the space": exterior → entrance → living → interior → landscape. */
export const EXPERIENCE_KEYFRAMES: CameraKeyframe[] = [
  { position: [22, 8, 26], lookAt: [0, 4, 0], fov: 36 },
  { position: [-3.5, 3, 15], lookAt: [-2.2, 2.6, 2], fov: 42 },
  { position: [0, 2.6, 5], lookAt: [6, 2.4, -1], fov: 50 },
  { position: [6, 5.8, 2.5], lookAt: [11, 5.6, 2], fov: 46 },
  { position: [4, 6.5, 24], lookAt: [0, 2, 6], fov: 40 },
];
