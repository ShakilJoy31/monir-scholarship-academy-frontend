"use client"

import { useAppSelector } from "@/app/hooks/hooks";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import AdminLargeDeviceSidebar from "@/components/shared/admin/AdminLargeDeviceSidebar";
import AdminSmallDeviceSidebar from "@/components/shared/admin/AdminSmallDeviceSidebar";
import AdminUpperNavigation from "@/components/shared/admin/AdminUpperNavigation";
import { Box } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type UserRole =
  | "super-admin"
  | "school-admin"
  | "branch-admin"
  | "teacher"
  | "student";

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  link: string;
  roles: UserRole[];
  exact?: boolean;
  children?: MenuItem[];
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MenuItem | null>(null);
  const [tabs, setTabs] = useState<MenuItem[]>([]);
  const pathname = usePathname();

  const handleSidebarToggle = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleSidebarClose = () => {
    setMobileSidebarOpen(false);
  };

  const handleTabChange = (tab: MenuItem) => {
    setActiveTab(tab);
  };

  // Function to update tabs from the sidebar
  const handleTabsChange = (newTabs: MenuItem[]) => {
    setTabs(newTabs);
    if (newTabs.length > 0) {
      // Find the tab that matches the current pathname
      const currentTab = newTabs.find(tab =>
        pathname === tab.link || pathname.startsWith(tab.link + '/')
      );
      setActiveTab(currentTab || newTabs[0]);
    } else {
      setActiveTab(null);
    }
  };

  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const userInfo = getUserInfoFromToken();
  console.log("AdminUpperNavigation Render", userInfo);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !user && !userInfo) {
      router.push('/');
    }
  }, [user, userInfo, isClient, router]);

  if (!isClient || (!user && !userInfo)) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
      {/* Sidebar for Large Devices */}
      <AdminLargeDeviceSidebar
        activeTab={activeTab?.text || ""}
        onTabChange={handleTabChange}
        onTabsChange={handleTabsChange}
      />

      {/* Sidebar for Small Devices */}
      <AdminSmallDeviceSidebar
        open={isMobileSidebarOpen}
        onClose={handleSidebarClose}
        activeTab={activeTab?.text || ""}
        onTabChange={handleTabChange}
        onTabsChange={handleTabsChange}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: { xs: 0, md: "280px" },
          width: { xs: '100%', md: `calc(100% - 280px)` },
          overflowX: "hidden",
        }}
      >
        {/* Top Navigation with Tabs */}
        <AdminUpperNavigation
          onMenuClick={handleSidebarToggle}
          activeTab={activeTab?.text || ""}
          onTabChange={handleTabChange}
          tabs={tabs}
        />

        {/* Page Content */}
        <Box sx={{
          padding: { xs: 2, md: 3 },
          overflowX: "hidden",
          // Adjust margin based on whether tabs are visible
          marginTop: tabs.length > 0
            ? { xs: "52px", md: "52px" }
            : { xs: "16px", md: "24px" }
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}