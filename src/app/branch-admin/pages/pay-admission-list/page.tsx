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
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  useAcceptAdmissionFeePayMutation,
  useCancelAdmissionFeePayMutation,
  useGetAllAdmissionFeePayQuery,
} from "@/app/store/api/admission/admissionApi";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import { AcceptModal } from "@/components/shared/reusable-component/AcceptModal";

interface AdmissionFeePay {
  id: number;
  studentName: string;
  studentId: string;
  admissionFee: number;
  paidAmount: number;
  dueAmount: number;
  paymentDate: string;
  status: "Pending" | "Accepted" | "Canceled";
  [key: string]: unknown;
}

interface Account {
  id: number;
  bankName: string;
  accountHolderName: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  branchId: number;
  openingBalance: number;
  currentBalance: number;
  createdAt: string;
  updatedAt: string;
}

interface Payment {
  id: number;
  accountId: number;
  userId: number | null;
  paymentAmount: number;
  branchId: number;
  type: string;
  subject: string;
  admissionFeePayId: number;
  createdAt: string;
  updatedAt: string;
  account: Account;
}

interface ClassData {
  id: number;
  name: string;
}

interface Admission {
  id: number;
  name: string;
  applicationId: string;
  netPayable: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  class: ClassData;
  section: ClassData;
  stream: ClassData;
  session: ClassData;
  [key: string]: unknown; 
}

interface RawAdmissionFeePayResponse {
  id: number;
  amount: number;
  status: "Pending" | "Accepted" | "Canceled";
  createdAt: string;
  updatedAt: string;
  admission: Admission;
  Payment: Payment[];
}

const AdmissionPayList = () => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    action: "accept" | "cancel" | null;
    paymentId: number | null;
  }>({
    open: false,
    action: null,
    paymentId: null,
  });

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllAdmissionFeePayQuery({ page: 1, size: 10, search: "" });

  const [acceptPayment] = useAcceptAdmissionFeePayMutation();
  const [cancelPayment] = useCancelAdmissionFeePayMutation();

  const payments: AdmissionFeePay[] = Array.isArray(responseData?.data)
    ? responseData.data.map((item: RawAdmissionFeePayResponse) => {
        const payment = item?.Payment?.[0];
        const admission = item?.admission;

        return {
          id: item.id,
          studentName: admission?.name || "N/A",
          studentId: admission?.applicationId || "N/A",
          admissionFee: item.amount || 0,
          paidAmount:
    admission?.paymentStatus === "Paid" && item.amount || 0,
  dueAmount:
    admission?.paymentStatus === "Paid" ? 0 : item.amount || 0,
          paymentDate: payment?.createdAt || "",
          status: item.status as "Pending" | "Accepted" | "Canceled",
        };
      })
    : [];

  const handleOpenConfirmation = (
    action: "accept" | "cancel",
    paymentId: number
  ) => {
    setConfirmAction({ open: true, action, paymentId });
  };

  const handleCloseConfirmation = () => {
    setConfirmAction({ open: false, action: null, paymentId: null });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction.paymentId) return;
    try {
      if (confirmAction.action === "accept") {
        await acceptPayment(confirmAction.paymentId).unwrap();
        toastShowing("Payment accepted successfully", "bottom-right", 2000, "green", "white");
      } else if (confirmAction.action === "cancel") {
        await cancelPayment(confirmAction.paymentId).unwrap();
        toastShowing("Payment cancelled successfully", "bottom-right", 2000, "green", "white");
      }
      refetch();
    } catch (err) {
      toastShowing(
        (err as { data?: { message?: string } })?.data?.message || `Failed to ${confirmAction.action} payment`,
        "bottom-right",
        2000,
        "red",
        "white"
      );
    } finally {
      handleCloseConfirmation();
    }
  };

  const columns = [
    {
      key: "serial",
      header: "SL",
      render: (_row: AdmissionFeePay, index?: number) => index !== undefined ? index + 1 : "",
    },
    { key: "studentName", header: "Student Name" },
    { key: "studentId", header: "Student ID" },
    {
      key: "admissionFee",
      header: "Admission Fee",
      render: (row: AdmissionFeePay) => `৳ ${row.admissionFee.toFixed(2)}/-`,
    },
    {
      key: "paidAmount",
      header: "Paid Amount",
      render: (row: AdmissionFeePay) => `৳ ${row.paidAmount.toFixed(2)}/-`,
    },
    {
      key: "dueAmount",
      header: "Due Amount",
      render: (row: AdmissionFeePay) => `৳ ${row.dueAmount.toFixed(2)}/-`,
    },
    {
      key: "paymentDate",
      header: "Payment Date",
      render: (row: AdmissionFeePay) => {
        if (!row.paymentDate) return "N/A";
        const dateObj = new Date(row.paymentDate);
        return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row: AdmissionFeePay) => {
        let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "warning";
        if (row.status === "Accepted") color = "success";
        else if (row.status === "Canceled") color = "error";
        return (
          <Chip
            label={row.status}
            color={color}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: AdmissionFeePay) => (
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
              }}
            >
              {row.status === "Pending" && (
                <>
                  <Button
                    onClick={() => {
                      handleOpenConfirmation("accept", row.id);
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
                      "&:hover": { backgroundColor: "rgba(16, 185, 129, 0.08)" },
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => {
                      handleOpenConfirmation("cancel", row.id);
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
                      "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.08)" },
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
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
              sx: { backgroundColor: "transparent", padding: 0, boxShadow: "none" },
            },
          }}
          PopperProps={{
            modifiers: [{ name: "offset", options: { offset: [0, -10] } }],
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
              "&:hover": { backgroundColor: "rgba(100, 116, 139, 0.1)" },
            }}
          >
            <BsThreeDotsVertical size={18} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Admission Fee Payments"
      />

      <AcceptModal
        confirmText="Accept"
        cancelText="Cancel"
        open={confirmAction.open && confirmAction.action === "accept"}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmAction}
        title="Accept Confirmation"
        description="Are you sure you want to accept this payment? This action cannot be undone."
        isLoading={false}
      />

      <DeleteConfirmationModal
        confirmText="Cancel"
        cancelText="Back"
        open={confirmAction.open && confirmAction.action === "cancel"}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmAction}
        title="Cancel Confirmation"
        description="Are you sure you want to cancel this payment? This action cannot be undone."
        isLoading={false}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load admission fee payments
          </Alert>
        ) : payments.length === 0 ? (
          <Typography variant="body1" color="textSecondary" sx={{ mt: 4, textAlign: "center" }}>
            No admission fee payments found.
          </Typography>
        ) : (
          <ReusableTable<AdmissionFeePay> columns={columns} data={payments} />
        )}
      </Paper>
    </Box>
  );
};

export default AdmissionPayList;
