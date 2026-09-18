"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Tooltip,
  Button,
} from "@mui/material";
import { Plus } from "lucide-react";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { useGetAllAccountsQuery } from "@/app/store/api/classes/accountApi";
import { useGetAllTeachersQuery } from "@/app/store/api/teacher/teacherApi";
import { TeacherSalaryAdvanceFormValues, TeacherSalaryAdvanceSchema } from "@/app/super-admin/schemas/teacherSalaryAdvance";
import { useAcceptTeacherSalaryAdvanceMutation, useCancelTeacherSalaryAdvanceMutation, useCreateTeacherSalaryAdvanceMutation, useDeleteTeacherSalaryAdvanceMutation, useGetAllTeacherSalaryAdvancesQuery, useUpdateTeacherSalaryAdvanceMutation } from "@/app/store/api/teacher/teacherSalaryApi";
import AddEditTeacherSalaryAdvance from "@/components/pageComponents/dashboard/admin/teacher/AddEditTeacherSalaryAdvance";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import { AcceptModal } from "@/components/shared/reusable-component/AcceptModal";
import { MoreVertical } from 'lucide-react';


type Month =
  | "January" | "February" | "March" | "April" | "May" | "June"
  | "July" | "August" | "September" | "October" | "November" | "December";

interface TeacherSalaryAdvance extends TeacherSalaryAdvanceFormValues {
  id: number;
  status: "Pending" | "Accepted" | "Canceled";
  teacher: {
    id: number;
    name: string;
  };
  [key: string]: unknown;
  month: Month;
}

interface Teacher {
  teacherUniqueId: string;
  id: number;
  name: string;
}

interface Account {
  id: number;
  accountName: string;
  bankName: string;
  accountType: string;
  accountNumber?: string;
}

const TeacherSalaryAdvance = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [advanceToDelete, setAdvanceToDelete] = useState<number | null>(null);
  const [currentAdvance, setCurrentAdvance] = useState<{
    id: number | null;
    data: TeacherSalaryAdvanceFormValues;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    action: 'accept' | 'cancel' | null;
    advanceId: number | null;
  }>({
    open: false,
    action: null,
    advanceId: null,
  });

  // Fetch data
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllTeacherSalaryAdvancesQuery({ page: 1, size: 10, search: "" });

  const { data: teachersData } = useGetAllTeachersQuery({});
  const { data: accountsData } = useGetAllAccountsQuery({ type: "All" });

  // Mutations
  const [createAdvance, { isLoading: createLoading }] = useCreateTeacherSalaryAdvanceMutation();
  const [updateAdvance, { isLoading: updateLoading }] = useUpdateTeacherSalaryAdvanceMutation();
  const [deleteAdvance] = useDeleteTeacherSalaryAdvanceMutation();
  const [acceptAdvance, { isLoading: isAccepting }] = useAcceptTeacherSalaryAdvanceMutation();
  const [cancelAdvance, { isLoading: isCanceling }] = useCancelTeacherSalaryAdvanceMutation();

  const advances: TeacherSalaryAdvance[] = responseData?.data || [];
  const teachers: Teacher[] = teachersData?.data || [];
  const accounts: Account[] = accountsData?.data || [];

  const handleOpenConfirmation = (action: 'accept' | 'cancel', advanceId: number) => {
    setConfirmAction({
      open: true,
      action,
      advanceId,
    });
  };

  const handleCloseConfirmation = () => {
    setConfirmAction({
      open: false,
      action: null,
      advanceId: null,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction.advanceId) return;

    try {
      if (confirmAction.action === 'accept') {
        await acceptAdvance(confirmAction.advanceId).unwrap();
        toastShowing("Advance accepted", 'bottom-right', 2000, 'green', 'white');
      } else if (confirmAction.action === 'cancel') {
        await cancelAdvance(confirmAction.advanceId).unwrap();
        toastShowing("Advance canceled", 'bottom-right', 2000, 'green', 'white');
      }
      refetch();
    } catch (err) {
      toastShowing(
        (err as { data?: { message?: string } })?.data?.message ||
        `Failed to ${confirmAction.action} advance`,
        'bottom-right',
        2000,
        'red',
        'white'
      );
    } finally {
      handleCloseConfirmation();
    }
  };

  const handleOpenModal = (advance: TeacherSalaryAdvance | null = null) => {
    if (advance) {
      setCurrentAdvance({
        id: advance.id,
        data: {
          teacherId: advance.teacherId,
          month: advance.month,
          amount: advance.amount,
          note: advance.note || "",
          // Map Payment (capital P from API) to payments (lowercase for form)
          payments: Array.isArray(advance.Payment)
            ? advance.Payment.map(payment => ({
              accountId: payment.accountId,
              paymentAmount: payment.paymentAmount
            }))
            : advance.payments || [] // fallback to payments if Payment doesn't exist
        }
      });
    } else {
      setCurrentAdvance({
        id: null,
        data: {
          teacherId: 0,
          month: new Date().toLocaleString('default', { month: 'long' }) as Month,
          amount: 0,
          note: "",
          payments: []
        }
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentAdvance(null);
    setError(null);
  };



  const handleSubmit = async (data: TeacherSalaryAdvanceFormValues) => {
    // Clean up the data (optional note field)
    const requestData = {
      ...data,
      note: data?.note || undefined
    };

    try {
      if (currentAdvance?.id) {
        const { ...updateData } = requestData;
        await updateAdvance({
          id: currentAdvance.id,
          ...updateData
        }).unwrap();
        toastShowing("Advance updated successfully", 'bottom-right', 2000, 'green', 'white');
      } else {
        // For creates, include all fields
        await createAdvance(requestData).unwrap();
        toastShowing("Advance created successfully", 'bottom-right', 2000, 'green', 'white');
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      const errorMessage = (err as { data?: { message?: string } })?.data?.message ||
        (err as Error).message ||
        'An error occurred';
      setError(errorMessage);
      console.error("Error saving advance:", err);
    }
  };

  const handleDeleteClick = (id: number) => {
    setAdvanceToDelete(id);
    setIsDeleting(true);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!advanceToDelete) return;
    try {
      await deleteAdvance(advanceToDelete).unwrap();
      toastShowing("Advance deleted", 'bottom-right', 2000, 'green', 'white');
      refetch();
    } catch (err) {
      toastShowing('Failed to delete advance', 'bottom-right', 2000, 'red', 'white');
      console.error("Error deleting advance:", err);
    } finally {
      setDeleteModalOpen(false);
      setAdvanceToDelete(null);
      setIsDeleting(false);
    }
  };



  // Then in your columns array:
  const columns = [
    {
      key: "serial",
      header: "SL",
      render: (_row: TeacherSalaryAdvance, index?: number) => index !== undefined ? index + 1 : '',
    },
    {
      key: "teacher",
      header: "Teacher",
      render: (row: TeacherSalaryAdvance) => row.teacher?.name || "N/A",
    },
    {
      key: "month",
      header: "Month",
      render: (row: TeacherSalaryAdvance) => row.month || "N/A",
    },
    {
      key: "amount",
      header: "Amount",
      render: (row: TeacherSalaryAdvance) => `৳ ${row.amount?.toFixed(2)}/-`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: TeacherSalaryAdvance) => {
        let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
        switch (row.status) {
          case 'Accepted':
            color = 'success';
            break;
          case 'Canceled':
            color = 'error';
            break;
          default:
            color = 'warning';
        }
        return (
          <Chip
            label={row.status}
            color={color}
            size="small"
            sx={{
              fontWeight: 500,
              borderRadius: '4px'
            }}
          />
        );
      }
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: TeacherSalaryAdvance) => {
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
                  {row.status === "Pending" && (
                    <>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenConfirmation('accept', row.id);
                          setOpenMenuId(null);
                        }}
                        size="small"
                        sx={{
                          color: "#10B981",
                          textTransform: "none",
                          fontSize: "14px",
                          fontWeight: 400,
                          justifyContent: "flex-start",
                          padding: "6px 16px",
                          "&:hover": {
                            backgroundColor: "rgba(16, 185, 129, 0.08)",
                          },
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenConfirmation('cancel', row.id);
                          setOpenMenuId(null);
                        }}
                        size="small"
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
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(row.id);
                      setOpenMenuId(null);
                    }}
                    size="small"
                    disabled={isDeleting && advanceToDelete === row.id}
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
                    {isDeleting && advanceToDelete === row.id ? (
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
    }
  ];


  return (
    <Box>
      <PageHeader
        title="Teacher Salary Advances"
        buttonText="Add Advance"
        buttonIcon={<Plus size={20} />}
        onButtonClick={() => handleOpenModal()}
      />

      <AddEditTeacherSalaryAdvance
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentAdvance}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={currentAdvance?.id ? "Edit Salary Advance" : "Add Salary Advance"}
        schema={TeacherSalaryAdvanceSchema}
        defaultValues={{
          teacherId: 0,
          month: new Date().toLocaleString('default', { month: 'long' }) as Month,
          //   amount: 0,
          note: "",
          payments: [],
        }}
        formFields={[
          {
            name: "teacherId",
            label: "Teacher",
            gridWidth: 6,
            type: "select",
            required: true,
            options: teachers.map(teacher => ({ value: teacher.id, label: `${teacher.name} (${teacher.teacherUniqueId})` })),
          },
          {
            name: "month",
            label: "Month",
            gridWidth: 6,
            type: "select",
            required: true,
            options: [
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
            ].map(month => ({ value: month, label: month }))
          },
          //   {
          //     name: "amount",
          //     label: "Amount",
          //     gridWidth: 6,
          //     type: "number",
          //     required: true
          //   },
        ]}
        accounts={accounts}
        teachers={teachers || []}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Salary Advance"
        description="Are you sure you want to delete this salary advance? This action cannot be undone." isLoading={false} />


      {/* Accept Confirmation Modal */}
      <AcceptModal
        confirmText="Accept"
        cancelText="Cancel"
        open={confirmAction.open && confirmAction.action === 'accept'}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmAction}
        title="Accept Confirmation"
        description="Are you sure you want to accept this salary advance?"
        isLoading={isAccepting}
      />

      {/* Cancel Confirmation Modal */}
      <DeleteConfirmationModal
        confirmText="Cancel"
        cancelText="Back"
        open={confirmAction.open && confirmAction.action === 'cancel'}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmAction}
        title="Cancel Confirmation"
        description="Are you sure you want to cancel this salary advance?"
        isLoading={isCanceling}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load salary advances
          </Alert>
        ) : advances.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No salary advances found. Click Add New Advance to create one.
          </Typography>
        ) : (
          <ReusableTable<TeacherSalaryAdvance>
            columns={columns}
            data={advances}
          />
        )}
      </Paper>
    </Box>
  );
};

export default TeacherSalaryAdvance;