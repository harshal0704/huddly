import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Templates from "@/components/landing/Templates";
import HowItWorks from "@/components/landing/HowItWorks";
import CTABanner from "@/components/landing/CTABanner";
import ScrollProgress from "@/components/landing/ScrollProgress";
import GradientDivider from "@/components/landing/GradientDivider";
import Footer from "@/components/shared/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050208] relative">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <GradientDivider from="#7c3aed" to="#06b6d4" />
      <Features />
      <GradientDivider from="#06b6d4" to="#7c3aed" flip />
      <Templates />
      <GradientDivider from="#7c3aed" to="#3b82f6" />
      <HowItWorks />
      <CTABanner />
      <Footer />
    </main>
  );
}
