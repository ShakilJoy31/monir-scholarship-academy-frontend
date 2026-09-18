// AddEditClassFee.tsx
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
} from "@mui/material";
import {
  useForm,
  FormProvider,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XCircle } from "lucide-react";
import { theStar } from "@/lib/requiredJSX";
import { AssignFeeFormValues, AssignFeeSchema } from "@/app/super-admin/schemas/class/classFeeSchema";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";

interface AddEditClassFeeProps {
  open: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<AssignFeeFormValues>;
  currentData: { id: number | null; data: AssignFeeFormValues } | null;
  isLoading: boolean;
  error: string | null;
  onErrorDismiss: () => void;
  title: string;
  classes: { id: number; name: string }[];
  sessions: { id: number; sessionYear: string; name: string }[];
  sections: { id: number; name: string }[];
  streams: { id: number; name: string }[];
}

const AddEditClassFee = ({
  open,
  onClose,
  onSubmit,
  currentData,
  isLoading,
  error,
  onErrorDismiss,
  title,
  classes,
  sessions,
  sections,
  streams,
}: AddEditClassFeeProps) => {
  const methods = useForm<AssignFeeFormValues>({
    resolver: zodResolver(AssignFeeSchema),
    defaultValues: {
      feeType: "MonthlyFee",
      sessionYearId: 0,
      classNameId: 0,
      sectionNameId: 0,
      streamNameId: 0,
      amount: 0,
    },
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
      reset({
        feeType: "MonthlyFee",
        sessionYearId: 0,
        classNameId: 0,
        sectionNameId: 0,
        streamNameId: 0,
        amount: 0,
      });
    }
  }, [currentData, methods, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{title}</Typography>
        <IconButton onClick={onClose} sx={{ color: 'red' }}>
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


            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2, mb: 3 }}>
              <FormControl sx={{ gridColumn: "span 6" }} error={!!errors.sessionYearId}>
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

              <FormControl sx={{ gridColumn: "span 6" }} error={!!errors.classNameId}>
                <InputLabel id="class-label">Class {theStar}</InputLabel>
                <Select
                  labelId="class-label"
                  label="Class"
                  {...register("classNameId", { valueAsNumber: true })}
                  defaultValue={currentData?.data.classNameId || 0}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.classNameId && (
                  <Typography variant="caption" color="error">
                    {errors.classNameId.message as string}
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2, mb: 3 }}>
              <FormControl sx={{ gridColumn: "span 6" }} error={!!errors.sectionNameId}>
                <InputLabel id="section-label">Section {theStar}</InputLabel>
                <Select
                  labelId="section-label"
                  label="Section"
                  {...register("sectionNameId", { valueAsNumber: true })}
                  defaultValue={currentData?.data.sectionNameId || 0}
                >
                  {sections.map((section) => (
                    <MenuItem key={section.id} value={section.id}>
                      {section.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.sectionNameId && (
                  <Typography variant="caption" color="error">
                    {errors.sectionNameId.message as string}
                  </Typography>
                )}
              </FormControl>

              <FormControl sx={{ gridColumn: "span 6" }} error={!!errors.streamNameId}>
                <InputLabel id="stream-label">Stream {theStar}</InputLabel>
                <Select
                  labelId="stream-label"
                  label="Stream"
                  {...register("streamNameId", { valueAsNumber: true })}
                  defaultValue={currentData?.data.streamNameId || 0}
                >
                  {streams.map((stream) => (
                    <MenuItem key={stream.id} value={stream.id}>
                      {stream.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.streamNameId && (
                  <Typography variant="caption" color="error">
                    {errors.streamNameId.message as string}
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2 }}>
              {/* First row */}
              <Box sx={{ gridColumn: "span 6" }}>
                <FormControl fullWidth error={!!errors.feeType}>
                  <InputLabel id="fee-type-label">Fee Type {theStar}</InputLabel>
                  <Select
                    labelId="fee-type-label"
                    label="Fee Type"
                    {...register("feeType")}
                    defaultValue={currentData?.data.feeType || "MonthlyFee"}
                  >
                    <MenuItem value="MonthlyFee">Monthly Fee</MenuItem>
                    <MenuItem value="AdmissionFee">Admission Fee</MenuItem>
                  </Select>
                  {errors.feeType && (
                    <Typography variant="caption" color="error">
                      {errors.feeType.message as string}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              {/* Second row */}
              <Box sx={{ gridColumn: "span 6" }}>
                <FormControl fullWidth error={!!errors.amount}>
                  <TextField
                    label={
                      <>
                        Amount
                        {theStar}
                      </>
                    }
                    type="number"
                    fullWidth
                    {...register("amount", { valueAsNumber: true })}
                    error={!!errors.amount}
                    helperText={errors.amount?.message as string}
                  />
                </FormControl>
              </Box>
            </Box>






          </Box>
        </FormProvider>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>

        <CancelButton
          onClick={onClose}

          sx={{
            backgroundColor: '#d32f2f',
            color: 'white',
            '&:hover': {
              backgroundColor: '#b71c1c',
            },
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            padding: { xs: '6px 8px', sm: '6px 12px' }
          }}
        >
          Cancel
        </CancelButton>


        <SubmitButton
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
          sx={{
            backgroundColor: '#035140',
            color: 'white',
            '&:hover': {
              backgroundColor: '#023a2d',
            },
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            padding: { xs: '6px 8px', sm: '6px 12px' }
          }}
        >
          {currentData?.id
            ? isLoading
              ? "Updating..."
              : "Update"
            : isLoading
              ? "Submitting..."
              : "Submit"}
        </SubmitButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditClassFee;