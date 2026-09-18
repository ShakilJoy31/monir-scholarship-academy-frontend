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
import { XCircle } from "lucide-react";
import { theStar } from "@/lib/requiredJSX";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";

interface AddEditExamFeeProps {
  open: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<{
    sessionYearId: number;
    classNameId: number;
    sectionNameId: number;
    streamNameId: number;
    examNameId: number;
    amount: number;
  }>;
  currentData: { id: number | null; data: {
    sessionYearId: number;
    classNameId: number;
    sectionNameId: number;
    streamNameId: number;
    examNameId: number;
    amount: number;
  }} | null;
  isLoading: boolean;
  error: string | null;
  onErrorDismiss: () => void;
  title: string;
  classes: { id: number; name: string }[];
  sessions: { id: number; name: string }[];
  sections: { id: number; name: string }[];
  streams: { id: number; name: string }[];
  exams: { id: number; name: string }[];
}

const AddEditExamFee = ({
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
  exams,
}: AddEditExamFeeProps) => {
  const methods = useForm<{
    sessionYearId: number;
    classNameId: number;
    sectionNameId: number;
    streamNameId: number;
    examNameId: number;
    amount: number;
  }>({
    defaultValues: {
      sessionYearId: 0,
      classNameId: 0,
      sectionNameId: 0,
      streamNameId: 0,
      examNameId: 0,
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
        sessionYearId: 0,
        classNameId: 0,
        sectionNameId: 0,
        streamNameId: 0,
        examNameId: 0,
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

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2, mb: 3 }}>
              <FormControl sx={{ gridColumn: "span 6" }} error={!!errors.examNameId}>
                <InputLabel id="exam-label">Exam {theStar}</InputLabel>
                <Select
                  labelId="exam-label"
                  label="Exam"
                  {...register("examNameId", { valueAsNumber: true })}
                  defaultValue={currentData?.data.examNameId || 0}
                >
                  {exams.map((exam) => (
                    <MenuItem key={exam.id} value={exam.id}>
                      {exam.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.examNameId && (
                  <Typography variant="caption" color="error">
                    {errors.examNameId.message as string}
                  </Typography>
                )}
              </FormControl>

              <FormControl sx={{ gridColumn: "span 6" }} error={!!errors.amount}>
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

export default AddEditExamFee;