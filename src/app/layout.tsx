// app/layout.tsx
import { Rubik } from "next/font/google";
import ClientLayout from "./client-layout";
import "./globals.css";
import { Metadata } from "next";

// Google font import
const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600"], // দরকারমতো ওজন রাখো
  variable: "--font-rubik", // Custom CSS variable
});

// export const metadata: Metadata = {
//   title: "School Management",
//   description: "School Management System - Super Admin Dashboard",
//   icons: {
//     icon: "/assets/logo/education-school-logo-design-template_731136-92.webp",
//     apple: "/apple-touch-icon.png",
//   },
// };

export default function RootLayout({
  children, 
}: {
  children: React.ReactNode;
}) {

  
  return (
    <html lang="en" className={rubik.variable}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      template: "School Management",
      default: "School Management",
    },
    description: "School Management System - Super Admin Dashboard",
    keywords: ["school management", "education", "admin dashboard"],
    icons: {
      icon: "/assets/logo/education-school-logo-design-template_731136-92.webp",
    },
  };
}
