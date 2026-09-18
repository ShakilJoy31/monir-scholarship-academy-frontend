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
import AddEditHostelFeeDiscount from "@/components/pageComponents/dashboard/admin/hostel/AddEditHostelFeeDiscount";
import { HostelFeeDiscountFormValues } from "@/app/super-admin/schemas/hostel/hostelFeeDiscountSchema";
import {
  useCreateHostelFeeDiscountMutation,
  useDeleteHostelFeeDiscountMutation,
  useGetAllHostelFeeDiscountsQuery,
  useUpdateHostelFeeDiscountMutation,
} from "@/app/store/api/hostel/hostelFeeDsicountApi";
import CancelButton from "@/components/shared/reusable-component/CancelButton";

interface HostelFeeDiscount extends HostelFeeDiscountFormValues {
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
  data?: HostelFeeDiscount[];
}



const HostelFeeDiscount = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [discountToDelete, setDiscountToDelete] = useState<number | null>(null);
  const [discountToView, setDiscountToView] =
    useState<HostelFeeDiscount | null>(null);
  const [currentDiscount, setCurrentDiscount] = useState<{
    id: number | null;
    data: HostelFeeDiscountFormValues;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [ , setFilters] = useState({
    sessionYear: "",
    className: "",
    sectionName: "",
    streamName: "",
  });

  // Fetch hostel fee discounts data
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllHostelFeeDiscountsQuery({});
  const hostelFeeDiscounts: HostelFeeDiscount[] = Array.isArray(responseData)
    ? responseData
    : (responseData as ApiResponse)?.data || [];


  const [createDiscount, { isLoading: createLoading }] =
    useCreateHostelFeeDiscountMutation();
  const [updateDiscount, { isLoading: updateLoading }] =
    useUpdateHostelFeeDiscountMutation();
  const [deleteDiscount, { data: deleteData }] =
    useDeleteHostelFeeDiscountMutation();

  const handleOpenModal = (discount: HostelFeeDiscount | null = null) => {
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

  const handleSubmit = async (data: HostelFeeDiscountFormValues) => {
    try {
      if (currentDiscount?.id) {
        await updateDiscount({ id: currentDiscount.id, ...data }).unwrap();
        toastShowing(
          "Hostel fee discount updated successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      } else {
        await createDiscount(data).unwrap();
        toastShowing(
          "Hostel fee discount created successfully",
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
      console.error("Error saving hostel fee discount:", err);
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
        deleteData?.message || "Hostel fee discount deleted",
        "bottom-right",
        2000,
        "green",
        "white"
      );
      refetch();
    } catch (err) {
      toastShowing(
        "Failed to delete hostel fee discount",
        "bottom-right",
        2000,
        "red",
        "white"
      );
      console.error("Error deleting hostel fee discount:", err);
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
      render: (_row: HostelFeeDiscount, index?: number) =>
        index !== undefined ? index + 1 : "",
    },
    {
      key: "studentName",
      header: "Student Name",
      render: (row: HostelFeeDiscount) => row.student?.name || "N/A",
    },
    {
      key: "className",
      header: "Class",
      render: (row: HostelFeeDiscount) => row.student?.class.name || "N/A",
    },
    {
      key: "classRoll",
      header: "Roll",
      render: (row: HostelFeeDiscount) => row.student?.classRoll || "N/A",
    },
    {
      key: "sessionYear",
      header: "Session Year",
      render: (row: HostelFeeDiscount) => row.student?.session.name || "N/A",
    },
    {
      key: "sectionName",
      header: "Section",
      render: (row: HostelFeeDiscount) => row.student?.section.name || "N/A",
    },
    {
      key: "streamName",
      header: "Stream",
      render: (row: HostelFeeDiscount) => row.student?.stream.name || "N/A",
    },
    {
      key: "discountType",
      header: "Type",
    },
    {
      key: "discount",
      header: "Discount",
      render: (row: HostelFeeDiscount) =>
        row.discountType === "Percentage"
          ? `${row.discount}%`
          : `BTD${row.discount}`,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: HostelFeeDiscount) => {
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
        title="Hostel Fee Discounts"
        buttonText="Add Discount"
        buttonIcon={<Plus size={20} />}
        onButtonClick={() => handleOpenModal()}
      />

      <AddEditHostelFeeDiscount
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentDiscount}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={
          currentDiscount?.id
            ? "Edit Hostel Fee Discount"
            : "Add Hostel Fee Discount"
        }
      />

      {/* View Discount Modal */}
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
            Class Fee Discount Details
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
          {discountToView && (
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
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Note:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {discountToView.note}
                  </Typography>
                </Box>
              )}
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
        title="Delete Hostel Fee Discount"
        description="Are you sure you want to delete this hostel fee discount? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load hostel fee discounts
          </Alert>
        ) : hostelFeeDiscounts.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No hostel fee discounts found. Click Add New Discount to create one.
          </Typography>
        ) : (
          <ReusableTable<HostelFeeDiscount>
            columns={columns}
            data={hostelFeeDiscounts}
          />
        )}
      </Paper>
    </Box>
  );
};

export default HostelFeeDiscount;
