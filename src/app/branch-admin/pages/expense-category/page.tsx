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
import { useCreateExpenseCategoryMutation, useDeleteExpenseCategoryMutation, useGetAllExpenseCategoriesQuery, useUpdateExpenseCategoryMutation } from "@/app/store/api/expense/expenseCategoryApi";
import AddEditExpenseCategory from "@/components/pageComponents/dashboard/admin/expense/AddEditExpenseCategory";
import { ExpenseCategoryFormValues, ExpenseCategorySchema } from "../../../super-admin/schemas/expenseCategory";


interface ExpenseCategory extends ExpenseCategoryFormValues {
  id: number;
  [key: string]: unknown;
}

interface ApiResponse {
  data?: ExpenseCategory[];
}

const ExpenseCategory = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [currentCategory, setCurrentCategory] = useState<{
    id: number | null;
    data: ExpenseCategoryFormValues;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllExpenseCategoriesQuery({});

  const categories: ExpenseCategory[] = Array.isArray(responseData)
    ? responseData
    : (responseData as ApiResponse)?.data || [];

  const [createCategory, { isLoading: createLoading }] = useCreateExpenseCategoryMutation();
  const [updateCategory, { isLoading: updateLoading }] = useUpdateExpenseCategoryMutation();
  const [deleteCategory, { data: deleteData }] = useDeleteExpenseCategoryMutation();

  const handleOpenModal = (category: ExpenseCategory | null = null) => {
    if (category) {
      setCurrentCategory({ id: category.id, data: { name: category.name } });
    } else {
      setCurrentCategory(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentCategory(null);
    setError(null);
  };

  const handleSubmit = async (data: ExpenseCategoryFormValues) => {
    try {
      if (currentCategory?.id) {
        await updateCategory({ id: currentCategory.id, ...data }).unwrap();
        toastShowing("Expense category updated successfully", 'bottom-right', 2000, 'green', 'white');
      } else {
        await createCategory(data).unwrap();
        toastShowing("Expense category created successfully", 'bottom-right', 2000, 'green', 'white');
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      const errorMessage = (err as { data?: { message?: string } })?.data?.message ||
        (err as Error).message ||
        'An error occurred';

      toastShowing(errorMessage, 'bottom-right', 2000, 'red', 'white');
      setError(errorMessage);
      console.error("Error saving expense category:", err);
    }
  };

  const handleDeleteClick = (id: number) => {
    setCategoryToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      await deleteCategory(categoryToDelete).unwrap();
      toastShowing(deleteData?.message || "Expense category deleted", 'bottom-right', 2000, 'green', 'white');
      refetch();
    } catch (err) {
      toastShowing('Failed to delete expense category', 'bottom-right', 2000, 'red', 'white');
      console.error("Error deleting expense category:", err);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const columns = [
    {
      key: "serial",
      header: "SL.",
      render: (_row: ExpenseCategory, index?: number) => index !== undefined ? index + 1 : '',
    },
    {
      key: "name",
      header: "Name",
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: ExpenseCategory) => (
        <div className="flex gap-2">
          <IconButton
            onClick={() => handleOpenModal(row)}
            
          >
            <Edit className="text-[#035140] hover:bg-[#035140]/10" size={18} />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteClick(row.id)}
            
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
        title="Expense Categories"
        buttonText="Add Category"
        buttonIcon={<Plus size={20} />}
        onButtonClick={() => handleOpenModal()}
      />

      <AddEditExpenseCategory<ExpenseCategoryFormValues>
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentCategory}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={currentCategory?.id ? "Edit Expense Category" : "Add Expense Category"}
        schema={ExpenseCategorySchema}
        defaultValues={{
          name: "",
        }}
        formFields={[
          { name: "name", label: "Category Name", gridWidth: 12 },
        ]}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense Category"
        description="Are you sure you want to delete this expense category? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load expense categories
          </Alert>
        ) : categories.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No expense categories found. Click Add New Category to create one.
          </Typography>
        ) : (
          <ReusableTable<ExpenseCategory>
            columns={columns}
            data={categories}
          />
        )}
      </Paper>
    </Box>
  );
};

export default ExpenseCategory;