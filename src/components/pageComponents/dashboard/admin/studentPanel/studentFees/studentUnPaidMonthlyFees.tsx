"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Modal,
  Button,
} from "@mui/material";
import { MoreVertical, X } from "lucide-react";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { useGetUnpaidClassFeeAssignsByTeacherQuery } from "@/app/store/api/classes/classFeeApi";
import { AnimatePresence, motion } from "framer-motion";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import CancelButton from "@/components/shared/reusable-component/CancelButton";


interface ClassFeeAssign {
  id: number;
  month: string;
  year: string;
  classFee: number;
  discountType: string;
  discount: number;
  netPayable: number;
  status: string;
  paidAt: string | null;
  note: string | null;
  student?: {
    id: number;
    name: string;
    classRoll: number;
    class: {
      name: string;
    };
    section: {
      name: string;
    };
    stream: {
      name: string;
    };
    session: {
      name: string;
    };
  };
  [key: string]: unknown;
}

const StudentUnPaidMonthlyFees = () => {
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [assignToView, setAssignToView] = useState<ClassFeeAssign | null>(null);
  
  const userInfo = getUserInfoFromToken();
  const studentId = userInfo?.id;
  console.log(studentId)

  // Fetch paid fee assignments for the logged-in student
 const {
  data: responseData,
  isLoading,
  isError,
} = useGetUnpaidClassFeeAssignsByTeacherQuery(studentId || 0, { skip: !studentId });

  const paidFeeAssigns: ClassFeeAssign[] = responseData?.data || [];

  const columns = [
    {
      key: "serial",
      header: "SL.",
      render: (_row: ClassFeeAssign, index?: number) =>
        index !== undefined ? index + 1 : "",
    },
    {
      key: "month",
      header: "Month",
    },
    {
      key: "year",
      header: "Year",
    },
    {
      key: "classFee",
      header: "Class Fee",
      render: (row: ClassFeeAssign) => `৳ ${row.classFee}`,
    },
    {
      key: "discount",
      header: "Discount",
      render: (row: ClassFeeAssign) =>
        row.discountType === "Percentage"
          ? `${row.discount}%`
          : `৳ ${row.discount}`,
    },
    {
      key: "netPayable",
      header: "Net Payable",
      render: (row: ClassFeeAssign) => `৳ ${row.netPayable}`,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: ClassFeeAssign) => {
        return (
          <Box sx={{ display: "flex", justifyContent: "flex-center" }}>
            <Tooltip
              title={
                <Paper
                  elevation={3}
                  sx={{
                    backgroundColor: "white",
                    padding: "8px 0",
                    borderRadius: "8px",
                    display: "grid",
                    gap: "4px",
                    minWidth: "120px",
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Button
                    onClick={() => {
                      setAssignToView(row);
                      setViewModalOpen(true);
                      setOpenMenuId(null);
                    }}
                    size="small"
                    sx={{
                      color: "#0369a1",
                      textTransform: "none",
                      fontSize: "14px",
                      fontWeight: 400,
                      justifyContent: "flex-start",
                      padding: "6px 16px",
                      "&:hover": {
                        backgroundColor: "rgba(3, 105, 161, 0.08)",
                      },
                    }}
                  >
                    View
                  </Button>
                </Paper>
              }
              placement="bottom-end"
              open={openMenuId === row.id}
              onOpen={() => setOpenMenuId(row.id)}
              onClose={() => setOpenMenuId(null)}
              disableFocusListener
              disableHoverListener
              disableTouchListener
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: "transparent",
                    padding: 0,
                    boxShadow: "none",
                  },
                },
              }}
              PopperProps={{
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, -10],
                    },
                  },
                ],
              }}
            >
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === row.id ? null : row.id);
                }}
                sx={{
                  color: "#64748B",
                  p: 1,
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "rgba(100, 116, 139, 0.1)",
                  },
                }}
              >
                <MoreVertical size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <PageHeader
        title="My UnPaid Fees"
      />

      {/* View Assignment Modal */}
      <AnimatePresence>
        {viewModalOpen && assignToView && (
          <Modal
            open={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
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
                position: "relative",
                padding: "2rem",
                borderRadius: "6px",
                outline: "none",
                width: "480px",
                maxWidth: "95%",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                background: `
                  linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,252,251,0.98)),
                  radial-gradient(circle at top left, rgba(26,60,52,0.03), transparent 60%)
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
                  onClick={() => setViewModalOpen(false)}
                  sx={{
                    backgroundColor: "#1A3C34",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(26, 60, 52, 0.2)",
                    "&:hover": {
                      backgroundColor: "#0F2922",
                    },
                  }}
                >
                  <X size={18} />
                </IconButton>
              </motion.div>

              {/* Header with decorative accent */}
              <Box sx={{ position: "relative", mb: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: "#1A3C34",
                    position: "relative",
                    display: "inline-block",
                    "&:after": {
                      content: '""',
                      position: "absolute",
                      bottom: "-8px",
                      left: 0,
                      width: "48px",
                      height: "4px",
                      background: "linear-gradient(90deg, #1A3C34, rgba(26,60,52,0.3))",
                      borderRadius: "2px",
                    },
                  }}
                >
                  Fee Payment Details
                </Typography>
              </Box>

              {/* Content */}
              <Box sx={{ display: "grid", gap: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Month:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {assignToView.month || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Year:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {assignToView.year || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Class Fee:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {`৳ ${assignToView.classFee || 0}`}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Discount:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {assignToView.discountType === "Percentage"
                      ? `${assignToView.discount}%`
                      : `৳ ${assignToView.discount}`}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Net Payable:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {`৳ ${assignToView.netPayable || 0}`}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Status:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {assignToView.status || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Paid Date:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {assignToView.paidAt
                      ? new Date(assignToView.paidAt).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                </Box>
              </Box>

              {/* Close button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                <CancelButton
                  onClick={() => setViewModalOpen(false)}
                 
                >
                  Close
                </CancelButton>
              </Box>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load paid fee history
          </Alert>
        ) : paidFeeAssigns.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No paid fees found in your history.
          </Typography>
        ) : (
          <ReusableTable<ClassFeeAssign>
            columns={columns}
            data={paidFeeAssigns}
          />
        )}
      </Paper>
    </Box>
  );
};

export default StudentUnPaidMonthlyFees;