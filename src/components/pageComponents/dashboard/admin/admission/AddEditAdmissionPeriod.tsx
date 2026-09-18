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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  useForm,
  FormProvider,
  SubmitHandler,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { theStar } from "@/lib/requiredJSX";
import { AdmissionPeriodFormValues, AdmissionPeriodSchema } from "@/app/super-admin/schemas/admission/admissionPeriodSchema";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface AddEditAdmissionPeriodProps {
  open: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<AdmissionPeriodFormValues>;
  currentData: { id: number | null; data: AdmissionPeriodFormValues } | null;
  isLoading?: boolean;
  error: string | null;
  onErrorDismiss: () => void;
  title: string;
  sessions: { id: number; sessionYear: string; name: string }[];
}

const AddEditAdmissionPeriod = ({
  open,
  onClose,
  onSubmit,
  currentData,
  error,
  onErrorDismiss,
  title,
  sessions,
}: AddEditAdmissionPeriodProps) => {
  const methods = useForm<AdmissionPeriodFormValues>({
    resolver: zodResolver(AdmissionPeriodSchema),
    defaultValues: {
      sessionYearId: 0,
      content: "",
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      isActive: false,
    },
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
    register,
    watch,
    setValue,
  } = methods;

  //   React.useEffect(() => {
  //     if (currentData) {
  //       methods.reset(currentData.data);
  //     } else {
  //       reset({
  //         sessionYearId: 0,
  //         content: "",
  //         startDate: new Date().toISOString(),
  //         endDate: new Date().toISOString(),
  //         isActive: false,
  //       });
  //     }
  //   }, [currentData, methods, reset]);

  //   // Convert ISO string to date input format (YYYY-MM-DD)
  //   const isoToDateInput = (isoString: string) => {
  //     return isoString ? isoString.substring(0, 10) : new Date().toISOString().substring(0, 10);
  //   };

  //   // Convert date input (YYYY-MM-DD) to full ISO string
  //   const dateInputToISO = (dateString: string) => {
  //     return dateString ? new Date(dateString).toISOString() : new Date().toISOString();
  //   };

  React.useEffect(() => {
    if (open) { // Only reset when modal opens
      if (currentData) {
        console.log('Initializing form with:', currentData);
        reset({
          sessionYearId: currentData.data.sessionYearId,
          content: currentData.data.content,
          startDate: currentData.data.startDate,
          endDate: currentData.data.endDate,
          isActive: currentData.data.isActive
        });
      } else {
        reset({
          sessionYearId: 0,
          content: "",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          isActive: false,
        });
      }
    }
  }, [open, currentData, reset]);// Add 'open' to dependencies

  // Simplify date handling functions
  const formatDateForInput = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toISOString().split('T')[0];
  };

  const parseDateFromInput = (dateString: string) => {
    if (!dateString) return new Date().toISOString();
    return new Date(dateString).toISOString();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{title}</Typography>
        <IconButton onClick={onClose}  sx={{
                                            backgroundColor: '#d32f2f',
                                            color: 'white',
                                            boxShadow: '0 4px 12px rgba(26, 60, 52, 0.2)',
                                            '&:hover': {
                                                backgroundColor: '#0F2922',
                                            }
                                        }}>
          <X size={18} />
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
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2, mb: 3 }}>
              <FormControl sx={{ gridColumn: "span 12" }} error={!!errors.sessionYearId}>
                <InputLabel id="session-year-label">Session Year {theStar}</InputLabel>
                <Select
                  labelId="session-year-label"
                  label="Session Year"
                  {...register("sessionYearId", { valueAsNumber: true })}
                  defaultValue={currentData?.data.sessionYearId || 0}
                >
                  {sessions.map((session) => (
                    <MenuItem key={session.id} value={session.id}>
                      {session.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.sessionYearId && (
                  <Typography variant="caption" color="error">
                    {errors.sessionYearId.message as string}
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2, mb: 3 }}>
              <FormControl sx={{ gridColumn: "span 12" }} error={!!errors.content}>
                <TextField
                  label={
                    <>
                      Content
                      {theStar}
                    </>
                  }
                  multiline
                  rows={3}
                  fullWidth
                  {...register("content")}
                  error={!!errors.content}
                  helperText={errors.content?.message as string}
                />
              </FormControl>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2, mb: 3 }}>
              <FormControl sx={{ gridColumn: "span 6" }} error={!!errors.startDate}>

                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label={
                        <>
                          Start Date
                          {theStar}
                        </>
                      }

                      type="date"
                      value={formatDateForInput(field.value)}
                      onChange={(e) => field.onChange(parseDateFromInput(e.target.value))}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      error={!!errors.startDate}
                      helperText={errors.startDate?.message}
                      sx={{ gridColumn: "span 6" }}
                    />
                  )}
                />
                {errors.startDate && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {errors.startDate.message as string}
                  </Typography>
                )}
              </FormControl>

              <FormControl sx={{ gridColumn: "span 6" }} error={!!errors.endDate}>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                        label={
                        <>
                          End Date
                          {theStar}
                        </>
                      }
                      type="date"
                      value={formatDateForInput(field.value)}
                      onChange={(e) => field.onChange(parseDateFromInput(e.target.value))}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      error={!!errors.endDate}
                      helperText={errors.endDate?.message}
                      sx={{ gridColumn: "span 6" }}
                    />
                  )}
                />
                {errors.endDate && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {errors.endDate.message as string}
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2, mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={watch("isActive")}
                    onChange={(e) => setValue("isActive", e.target.checked)}
                    color="primary"
                  />
                }
                label="Active Period"
                sx={{ gridColumn: "span 12" }}
              />
            </Box>
          </Box>
        </FormProvider>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <CancelButton
          onClick={onClose}
        >Cancel</CancelButton>


        <SubmitButton onClick={handleSubmit(onSubmit)}
        >Submit</SubmitButton>


      </DialogActions>
    </Dialog>
  );
};

export default AddEditAdmissionPeriod;