"use client";

import { useSyncExternalStore } from "react";

export type PerformanceTier = "unknown" | "none" | "low" | "mobile" | "desktop";

/**
 * Cheap WebGL2/WebGL capability probe. The context is discarded immediately so
 * we never hold a second GL context alongside the R3F canvas.
 */
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");

    if (!gl) return false;

    // Release the probe context straight away.
    const lose = (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context");
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function computeTier(): PerformanceTier {
  if (!detectWebGL()) return "none";

  const cores = navigator.hardwareConcurrency ?? 4;
  // `deviceMemory` is Chromium-only; absent elsewhere, which we treat as fine.
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

  if (cores <= 2 || memory <= 2) return "low";

  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 767px)").matches;

  return coarsePointer || narrow ? "mobile" : "desktop";
}

/**
 * The probe creates a GL context, so it runs once per page load and the result
 * is memoised at module scope. useSyncExternalStore requires a stable snapshot
 * anyway — recomputing would loop.
 */
let cached: PerformanceTier | null = null;

function getSnapshot(): PerformanceTier {
  cached ??= computeTier();
  return cached;
}

const noopSubscribe = () => () => {};
const getServerSnapshot = (): PerformanceTier => "unknown";

/**
 * Classifies the device so the 3D scene can scale itself:
 *
 *   desktop — full scene, shadows, high DPR
 *   mobile  — simplified scene, no shadows, capped DPR
 *   low     — very constrained hardware; caller should show the image fallback
 *   none    — no WebGL at all; image fallback is mandatory
 *
 * Returns "unknown" during SSR and hydration so both passes render the same
 * markup, then resolves on the client.
 */
export function usePerformanceTier(): PerformanceTier {
  return useSyncExternalStore(noopSubscribe, getSnapshot, getServerSnapshot);
}

/** Devices that should render the R3F canvas at all. */
export function tierSupports3D(tier: PerformanceTier): boolean {
  return tier === "mobile" || tier === "desktop";
}
