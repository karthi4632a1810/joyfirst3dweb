import { Hero } from "@/components/hero/Hero";
import { ProjectExperience } from "@/components/projects/ProjectExperience";
import { AboutSection } from "@/components/sections/AboutSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { DisciplineSplit } from "@/components/sections/DisciplineSplit";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { IntroSection } from "@/components/sections/IntroSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { getFeaturedProjects, getProcessSteps, getServices } from "@/lib/content";

export default async function HomePage() {
  const [featured, services, processSteps] = await Promise.all([
    getFeaturedProjects(4),
    getServices(),
    getProcessSteps(),
  ]);

  return (
    <>
      <Hero />
      <IntroSection />
      <FeaturedProjects projects={featured} />
      <ProjectExperience />
      <DisciplineSplit />
      <ServicesSection services={services} />
      <ProcessSection steps={processSteps} />
      <AboutSection />
      <CtaSection />
    </>
  );
}
