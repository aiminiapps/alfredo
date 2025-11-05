import AboutSection from "@/components/AboutSection";
import DashboardShowcase from "@/components/DashboardShowcase";
import FeaturesSection from "@/components/FeaturesSection";
import Hero from "@/components/Hero";
import TaskCenterSection from "@/components/TaskCenterSection";
import TokenomicsSection from "@/components/TokenomicsSection";

export default function Home() {
  return (
    <div className="w-full h-screen">
      <Hero/>
      <AboutSection/>
      <DashboardShowcase/>
      <FeaturesSection/>
      <TaskCenterSection/>
      <TokenomicsSection/>
    </div>
  );
}
