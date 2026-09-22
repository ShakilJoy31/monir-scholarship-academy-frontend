import {
  AttachMoney,
  CheckBox,
  Class,
  Home,
  LibraryAdd,
  LiveHelp,
  Logout,
  Schedule,
  School,
  MenuBook,
  Assessment,
  Schedule as ScheduleIcon,
  Payment,
} from "@mui/icons-material";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Modal,
  Typography,
  Button,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  FileText,
  FolderKanban,
  GraduationCap,
  IdCard,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  LucideSnowflake,
  LucideSunSnow,
  Settings,
  Sheet,
  ShoppingBag,
  User,
} from "lucide-react";
import { TbConfetti } from "react-icons/tb";
import {
  getUserInfoFromToken,
  removeTokenFromCookie,
} from "@/app/utils/helper/tokenHelper";
import {
  MdAccountBalance,
  MdAssignmentTurnedIn,
  MdBadge,
  MdLocalLibrary,
  MdLocalOffer,
  MdOutlineAssignment,
  MdOutlineHealthAndSafety,
  MdOutlineMedicalServices,
  MdOutlineNoteAlt,
  MdOutlineTimeline,
  MdPayments,
} from "react-icons/md";
import { BiCalendarCheck, BiSolidCategoryAlt, BiSolidIdCard, BiTimeFive } from "react-icons/bi";
import { GiBookshelf, GiBrain, GiHealthNormal, GiHeartPlus, GiMeditation } from "react-icons/gi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { SiBlockbench } from "react-icons/si";
import { GrHost } from "react-icons/gr";
import {
  RiBook2Line,
  RiChatQuoteLine,
  RiLayoutGridLine,
  RiMoneyDollarCircleLine,
  RiPrinterLine,
  RiQuestionnaireFill,
  RiTeamLine,
} from "react-icons/ri";
import { LiaSmsSolid } from "react-icons/lia";

import { IconButton } from "@mui/material";
import { X } from "lucide-react";
import { useAppDispatch } from "./../../../app/hooks/hooks";
import { clearUser } from "@/app/features/auth/authSlice";
import { FaBookBookmark, FaBookOpenReader } from "react-icons/fa6";
import {
  AiOutlineCalendar,
  AiOutlineCloudUpload,
  AiOutlineFileDone,
  AiOutlineSwap,
} from "react-icons/ai";
import {
  FaBed,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaCodeBranch,
  FaCreditCard,
  FaHandHoldingUsd,
  FaHotel,
  FaIdBadge,
  FaListUl,
  FaMoneyBillWave,
  FaRestroom,
  FaSms,
  FaUserClock,
  FaUserGraduate,
  FaUserPlus,
  FaUsers,
  FaUsersCog,
  FaUserTie,
} from "react-icons/fa";
import { TeacherProfileCard } from "./TeacherProfileCard";
import { StudentProfileCard } from "./StudentProfileCard";
import { BranchAdminProfileCard } from "./BranchAdminProfileCard";
import { SuperAdminProfileCard } from "./SuperAdminProfileCard";
import { SchoolAdminProfileCard } from "./SchoolAdminProfileCard";

// Define types for roles and menu items
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

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: MenuItem, index: number) => void;
  onTabsChange?: (tabs: MenuItem[]) => void;
}


export default function RoleBasedSidebar({
  onTabChange,
  onTabsChange }: SidebarProps) {
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [expandedParent, setExpandedParent] = useState<string | null>(null);
  const [, setExpandedSubmenus] = useState<Set<string>>(new Set());


  // The new 10-9-2025
  const [activeParentMenu, setActiveParentMenu] = useState<string | null>(null);
  const userInfo = getUserInfoFromToken();



  const handleParentMenuClick = (item: MenuItem) => {
    if (item.children && onTabsChange) {
      console.log("handleParentMenuClick", item)
      // Set the active parent menu
      setActiveParentMenu(item.text);
      // Also expand the parent in sidebar
      setExpandedParent(item.text);

      // Pass the full children objects instead of just text
      onTabsChange(item.children);

      // Set the first child as active tab by default
      if (item.children.length > 0 && onTabChange) {
        onTabChange(item.children[0], 0);

        // Navigate to the first child's link
        if (item.children[0].link !== "#") {
          router.push(item.children[0].link);
        }
      }
    } else if (onTabsChange) {
      // If it's not a parent menu with children, reset tabs
      setActiveParentMenu(null);
      setExpandedParent(null);
      onTabsChange([]);
    }
  };




  const handleToggleParent = (text: string) => {
    const item = filteredMenuItems.find(item => item.text === text);
    if (item) {
      handleParentMenuClick(item);
    }
    setExpandedParent((prev) => (prev === text ? null : text));
  };


  const getCurrentRole = (): UserRole => {
    if (pathname.startsWith("/super-admin")) return "super-admin";
    if (pathname.startsWith("/school-admin")) return "school-admin";
    if (pathname.startsWith("/branch-admin")) return "branch-admin";
    if (pathname.startsWith("/teacher")) return "teacher";
    if (pathname.startsWith("/student")) return "student";
    return "super-admin";
  };

  const isActive = (item: MenuItem) => {
    if (item.exact) {
      return pathname === item.link;
    }
    return pathname.startsWith(item.link);
  };

  const handleToggleSubmenu = (text: string) => {
    setExpandedSubmenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(text)) {
        newSet.delete(text);
      } else {
        newSet.add(text);
      }
      return newSet;
    });
  };

  const handleLogout = () => {
    removeTokenFromCookie();
    dispatch(clearUser());
    router.push("/");
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isParent = !!item.children;
    const active = isActive(item);
    const isActiveParent = activeParentMenu === item.text;

    return (
      <Box key={`${item.link}-${item.text}`}>
        <ListItem sx={{ py: 0.5, pl: depth * 2 }}>
          <motion.div
            whileHover={{ x: 8 }}
            whileTap={{ x: 4 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            style={{ width: "100%" }}
          >
            <ListItemButton
              component={isParent ? "div" : Link}
              href={isParent ? "#" : item.link}
              onClick={() => {
                if (isParent && depth === 0) {
                  handleToggleParent(item.text);
                } else if (isParent && depth > 0) {
                  handleToggleSubmenu(item.text);
                }
              }}
              sx={{
                px: 1,
                borderRadius: "4px",
                backgroundColor: active || isActiveParent ? "white" : "",
                color: active || isActiveParent ? "black" : "white",
                textDecoration: "none",
                height: '30px',
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  backgroundColor: active || isActiveParent ? "white" : "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              {/* Hover border animation - left side */}
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                whileHover={{ width: 4, opacity: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: "black",
                  borderRadius: "2px 0 0 2px",
                }}
              />

              <ListItemIcon
                sx={{
                  color: active || isActiveParent ? "black" : "white",
                  minWidth: "36px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.text}
                sx={{
                  position: "relative",
                  zIndex: 1,
                  "& .MuiTypography-root": {
                    fontSize: "0.875rem",
                    fontWeight: isParent ? 600 : "normal",
                  },
                }}
              />

              {/* Click animation effect */}
              <motion.div
                initial={{ scale: 1, opacity: 0 }}
                whileTap={{
                  scale: 0.97,
                  transition: { duration: 0.1 }
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "4px",
                  zIndex: 0,
                }}
              />
            </ListItemButton>
          </motion.div>
        </ListItem>
      </Box>
    );
  };

  // Filter menu items based on role
  const getFilteredMenuItems = (role: UserRole): MenuItem[] => {
    const menuItems: MenuItem[] = [
      // Super Admin
      {
        text: "Profile",
        icon: <BiSolidIdCard className="text-2xl" />,
        link: `/super-admin/pages/super-admin-profile/${userInfo?.id}`,
        roles: ["super-admin"],
      },
      {
        text: "Dashboard",
        icon: <Home />,
        link: "/super-admin/pages/dashboard",
        roles: ["super-admin"],
        exact: true,
      },
      {
        text: "School List",
        icon: <LibraryAdd />,
        link: "/super-admin/pages/created-school-list",
        roles: ["super-admin"],
      },
      {
        text: "Change Password",
        icon: <LibraryAdd />,
        link: "/super-admin/pages/change-password",
        roles: ["super-admin"],
      },


      // School Admin
      {
        text: "Profile",
        icon: <BiSolidIdCard className="text-2xl" />,
        link: `/school-admin/pages/school-profile/${userInfo?.id}`,
        roles: ["school-admin"],
      },
      {
        text: "Dashboard",
        icon: <Home />,
        link: "/school-admin/pages/dashboard",
        roles: ["school-admin"],
        exact: true,
      },
      {
        text: "Branch List",
        icon: <LibraryAdd />,
        link: "/school-admin/pages/create-branch",
        roles: ["school-admin"],
      },
      {
        text: "Branch Admin List",
        icon: <User />,
        link: "/school-admin/pages/create-user",
        roles: ["school-admin"],
      },
      {
        text: "Change Password",
        icon: <LibraryAdd />,
        link: '/school-admin/pages/change-password',
        roles: ["school-admin"],
      },


      // Branch Admin
      {
        text: "Profile",
        icon: <BiSolidIdCard className="text-2xl" />,
        link: `/branch-admin/pages/branch-admin-profile/${userInfo?.id}`,
        roles: ["branch-admin"],
      },
      {
        text: "Dashboard",
        icon: <Home />,
        link: "/branch-admin/pages/dashboard",
        roles: ["branch-admin"],
        exact: true,
      },
      {
        text: "Academic Management",
        icon: <MenuBook />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Session",
            icon: <Schedule />,
            link: "/branch-admin/pages/session",
            roles: ["branch-admin"],
          },
          {
            text: "Class",
            icon: <Class />,
            link: "/branch-admin/pages/classes",
            roles: ["branch-admin"],
          },
          {
            text: "Admit Card",
            icon: <LibraryAdd />,
            link: "/branch-admin/pages/admit-card",
            roles: ["branch-admin"],
          },
          {
            text: "Seat Plan",
            icon: <SiBlockbench className="text-2xl" />,
            link: "/branch-admin/pages/seat-plan",
            roles: ["branch-admin"],
          },
          {
            text: "Testimonial",
            icon: <RiChatQuoteLine className="text-2xl" />,
            link: "/branch-admin/pages/testimonial",
            roles: ["branch-admin"],
          },
          {
            text: "Transfer Certificate",
            icon: <AiOutlineFileDone className="text-2xl" />,
            link: "/branch-admin/pages/transfer-certificate",
            roles: ["branch-admin"],
          },
          {
            text: "Studnet Badge",
            icon: <IdCard />,
            link: "/branch-admin/pages/student-badge",
            roles: ["branch-admin"],
          },
          {
            text: "Subject",
            icon: <FaBookOpenReader className="text-2xl" />,
            link: "/branch-admin/pages/subjects",
            roles: ["branch-admin"],
          },
          {
            text: "Group",
            icon: <RiTeamLine className="text-2xl" />,
            link: "/branch-admin/pages/groups",
            roles: ["branch-admin"],
          },
          {
            text: "Section",
            icon: <RiLayoutGridLine className="text-2xl" />,
            link: "/branch-admin/pages/sections",
            roles: ["branch-admin"],
          },
          {
            text: "Stream",
            icon: <FaCodeBranch className="text-2xl" />,
            link: "/branch-admin/pages/stream",
            roles: ["branch-admin"],
          },
        ],
      },
      {
        text: "Admission",
        icon: <FaUserPlus className="text-2xl" />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Admission Period",
            icon: <AiOutlineCalendar className="text-2xl" />,
            link: "/branch-admin/pages/admission-period",
            roles: ["branch-admin"],
          },
          {
            text: "Online Admission",
            icon: <AiOutlineCloudUpload className="text-2xl" />,
            link: "/branch-admin/pages/online-admission",
            roles: ["branch-admin"],
          },
          {
            text: "Unpaid Admission Fee",
            icon: <FaMoneyBillWave className="text-2xl" />,
            link: "/branch-admin/pages/admission-online-fee",
            roles: ["branch-admin"],
          },
          {
            text: "Admission Pay List",
            icon: <FaListUl className="text-2xl" />,
            link: "/branch-admin/pages/pay-admission-list",
            roles: ["branch-admin"],
          },
        ],
      },
      {
        text: "Account Management",
        icon: <MdAccountBalance className="text-2xl" />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Account",
            icon: <LibraryAdd />,
            link: "/branch-admin/pages/account-management",
            roles: ["branch-admin"],
          },
          {
            text: "Balance Transfer",
            icon: <LibraryAdd />,
            link: "/branch-admin/pages/balance-transfer",
            roles: ["branch-admin"],
          },
        ],
      },
      {
        text: "Designation",
        icon: <FaIdBadge className="text-2xl" />,
        link: "/branch-admin/pages/designation",
        roles: ["branch-admin"],
        children: [
          {
            text: "",
            icon: <School />,
            link: "/branch-admin/pages/designation",
            roles: ["branch-admin"],
          },
        ]
      },
      {
        text: "Teacher",
        icon: <School />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Assign Teacher",
            icon: <School />,
            link: "/branch-admin/pages/assign-teacher",
            roles: ["branch-admin"],
          },
          {
            text: "Teachers",
            icon: <FaChalkboardTeacher className="text-2xl" />,
            link: "/branch-admin/pages/teacher-list",
            roles: ["branch-admin"],
          },
          {
            text: "Teacher Id Card",
            icon: <MdBadge className="text-2xl" />,
            link: "/branch-admin/pages/teacher-id-card",
            roles: ["branch-admin"],
          },
          {
            text: "Teacher Salary Pay",
            icon: <FaMoneyBillWave className="text-2xl" />,
            link: "/branch-admin/pages/teacher-salary-pay",
            roles: ["branch-admin"],
          },
          {
            text: "Teacher Salary",
            icon: <FaHandHoldingUsd className="text-2xl" />,
            link: "/branch-admin/pages/provide-teacher-salary",
            roles: ["branch-admin"],
          },
          {
            text: "Salary Assign",
            icon: <MdAssignmentTurnedIn className="text-2xl" />,
            link: "/branch-admin/pages/create-teacher-salary-assign",
            roles: ["branch-admin"],
          },
          {
            text: "Salary Advance",
            icon: <FaMoneyBillWave className="text-2xl" />,
            link: "/branch-admin/pages/created-teacher-salary-advance",
            roles: ["branch-admin"],
          },
        ],
      },
      {
        text: "Faculty Management",
        icon: <FaChalkboardTeacher className="text-2xl" />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Staff Management",
            icon: <FaUserTie className="text-2xl" />,
            link: "/branch-admin/pages/staff-management",
            roles: ["branch-admin"],
          },
          {
            text: "Committee Management",
            icon: <FaUsersCog className="text-2xl" />,
            link: "/branch-admin/pages/committe-management",
            roles: ["branch-admin"],
          },
        ],
      },
      {
        text: "Student Management",
        icon: <FaUsers className="text-2xl" />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Students",
            icon: <RiTeamLine className="text-2xl" />,
            link: "/branch-admin/pages/student-list",
            roles: ["branch-admin"],
          },
          {
            text: "Top Students",
            icon: <RiTeamLine className="text-2xl" />,
            link: "/branch-admin/pages/top-student-list",
            roles: ["branch-admin"],
          },
          {
            text: "Migration",
            icon: <AiOutlineSwap className="text-3xl" />,
            link: "/branch-admin/pages/student-migration",
            roles: ["branch-admin"],
          },
          {
            text: "Student Id Card",
            icon: <BiSolidIdCard className="text-2xl" />,
            link: "/branch-admin/pages/student-id-card-list",
            roles: ["branch-admin"],
          },
        ],
      },
        {
        text: "Routine Management",
        icon: <ScheduleIcon />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Exam Routine",
            icon: <HiOutlineDocumentText className="text-2xl" />,
            link: "/branch-admin/pages/exam-routine",
            roles: ["branch-admin"],
          },
          {
            text: "Class Routine",
            icon: <FaCalendarAlt className="text-2xl" />,
            link: "/branch-admin/pages/class-routine",
            roles: ["branch-admin"],
          },
          {
            text: "Print Exam Routine",
            icon: <RiPrinterLine className="text-2xl" />,
            link: "/branch-admin/pages/checkout-exam-routine",
            roles: ["branch-admin"],
          },
          {
            text: "Print Class Routine",
            icon: <RiPrinterLine className="text-2xl" />,
            link: "/branch-admin/pages/checkout-class-routine",
            roles: ["branch-admin"],
          },
          {
            text: "Slot Management",
            icon: <Schedule />,
            link: "/branch-admin/pages/slot",
            roles: ["branch-admin"],
          },
        ],
      },
      {
        text: "Exam Management",
        icon: <Assessment />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Exam & Notice",
            icon: <School />,
            link: "/branch-admin/pages/exams",
            roles: ["branch-admin"],
          },
        ],
      },
      {
        text: "Result Management",
        icon: <Assessment />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Subject Wise Result",
            icon: <FaCodeBranch className="text-2xl" />,
            link: "/branch-admin/pages/student-result",
            roles: ["branch-admin"],
          },
          {
            text: "Class Wise Result",
            icon: <FaCodeBranch className="text-2xl" />,
            link: "/branch-admin/pages/class-wise-result",
            roles: ["branch-admin"],
          },
          {
            text: "Upload Mark Sheet",
            icon: <Sheet />,
            link: "/branch-admin/pages/upload-mark-sheet",
            roles: ["branch-admin"],
          },
        ],
      },
      {
        text: "Payroll",
        icon: <AttachMoney className="text-2xl" />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Salary Structure",
            icon: <AttachMoney className="text-2xl" />,
            link: "/branch-admin/pages/salary-structure", 
            roles: ["branch-admin"],
          },
          {
            text: "Basic Salary",
            icon: <FaMoneyBillWave className="text-2xl" />,
            link: "/branch-admin/pages/basic-salary",
            roles: ["branch-admin"],
          },
          {
            text: "Allowances",
            icon: <RiMoneyDollarCircleLine className="text-2xl" />,
            link: "/branch-admin/pages/allowances",
            roles: ["branch-admin"],
          },
          {
            text: "Overtime",
            icon: <FaUserClock className="text-2xl" />,
            link: "/branch-admin/pages/overtime",
            roles: ["branch-admin"],
          },
          {
            text: "Bonus",
            icon: <FaHandHoldingUsd className="text-2xl" />,
            link: "/branch-admin/pages/bonus",
            roles: ["branch-admin"],
          },
          {
            text: "Deductions",
            icon: <MdLocalOffer className="text-2xl" />,
            link: "/branch-admin/pages/deductions",
            roles: ["branch-admin"],
          },
          {
            text: "Advance/Loan",
            icon: <FaCreditCard className="text-2xl" />,
            link: "/branch-admin/pages/advance-loan",
            roles: ["branch-admin"],
          },
          {
            text: "Monthly Payroll",
            icon: <AiOutlineCalendar className="text-2xl" />,
            link: "/branch-admin/pages/monthly-payroll",
            roles: ["branch-admin"],
          },
          {
            text: "Salary Payment History",
            icon: <MdOutlineTimeline className="text-2xl" />,
            link: "/branch-admin/pages/salary-payment-history",
            roles: ["branch-admin"],
          },
          {
            text: "Salary Reports",
            icon: <FileText className="text-2xl" />,
            link: "/branch-admin/pages/salary-reports",
            roles: ["branch-admin"],
          },
        ],
      },
      {
        text: "Income Management",
        icon: <RiMoneyDollarCircleLine className="text-2xl" />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Student Fees",
            icon: <FaUserGraduate className="text-2xl" />,
            link: "/branch-admin/pages/student-fees",
            roles: ["branch-admin"],
          },
          {
            text: "Therapy Fees",
            icon: <MdOutlineHealthAndSafety className="text-2xl" />,
            link: "/branch-admin/pages/therapy-fees",
            roles: ["branch-admin"],
          },
          {
            text: "Admission Fees",
            icon: <FaUserPlus className="text-2xl" />,
            link: "/branch-admin/pages/admission-fees",
            roles: ["branch-admin"],
          },
          {
            text: "Assessment Fees",
            icon: <Assessment className="text-2xl" />,
            link: "/branch-admin/pages/assessment-fees",
            roles: ["branch-admin"],
          },
          {
            text: "Training & Workshop Income",
            icon: <School className="text-2xl" />,
            link: "/branch-admin/pages/training-workshop-income",
            roles: ["branch-admin"],
          },
          {
            text: "Vocational Product Sales",
            icon: <ShoppingBag className="text-2xl" />,
            link: "/branch-admin/pages/vocational-product-sales",
            roles: ["branch-admin"],
          },
          {
            text: "Donation",
            icon: <FaHandHoldingUsd className="text-2xl" />,
            link: "/branch-admin/pages/donation",
            roles: ["branch-admin"],
          },
          {
            text: "Other Income",
            icon: <RiMoneyDollarCircleLine className="text-2xl" />,
            link: "/branch-admin/pages/other-income",
            roles: ["branch-admin"],
          },
        ],
      },

      {
        text: "Expense Management",
        icon: <Payment className="text-2xl" />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Expenses",
            icon: <LucideSnowflake />,
            link: "/branch-admin/pages/create-expense",
            roles: ["branch-admin"],
          },
          {
            text: "Expense Category",
            icon: <LucideSnowflake />,
            link: "/branch-admin/pages/expense-category",
            roles: ["branch-admin"],
          },
          {
            text: "Expense SubCategory",
            icon: <LucideSunSnow />,
            link: "/branch-admin/pages/expense-sub-category",
            roles: ["branch-admin"],
          },
          {
            text: "Expense Report",
            icon: <LucideSunSnow />,
            link: "/branch-admin/pages/expense-report",
            roles: ["branch-admin"],
          },
          {
            text: "Salary",
            icon: <AttachMoney className="text-2xl" />,
            link: "/branch-admin/pages/expense-salary",
            roles: ["branch-admin"],
          },
          {
            text: "Utilities",
            icon: <LucideSnowflake className="text-2xl" />,
            link: "/branch-admin/pages/expense-utilities",
            roles: ["branch-admin"],
          },
          {
            text: "Rent",
            icon: <FaHotel className="text-2xl" />,
            link: "/branch-admin/pages/expense-rent",
            roles: ["branch-admin"],
          },
          {
            text: "Maintenance",
            icon: <Settings className="text-2xl" />,
            link: "/branch-admin/pages/expense-maintenance",
            roles: ["branch-admin"],
          },
          {
            text: "Therapy Materials",
            icon: <MdOutlineHealthAndSafety className="text-2xl" />,
            link: "/branch-admin/pages/expense-therapy-materials",
            roles: ["branch-admin"],
          },
          {
            text: "Equipment",
            icon: <LayoutDashboard className="text-2xl" />,
            link: "/branch-admin/pages/expense-equipment",
            roles: ["branch-admin"],
          },
          {
            text: "Stationery",
            icon: <FileText className="text-2xl" />,
            link: "/branch-admin/pages/expense-stationery",
            roles: ["branch-admin"],
          },
          {
            text: "Transport",
            icon: <FaUserClock className="text-2xl" />,
            link: "/branch-admin/pages/expense-transport",
            roles: ["branch-admin"],
          },
          {
            text: "Fuel",
            icon: <GiHealthNormal className="text-2xl" />,
            link: "/branch-admin/pages/expense-fuel",
            roles: ["branch-admin"],
          },
          {
            text: "Sports",
            icon: <TbConfetti className="text-2xl" />,
            link: "/branch-admin/pages/expense-sports",
            roles: ["branch-admin"],
          },
          {
            text: "Training",
            icon: <School className="text-2xl" />,
            link: "/branch-admin/pages/expense-training",
            roles: ["branch-admin"],
          },
          {
            text: "Events",
            icon: <FaCalendarAlt className="text-2xl" />,
            link: "/branch-admin/pages/expense-events",
            roles: ["branch-admin"],
          },
          {
            text: "Vocational Activities",
            icon: <FaChalkboardTeacher className="text-2xl" />,
            link: "/branch-admin/pages/expense-vocational",
            roles: ["branch-admin"],
          },
          {
            text: "Other Expenses",
            icon: <LucideSunSnow className="text-2xl" />,
            link: "/branch-admin/pages/expense-other",
            roles: ["branch-admin"],
          },
        ],
      },
    
      {
        text: "Fees Management",
        icon: <AttachMoney />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Fee",
            icon: <FaMoneyBillWave className="text-2xl" />,
            link: "/branch-admin/pages/class-fee",
            roles: ["branch-admin"],
          },
          {
            text: "Monthly Fee Payment",
            icon: <FaCreditCard className="text-2xl" />,
            link: "/branch-admin/pages/payment-class-fee",
            roles: ["branch-admin"],
          },
          {
            text: "Monthly Fee Discount",
            icon: <MdLocalOffer className="text-2xl" />,
            link: "/branch-admin/pages/student-class-fee-discount",
            roles: ["branch-admin"],
          },
          {
            text: "Monthly Fee Assign",
            icon: <RiMoneyDollarCircleLine className="text-2xl" />,
            link: "/branch-admin/pages/students-class-fee-assign",
            roles: ["branch-admin"],
          },
          {
            text: "Exam Fee",
            icon: <FaMoneyBillWave className="text-2xl" />,
            link: "/branch-admin/pages/exam-fees",
            roles: ["branch-admin"],
          },
          {
            text: "Exam Fee Payment",
            icon: <FaCreditCard className="text-2xl" />,
            link: "/branch-admin/pages/exam-payment-fee",
            roles: ["branch-admin"],
          },
          {
            text: "Exam Fee Discount",
            icon: <MdLocalOffer className="text-2xl" />,
            link: "/branch-admin/pages/exam-class-fee-discount",
            roles: ["branch-admin"],
          },
          {
            text: "Exam Fee Assign",
            icon: <RiMoneyDollarCircleLine className="text-2xl" />,
            link: "/branch-admin/pages/assign-student-exam-fee",
            roles: ["branch-admin"],
          },
        ],
      },
      {
        text: "Library Management",
        icon: <MdLocalLibrary className="text-2xl" />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Book",
            icon: <FaBookBookmark className="text-lg" />,
            link: "/branch-admin/pages/create-book",
            roles: ["branch-admin"],
          },
          {
            text: "Category",
            icon: <BiSolidCategoryAlt className="text-2xl" />,
            link: "/branch-admin/pages/book-category",
            roles: ["branch-admin"],
          },
          {
            text: "Book Shelf",
            icon: <GiBookshelf className="text-2xl" />,
            link: "/branch-admin/pages/book-shelf",
            roles: ["branch-admin"],
          },
          {
            text: "Book Issue",
            icon: <RiBook2Line className="text-2xl" />,
            link: "/branch-admin/pages/book-issue",
            roles: ["branch-admin"],
          },
          {
            text: "Fine Book Issue",
            icon: <RiMoneyDollarCircleLine className="text-2xl" />,
            link: "/branch-admin/pages/fine-book-issue",
            roles: ["branch-admin"],
          },
        ],
      },
      {
        text: "Question",
        icon: <HiOutlineDocumentText className="text-2xl" />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Question's",
            icon: <RiQuestionnaireFill className="text-2xl" />,
            link: "/branch-admin/pages/create-question",
            roles: ["branch-admin"],
          },
        ],
      },
      {
        text: "Hostel Management",
        icon: <FaHotel className="text-2xl" />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Hostel",
            icon: <GrHost className="text-2xl" />,
            link: "/branch-admin/pages/create-hostel",
            roles: ["branch-admin"],
          },
          {
            text: "Hostel Room",
            icon: <FaRestroom className="text-2xl" />,
            link: "/branch-admin/pages/create-room",
            roles: ["branch-admin"],
          },
          {
            text: "Hostel Bed",
            icon: <FaBed className="text-2xl" />,
            link: "/branch-admin/pages/create-bed",
            roles: ["branch-admin"],
          },
          {
            text: "Hostel Resident",
            icon: <FaUserGraduate className="text-2xl" />,
            link: "/branch-admin/pages/hostel-resident",
            roles: ["branch-admin"],
          },
          {
            text: "Hostel Fee Discount",
            icon: <MdLocalOffer className="text-2xl" />,
            link: "/branch-admin/pages/hostel-fee-discount",
            roles: ["branch-admin"],
          },
          {
            text: "Hostel Fee Assign",
            icon: <RiMoneyDollarCircleLine className="text-2xl" />,
            link: "/branch-admin/pages/student-hostel-fee-assign",
            roles: ["branch-admin"],
          },
          {
            text: "Hostel Fee Pay",
            icon: <MdPayments className="text-2xl" />,
            link: "/branch-admin/pages/pay-hostel-fee",
            roles: ["branch-admin"],
          },
        ],
      },
      {
        text: "SMS Management",
        icon: <FaSms className="text-2xl" />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "SMS Template",
            icon: <LiaSmsSolid className="text-2xl" />,
            link: "/branch-admin/pages/sms-tamplete",
            roles: ["branch-admin"],
          },
        ],
      },
      {
        text: "Manage Attendance",
        icon: <FaUserClock className="text-2xl" />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Menual Attendance",
            icon: <LiaSmsSolid className="text-2xl" />,
            link: "/branch-admin/pages/menual-attendance",
            roles: ["branch-admin"],
          },
          {
            text: "Reports",
            icon: <LiaSmsSolid className="text-2xl" />,
            link: "/branch-admin/pages/reports",
            roles: ["branch-admin"],
          },
          {
            text: "Setting",
            icon: <LiaSmsSolid className="text-2xl" />,
            link: "/branch-admin/pages/setting",
            roles: ["branch-admin"],
          },
        ],
      },
      // reports
      {
        text: "Report",
        icon: <FaUserClock className="text-2xl" />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Class Fee Report",
            icon: <LiaSmsSolid className="text-2xl" />,
            link: "/branch-admin/pages/report",
            roles: ["branch-admin"],
          },
          {
            text: "Exam Fee Report",
            icon: <LiaSmsSolid className="text-2xl" />,
            link: "/branch-admin/pages/exam-report",
            roles: ["branch-admin"],
          },
          {
            text: "Hostel Fee Report",
            icon: <LiaSmsSolid className="text-2xl" />,
            link: "/branch-admin/pages/hostel-report",
            roles: ["branch-admin"],
          },
          {
            text: "Teacher Fee Report",
            icon: <LiaSmsSolid className="text-2xl" />,
            link: "/branch-admin/pages/teacher-report",
            roles: ["branch-admin"],
          },
          {
            text: "Statics Report",
            icon: <LiaSmsSolid className="text-2xl" />,
            link: "/branch-admin/pages/statics-report",
            roles: ["branch-admin"],
          },

        ],
      },

      {
        text: "Event Management",
        icon: <FaCalendarAlt className="text-2xl" />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Event",
            icon: <TbConfetti className="text-2xl" />,
            link: "/branch-admin/pages/event",
            roles: ["branch-admin"],
          },
        ],
      },
      {
        text: "Content Management",
        icon: <LibraryAdd />,
        link: "#",
        roles: ["branch-admin"],
        children: [
          {
            text: "Banner",
            icon: <LayoutDashboard />,
            link: "/branch-admin/pages/banner",
            roles: ["branch-admin"],
          },
          {
            text: "Gallery",
            icon: <ImageIcon />,
            link: "/branch-admin/pages/gallery",
            roles: ["branch-admin"],
          },
          {
            text: "Page Group",
            icon: <FolderKanban />,
            link: "/branch-admin/pages/page-group",
            roles: ["branch-admin"],
          },
          {
            text: "Page",
            icon: <FileText />,
            link: "/branch-admin/pages/page-list",
            roles: ["branch-admin"],
          },
        ],
      },
      {
        text: "Change Password",
        icon: <KeyRound />,
        link: `/branch-admin/pages/change-password`,
        roles: ["branch-admin"],
      },
      {
        text: "Branch Config",
        icon: <Settings />,
        link: `/branch-admin/pages/branch-config`,
        roles: ["branch-admin"],
      },
















      // Teacher
      {
        text: "Profile",
        icon: <BiSolidIdCard className="text-2xl" />,
        link: `/teacher/pages/teacher-profile/${userInfo?.id}`,
        roles: ["teacher"],
      },
      {
        text: "Dashboard",
        icon: <Home />,
        link: "/teacher/pages/dashboard",
        roles: ["teacher"],
        exact: true,
      },
      {
        text: "Salary",
        icon: <AttachMoney />,
        link: "/teacher/pages/teacher-salary-info",
        roles: ["teacher"],
      },
      {
        text: "Exam Management",
        icon: <Assessment />,
        link: "#",
        roles: ["teacher"],
        children: [
          {
            text: "Subject Wise Result",
            icon: <FaCodeBranch className="text-2xl" />,
            link: "/teacher/pages/teacher-view-student-result",
            roles: ["teacher"],
          },
          {
            text: "Class Wise Result",
            icon: <ClipboardList className="text-2xl" />,
            link: "/teacher/pages/teacher-class-wise-result",
            roles: ["teacher"],
          },
          {
            text: "Upload Mark Sheet",
            icon: <Sheet />,
            link: "/teacher/pages/teacher-upload-mark-sheet",
            roles: ["teacher"],
          },
        ],
      },
      {
        text: "My Classes Routine",
        icon: <Class />,
        link: "/teacher/pages/teacher-class-routine",
        roles: ["teacher"],
      },
      // {
      //   text: "Attendance",
      //   icon: <CheckBox />,
      //   link: "/teacher/attendance",
      //   roles: ["teacher"],
      // },
      {
        text: "Change Password",
        icon: <KeyRound />,
        link: '/teacher/pages/change-password',
        roles: ["teacher"],
      },























      // Student
      {
        text: "Profile",
        icon: <BiSolidIdCard className="text-2xl" />,
        link: `/student/pages/student-profile/${userInfo?.id}`,
        roles: ["student"],
      },
      {
        text: "Dashboard",
        icon: <Home />,
        link: "/student/pages/dashboard",
        roles: ["student"],
        exact: true,
      },
      {
        text: "Routine's",
        icon: <Class />,
        link: "/student/pages/routines",
        roles: ["student"],
      },
      {
        text: "My Grades",
        icon: <CheckBox />,
        link: "/student/pages/grades",
        roles: ["student"],
      },
      {
        text: "Pay Fees",
        icon: <AttachMoney />,
        link: "/student/pages/fees-payment",
        roles: ["student"],
        children: [
          {
            text: "Monthly Fee's",
            icon: <RiQuestionnaireFill className="text-2xl" />,
            link: "/student/pages/list-fees-payment",
            roles: ["student"],
          },
          {
            text: "Exam Fee's",
            icon: <RiQuestionnaireFill className="text-2xl" />,
            link: "/student/pages/list-exam-payment-fees",
            roles: ["student"],
          },
        ],
      },
      {
        text: "Study Support",
        icon: <LiveHelp />,
        link: "/student/pages/study-support",
        roles: ["student"],
      },
      {
        text: "Change Password",
        icon: <KeyRound />,
        link: '/student/pages/change-password',
        roles: ["student"],
      },
    ];

    return menuItems.filter((item) => item.roles.includes(role));
  };

  const filteredMenuItems = useMemo(() => {
    return getFilteredMenuItems(getCurrentRole());
  }, [pathname]); // Only recalculate when pathname changes

  useEffect(() => {
    if (!onTabsChange) return;

    let foundActiveParent = false;

    // Find the parent menu that contains the current path
    for (const item of filteredMenuItems) {
      if (item.children && item.children.length > 0) {
        // Check if any child matches the current path
        const matchingChild = item.children.find(child =>
          pathname === child.link || pathname.startsWith(child.link + '/')
        );

        if (matchingChild) {
          // Only update state if it's different from current state
          if (activeParentMenu !== item.text) {
            setActiveParentMenu(item.text);
          }
          if (expandedParent !== item.text) {
            setExpandedParent(item.text);
          }

          onTabsChange(item.children);

          // Set the active tab
          if (onTabChange) {
            onTabChange(matchingChild, item.children.indexOf(matchingChild));
          }

          foundActiveParent = true;
          break;
        }
      }
    }

    // If no active parent found, check if we should clear tabs
    if (!foundActiveParent && onTabsChange) {
      // IMPORTANT: Check if there's an active parent menu that was manually selected
      // If activeParentMenu is not null, it means the user clicked on a parent menu
      // So we should NOT clear the tabs
      if (activeParentMenu === null) {
        // Only clear tabs if there are no parent menus at all
        const hasAnyParent = filteredMenuItems.some(item =>
          item.children && item.children.length > 0
        );

        if (!hasAnyParent) {
          setActiveParentMenu(null);
          setExpandedParent(null);
          onTabsChange([]);
        }
      }
      // If activeParentMenu is not null, we keep the tabs
      // This preserves the tabs when the user manually selected a parent
    }
  }, [pathname, filteredMenuItems, activeParentMenu]);


  return (
    <Box
      sx={{
        width: 280,
        height: "100vh",
        backgroundColor: "#1A3C34",
        color: "#fff",
        position: "fixed",
        top: 0,
        left: 0,
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flexGrow: 1, overflowY: 'auto', scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {(userInfo?.role === "STUDENT") && (
          <div className="p-2">
            <StudentProfileCard />
          </div>
        )}

        {(userInfo?.role === "TEACHER") && (
          <div className="p-2">
            <TeacherProfileCard />
          </div>
        )}

        {(userInfo?.role === "ADMIN") && (
          <div className="p-2">
            <BranchAdminProfileCard />
          </div>
        )}

        {(userInfo?.role === "SUPER_ADMIN") && (
          <div className="p-2">
            <SuperAdminProfileCard />
          </div>
        )}

        {(userInfo?.role === "SCHOOL") && (
          <div className="p-2">
            <SchoolAdminProfileCard />
          </div>
        )}

        {/* Scrollable menu items container */}
        <Box
          sx={{
            flexGrow: 1,

            display: "flex",
            marginLeft: '10px',
            flexDirection: "column",
          }}
        >
          <List>{filteredMenuItems.map((item) => renderMenuItem(item, 0))}</List>
        </Box>

        {/* Fixed logout button at bottom */}

      </Box>

      <Box sx={{
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        backgroundColor: "#1A3C34",
      }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setOpenLogoutModal(true)}
              sx={{
                textDecoration: "none",
                color: "white",
                backgroundColor: "#d32f2f",
                "&:hover": {
                  backgroundColor: "red",
                  color: "white",
                  "& .MuiListItemIcon-root": {
                    color: "white",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Fixed logout button at bottom */}
      <AnimatePresence>
        {openLogoutModal && (
          <Modal
            open={openLogoutModal}
            onClose={() => setOpenLogoutModal(false)}
            closeAfterTransition
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.3,
              }}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                position: "relative",
                padding: "1.5rem",
                borderRadius: "6px",
                outline: "none",
                width: "480px",
                maxWidth: "95%",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: `
              linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,252,251,0.98)),
              radial-gradient(circle at top left, rgba(220,38,38,0.03), transparent 60%)
            `,
              }}
            >
              {/* Floating close button */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: "absolute",
                  top: "-12px",
                  right: "-12px",
                  zIndex: 1,
                }}
              >
                <IconButton
                  onClick={() => setOpenLogoutModal(false)}
                  sx={{
                    backgroundColor: "#DC2626",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
                    "&:hover": {
                      backgroundColor: "#B91C1C",
                    },
                  }}
                >
                  <X size={18} />
                </IconButton>
              </motion.div>

              {/* Header with decorative accent */}
              <Box sx={{ position: "relative", mb: 2 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: "#DC2626",
                    position: "relative",
                    display: "inline-block",
                    "&:after": {
                      content: '""',
                      position: "absolute",
                      bottom: "-8px",
                      left: 0,
                      width: "48px",
                      height: "4px",
                      background:
                        "linear-gradient(90deg, #DC2626, rgba(220,38,38,0.3))",
                      borderRadius: "2px",
                    },
                  }}
                >
                  Confirm Logout
                </Typography>
              </Box>

              {/* Description */}
              <Typography
                variant="body1"
                sx={{ mb: 2, color: "text.secondary" }}
              >
                Are you sure you want to logout?
              </Typography>

              {/* Warning note */}
              <Box
                sx={{
                  backgroundColor: "rgba(220, 38, 38, 0.05)",
                  borderLeft: "3px solid #DC2626",
                  p: 2,
                  mb: 3,
                  borderRadius: "0 4px 4px 0",
                }}
              >
                <Typography variant="body2" sx={{ color: "#DC2626" }}>
                  You&apos;ll need to log back in to access your account.
                </Typography>
              </Box>

              {/* Action buttons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2,
                  position: "relative",
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setOpenLogoutModal(false)}
                    sx={{
                      color: "#1A3C34",
                      borderColor: "rgba(26,60,52,0.3)",
                      borderRadius: "6px",
                      px: 3,
                      py: 1,
                      fontWeight: 500,
                      "&:hover": {
                        borderColor: "#1A3C34",
                        backgroundColor: "rgba(26, 60, 52, 0.04)",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    onClick={handleLogout}
                    sx={{
                      backgroundColor: "#DC2626",
                      borderRadius: "6px",
                      px: 3,
                      py: 1,
                      fontWeight: 500,
                      boxShadow: "0 4px 16px rgba(220, 38, 38, 0.3)",
                      "&:hover": {
                        backgroundColor: "#B91C1C",
                        boxShadow: "0 6px 20px rgba(220, 38, 38, 0.4)",
                      },
                    }}
                  >
                    Logout
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>




    </Box>
  );
}
