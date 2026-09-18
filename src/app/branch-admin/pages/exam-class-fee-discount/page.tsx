"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Modal,
  Tooltip,
} from "@mui/material";
import { Plus, MoreVertical, X } from "lucide-react";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import { ClassFeeDiscountFormValues } from "@/app/super-admin/schemas/studentClassDiscount";
import { AnimatePresence, motion } from "framer-motion";
import { useCreateExamFeeDiscountMutation, useDeleteExamFeeDiscountMutation, useGetAllExamFeeDiscountsQuery, useUpdateExamFeeDiscountMutation } from "@/app/store/api/exams/examFeeDiscountApi";
import AddEditExamFeeDiscount from "@/components/pageComponents/dashboard/admin/exam/AddEditExamFeeDiscount";
import CancelButton from "@/components/shared/reusable-component/CancelButton";

interface ClassFeeDiscount extends ClassFeeDiscountFormValues {
  id: number;
  studentName: string;
  className: string;
  sectionName: string;
  streamName: string;
  sessionYear: string;
  [key: string]: unknown;
  student?: {
    id: number;
    name: string;
    session: {
      id: number;
      name: string;
    };
    class: {
      name: string;
    };
    classRoll: string;
    section: {
      name: string;
    };
    stream: {
      name: string;
    };
  };
}

interface ApiResponse {
  data?: ClassFeeDiscount[];
}

const StudentExamFeeDiscount = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [discountToDelete, setDiscountToDelete] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [discountToView, setDiscountToView] = useState<ClassFeeDiscount | null>(
    null
  );
  const [currentDiscount, setCurrentDiscount] = useState<{
    id: number | null;
    data: ClassFeeDiscountFormValues;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [ , setFilters] = useState({
    sessionYear: "",
    className: "",
    sectionName: "",
    streamName: "",
  });

  // Fetch class fee discounts data
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllExamFeeDiscountsQuery({});

  const classFeeDiscounts: ClassFeeDiscount[] = Array.isArray(responseData)
    ? responseData
    : (responseData as ApiResponse)?.data || [];

  const [createDiscount, { isLoading: createLoading }] =
    useCreateExamFeeDiscountMutation();
  const [updateDiscount, { isLoading: updateLoading }] =
    useUpdateExamFeeDiscountMutation();
  const [deleteDiscount, { data: deleteData }] =
    useDeleteExamFeeDiscountMutation();

  const handleOpenModal = (discount: ClassFeeDiscount | null = null) => {
    if (discount) {
      setCurrentDiscount({
        id: discount.id,
        data: {
          studentId: discount.studentId,
          discountType: discount.discountType,
          discount: discount.discount,
          image: discount.image || "",
          note: discount.note || "",
        },
      });

      if (discount.student) {
        setFilters({
          sessionYear: discount.student.session?.name || "",
          className: discount.student.class?.name || "",
          sectionName: discount.student.section?.name || "",
          streamName: discount.student.stream?.name || "",
        });
      }
    } else {
      setCurrentDiscount(null);
      setFilters({
        sessionYear: "",
        className: "",
        sectionName: "",
        streamName: "",
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentDiscount(null);
    setError(null);
    setFilters({
      sessionYear: "",
      className: "",
      sectionName: "",
      streamName: "",
    });
  };

  const handleSubmit = async (data: ClassFeeDiscountFormValues) => {
    try {
      if (currentDiscount?.id) {
        await updateDiscount({ id: currentDiscount.id, ...data }).unwrap();
        toastShowing(
          "Class fee discount updated successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      } else {
        await createDiscount(data).unwrap();
        toastShowing(
          "Class fee discount created successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        (err as Error).message ||
        "An error occurred";

      toastShowing(errorMessage, "bottom-right", 2000, "red", "white");
      setError(errorMessage);
      console.error("Error saving class fee discount:", err);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDiscountToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!discountToDelete) return;

    try {
      setIsDeleting(true);
      await deleteDiscount(discountToDelete).unwrap();
      toastShowing(
        deleteData?.message || "Class fee discount deleted",
        "bottom-right",
        2000,
        "green",
        "white"
      );
      refetch();
    } catch (err) {
      toastShowing(
        "Failed to delete class fee discount",
        "bottom-right",
        2000,
        "red",
        "white"
      );
      console.error("Error deleting class fee discount:", err);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setDiscountToDelete(null);
    }
  };

  const columns = [
    {
      key: "serial",
      header: "SL.",
      render: (_row: ClassFeeDiscount, index?: number) =>
        index !== undefined ? index + 1 : "",
    },
    {
      key: "studentName",
      header: "Student Name",
      render: (row: ClassFeeDiscount) => row.student?.name || "N/A",
    },
    {
      key: "className",
      header: "Class",
      render: (row: ClassFeeDiscount) => row.student?.class.name || "N/A",
    },
    {
      key: "classRoll",
      header: "Roll",
      render: (row: ClassFeeDiscount) => row.student?.classRoll || "N/A",
    },
    {
      key: "sessionYear",
      header: "Session Year",
      render: (row: ClassFeeDiscount) => row.student?.session.name || "N/A",
    },
    {
      key: "sectionName",
      header: "Section",
      render: (row: ClassFeeDiscount) => row.student?.section.name || "N/A",
    },
    {
      key: "streamName",
      header: "Stream",
      render: (row: ClassFeeDiscount) => row.student?.stream.name || "N/A",
    },
    {
      key: "discountType",
      header: "Type",
    },
    {
      key: "discount",
      header: "Discount",
      render: (row: ClassFeeDiscount) =>
        row.discountType === "Percentage"
          ? `${row.discount}%`
          : `৳${row.discount}`,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: ClassFeeDiscount) => {
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
                      setDiscountToView(row);
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

                  <Button
                    onClick={() => {
                      handleOpenModal(row);
                      setOpenMenuId(null);
                    }}
                    size="small"
                    sx={{
                      color: "#035140",
                      textTransform: "none",
                      fontSize: "14px",
                      fontWeight: 400,
                      justifyContent: "flex-start",
                      padding: "6px 16px",
                      "&:hover": {
                        backgroundColor: "rgba(3, 81, 64, 0.08)",
                      },
                    }}
                  >
                    Edit
                  </Button>

                  <Button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleDeleteClick(row.id);
                      setOpenMenuId(null);
                    }}
                    size="small"
                    disabled={isDeleting && discountToDelete === row.id}
                    sx={{
                      color: "#EF4444",
                      textTransform: "none",
                      fontSize: "14px",
                      fontWeight: 400,
                      justifyContent: "flex-start",
                      padding: "6px 16px",
                      "&:hover": {
                        backgroundColor: "rgba(239, 68, 68, 0.08)",
                      },
                      "&.Mui-disabled": {
                        color: "rgba(239, 68, 68, 0.5)",
                      },
                    }}
                  >
                    {isDeleting && discountToDelete === row.id ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <CircularProgress
                          size={14}
                          thickness={5}
                          color="inherit"
                        />
                        Deleting...
                      </Box>
                    ) : (
                      "Delete"
                    )}
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
        title="Exam Fee Discounts"
        buttonText="Add Discount"
        buttonIcon={<Plus size={20} />}
        onButtonClick={() => handleOpenModal()}
      />

      <AddEditExamFeeDiscount
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentDiscount}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={
          currentDiscount?.id
            ? "Edit Exam Fee Discount"
            : "Add Exam Fee Discount"
        }
      />

      {/* View Discount Modal */}
      <AnimatePresence>
        {viewModalOpen && discountToView && (
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
                      background:
                        "linear-gradient(90deg, #1A3C34, rgba(26,60,52,0.3))",
                      borderRadius: "2px",
                    },
                  }}
                >
                  Class Fee Discount Details
                </Typography>
              </Box>

              {/* Content - using exact same layout as example */}
              <Box sx={{ display: "grid", gap: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Student Name:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {discountToView.student?.name || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Class:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {discountToView.student?.class.name || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Class Roll:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {discountToView.student?.classRoll || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Session Year:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {discountToView.student?.session.name || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Section:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {discountToView.student?.section.name || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Stream:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {discountToView.student?.stream.name || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Discount Type:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {discountToView.discountType}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Discount:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {discountToView.discountType === "Percentage"
                      ? `${discountToView.discount}%`
                      : `৳${discountToView.discount}`}
                  </Typography>
                </Box>

                {discountToView.note && (
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body1" color="textSecondary">
                      Note:
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {discountToView.note}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Close button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                <CancelButton
                  onClick={() => setViewModalOpen(false)}
                  sx={{
                    backgroundColor: "#1A3C34",
                    borderRadius: "6px",
                    px: 3,
                    py: 1,
                    fontWeight: 500,
                    boxShadow: "0 4px 16px rgba(26, 60, 52, 0.3)",
                    "&:hover": {
                      backgroundColor: "#0F2922",
                      boxShadow: "0 6px 20px rgba(26, 60, 52, 0.4)",
                    },
                  }}
                >
                  Close
                </CancelButton>
              </Box>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Class Fee Discount"
        description="Are you sure you want to delete this class fee discount? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load class fee discounts
          </Alert>
        ) : classFeeDiscounts.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No class fee discounts found. Click Add New Discount to create one.
          </Typography>
        ) : (
          <ReusableTable<ClassFeeDiscount>
            columns={columns}
            data={classFeeDiscounts}
          />
        )}
      </Paper>
    </Box>
  );
};

export default StudentExamFeeDiscount;