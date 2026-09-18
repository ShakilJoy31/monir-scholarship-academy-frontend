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
import { useCreateExamFeesMutation, useDeleteExamFeesMutation, useGetAllExamFeesQuery, useUpdateExamFeesMutation } from "@/app/store/api/classes/examFeesApi";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import { useGetAllExamsQuery } from "@/app/store/api/classes/examApi";
import AddEditExamFee from "@/components/pageComponents/dashboard/admin/feesManagement/AddEditExamFee";

interface IExamFee {
  id: number;
  branchId: number;
  examNameId: number;
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
  exam: {
    id: number;
    name: string;
  };
  [key: string]: unknown;
}

const ExamFee = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [feeToDelete, setFeeToDelete] = useState<number | null>(null);
  const [currentFee, setCurrentFee] = useState<{
    id: number | null;
    data: {
      sessionYearId: number;
      classNameId: number;
      sectionNameId: number;
      streamNameId: number;
      examNameId: number;
      amount: number;
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch exam fees data
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllExamFeesQuery({});

  // Fetch dropdown options
  const { data: classes } = useGetAllClassQuery({});
  const { data: sessions } = useGetAllSessionsQuery({});
  const { data: sections } = useGetAllSectionsQuery({});
  const { data: streams } = useGetAllStreamsQuery({});
  const { data: exams } = useGetAllExamsQuery({});

  // Extract the data array from the response
  const examFees: IExamFee[] = responseData?.data || [];

  const [createFee, { isLoading: createLoading }] = useCreateExamFeesMutation();
  const [updateFee, { isLoading: updateLoading }] = useUpdateExamFeesMutation();
  const [deleteFee, { data: deleteData }] = useDeleteExamFeesMutation();

  const handleOpenModal = (fee: IExamFee | null = null) => {
    if (fee) {
      setCurrentFee({ 
        id: fee.id, 
        data: { 
          sessionYearId: fee.sessionYearId,
          classNameId: fee.classNameId,
          sectionNameId: fee.sectionNameId,
          streamNameId: fee.streamNameId,
          examNameId: fee.examNameId,
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

  const handleSubmit = async (data: {
    sessionYearId: number;
    classNameId: number;
    sectionNameId: number;
    streamNameId: number;
    examNameId: number;
    amount: number;
  }) => {
    try {
      if (currentFee?.id) {
        await updateFee({ id: currentFee.id, ...data }).unwrap();
        toastShowing("Exam fee updated successfully", 'bottom-right', 2000, 'green', 'white');
      } else {
        await createFee(data).unwrap();
        toastShowing("Exam fee created successfully", 'bottom-right', 2000, 'green', 'white');
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      const errorMessage = (err as { data?: { message?: string } })?.data?.message ||
        (err as Error).message ||
        'An error occurred';

      toastShowing(errorMessage, 'bottom-right', 2000, 'red', 'white');
      setError(errorMessage);
      console.error("Error saving exam fee:", err);
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
      toastShowing(deleteData?.message || "Exam fee deleted", 'bottom-right', 2000, 'green', 'white');
      refetch();
    } catch (err) {
      toastShowing('Failed to delete exam fee', 'bottom-right', 2000, 'red', 'white');
      console.error("Error deleting exam fee:", err);
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
      render: (_row: IExamFee, index?: number) => index !== undefined ? index + 1 : '',
    },
    {
      key: "exam",
      header: "Exam",
      render: (row: IExamFee) => row.exam?.name || 'N/A',
    },
    {
      key: "session",
      header: "Session Year",
      render: (row: IExamFee) => row.session?.name || 'N/A',
    },
    {
      key: "class",
      header: "Class",
      render: (row: IExamFee) => row.class?.name || 'N/A',
    },
    {
      key: "section",
      header: "Section",
      render: (row: IExamFee) => row.section?.name || 'N/A',
    },
    {
      key: "stream",
      header: "Stream",
      render: (row: IExamFee) => row.stream?.name || 'N/A',
    },
    {
      key: "amount",
      header: "Amount",
      render: (row: IExamFee) => `৳ ${row.amount}`,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: IExamFee) => (
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
        title="Exam Fees"
        buttonText="Add Exam Fee"
        buttonIcon={<Plus size={20} />}
        onButtonClick={() => handleOpenModal()}
      />

      <AddEditExamFee
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentFee}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={currentFee?.id ? "Edit Exam Fee" : "Add Exam Fee"}
        classes={classes?.data || []}
        sessions={sessions?.data || []}
        sections={sections?.data || []}
        streams={streams?.data || []}
        exams={exams?.data || []}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Exam Fee"
        description="Are you sure you want to delete this exam fee? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load exam fees
          </Alert>
        ) : examFees.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No exam fees found. Click Add New Exam Fee to create one.
          </Typography>
        ) : (
          <ReusableTable<IExamFee>
            columns={columns}
            data={examFees}
          />
        )}
      </Paper>
    </Box>
  );
};

export default ExamFee;