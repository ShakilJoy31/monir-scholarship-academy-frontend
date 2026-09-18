"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface CarouselImage {
  id: number;
  url: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
}

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);

  // Sample images - replace with your actual images from API
  const images: CarouselImage[] = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Welcome to BMSCR",
      subtitle: "Nurturing Tomorrow's Leaders Today",
      ctaText: "Learn More",
      ctaLink: "/about"
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Excellence in Education",
      subtitle: "State-of-the-art facilities and experienced faculty",
      ctaText: "Our Programs",
      ctaLink: "/programs"
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Admissions Open 2026",
      subtitle: "Join our community of learners",
      ctaText: "Apply Now",
      ctaLink: "/admissions"
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Beyond Academics",
      subtitle: "Holistic development through sports and arts",
      ctaText: "Explore Activities",
      ctaLink: "/activities"
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
  };

  const slideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.8
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.68, -0.55, 0.265, 1.55]
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.8,
        ease: [0.68, -0.55, 0.265, 1.55]
      }
    })
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="relative h-[600px] md:h-[700px] lg:h-[800px] w-full overflow-hidden bg-[#0A2E4D]">
      {/* Main Carousel */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A2E4D]/90 via-[#0A2E4D]/70 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="text-white max-w-3xl">
              <motion.h1
                custom={0.2}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="text-5xl md:text-7xl font-bold mb-4 leading-tight"
              >
                {images[currentIndex].title}
              </motion.h1>
              
              <motion.p
                custom={0.4}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="text-xl md:text-2xl text-gray-200 mb-8"
              >
                {images[currentIndex].subtitle}
              </motion.p>

              {images[currentIndex].ctaText && (
                <motion.div
                  custom={0.6}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.a
                    href={images[currentIndex].ctaLink}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-8 py-4 bg-[#FFD700] text-[#0A2E4D] font-semibold rounded-full text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 group"
                  >
                    {images[currentIndex].ctaText}
                    <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                  </motion.a>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrevious}
          className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition-all"
        >
          <ChevronLeft size={24} />
        </motion.button>

        {/* Dots Indicator */}
        <div className="flex space-x-2">
          {images.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
              className="group"
              whileHover={{ scale: 1.2 }}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-[#FFD700]"
                    : "w-2 bg-white/50 group-hover:bg-white"
                }`}
              />
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNext}
          className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition-all"
        >
          <ChevronRight size={24} />
        </motion.button>
      </div>

      {/* Auto-play Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        className="absolute top-8 right-8 z-20 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition-all"
      >
        {isAutoPlaying ? <Pause size={20} /> : <Play size={20} />}
      </motion.button>

      {/* Slide Counter */}
      <div className="absolute top-8 left-8 z-20 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full">
        <span className="font-bold">{currentIndex + 1}</span> / {images.length}
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#0A2E4D] to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0A2E4D] to-transparent" />
      </div>
    </div>
  );
};

export default HeroCarousel;