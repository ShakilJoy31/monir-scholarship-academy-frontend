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
  Typography,
  IconButton,
} from "@mui/material";
import {
  useForm,
  FormProvider,
  SubmitHandler,
  FieldValues,
  DefaultValues,
  Path
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
}

interface AddEditExpenseCategoryProps<T extends FieldValues> {
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

const AddEditExpenseCategory = <T extends FieldValues>({
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
}: AddEditExpenseCategoryProps<T>) => {
  const methods = useForm<T>({
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
    register,
  } = methods;

  React.useEffect(() => {
    if (currentData) {
      methods.reset(currentData.data);
    } else {
      reset(defaultValues);
    }
  }, [currentData, methods, reset, defaultValues]);

  const fieldRows = formFields.map(field => [field]); // Each field gets its own row

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex gap-4">
          <Typography variant="h6">{title}</Typography>
        </div>

        <IconButton onClick={onClose} sx={{ color: 'black' }}>
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
            {fieldRows.map((row, rowIndex) => (
              <Box
                key={rowIndex}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(12, 1fr)",
                  gap: 2,
                  mb: 3,
                }}
              >
                {row.map((field) => (
                  <Box
                    key={field.name}
                    sx={{ gridColumn: `span ${field.gridWidth || 12}` }}
                  >
                    <TextField
                      label={
                        <>
                          Category Name
                          {theStar}
                        </>
                      }
                      fullWidth
                      type={field.type}
                      multiline={field.multiline}
                      rows={field.rows}
                      error={!!errors[field.name]}
                      helperText={errors[field.name]?.message as string}
                      {...register(field.name as Path<T>)}
                    />
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </FormProvider>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {renderActions ? (
          renderActions(() => handleSubmit(onSubmit)())
        ) : (
          <>
            <CancelButton onClick={onClose} >
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

export default AddEditExpenseCategory;