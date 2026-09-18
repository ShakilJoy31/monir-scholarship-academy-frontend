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
import {
  useCreateBulkClassFeeAssignMutation,
  useCreateClassFeeAssignMutation,
  useDeleteClassFeeAssignMutation,
  useGetAllClassFeeAssignsQuery,
  useUpdateClassFeeAssignMutation,
} from "@/app/store/api/classes/classFeeApi";
import AddEditClassFeeAssign from "@/components/pageComponents/dashboard/admin/classList/AddEditClassFeeAssign";
import { ClassFeeAssignFormValues } from "@/app/super-admin/schemas/studentClassFeeAssign";
import { AnimatePresence, motion } from "framer-motion";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import AddBulkClassFeeAssign from "@/components/pageComponents/dashboard/admin/classList/AddBulkClassFeeAssign";
import { ClassBulkFeeAssignFormValues } from "@/app/super-admin/schemas/studentBulkClassFeeAssign";

interface ClassFeeAssign extends ClassFeeAssignFormValues {
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
  };
  [key: string]: unknown;
}



const StudentClassFeeAssign = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [bulkModalOpen, setBulkModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [assignToDelete, setAssignToDelete] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [assignToView, setAssignToView] = useState<ClassFeeAssign | null>(null);
  const [currentAssign, setCurrentAssign] = useState<{
    id: number | null;
    data: ClassFeeAssignFormValues;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [, setFilters] = useState({
    sessionYear: "",
    className: "",
    sectionName: "",
    streamName: "",
  });

  // Fetch class fee assignments data
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllClassFeeAssignsQuery({ page: 1, size: 10, search: "" });

  const classFeeAssigns: ClassFeeAssign[] = responseData?.data || [];
  const [createAssign, { isLoading: createLoading }] =
    useCreateClassFeeAssignMutation();
  const [createBulkAssign] =
    useCreateBulkClassFeeAssignMutation();
  const [updateAssign, { isLoading: updateLoading }] =
    useUpdateClassFeeAssignMutation();
  const [deleteAssign, { data: deleteData }] =
    useDeleteClassFeeAssignMutation();

  const handleOpenModal = (assign: ClassFeeAssign | null = null) => {
    if (assign) {
      setCurrentAssign({
        id: assign.id,
        data: {
          studentId: assign.studentId,
          month: assign.month,
          // status: assign.status,
          // classFee: assign.classFee,
          // discountType: assign.discountType,
          // discount: assign.discount,
          // netPayable: assign.netPayable,
          // note: assign.note || "",
        },
      });

      if (assign.student) {
        setFilters({
          sessionYear: assign.student.session?.name || "",
          className: assign.student.class?.name || "",
          sectionName: assign.student.section?.name || "",
          streamName: assign.student.stream?.name || "",
        });
      }
    } else {
      setCurrentAssign(null);
      setFilters({
        sessionYear: "",
        className: "",
        sectionName: "",
        streamName: "",
      });
    }
    setModalOpen(true);
  };

  const handleOpenBulkModal = () => {
    setBulkModalOpen(true);
  };

  const handleCloseBulkModal = () => {
    setBulkModalOpen(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentAssign(null);
    setError(null);
    setFilters({
      sessionYear: "",
      className: "",
      sectionName: "",
      streamName: "",
    });
  };



  const handleSubmit = async (data: ClassFeeAssignFormValues) => {
    try {
      if (currentAssign?.id) {
        await updateAssign({ id: currentAssign.id, ...data }).unwrap();
        toastShowing(
          "Class fee assignment updated successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      } else {
        await createAssign(data).unwrap();
        toastShowing(
          "Class fee assignment created successfully",
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
      console.error("Error saving class fee assignment:", err);
    }
  };

  const handleBulkSubmit = async (data: ClassBulkFeeAssignFormValues) => {
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
        deleteData?.message || "Class fee assignment deleted",
        "bottom-right",
        2000,
        "green",
        "white"
      );
      refetch();
    } catch (err) {
      toastShowing(
        "Failed to delete class fee assignment",
        "bottom-right",
        2000,
        "red",
        "white"
      );
      console.error("Error deleting class fee assignment:", err);
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
      render: (_row: ClassFeeAssign, index?: number) =>
        index !== undefined ? index + 1 : "",
    },
    {
      key: "studentName",
      header: "Student Name",
      render: (row: ClassFeeAssign) => row.student?.name || "N/A",
    },
    {
      key: "className",
      header: "Class",
      render: (row: ClassFeeAssign) => row.student?.class?.name || "N/A",
    },
    {
      key: "classRoll",
      header: "Roll",
      render: (row: ClassFeeAssign) => row.student?.classRoll || "N/A",
    },
    {
      key: "sessionYear",
      header: "Session Year",
      render: (row: ClassFeeAssign) => row.student?.session?.name || "N/A",
    },
    {
      key: "sectionName",
      header: "Section",
      render: (row: ClassFeeAssign) => row.student?.section?.name || "N/A",
    },
    {
      key: "streamName",
      header: "Stream",
      render: (row: ClassFeeAssign) => row.student?.stream?.name || "N/A",
    },
    {
      key: "month",
      header: "Month",
    },
    {
      key: "status",
      header: "Status",
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

  return (
    <Box>
      <div className="flex w-full justify-end gap-2 items-center">

        <PageHeader
          title="Monthly Fee Assignments"
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

      <AddEditClassFeeAssign
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentAssign}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={
          currentAssign?.id
            ? "Edit Class Fee Assignment"
            : "Add Class Fee Assignment"
        }
      />

      <AddBulkClassFeeAssign
        open={bulkModalOpen}
        onClose={handleCloseBulkModal}
        onSubmit={handleBulkSubmit}
        currentData={currentAssign}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={"Add Bulk Class Fee Assignment"}
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
                  Class Fee Assignment Details
                </Typography>
              </Box>

              {/* Content - using exact same layout as example */}
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
                    Month:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {assignToView.month || "N/A"}
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
                    Class Fee:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {`BTD${assignToView.classFee || 0}`}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Discount:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {assignToView.discountType === "Percentage"
                      ? `${assignToView.discount}%`
                      : `BTD${assignToView.discount}`}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Net Payable:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {`BTD${assignToView.netPayable || 0}`}
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

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Class Fee Assignment"
        description="Are you sure you want to delete this class fee assignment? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load class fee assignments
          </Alert>
        ) : classFeeAssigns.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No class fee assignments found. Click Add New Assignment to create one.
          </Typography>
        ) : (
          <ReusableTable<ClassFeeAssign>
            columns={columns}
            data={classFeeAssigns}
          />
        )}
      </Paper>
    </Box>
  );
};

export default StudentClassFeeAssign;