"use client";
import React from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  AlertTitle,
  TextField,
  MenuItem,
  Typography,
  IconButton,
} from "@mui/material";
import {
  useForm,
  FormProvider,
  SubmitHandler,
  FieldValues,
  DefaultValues,
  Path,
  PathValue,
} from "react-hook-form";
import { ZodType, ZodTypeDef } from "zod";
import { XCircle } from "lucide-react";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";

interface FormField {
  name: string;
  label: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  gridWidth?: number;
  options?: Array<{
    value: string | number | readonly string[] | undefined;
    label: string;
  }>;
}

interface AddEditTeacherSalaryProps<T extends FieldValues> {
  open: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<T>;
  currentData: { id: number | null; data: T } | null;
  isLoading: boolean;
  error: string | null;
  onErrorDismiss: () => void;
  title: string;
  schema: ZodType<T, ZodTypeDef, T>;
  defaultValues: DefaultValues<T>;
  formFields: FormField[];
  renderActions?: (handleSubmit: () => void) => React.ReactNode;
}

const AddEditTeacherSalary = <T extends FieldValues>({
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
  renderActions,
}: AddEditTeacherSalaryProps<T>) => {
  const methods = useForm<T>({
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { errors },
    register,
  } = methods;

  React.useEffect(() => {
    if (currentData) {
      // Convert numeric fields explicitly
      const formData = {
        ...currentData.data,
        teacherId: Number(currentData.data.teacherId),
        baseSalary: Number(currentData.data.baseSalary),
      };
      methods.reset(formData);
    } else {
      methods.reset(defaultValues);
    }
  }, [currentData, methods, defaultValues]);

  const renderFormField = (field: FormField) => {
    const value = methods.watch(field.name as Path<T>);

    switch (field.type) {
      case "select":
        return (
          <TextField
            select
            label={
              <>
              {field.label}
              {theStar}
              </>
            }
            fullWidth
            error={!!errors[field.name]}
            helperText={errors[field.name]?.message as string}
            value={value ?? ""}
            onChange={(e) => {
              const rawValue = e.target.value;
              const processedValue =
                typeof rawValue === "string"
                  ? field.options?.some((opt) => typeof opt.value === "number")
                    ? parseInt(rawValue, 10)
                    : rawValue
                  : rawValue;

              methods.setValue(
                field.name as Path<T>,
                processedValue as PathValue<T, Path<T>>,
                { shouldValidate: true }
              );
            }}
          >
            {field.options?.map((option) => (
              <MenuItem key={option.value?.toString()} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        );
      case "number":
        return (
          <TextField
            label={
              <>
              {field.label}
              {theStar}
              </>
            }
            fullWidth
            type="number"
            error={!!errors[field.name]}
            helperText={errors[field.name]?.message as string}
            {...register(field.name as Path<T>, {
              valueAsNumber: true,
            })}
          />
        );
      case "multiline":
        return (
          <TextField
            label={field.label}
            fullWidth
            multiline
            rows={field.rows || 4}
            error={!!errors[field.name]}
            helperText={errors[field.name]?.message as string}
            {...register(field.name as Path<T>)}
          />
        );
      default:
        return (
          <TextField
            label={field.label}
            fullWidth
            type={field.type}
            error={!!errors[field.name]}
            helperText={errors[field.name]?.message as string}
            {...register(field.name as Path<T>)}
          />
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: "1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
        }}
      >
        <div className="flex gap-4">
          <Typography variant="h6">{title}</Typography>
        </div>

        <IconButton onClick={onClose} sx={{ color: "red" }}>
          <XCircle />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={onErrorDismiss}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        <FormProvider {...methods}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {formFields.map((field) => (
              <Box
                key={field.name}
                sx={{
                  mb: 3,
                  width: "100%",
                }}
              >
                {renderFormField(field)}
              </Box>
            ))}
          </Box>
        </FormProvider>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        {renderActions ? (
          renderActions(() => handleSubmit(onSubmit)())
        ) : (
          //
          <>
            <CancelButton onClick={onClose}>Cancel</CancelButton>
            <SubmitButton onClick={handleSubmit(onSubmit)}>
              {isLoading ? <CircularProgress /> : "Submit"}
            </SubmitButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddEditTeacherSalary;
