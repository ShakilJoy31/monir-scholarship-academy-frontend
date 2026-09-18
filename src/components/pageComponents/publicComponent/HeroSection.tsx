"use client";
import { useGetAllNoticesQuery } from "@/app/store/api/classes/noticeApi";
import { useGetAllEventsQuery } from "@/app/store/api/event/eventApis";
import { useGetHomePageStaticsQuery } from "@/app/store/api/student/studentApi";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FaDownload, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers, FaChalkboardTeacher, FaUserTie } from "react-icons/fa";
import CountUp from "react-countup";
import Link from "next/link";

interface Events {
  startDate: string;
  endDate: string;
  id: number;
  image: string;
  title: string;
  description: string;
  location: string;
}

interface Notice {
  id: number;
  createdAt: string;
  pdfLink: string;
  titleBangla: string;
  titleEnglish: string;
}

const HeroSection = () => {
  const { data: noticeData } = useGetAllNoticesQuery({});
  const { data: events } = useGetAllEventsQuery({});
  const { data: allData } = useGetHomePageStaticsQuery({});
  // const { data: responseData } = useGetActiveAdmissionPeriodQuery({});
  const statsRef = useRef(null);
  const isInView = useInView(statsRef, { once: true });

  const handleDownload = (pdfLink: string) => {
    const link = document.createElement("a");
    link.href = pdfLink;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = [
    { 
      label: "Total Students", 
      value: allData?.data?.studentCount || 0, 
      icon: FaUsers,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50"
    },
    { 
      label: "Faculty Members", 
      value: allData?.data?.teacherCount || 0, 
      icon: FaChalkboardTeacher,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50"
    },
    { 
      label: "Staff Members", 
      value: allData?.data?.staffCount || 0, 
      icon: FaUserTie,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50"
    },
  ];

  return (
    <div className="bg-gray-50">
      {/* Statistics Section */}
      <div ref={statsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className={`${stat.bgColor} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg`}>
                    <Icon size={32} />
                  </div>
                  <span className="text-4xl font-bold text-gray-800">
                    {isInView && <CountUp end={stat.value} duration={2.5} />}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-700">{stat.label}</h3>
                <div className="w-12 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full mt-2"></div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Events and Notices Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Events Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#0A2E4D] to-[#1B4A6B] p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  Upcoming Events
                </h3>
                <Link href="/events" className="text-[#FFD700] hover:text-white text-sm font-semibold transition-colors">
                  View All →
                </Link>
              </div>
            </div>
            
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {events?.data?.length > 0 ? (
                events.data.slice(0, 5).map((event: Events, index: number) => {
                  const startDate = new Date(event.startDate);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ backgroundColor: "#f9fafb" }}
                      className="p-6 cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-b from-[#0A2E4D] to-[#1B4A6B] text-white rounded-xl p-4 text-center min-w-[80px] group-hover:scale-105 transition-transform">
                          <div className="text-2xl font-bold">{startDate.getDate()}</div>
                          <div className="text-xs uppercase tracking-wider">
                            {startDate.toLocaleString("default", { month: "short" })}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-2 group-hover:text-[#0A2E4D] transition-colors">
                            {event.title}
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            {event.location && (
                              <div className="flex items-center">
                                <FaMapMarkerAlt className="mr-2 text-[#FFD700]" size={12} />
                                {event.location}
                              </div>
                            )}
                            <div className="flex items-center">
                              <FaClock className="mr-2 text-[#FFD700]" size={12} />
                              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No upcoming events
                </div>
              )}
            </div>
          </motion.div>

          {/* Notice Board */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notice Board
                </h3>
                <Link href="/notices" className="text-[#FFD700] hover:text-white text-sm font-semibold transition-colors">
                  View All →
                </Link>
              </div>
            </div>
            
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {noticeData?.data?.length > 0 ? (
                noticeData.data.slice(0, 5).map((notice: Notice, index: number) => {
                  const date = new Date(notice.createdAt);
                  return (
                    <motion.div
                      key={notice.id}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 rounded-xl p-3 text-center min-w-[70px] group-hover:bg-gradient-to-b group-hover:from-[#8B4513] group-hover:to-[#A0522D] group-hover:text-white transition-all">
                          <div className="text-lg font-bold">{date.getDate()}</div>
                          <div className="text-xs uppercase">
                            {date.toLocaleString("default", { month: "short" })}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <a
                            href={notice.pdfLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-[#8B4513] font-medium line-clamp-2 transition-colors"
                          >
                            {notice.titleBangla || notice.titleEnglish}
                          </a>
                          <p className="text-xs text-gray-400 mt-1">
                            {date.toLocaleDateString()}
                          </p>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDownload(notice.pdfLink)}
                          className="text-[#8B4513] hover:text-[#A0522D] p-2 rounded-full hover:bg-gray-100"
                        >
                          <FaDownload />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No notices available
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;