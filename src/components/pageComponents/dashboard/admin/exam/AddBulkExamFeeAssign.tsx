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
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import MuiMultiSelect from "@/components/ui/common/muiMultiSelect";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import { useLazyGetFilteredStudentsQuery } from "@/app/store/api/student/studentApi";
import { ExamBulkFeeAssignFormValues, ExamBulkFeeAssignSchema } from "@/app/super-admin/schemas/examFees/examBulkFeeAssignSchema";

interface AddEditStudentExamFeeAssignProps {
  open: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<ExamBulkFeeAssignFormValues>;
  isLoading: boolean;
  error: string | null;
  onErrorDismiss: () => void;
  title: string;
  exams: { id: number; name: string }[];
  examFees: { id: number; name: string; amount: number, exam: { id: number; name: string } }[];
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


const AddBulkExamFeeAssign = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  error,
  onErrorDismiss,
  title,
  exams,
  examFees,
}: AddEditStudentExamFeeAssignProps) => {
  // redux hoocs start *****************************
  const { data: classes } = useGetAllClassQuery({});
  const { data: sessions } = useGetAllSessionsQuery({});
  const { data: sections } = useGetAllSectionsQuery({});
  const { data: streams } = useGetAllStreamsQuery({});
  const [triggerStudent, { data: studentsData, isLoading: studentsLoading }] = useLazyGetFilteredStudentsQuery();
  // redux hoocs end *****************************

  // states start **********************************
  const [studentIds, setStudentIds] = useState(null);
  const [studentFilters, setStudentFilters] = useState({
    sessionYear: "",
    section: "",
    className: "",
    stream: "",
  });
  // states end **********************************

  const methods = useForm<ExamBulkFeeAssignFormValues>({
    resolver: zodResolver(ExamBulkFeeAssignSchema),
    defaultValues: {
      studentIds: null,
      examId: 0,
      examFeeId: 0,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue,
    watch,
    trigger,
  } = methods;

  const currentExamId = watch("examId");

  // Filter exam fees based on selected exam
  const filteredExamFees = React.useMemo(() => {
    if (!currentExamId || !examFees) return [];
    return examFees;
  }, [currentExamId, examFees]);

  const currentCxamFee = filteredExamFees.find(fee => fee?.exam?.id === currentExamId);



  // When exam changes, reset exam fee if it's no longer valid
  useEffect(() => {
    // if (currentExamId && watch("examFeeId")) {
    //   const examFeeExists = examFees.some(fee => fee.id === watch("examFeeId"));
    //   if (!examFeeExists) {
    //     setValue("examFeeId", 0);
    //   }
    // }

    if (!currentExamId) return;
    
    const fee = examFees?.find(f => f?.exam?.id === currentExamId);
    console.log("currentExamId", currentExamId, fee)
    if (fee) {
      setValue("examFeeId", fee.id);
      trigger("examFeeId"); // Optional: re-validate
    }
  }, [currentExamId, examFees, watch, setValue, trigger]);


  // handlers start ******************************
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
  // handlers end ******************************

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

      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={onErrorDismiss}>
                <AlertTitle>Error</AlertTitle>
                {error}
              </Alert>
            )}

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

            <Box sx={{
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              gap: 2,
              mt: 2,
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
                  // value={currentCxamFee?.id}
                  value={watch("examFeeId")}
                  onChange={(e) => {
                    setValue("examFeeId", Number(e.target.value));
                    trigger("examFeeId");
                  }}
                  disabled={true} // it will be desabled always and it will be autometically changed based on selected exam
                >
                  {currentCxamFee && (
                    <MenuItem key={currentCxamFee?.id} value={currentCxamFee?.id}>
                      {`${currentCxamFee?.amount} ৳`}
                    </MenuItem>
                  )}
                  {/* {filteredExamFees.map((examFee) => (
                    <MenuItem key={examFee.id} value={examFee.id}>
                      {`${examFee.amount} ৳`}
                    </MenuItem>
                  ))} */}
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
              {isLoading
                ? "Submitting..."
                : "Submit"}
            </SubmitButton>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  );
};

export default AddBulkExamFeeAssign;