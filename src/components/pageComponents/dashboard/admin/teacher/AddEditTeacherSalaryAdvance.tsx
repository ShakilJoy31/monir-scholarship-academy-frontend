// "use client";
// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   CircularProgress,
//   Alert,
//   Typography,
//   IconButton,
//   Box,
//   InputLabel,
// } from "@mui/material";
// import { useForm, Controller, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import AddIcon from "@mui/icons-material/Add";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { ZodType } from "zod";
// import { XCircle } from "lucide-react";
// import { theStar } from "@/lib/requiredJSX";
// import { TeacherSalaryAdvanceFormValues } from "@/app/super-admin/schemas/teacherSalaryAdvance";
// import CancelButton from "@/components/shared/reusable-component/CancelButton";
// import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

// interface FormField {
//   name: keyof TeacherSalaryAdvanceFormValues;
//   label: string;
//   gridWidth: number;
//   type?: "text" | "number" | "date" | "select";
//   options?: { value: string | number; label: string }[];
//   onChange?: (value: string | number) => void;
//   disabled?: boolean;
//   required?: boolean;
// }

// interface AddEditTeacherSalaryAdvanceProps {
//   open: boolean;
//   onClose: () => void;
//   onSubmit: (data: TeacherSalaryAdvanceFormValues) => void;
//   currentData: {
//     id: number | null;
//     data: TeacherSalaryAdvanceFormValues;
//   } | null;
//   isLoading: boolean;
//   error: string | null;
//   onErrorDismiss: () => void;
//   title: string;
//   schema: ZodType<TeacherSalaryAdvanceFormValues>;
//   defaultValues: TeacherSalaryAdvanceFormValues;
//   formFields: FormField[];
//   accounts: Array<{
//     id: number;
//     accountName: string;
//     bankName: string;
//     accountType: string;
//     accountNumber?: string;
//     currentBalance?: number;
//   }>;
// }

// const AddEditTeacherSalaryAdvance = ({
//   open,
//   onClose,
//   onSubmit,
//   currentData,
//   isLoading,
//   error,
//   onErrorDismiss,
//   title,
//   schema,
//   defaultValues,
//   formFields,
//   accounts,
// }: AddEditTeacherSalaryAdvanceProps) => {
//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     watch,
//     setError,
//     clearErrors,
//   } = useForm<TeacherSalaryAdvanceFormValues>({
//     resolver: zodResolver(schema),
//     defaultValues: currentData?.data || defaultValues,
//   });

//   console.log("controll", control)

//   const {
//     fields: paymentFields,
//     append,
//     remove,
//   } = useFieldArray({
//     control,
//     name: "payments",
//   });

//   const payments = watch("payments");
//   const totalAdvanceAmount = payments?.reduce(
//     (sum, payment) => sum + (payment.paymentAmount || 0),
//     0
//   );

//   const [baseSalary, setBaseSalary] = useState(0)

//   React.useEffect(() => {
//     if (currentData) {
//       reset(currentData.data);
//     } else {
//       reset(defaultValues);
//     }
//   }, [currentData, reset, defaultValues]);

//   const handleFormSubmit = async (data: TeacherSalaryAdvanceFormValues) => {
//     try {
//       // Calculate total amount from payments
//       const totalAmount = data.payments?.reduce(
//         (sum, payment) => sum + (payment.paymentAmount || 0),
//         0
//       );

//       // Validate cash accounts
//       const cashAccountIds = accounts
//         .filter((account) => account.accountType === "cash")
//         .map((account) => account.id);

//       const selectedCashAccounts = (data.payments || [])
//         .map((payment) => payment.accountId)
//         .filter(
//           (accountId): accountId is number =>
//             accountId !== undefined && cashAccountIds.includes(accountId)
//         );

//       const hasDuplicateCash =
//         selectedCashAccounts.length !== new Set(selectedCashAccounts).size;

//       if (hasDuplicateCash) {
//         setError("payments", {
//           type: "manual",
//           message: "You can only select one cash account per advance",
//         });
//         return;
//       }

//       // Validate account balances
//       const hasInsufficientBalance =
//         data.payments?.some((payment) => {
//           if (payment.paymentAmount === undefined) return false;

//           const account = accounts.find((acc) => acc.id === payment.accountId);
//           if (!account || account.currentBalance === undefined) return false;

//           return payment.paymentAmount > account.currentBalance;
//         }) ?? false;

//       if (hasInsufficientBalance) {
//         setError("payments", {
//           type: "manual",
//           message: "Payment amount cannot exceed the account's current balance",
//         });
//         return;
//       }

//       // Create the payload with the calculated amount
//       const payload = {
//         ...data,
//         amount: totalAmount || 0, // Add the calculated amount here
//         note: data?.note || undefined,
//       };

//       clearErrors("payments");
//       onSubmit(payload);
//     } catch (err) {
//       console.error("Error in form submission:", err);
//     }
//   };

//   const isAccountDisabled = (accountId: number, currentIndex: number) => {
//     if (!payments) return false;
//     const selectedAccountIds = payments
//       .filter((_, index) => index !== currentIndex)
//       .map((payment) => payment.accountId);
//     return selectedAccountIds.includes(accountId);
//   };

//   const getAccountBalance = (accountId: number) => {
//     const account = accounts.find((acc) => acc.id === accountId);
//     return account?.currentBalance || 0;
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
//       <DialogTitle
//         sx={{
//           py: 2,
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 items-baseline">
//           <Typography variant="h6" className="text-lg sm:text-xl">
//             {title}
//           </Typography>
//           <Typography variant="h6" className="text-base sm:text-xl">

//             (Total Advance {totalAdvanceAmount || 0})
//           </Typography>
//           <Typography variant="h6" className="text-base sm:text-xl">

//             (Base Salary {baseSalary})
//           </Typography>
//         </div>

//         <IconButton onClick={onClose} sx={{ color: "red" }}>
//           <XCircle />
//         </IconButton>
//       </DialogTitle>

//       <form onSubmit={handleSubmit(handleFormSubmit)}>
//         <DialogContent sx={{ pt: 3 }}>
//           {error && (
//             <Alert severity="error" onClose={onErrorDismiss} sx={{ mb: 2 }}>
//               {error}
//             </Alert>
//           )}

//           {errors.payments?.message && (
//             <Alert severity="error" sx={{ mb: 2 }}>
//               {errors.payments.message as string}
//             </Alert>
//           )}

//           <div className="grid grid-cols-12 gap-4">
//             {formFields.map((field) => (
//               <div key={field.name} className={`col-span-6`}>
//                 <Controller
//                   name={field.name}
//                   control={control}
//                   render={({ field: { onChange, value, ref } }) => (
//                     <div>
//                       <InputLabel className="font-semibold">
//                         {field.label}
//                         {field.required && theStar}
//                       </InputLabel>
//                       {field.type === "select" ? (
//                         <select
//                           ref={ref}
//                           value={value?.toString() || ""}
//                           onChange={(e) => {
//                             const newValue = e.target.value;
//                             const finalValue =
//                               typeof value === "number"
//                                 ? Number(newValue)
//                                 : newValue;
//                             onChange(finalValue);
//                             if (field.onChange) field.onChange(finalValue);
//                           }}
//                           disabled={field.disabled}
//                           className={`w-full p-2.5 rounded border border-gray-300 mt-1 ${
//                             field.disabled ? "bg-gray-100" : "bg-white"
//                           }`}
//                         >
//                           <option value="">Select {field.label}</option>
//                           {field.options?.map((option) => (
//                             <option
//                               key={option.value.toString()}
//                               value={option.value.toString()}
//                             >
//                               {option.label}
//                             </option>
//                           ))}
//                         </select>
//                       ) : null}
//                       {errors[field.name]?.message && (
//                         <div className="text-red-500 text-xs">
//                           {errors[field.name]?.message as string}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 />
//               </div>
//             ))}
//           </div>

//           <Box mt={3}>
//             <Typography fontWeight={600} mb={2}>
//               Payment Methods {theStar}
//             </Typography>

//             {paymentFields.map((item, index) => (
//               <Box
//                 key={item.id}
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 2,
//                   mb: 2,
//                   p: 2,
//                   backgroundColor: "#f9f9f9",
//                   borderRadius: 1,
//                   border: "1px solid #eee",
//                 }}
//               >
//                 <Box sx={{ flex: 1, minWidth: 200 }}>
//                   <Controller
//                     name={`payments.${index}.accountId`}
//                     control={control}
//                     render={({ field }) => (
//                       <div>
//                         <Typography
//                           variant="body2"
//                           color="textSecondary"
//                           mb={0.5}
//                         >
//                           Account
//                         </Typography>
//                         <select
//                           value={field.value?.toString() || ""}
//                           onChange={(e) => {
//                             const newValue = Number(e.target.value);
//                             field.onChange(newValue);
//                             clearErrors("payments");
//                           }}
//                           style={{
//                             width: "100%",
//                             padding: "10px",
//                             borderRadius: "4px",
//                             border: errors.payments?.[index]?.accountId
//                               ? "1px solid #d32f2f"
//                               : "1px solid #ccc",
//                             backgroundColor: "white",
//                           }}
//                         >
//                           <option value="">Select payment account</option>
//                           {accounts.map((account) => {
//                             const isCashAccount =
//                               account.accountType === "cash";
//                             const isDisabled =
//                               isAccountDisabled(account.id, index) ||
//                               (isCashAccount &&
//                                 payments?.some(
//                                   (payment, i) =>
//                                     i !== index &&
//                                     payment.accountId === account.id
//                                 ));

//                             return (
//                               <option
//                                 key={account.id}
//                                 value={account.id}
//                                 disabled={isDisabled}
//                               >
//                                 {account.bankName} - {account.currentBalance}
//                                 {isDisabled ? " (already selected)" : ""}
//                               </option>
//                             );
//                           })}
//                         </select>
//                         {errors.payments?.[index]?.accountId?.message && (
//                           <Typography
//                             variant="caption"
//                             color="error"
//                             sx={{ display: "block", mt: 0.5 }}
//                           >
//                             {
//                               errors.payments?.[index]?.accountId
//                                 ?.message as string
//                             }
//                           </Typography>
//                         )}
//                       </div>
//                     )}
//                   />
//                 </Box>

//                 <Box sx={{ flex: 1, minWidth: 150 }}>
//                   <Controller
//                     name={`payments.${index}.paymentAmount`}
//                     control={control}
//                     render={({ field }) => {
//                       const accountId = payments?.[index]?.accountId;
//                       const currentBalance = accountId
//                         ? getAccountBalance(accountId)
//                         : 0;

//                       return (
//                         <div>
//                           <Typography
//                             variant="body2"
//                             color="textSecondary"
//                             mb={0.5}
//                           >
//                             Amount
//                           </Typography>
//                           <input
//                             type="number"
//                             value={field.value?.toString() || ""}
//                             onChange={(e) => {
//                               const value =
//                                 e.target.value === ""
//                                   ? 0
//                                   : Number(e.target.value);
//                               if (value <= currentBalance) {
//                                 field.onChange(value);
//                               }
//                             }}
//                             onKeyDown={(e) => {
//                               if (accountId) {
//                                 const currentValue = field.value || 0;
//                                 const newValue = Number(
//                                   `${currentValue}${e.key}`
//                                 );
//                                 if (
//                                   newValue > currentBalance &&
//                                   e.key !== "Backspace" &&
//                                   e.key !== "Delete" &&
//                                   e.key !== "ArrowLeft" &&
//                                   e.key !== "ArrowRight"
//                                 ) {
//                                   e.preventDefault();
//                                 }
//                               }
//                             }}
//                             placeholder="0.00"
//                             disabled={!accountId}
//                             style={{
//                               width: "100%",
//                               padding: "10px",
//                               borderRadius: "4px",
//                               border:
//                                 errors.payments?.[index]?.paymentAmount ||
//                                 (field.value || 0) > currentBalance
//                                   ? "1px solid #d32f2f"
//                                   : "1px solid #ccc",
//                               backgroundColor: !accountId ? "#f5f5f5" : "white",
//                             }}
//                             max={currentBalance}
//                           />
//                           {errors.payments?.[index]?.paymentAmount?.message && (
//                             <Typography
//                               variant="caption"
//                               color="error"
//                               sx={{ display: "block", mt: 0.5 }}
//                             >
//                               {
//                                 errors.payments?.[index]?.paymentAmount
//                                   ?.message as string
//                               }
//                             </Typography>
//                           )}
//                         </div>
//                       );
//                     }}
//                   />
//                 </Box>

//                 <Box sx={{ alignSelf: "flex-end", mb: 1 }}>
//                   <IconButton
//                     onClick={() => remove(index)}
//                     color="error"
//                     size="small"
//                     sx={{
//                       backgroundColor: "rgba(211, 47, 47, 0.08)",
//                       "&:hover": {
//                         backgroundColor: "rgba(211, 47, 47, 0.2)",
//                       },
//                     }}
//                   >
//                     <DeleteIcon fontSize="small" />
//                   </IconButton>
//                 </Box>
//               </Box>
//             ))}

//             <Button
//               startIcon={<AddIcon />}
//               variant="outlined"
//               sx={{
//                 mt: 1,
//                 py: 1.5,
//                 fontSize: "0.875rem",
//                 color: "#035140", // Text color
//                 borderColor: "#035140", // Border color
//                 "&:hover": {
//                   backgroundColor: "rgba(3, 81, 64, 0.08)", // Light hover effect
//                   borderColor: "#035140", // Keep border color on hover
//                 },
//               }}
//               onClick={() => append({ accountId: 0, paymentAmount: 0 })}
//             >
//               Add Payment Method
//             </Button>
//           </Box>

//           <Box mt={3}>
//             <Controller
//               name="note"
//               control={control}
//               render={({ field }) => (
//                 <div>
//                   <label className="font-semibold">Note</label>
//                   <textarea
//                     value={String(field.value || "")}
//                     onChange={(e) => field.onChange(e.target.value)}
//                     placeholder="Note"
//                     className="w-full p-2.5 rounded border border-gray-300 mt-1"
//                     rows={3}
//                   />
//                   {errors.note?.message && (
//                     <div className="text-red-500 text-xs">
//                       {errors.note?.message as string}
//                     </div>
//                   )}
//                 </div>
//               )}
//             />
//           </Box>
//         </DialogContent>

//         <DialogActions sx={{ px: 3, pb: 2 }}>

//           <CancelButton onClick={onClose}>
//             Cancel
//           </CancelButton>
//           <SubmitButton
//             type="submit"
//             disabled={isLoading}
//             sx={{
//               backgroundColor: "#035140",
//               "&:hover": {
//                 backgroundColor: "#024030",
//               },
//             }}
//           >
//             {isLoading ? (
//               <CircularProgress size={24} color="inherit" />
//             ) : currentData?.id ? (
//               "Update"
//             ) : (
//               "Submit"
//             )}
//           </SubmitButton>
//         </DialogActions>
//       </form>
//     </Dialog>
//   );
// };

// export default AddEditTeacherSalaryAdvance;



"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Typography,
  IconButton,
  Box,
  InputLabel,
} from "@mui/material";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { ZodType } from "zod";
import { XCircle } from "lucide-react";
import { theStar } from "@/lib/requiredJSX";
import { TeacherSalaryAdvanceFormValues } from "@/app/super-admin/schemas/teacherSalaryAdvance";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import toast from "react-hot-toast";

interface FormField {
  name: keyof TeacherSalaryAdvanceFormValues;
  label: string;
  gridWidth: number;
  type?: "text" | "number" | "date" | "select";
  options?: { value: string | number; label: string }[];
  onChange?: (value: string | number) => void;
  disabled?: boolean;
  required?: boolean;
}

interface Teacher {
  id: number;
  name: string;
  teacherUniqueId: string;
  TeacherSalary?: {
    id: number;
    branchId: number;
    teacherId: number;
    baseSalary: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface AddEditTeacherSalaryAdvanceProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TeacherSalaryAdvanceFormValues) => void;
  currentData: {
    id: number | null;
    data: TeacherSalaryAdvanceFormValues;
  } | null;
  isLoading: boolean;
  error: string | null;
  onErrorDismiss: () => void;
  title: string;
  schema: ZodType<TeacherSalaryAdvanceFormValues>;
  defaultValues: TeacherSalaryAdvanceFormValues;
  formFields: FormField[];
  accounts: Array<{
    id: number;
    accountName: string;
    bankName: string;
    accountType: string;
    accountNumber?: string;
    currentBalance?: number;
  }>;
  teachers: Teacher[];
}

const AddEditTeacherSalaryAdvance = ({
  open,
  onClose,
  onSubmit,
  currentData,
  isLoading,
  error,
  onErrorDismiss,
  title,
  defaultValues,
  formFields,
  accounts,
  teachers,
}: AddEditTeacherSalaryAdvanceProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
    clearErrors,
  } = useForm<TeacherSalaryAdvanceFormValues>({
    defaultValues: currentData?.data || defaultValues,
  });

  const {
    fields: paymentFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "payments",
  });

  const payments = watch("payments");
  const totalAdvanceAmount = payments?.reduce(
    (sum, payment) => sum + (payment.paymentAmount || 0),
    0
  );

  const [baseSalary, setBaseSalary] = useState(0);

  useEffect(() => {
    if (currentData) {
      reset(currentData.data);
    } else {
      reset(defaultValues);
    }
  }, [currentData, reset, defaultValues]);

  const handleFormSubmit = async (data: TeacherSalaryAdvanceFormValues) => {
    try {
      const totalAmount =
        data.payments?.reduce(
          (sum, payment) => sum + (payment.paymentAmount || 0),
          0
        ) || 0;

      // ✅ Prevent if total exceeds base salary
      if (baseSalary > 0 && totalAmount > baseSalary) {
        toast.error("Total advance cannot exceed the teacher's base salary.");
        return;
      }

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
          message: "You can only select one cash account per advance",
        });
        return;
      }

      // Validate account balances
      const hasInsufficientBalance =
        data.payments?.some((payment) => {
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

      const payload = {
        ...data,
        amount: totalAmount || 0,
        note: data?.note || undefined,
      };

      clearErrors("payments");
      onSubmit(payload);
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 items-baseline">
          <Typography variant="h6" className="text-lg sm:text-xl">
            {title}
          </Typography>
          <Typography variant="h6" className="text-base sm:text-xl">
            (Total Advance {totalAdvanceAmount || 0})
          </Typography>
          <Typography variant="h6" className="text-base sm:text-xl">
            (Base Salary {baseSalary})
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

          <div className="grid grid-cols-12 gap-4">
            {formFields.map((field) => (
              <div key={field.name} className={`col-span-6`}>
                <Controller
                  name={field.name}
                  control={control}
                  render={({ field: { onChange, value, ref } }) => (
                    <div>
                      <InputLabel className="font-semibold">
                        {field.label}
                        {field.required && theStar}
                      </InputLabel>
                      {field.type === "select" ? (
                        <select
                          ref={ref}
                          value={value?.toString() || ""}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            const finalValue = isNaN(Number(newValue)) ? newValue : Number(newValue);
                            onChange(finalValue);

                            // ✅ Only trigger when teacherId changes
                            if (field.name === "teacherId") {
                              const selectedTeacher = teachers.find(t => t.id === Number(finalValue));
                              setBaseSalary(selectedTeacher?.TeacherSalary?.baseSalary || 0);
                            }

                            if (field.onChange) field.onChange(finalValue);
                          }}
                          disabled={field.disabled}
                          className={`w-full p-2.5 rounded border border-gray-300 mt-1 ${field.disabled ? "bg-gray-100" : "bg-white"
                            }`}
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map((option) => (
                            <option
                              key={option.value.toString()}
                              value={option.value.toString()}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : null}
                      {errors[field.name]?.message && (
                        <div className="text-red-500 text-xs">
                          {errors[field.name]?.message as string}
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
            ))}
          </div>

          <Box mt={3}>
            <Typography fontWeight={600} mb={2}>
              Payment Methods {theStar}
            </Typography>

            {paymentFields.map((item, index) => (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                  p: 2,
                  backgroundColor: "#f9f9f9",
                  borderRadius: 1,
                  border: "1px solid #eee",
                }}
              >
                {/* Account */}
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Controller
                    name={`payments.${index}.accountId`}
                    control={control}
                    render={({ field }) => (
                      <div>
                        <Typography variant="body2" color="textSecondary" mb={0.5}>
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
                            padding: "10px",
                            borderRadius: "4px",
                            border: errors.payments?.[index]?.accountId
                              ? "1px solid #d32f2f"
                              : "1px solid #ccc",
                            backgroundColor: "white",
                          }}
                        >
                          <option value="">Select payment account</option>
                          {accounts.map((account) => {
                            const isDisabled = isAccountDisabled(account.id, index);
                            return (
                              <option
                                key={account.id}
                                value={account.id}
                                disabled={isDisabled}
                              >
                                {account.bankName} - {account.currentBalance}
                                {isDisabled ? " (already selected)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  />
                </Box>

                {/* Amount */}
                <Box sx={{ flex: 1, minWidth: 150 }}>
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
                              const value = e.target.value === "" ? 0 : Number(e.target.value);
                              const totalExceptCurrent = payments
                                ?.filter((_, i) => i !== index)
                                ?.reduce((sum, p) => sum + (p.paymentAmount || 0), 0);
                              const availableAmount = baseSalary - totalExceptCurrent;

                              if (value <= currentBalance && value <= availableAmount) {
                                field.onChange(value);
                              }
                            }}
                            placeholder="0.00"
                            disabled={!accountId || baseSalary === 0}
                            style={{
                              width: "100%",
                              padding: "10px",
                              borderRadius: "4px",
                              border:
                                errors.payments?.[index]?.paymentAmount
                                  ? "1px solid #d32f2f"
                                  : "1px solid #ccc",
                              backgroundColor:
                                !accountId || baseSalary === 0 ? "#f5f5f5" : "white",
                            }}
                            max={Math.min(currentBalance, baseSalary)}
                          />
                        </div>
                      );
                    }}
                  />
                </Box>

                {/* Remove */}
                <Box sx={{ alignSelf: "flex-end", mb: 1 }}>
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
                </Box>
              </Box>
            ))}

            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              sx={{
                mt: 1,
                py: 1.5,
                fontSize: "0.875rem",
                color: "#035140",
                borderColor: "#035140",
                "&:hover": {
                  backgroundColor: "rgba(3, 81, 64, 0.08)",
                  borderColor: "#035140",
                },
              }}
              onClick={() => append({ accountId: 0, paymentAmount: 0 })}
            >
              Add Payment Method
            </Button>
          </Box>

          {/* Note */}
          <Box mt={3}>
            <Controller
              name="note"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="font-semibold">Note</label>
                  <textarea
                    value={String(field.value || "")}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="Note"
                    className="w-full p-2.5 rounded border border-gray-300 mt-1"
                    rows={3}
                  />
                  {errors.note?.message && (
                    <div className="text-red-500 text-xs">
                      {errors.note?.message as string}
                    </div>
                  )}
                </div>
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <SubmitButton
            type="submit"
            disabled={isLoading}
            sx={{
              backgroundColor: "#035140",
              "&:hover": {
                backgroundColor: "#024030",
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : currentData?.id ? (
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

export default AddEditTeacherSalaryAdvance;
