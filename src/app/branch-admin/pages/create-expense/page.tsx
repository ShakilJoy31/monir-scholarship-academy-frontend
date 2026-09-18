// app/(dashboard)/dashboard/admin/expense/page.tsx
"use client";
import React, { useState, useEffect } from "react";
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
import AddEditExpense from "@/components/pageComponents/dashboard/admin/expense/AddEditExpense";
import { ExpenseFormValues, ExpenseSchema } from "../../../super-admin/schemas/expense";
import Image from "next/image";
import { XCircle } from "lucide-react";
import { useGetAllExpenseCategoriesQuery } from "@/app/store/api/expense/expenseCategoryApi";
import { useGetAllExpenseSubcategoriesQuery } from "@/app/store/api/expense/expenseSubCategoryApi";
import { useGetAllAccountsQuery } from "@/app/store/api/classes/accountApi";
import { useAddThumbnailMutation } from "@/app/store/api/file/fileApi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { AcceptModal } from "@/components/shared/reusable-component/AcceptModal";
import { useAcceptExpenseMutation, useCancelExpenseMutation, useCreateExpenseMutation, useDeleteExpenseMutation, useGetAllExpensesQuery, useGetExpenseByIdQuery, useUpdateExpenseMutation } from "@/app/store/api/expense/expense";
import ViewExpenseModal from "@/components/pageComponents/dashboard/admin/expense/ViewExpenseModal";

interface Expense extends ExpenseFormValues {
  id: number;
  [key: string]: unknown;
}

interface ApiResponse {
  data?: Expense[];
}

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  expenseCategoryId: number;
}

interface Account {
  id: number;
  accountName: string;
  accountType: string;
  accountNumber: string;
}

const Expense = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [currentExpense, setCurrentExpense] = useState<{
    id: number | null;
    data: ExpenseFormValues;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTypeFilter] = useState("All");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    action: 'accept' | 'cancel' | null;
    expenseId: number | null;
  }>({
    open: false,
    action: null,
    expenseId: null,
  });
  const [approveExpense, setApproveExpense] = useState(false);
  const [cancelAnExpense, setCancelExpense] = useState(false);
  const [id, setSelectedExpenseId] = useState<number | null>(null);

  // Fetch expenses
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllExpensesQuery({ page: 1, size: 10, search: "" });

  console.log()

  // Fetch single expense for view modal
  const { data: singleExpenseData, isLoading: isSingleExpenseLoading } = useGetExpenseByIdQuery(
    id,
    { skip: !id }
  );

  // Fetch categories
  const { data: categoriesData } = useGetAllExpenseCategoriesQuery({});

  // Fetch subcategories
  const { data: subcategoriesData } = useGetAllExpenseSubcategoriesQuery({});

  // Fetch accounts for payment methods
  const { data: accountsData } = useGetAllAccountsQuery({
    type: accountTypeFilter,
  });

  console.log(accountsData)

  // Mutation hooks
  const [createExpense, { isLoading: createLoading }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: updateLoading }] = useUpdateExpenseMutation();
  const [deleteExpense, { data: deleteData }] = useDeleteExpenseMutation();
  const [acceptExpenseMutation] = useAcceptExpenseMutation();
  const [cancelExpenseMutation] = useCancelExpenseMutation();

  useEffect(() => {
    if (categoriesData) {
      setCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData.data || []);
    }
  }, [categoriesData]);

  useEffect(() => {
    if (subcategoriesData) {
      setSubcategories(Array.isArray(subcategoriesData) ? subcategoriesData : subcategoriesData.data || []);
    }
  }, [subcategoriesData]);

  useEffect(() => {
    if (accountsData) {
      setAccounts(Array.isArray(accountsData) ? accountsData : accountsData.data || []);
    }
  }, [accountsData]);

  const expenses: Expense[] = Array.isArray(responseData)
    ? responseData
    : (responseData as ApiResponse)?.data || [];

  const handleOpenModal = (expense: Expense | null = null) => {
    if (expense) {
      // Format the date to YYYY-MM-DD format
      const formattedDate = expense.date ? new Date(expense.date).toISOString().split('T')[0] : '';

      setCurrentExpense({
        id: expense.id,
        data: {
          note: expense.note || "",
          expenseCategoryId: expense.expenseCategoryId,
          expenseSubcategoryId: expense.expenseSubcategoryId,
          date: formattedDate,
          image: expense.image || "",
          totalAmount: expense.totalAmount || 0,
          payments: Array.isArray(expense.Payment)
            ? expense.Payment.map(payment => ({
              accountId: payment.accountId,
              paymentAmount: payment.paymentAmount
            }))
            : []
        }
      });
      if (expense.image) {
        setPreview(expense.image);
      }
    } else {
      setCurrentExpense({
        id: null,
        data: {
          note: "",
          expenseCategoryId: 0,
          expenseSubcategoryId: 0,
          date: new Date().toISOString().split('T')[0],
          image: "",
          totalAmount: 0,
          payments: [{ accountId: 0, paymentAmount: 0 }]
        }
      });
      setPreview(null);
      setUploadedImage(undefined);
    }
    setModalOpen(true);
  };

  const handleOpenViewModal = (expenseId: number) => {
    setSelectedExpenseId(expenseId);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedExpenseId(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentExpense(null);
    setError(null);
    setPreview(null);
    setUploadedImage(undefined);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setUploadedImage(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const [addThumbnail] = useAddThumbnailMutation();

  const handleSubmit = async (data: ExpenseFormValues) => {
    try {
      let imageUrl = data.image || "";

      if (uploadedImage) {
        try {
          const formData = new FormData();
          formData.append("photo", uploadedImage);
          const response = await addThumbnail(formData).unwrap();
          imageUrl = response?.data?.[0] || "";
        } catch (error) {
          console.log(error)
          toastShowing("Photo upload error", 'bottom-right', 2000, 'red', 'white');
          return;
        }
      }

      const submissionDate = data.date || new Date().toISOString().split('T')[0];

      // Calculate total amount from payments
      const totalAmount = data.payments?.reduce((sum, payment) => sum + (payment.paymentAmount || 0), 0) || 0;

      const payload = {
        ...data,
        date: submissionDate,
        totalAmount,
        image: imageUrl || undefined,
        note: data?.note || undefined
      };

      if (currentExpense?.id) {
        await updateExpense({ id: currentExpense.id, ...payload }).unwrap();
        toastShowing("Expense updated successfully", 'bottom-right', 2000, 'green', 'white');
      } else {
        await createExpense(payload).unwrap();
        toastShowing("Expense created successfully", 'bottom-right', 2000, 'green', 'white');
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      const errorMessage = (err as { data?: { message?: string } })?.data?.message ||
        (err as Error).message ||
        'An error occurred';

      toastShowing(errorMessage, 'bottom-right', 2000, 'red', 'white');
      setError(errorMessage);
      console.error("Error saving expense:", err);
    }
  };

  const handleDeleteClick = (id: number) => {
    setExpenseToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;

    try {
      setIsDeleting(true);
      await deleteExpense(expenseToDelete).unwrap();
      toastShowing(deleteData?.message || "Expense deleted", 'bottom-right', 2000, 'green', 'white');
      refetch();
    } catch (err) {
      toastShowing('Failed to delete expense', 'bottom-right', 2000, 'red', 'white');
      console.error("Error deleting expense:", err);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleOpenConfirmation = (action: 'accept' | 'cancel', expenseId: number) => {
    if (action === 'accept') {
      setApproveExpense(true);
      setCancelExpense(false);
    } else {
      setApproveExpense(false);
      setCancelExpense(true);
    }
    setConfirmAction({
      open: true,
      action,
      expenseId,
    });
  };

  const handleCloseConfirmation = () => {
    setApproveExpense(false);
    setCancelExpense(false);
    setConfirmAction({
      open: false,
      action: null,
      expenseId: null,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction.expenseId) return;

    try {
      console.log(confirmAction?.expenseId)
      if (confirmAction.action === 'accept') {
        await acceptExpenseMutation({ id: confirmAction.expenseId }).unwrap();
        toastShowing('Expense accepted successfully', 'bottom-right', 2000, 'green', 'white');
      } else if (confirmAction.action === 'cancel') {
        await cancelExpenseMutation({ id: confirmAction.expenseId }).unwrap();
        toastShowing('Expense cancelled successfully', 'bottom-right', 2000, 'green', 'white');
      }
      refetch();
    } catch (err) {
      toastShowing(
        (err as { data?: { message?: string } })?.data?.message ||
        `Failed to ${confirmAction.action} expense`,
        'bottom-right',
        2000,
        'red',
        'white'
      );
    } finally {
      handleCloseConfirmation();
    }
  };

  const columns = [
    {
      key: "serial",
      header: "SL",
      render: (_row: Expense, index?: number) => index !== undefined ? index + 1 : '',
    },
    {
      key: "note",
      header: "Note",
      render: (row: Expense) => row.note ? row.note : "",
    },
    {
      key: "date",
      header: "Date",
      render: (row: Expense) => {
        if (!row.date) return "N/A";
        const dateObj = new Date(row.date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Expense) => {
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
      key: "totalAmount",
      header: "Amount",
      render: (row: Expense) => `BDT ${row.totalAmount?.toFixed(2)}/-`,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Expense) => {
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
                    handleOpenViewModal(row.id);
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

                <Button
                  onClick={() => {
                    handleOpenModal(row)
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
                  Edit
                </Button>

                {row.status === 'Pending' && (
                  <>
                    <Button
                      onClick={() => {
                        handleOpenConfirmation('accept', row.id);
                        setOpenMenuId(null);
                      }}
                      size="small"
                      sx={{
                        color: "#10B981",
                        textTransform: 'none',
                        fontSize: '14px',
                        fontWeight: 400,
                        justifyContent: 'flex-start',
                        padding: '6px 16px',
                        "&:hover": {
                          backgroundColor: "rgba(16, 185, 129, 0.08)",
                        },
                      }}
                    >
                      Accept
                    </Button>

                    <Button
                      onClick={() => {
                        handleOpenConfirmation('cancel', row.id);
                        setOpenMenuId(null);
                      }}
                      size="small"
                      sx={{
                        color: "#EF4444",
                        textTransform: 'none',
                        fontSize: '14px',
                        fontWeight: 400,
                        justifyContent: 'flex-start',
                        padding: '6px 16px',
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
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleDeleteClick(row.id)
                    setOpenMenuId(null);
                  }}
                  size="small"
                  sx={{
                    color: "#DC2626",
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 400,
                    justifyContent: 'flex-start',
                    padding: '6px 16px',
                    "&:hover": {
                      backgroundColor: "rgba(220, 38, 38, 0.08)",
                    },
                    "&.Mui-disabled": {
                      color: "rgba(220, 38, 38, 0.5)"
                    }
                  }}
                >
                  Delete
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
        title="Expenses"
        buttonText="Add Expense"
        buttonIcon={<Plus size={20} />}
        onButtonClick={() => handleOpenModal()}
      />

      <AddEditExpense
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentExpense}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={currentExpense?.id ? "Edit Expense" : "Add Expense"}
        schema={ExpenseSchema}
        defaultValues={{
          note: "",
          expenseCategoryId: 0,
          expenseSubcategoryId: 0,
          date: new Date().toISOString().split('T')[0],
          image: "",
          totalAmount: 0,
          payments: [{ accountId: 0, paymentAmount: 0 }],
        }}
        formFields={[
          {
            name: "expenseCategoryId",
            label: "Category",
            gridWidth: 6,
            type: "select",
            required: true,
            options: categories.map(cat => ({ value: cat.id, label: cat.name })),
          },
          {
            name: "expenseSubcategoryId",
            label: "Subcategory",
            gridWidth: 6,
            type: "select",
            required: true,
            options: subcategories.map(sub => ({ value: sub.id, label: sub.name })),
          },
          {
            name: "date",
            label: "Date",
            gridWidth: 6,
            type: "date"
          },
        ]}
        accounts={accounts}
        expenseSubcategories={subcategories}
        additionalContent={
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Upload Photo
            </label>
            <div className="flex gap-3">
              {preview && (
                <div className="relative w-20 h-20 border rounded-md overflow-hidden mt-2">
                  <Image
                    src={preview}
                    alt="Preview"
                    width={"80"}
                    height={"80"}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    onClick={() => {
                      setPreview(null);
                      setUploadedImage(undefined);
                    }}
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div>
                <div className="border-2 border-dashed rounded-md py-3 px-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-md file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-[#035140] file:text-white
                                      hover:file:bg-[#035140]"
                  />
                </div>
              </div>
            </div>
          </div>
        }
      />

      {/* View Expense Modal */}
      <ViewExpenseModal
        open={viewModalOpen}
        onClose={handleCloseViewModal}
        expenseData={singleExpenseData?.data}
        isLoading={isSingleExpenseLoading}
        onEditClick={() => {
          if (singleExpenseData?.data) {
            handleCloseViewModal();
            handleOpenModal(singleExpenseData.data);
          }
        }}
      />

      {/* Accept Confirmation Modal */}
      <AcceptModal
        confirmText="Accept"
        cancelText="Cancel"
        open={approveExpense}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmAction}
        title="Accept Confirmation"
        description="Are you sure you want to accept this expense? This action cannot be undone."
        isLoading={isDeleting}
      />

      {/* Cancel Confirmation Modal */}
      <DeleteConfirmationModal
        confirmText="Cancel"
        cancelText="Back"
        open={cancelAnExpense}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmAction}
        title="Cancel Confirmation"
        description="Are you sure you want to cancel this expense? This action cannot be undone."
        isLoading={isDeleting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load expenses
          </Alert>
        ) : expenses.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No expenses found. Click Add New Expense to create one.
          </Typography>
        ) : (
          <ReusableTable<Expense>
            columns={columns}
            data={expenses}
          />
        )}
      </Paper>
    </Box>
  );
};

export default Expense;