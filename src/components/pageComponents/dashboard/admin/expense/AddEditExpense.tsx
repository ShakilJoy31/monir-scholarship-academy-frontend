"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { ExpenseFormValues } from "@/app/super-admin/schemas/expense";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { ZodType } from "zod";
import { XCircle } from "lucide-react";
import Image from "next/image";
import { useAddThumbnailMutation } from "@/app/store/api/file/fileApi";
import { theStar } from "@/lib/requiredJSX";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { zodCustomResolver } from "../admission/AddEditAdmissionOnlineFee";

interface FormField {
  name: keyof ExpenseFormValues;
  label: string;
  gridWidth: number;
  type?: "text" | "number" | "date" | "select";
  options?: { value: string | number; label: string }[];
  onChange?: (value: string | number) => void;
  disabled?: boolean;
  required?: boolean;
}

interface AddEditExpenseProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormValues) => void;
  currentData: { id: number | null; data: ExpenseFormValues } | null;
  isLoading: boolean;
  error: string | null;
  onErrorDismiss: () => void;
  title: string;
  schema: ZodType<ExpenseFormValues>;
  defaultValues: ExpenseFormValues;
  formFields: FormField[];
  accounts: Array<{
    id: number;
    accountName: string;
    accountType: string;
    accountNumber?: string;
    currentBalance?: number;
  }>;
  expenseSubcategories: Array<{
    id: number;
    name: string;
    expenseCategoryId: number;
  }>;
  additionalContent?: React.ReactNode;
}

const AddEditExpense = ({
  open,
  onClose,
  onSubmit,
  currentData,
  isLoading,
  error,
  onErrorDismiss,
  title,
  schema,
  defaultValues,
  formFields,
  accounts,
  expenseSubcategories,
}: AddEditExpenseProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm<ExpenseFormValues>({
    resolver: zodCustomResolver(schema),
    defaultValues: currentData?.data || defaultValues,
  });

  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [localUploadedImage, setLocalUploadedImage] = useState<File | undefined>(undefined);
  const [addThumbnail] = useAddThumbnailMutation();
  const [isUploading, setIsUploading] = useState(false);

  const {
    fields: paymentFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "payments",
  });

  const payments = watch("payments");
  const selectedCategory = watch("expenseCategoryId");
  const totalExpenseAmount = payments?.reduce(
    (sum, payment) => sum + (payment.paymentAmount || 0),
    0
  );

  // Filter subcategories based on selected category
  const filteredSubcategories = selectedCategory
    ? expenseSubcategories.filter(sub => sub.expenseCategoryId === selectedCategory)
    : [];

  useEffect(() => {
    if (currentData) {
      reset(currentData.data);
      if (currentData.data.image) {
        setLocalPreview(currentData.data.image);
      }
    } else {
      reset(defaultValues);
      setLocalPreview(null);
    }
  }, [currentData, reset, defaultValues]);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (localPreview && localPreview.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setLocalUploadedImage(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setLocalPreview(previewUrl);
      setValue("image", previewUrl);
    }
  };

  const handleFormSubmit = async (data: ExpenseFormValues) => {
    try {
      // Validate cash accounts
      const cashAccountIds = accounts
        .filter((account) => account.accountType === "cash")
        .map((account) => account.id);

      const selectedCashAccounts = (data.payments || [])
        .map((payment) => payment.accountId)
        .filter((accountId): accountId is number =>
          accountId !== undefined && cashAccountIds.includes(accountId)
        );

      const hasDuplicateCash = selectedCashAccounts.length !== new Set(selectedCashAccounts).size;

      if (hasDuplicateCash) {
        setError("payments", {
          type: "manual",
          message: "You can only select one cash account per expense",
        });
        return;
      }

      // Validate account balances
      const hasInsufficientBalance = data.payments?.some((payment) => {
        if (payment.paymentAmount === undefined) return false;

        const account = accounts.find((acc) => acc.id === payment.accountId);
        if (!account || account.currentBalance === undefined) return false;

        return payment.paymentAmount > account.currentBalance;
      }) ?? false;

      if (hasInsufficientBalance) {
        setError("payments", {
          type: "manual",
          message: "Payment amount cannot exceed the account's current balance",
        });
        return;
      }

      clearErrors("payments");

      // Handle image upload if there's a new image
      let imageUrl = currentData?.data.image || "";
      if (localUploadedImage) {
        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append("photo", localUploadedImage);
          const response = await addThumbnail(formData).unwrap();
          imageUrl = response?.data?.[0] || "";
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          setError("image", {
            type: "manual",
            message: "Failed to upload image",
          });
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // Submit the form with all data including the image URL
      onSubmit({
        ...data,
        image: imageUrl
      });
    } catch (err) {
      console.error("Error in form submission:", err);
    }
  };

  const handleRemoveImage = () => {
    if (localPreview && localPreview.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(null);
    setLocalUploadedImage(undefined);
    setValue("image", "");
  };

  const isAccountDisabled = (accountId: number, currentIndex: number) => {
    if (!payments) return false;
    const selectedAccountIds = payments
      .filter((_, index) => index !== currentIndex)
      .map((payment) => payment.accountId);
    return selectedAccountIds.includes(accountId);
  };

  const getAccountBalance = (accountId: number) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account?.currentBalance || 0;
  };

  const enhancedFormFields = formFields.map((field) => {
    if (field.name === "expenseSubcategoryId") {
      return {
        ...field,
        disabled: !selectedCategory,
        options: filteredSubcategories.map(sub => ({
          value: sub.id,
          label: sub.name
        }))
      };
    }
    return field;
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: "white", color: "black", py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="md:flex grid gap-4">
          <Typography variant="h6">{title}</Typography>
          <Typography variant="h6">(Total Expense {totalExpenseAmount || 0})</Typography>
        </div>

        <IconButton onClick={onClose} sx={{ color: 'red' }}>
          <XCircle />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" onClose={onErrorDismiss} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {errors.payments?.message && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.payments.message as string}
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enhancedFormFields.map((field) => (
              <div
                key={field.name}
                className={`
            ${field.gridWidth === 12 ? 'col-span-1 md:col-span-2 lg:col-span-3' :
                    field.gridWidth === 8 ? 'col-span-1 md:col-span-2' :
                      'col-span-1'}
          `}
              >
                <Controller
                  name={field.name}
                  control={control}
                  render={({ field: { onChange, value, ref } }) => (
                    <div>
                      <label className="font-semibold text-sm md:text-base">
                        {field.label}
                        {field.required && theStar}
                      </label>
                      {field.type === "select" ? (
                        <select
                          ref={ref}
                          value={value?.toString() || ""}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            const finalValue =
                              field.name === "expenseCategoryId" ||
                                field.name === "expenseSubcategoryId"
                                ? Number(newValue)
                                : newValue;
                            onChange(finalValue);
                            if (field.onChange) field.onChange(finalValue);
                          }}
                          disabled={field.disabled}
                          className={`w-full p-2 text-sm md:text-base rounded border border-gray-300 mt-1 ${field.disabled ? 'bg-gray-100' : 'bg-white'
                            }`}
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map((option) => (
                            <option key={option.value.toString()} value={option.value.toString()}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "date" ? (
                        <input
                          type="date"
                          value={value?.toString().substring(0, 10) || new Date().toISOString().substring(0, 10)}
                          onChange={(e) => onChange(e.target.value)}
                          className="w-full p-2 text-sm md:text-base rounded border border-gray-300 mt-1"
                        />
                      ) : field.type === "text" ? (
                        <input
                          type="text"
                          value={String(value || "")}
                          onChange={(e) => onChange(e.target.value)}
                          placeholder={field.label}
                          className="w-full p-2 text-sm md:text-base rounded border border-gray-300 mt-1"
                        />
                      ) : null}
                      {errors[field.name]?.message && (
                        <div className="text-red-500 text-xs md:text-sm">
                          {errors[field.name]?.message as string}
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
            <Box className="w-full md:w-2/3 flex flex-col">
              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col flex-1">
                    <label className="font-semibold text-sm md:text-base">Note</label>
                    <textarea
                      value={String(field.value || "")}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="Note"
                      className="w-full p-2 text-sm md:text-base rounded border border-gray-300 mt-1 flex-1 min-h-[80px]"
                      style={{ height: '100%' }}
                    />
                    {errors.note?.message && (
                      <div className="text-red-500 text-xs md:text-sm">
                        {errors.note?.message as string}
                      </div>
                    )}
                  </div>
                )}
              />
            </Box>

            <Box className="w-full md:w-1/3 flex flex-col">
              <label className="block text-sm md:text-base font-medium text-gray-700">
                Upload Photo
              </label>
              <div className="flex flex-col sm:flex-row gap-3 mt-2 flex-1">
                {localPreview && (
                  <div className="relative w-20 h-20 border rounded-md overflow-hidden">
                    <Image
                      width={"80"}
                      height={"80"}
                      src={localPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      onClick={handleRemoveImage}
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div className="w-full flex flex-col justify-between">
                  <div className="border-2 border-dashed rounded-md py-3 px-3 h-full flex items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-xs sm:text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-xs sm:text-sm file:font-semibold
                file:bg-[#035140] file:text-white
                hover:file:bg-[#035140]"
                    />
                  </div>
                </div>
              </div>
            </Box>
          </div>

           <Box mt={3}>
            <Typography
              fontWeight={600}
              mb={2}
              fontSize={{ xs: "0.875rem", sm: "1rem" }}
            >
              Payment Methods {theStar}
            </Typography>

            {paymentFields.map((item, index) => (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { sm: "center" },
                  gap: 2,
                  mb: 2,
                  p: 2,
                  backgroundColor: "#f9f9f9",
                  borderRadius: 1,
                  border: "1px solid #eee",
                }}
              >
                {/* Account Dropdown */}
                <Box
                  sx={{
                    flex: 1,
                    minWidth: { xs: "100%", sm: 200 },
                    width: "100%",
                  }}
                >
                  <Controller
                    name={`payments.${index}.accountId`}
                    control={control}
                    render={({ field }) => (
                      <div>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          mb={0.5}
                        >
                          Account
                        </Typography>
                        <select
                          value={field.value?.toString() || ""}
                          onChange={(e) => {
                            const newValue = Number(e.target.value);
                            field.onChange(newValue);
                            clearErrors("payments");
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: errors.payments?.[index]?.accountId
                              ? "1px solid #d32f2f"
                              : "1px solid #ccc",
                            backgroundColor: "white",
                            fontSize: "14px",
                          }}
                        >
                          <option value="">Select payment account</option>
                          {accounts.map((account) => {
                            const isCashAccount =
                              account.accountType === "cash";
                            const isDisabled =
                              isAccountDisabled(account.id, index) ||
                              (isCashAccount &&
                                payments?.some(
                                  (payment, i) =>
                                    i !== index &&
                                    payment.accountId === account.id
                                ));

                            return (
                              <option
                                key={account.id}
                                value={account.id}
                                disabled={isDisabled}
                              >
                                {account.accountType} - {account.currentBalance}
                                {isDisabled ? " (already selected)" : ""}
                              </option>
                            );
                          })}
                        </select>
                        {errors.payments?.[index]?.accountId?.message && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ display: "block", mt: 0.5 }}
                          >
                            {
                              errors.payments?.[index]?.accountId
                                ?.message as string
                            }
                          </Typography>
                        )}
                      </div>
                    )}
                  />
                </Box>

                {/* Amount Input */}
                <Box
                  sx={{
                    flex: 1,
                    minWidth: { xs: "100%", sm: 150 },
                    width: "100%",
                  }}
                >
                  <Controller
                    name={`payments.${index}.paymentAmount`}
                    control={control}
                    render={({ field }) => {
                      const accountId = payments?.[index]?.accountId;
                      const currentBalance = accountId
                        ? getAccountBalance(accountId)
                        : 0;

                      return (
                        <div>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            mb={0.5}
                          >
                            Amount
                          </Typography>
                          <input
                            type="number"
                            value={field.value?.toString() || ""}
                            onChange={(e) => {
                              const value =
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value);
                              if (value <= currentBalance) {
                                field.onChange(value);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (accountId) {
                                const currentValue = field.value || 0;
                                const newValue = Number(
                                  `${currentValue}${e.key}`
                                );
                                if (
                                  newValue > currentBalance &&
                                  ![
                                    "Backspace",
                                    "Delete",
                                    "ArrowLeft",
                                    "ArrowRight",
                                  ].includes(e.key)
                                ) {
                                  e.preventDefault();
                                }
                              }
                            }}
                            placeholder="0.00"
                            disabled={!accountId}
                            style={{
                              width: "100%",
                              padding: "8px",
                              borderRadius: "4px",
                              border:
                                errors.payments?.[index]?.paymentAmount ||
                                  (field.value || 0) > currentBalance
                                  ? "1px solid #d32f2f"
                                  : "1px solid #ccc",
                              backgroundColor: !accountId ? "#f5f5f5" : "white",
                              fontSize: "14px",
                            }}
                            max={currentBalance}
                          />
                          {errors.payments?.[index]?.paymentAmount?.message && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ display: "block", mt: 0.5 }}
                            >
                              {
                                errors.payments?.[index]?.paymentAmount
                                  ?.message as string
                              }
                            </Typography>
                          )}
                        </div>
                      );
                    }}
                  />
                </Box>

                {/* Delete Button (with space preserved for index 0) */}
                <Box
                  sx={{
                    alignSelf: { xs: "flex-end", sm: "flex-end" },
                    mb: { xs: 0, sm: 1 },
                    mt: { xs: 1, sm: 0 },
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {index > 0 ? (
                    <IconButton
                      onClick={() => remove(index)}
                      color="error"
                      size="small"
                      sx={{
                        backgroundColor: "rgba(211, 47, 47, 0.08)",
                        "&:hover": {
                          backgroundColor: "rgba(211, 47, 47, 0.2)",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        visibility: "hidden",
                      }}
                    >
                      <IconButton disabled size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}

            {/* Add Payment Button */}
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              sx={{
                mt: 1,
                py: 1,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                background: "#035140",
                color: "white",
              }}
              onClick={() => append({ accountId: 0, paymentAmount: 0 })}
            >
              Add Payment Method
            </Button>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 1, sm: 3 }, pb: 2 }}>

          <CancelButton
            onClick={onClose}
            disabled={isLoading || isUploading}
          />

          <SubmitButton
            disabled={isLoading || isUploading}
          />

        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddEditExpense;