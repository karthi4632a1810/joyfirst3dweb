import type { Metadata } from "next";

import { ArrowLink } from "@/components/ui/MagneticButton";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="container-arch flex min-h-[80svh] flex-col justify-center py-[clamp(8rem,20vh,13rem)]">
      <p className="label-arch mb-8 text-bronze">404</p>

      <h1 className="text-display max-w-[16ch] text-ink">
        This page isn&rsquo;t here.
      </h1>

      <p className="mt-8 max-w-[46ch] text-lede text-graphite">
        The address may have changed, or the project may have moved. The work is
        all still there.
      </p>

      <div className="mt-12 flex flex-wrap gap-x-12 gap-y-6">
        <ArrowLink href="/">Back to home</ArrowLink>
        <ArrowLink href="/projects">View projects</ArrowLink>
      </div>
    </section>
  );
}
