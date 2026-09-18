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
import { Plus, Edit, Trash2 } from "lucide-react";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import { 
  useCreateTeacherSalaryMutation, 
  useDeleteTeacherSalaryMutation, 
  useGetAllTeacherSalariesQuery, 
  useUpdateTeacherSalaryMutation 
} from "@/app/store/api/teacher/teacherSalaryApi";
import AddEditTeacherSalary from "@/components/pageComponents/dashboard/admin/teacher/AddEditTeacherSalary";
import { useGetAllTeachersQuery } from "@/app/store/api/teacher/teacherApi";
import { TeacherSalaryFormValues, TeacherSalarySchema } from "@/app/super-admin/schemas/teacherSalary";

interface TeacherSalary extends TeacherSalaryFormValues {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  teacherName?: string;
  [key: string]: unknown;
}

const TeacherSalary = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [salaryToDelete, setSalaryToDelete] = useState<number | null>(null);
  const [currentSalary, setCurrentSalary] = useState<{
    id: number | null;
    data: TeacherSalaryFormValues;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
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
  } = useGetAllTeacherSalariesQuery({
    page: pagination.page,
    size: pagination.size,
    search: pagination.search,
  });

  const salaries: TeacherSalary[] = responseData?.data || [];
  const totalItems = responseData?.total || 0;

  const [createSalary] = useCreateTeacherSalaryMutation();
  const [updateSalary] = useUpdateTeacherSalaryMutation();
  const [deleteSalary] = useDeleteTeacherSalaryMutation();

  const handleOpenModal = (salary: TeacherSalary | null = null) => {
    if (salary) {
      setCurrentSalary({ 
        id: salary.id, 
        data: {
          teacherId: Number(salary.teacherId),
          baseSalary: Number(salary.baseSalary)
        }
      });
    } else {
      setCurrentSalary({
        id: null,
        data: {
          teacherId: teachers[0]?.id || 0,
          baseSalary: 0
        }
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentSalary(null);
    setError(null);
  };

  const handleSubmit = async (data: TeacherSalaryFormValues) => {
    try {
      if (currentSalary?.id) {
        await updateSalary({ id: currentSalary.id, ...data }).unwrap();
        toastShowing("Teacher salary updated successfully", 'bottom-right', 2000, 'green', 'white');
      } else {
        await createSalary(data).unwrap();
        toastShowing("New teacher salary created successfully", 'bottom-right', 2000, 'green', 'white');
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      toastShowing(
        (err as { data?: { message?: string } })?.data?.message || 'Oops! Something went wrong!',
        'bottom-right', 2000, 'red', 'white'
      );
      console.error("Error saving teacher salary:", err);
    }
  };

  const handleDeleteClick = (id: number) => {
    setSalaryToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!salaryToDelete) return;

    try {
      setIsDeleting(true);
      await deleteSalary(salaryToDelete).unwrap();
      toastShowing("Teacher salary deleted successfully", 'bottom-right', 2000, 'green', 'white');
      refetch();
    } catch (err) {
      toastShowing(
        (err as { data?: { message?: string } })?.data?.message || 'Oops! Something went wrong!',
        'bottom-right', 2000, 'red', 'white'
      );
      console.error("Error deleting teacher salary:", err);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setSalaryToDelete(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const columns = [
    {
      key: "serial",
      header: "SL.",
      render: (_row: TeacherSalary, index?: number) => 
        index !== undefined ? (pagination.page - 1) * pagination.size + index + 1 : '',
    },
    {
      key: "teacherName",
      header: "Teacher Name",
      render: (row: TeacherSalary) => {
        const teacher = teachers.find((t: { id: number; }) => t.id === row.teacherId);
        return teacher?.name || 'N/A';
      }
    },
    {
      key: "baseSalary",
      header: "Base Salary",
      render: (row: TeacherSalary) => `BDT ${row.baseSalary?.toFixed(2)}`
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: TeacherSalary) => (
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
            <Trash2 className="text-red-500 hover:text-red-600" size={18} />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Teacher Salaries"
        buttonText="Add Salary"
        buttonIcon={<Plus size={20} />}
        onButtonClick={() => handleOpenModal()}
      />

      <AddEditTeacherSalary
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentSalary}
        isLoading={isLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={currentSalary?.id ? "Edit Teacher Salary" : "Add Teacher Salary"}
        schema={TeacherSalarySchema}
        defaultValues={{
          teacherId: 0,
          baseSalary: 0,
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
            name: "baseSalary",
            label: "Base Salary",
            gridWidth: 12,
            type: "number"
          }
        ]}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Teacher Salary"
        description="Are you sure you want to delete this teacher salary? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load teacher salaries
          </Alert>
        ) : salaries.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No teacher salaries found. Create your first salary record.
          </Typography>
        ) : (
          <ReusableTable<TeacherSalary>
            columns={columns}
            data={salaries}
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
                No teacher salaries found. Create your first salary record.
              </div>
            }
          />
        )}
      </Paper>
    </Box>
  );
};

export default TeacherSalary;