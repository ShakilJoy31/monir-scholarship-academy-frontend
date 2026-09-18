"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, ChevronRight, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

const PublicNavigation = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: "🏠" },
    { name: "Teachers", href: "/teacher-info-public", icon: "👨‍🏫" },
    { name: "Students", href: "/student-info-public", icon: "👩‍🎓" },
    { name: "Gallery", href: "/gallery-info-public", icon: "🖼️" },
    { name: "Results", href: "/home-result", icon: "📊" },
    { name: "Contact", href: "/public/contact", icon: "📞" },
    { name: "About Us", href: "/public-about-us", icon: "ℹ️" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`w-full transition-all duration-500 ${
          isSticky 
            ? "fixed top-0 left-0 right-0 z-[40] shadow-2xl" 
            : "relative z-[40]"
        }`}
      >
        <div className="bg-gradient-to-r from-[#0F4C3A] to-[#1B6B50]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 ">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center"
              >
                <Link href="/" className="flex items-center space-x-2 group cursor-pointer">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-[#FFD700] transition-colors duration-300"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">🎓</span>
                  </motion.div>
                 
                </Link>
              </motion.div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={item.href} className="cursor-pointer">
                      <motion.div
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-1 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
                          pathname === item.href
                            ? "bg-[#FFD700] text-[#0F4C3A]"
                            : "text-white hover:bg-white/10"
                        }`}
                      >
                        <span className="relative z-10 flex items-center">
                          <span className="mr-2">{item.icon}</span>
                          {item.name}
                        </span>
                        {pathname !== item.href && (
                          <motion.div
                            className="absolute inset-0 bg-white/20"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: 0 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Desktop Login Button - Fixed cursor pointer */}
              <div className="hidden lg:flex items-center space-x-4">
                <Link href="/login" className="cursor-pointer block">
                  <motion.div
                    onHoverStart={() => setIsLoginHovered(true)}
                    onHoverEnd={() => setIsLoginHovered(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group cursor-pointer"
                  >
                    {/* Animated background gradient */}
                    <motion.div
                      className="absolute -inset-0.5 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-x"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    
                    {/* Button content */}
                    <Button 
                      className="relative px-8 py-2 bg-[#0A2E4D] text-white rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 hover:bg-transparent border-2 border-transparent hover:border-[#FFD700] group cursor-pointer"
                    >
                      {/* Shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        initial={{ x: "-100%", skewX: "-15deg" }}
                        animate={isLoginHovered ? { x: "200%", skewX: "-15deg" } : {}}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      />
                      
                      {/* Content */}
                      <span className="relative z-10 flex items-center">
                        <motion.div
                          animate={isLoginHovered ? { rotate: [0, -10, 10, 0] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <LogIn className="mr-2" size={20} />
                        </motion.div>
                        <span>Login</span>
                        <motion.div
                          animate={isLoginHovered ? { x: [0, 5, 0] } : {}}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="ml-2"
                        >
                          <ChevronRight size={16} />
                        </motion.div>
                      </span>

                      {/* Sparkle effects */}
                      <AnimatePresence>
                        {isLoginHovered && (
                          <>
                            <motion.div
                              initial={{ opacity: 0, scale: 0, x: -20, y: -20 }}
                              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                              exit={{ opacity: 0, scale: 0 }}
                              className="absolute top-0 left-0 text-[#FFD700]"
                            >
                              <Sparkles size={12} />
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, scale: 0, x: 20, y: -20 }}
                              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                              exit={{ opacity: 0, scale: 0 }}
                              className="absolute top-0 right-0 text-[#FFD700]"
                            >
                              <Sparkles size={12} />
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, scale: 0, x: -20, y: 20 }}
                              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                              exit={{ opacity: 0, scale: 0 }}
                              className="absolute bottom-0 left-0 text-[#FFD700]"
                            >
                              <Sparkles size={12} />
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, scale: 0, x: 20, y: 20 }}
                              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                              exit={{ opacity: 0, scale: 0 }}
                              className="absolute bottom-0 right-0 text-[#FFD700]"
                            >
                              <Sparkles size={12} />
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors relative cursor-pointer"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                {/* Pulse effect on menu button */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-white/20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white shadow-xl overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="space-y-2">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={item.href} className="cursor-pointer block">
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            pathname === item.href
                              ? "bg-[#0F4C3A] text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span className="text-xl">{item.icon}</span>
                          <span className="font-medium">{item.name}</span>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Mobile Login Button - Fixed cursor pointer */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: navItems.length * 0.05 }}
                    className="pt-4"
                  >
                    <Link href="/login" className="cursor-pointer block">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative group overflow-hidden rounded-xl cursor-pointer"
                      >
                        {/* Animated background */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-[#FFA500]"
                          animate={{
                            background: [
                              "linear-gradient(45deg, #FFD700, #FFA500)",
                              "linear-gradient(45deg, #FFA500, #FFD700)",
                              "linear-gradient(45deg, #FFD700, #FFA500)",
                            ],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        
                        {/* Button content */}
                        <div className="relative bg-gradient-to-r from-[#0F4C3A] to-[#1B6B50] text-white p-4 m-[2px] rounded-lg flex items-center justify-center group-hover:bg-transparent transition-all duration-300 cursor-pointer">
                          <LogIn className="mr-2" size={20} />
                          <span className="font-semibold">Login to Your Account</span>
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="ml-2"
                          >
                            <ChevronRight size={16} />
                          </motion.div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Spacer for sticky navigation */}
      {isSticky && <div className="h-16 md:h-20" />}

      {/* Add CSS for gradient animation */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </>
  );
};

export default PublicNavigation;