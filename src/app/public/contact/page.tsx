"use client";

import ContactComponent from "@/components/pageComponents/public/home/ContactComponent";
import Footer from "@/components/pageComponents/publicComponent/footer/page";
import PublicNavigation from "@/components/pageComponents/publicComponent/publicNavigation/page";
import { Box } from "@mui/material";
import React from "react";

export default function Page() {
  try {
    return (
      <Box sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        pb: 4
      }}>
        <div className="bg-[#035140]">
          <PublicNavigation />
        </div>
        <ContactComponent />
        <Footer />
      </Box>
    );
  } catch (error) {
    console.log(error);
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'error.main'
      }}>
        Failed to load contact information. Please try again later.
      </Box>
    );
  }
}