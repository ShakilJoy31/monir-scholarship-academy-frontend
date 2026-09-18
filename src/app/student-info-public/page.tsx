"use client";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Footer from "@/components/pageComponents/publicComponent/footer/page";
import PublicNavigation from "@/components/pageComponents/publicComponent/publicNavigation/page";
import { FaGraduationCap, FaIdCard, FaUserGraduate } from "react-icons/fa";

// Static student data
const staticStudents = [
  {
    id: 1,
    name: "Rafiqul Islam",
    class: { name: "Class 10" },
    section: { name: "A" },
    classRoll: 1,
    studentUniqueId: "STU-2024-001",
    avatar: "https://images.unsplash.com/photo-1491308056676-205b7c9a7dc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
    fatherName: "Abdul Karim",
    motherName: "Fatema Begum",
    bloodGroup: "B+",
    address: "Mirpur, Dhaka",
    phone: "017XXXXXXXX",
    email: "rafiqul@student.com"
  },
  {
    id: 2,
    name: "Sumaiya Akter",
    class: { name: "Class 10" },
    section: { name: "A" },
    classRoll: 2,
    studentUniqueId: "STU-2024-002",
    avatar: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
    fatherName: "Shahidul Islam",
    motherName: "Jahanara Begum",
    bloodGroup: "A+",
    address: "Uttara, Dhaka",
    phone: "018XXXXXXXX",
    email: "sumaiya@student.com"
  },
  {
    id: 3,
    name: "Tanvir Ahmed",
    class: { name: "Class 9" },
    section: { name: "B" },
    classRoll: 5,
    studentUniqueId: "STU-2024-003",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
    fatherName: "Mosharraf Hossain",
    motherName: "Shamima Akter",
    bloodGroup: "O+",
    address: "Dhanmondi, Dhaka",
    phone: "019XXXXXXXX",
    email: "tanvir@student.com"
  },
  {
    id: 4,
    name: "Nusrat Jahan",
    class: { name: "Class 9" },
    section: { name: "B" },
    classRoll: 6,
    studentUniqueId: "STU-2024-004",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
    fatherName: "Abul Hossain",
    motherName: "Rokeya Begum",
    bloodGroup: "AB+",
    address: "Banasree, Dhaka",
    phone: "016XXXXXXXX",
    email: "nusrat@student.com"
  },
  {
    id: 5,
    name: "Shakib Khan",
    class: { name: "Class 8" },
    section: { name: "A" },
    classRoll: 3,
    studentUniqueId: "STU-2024-005",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
    fatherName: "Jamal Uddin",
    motherName: "Shahinur Begum",
    bloodGroup: "B-",
    address: "Mohammadpur, Dhaka",
    phone: "017XXXXXXXX",
    email: "shakib@student.com"
  },
  {
    id: 6,
    name: "Tahmina Akter",
    class: { name: "Class 8" },
    section: { name: "A" },
    classRoll: 4,
    studentUniqueId: "STU-2024-006",
    avatar: "https://images.unsplash.com/photo-1524505970997-ffc792d1d0c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
    fatherName: "Nurul Islam",
    motherName: "Hasina Begum",
    bloodGroup: "O-",
    address: "Shyamoli, Dhaka",
    phone: "018XXXXXXXX",
    email: "tahmina@student.com"
  },
  {
    id: 7,
    name: "Rakib Hasan",
    class: { name: "Class 7" },
    section: { name: "C" },
    classRoll: 10,
    studentUniqueId: "STU-2024-007",
    avatar: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
    fatherName: "Mizanur Rahman",
    motherName: "Nargis Begum",
    bloodGroup: "A-",
    address: "Badda, Dhaka",
    phone: "019XXXXXXXX",
    email: "rakib@student.com"
  },
  {
    id: 8,
    name: "Fariha Islam",
    class: { name: "Class 7" },
    section: { name: "C" },
    classRoll: 11,
    studentUniqueId: "STU-2024-008",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
    fatherName: "Shamsul Alam",
    motherName: "Shahana Akter",
    bloodGroup: "AB-",
    address: "Rampura, Dhaka",
    phone: "016XXXXXXXX",
    email: "fariha@student.com"
  }
];

const StudentInfoPublic = () => {
  const students = staticStudents;

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

  return (
    <>
      <PublicNavigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0A2E4D] to-[#1B4A6B] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Our <span className="text-[#FFD700]">Students</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-200 max-w-2xl mx-auto"
          >
            Meet the bright minds shaping our future
          </motion.p>
        </div>
      </div>

      {/* Students Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {students.map((student, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                {/* Student Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={student.avatar}
                    alt={student.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Class Badge */}
                  <div className="absolute top-4 left-4 bg-[#FFD700] text-[#0A2E4D] px-3 py-1 rounded-full text-xs font-semibold">
                    {student.class.name} - {student.section.name}
                  </div>
                </div>

                {/* Student Info */}
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-800 mb-2">
                    {student.name}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaIdCard className="mr-2 text-[#FFD700]" size={14} />
                      <span>ID: {student.studentUniqueId}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaGraduationCap className="mr-2 text-[#FFD700]" size={14} />
                      <span>Roll: {student.classRoll}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUserGraduate className="mr-2 text-[#FFD700]" size={14} />
                      <span>Blood: {student.bloodGroup}</span>
                    </div>
                  </div>

                  {/* Quick Info Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {student.fatherName}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {student.motherName}
                    </span>
                  </div>

                  {/* View Details Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-[#0F4C3A] to-[#1B6B50] text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    View Profile
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Statistics Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-2xl shadow-lg text-center"
            >
              <div className="text-4xl font-bold text-[#0F4C3A] mb-2">1200+</div>
              <div className="text-gray-600">Total Students</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-lg text-center"
            >
              <div className="text-4xl font-bold text-[#0F4C3A] mb-2">45+</div>
              <div className="text-gray-600">Teachers</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-2xl shadow-lg text-center"
            >
              <div className="text-4xl font-bold text-[#0F4C3A] mb-2">98%</div>
              <div className="text-gray-600">Pass Rate</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-6 rounded-2xl shadow-lg text-center"
            >
              <div className="text-4xl font-bold text-[#0F4C3A] mb-2">15+</div>
              <div className="text-gray-600">Achievements</div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default StudentInfoPublic;