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
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { AdmissionPeriodFormValues } from "@/app/super-admin/schemas/admission/admissionPeriodSchema";
import { useCreateAdmissionPeriodMutation, useDeleteAdmissionPeriodMutation, useGetAllAdmissionPeriodsQuery, useUpdateAdmissionPeriodMutation } from "@/app/store/api/admission/admissionApi";
import AddEditAdmissionPeriod from "@/components/pageComponents/dashboard/admin/admission/AddEditAdmissionPeriod";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";

interface IAdmissionPeriod {
  id: number;
  sessionYearId: number;
  content: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  session: {
    id: number;
    name: string;
  };
  [key: string]: unknown;
}

const AdmissionPeriod = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [periodToDelete, setPeriodToDelete] = useState<number | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<{
    id: number | null;
    data: AdmissionPeriodFormValues;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch admission periods data
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllAdmissionPeriodsQuery({});

  // Fetch sessions for dropdown
  const { data: sessions } = useGetAllSessionsQuery({});

  // Extract the data array from the response
  const admissionPeriods: IAdmissionPeriod[] = responseData?.data || [];

  const [createPeriod, { isLoading: createLoading }] = useCreateAdmissionPeriodMutation();
  const [updatePeriod, { isLoading: updateLoading }] = useUpdateAdmissionPeriodMutation();
  const [deletePeriod, { data: deleteData }] = useDeleteAdmissionPeriodMutation();

  const handleOpenModal = (period: IAdmissionPeriod | null = null) => {
    if (period) {
      setCurrentPeriod({
        id: period.id,
        data: {
          sessionYearId: period.sessionYearId,
          content: period.content,
          startDate: period.startDate,
          endDate: period.endDate,
          isActive: period.isActive
        }
      });
    } else {
      setCurrentPeriod(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentPeriod(null);
    setError(null);
  };

  //   const handleSubmit = async (data: AdmissionPeriodFormValues) => {
  //     try {
  //       if (currentPeriod?.id) {
  //         await updatePeriod({ id: currentPeriod.id, ...data }).unwrap();
  //         toastShowing("Admission period updated successfully", 'bottom-right', 2000, 'green', 'white');
  //       } else {
  //         await createPeriod(data).unwrap();
  //         toastShowing("Admission period created successfully", 'bottom-right', 2000, 'green', 'white');
  //       }
  //       handleCloseModal();
  //       refetch();
  //     } catch (err) {
  //       const errorMessage = (err as { data?: { message?: string } })?.data?.message ||
  //         (err as Error).message ||
  //         'An error occurred';

  //       toastShowing(errorMessage, 'bottom-right', 2000, 'red', 'white');
  //       setError(errorMessage);
  //       console.error("Error saving admission period:", err);
  //     }
  //   };

  const handleSubmit = async (data: AdmissionPeriodFormValues) => {
    try {
      console.log('Form data before submission:', data);
      console.log('Current period ID:', currentPeriod?.id);

      if (currentPeriod?.id) {
        const updatePayload = {
          id: currentPeriod.id,
          data: {
            sessionYearId: data.sessionYearId,
            content: data.content,
            startDate: data.startDate,
            endDate: data.endDate,
            isActive: data.isActive
          }
        };
        console.log('Update payload:', updatePayload);

        const result = await updatePeriod(updatePayload).unwrap();
        console.log('Update API response:', result);

        toastShowing("Admission period updated successfully", 'bottom-right', 2000, 'green', 'white');
      } else {
        console.log('Create payload:', data);
        const result = await createPeriod(data).unwrap();
        console.log('Create API response:', result);
        toastShowing("Admission period created successfully", 'bottom-right', 2000, 'green', 'white');
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      console.error("Full error object:", err);
      const errorMessage = (err as { data?: { message?: string } })?.data?.message ||
        (err as Error).message ||
        'An error occurred';
      setError(errorMessage);
      toastShowing(errorMessage, 'bottom-right', 2000, 'red', 'white');
    }
  };

  const handleDeleteClick = (id: number) => {
    setPeriodToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!periodToDelete) return;

    try {
      setIsDeleting(true);
      await deletePeriod(periodToDelete).unwrap();
      toastShowing(deleteData?.message || "Admission period deleted", 'bottom-right', 2000, 'green', 'white');
      refetch();
    } catch (err) {
      toastShowing('Failed to delete admission period', 'bottom-right', 2000, 'red', 'white');
      console.error("Error deleting admission period:", err);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setPeriodToDelete(null);
    }
  };

const columns = [
  {
    key: "serial",
    header: "SL.",
    render: (_row: IAdmissionPeriod, index?: number) => (
      <div className="">
        {index !== undefined ? index + 1 : ''}
      </div>
    ),
    headerClassName: "",
  },
  {
    key: "session",
    header: "Session Year",
    render: (row: IAdmissionPeriod) => (
      <div className="">
        {row.session?.name || 'N/A'}
      </div>
    ),
    headerClassName: "",
  },
  {
    key: "content",
    header: "Content",
    render: (row: IAdmissionPeriod) => (
      <div className="lg:w-auto w-[480]">
        {row.content
          ? (row.content.length > 50
            ? `${row.content.slice(0, 50)}...`
            : row.content)
          : buttonLoader}
      </div>
    ),
    headerClassName: "lg:w-auto w-[480]",
  },
  {
    key: "dates",
    header: "Period",
    render: (row: IAdmissionPeriod) => (
      <div className="lg:w-auto w-48">
        {`${new Date(row.startDate).toLocaleDateString()} - ${new Date(row.endDate).toLocaleDateString()}`}
      </div>
    ),
    headerClassName: "lg:w-auto w-48",
  },
  {
    key: "isActive",
    header: "Status",
    render: (row: IAdmissionPeriod) => (
      <div className="">
        <Box
          sx={{
            backgroundColor: row.isActive ? "#035140" : "#d32f2f",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            display: "inline-block",
          }}
        >
          {row.isActive ? "Active" : "Inactive"}
        </Box>
      </div>
    ),
    headerClassName: "",
  },
  {
    key: "actions",
    header: "Actions",
    render: (row: IAdmissionPeriod) => (
      <div className="">
        <div className="flex gap-2 justify-center">
          <IconButton onClick={() => handleOpenModal(row)}>
            <Edit className="text-[#035140] hover:bg-[#035140]/10" size={18} />
          </IconButton>
          <IconButton onClick={() => handleDeleteClick(row.id)}>
            <Trash2 className="text-red-500 hover:text-red-600" size={18} />
          </IconButton>
        </div>
      </div>
    ),
    headerClassName: "",
  },
];

  return (
    <Box>
      <PageHeader
        title="Admission Periods"
        buttonText="Add Period"
        buttonIcon={<Plus size={20} />}
        onButtonClick={() => handleOpenModal()}
      />

      <AddEditAdmissionPeriod
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentPeriod}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={currentPeriod?.id ? "Edit Admission Period" : "Add Admission Period"}
        sessions={sessions?.data || []}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Admission Period"
        description="Are you sure you want to delete this admission period? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load admission periods
          </Alert>
        ) : admissionPeriods.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No admission periods found. Click Add New Period to create one.
          </Typography>
        ) : (
          <ReusableTable<IAdmissionPeriod>
            columns={columns}
            data={admissionPeriods}
          />
        )}
      </Paper>
    </Box>
  );
};

export default AdmissionPeriod;