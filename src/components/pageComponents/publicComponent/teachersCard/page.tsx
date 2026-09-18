"use client"
import { useGetAllTeachersQuery } from "@/app/store/api/teacher/teacherApi";
import { motion, Variants } from "framer-motion";
import { CircularProgress } from "@mui/material";
import Image from "next/image";
import { FaGraduationCap, FaEnvelope, FaPhone, FaUserTie } from "react-icons/fa";
import Link from "next/link";

interface Teacher {
  id: number;
  branchId: number;
  name: string;
  teacherUniqueId: string;
  phone: string;
  email: string;
  password: string;
  designation: string;
  nid: string;
  gender: string;
  religion: string;
  dob: string;
  bloodGroup: string;
  address: string;
  universityName: string;
  qualification: string;
  specialistSubject: string;
  universityStartDate: string;
  universityEndDate: string;
  count: number;
  blockDate: string | null;
  active: boolean;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

const TeachersCard = () => {
  const { data: teachersResponse, isLoading, isError } = useGetAllTeachersQuery({});
  const teachers = teachersResponse?.data || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-64">
          <CircularProgress sx={{ color: "#0F4C3A" }} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center text-red-500 bg-red-50 p-8 rounded-2xl">
          Error loading teachers data
        </div>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center text-gray-500 bg-gray-50 p-8 rounded-2xl">
          No teachers available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2E4D] mb-2">
            Our Distinguished Faculty
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Learn from the best educators who are passionate about shaping young minds
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {teachers.slice(0, 4).map((teacher: Teacher) => (
            <motion.div
              key={teacher.id}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={teacher.avatar || "/placeholder-teacher.jpg"}
                    alt={teacher.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Contact Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex justify-center gap-3">
                      <a href={`mailto:${teacher.email}`} className="bg-white text-[#0F4C3A] p-2 rounded-full hover:bg-[#FFD700] transition-colors">
                        <FaEnvelope size={14} />
                      </a>
                      <a href={`tel:${teacher.phone}`} className="bg-white text-[#0F4C3A] p-2 rounded-full hover:bg-[#FFD700] transition-colors">
                        <FaPhone size={14} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1">
                      {teacher.name}
                    </h3>
                    <FaUserTie className="text-[#FFD700]" size={18} />
                  </div>
                  
                  <div className="flex items-center text-sm text-[#0F4C3A] mb-3">
                    <FaGraduationCap className="mr-1" />
                    <span>{teacher.designation}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                      {teacher.specialistSubject || "General"}
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                      {teacher.qualification?.split(' ')[0] || "Qualified"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="/teachers">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#0F4C3A] to-[#1B6B50] text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all duration-300"
            >
              View All Faculty Members
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default TeachersCard;