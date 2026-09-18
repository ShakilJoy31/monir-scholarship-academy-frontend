import Footer from "@/components/pageComponents/publicComponent/footer/page";
import HeroCarousel from "@/components/pageComponents/publicComponent/heroSection/page";
import Map from "@/components/pageComponents/publicComponent/map/page";
import Marquee from "@/components/pageComponents/publicComponent/marquee/page";
import PrincipalMessage from "@/components/pageComponents/publicComponent/principalMassage/page";
import PublicNavigation from "@/components/pageComponents/publicComponent/publicNavigation/page";
import StudentCard from "@/components/pageComponents/publicComponent/studentCard/page";
import TeachersCard from "@/components/pageComponents/publicComponent/teachersCard/page";

const HomePage = () => {
  return (
    <div className="overflow-x-hidden">
      {/* Marquee at the very top */}
      <div className="relative z-50">
        <Marquee />
      </div>
      
      {/* Navigation below marquee */}
      <div className="relative z-40">
        <PublicNavigation />
      </div>
      
      {/* Rest of the content */}
      <HeroCarousel />
      <PrincipalMessage />
      <TeachersCard />
      <StudentCard />
      <Map />
      <Footer />
    </div>
  );
};

export default HomePage;