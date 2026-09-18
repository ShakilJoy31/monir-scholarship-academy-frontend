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
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface FormField {
  name: string;
  label: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  gridWidth?: number; // 1-12 representing column span
  select?: boolean; // Add this
  options?: string[]; // Add this
  theStar?: object;
}

interface AddEditBranchProps<T extends FieldValues> {
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

const AddEditBranch = <T extends FieldValues>({
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
}: AddEditBranchProps<T>) => {
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

  // Group fields by row based on gridWidth
  const groupFieldsByRow = () => {
    const rows: FormField[][] = [];
    let currentRow: FormField[] = [];
    let currentRowWidth = 0;

    formFields.forEach((field) => {
      const fieldWidth = field.gridWidth || 12;

      if (currentRowWidth + fieldWidth > 12) {
        rows.push(currentRow);
        currentRow = [field];
        currentRowWidth = fieldWidth;
      } else {
        currentRow.push(field);
        currentRowWidth += fieldWidth;
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  };

  const fieldRows = groupFieldsByRow();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>

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
      {field.label} {field.theStar && field.theStar}
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
            <CancelButton onClick={onClose}  
             sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: "none",
                backgroundColor: "red", color: "white"
              }}>
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

export default AddEditBranch;