"use client";

import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";
import { useGetAllPagesQuery } from "@/app/store/api/classes/PageApi";
import { useGetAllPageGroupsQuery } from "@/app/store/api/classes/pageGroupApi";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Mail, Phone, Star, Facebook, Twitter, Linkedin, Instagram, Send, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { BranchConfig } from "../principalMassage/page";
import { useState } from "react";

interface Page {
  id: number;
  groupId: number;
  title: string;
  slug: string;
}

interface PageGroup {
  id: number;
  title: string;
}

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const {
    data: groupsData,
    isLoading: isGroupsLoading,
    isError: isGroupsError,
  } = useGetAllPageGroupsQuery({
    page: 1,
    size: 10,
    search: "",
  });

  const currentBranchId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("selectedBranch") || "null")?.id
      : null;

  const { data: branchConfigData } = useGetBranchConfigQuery(currentBranchId, {
    skip: !currentBranchId,
  });
  const configData: BranchConfig = branchConfigData?.data;

  const {
    data: pagesData,
    isLoading: isPagesLoading,
    isError: isPagesError,
  } = useGetAllPagesQuery({
    page: 1,
    size: 10,
    search: "",
  });

  if (isGroupsLoading || isPagesLoading) {
    return (
      <div className="bg-gradient-to-br from-[#0A2E4D] to-[#1B4A6B] h-64 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (isGroupsError || isPagesError) {
    return (
      <div className="bg-gradient-to-br from-[#0A2E4D] to-[#1B4A6B] h-64 flex items-center justify-center">
        <div className="text-white">Error loading data</div>
      </div>
    );
  }

  const groupedPages = pagesData?.data?.reduce((acc: Record<number, Page[]>, page: Page) => {
    if (!acc[page.groupId]) {
      acc[page.groupId] = [];
    }
    acc[page.groupId].push(page);
    return acc;
  }, {} as Record<number, Page[]>) || {};

  const displayGroups = groupsData?.data?.slice(0, 3) || [];

  const socialLinks = [
    { icon: Facebook, href: configData?.facebook, label: "Facebook" },
    { icon: Twitter, href: configData?.twitter, label: "Twitter" },
    { icon: Linkedin, href: configData?.linkedin, label: "LinkedIn" },
    { icon: Instagram, href: configData?.instagram, label: "Instagram" },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
    setTimeout(() => setIsSubscribed(false), 3000);
    setEmail("");
  };

  return (
    <footer className="bg-gradient-to-br from-[#0A2E4D] to-[#1B4A6B] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] w-8 h-8 rounded-lg flex items-center justify-center mr-2">
                <span className="text-[#0A2E4D]">🏫</span>
              </span>
              BMSCR
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Empowering students with knowledge and skills for a successful future through quality education and holistic development.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                social.href && (
                  <motion.a
                    key={index}
                    whileHover={{ y: -3, scale: 1.1 }}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-gradient-to-r hover:from-[#FFD700] hover:to-[#FFA500] w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group"
                    title={social.label}
                  >
                    <social.icon size={18} className="group-hover:text-[#0A2E4D]" />
                  </motion.a>
                )
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          {displayGroups.map((group: PageGroup, index: number) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <span className="w-1 h-6 bg-gradient-to-b from-[#FFD700] to-[#FFA500] rounded-full mr-2"></span>
                {group.title}
              </h4>
              <ul className="space-y-3">
                {groupedPages[group.id]?.map((page: Page) => (
                  <motion.li
                    key={page.id}
                    whileHover={{ x: 5 }}
                  >
                    <Link
                      href={`/${page.slug}`}
                      className="text-gray-300 hover:text-white transition-colors text-sm flex items-center group"
                    >
                      <ChevronRight size={14} className="mr-1 text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity" />
                      {page.title}
                    </Link>
                  </motion.li>
                ))}
                {index === displayGroups.length - 1 && (
                  <motion.li whileHover={{ x: 5 }}>
                    <Link
                      href="/frequently-asked-questions"
                      className="text-gray-300 hover:text-white transition-colors text-sm flex items-center group"
                    >
                      <ChevronRight size={14} className="mr-1 text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity" />
                      FAQ
                    </Link>
                  </motion.li>
                )}
              </ul>
            </motion.div>
          ))}

          {/* Contact & Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-[#FFD700] to-[#FFA500] rounded-full mr-2"></span>
              Contact Info
            </h4>
            
            <ul className="space-y-4 text-gray-300 mb-6">
              <li className="flex items-start gap-3 group hover:text-white transition-colors">
                <div className="bg-white/10 p-2 rounded-lg group-hover:bg-[#FFD700] group-hover:text-[#0A2E4D] transition-all">
                  <MapPin size={16} />
                </div>
                <span className="text-sm">{configData?.schoolAddress || "N/A"}</span>
              </li>
              <li className="flex items-center gap-3 group hover:text-white transition-colors">
                <div className="bg-white/10 p-2 rounded-lg group-hover:bg-[#FFD700] group-hover:text-[#0A2E4D] transition-all">
                  <Phone size={16} />
                </div>
                <span className="text-sm">{configData?.schoolPhone || "N/A"}</span>
              </li>
              <li className="flex items-center gap-3 group hover:text-white transition-colors">
                <div className="bg-white/10 p-2 rounded-lg group-hover:bg-[#FFD700] group-hover:text-[#0A2E4D] transition-all">
                  <Mail size={16} />
                </div>
                <span className="text-sm">{configData?.schoolEmail || "N/A"}</span>
              </li>
              <li className="flex items-center gap-3 group hover:text-white transition-colors">
                <div className="bg-white/10 p-2 rounded-lg group-hover:bg-[#FFD700] group-hover:text-[#0A2E4D] transition-all">
                  <Star size={16} />
                </div>
                <span className="text-sm">EIIN: {configData?.eiinNumber || "N/A"}</span>
              </li>
            </ul>

            {/* Office Hours */}
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <h5 className="font-semibold text-[#FFD700] mb-2 flex items-center">
                <Clock size={14} className="mr-2" />
                Office Hours
              </h5>
              <div className="space-y-1 text-sm text-gray-300">
                <p>Mon - Fri: 9:00 AM - 5:00 PM</p>
                <p>Saturday: 9:00 AM - 1:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="relative">
              <h5 className="text-sm font-semibold mb-2">Subscribe to Newsletter</h5>
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-l-lg focus:outline-none focus:border-[#FFD700] text-sm placeholder-gray-400"
                  required
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0A2E4D] px-4 rounded-r-lg hover:shadow-lg transition-all"
                >
                  <Send size={18} />
                </motion.button>
              </div>
              
              {/* Success Message */}
              <AnimatePresence>
                {isSubscribed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -bottom-8 left-0 text-sm text-green-400"
                  >
                    ✓ Successfully subscribed!
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} BMSCR. All rights reserved. | Developed with ❤️ for education</p>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="hover:text-white transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;