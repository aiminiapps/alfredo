import AboutSection from "@/components/AboutSection";
import DashboardShowcase from "@/components/DashboardShowcase";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="w-full h-screen">
      <Hero/>
      <AboutSection/>
      <DashboardShowcase/>
    </div>
  );
}
