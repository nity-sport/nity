import AboutSection from '../components/sections/AboutSection';
import ExperiencesSection from '../components/sections/ExperiencesSection/ExperienceSection';
import Hero from '../components/sections/Hero';
import PartnerSection from '../components/sections/Partner';
import Sports from '../components/sections/Sports/SportSection';
import TrainingCentersSection from '../components/sections/TrainingCentersSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="section-spacing">
        <TrainingCentersSection />
      </div>
      <div className="section-spacing">
        <Sports />
      </div>
      <div className="section-spacing">
        <ExperiencesSection />
      </div>
      <div className="section-spacing">
        <AboutSection />
      </div>
      <div className="section-spacing-bottom">
        <PartnerSection />
      </div>
    </>
  );
}
