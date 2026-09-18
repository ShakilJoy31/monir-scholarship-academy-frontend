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
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useGetAllAccountsQuery } from "@/app/store/api/classes/accountApi";
import { AdmissionFeePayFormValues, AdmissionFeePaySchema } from "@/app/super-admin/schemas/admission/admissionFeeOnlineSchema";
import { 
  useCreateAdmissionFeePayMutation, 
  useDeleteAdmissionFeePayMutation, 
  useGetAllUnpaidOnlineAdmissionsQuery,
  useUpdateAdmissionFeePayMutation,
  useGetAdmissionFeePayByIdQuery
} from "@/app/store/api/admission/admissionApi";
import AddEditAdmissionOnlineFee from "@/components/pageComponents/dashboard/admin/admission/AddEditAdmissionOnlineFee";
import { validateEmptyFields } from "@/lib/objectModify";

interface Student {
  id: number;
  name: string;
  studentName?: string;
  note?: string;
  phone: string;
  email: string;
  netPayable: number;
  status: string;
  paymentStatus: string;
  [key: string]: unknown;
}

interface ApiResponse {
  data?: Student[];
}

interface Account {
  id: number;
  accountName: string;
  accountType: string;
  accountNumber: string;
  currentBalance: number;
}

const AdmissionOnlineFee = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const [accountTypeFilter] = useState("All");
  const [currentStudent, setCurrentStudent] = useState<{
    id: number | null;
    data: AdmissionFeePayFormValues;
    isEdit?: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "pay">("pay"); // Track modal mode

  // Fetch unpaid students
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllUnpaidOnlineAdmissionsQuery({ page: 1, size: 10, search: "" });

  // Fetch accounts for payment methods
  const { data: accountsData } = useGetAllAccountsQuery({
    type: accountTypeFilter,
  });

  // Mutation hooks
  const [createPayment, { isLoading: createLoading }] = useCreateAdmissionFeePayMutation();
  const [updatePayment, { isLoading: updateLoading }] = useUpdateAdmissionFeePayMutation();
  const [deletePayment] = useDeleteAdmissionFeePayMutation();
  const { data: feePaymentData } = useGetAdmissionFeePayByIdQuery(
    currentStudent?.id || 0,
    { skip: !currentStudent?.id || !currentStudent?.isEdit }
  );

  const accounts: Account[] = Array.isArray(accountsData) 
    ? accountsData 
    : accountsData?.data || [];

  const students: Student[] = Array.isArray(responseData)
    ? responseData
    : (responseData as ApiResponse)?.data || [];

  const handleOpenModal = (student: Student | null = null, isEdit = false) => {
    if (student && isEdit) {
      setCurrentStudent({
        id: student.id,
        data: {
          admissionId: student.id,
          studentName: student.name,
          amount: student.netPayable,
          note: student.note || "",
          payments: [{ accountId: 0, paymentAmount: student.netPayable }]
        },
        isEdit: true
      });
      setModalMode("view"); // Set to view mode for edit
    } else if (student) {
      setCurrentStudent({
        id: student.id,
        data: {
          admissionId: student.id,
          studentName: student.name,
          amount: student.netPayable,
          note: student.note || "",
          payments: [{ accountId: 0, paymentAmount: student.netPayable }]
        },
        isEdit: false
      });
      setModalMode("pay"); // Set to pay mode for new payment
    } else {
      setCurrentStudent(null);
      setModalMode("pay"); // Default to pay mode
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentStudent(null);
    setError(null);
  };

  const handleSubmit = async (data: AdmissionFeePayFormValues) => {
    try {
      // Ensure note is always an empty string
      const submissionData = {
        admissionId: data.admissionId,
        amount: data.amount,
        note: data.note || "",
        payments: data.payments
      };
      const validatePayload = validateEmptyFields(submissionData);
      
      if (currentStudent?.isEdit && currentStudent.id) {
        await updatePayment({ id: currentStudent.id, data: validatePayload }).unwrap();
        toastShowing("Payment updated successfully", 'bottom-right', 2000, 'green', 'white');
      } else {
        await createPayment(validatePayload).unwrap();
        toastShowing("Payment created successfully", 'bottom-right', 2000, 'green', 'white');
      }
      
      handleCloseModal();
      refetch();
    } catch (err) {
      const errorMessage = (err as { data?: { message?: string } })?.data?.message ||
        (err as Error).message ||
        'An error occurred';

      toastShowing(errorMessage, 'bottom-right', 2000, 'red', 'white');
      setError(errorMessage);
      console.error("Error saving payment:", err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      setIsDeleting(true);
      await deletePayment(studentToDelete).unwrap();
      toastShowing("Payment deleted", 'bottom-right', 2000, 'green', 'white');
      refetch();
    } catch (err) {
      toastShowing('Failed to delete payment', 'bottom-right', 2000, 'red', 'white');
      console.error("Error deleting payment:", err);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  const columns = [
    {
      key: "serial",
      header: "SL",
      render: (_row: Student, index?: number) => index !== undefined ? index + 1 : '',
    },
    {
      key: "name",
      header: "Name",
      render: (row: Student) => row.name || "N/A",
    },
    {
      key: "phone",
      header: "Phone",
      render: (row: Student) => row.phone || "N/A",
    },
    {
      key: "email",
      header: "Email",
      render: (row: Student) => row.email || "N/A",
    },
    {
      key: "amount",
      header: "Pay Amount",
      render: (row: Student) => `৳ ${row.netPayable?.toFixed(2) || "0"}/-`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Student) => {
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
            label={row.status as React.ReactNode}
            color={color}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        );
      }
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Student) => {
        return (
          <Tooltip
            title={
              <Paper
                elevation={3}
                sx={{
                  backgroundColor: 'white',
                  padding: '8px 0',
                  borderRadius: '8px',
                  display: 'grid',
                  gap: '4px',
                  minWidth: '120px',
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Button
                  onClick={() => {
                    handleOpenModal(row);
                    setOpenMenuId(null);
                  }}
                  size="small"
                  sx={{
                    color: "#035140",
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 400,
                    justifyContent: 'flex-start',
                    padding: '6px 16px',
                    "&:hover": {
                      backgroundColor: "rgba(3, 81, 64, 0.08)",
                    },
                  }}
                >
                  Pay Fee
                </Button>
                <Button
                  onClick={() => {
                    handleOpenModal(row, true);
                    setOpenMenuId(null);
                  }}
                  size="small"
                  sx={{
                    color: "#035140",
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 400,
                    justifyContent: 'flex-start',
                    padding: '6px 16px',
                    "&:hover": {
                      backgroundColor: "rgba(3, 81, 64, 0.08)",
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
                  backgroundColor: 'transparent',
                  padding: 0,
                  boxShadow: 'none'
                }
              }
            }}
            PopperProps={{
              modifiers: [
                {
                  name: 'offset',
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
              <BsThreeDotsVertical size={18} />
            </IconButton>
          </Tooltip>
        );
      },
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Unpaid Admission Fees"
        buttonIcon={<Plus size={20} />}
        onButtonClick={() => handleOpenModal()}
      />

      {/* Single modal that changes based on mode */}
      <AddEditAdmissionOnlineFee
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentStudent}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={
          modalMode === "view" 
            ? "Payment Details" 
            : currentStudent?.isEdit 
              ? "Edit Admission Fee Payment" 
              : currentStudent?.id 
                ? "Pay Admission Fee" 
                : "Add Payment"
        }
        schema={AdmissionFeePaySchema}
        defaultValues={{
          admissionId: 0,
          studentName: "",
          amount: 0,
          note: "",
          payments: [{ accountId: 0, paymentAmount: 0 }],
        }}
        accounts={accounts}
        feePaymentData={currentStudent?.isEdit ? feePaymentData?.data : undefined}
        mode={modalMode}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Payment"
        description="Are you sure you want to delete this payment? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load unpaid admissions
          </Alert>
        ) : students.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No unpaid admissions found.
          </Typography>
        ) : (
          <ReusableTable<Student>
            columns={columns}
            data={students}
          />
        )}
      </Paper>
    </Box>
  );
};

export default AdmissionOnlineFee;