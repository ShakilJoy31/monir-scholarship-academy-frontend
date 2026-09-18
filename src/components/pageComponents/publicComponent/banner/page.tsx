"use client"

import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Key, useRef, } from "react";
import Image from "next/image";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { CircularProgress } from "@mui/material";
import { useGetAllBannersQuery } from "@/app/store/api/classes/bannerApi";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";

const Banner = () => {
  const userInfo = getUserInfoFromToken();

  const { data: bannersData, isLoading, isError } = useGetAllBannersQuery({branchId: userInfo?.branchId,});
  const banners = bannersData?.data || [];

 

  // Create refs for the next and previous buttons
  const prevRefBanner = useRef(null);
  const nextRefBanner = useRef(null);

  return (
    <div className="group col-span-3">
      <Swiper
        autoplay={{
          delay: 3000,
          disableOnInteraction: true,
        }}
        navigation={{
          prevEl: prevRefBanner.current,
          nextEl: nextRefBanner.current,
        }}
        loop={true}
        modules={[Navigation, Autoplay]}
        className="mx-auto w-[100%] swiper-scale-effect"
        speed={1000}
        effect="fade"
        fadeEffect={{
          crossFade: true,
        }}
      >
        {isLoading ? (
          // Loading skeleton
          <SwiperSlide className="bg-gray-200 flex items-center justify-center h-[450px]">
            <p className="flex justify-center"><CircularProgress /></p>
          </SwiperSlide>
        ) : isError ? (
          // Error state
          <SwiperSlide className="bg-gray-200 flex items-center justify-center h-[450px]">
            <p className="text-gray-500">Failed to load banners</p>
          </SwiperSlide>
        ) : banners.length > 0 ? (
          // Display banners if available
          banners.map((banner: { _id: Key | null | undefined; image: string | StaticImport; title: string; }) => (
            <SwiperSlide className="bg-[#EEEEEE] swiper-slide" key={banner._id}>
              <div className="relative text-white swiper-slide-cover h-auto">
                <Image
                  src={banner.image}
                  alt={banner.title || "Banner image"}
                  width={1200}
                  height={400}
                  className="w-full object-contain lg:h-[450px] lg:object-cover"
                />
              </div>
            </SwiperSlide>
          ))
        ) : (
          // No banners available
          <SwiperSlide className="bg-gray-200 flex items-center justify-center h-[450px]">
            <p className="text-gray-500">No banners available</p>
          </SwiperSlide>
        )}

        {/* Slider Navigation Buttons */}
        <button
          ref={prevRefBanner}
          className="prev-button absolute -translate-x-full group-hover:translate-x-1 -left-10 group-hover:left-0 md:group-hover:left-2 top-[40%] md:top-[45%]  z-50 mx-2 rounded-full bg-[#ffffff27] p-2 text-white duration-500 group-hover:bg-[#ffffffcb] group-hover:text-black"
          aria-label="Previous Slide"
        >
          <IoIosArrowBack className="text-xl md:text-2xl font-bold" />
        </button>
        <button
          ref={nextRefBanner}
          className="next-button absolute translate-x-full group-hover:-translate-x-1 -right-10 group-hover:right-0 md:group-hover:right-2 top-[40%] md:top-[45%]  z-50 mx-2 rounded-full bg-[#ffffff27] p-2 text-white duration-500 group-hover:bg-[#ffffffcb] group-hover:text-black"
          aria-label="Next Slide"
        >
          <IoIosArrowForward className="text-xl md:text-2xl font-bold" />
        </button>
      </Swiper>
    </div>
  );
};

export default Banner;