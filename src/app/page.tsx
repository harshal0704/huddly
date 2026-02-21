import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Templates from "@/components/landing/Templates";
import HowItWorks from "@/components/landing/HowItWorks";
import Footer from "@/components/shared/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#030014]">
      <Navbar />
      <Hero />
      <Features />
      <Templates />
      <HowItWorks />
      <Footer />
    </main>
  );
}
