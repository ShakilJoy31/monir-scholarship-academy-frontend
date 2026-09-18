"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
} from "@mui/material";
import { Plus, MoreVertical, X } from "lucide-react";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import { HostelFeeAssignFormValues } from "@/app/super-admin/schemas/hostel/hostelFeeAssign";
import { useCreateHostelBulkFeeAssignMutation, useCreateHostelFeeAssignMutation, useDeleteHostelFeeAssignMutation, useGetAllHostelFeeAssignsQuery, useUpdateHostelFeeAssignMutation } from "@/app/store/api/hostel/hostelFeeDsicountApi";
import AddEditStudentHostelFeeAssign from "@/components/pageComponents/dashboard/admin/hostel/AddEditStudentHostelFeeAssign";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import AddBulkClassFeeAssign from "@/components/pageComponents/dashboard/admin/classList/AddBulkClassFeeAssign";
import { HostelBulkFeeAssignFormValues } from "@/app/super-admin/schemas/hostel/hostelBulkFeeAssign";

interface HostelFeeAssign extends HostelFeeAssignFormValues {
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
    hostel?: {
      name: string;
    };
  };
}

interface ApiResponse {
  data?: HostelFeeAssign[];
}



const StudentHostelFeeAssign = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [assignToDelete, setAssignToDelete] = useState<number | null>(null);
  const [assignToView, setAssignToView] = useState<HostelFeeAssign | null>(null);
  const [currentAssign, setCurrentAssign] = useState<{
    id: number | null;
    data: HostelBulkFeeAssignFormValues;
  } | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  // const [, setFilters] = useState({
  //   sessionYear: "",
  //   className: "",
  //   sectionName: "",
  //   streamName: "",
  // });

  // Fetch hostel fee assigns data
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllHostelFeeAssignsQuery({});

  const hostelFeeAssigns: HostelFeeAssign[] = Array.isArray(responseData)
    ? responseData
    : (responseData as ApiResponse)?.data || [];

  const [createAssign, { isLoading: createLoading }] =
    useCreateHostelFeeAssignMutation();
  const [updateAssign, { isLoading: updateLoading }] =
    useUpdateHostelFeeAssignMutation();
  const [deleteAssign, { data: deleteData }] =
    useDeleteHostelFeeAssignMutation();
  const [createBulkAssign] =
    useCreateHostelBulkFeeAssignMutation();

  const handleOpenModal = (assign: HostelFeeAssign | null = null) => {
    if (assign) {
      setCurrentAssign({
        id: assign.id,
        data: {
          studentIds: null,
          month: assign.month,
        },
      });

      // if (assign.student) {
      //   setFilters({
      //     sessionYear: assign.student.session?.name || "",
      //     className: assign.student.class?.name || "",
      //     sectionName: assign.student.section?.name || "",
      //     streamName: assign.student.stream?.name || "",
      //   });
      // }
    } else {
      setCurrentAssign(null);
      // setFilters({
      //   sessionYear: "",
      //   className: "",
      //   sectionName: "",
      //   streamName: "",
      // });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentAssign(null);
    setError(null);
    // setFilters({
    //   sessionYear: "",
    //   className: "",
    //   sectionName: "",
    //   streamName: "",
    // });
  };

  const handleSubmit = async (data: HostelBulkFeeAssignFormValues) => {
    try {
      if (currentAssign?.id) {
        await updateAssign({ id: currentAssign.id, data }).unwrap();
        toastShowing(
          "Hostel fee assign updated successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      } else {
        await createAssign(data).unwrap();
        toastShowing(
          "Hostel fee assign created successfully",
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
      console.error("Error saving hostel fee assign:", err);
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
        deleteData?.message || "Hostel fee assign deleted",
        "bottom-right",
        2000,
        "green",
        "white"
      );
      refetch();
    } catch (err) {
      toastShowing(
        "Failed to delete hostel fee assign",
        "bottom-right",
        2000,
        "red",
        "white"
      );
      console.error("Error deleting hostel fee assign:", err);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setAssignToDelete(null);
    }
  };

  const handleOpenBulkModal = () => {
    setBulkModalOpen(true);
  };

  const handleCloseBulkModal = () => {
    setBulkModalOpen(false);
  };

  const handleBulkSubmit = async (data: HostelBulkFeeAssignFormValues) => {
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



  const columns = [
    {
      key: "serial",
      header: "SL.",
      render: (_row: HostelFeeAssign, index?: number) =>
        index !== undefined ? index + 1 : "",
    },
    {
      key: "studentName",
      header: "Student Name",
      render: (row: HostelFeeAssign) => row.student?.name || "N/A",
    },
    {
      key: "className",
      header: "Class",
      render: (row: HostelFeeAssign) => row.student?.class.name || "N/A",
    },
    {
      key: "classRoll",
      header: "Roll",
      render: (row: HostelFeeAssign) => row.student?.classRoll || "N/A",
    },
    {
      key: "sessionYear",
      header: "Session Year",
      render: (row: HostelFeeAssign) => row.student?.session.name || "N/A",
    },
    {
      key: "sectionName",
      header: "Section",
      render: (row: HostelFeeAssign) => row.student?.section.name || "N/A",
    },
    {
      key: "streamName",
      header: "Stream",
      render: (row: HostelFeeAssign) => row.student?.stream.name || "N/A",
    },
    {
      key: "month",
      header: "Month",
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: HostelFeeAssign) => {
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
          title="Hostel Fee Assigns"
          buttonText="Add Assign"
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

      <AddEditStudentHostelFeeAssign
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentAssign}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={
          currentAssign?.id
            ? "Edit Hostel Fee Assign"
            : "Add Hostel Fee Assign"
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
        title={"Add Bulk Hotel Fee Assignment"}
      />

      {/* View Assign Modal */}
      <Dialog
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "12px",
            border: "2px solid",
            borderColor: "divider",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            maxHeight: "90vh",
            background: `
        linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,252,251,0.98)),
        radial-gradient(circle at top left, rgba(26,60,52,0.03), transparent 60%)
      `,
          },
          backdropFilter: "blur(4px)",
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid",
            borderColor: "divider",
            py: 2,
            pr: 2,
            backgroundColor: "transparent",
            position: "relative",
          }}
        >
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
            Hostel Fee Assign Details
          </Typography>
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
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            py: 3,
            borderBottom: "2px solid",
            borderColor: "divider",
            backgroundColor: "transparent",
          }}
        >
          {assignToView && (
            <Box sx={{ display: "grid", gap: 2 }}>
              {[
                { label: "Student Name", value: assignToView.student?.name || "N/A" },
                { label: "Class", value: assignToView.student?.class.name || "N/A" },
                { label: "Class Roll", value: assignToView.student?.classRoll || "N/A" },
                { label: "Session Year", value: assignToView.student?.session.name || "N/A" },
                { label: "Section", value: assignToView.student?.section.name || "N/A" },
                { label: "Stream", value: assignToView.student?.stream.name || "N/A" },
                { label: "Month", value: assignToView.month },
              ].map((item, index) => (
                <Box key={index} sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    {item.label}:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "2px solid",
            borderColor: "divider",
            backgroundColor: "transparent",
          }}
        >
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
        </DialogActions>
      </Dialog>

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Hostel Fee Assign"
        description="Are you sure you want to delete this hostel fee assign? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load hostel fee assigns
          </Alert>
        ) : hostelFeeAssigns.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No hostel fee assigns found. Click Add New Assign to create one.
          </Typography>
        ) : (
          <ReusableTable<HostelFeeAssign>
            columns={columns}
            data={hostelFeeAssigns}
          />
        )}
      </Paper>
    </Box>
  );
};

export default StudentHostelFeeAssign;