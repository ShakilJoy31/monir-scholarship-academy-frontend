"use client";
import Image from "next/image";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { motion, Variants } from "framer-motion";
import { useState } from "react";
import { FaCamera, FaSearch, FaTimes, FaDownload } from "react-icons/fa";
import Footer from "@/components/pageComponents/publicComponent/footer/page";
import PublicNavigation from "@/components/pageComponents/publicComponent/publicNavigation/page";

// Static gallery data with high-quality images
const galleryImages = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    title: "Graduation Ceremony 2024",
    category: "Events",
    description: "Students celebrating their graduation day"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    title: "Science Fair",
    category: "Academics",
    description: "Students showcasing their innovative projects"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    title: "Sports Day",
    category: "Sports",
    description: "Annual sports competition winners"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    title: "Classroom Learning",
    category: "Academics",
    description: "Interactive learning session"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    title: "Library Session",
    category: "Academics",
    description: "Students in the school library"
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    title: "Art Exhibition",
    category: "Arts",
    description: "Student artwork display"
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    title: "Computer Lab",
    category: "Facilities",
    description: "Modern computer laboratory"
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    title: "Music Class",
    category: "Arts",
    description: "Students learning musical instruments"
  },
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    title: "Cultural Program",
    category: "Events",
    description: "Annual cultural celebration"
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1503676260728-5177806622e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    title: "Science Laboratory",
    category: "Facilities",
    description: "Advanced science lab"
  },
  {
    id: 11,
    image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    title: "Sports Ground",
    category: "Sports",
    description: "Outdoor sports facilities"
  },
  {
    id: 12,
    image: "https://images.unsplash.com/photo-1588072432836-e100327ed50e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    title: "Award Ceremony",
    category: "Events",
    description: "Student achievement awards"
  }
];

// Get unique categories
const categories = ["All", ...new Set(galleryImages.map(img => img.category))];

const GalleryInfoPublic = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter images based on category and search
  const filteredImages = galleryImages.filter(img => {
    const matchesCategory = selectedCategory === "All" || img.category === selectedCategory;
    const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         img.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  const handleDownload = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-[#0F4C3A] to-[#1B6B50]">
        <PublicNavigation />
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0A2E4D] to-[#1B4A6B] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block p-3 bg-white/10 rounded-full mb-6">
              <FaCamera className="text-3xl text-[#FFD700]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="text-[#FFD700]">Gallery</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Capturing precious moments and memories of our school life
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 pr-4 rounded-full border border-gray-300 focus:outline-none focus:border-[#0F4C3A] focus:ring-2 focus:ring-[#0F4C3A]/20 transition-all"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-[#0F4C3A] text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* Results Count */}
          <p className="text-center text-gray-500 mt-4">
            Showing {filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'}
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <PhotoProvider
          bannerVisible={false}
          photoClosable
          overlayRender={({ rotate, onRotate, scale, onScale }) => {
            const currentImage = galleryImages.find(img => img.image === (document.querySelector('[data-photo-view-src]') as HTMLImageElement)?.src);
            return (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-1">{currentImage?.title}</h3>
                    <p className="text-sm text-gray-200">{currentImage?.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onScale(scale + 0.5)}
                      className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                      title="Zoom In"
                    >
                      <span className="text-lg">➕</span>
                    </button>
                    <button
                      onClick={() => onScale(scale - 0.5)}
                      className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                      title="Zoom Out"
                    >
                      <span className="text-lg">➖</span>
                    </button>
                    <button
                      onClick={() => onRotate(rotate + 90)}
                      className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                      title="Rotate"
                    >
                      <span className="text-lg">🔄</span>
                    </button>
                    {currentImage && (
                      <button
                        onClick={() => handleDownload(currentImage.image, currentImage.title)}
                        className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                        title="Download"
                      >
                        <FaDownload size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredImages.map((gallery) => (
              <motion.div
                key={gallery.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group"
              >
                <PhotoView src={gallery.image}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        width={400}
                        height={300}
                        src={gallery.image}
                        alt={gallery.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <span className="inline-block px-2 py-1 bg-[#FFD700] text-[#0A2E4D] text-xs rounded-full mb-2">
                            {gallery.category}
                          </span>
                          <h3 className="text-white font-semibold">{gallery.title}</h3>
                        </div>
                      </div>

                      {/* Category Badge (visible by default on mobile) */}
                      <span className="absolute top-4 left-4 px-2 py-1 bg-[#FFD700] text-[#0A2E4D] text-xs rounded-full sm:hidden">
                        {gallery.category}
                      </span>
                    </div>
                    
                    {/* Caption for mobile (hidden on desktop as it's in overlay) */}
                    <div className="p-3 sm:hidden">
                      <h3 className="text-sm font-medium text-gray-700">{gallery.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{gallery.description}</p>
                    </div>
                  </div>
                </PhotoView>
              </motion.div>
            ))}
          </motion.div>
        </PhotoProvider>

        {/* No Results */}
        {filteredImages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No images found</h3>
            <p className="text-gray-500">Try adjusting your search or filter</p>
          </motion.div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default GalleryInfoPublic;