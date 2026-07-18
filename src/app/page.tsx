import {
  HeroSection,
  HowItWorksSection,
  CTASection,
  Footer,
} from './components/home';

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-zinc-50 text-zinc-950 dark:bg-[#09090b] dark:text-zinc-50">
      <HeroSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}
