"use client";
import React from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

interface FormField {
  name: string;
  label: React.ReactNode;
  type?: string;
  multiline?: boolean;
  rows?: number;
  gridWidth?: number;
  options?: Array<{
    value: string | number | readonly string[] | undefined; // Updated type
    label: string;
  }>;
}

interface AddEditExpenseSubCategoryProps<T extends FieldValues> {
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

const AddEditExpenseSubCategory = <T extends FieldValues>({
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
}: AddEditExpenseSubCategoryProps<T>) => {
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
      // Convert expenseCategoryId to number explicitly
      const formData = {
        ...currentData.data,
        expenseCategoryId: Number(currentData.data.expenseCategoryId),
      };
      // console.log("Resetting form with:", formData);
      methods.reset(formData);
    } else {
      // console.log("Resetting with default values");
      methods.reset(defaultValues);
    }
  }, [currentData, methods, defaultValues]);

 const renderFormField = (field: FormField) => {
  const value = methods.watch(field.name as Path<T>); // Get current value
  // console.log(`Rendering ${field.name} with value:`, value); // Debug log

  switch (field.type) {
    case "select":
      return (
        <TextField
          select
          label={field.label}
          fullWidth
          error={!!errors[field.name]}
          helperText={errors[field.name]?.message as string}
          value={value ?? ''}
          onChange={(e) => {
            // Handle both string and number values safely
            const rawValue = e.target.value;
            const processedValue = typeof rawValue === 'string' 
              ? (field.options?.some(opt => typeof opt.value === 'number')
                ? parseInt(rawValue, 10)
                : rawValue
          ): rawValue;
            
            methods.setValue(
              field.name as Path<T>, 
              processedValue as PathValue<T, Path<T>>,
              { shouldValidate: true }
            );
          }}
        >
          {field.options?.map((option) => (
            <MenuItem
              key={option.value?.toString()}
              value={option.value}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>
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
          py: 2,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}
      >
          <div className="flex gap-4">
                  <Typography variant="h6">{title}</Typography>
                </div>

                <IconButton onClick={onClose} sx={{ color: 'black' }}>
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
          <>
            <CancelButton
              onClick={onClose}
            >
              Cancel
            </CancelButton>
            <SubmitButton
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
             
            >
              {currentData?.id
                ? isLoading
                  ? "Updating..."
                  : "Update"
                : isLoading
                ? "Submitting..."
                : "Submit"}
            </SubmitButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddEditExpenseSubCategory;
