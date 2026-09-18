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
import { AnimatePresence, motion } from "framer-motion";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { useGetAllExamsQuery } from "@/app/store/api/classes/examApi";
import { ExamFeeAssignFormValues } from "@/app/super-admin/schemas/examFees/examFeeAssignSchema";
import { useCreateBulkExamFeeAssignMutation, useCreateExamFeeAssignMutation, useDeleteExamFeeAssignMutation, useGetAllExamFeeAssignsQuery, useUpdateExamFeeAssignMutation } from "@/app/store/api/exams/examFeeDiscountApi";
import { useGetAllExamFeesQuery } from "@/app/store/api/classes/examFeesApi";
import AddEditStudentExamFeeAssign from "@/components/pageComponents/dashboard/admin/exam/AddEditStudentExamFeeAssign";
import AddBulkExamFeeAssign from "@/components/pageComponents/dashboard/admin/exam/AddBulkExamFeeAssign";

interface ExamFeeAssign extends ExamFeeAssignFormValues {
  id: number;
  status: string;
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
    discountType: string;
  };
  exam?: {
    id: number;
    name: string;
  };
  examFee?: {
    id: number;
    name: string;
    amount: number;
    discountType: string;
  };
  [key: string]: unknown;
}

const StudentExamFeeAssign = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [assignToDelete, setAssignToDelete] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [assignToView, setAssignToView] = useState<ExamFeeAssign | null>(null);
  const [currentAssign, setCurrentAssign] = useState<{
    id: number | null;
    data: ExamFeeAssignFormValues;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [, setFilters] = useState({
    sessionYear: "",
    className: "",
    sectionName: "",
    stream: "",
  });
  const [bulkModalOpen, setBulkModalOpen] = useState<boolean>(false);

  // Fetch exam fee assignments data
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllExamFeeAssignsQuery({ page: 1, size: 10, search: "" });

  // Fetch dropdown options
  const { data: exams } = useGetAllExamsQuery({});
  const { data: examFees } = useGetAllExamFeesQuery({});
  const [createBulkAssign] =
      useCreateBulkExamFeeAssignMutation();

  const examFeeAssigns: ExamFeeAssign[] = responseData?.data || [];

  const [createAssign, { isLoading: createLoading }] =
    useCreateExamFeeAssignMutation();
  const [updateAssign, { isLoading: updateLoading }] =
    useUpdateExamFeeAssignMutation();
  const [deleteAssign, { data: deleteData }] =
    useDeleteExamFeeAssignMutation();

  const handleOpenModal = (assign: ExamFeeAssign | null = null) => {
    if (assign) {
      setCurrentAssign({
        id: assign.id,
        data: {
          studentId: assign.studentId,
          examId: assign.examId,
          examFeeId: assign.examFeeId,
        },
      });

      if (assign.student) {
        setFilters({
          sessionYear: assign.student.session?.name || "",
          className: assign.student.class?.name || "",
          sectionName: assign.student.section?.name || "",
          stream: assign.student.stream?.name || "",
        });
      }
    } else {
      setCurrentAssign(null);
      setFilters({
        sessionYear: "",
        className: "",
        sectionName: "",
        stream: "",
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentAssign(null);
    setError(null);
    setFilters({
      sessionYear: "",
      className: "",
      sectionName: "",
      stream: "",
    });
  };

  const handleSubmit = async (data: ExamFeeAssignFormValues) => {
    try {
      console.log(data)
      if (currentAssign?.id) {
        await updateAssign({ id: currentAssign.id, ...data }).unwrap();
        toastShowing(
          "Exam fee assignment updated successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      } else {
        await createAssign(data).unwrap();
        toastShowing(
          "Exam fee assignment created successfully",
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
      console.error("Error saving exam fee assignment:", err);
    }
  };

  const handleDeleteClick = (id: number) => {
    setAssignToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!assignToDelete) return;

    try {
      setIsDeleting(true);
      await deleteAssign(assignToDelete).unwrap();
      toastShowing(
        deleteData?.message || "Exam fee assignment deleted",
        "bottom-right",
        2000,
        "green",
        "white"
      );
      refetch();
    } catch (err) {
      toastShowing(
        "Failed to delete exam fee assignment",
        "bottom-right",
        2000,
        "red",
        "white"
      );
      console.error("Error deleting exam fee assignment:", err);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setAssignToDelete(null);
    }
  };

  const columns = [
    {
      key: "serial",
      header: "SL.",
      render: (_row: ExamFeeAssign, index?: number) =>
        index !== undefined ? index + 1 : "",
    },
    {
      key: "studentName",
      header: "Student Name",
      render: (row: ExamFeeAssign) => row.student?.name || "N/A",
    },
    {
      key: "className",
      header: "Class",
      render: (row: ExamFeeAssign) => row.student?.class?.name || "N/A",
    },
    {
      key: "classRoll",
      header: "Roll",
      render: (row: ExamFeeAssign) => row.student?.classRoll || "N/A",
    },
    {
      key: "sessionYear",
      header: "Session Year",
      render: (row: ExamFeeAssign) => row.student?.session?.name || "N/A",
    },
    {
      key: "examName",
      header: "Exam",
      render: (row: ExamFeeAssign) => row.exam?.name || "N/A",
    },
    {
      key: "examFeeName",
      header: "Fee Type",
      render: (row: ExamFeeAssign) => row.student?.discountType || "N/A",
    },
    {
      key: "examFeeAmount",
      header: "Amount",
      render: (row: ExamFeeAssign) => `৳ ${row.examFee?.amount || 0}`,
    },
    {
      key: "status",
      header: "Status",
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: ExamFeeAssign) => {
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
                    disabled={isDeleting && assignToDelete === row.id}
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
                    {isDeleting && assignToDelete === row.id ? (
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
      }
    },
  ];

  const handleOpenBulkModal = () => {
    setBulkModalOpen(true);
  };

  const handleCloseBulkModal = () => {
    setBulkModalOpen(false);
  };

  const handleBulkSubmit = async (data) => {
    try {
      await createBulkAssign(data).unwrap();
      toastShowing(
        "Class fee assignment created successfully",
        "bottom-right",
        2000,
        "green",
        "white"
      );
      handleCloseBulkModal();
      refetch();
    } catch (err) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        (err as Error).message ||
        "An error occurred";

      toastShowing(errorMessage, "bottom-right", 2000, "red", "white");
      setError(errorMessage);
      console.error("Error saving class fee assignment:", err);
    }
  };

  return (
    <Box>

      <div className="flex w-full justify-end gap-2 items-center">
        <PageHeader
          title="Exam Fee Assignments"
          buttonText="Add Assignment"
          buttonIcon={<Plus size={20} />}
          onButtonClick={() => handleOpenModal()}
        />

        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenBulkModal()}
          sx={{
            backgroundColor: '#035140',
            '&:hover': {
              backgroundColor: '#024030',
            },
            minWidth: "fit-content",
            height: "",
            marginTop: "8px",
          }}
        >
          bulk assign
        </Button>
      </div>

      {modalOpen && <AddEditStudentExamFeeAssign
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentAssign}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={
          currentAssign?.id
            ? "Edit Exam Fee Assignment"
            : "Add Exam Fee Assignment"
        }
        exams={exams?.data || []}
        examFees={examFees?.data || []}
      />}

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
                    backgroundColor: "#d32f2f",
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
                  Exam Fee Assignment Details
                </Typography>
              </Box>

              {/* Content */}
              <Box sx={{ display: "grid", gap: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Student Name:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {assignToView.student?.name || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Class:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {assignToView.student?.class?.name || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Class Roll:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {assignToView.student?.classRoll || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Session Year:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {assignToView.student?.session?.name || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Section:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {assignToView.student?.section?.name || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Stream:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {assignToView.student?.stream?.name || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Exam:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {assignToView.exam?.name || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Fee Type:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {assignToView?.student?.discountType || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Amount:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {`৳ ${assignToView.examFee?.amount || 0}`}
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
              </Box>

              {/* Close button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                <CancelButton onClick={() => setViewModalOpen(false)}>
                  Close
                </CancelButton>
              </Box>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <AddBulkExamFeeAssign
        open={bulkModalOpen}
        onClose={handleCloseBulkModal}
        onSubmit={handleBulkSubmit}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={"Add Bulk Exam Fee Assignment"}
        exams={exams?.data || []}
        examFees={examFees?.data || []}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Exam Fee Assignment"
        description="Are you sure you want to delete this exam fee assignment? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load exam fee assignments
          </Alert>
        ) : examFeeAssigns.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No exam fee assignments found. Click Add New Assignment to create one.
          </Typography>
        ) : (
          <ReusableTable<ExamFeeAssign>
            columns={columns}
            data={examFeeAssigns}
          />
        )}
      </Paper>
    </Box>
  );
};

export default StudentExamFeeAssign;