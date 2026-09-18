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
} from "@mui/material";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import {
  useCreateBulkTeacherSalaryAssignMutation,
  useCreateTeacherSalaryAssignMutation,
  useDeleteTeacherSalaryAssignMutation,
  useGetAllTeacherSalaryAssignsQuery,
  useUpdateTeacherSalaryAssignMutation
} from "@/app/store/api/teacher/teacherSalaryApi";
import AddEditTeacherSalaryAssign from "@/components/pageComponents/dashboard/admin/teacher/AddEditTeacherSalaryAssign";
import { useGetAllTeachersQuery } from "@/app/store/api/teacher/teacherApi";
import { TeacherSalaryAssignFormValues, TeacherSalaryAssignSchema } from "@/app/super-admin/schemas/teacherSalaryAssign";
import { BulkTeacherSalaryAssignFormValues } from "@/app/super-admin/schemas/bulkTeacherSalaryAssign";
import AddBulkTeacherSalaryAssign from "@/components/pageComponents/dashboard/admin/teacher/AddBulkTeacherSalaryAssign";

interface TeacherSalaryAssign extends TeacherSalaryAssignFormValues {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  teacherName?: string;
  status?: string;
  [key: string]: unknown;

}

const TeacherSalaryAssign = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [assignToDelete, setAssignToDelete] = useState<number | null>(null);
  const [currentAssign, setCurrentAssign] = useState<{
    id: number | null;
    data: TeacherSalaryAssignFormValues;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [bulkModalOpen, setBulkModalOpen] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    search: "",
  });

  // Fetch teachers for the dropdown
  const { data: teachersData } = useGetAllTeachersQuery({});
  const teachers = teachersData?.data || [];

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllTeacherSalaryAssignsQuery({
    page: pagination.page,
    size: pagination.size,
    search: pagination.search,
  });

  const assignments: TeacherSalaryAssign[] = responseData?.data || [];
  const totalItems = responseData?.total || 0;

  const [createAssign] = useCreateTeacherSalaryAssignMutation();
  const [updateAssign] = useUpdateTeacherSalaryAssignMutation();
  const [deleteAssign] = useDeleteTeacherSalaryAssignMutation();
  const [createBulkAssign] =
    useCreateBulkTeacherSalaryAssignMutation();

  const handleOpenModal = (assign: TeacherSalaryAssign | null = null) => {
    if (assign) {
      setCurrentAssign({
        id: assign.id,
        data: {
          teacherId: Number(assign.teacherId),
          month: assign.month
        }
      });
    } else {
      setCurrentAssign({
        id: null,
        data: {
          teacherId: teachers[0]?.id || 0,
          month: "January" // Default to January
        }
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentAssign(null);
    setError(null);
  };

  const handleSubmit = async (data: TeacherSalaryAssignFormValues) => {
    try {
      if (currentAssign?.id) {
        await updateAssign({ id: currentAssign.id, ...data }).unwrap();
        toastShowing("Salary assignment updated successfully", 'bottom-right', 2000, 'green', 'white');
      } else {
        await createAssign(data).unwrap();
        toastShowing("New salary assignment created successfully", 'bottom-right', 2000, 'green', 'white');
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      toastShowing(
        (err as { data?: { message?: string } })?.data?.message || 'Oops! Something went wrong!',
        'bottom-right', 2000, 'red', 'white'
      );
      console.error("Error saving salary assignment:", err);
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
      toastShowing("Salary assignment deleted successfully", 'bottom-right', 2000, 'green', 'white');
      refetch();
    } catch (err) {
      toastShowing(
        (err as { data?: { message?: string } })?.data?.message || 'Oops! Something went wrong!',
        'bottom-right', 2000, 'red', 'white'
      );
      console.error("Error deleting salary assignment:", err);
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

  const handleBulkSubmit = async (data: BulkTeacherSalaryAssignFormValues) => {
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

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const columns = [
    {
      key: "serial",
      header: "SL.",
      render: (_row: TeacherSalaryAssign, index?: number) =>
        index !== undefined ? (pagination.page - 1) * pagination.size + index + 1 : '',
    },
    {
      key: "teacherName",
      header: "Teacher Name",
      render: (row: TeacherSalaryAssign) => {
        const teacher = teachers.find((t: { id: number; }) => t.id === row.teacherId);
        return teacher?.name || 'N/A';
      }
    },
    {
      key: "month",
      header: "Month",
    },
    {
      key: "year",
      header: "Year",
    },
    {
      key: "baseSalary",
      header: "Salary",
      render: (row: TeacherSalaryAssign) => row.baseSalary || '0'
    },
    {
      key: "advance",
      header: "Advance",
      render: (row: TeacherSalaryAssign) => row.advance || '0'
    },
    {
      key: "status",
      header: "Status",
      render: (row: TeacherSalaryAssign) => <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          backgroundColor: row.status === 'UnPaid' ? 'error.light' : 'success.light',
          color: row.status === 'UnPaid' ? 'error.contrastText' : 'success.contrastText',
          fontSize: '0.75rem',
          fontWeight: 500,
        }}
      >
        {row.status}
      </Box>
    },
    {
      key: "createdAt",
      header: "Date",
      render: (row: TeacherSalaryAssign) => {
        if (!row.createdAt) return "N/A";
        const dateObj = new Date(row.createdAt);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: TeacherSalaryAssign) => (
        <div className="flex gap-2">
          <IconButton
            onClick={() => handleOpenModal(row)}
            className="text-[#035140] hover:bg-[#035140]/10"
          >
            <Edit className="text-[#035140] hover:bg-[#035140]/10" size={18} />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteClick(row.id)}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            <Trash2 className="text-red-500  hover:text-red-600" size={18} />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <Box>
      <div className="flex w-full justify-end gap-2 items-center">

        <PageHeader
          title="Teacher Salary Assign"
          buttonText="Assign Salary"
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

      <AddEditTeacherSalaryAssign
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentAssign}
        isLoading={isLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={currentAssign?.id ? "Edit Salary Assign" : "Add Salary Assign"}
        schema={TeacherSalaryAssignSchema}
        defaultValues={{
          teacherId: 0,
          month: "January",
        }}
        formFields={[
          {
            name: "teacherId",
            label: "Teacher",
            gridWidth: 12,
            type: "select",
            options: teachers.map((teacher: {
              teacherUniqueId: string; id: number; name: string;
            }) => ({
              value: Number(teacher.id),
              label: `${teacher.name} (${teacher.teacherUniqueId})` // Combine name and ID
            }))
          },
          {
            name: "month",
            label: "Month",
            gridWidth: 12,
            type: "select",
            options: months.map(month => ({
              value: month,
              label: month
            }))
          }
        ]}
      />

      <AddBulkTeacherSalaryAssign
        open={bulkModalOpen}
        onClose={handleCloseBulkModal}
        onSubmit={handleBulkSubmit}
        isLoading={isLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={"Add Bulk Salary Assign"}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Salary Assignment"
        description="Are you sure you want to delete this salary assignment? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load salary assignments
          </Alert>
        ) : assignments.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No salary assignments found. Create your first assignment.
          </Typography>
        ) : (
          <ReusableTable<TeacherSalaryAssign>
            columns={columns}
            data={assignments}
            className="mt-4"
            isLoading={isLoading}
            pagination={{
              totalItems: totalItems,
              currentPage: pagination.page,
              itemsPerPage: pagination.size,
              onPageChange: handlePageChange
            }}
            emptyState={
              <div className="py-8 text-center text-gray-500">
                No salary assignments found. Create your first assignment.
              </div>
            }
          />
        )}
      </Paper>
    </Box>
  );
};

export default TeacherSalaryAssign;