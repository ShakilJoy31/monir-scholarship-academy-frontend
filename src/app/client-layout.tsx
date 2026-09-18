// app/client-layout.tsx (client component)
"use client";

import { Rubik } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Providers } from "./providers";
import { Provider } from 'react-redux';
import { store } from "./store/store";

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  weight: ["300", "400", "500", "600", "700"],
  display: 'swap', // Add this for better font loading behavior
});

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${rubik.variable}`}>
      <Provider store={store}>
        <Providers>
          {children}
        </Providers>
      </Provider>
      <ToastContainer />
    </div>
  );
}