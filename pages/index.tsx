import AboutSection from "../components/sections/AboutSection";
import ExperiencesSection from "../components/sections/ExperiencesSection/ExperienceSection";
import Hero from "../components/sections/Hero";
import PartnerSection from "../components/sections/Partner";
import Sports from "../components/sections/Sports/SportSection";
import TrainingCentersSection from "../components/sections/TrainingCentersSection";


export default function HomePage() {
  return (
    <>
      <Hero />
      <TrainingCentersSection />
      <Sports />
      <ExperiencesSection />
      <AboutSection />
      <PartnerSection />

    </>
  );
}
