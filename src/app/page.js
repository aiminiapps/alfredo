import AboutSection from "@/components/AboutSection";
import CommunitySection from "@/components/CommunitySection";
import DashboardShowcase from "@/components/DashboardShowcase";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import RoadmapSection from "@/components/RoadmapSection";
import TaskCenterSection from "@/components/TaskCenterSection";
import TokenomicsSection from "@/components/TokenomicsSection";

export default function Home() {
  return (
    <div className="w-full h-screen">
      <Navbar/>
      <Hero/>
      <AboutSection/>
      <DashboardShowcase/>
      <FeaturesSection/>
      <TaskCenterSection/>
      <TokenomicsSection/>
      <RoadmapSection/>
      <CommunitySection/>
      <Footer/>
    </div>
  );
}
