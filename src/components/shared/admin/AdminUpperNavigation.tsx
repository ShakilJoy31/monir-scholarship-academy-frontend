"use client";

import { Menu as MenuIcon } from "@mui/icons-material";
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
} from "@mui/material";
import ScrollableTabs from "./ScrollableTabs";

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

interface AdminUpperNavigationProps {
  onMenuClick: () => void;
  activeTab?: string;
  onTabChange?: (tab: MenuItem, index: number) => void;
  tabs?: MenuItem[];
}

export default function AdminUpperNavigation({
  onMenuClick,
  activeTab,
  onTabChange,
  tabs = []
}: AdminUpperNavigationProps) {
  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#F9FAFB",
          color: "#1A3C34",
          boxShadow: "none",
          borderBottom: "1px solid #E0E0E0",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: { xs: '100%', md: `calc(100% - 280px)` },
          ml: { xs: 0, md: '280px' },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 1, sm: 2 },
            minHeight: "64px !important",
          }}
        >
          {/* Menu button and Tabs container */}
          <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onMenuClick}
              sx={{
                display: { md: "none" },
                mr: { xs: 1, sm: 2 },
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Tabs section - takes remaining space */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <ScrollableTabs
                tabs={tabs}
                activeTab={activeTab || ""}
                onChange={onTabChange || (() => { })}
              />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Add spacer to push content down */}
      {/* <Toolbar sx={{ minHeight: "64px !important" }} /> */}
    </>
  );
}