import {
  HeroSection,
  HowItWorksSection,
  CTASection,
  Footer,
} from './components/home';

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#09090b] text-zinc-50">
      <HeroSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}
