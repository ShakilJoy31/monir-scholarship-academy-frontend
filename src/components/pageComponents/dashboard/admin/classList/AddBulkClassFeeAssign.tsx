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
  Paper,
  Button,
  FormHelperText,
} from "@mui/material";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XCircle } from "lucide-react";
import { theStar } from "@/lib/requiredJSX";
// import {
//   ClassFeeAssignFormValues,
//   ClassFeeAssignSchema,
// } from "@/app/super-admin/schemas/studentClassFeeAssign";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { useLazyGetFilteredStudentsQuery } from "@/app/store/api/student/studentApi";
import { ClassBulkFeeAssignSchema, ClassBulkFeeAssignFormValues } from "@/app/super-admin/schemas/studentBulkClassFeeAssign";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import MuiMultiSelect from "@/components/ui/common/muiMultiSelect";

interface AddEditClassFeeAssignProps {
  open: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<ClassBulkFeeAssignFormValues>;
  currentData: { id: number | null; data: ClassBulkFeeAssignFormValues & { studentUniqueId?: string } } | null;
  isLoading: boolean;
  error: string | null;
  onErrorDismiss: () => void;
  title: string;
}


interface ClassItem {
  id: number;
  name: string;
}

interface Session {
  id: number;
  name: string;
}
interface Section {
  id: number;
  name: string;
}
interface Stream {
  id: number;
  name: string;
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

const AddBulkClassFeeAssign = ({
  open,
  onClose,
  onSubmit,
  currentData,
  isLoading,
  error,
  onErrorDismiss,
  title,
}: AddEditClassFeeAssignProps) => {
  const methods = useForm<ClassBulkFeeAssignFormValues>({
    resolver: zodResolver(ClassBulkFeeAssignSchema),
    defaultValues: {
      studentIds: null,
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

  const [studentFilters, setStudentFilters] = useState({
    sessionYear: "",
    section: "",
    className: "",
    stream: "",
  });

  const { data: classes } = useGetAllClassQuery({});
  const { data: sessions } = useGetAllSessionsQuery({});
  const { data: sections } = useGetAllSectionsQuery({});
  const { data: streams } = useGetAllStreamsQuery({});
  const [triggerStudent, { data: studentsData, isLoading: studentsLoading }] = useLazyGetFilteredStudentsQuery();

  const [studentIds, setStudentIds] = useState(null);

  // handlers start ***********************************************
  const handleStudentFilterChange = (e: {
    target: { name: string; value: string };
  }) => {
    const { name, value } = e.target;
    setStudentFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchStudent = () => {
    triggerStudent({
      sessionYear: studentFilters?.sessionYear,
      section: studentFilters?.section,
      className: studentFilters?.className,
      stream: studentFilters?.stream,
    });
  };

  useEffect(() => {
    setValue("studentIds", studentIds, { shouldValidate: true });
  }, [studentIds])

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
            <Paper sx={{ p: 3, mb: 2 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormControl fullWidth size="small">
                  <InputLabel>Session Year{theStar}</InputLabel>
                  <Select
                    name="sessionYear"
                    value={studentFilters?.sessionYear}
                    onChange={handleStudentFilterChange}
                    label="Session Year"
                  >
                    <MenuItem value="">All Sessions</MenuItem>
                    {(sessions?.data as Session[])?.map((session) => (
                      <MenuItem key={session.id} value={session.name}>
                        {session.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Class{theStar}</InputLabel>
                  <Select
                    name="className"
                    value={studentFilters.className}
                    onChange={handleStudentFilterChange}
                    label="Class"
                  >
                    <MenuItem value="">All Classes</MenuItem>
                    {(classes?.data as ClassItem[])?.map((classItem) => (
                      <MenuItem key={classItem.id} value={classItem.name}>
                        {classItem.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Section{theStar}</InputLabel>
                  <Select
                    name="section"
                    value={studentFilters.section}
                    onChange={handleStudentFilterChange}
                    label="Section"
                  >
                    <MenuItem value="">All Sections</MenuItem>
                    {(sections?.data as Section[])?.map((section) => (
                      <MenuItem key={section.id} value={section.name}>
                        {section.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Stream{theStar}</InputLabel>
                  <Select
                    name="stream"
                    value={studentFilters.stream}
                    onChange={handleStudentFilterChange}
                    label="Stream"
                  >
                    <MenuItem value="">All Streams</MenuItem>
                    {(streams?.data as Stream[])?.map((stream) => (
                      <MenuItem key={stream.id} value={stream.name}>
                        {stream.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#035140',
                    '&:hover': {
                      backgroundColor: '#024030',
                    },
                  }}
                  className="bg-[#035140] hover:cursor-pointer" onClick={handleSearchStudent}
                  disabled={
                    studentsLoading
                    || !studentFilters?.className
                    || !studentFilters?.section
                    || !studentFilters?.sessionYear
                    || !studentFilters?.stream
                  }
                >
                  {studentsLoading ? "Searching..." : "Search"}
                </Button>
              </div>
            </Paper>

            <FormControl
              fullWidth
              size="small"
              className="mb-2"
              error={!!errors.studentIds}
            >
              <MuiMultiSelect
                options={
                  studentsData?.data?.map((student) => ({
                    id: student?.id,
                    label: `${student?.name} - Roll: ${student?.classRoll} (${student?.studentUniqueId})`,
                  })) || []
                }
                label={`Select Students`}
                placeholder="Select Students"
                selectedIds={studentIds || []}
                onChange={(selectedIds) => {
                  setValue("studentIds", studentIds, { shouldValidate: true });
                  setStudentIds(() => selectedIds);
                }}
                width="100%"
              />
              {errors.studentIds && (
                <FormHelperText>{errors.studentIds.message as string}</FormHelperText>
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

export default AddBulkClassFeeAssign;