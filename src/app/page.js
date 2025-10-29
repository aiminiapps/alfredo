import Hero from "@/components/Hero";
import LaserFlow from "@/components/ui/LaserFlow";
import Image from "next/image";


export default function Home() {
  return (
    <div className="w-full h-screen">
      {/* <div className="reative w-full h-screen overflow-hidden">
  <LaserFlow />
</div> */}
<Hero/>
    </div>
  );
}
