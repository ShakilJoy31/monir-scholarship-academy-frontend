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
  Autocomplete,
  TextField,
} from "@mui/material";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XCircle } from "lucide-react";
import { theStar } from "@/lib/requiredJSX";
import { ExamFeeAssignFormValues as OriginalExamFeeAssignFormValues, ExamFeeAssignSchema } from "@/app/super-admin/schemas/examFees/examFeeAssignSchema";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { useGetStudentByUniqueIdQuery, useGetStudentByIdQuery } from "@/app/store/api/student/studentApi";

type ExamFeeAssignFormValues = OriginalExamFeeAssignFormValues & {
  studentUniqueId?: string;
};

interface AddEditStudentExamFeeAssignProps {
  open: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<ExamFeeAssignFormValues>;
  currentData: { id: number | null; data: ExamFeeAssignFormValues } | null;
  isLoading: boolean;
  error: string | null;
  onErrorDismiss: () => void;
  title: string;
  exams: { id: number; name: string }[];
  examFees: { id: number; name: string; amount: number; examNameId: number }[];
}

interface Student {
  id: number;
  name: string;
  classRoll: number;
  class: { name: string };
  section: { name: string };
  stream: { name: string };
  session: { name: string };
  studentUniqueId: string;
}

const AddEditStudentExamFeeAssign = ({
  open,
  onClose,
  onSubmit,
  currentData,
  isLoading,
  error,
  onErrorDismiss,
  title,
  exams,
  examFees,
}: AddEditStudentExamFeeAssignProps) => {
  const methods = useForm<ExamFeeAssignFormValues>({
    resolver: zodResolver(ExamFeeAssignSchema),
    defaultValues: {
      studentId: 0,
      examId: 0,
      examFeeId: 0,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
    register,
    setValue,
    watch,
    trigger,
  } = methods;

  const [uniqueId, setUniqueId] = useState("");
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  
  // Query for student by unique ID (used when adding new)
  const { data: studentResponseByUniqueId, isLoading: uniqueStudentLoading } =
    useGetStudentByUniqueIdQuery({ uniqueId }, { skip: !uniqueId });

  // Query for student by ID (used when editing)
  const { data: studentByIdResponse, isLoading: studentByIdLoading } = 
    useGetStudentByIdQuery(currentData?.data.studentId || 0, { 
      skip: !currentData?.data.studentId || !open 
    });

  const currentExamId = watch("examId");

  // Initialize form when currentData changes
  useEffect(() => {
    if (currentData) {
      reset({
        studentId: currentData.data.studentId,
        examId: currentData.data.examId,
        examFeeId: currentData.data.examFeeId,
        studentUniqueId: currentData.data.studentUniqueId,
      });
      
      // Set the unique ID if we have it in currentData
      if (currentData.data.studentUniqueId) {
        setUniqueId(currentData.data.studentUniqueId);
      }
    } else {
      reset({
        studentId: 0,
        examId: 0,
        examFeeId: 0,
        studentUniqueId: "",
      });
      setUniqueId("");
      setCurrentStudent(null);
    }
  }, [currentData, reset]);

  // Set current student when editing
  useEffect(() => {
    if (studentByIdResponse?.data) {
      setCurrentStudent(studentByIdResponse.data);
      setUniqueId(studentByIdResponse.data.studentUniqueId);
    }
  }, [studentByIdResponse]);

  // Set student ID when student is selected (for both add and edit)
  useEffect(() => {
    if (studentResponseByUniqueId?.data) {
      setCurrentStudent(studentResponseByUniqueId.data);
      setValue("studentId", studentResponseByUniqueId.data.id, {
        shouldValidate: true,
      });
      setValue("studentUniqueId", studentResponseByUniqueId.data.studentUniqueId, {
        shouldValidate: true,
      });
    }
  }, [studentResponseByUniqueId, setValue]);

  // Filter exam fees based on selected exam
  const filteredExamFees = React.useMemo(() => {
    if (!currentExamId || !examFees) return [];
    return examFees.filter((fee) => fee.examNameId === currentExamId);
  }, [currentExamId, examFees]);

  // When exam changes, reset exam fee if it's no longer valid
  useEffect(() => {
    if (currentExamId && watch("examFeeId")) {
      const examFeeExists = filteredExamFees.some(
        (fee) => fee.id === watch("examFeeId")
      );
      if (!examFeeExists) {
        setValue("examFeeId", 0);
      }
    }
  }, [currentExamId, filteredExamFees, watch, setValue]);

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

      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={onErrorDismiss}>
                <AlertTitle>Error</AlertTitle>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth error={!!errors.studentId}>
                <Autocomplete
                  id="student-autocomplete"
                  options={currentStudent ? [currentStudent] : studentResponseByUniqueId?.data ? [studentResponseByUniqueId.data] : []}
                  getOptionLabel={(option: Student) =>
                    `${option.name} - Roll: ${option.classRoll} (${option.studentUniqueId})`
                  }
                  value={
                    currentStudent || 
                    (studentResponseByUniqueId?.data && watch("studentId") === studentResponseByUniqueId.data.id
                      ? studentResponseByUniqueId.data
                      : null)
                  }
                  onChange={(
                    event: React.SyntheticEvent,
                    value: Student | null
                  ) => {
                    if (value) {
                      setValue("studentId", value.id, {
                        shouldValidate: true,
                      });
                      setValue("studentUniqueId", value.studentUniqueId, {
                        shouldValidate: true,
                      });
                      setCurrentStudent(value);
                    } else {
                      setValue("studentId", 0, {
                        shouldValidate: true,
                      });
                      setValue("studentUniqueId", "", {
                        shouldValidate: true,
                      });
                      setCurrentStudent(null);
                      setUniqueId("");
                    }
                  }}
                  onInputChange={(event, newInputValue) => {
                    setUniqueId(newInputValue);
                  }}
                  loading={uniqueStudentLoading || studentByIdLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<>Student Unique ID {theStar}</>}
                      error={!!errors.studentId}
                      helperText={errors.studentId?.message as string}
                      placeholder="Enter student unique ID (e.g., STU-00001)"
                      value={uniqueId}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  filterOptions={(options) => options}
                  clearOnBlur={false}
                  fullWidth
                />
              </FormControl>
            </Box>

            <Box sx={{
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
                gap: 2,
                mb: 3,
              }}>
              <FormControl sx={{ gridColumn: "span 6" }} fullWidth error={!!errors.examId}>
                <InputLabel id="exam-label">Exam {theStar}</InputLabel>
                <Select
                  labelId="exam-label"
                  label="Exam"
                  {...register("examId")}
                  value={watch("examId")}
                  onChange={(e) => {
                    setValue("examId", Number(e.target.value));
                    trigger("examId");
                  }}
                >
                  {exams.map((exam) => (
                    <MenuItem key={exam.id} value={exam.id}>
                      {exam.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.examId && (
                  <Typography variant="caption" color="error">
                    {errors.examId.message as string}
                  </Typography>
                )}
              </FormControl>
              <FormControl sx={{ gridColumn: "span 6" }} fullWidth error={!!errors.examFeeId}>
                <InputLabel id="exam-fee-label">Exam Fee {theStar}</InputLabel>
                <Select
                  labelId="exam-fee-label"
                  label="Exam Fee"
                  {...register("examFeeId")}
                  value={watch("examFeeId")}
                  onChange={(e) => {
                    setValue("examFeeId", Number(e.target.value));
                    trigger("examFeeId");
                  }}
                  disabled={!watch("examId") || filteredExamFees.length === 0}
                >
                  {filteredExamFees.map((examFee) => (
                    <MenuItem key={examFee.id} value={examFee.id}>
                      {`${examFee.amount} ৳`}
                    </MenuItem>
                  ))}
                </Select>
                {errors.examFeeId && (
                  <Typography variant="caption" color="error">
                    {errors.examFeeId.message as string}
                  </Typography>
                )}
              </FormControl>
            </Box>
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
        </Box>
      </FormProvider>
    </Dialog>
  );
};

export default AddEditStudentExamFeeAssign;