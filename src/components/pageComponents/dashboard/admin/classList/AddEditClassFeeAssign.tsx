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
import {
  ClassFeeAssignFormValues,
  ClassFeeAssignSchema,
} from "@/app/super-admin/schemas/studentClassFeeAssign";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { useGetStudentByUniqueIdQuery, useGetStudentByIdQuery } from "@/app/store/api/student/studentApi";

interface AddEditClassFeeAssignProps {
  open: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<ClassFeeAssignFormValues>;
  currentData: { id: number | null; data: ClassFeeAssignFormValues & { studentUniqueId?: string } } | null;
  isLoading: boolean;
  error: string | null;
  onErrorDismiss: () => void;
  title: string;
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

const AddEditClassFeeAssign = ({
  open,
  onClose,
  onSubmit,
  currentData,
  isLoading,
  error,
  onErrorDismiss,
  title,
}: AddEditClassFeeAssignProps) => {
  const methods = useForm<ClassFeeAssignFormValues>({
    resolver: zodResolver(ClassFeeAssignSchema),
    defaultValues: {
      studentId: 0,
      month: getCurrentMonth()
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
    register,
    setValue,
    watch,
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

  // Initialize form when currentData changes
  useEffect(() => {
    if (currentData) {
      reset({
        studentId: currentData.data.studentId,
        month: currentData.data.month,
      });
      
      // Set the unique ID if we have it in currentData
      if (currentData.data.studentUniqueId) {
        setUniqueId(currentData.data.studentUniqueId);
      }
    } else {
      reset({
        studentId: 0,
        month: getCurrentMonth(),
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
    }
  }, [studentResponseByUniqueId, setValue]);

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
                      setCurrentStudent(value);
                    } else {
                      setValue("studentId", 0, {
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

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth error={!!errors.month}>
                <InputLabel id="month-label">Month {theStar}</InputLabel>
                <Select
                  labelId="month-label"
                  label="Month"
                  {...register("month")}
                  value={watch("month")}
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

export default AddEditClassFeeAssign;