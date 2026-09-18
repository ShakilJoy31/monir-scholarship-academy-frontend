// ClassFee.tsx
"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import { useCreateClassFeeMutation, useDeleteClassFeeMutation, useGetAllClassFeesQuery, useUpdateClassFeeMutation } from "@/app/store/api/classes/classFeeApi";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import AddEditClassFee from "@/components/pageComponents/dashboard/admin/classList/AddEditClassFee";
import { AssignFeeFormValues } from "@/app/super-admin/schemas/class/classFeeSchema";

interface IClassFee {
  id: number;
  branchId: number;
  feeType: "MonthlyFee" | "AdmissionFee";
  sessionYearId: number;
  classNameId: number;
  sectionNameId: number;
  streamNameId: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
  class: {
    id: number;
    name: string;
  };
  session: {
    id: number;
    name: string;
  };
  stream: {
    id: number;
    name: string;
  };
  section: {
    id: number;
    name: string;
  };
  [key: string]: unknown;
}

const ClassFee = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [feeToDelete, setFeeToDelete] = useState<number | null>(null);
  const [currentFee, setCurrentFee] = useState<{
    id: number | null;
    data: AssignFeeFormValues;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch class fees data
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllClassFeesQuery({});

  // Fetch dropdown options
  const { data: classes } = useGetAllClassQuery({});
  const { data: sessions } = useGetAllSessionsQuery({});
  const { data: sections } = useGetAllSectionsQuery({});
  const { data: streams } = useGetAllStreamsQuery({});

  // Extract the data array from the response
  const classFees: IClassFee[] = responseData?.data || [];

  const [createFee, { isLoading: createLoading }] = useCreateClassFeeMutation();
  const [updateFee, { isLoading: updateLoading }] = useUpdateClassFeeMutation();
  const [deleteFee, { data: deleteData }] = useDeleteClassFeeMutation();

  const handleOpenModal = (fee: IClassFee | null = null) => {
    if (fee) {
      setCurrentFee({ 
        id: fee.id, 
        data: { 
          feeType: fee.feeType,
          sessionYearId: fee.sessionYearId,
          classNameId: fee.classNameId,
          sectionNameId: fee.sectionNameId,
          streamNameId: fee.streamNameId,
          amount: fee.amount
        } 
      });
    } else {
      setCurrentFee(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentFee(null);
    setError(null);
  };

  const handleSubmit = async (data: AssignFeeFormValues) => {
    try {
      if (currentFee?.id) {
        await updateFee({ id: currentFee.id, ...data }).unwrap();
        toastShowing("Fee updated successfully", 'bottom-right', 2000, 'green', 'white');
      } else {
        await createFee(data).unwrap();
        toastShowing("Fee created successfully", 'bottom-right', 2000, 'green', 'white');
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      const errorMessage = (err as { data?: { message?: string } })?.data?.message ||
        (err as Error).message ||
        'An error occurred';

      toastShowing(errorMessage, 'bottom-right', 2000, 'red', 'white');
      setError(errorMessage);
      console.error("Error saving fee:", err);
    }
  };

  const handleDeleteClick = (id: number) => {
    setFeeToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!feeToDelete) return;

    try {
      setIsDeleting(true);
      await deleteFee(feeToDelete).unwrap();
      toastShowing(deleteData?.message || "Fee deleted", 'bottom-right', 2000, 'green', 'white');
      refetch();
    } catch (err) {
      toastShowing('Failed to delete fee', 'bottom-right', 2000, 'red', 'white');
      console.error("Error deleting fee:", err);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setFeeToDelete(null);
    }
  };

  const columns = [
    {
      key: "serial",
      header: "SL.",
      render: (_row: IClassFee, index?: number) => index !== undefined ? index + 1 : '',
    },
    {
      key: "feeType",
      header: "Fee Type",
      render: (row: IClassFee) => {
        switch(row.feeType) {
          case "MonthlyFee": return "Monthly Fee";
          case "AdmissionFee": return "Admission Fee";
          default: return row.feeType;
        }
      },
    },
    {
      key: "session",
      header: "Session Year",
      render: (row: IClassFee) => row.session?.name || 'N/A',
    },
    {
      key: "class",
      header: "Class",
      render: (row: IClassFee) => row.class?.name || 'N/A',
    },
    {
      key: "section",
      header: "Section",
      render: (row: IClassFee) => row.section?.name || 'N/A',
    },
    {
      key: "stream",
      header: "Stream",
      render: (row: IClassFee) => row.stream?.name || 'N/A',
    },
    {
      key: "amount",
      header: "Amount",
      render: (row: IClassFee) => `৳ ${row.amount}`,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: IClassFee) => (
        <div className="flex gap-2">
          <IconButton onClick={() => handleOpenModal(row)}>
            <Edit className="text-[#035140] hover:bg-[#035140]/10" size={18} />
          </IconButton>
          <IconButton onClick={() => handleDeleteClick(row.id)}>
            <Trash2 className="text-red-500 hover:text-red-600" size={18} />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Monthly Fees"
        buttonText="Add Fee"
        buttonIcon={<Plus size={20} />}
        onButtonClick={() => handleOpenModal()}
      />

      <AddEditClassFee
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentFee}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={currentFee?.id ? "Edit Fee" : "Add Fee"}
        classes={classes?.data || []}
        sessions={sessions?.data || []}
        sections={sections?.data || []}
        streams={streams?.data || []}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Fee"
        description="Are you sure you want to delete this fee? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load fees
          </Alert>
        ) : classFees.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No fees found. Click Add New Fee to create one.
          </Typography>
        ) : (
          <ReusableTable<IClassFee>
            columns={columns}
            data={classFees}
          />
        )}
      </Paper>
    </Box>
  );
};

export default ClassFee;