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
import { useCreateExpenseSubcategoryMutation, useDeleteExpenseSubcategoryMutation, useGetAllExpenseSubcategoriesQuery, useUpdateExpenseSubcategoryMutation } from "@/app/store/api/expense/expenseSubCategoryApi";
import AddEditExpenseSubCategory from "@/components/pageComponents/dashboard/admin/expense/AddEditExpenseSubCategory";
import { useGetAllExpenseCategoriesQuery } from "@/app/store/api/expense/expenseCategoryApi";
import { ExpenseSubCategoryFormValues, ExpenseSubCategorySchema } from "../../../super-admin/schemas/expenseSubCategory";
import { theStar } from "@/lib/requiredJSX";




interface ExpenseSubCategory extends ExpenseSubCategoryFormValues {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}


const ExpenseSubCategory = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [currentCategory, setCurrentCategory] = useState<{
    id: number | null;
    data: ExpenseSubCategoryFormValues;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    search: "",
  });

  // Fetch expense categories for the dropdown
  const { data: categoriesData } = useGetAllExpenseCategoriesQuery({});
  const expenseCategories = categoriesData?.data || [];

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllExpenseSubcategoriesQuery({
    page: pagination.page,
    size: pagination.size,
    search: pagination.search,
  });

  const categories: ExpenseSubCategory[] = responseData?.data || [];
  const totalItems = responseData?.total || 0;

  const [createCategory] = useCreateExpenseSubcategoryMutation();
  const [updateCategory] = useUpdateExpenseSubcategoryMutation();
  const [deleteCategory] = useDeleteExpenseSubcategoryMutation();

  const handleOpenModal = (category: ExpenseSubCategory | null = null) => {
    if (category) {
      setCurrentCategory({
        id: category.id,
        data: {
          name: category.name,
          expenseCategoryId: Number(category.expenseCategoryId)
        }
      });
    } else {
      setCurrentCategory({
        id: null,
        data: {
          name: "",
          expenseCategoryId: expenseCategories[0]?.id || 0 // Default to first category if available
        }
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentCategory(null);
    setError(null);
  };

  const handleSubmit = async (data: ExpenseSubCategoryFormValues) => {
    try {
      if (currentCategory?.id) {
        await updateCategory({ id: currentCategory.id, ...data }).unwrap();
        toastShowing("Expense sub category updated successfully", 'bottom-right', 2000, 'green', 'white');
      } else {
        await createCategory(data).unwrap();
        toastShowing("New expense sub category created successfully", 'bottom-right', 2000, 'green', 'white');
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      toastShowing((err as { data?: { message?: string } })?.data?.message || 'OPPS! Something went wrong!'
        , 'bottom-right', 2000, 'red', 'white')
      console.error("Error deleting expense category:", err);
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
      toastShowing("Expense sub category deleted successfully", 'bottom-right', 2000, 'green', 'white');
      refetch();
    } catch (err) {
      toastShowing((err as { data?: { message?: string } })?.data?.message || 'OPPS! Something went wrong!'
        , 'bottom-right', 2000, 'red', 'white')
      console.error("Error deleting expense category:", err);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };



  const columns = [
    {
      key: "serial",
      header: "SL.",
      render: (_row: ExpenseSubCategory, index?: number) =>
        index !== undefined ? (pagination.page - 1) * pagination.size + index + 1 : '',
    },
    {
      key: "name",
      header: "Name",
    },
    {
      key: "expenseCategory",
      header: "Parent Category",
      render: (row: ExpenseSubCategory) => {
        const parentCategory = expenseCategories.find((c: { id: number; }) => c.id === row.expenseCategoryId);
        return parentCategory?.name || 'N/A';
      }
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: ExpenseSubCategory) => (
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
        title="Expense Sub Categories"
        buttonText="Add Sub Category"
        buttonIcon={<Plus size={20} />}
        onButtonClick={() => handleOpenModal()}
      />

      <AddEditExpenseSubCategory
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentCategory}
        isLoading={isLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={currentCategory?.id ? "Edit Expense Sub Category" : "Add Expense Sub Category"}
        schema={ExpenseSubCategorySchema}
        defaultValues={{
          name: "",
          expenseCategoryId: 0,
        }}
        formFields={[
          {
            name: "name",
            label: (
              <span>
                SubCategory Name {theStar}
              </span>
            ),
            gridWidth: 12
          },
          {
            name: "expenseCategoryId",
            label: (
              <span>
                Parent Category {theStar}
              </span>
            ),
            gridWidth: 12,
            type: "select",
            options: expenseCategories.map((category: { id: number; name: string; }) => ({
              value: Number(category.id),
              label: category.name
            }))
          }
        ]}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense Sub Category"
        description="Are you sure you want to delete this expense sub category? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load expense sub categories
          </Alert>
        ) : categories.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No expense sub categories found. Create your first category.
          </Typography>
        ) : (
          <ReusableTable<ExpenseSubCategory>
            columns={columns}
            data={categories}
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
                No expense sub categories found. Create your first category.
              </div>
            }
          />
        )}
      </Paper>
    </Box>
  );
};

export default ExpenseSubCategory;