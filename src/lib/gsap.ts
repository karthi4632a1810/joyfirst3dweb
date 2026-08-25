import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Single GSAP entry point.
 *
 * Every module imports `gsap` and `ScrollTrigger` from here so the plugin is
 * registered exactly once, and never during SSR (ScrollTrigger touches
 * `document` at registration time).
 */
let registered = false;

if (typeof window !== "undefined" && !registered) {
  registered = true;
  gsap.registerPlugin(ScrollTrigger);

  gsap.defaults({ ease: "power3.out", duration: 1 });

  // Lenis drives the scroll position, so ScrollTrigger must not also try to
  // normalise touch scrolling — that fights Lenis and breaks momentum on iOS.
  ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
  });
}

export { gsap, ScrollTrigger };

/** Standard easing curve used across the site, matching --ease-arch in CSS. */
export const EASE = "power3.out";

/** Slower, symmetric curve for camera and section transitions. */
export const EASE_INOUT = "power2.inOut";
