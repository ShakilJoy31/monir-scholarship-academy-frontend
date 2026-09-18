"use client"

import React from 'react';
import {
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import pageLogo from '../../../../../../public/assets/faq_image.webp'

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQPage: React.FC<{ faqs: FAQItem[] }> = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
  //   setExpanded(isExpanded ? panel : false);
  // };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
       {/* Logo/Image Section - Fixed full height */}
      <Box
        sx={{
          width: isMobile ? '100%' : '50%',
          height: isMobile ? '40vh' : '100vh',
          position: 'relative',
          backgroundColor: theme.palette.background.default,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={pageLogo}
            alt="FAQ Logo"
            fill
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </Box>
      </Box>

      {/* FAQ Content Section */}
      <Box
        sx={{
          width: isMobile ? '100%' : '50%',
          height: isMobile ? 'auto' : '100vh',
          padding: isMobile ? theme.spacing(3) : theme.spacing(6),
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          backgroundColor: '#f8fafc', // Light gray background for contrast
        }}
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Fixed position header that won't move */}
        <Box sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1, 
          pb: 2,
          backgroundColor: '#f8fafc', // Match content background
        }}>
          {/* <Typography
            variant="h3"
            component={motion.h1}
            gutterBottom
            sx={{
              fontWeight: 700,
              color: '#035140', // Primary color for text
            }}
            variants={itemVariants}
          > */}
            Frequently Asked Questions
          {/* </Typography> */}
        </Box>

        <Box
          sx={{
            width: '100%',
            maxWidth: '800px',
            flex: 1,
          }}
        >
         
        </Box>
      </Box>
    </Box>
  );
};

export default FAQPage;


