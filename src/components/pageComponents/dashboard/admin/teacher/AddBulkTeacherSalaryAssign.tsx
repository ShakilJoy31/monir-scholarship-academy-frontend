// "use client";
// import React from "react";
// import {
//   Box,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   CircularProgress,
//   Alert,
//   AlertTitle,
//   TextField,
//   MenuItem,
//   Typography,
//   IconButton,
// } from "@mui/material";
// import {
//   useForm,
//   FormProvider,
//   SubmitHandler,
//   FieldValues,
//   DefaultValues,
//   Path,
//   PathValue,
// } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { ZodType, ZodTypeDef } from "zod";
// import { XCircle } from "lucide-react";
// import CancelButton from "@/components/shared/reusable-component/CancelButton";
// import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
// import { theStar } from "@/lib/requiredJSX";

// interface FormField {
//   name: string;
//   label: string;
//   type?: string;
//   multiline?: boolean;
//   rows?: number;
//   gridWidth?: number;
//   options?: Array<{
//     value: string | number | readonly string[] | undefined;
//     label: string;
//   }>;
// }

// interface AddEditTeacherSalaryAssignProps<T extends FieldValues> {
//   open: boolean;
//   onClose: () => void;
//   onSubmit: SubmitHandler<T>;
//   currentData: { id: number | null; data: T } | null;
//   isLoading: boolean;
//   error: string | null;
//   onErrorDismiss: () => void;
//   title: string;
//   schema: ZodType<T, ZodTypeDef, T>;
//   defaultValues: DefaultValues<T>;
//   formFields: FormField[];
//   renderActions?: (handleSubmit: () => void) => React.ReactNode;
// }

// const AddBulkTeacherSalaryAssign = <T extends FieldValues>({
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
//   renderActions,
// }: AddEditTeacherSalaryAssignProps<T>) => {
//   const methods = useForm<T>({
//     resolver: zodResolver(schema),
//     defaultValues,
//   });

//   const {
//     handleSubmit,
//     formState: { errors },
//     register,
//   } = methods;

//   React.useEffect(() => {
//     if (currentData) {
//       const formData = {
//         ...currentData.data,
//         teacherId: Number(currentData.data.teacherId),
//       };
//       methods.reset(formData);
//     } else {
//       methods.reset(defaultValues);
//     }
//   }, [currentData, methods, defaultValues]);

//   const renderFormField = (field: FormField) => {
//     const value = methods.watch(field.name as Path<T>);

//     switch (field.type) {
//       case "select":
//         return (
//           <TextField
//             select
//             label={
//               <>
//               {field.label}
//               {theStar}
//               </>
//             }
//             fullWidth
//             error={!!errors[field.name]}
//             helperText={errors[field.name]?.message as string}
//             value={value ?? ""}
//             onChange={(e) => {
//               const rawValue = e.target.value;
//               const processedValue =
//                 typeof rawValue === "string"
//                   ? field.options?.some((opt) => typeof opt.value === "number")
//                     ? parseInt(rawValue, 10)
//                     : rawValue
//                   : rawValue;

//               methods.setValue(
//                 field.name as Path<T>,
//                 processedValue as PathValue<T, Path<T>>,
//                 { shouldValidate: true }
//               );
//             }}
//           >
//             {field.options?.map((option) => (
//               <MenuItem key={option.value?.toString()} value={option.value}>
//                 {option.label}
//               </MenuItem>
//             ))}
//           </TextField>
//         );
//       case "number":
//         return (
//           <TextField
//             label={
//               <>
//               {field.label}
//               {theStar}
//               </>
//             }
//             fullWidth
//             type="number"
//             error={!!errors[field.name]}
//             helperText={errors[field.name]?.message as string}
//             {...register(field.name as Path<T>, {
//               valueAsNumber: true,
//             })}
//           />
//         );
//       case "multiline":
//         return (
//           <TextField
//             label={field.label}
//             fullWidth
//             multiline
//             rows={field.rows || 4}
//             error={!!errors[field.name]}
//             helperText={errors[field.name]?.message as string}
//             {...register(field.name as Path<T>)}
//           />
//         );
//       default:
//         return (
//           <TextField
//             label={field.label}
//             fullWidth
//             type={field.type}
//             error={!!errors[field.name]}
//             helperText={errors[field.name]?.message as string}
//             {...register(field.name as Path<T>)}
//           />
//         );
//     }
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="xs"
//       fullWidth
//       PaperProps={{
//         sx: {
//           borderRadius: 3,
//         },
//       }}
//     >
//       <DialogTitle
//         sx={{
//           fontWeight: 600,
//           fontSize: "1.25rem",
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           py: 2,
//         }}
//       >
//         <div className="flex gap-4">
//           <Typography variant="h6">{title}</Typography>
//         </div>

//         <IconButton onClick={onClose} sx={{ color: "red" }}>
//           <XCircle />
//         </IconButton>
//       </DialogTitle>

//       <DialogContent dividers sx={{ py: 3 }}>
//         {error && (
//           <Alert severity="error" sx={{ mb: 3 }} onClose={onErrorDismiss}>
//             <AlertTitle>Error</AlertTitle>
//             {error}
//           </Alert>
//         )}

//         <FormProvider {...methods}>
//           <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
//             {formFields.map((field) => (
//               <Box
//                 key={field.name}
//                 sx={{
//                   mb: 3,
//                   width: "100%",
//                 }}
//               >
//                 {renderFormField(field)}
//               </Box>
//             ))}
//           </Box>
//         </FormProvider>
//       </DialogContent>

//       <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
//         {renderActions ? (
//           renderActions(() => handleSubmit(onSubmit)())
//         ) : (
//           //
//           <>
//             <CancelButton onClick={onClose}>Cancel</CancelButton>
//             <SubmitButton onClick={handleSubmit(onSubmit)}>
//               {isLoading ? <CircularProgress /> : "Submit"}
//             </SubmitButton>
//           </>
//         )}
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default AddBulkTeacherSalaryAssign;


"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Typography,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XCircle } from "lucide-react";
import { theStar } from "@/lib/requiredJSX";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import MuiMultiSelect from "@/components/ui/common/muiMultiSelect";
import { useGetAllTeachersQuery } from "@/app/store/api/teacher/teacherApi";
import { BulkTeacherSalaryAssignFormValues, BulkTeacherSalaryAssignSchema } from "@/app/super-admin/schemas/bulkTeacherSalaryAssign";

interface AddEditClassFeeAssignProps {
  open: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<BulkTeacherSalaryAssignFormValues>;
  isLoading: boolean;
  error: string | null;
  onErrorDismiss: () => void;
  title: string;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

type Month = typeof months[number];

const getCurrentMonth = (): Month => {
  const monthName = new Date().toLocaleString('default', { month: 'long' });
  return monthName as Month;
};

const AddBulkTeacherSalaryAssign = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  error,
  onErrorDismiss,
  title,
}: AddEditClassFeeAssignProps) => {
  const methods = useForm<BulkTeacherSalaryAssignFormValues>({
    resolver: zodResolver(BulkTeacherSalaryAssignSchema),
    defaultValues: {
      teacherIds: null,
      month: getCurrentMonth()
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue,
    watch,
  } = methods;

  const { data: teachersData } = useGetAllTeachersQuery({});

  const [teacherIds, setTeacherIds] = useState(null);

  useEffect(() => {
    setValue("teacherIds", teacherIds, { shouldValidate: true });
  }, [teacherIds])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <IconButton onClick={onClose} sx={{ color: "red" }}>
          <XCircle />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={onErrorDismiss}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        <FormProvider {...methods}>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ mt: 2 }}
          >

            <FormControl
              fullWidth
              size="small"
              className="mb-2"
              error={!!errors.teacherIds}
            >
              <MuiMultiSelect
                options={
                  teachersData?.data?.map((teacher) => ({
                    id: teacher?.id,
                    label: `${teacher.name} (${teacher.teacherUniqueId})`,
                  })) || []
                }
                label={`Select Teachers`}
                placeholder="Select Teachers"
                selectedIds={teacherIds || []}
                onChange={(selectedIds) => {
                  setValue("teacherIds", teacherIds, { shouldValidate: true });
                  setTeacherIds(() => selectedIds);
                }}
                width="100%"
              />
              {errors.teacherIds && (
                <FormHelperText>{errors.teacherIds.message as string}</FormHelperText>
              )}
            </FormControl>


            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth error={!!errors.month} className="">
                <InputLabel id="month-label">Month {theStar}</InputLabel>
                <Select
                  labelId="month-label"
                  label="Month"
                  {...register("month")}
                  value={watch("month")}
                  size="small"
                >
                  {months.map((month) => (
                    <MenuItem key={month} value={month}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
                {errors.month && (
                  <Typography variant="caption" color="error">
                    {errors.month.message as string}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </Box>
        </FormProvider>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <CancelButton
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </CancelButton>
        <SubmitButton
          type="submit"
          disabled={isLoading}
          onClick={handleSubmit(onSubmit)}
        >
          {isLoading
            ? "Submitting..."
            : "Submit"}
        </SubmitButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddBulkTeacherSalaryAssign;
