import {
  HeroSection,
  DemoSection,
  HowItWorksSection,
  CTASection,
  Footer,
} from './components/home';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <HeroSection />
      <DemoSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}
