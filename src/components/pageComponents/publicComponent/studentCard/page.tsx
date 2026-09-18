"use client"
import { useGetTopStudentsAllQuery } from "@/app/store/api/student/studentApi";
import { motion, Variants } from "framer-motion";
import { CircularProgress } from "@mui/material";
import Image from "next/image";
import { FaMedal, FaTrophy } from "react-icons/fa";

interface Student {
  id: number;
  branchId: number;
  type: string;
  name: string;
  studentUniqueId: string;
  phone: string;
  email: string;
  classNameId: number;
  classRoll: number;
  sectionNameId: number;
  streamNameId: number;
  discountType: string;
  discount: number;
  gender: string;
  religion: string;
  dob: string;
  bloodGroup: string;
  address: string;
  fatherName: string;
  motherName: string;
  parentPhone: string;
  active: boolean;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  class: {
    id: number;
    name: string;
  };
  section: {
    id: number;
    name: string;
  };
  session: {
    id: number;
    name: string;
  };
  stream: {
    id: number;
    name: string;
  };
}

const StudentCard = () => {
  const { data: studentsResponse, isLoading, isError } = useGetTopStudentsAllQuery({});
  const allStudents = studentsResponse?.data || [];
  const students = allStudents.slice(0, 4);

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
          Error loading students data
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center text-gray-500 bg-gray-50 p-8 rounded-2xl">
          No students available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2E4D] mb-2">
            Top Achievers
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Celebrating excellence and academic achievement
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {students.map((student: Student, index: number) => (
            <motion.div
              key={student.id}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                {/* Rank Badge */}
                <div className="absolute top-4 right-4 z-10">
                  {index === 0 && (
                    <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                      <FaTrophy size={20} />
                    </div>
                  )}
                  {index === 1 && (
                    <div className="bg-gradient-to-br from-gray-300 to-gray-400 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                      <FaMedal size={16} />
                    </div>
                  )}
                  {index === 2 && (
                    <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                      <FaMedal size={16} />
                    </div>
                  )}
                </div>

                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={student.avatar || "/placeholder-student.jpg"}
                    alt={student.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Student Info Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-xs text-[#0F4C3A] font-semibold">
                        {student.class?.name} {student.section?.name && `- ${student.section.name}`}
                      </p>
                      <p className="text-xs text-gray-600">Roll: {student.classRoll}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                    {student.name}
                  </h3>
                  <p className="text-xs text-gray-500">ID: {student.studentUniqueId}</p>
                  
                  {/* Progress Bar (Example) */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Performance</span>
                      <span className="text-[#FFD700] font-semibold">{(index + 1) * 20}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(index + 1) * 20}%` }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] h-1.5 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default StudentCard;