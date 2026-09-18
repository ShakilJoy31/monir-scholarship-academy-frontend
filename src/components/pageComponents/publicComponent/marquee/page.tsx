"use client";
import Marquee from "react-fast-marquee";
import { motion } from "framer-motion";
import { FaBell, FaCalendarAlt, FaArrowRight } from "react-icons/fa";

const AdmissionMarquee = () => {
  // const { data: responseData, isError } = useGetActiveAdmissionPeriodQuery({});

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-r from-[#FFD700] via-[#FFC800] to-[#FFA500] relative overflow-hidden shadow-lg py-1"
      style={{ zIndex: 50 }}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <Marquee
        speed={60}
        gradient={false}
        className="text-[#0A2E4D] font-semibold"
      >
        <div className="flex items-center space-x-12 mx-8">
          <div className="flex items-center space-x-3 bg-white/30 px-4 py-1 rounded-full">
            <FaBell className="text-xl animate-pulse" />
            <span className="text-sm font-bold">
              🎓 আগামী ১৫ মার্চ ২০২৬, আমাদের স্কুলে বার্ষিক ক্রীড়া প্রতিযোগিতা অনুষ্ঠিত হবে। 
সকল শিক্ষার্থীকে উপস্থিত থাকার জন্য অনুরোধ করা যাচ্ছে।
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/20 px-4 py-1 rounded-full">
              <FaCalendarAlt className="text-sm" />
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              <FaArrowRight className="text-xs" />
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          <FaBell className="text-xl animate-pulse" />
        </div>
      </Marquee>
    </motion.div>
  );
};

export default AdmissionMarquee;