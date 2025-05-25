import AboutSection from "../components/sections/AboutSection";
import Hero from "../components/sections/Hero";
import PartnerSection from "../components/sections/Partner";
import Sports from "../components/sections/Sports/SportSection";


export default function HomePage() {
  return (
    <>
      <Hero />
      <Sports />
      <AboutSection />
      <PartnerSection />

    </>
  );
}
