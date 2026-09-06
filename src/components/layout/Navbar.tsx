"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { navigation, site } from "@/data/site";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";

/**
 * Minimal floating navigation.
 *
 * Transparent over the hero, then a blurred, bordered bar once the page has
 * moved. On small screens the links move into a full-screen panel that animates
 * open and closed and traps focus while it is showing.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { stop, start } = useSmoothScroll();
  const reducedMotion = useReducedMotion();

  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  // Lenis scrolls the window, so a plain scroll listener works whether smooth
  // scrolling is active or not.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        frame = 0;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // Any navigation closes the panel. Adjusting state during render — rather
  // than in an effect — avoids a frame where the new route is showing behind an
  // open menu.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // Scroll lock, Escape to dismiss, and focus returned to the toggle.
  useEffect(() => {
    if (!open) {
      start();
      return;
    }

    stop();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const focusables = panel.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, start, stop]);

  // Panel choreography: background wipes down, then the links stagger in.
  useEffect(() => {
    const element = panel.current;
    if (!element) return;

    const items = element.querySelectorAll<HTMLElement>("[data-menu-item] > span");
    const meta = element.querySelectorAll<HTMLElement>("[data-menu-meta]");

    if (reducedMotion) {
      gsap.set(element, { clipPath: "inset(0% 0 0% 0)", autoAlpha: open ? 1 : 0 });
      gsap.set([...items, ...meta], { yPercent: 0, opacity: 1 });
      return;
    }

    const context = gsap.context(() => {
      if (open) {
        gsap.set(element, { autoAlpha: 1 });
        gsap
          .timeline()
          .fromTo(
            element,
            { clipPath: "inset(0 0 100% 0)" },
            { clipPath: "inset(0 0 0% 0)", duration: 0.75, ease: "power4.inOut" },
          )
          .fromTo(
            items,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.85, ease: "power3.out", stagger: 0.07 },
            "-=0.35",
          )
          .fromTo(
            meta,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.06 },
            "-=0.5",
          );
      } else {
        gsap.to(element, {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.55,
          ease: "power4.inOut",
          onComplete: () => gsap.set(element, { autoAlpha: 0 }),
        });
      }
    }, element);

    return () => context.revert();
  }, [open, reducedMotion]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-[background-color,backdrop-filter,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled && !open
            ? "border-b border-line bg-paper/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className="container-arch flex items-center justify-between py-5 md:py-6"
        >
          <Link
            href="/"
            data-cursor="hover"
            className="relative z-10 inline-flex min-h-[44px] touch-manipulation items-center text-[0.9375rem] font-medium uppercase tracking-[0.34em] text-ink transition-colors duration-500 hover:text-bronze"
          >
            {site.name}
          </Link>

          <ul className="hidden items-center gap-10 md:flex lg:gap-14">
            {navigation.map((item) => {
              const active = pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    data-cursor="hover"
                    aria-current={active ? "page" : undefined}
                    className={`group relative block py-1 text-[0.8125rem] uppercase tracking-[0.16em] transition-colors duration-500 ${
                      active ? "text-ink" : "text-graphite hover:text-ink"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-bronze transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            ref={toggle}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            data-cursor="hover"
            className="relative z-10 -mr-2 flex h-11 w-11 touch-manipulation items-center justify-center md:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden="true" className="relative block h-3 w-6">
              <span
                className={`absolute left-0 block h-px w-full bg-ink transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  open ? "top-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-full bg-ink transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  open ? "top-1/2 -rotate-45" : "top-full"
                }`}
              />
            </span>
          </button>
        </nav>
      </header>

      {/* Full-screen mobile panel */}
      <div
        id="mobile-menu"
        ref={panel}
        aria-hidden={!open}
        // React 19 passes `inert` through natively; it keeps the hidden panel
        // out of the tab order without a manual focus-trap fallback.
        inert={!open}
        className="fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto overscroll-contain bg-paper px-[var(--spacing-gutter)] pb-[max(3rem,env(safe-area-inset-bottom))] pt-28 opacity-0 md:hidden"
        style={{ visibility: "hidden" }}
      >
        <ul className="flex flex-col gap-2">
          {navigation.map((item) => (
            <li key={item.href} className="overflow-hidden">
              <Link
                href={item.href}
                data-menu-item
                onClick={close}
                className="block py-2 text-[clamp(2.25rem,10vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-ink"
              >
                <span className="block">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-6">
          <div data-menu-meta className="opacity-0">
            <p className="label-arch mb-3 text-stone">Studio</p>
            <address className="not-italic text-[0.9375rem] leading-relaxed text-graphite">
              {site.addresses.registered.lines.join(", ")}
            </address>
          </div>
          <div data-menu-meta className="flex flex-wrap gap-x-6 gap-y-2 opacity-0">
            <a
              href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
              className="text-[0.9375rem] text-graphite transition-colors hover:text-bronze"
            >
              {site.contact.phone}
            </a>
            <a
              href={`mailto:${site.contact.email}`}
              className="text-[0.9375rem] text-graphite transition-colors hover:text-bronze"
            >
              {site.contact.email}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
