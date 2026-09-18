"use client";
import React from "react";
import { motion } from "framer-motion";
import { FaTools, FaClock, FaCode } from "react-icons/fa";
import { MdConstruction, MdEngineering, MdSettings } from "react-icons/md";
import { FaGear } from "react-icons/fa6";

interface UnderDevelopmentProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  estimatedTime?: string;
}

const UnderDevelopment: React.FC<UnderDevelopmentProps> = ({
  title = "Under Development",
  message = "Our engineers are working on this feature. We'll have it ready for you soon!",
  icon,
  estimatedTime = "Coming Soon"
}) => {
  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl"
      >
        {/* Main Card */}
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Decorative gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600" />

          <div className="p-8 md:p-12">
            {/* Icon Section */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  {icon || (
                    <div className="relative">
                      <FaGear className="w-12 h-12 text-blue-600 animate-spin-slow" />
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <span className="text-amber-600 text-xs font-bold">!</span>
                      </div>
                    </div>
                  )}
                </div>
                {/* Floating dots */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400"
                />
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-blue-400"
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-3"
            >
              {title}
            </motion.h2>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-gray-500 text-base md:text-lg leading-relaxed max-w-md mx-auto"
            >
              {message}
            </motion.p>

            {/* Engineers working animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex items-center justify-center gap-3"
            >
              <div className="flex -space-x-2">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm"
                >
                  <span className="text-sm">👨‍💻</span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center border-2 border-white shadow-sm"
                >
                  <span className="text-sm">👩‍💻</span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm"
                >
                  <span className="text-sm">🧑‍💻</span>
                </motion.div>
              </div>
              <span className="text-sm text-gray-400 font-medium">Our team is on it</span>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.7, duration: 1 }}
              className="mt-8 w-full bg-gray-100 rounded-full h-2 overflow-hidden"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ delay: 0.8, duration: 2, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full"
                style={{ width: "65%" }}
              />
            </motion.div>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 opacity-10">
              <MdConstruction className="w-16 h-16 text-gray-800" />
            </div>
            <div className="absolute bottom-4 left-4 opacity-10">
              <MdEngineering className="w-16 h-16 text-gray-800" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UnderDevelopment;