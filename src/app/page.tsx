import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Templates from "@/components/landing/Templates";
import HowItWorks from "@/components/landing/HowItWorks";
import CTABanner from "@/components/landing/CTABanner";
import ScrollProgress from "@/components/landing/ScrollProgress";
import GradientDivider from "@/components/landing/GradientDivider";
import Footer from "@/components/shared/Footer";
import AmbientBackground from "@/components/landing/AmbientBackground";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] relative overflow-hidden">
      <AmbientBackground />
      <div className="relative z-10 antialiased text-gray-900">
        <ScrollProgress />
        <Navbar />
        <Hero />
        <GradientDivider from="#2D6A4F" to="#52B788" />
        <Features />
        <GradientDivider from="#52B788" to="#D4A373" flip />
        <Templates />
        <GradientDivider from="#D4A373" to="#2D6A4F" />
        <HowItWorks />
        <CTABanner />
        <Footer />
      </div>
    </main>
  );
}
