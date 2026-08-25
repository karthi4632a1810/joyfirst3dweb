"use client";

import { useCallback, useEffect, useLayoutEffect, useSyncExternalStore } from "react";

/**
 * useLayoutEffect that degrades to useEffect on the server, so GSAP setup can
 * run before paint in the browser without emitting an SSR warning.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Subscribing to nothing — for snapshots that never change after mount. */
const noopSubscribe = () => () => {};

/**
 * Subscribes to a media query.
 *
 * Built on useSyncExternalStore rather than useEffect + setState: the match is
 * external browser state, and this is the API designed for reading it without
 * a cascading render on mount. The server snapshot is `false`, so SSR output
 * and the hydration pass agree.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** True when the visitor has asked the OS to reduce motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * True on pointer-precise devices — the gate for the custom cursor, magnetic
 * buttons and hover-only interactions.
 */
export function useHasFinePointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

/** True once the component has mounted in the browser. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
