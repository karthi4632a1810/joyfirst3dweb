"use client";

import { useEffect } from "react";

import { site } from "@/data/site";

/**
 * Route-level error boundary. Keeps the visitor inside the site and gives them
 * a way to reach the studio directly rather than a dead end.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[JOYFIRST] Route error:", error);
  }, [error]);

  return (
    <section className="container-arch flex min-h-[80svh] flex-col justify-center py-[clamp(8rem,20vh,13rem)]">
      <p className="label-arch mb-8 text-bronze">Something went wrong</p>

      <h1 className="text-headline max-w-[18ch] text-ink">
        We couldn&rsquo;t load this page.
      </h1>

      <p className="mt-8 max-w-[46ch] text-lede text-graphite">
        Try again — and if it keeps happening, call the studio on{" "}
        <a
          href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
          className="text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:text-bronze"
        >
          {site.contact.phone}
        </a>
        .
      </p>

      <div className="mt-12">
        <button
          type="button"
          onClick={reset}
          data-cursor="open"
          className="inline-flex min-h-[44px] touch-manipulation items-center gap-4 border border-ink/25 px-9 py-5 text-[0.8125rem] uppercase tracking-[0.16em] text-ink transition-colors duration-500 hover:border-bronze hover:text-bronze"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
