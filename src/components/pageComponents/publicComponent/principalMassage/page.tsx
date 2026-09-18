"use client"
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetBranchConfigQuery } from '@/app/store/api/branch/branchApi';
import { ChevronLeft, ChevronRight, Quote, Award, BookOpen } from 'lucide-react';

export interface BranchConfig {
  id: number;
  branchId: number;
  logo: string;
  footerLogo: string;
  idCardBackground: string;
  idCardBackSide: string;
  schoolName: string;
  schoolEmail: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolMobile: string;
  principalSignature: string;
  vicePrincipalSignature: string;
  principalName: string;
  principalImage: string;
  principalVoice: string;
  vicePrincipalName: string;
  vicePrincipalImage: string;
  vicePrincipalVoice: string;
  facebook: string;
  instagram: string;
  twitter: string;
  whatsapp: string;
  linkedin: string;
  locationMap: string;
  eiinNumber: string;
  createdAt: string;
  updatedAt: string;
}

const PrincipalMessage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentBranchId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("selectedBranch") || "null")?.id
      : null;

  const { data: branchConfigData } = useGetBranchConfigQuery(currentBranchId, {
    skip: !currentBranchId,
  });
  const configData: BranchConfig = branchConfigData?.data;

  const messages = [
    {
      name: configData?.principalName,
      content: configData?.principalVoice,
      image: configData?.principalImage,
      title: "Principal",
      quote: "Education is the most powerful weapon which you can use to change the world.",
    },
    {
      name: configData?.vicePrincipalName,
      content: configData?.vicePrincipalVoice,
      image: configData?.vicePrincipalImage,
      title: "Vice Principal",
      quote: "The beautiful thing about learning is that no one can take it away from you.",
    }
  ].filter(msg => msg.name && msg.content);

  const nextMessage = () => {
    setCurrentIndex((prev) => (prev + 1) % messages.length);
  };

  const prevMessage = () => {
    setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length);
  };

  if (!messages.length) return null;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#FFD700]/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#0A2E4D]/10 rounded-full blur-3xl -z-10"></div>

          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A2E4D] mb-2">
              Words from Our Leaders
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] mx-auto rounded-full"></div>
          </div>

          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/5 to-transparent"></div>
            
            <div className="relative z-10 p-8 md:p-12">
              <div className="flex items-center justify-between gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevMessage}
                  className="bg-gray-100 hover:bg-[#FFD700] text-gray-600 hover:text-[#0A2E4D] rounded-full p-3 transition-all duration-300"
                >
                  <ChevronLeft size={24} />
                </motion.button>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 flex flex-col md:flex-row items-center gap-8"
                  >
                    {/* Image with Frame */}
                    <div className="md:w-1/3">
                      <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-2xl opacity-20 blur-lg"></div>
                        <div className="relative bg-white p-2 rounded-2xl shadow-xl">
                          <Image
                            src={messages[currentIndex].image || "/placeholder-avatar.jpg"}
                            alt={messages[currentIndex].name}
                            width={400}
                            height={500}
                            className="rounded-xl object-cover w-full h-[350px] md:h-[400px]"
                          />
                          <div className="absolute bottom-4 left-4 bg-[#FFD700] text-[#0A2E4D] px-4 py-2 rounded-full font-semibold shadow-lg">
                            {messages[currentIndex].title}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="md:w-2/3">
                      <Quote className="text-[#FFD700] mb-4" size={48} />
                      
                      <h3 className="text-2xl md:text-3xl font-bold text-[#0A2E4D] mb-2">
                        {messages[currentIndex].name}
                      </h3>
                      
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-1">
                          <Award size={16} className="text-[#FFD700]" />
                          <span className="text-sm text-gray-600">40+ Years Experience</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen size={16} className="text-[#FFD700]" />
                          <span className="text-sm text-gray-600">Ph.D in Education</span>
                        </div>
                      </div>

                      <div className="relative">
                        <p className="text-gray-700 text-lg leading-relaxed italic mb-4">
                          &quot;{messages[currentIndex].content}&quot;
                        </p>
                        <div className="absolute -bottom-2 left-0 w-20 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full"></div>
                      </div>

                      {/* Quote */}
                      <p className="text-sm text-gray-500 mt-6 border-l-4 border-[#FFD700] pl-4">
                        {messages[currentIndex].quote}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextMessage}
                  className="bg-gray-100 hover:bg-[#FFD700] text-gray-600 hover:text-[#0A2E4D] rounded-full p-3 transition-all duration-300"
                >
                  <ChevronRight size={24} />
                </motion.button>
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center gap-3 mt-8">
                {messages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className="group"
                  >
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex 
                          ? "w-8 bg-gradient-to-r from-[#FFD700] to-[#FFA500]" 
                          : "w-2 bg-gray-300 group-hover:bg-gray-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrincipalMessage;