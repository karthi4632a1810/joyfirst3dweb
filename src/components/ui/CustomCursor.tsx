"use client";

import { useEffect, useRef, useState } from "react";

import { gsap } from "@/lib/gsap";
import { useHasFinePointer, useReducedMotion } from "@/lib/hooks";

type CursorState = { scale: number; label: string };

const IDLE: CursorState = { scale: 1, label: "" };

/**
 * Elements opt in by setting `data-cursor`:
 *   data-cursor="hover"            → circle expands
 *   data-cursor="view"             → expands and reads VIEW
 *   data-cursor="open"             → expands and reads OPEN
 *   data-cursor="hidden"           → cursor collapses (over form fields)
 *
 * Anything interactive without an explicit value falls back to "hover".
 */
function stateFor(value: string | null): CursorState {
  switch (value) {
    case "view":
      return { scale: 4.6, label: "View" };
    case "open":
      return { scale: 4.6, label: "Open" };
    case "hidden":
      return { scale: 0, label: "" };
    case "hover":
    default:
      return { scale: 2.6, label: "" };
  }
}

function checkIsDarkSurface(target: Element | null): boolean {
  if (!target) return false;

  // 1. Direct dark containers
  const darkParent = target.closest(
    '[data-surface="dark"], footer, .bg-ink, [data-theme="dark"], section[aria-label="Introduction"], section[aria-labelledby="experience-heading"]'
  );
  if (darkParent) return true;

  // 2. Images, video, canvas, figure, or view cursor targets
  const mediaParent = target.closest(
    'img, picture, canvas, video, figure, [data-cursor="view"], [data-surface="image"]'
  );
  if (mediaParent) return true;

  // 3. Fallback: inspect computed background color
  let el: Element | null = target;
  while (el && el !== document.body && el !== document.documentElement) {
    const style = window.getComputedStyle(el);
    const bg = style.backgroundColor;
    if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
      const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return lum < 0.45;
      }
    }
    el = el.parentElement;
  }

  return false;
}

/**
 * Desktop-only custom cursor.
 *
 * Not rendered at all on coarse pointers or under prefers-reduced-motion, and
 * the native cursor is only hidden (via `data-cursor="custom"` on <html>) once
 * this component is actually mounted — so a visitor never ends up with no
 * cursor because the component bailed out.
 */
export function CustomCursor() {
  const finePointer = useHasFinePointer();
  const reducedMotion = useReducedMotion();
  const active = finePointer && !reducedMotion;

  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (!active) return;

    const root = document.documentElement;
    root.setAttribute("data-cursor", "custom");
    return () => root.removeAttribute("data-cursor");
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const ringEl = ring.current;
    const dotEl = dot.current;
    if (!ringEl || !dotEl) return;

    // Quick-setters avoid re-creating tweens on every mousemove.
    const ringX = gsap.quickTo(ringEl, "x", { duration: 0.55, ease: "power3.out" });
    const ringY = gsap.quickTo(ringEl, "y", { duration: 0.55, ease: "power3.out" });
    const dotX = gsap.quickTo(dotEl, "x", { duration: 0.15, ease: "power3.out" });
    const dotY = gsap.quickTo(dotEl, "y", { duration: 0.15, ease: "power3.out" });

    let visible = false;

    const onMove = (event: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([ringEl, dotEl], { autoAlpha: 1, duration: 0.3 });
      }
      ringX(event.clientX);
      ringY(event.clientY);
      dotX(event.clientX);
      dotY(event.clientY);

      const target = event.target as Element | null;
      const dark = checkIsDarkSurface(target);
      setIsDark(dark);
    };

    const onLeave = () => {
      visible = false;
      gsap.to([ringEl, dotEl], { autoAlpha: 0, duration: 0.25 });
    };

    const onOver = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest?.(
        "[data-cursor], a, button, input, textarea, select",
      );

      const dark = checkIsDarkSurface(event.target as Element | null);
      setIsDark(dark);

      if (!target) {
        gsap.to(ringEl, { scale: IDLE.scale, duration: 0.4, ease: "power3.out" });
        setLabel(IDLE.label);
        return;
      }

      const next = stateFor(target.getAttribute("data-cursor"));
      gsap.to(ringEl, { scale: next.scale, duration: 0.45, ease: "power3.out" });
      setLabel(next.label);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf([ringEl, dotEl]);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999]">
      <div
        ref={ring}
        className={`absolute -left-5 -top-5 flex h-10 w-10 items-center justify-center rounded-full border opacity-0 transition-colors duration-200 ${
          isDark
            ? "border-paper/90 text-paper bg-ink/20 shadow-[0_0_8px_rgba(0,0,0,0.3)]"
            : "border-ink/85 text-ink bg-paper/20 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
        }`}
      >
        <span
          className="text-[0.1875rem] font-medium uppercase tracking-[0.14em]"
          style={{ opacity: label ? 1 : 0 }}
        >
          {label}
        </span>
      </div>
      <div
        ref={dot}
        className={`absolute -left-[2px] -top-[2px] h-1.5 w-1.5 rounded-full opacity-0 transition-colors duration-200 ${
          isDark ? "bg-paper shadow-[0_0_4px_rgba(0,0,0,0.5)]" : "bg-ink shadow-[0_0_4px_rgba(255,255,255,0.6)]"
        }`}
      />
    </div>
  );
}
