"use client"
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { BranchConfig } from "../principalMassage/page";
import { MapPin, Phone, Mail, Building2, Clock } from "lucide-react";

const MapPigeon = dynamic(() => import("../mapPegion/page"), { ssr: false });

const Map = () => {
  const currentBranchId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("selectedBranch") || "null")?.id
      : null;

  const { data: branchConfigData } = useGetBranchConfigQuery(currentBranchId, {
    skip: !currentBranchId,
  });
  const configData: BranchConfig = branchConfigData?.data;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2E4D] mb-2">
            Visit Our Campus
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] mx-auto rounded-full"></div>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4">
            Experience our state-of-the-art facilities and vibrant learning environment
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="grid md:grid-cols-2">
            {/* Contact Information */}
            <div className="bg-gradient-to-br from-[#0A2E4D] to-[#1B4A6B] text-white p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-8">
                Get in Touch
              </h3>
              
              <div className="space-y-6">
                <motion.div 
                  whileHover={{ x: 10 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="bg-white/10 p-3 rounded-lg group-hover:bg-[#FFD700] transition-all">
                    <MapPin size={24} className="group-hover:text-[#0A2E4D]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#FFD700] mb-1">Address</h4>
                    <p className="text-gray-200">{configData?.schoolAddress || "N/A"}</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ x: 10 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="bg-white/10 p-3 rounded-lg group-hover:bg-[#FFD700] transition-all">
                    <Phone size={24} className="group-hover:text-[#0A2E4D]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#FFD700] mb-1">Phone</h4>
                    <p className="text-gray-200">{configData?.schoolPhone || "N/A"}</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ x: 10 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="bg-white/10 p-3 rounded-lg group-hover:bg-[#FFD700] transition-all">
                    <Mail size={24} className="group-hover:text-[#0A2E4D]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#FFD700] mb-1">Email</h4>
                    <p className="text-gray-200">{configData?.schoolEmail || "N/A"}</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ x: 10 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="bg-white/10 p-3 rounded-lg group-hover:bg-[#FFD700] transition-all">
                    <Building2 size={24} className="group-hover:text-[#0A2E4D]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#FFD700] mb-1">EIIN</h4>
                    <p className="text-gray-200">{configData?.eiinNumber || "N/A"}</p>
                  </div>
                </motion.div>
              </div>

              {/* Opening Hours */}
              <div className="mt-8 pt-8 border-t border-white/20">
                <h4 className="font-semibold text-[#FFD700] mb-3 flex items-center">
                  <Clock size={18} className="mr-2" />
                  Office Hours
                </h4>
                <div className="space-y-1 text-gray-200 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>9:00 AM - 1:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-red-300">Closed</span>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <motion.a
                href={`tel:${configData?.schoolPhone}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center w-full mt-8 bg-[#FFD700] text-[#0A2E4D] px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition-all"
              >
                <Phone size={18} className="mr-2" />
                Call Us Now
              </motion.a>
            </div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="h-[500px] md:h-auto"
            >
              <MapPigeon mapLink={configData?.locationMap} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Map;