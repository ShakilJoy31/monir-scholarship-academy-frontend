"use client";
import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Typography,
  IconButton,
  Box,
  Avatar,
  Modal,
} from "@mui/material";
import { Controller, useFieldArray } from "react-hook-form";
import DeleteIcon from "@mui/icons-material/Delete";
import z, { ZodType } from "zod";
import { XCircle, X } from "lucide-react";
import { theStar } from "@/lib/requiredJSX";
import { AdmissionFeePayFormValues } from "@/app/super-admin/schemas/admission/admissionFeeOnlineSchema";
import { AdmissionFeePayment } from "../../../../../../types/onlineFeeInterface";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";

export const zodCustomResolver = (schema: z.ZodSchema) => {
  return (values: unknown) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return {
        values: result.data,
        errors: {}
      };
    }

    // Format errors to match react-hook-form's expected structure
    const errors: Record<string, { message: string }> = {};
    if (result.error) {
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = { message: err.message };
      });
    }

    return {
      values: {},
      errors
    };
  };
};

interface AddEditAdmissionOnlineFeeProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AdmissionFeePayFormValues) => void;
  currentData: { id: number | null; data: AdmissionFeePayFormValues; isEdit?: boolean } | null;
  isLoading: boolean;
  error: string | null;
  onErrorDismiss: () => void;
  title: string;
  schema: ZodType<AdmissionFeePayFormValues>;
  defaultValues: AdmissionFeePayFormValues;
  accounts: Array<{
    id: number;
    accountName: string;
    accountType: string;
    accountNumber?: string;
    currentBalance?: number;
  }>;
  feePaymentData?: AdmissionFeePayment;
  mode: "view" | "pay"; // Add mode prop to distinguish between view and pay modes
}

const AddEditAdmissionOnlineFee = ({
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
  accounts,
  feePaymentData,
  mode, // Add mode prop
}: AddEditAdmissionOnlineFeeProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
    clearErrors,
    setValue,
  } = useForm<AdmissionFeePayFormValues>({
    resolver: zodCustomResolver(schema),
    defaultValues: currentData?.data || defaultValues,
  });


  const {
    fields: paymentFields,
    // append,
    remove,
  } = useFieldArray({
    control,
    name: "payments",
  });


  const payments = watch("payments");
  const totalAmount = payments?.reduce(
    (sum, payment) => sum + (payment.paymentAmount || 0),
    0
  );

  useEffect(() => {
    if (currentData?.isEdit && feePaymentData) {
      const editData = {
        admissionId: feePaymentData.admissionId,
        studentName: feePaymentData.admission?.name || "",
        amount: feePaymentData.amount,
        note: feePaymentData.note || "",
        payments: feePaymentData.Payment?.map((payment: { accountId: number, paymentAmount: number }) => ({
          accountId: payment.accountId,
          paymentAmount: payment.paymentAmount,
        })),
      };
      reset(editData);
    } else if (currentData) {
      reset(currentData.data);
    } else {
      reset(defaultValues);
    }
  }, [currentData, reset, defaultValues, feePaymentData]);

  const handleFormSubmit = async (data: AdmissionFeePayFormValues) => {
    console.log("check data", data)
    try {
      // Validate cash accounts
      const cashAccountIds = accounts
        .filter((account) => account.accountType === "cash")
        .map((account) => account.id);

      const selectedCashAccounts = (data.payments || [])
        .map((payment) => payment.accountId)
        .filter(
          (accountId): accountId is number =>
            accountId !== undefined && cashAccountIds.includes(accountId)
        );

      const hasDuplicateCash =
        selectedCashAccounts.length !== new Set(selectedCashAccounts).size;

      if (hasDuplicateCash) {
        setError("payments", {
          type: "manual",
          message: "You can only select one cash account per payment",
        });
        return;
      }

      // Validate account balances
      // const hasInsufficientBalance =
      //   data.payments?.some((payment) => {
      //     if (payment.paymentAmount === undefined) return false;

      //     const account = accounts.find((acc) => acc.id === payment.accountId);
      //     if (!account || account.currentBalance === undefined) return false;

      //     return payment.paymentAmount > account.currentBalance;
      //   }) ?? false;

      // if (hasInsufficientBalance) {
      //   setError("payments", {
      //     type: "manual",
      //     message: "Payment amount cannot exceed the account's current balance",
      //   });
      //   return;
      // }

      // Validate total amount doesn't exceed the fee amount
      const feeAmount = currentData?.data.amount || 0;
      if (totalAmount > feeAmount) {
        setError("payments", {
          type: "manual",
          message: `Total payment cannot exceed the fee amount of ${feeAmount}`,
        });
        return;
      }

      clearErrors("payments");

      // Submit the form
      onSubmit(data);
    } catch (err) {
      console.error("Error in form submission:", err);
    }
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

  const handleAmountChange = (value: number, index: number) => {
    const feeAmount = currentData?.data.amount || 0;
    const currentPayments = [...(payments || [])];

    // Calculate the sum of all other payments
    const otherPaymentsSum = currentPayments.reduce((sum, payment, i) => {
      if (i !== index) {
        return sum + (payment.paymentAmount || 0);
      }
      return sum;
    }, 0);

    // Calculate the maximum allowed for this payment
    const maxAllowed = feeAmount - otherPaymentsSum;
    const adjustedValue = Math.min(value, maxAllowed);

    // Update the payment amount
    setValue(`payments.${index}.paymentAmount`, adjustedValue);
  };

  if (mode === "view") {
    return (
      <AnimatePresence>
        {open && currentData && (
          <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
                duration: 0.3
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                position: 'relative',
                padding: '2rem',
                borderRadius: '6px',
                outline: 'none',
                width: '480px',
                maxWidth: '95%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: `
                  linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,252,251,0.98)),
                  radial-gradient(circle at top left, rgba(26,60,52,0.03), transparent 60%)
                `,
              }}
            >
              {/* Floating close button */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '-12px',
                  zIndex: 1,
                }}
              >
                <IconButton
                  onClick={onClose}
                  sx={{
                    backgroundColor: '#1A3C34',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(26, 60, 52, 0.2)',
                    '&:hover': {
                      backgroundColor: '#0F2922',
                    }
                  }}
                >
                  <X size={18} />
                </IconButton>
              </motion.div>

              {/* Header with decorative accent */}
              <Box sx={{ position: 'relative', mb: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: '#1A3C34',
                    position: 'relative',
                    display: 'inline-block',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-8px',
                      left: 0,
                      width: '48px',
                      height: '4px',
                      background: 'linear-gradient(90deg, #1A3C34, rgba(26,60,52,0.3))',
                      borderRadius: '2px',
                    }
                  }}
                >
                  Payment Details
                </Typography>
              </Box>

              {/* Payment details */}
              <Box sx={{ display: 'grid', gap: 2 }}>
                {/* Student Information */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="textSecondary">Student:</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {currentData.data.studentName || feePaymentData?.admission?.name}
                  </Typography>
                </Box>

                {/* Application ID */}
                {feePaymentData?.admission?.applicationId && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="textSecondary">Application ID:</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {feePaymentData.admission.applicationId}
                    </Typography>
                  </Box>
                )}

                {/* Amount */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="textSecondary">Amount:</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {currentData.data.amount}
                  </Typography>
                </Box>

                {/* Payment Method */}
                {feePaymentData?.Payment?.length && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="textSecondary">Payment Method:</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {feePaymentData.Payment.map(payment => {
                        const account = accounts.find(acc => acc.id === payment.accountId);
                        return account ? `${account.accountType} - ${account.accountName}` : '';
                      }).join(', ')}
                    </Typography>
                  </Box>
                )}

                {/* Note */}
                {feePaymentData?.note && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="textSecondary">Note:</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {feePaymentData.note}
                    </Typography>
                  </Box>
                )}

              </Box>

              {/* Close button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <CancelButton
                  onClick={onClose}
                  sx={{
                    backgroundColor: '#1A3C34',
                    borderRadius: '6px',
                    px: 3,
                    py: 1,
                    fontWeight: 500,
                    boxShadow: '0 4px 16px rgba(26, 60, 52, 0.3)',
                    '&:hover': {
                      backgroundColor: '#0F2922',
                      boxShadow: '0 6px 20px rgba(26, 60, 52, 0.4)',
                    },
                  }}
                >
                  Close
                </CancelButton>
              </Box>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    );
  }

  // Payment form (original implementation)
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: "white",
          color: "black",
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="md:flex grid gap-4">
          <Typography variant="h6">{title}</Typography>
          <Typography variant="h6">
            (Total Payment: {totalAmount || 0})
          </Typography>
        </div>
        <IconButton onClick={onClose} sx={{ color: "red" }}>
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

          {/* Student Information Section */}
          {(currentData?.data.studentName || feePaymentData?.admission) && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Student Information
              </Typography>
              <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} flexWrap="wrap" gap={2}>
                {/* First Section - Name and ID */}
                <Box flex={{ xs: '1 0 100%', sm: '1 0 calc(50% - 16px)', md: '1 0 calc(25% - 16px)' }} minWidth={0}>
                  <Box display="flex" alignItems="center" gap={2}>
                    {feePaymentData?.admission?.avatar && (
                      <Avatar
                        src={feePaymentData.admission.avatar}
                        sx={{ width: 56, height: 56 }}
                      />
                    )}
                    <div>
                      <Typography variant="subtitle1">
                        {feePaymentData?.admission?.name || currentData?.data.studentName}
                      </Typography>
                      {feePaymentData?.admission?.applicationId && (
                        <Typography variant="body2" color="textSecondary">
                          <strong>Application ID:</strong> {feePaymentData.admission.applicationId}
                        </Typography>
                      )}
                    </div>
                  </Box>
                </Box>

                {/* Fee Amount Section */}
                <Box flex={{ xs: '1 0 100%', sm: '1 0 calc(50% - 16px)', md: '1 0 calc(25% - 16px)' }} minWidth={0}>
                  <Typography variant="body2">
                    <strong>Fee Amount:</strong> {currentData?.data.amount}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

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
                                {account.accountType} - {account.accountName}
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
                      const feeAmount = currentData?.data.amount || 0;

                      // Calculate maximum allowed for this payment
                      const otherPaymentsSum = (payments || []).reduce((sum, payment, i) => {
                        if (i !== index) {
                          return sum + (payment.paymentAmount || 0);
                        }
                        return sum;
                      }, 0);
                      const maxAllowed = feeAmount - otherPaymentsSum;

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
                              const value = e.target.value === "" ? 0 : Number(e.target.value);
                              handleAmountChange(value, index);
                            }}
                            onKeyDown={(e) => {
                              if (accountId) {
                                const currentValue = field.value || 0;
                                const newValue = Number(`${currentValue}${e.key}`);
                                if (
                                  (newValue > currentBalance || newValue > maxAllowed) &&
                                  !["Backspace", "Delete", "ArrowLeft", "ArrowRight"].includes(e.key)
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
                                  (field.value || 0) > currentBalance ||
                                  (field.value || 0) > maxAllowed
                                  ? "1px solid #d32f2f"
                                  : "1px solid #ccc",
                              backgroundColor: !accountId ? "#f5f5f5" : "white",
                              fontSize: "14px",
                            }}
                          // max={Math.min(currentBalance, maxAllowed)}
                          />
                          {errors.payments?.[index]?.paymentAmount?.message && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ display: "block", mt: 0.5 }}
                            >
                              {errors.payments?.[index]?.paymentAmount?.message as string}
                            </Typography>
                          )}
                          {(field.value || 0) > maxAllowed && (
                            <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                              Amount exceeds remaining fee balance
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
            {/* <Button
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
              // disabled={totalAmount >= (currentData?.data.amount || 0)}
            >
              Add Payment Method
            </Button> */}
          </Box>

          <Box mt={3}>
            <Controller
              name="note"
              control={control}
              render={({ field }) => (
                <div>
                  <Typography variant="body2" color="textSecondary" mb={0.5}>
                    Note
                  </Typography>
                  <textarea
                    value={String(field.value || "")}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="Add any notes here"
                    style={{
                      width: "100%",
                      minHeight: "80px",
                      padding: "8px",
                      borderRadius: "4px",
                      border: errors.note
                        ? "1px solid #d32f2f"
                        : "1px solid #ccc",
                      fontSize: "14px",
                    }}
                  />
                  {errors.note?.message && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      {errors.note?.message as string}
                    </Typography>
                  )}
                </div>
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 1, sm: 3 }, pb: 2 }}>
          <CancelButton
            onClick={onClose}
            sx={{
              backgroundColor: "#d32f2f",
              color: "white",
              "&:hover": {
                backgroundColor: "#b71c1c",
              },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              padding: { xs: "6px 8px", sm: "6px 12px" },
            }}
            disabled={isLoading}
          >
            Cancel
          </CancelButton>

          <SubmitButton
            type="submit"
            disabled={isLoading || totalAmount !== (currentData?.data.amount || 0)}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : currentData?.isEdit ? (
              "Update"
            ) : (
              "Submit"
            )}
          </SubmitButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddEditAdmissionOnlineFee;