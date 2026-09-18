"use client";
import Footer from "@/components/pageComponents/publicComponent/footer/page";
import PublicNavigation from "@/components/pageComponents/publicComponent/publicNavigation/page";

const PublicAboutUs = () => {
  return (
    <>
      <div className="bg-[#035140]">
        <PublicNavigation />
      </div>
      <div className="w-full mx-auto p-6 bg-white shadow-lg rounded-md px-8 lg:px-24 min-h-screen">
        <h1>this is a public about us</h1>
      </div>
      <Footer />
    </>
  );
};

export default PublicAboutUs;
