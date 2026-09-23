"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  Modal,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
} from "@mui/material";
import { Plus, Edit, Trash2, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import {
  useCreateResultMutation,
  useDeleteResultMutation,
  useGetAllResultsQuery,
  useUpdateResultMutation,
} from "@/app/store/api/classes/resultApi";
import { useGetAllExamsQuery } from "@/app/store/api/classes/examApi";
import { useGetAllSubjectsQuery } from "@/app/store/api/classes/subjectApi";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";
import { useGetFilteredStudentsQuery } from "@/app/store/api/student/studentApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";

interface Session {
  id: number;
  branchId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Exam {
  id: number;
  branchId: number;
  sessionYearId: number;
  name: string;
  isFinal: boolean;
  isPublish: boolean;
  createdAt: string;
  updatedAt: string;
  session: Session;
}

interface Subject {
  id: number;
  branchId: number;
  name: string;
  code: string;
  marks: number;
  passMarks: number;
  createdAt: string;
  updatedAt: string;
}

export interface IGroupSubjectItem {
  id: number;
  branchId: number;
  classNameId: number;
  subjectNameId: number;
  createdAt: string;
  updatedAt: string;
  subject: Subject;
}

interface Class {
  id: number;
  branchId: number;
  name: string;
  GroupSubject: IGroupSubjectItem[];
  createdAt: string;
  updatedAt: string;
}

interface Section {
  id: number;
  branchId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Stream {
  id: number;
  branchId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  id: number;
  name: string;
  classRoll: number;
  class?: Class;
  section?: Section;
  stream?: Stream;
  session?: Session;
}

interface Result {
  id: number;
  studentId: number;
  examId: number;
  subjectId: number;
  marks: number;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  exam?: Exam;
  subject?: Subject;
  [key: string]: unknown;
}

interface FilterState {
  session: string;
  className: string;
  section: string;
  stream: string;
}

const ResultList = () => {
  const [addResultModalOpen, setAddResultModalOpen] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<Result | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [marks, setMarks] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [filterExam, setFilterExam] = useState<number | null>(null);
  const [filterClass, setFilterClass] = useState<number | null>(null);
  const [filterSubject, setFilterSubject] = useState<number | null>(null);
  const [isSearched, setIsSearched] = useState(false);

  // Student filter states
  const [studentFilters, setStudentFilters] = useState<FilterState>({
    session: "",
    className: "",
    section: "",
    stream: "",
  });

  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [studentFilterApplied, setStudentFilterApplied] = useState(false);

  // Dropdown data state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Fetch results with filters
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllResultsQuery(
    {
      examId: filterExam || undefined,
      classId: filterClass || undefined,
      subjectId: filterSubject || undefined,
    },
    {
      skip: !(filterExam && filterClass && filterSubject && isSearched),
    }
  );

  // Fetch students for dropdown
  const { data: studentsResponse } = useGetFilteredStudentsQuery(
    {
      page: 1,
      size: 1000,
      sessionYear: studentFilters.session,
      className: studentFilters.className,
      section: studentFilters.section,
      stream: studentFilters.stream,
    },
    {
      skip:
        !studentFilters.session ||
        !studentFilters.section ||
        !studentFilters.className ||
        !studentFilters.stream,
    }
  );

  // Fetch exams for dropdown
  const { data: examsResponse } = useGetAllExamsQuery({});

  // Fetch subjects for dropdown
  const { data: subjectsResponse } = useGetAllSubjectsQuery({
    page: 1,
    size: 10000,
  });

  // Fetch classes for dropdown
  const { data: classesResponse } = useGetAllClassQuery({
    page: 1,
    size: 100000,
  });

  // Fetch sessions for dropdown
  const { data: sessionsResponse } = useGetAllSessionsQuery({
    page: 1,
    size: 100000,
  });

  // Fetch sections for dropdown
  const { data: sectionsResponse } = useGetAllSectionsQuery({
    page: 1,
    size: 100000,
  });

  // Fetch streams for dropdown
  const { data: streamsResponse } = useGetAllStreamsQuery({
    page: 1,
    size: 100000,
  });

  const {
    isDeleteModalOpen,
    itemToDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    handleDelete: handleDeleteConfirmation,
  } = useDeleteConfirmation();

  const [createResult] = useCreateResultMutation();
  const [updateResult] = useUpdateResultMutation();
  const [deleteResult] = useDeleteResultMutation();

  const results: Result[] = Array.isArray(responseData?.data)
    ? responseData.data
    : responseData?.data || [];

  const exams: Exam[] = examsResponse?.data || [];
  const subjects: Subject[] = subjectsResponse?.data || [];
  const allClasses: Class[] = Array.isArray(classesResponse?.data)
    ? classesResponse.data
    : classesResponse?.data || [];

  // Fetch dropdown data
  useEffect(() => {
    setLoadingDropdowns(true);
    try {
      if (sessionsResponse?.data) {
        setSessions(sessionsResponse.data);
      }
      if (classesResponse?.data) {
        setClasses(classesResponse.data);
      }
      if (sectionsResponse?.data) {
        setSections(sectionsResponse.data);
      }
      if (streamsResponse?.data) {
        setStreams(streamsResponse.data);
      }
    } catch (error) {
      console.error("Error setting dropdown data:", error);
    } finally {
      setLoadingDropdowns(false);
    }
  }, [classesResponse, sessionsResponse, sectionsResponse, streamsResponse]);

  // Filter students when student filters change
  useEffect(() => {
    if (studentsResponse?.data) {
      setFilteredStudents(
        Array.isArray(studentsResponse.data) ? studentsResponse.data : []
      );
    }
  }, [studentsResponse]);

  const handleStudentFilterChange = (key: keyof FilterState, value: string) => {
    setStudentFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Reset pagination when filters change
  useEffect(() => {
    setPage(0);
  }, [filterExam, filterClass, filterSubject]);

  const applyFilters = () => {
    setIsSearched(true);
  };

  const handleOpenAddResultModal = () => {
    setCurrentResult(null);
    setMarks("");
    setAddResultModalOpen(true);
  };

  const handleOpenEditResultModal = (result: Result) => {
    setCurrentResult(result);
    setSelectedStudent(result.studentId);
    setSelectedExam(result.examId);
    setSelectedSubject(result.subjectId);
    setMarks(result.marks.toString());

    // Then set new filters based on the current result
    if (result.student) {
      const newFilters = {
        session: result.student.session?.name || "",
        className: result.student.class?.name || "",
        section: result.student.section?.name || "",
        stream: result.student.stream?.name || "",
      };

      setStudentFilters(newFilters);
      setStudentFilterApplied(true);

      // Force update filtered students by triggering the effect
      if (studentsResponse?.data) {
        const filtered = Array.isArray(studentsResponse.data)
          ? studentsResponse.data
          : [];
        setFilteredStudents(filtered);
      }
    }

    setAddResultModalOpen(true);
  };

  const handleCloseAddResultModal = () => {
    setAddResultModalOpen(false);
    setCurrentResult(null);
    setMarks("");
    setIsSubmitting(false);
  };

  const handleCreateOrUpdateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmitting) return;

    const submissionLock = localStorage.getItem("submissionLock");
    if (submissionLock) return;
    localStorage.setItem("submissionLock", "true");

    setIsSubmitting(true);

    try {
      if (
        !selectedStudent ||
        !selectedExam ||
        !selectedSubject ||
        !marks.trim()
      ) {
        toastShowing(
          "All fields are required",
          "bottom-right",
          2000,
          "red",
          "white"
        );
        return;
      }

      const resultData = {
        studentId: selectedStudent,
        examId: selectedExam,
        subjectId: selectedSubject,
        marks: parseFloat(marks),
      };

      const apiCall = currentResult
        ? updateResult({ id: currentResult.id, ...resultData })
        : createResult(resultData);

      await apiCall.unwrap();
      toastShowing(
        currentResult
          ? "Result updated successfully"
          : "Result created successfully",
        "bottom-right",
        2000,
        "green",
        "white"
      );

      handleCloseAddResultModal();
    } catch (error) {
      let errorMessage = "Request failed";

      if (typeof error === "object" && error !== null && "data" in error) {
        const apiError = error as { data?: { message?: string } };
        errorMessage = apiError.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toastShowing(errorMessage, "bottom-right", 2000, "red", "white");
      console.log(error);
    } finally {
      setIsSubmitting(false);
      localStorage.removeItem("submissionLock");
    }
  };

  const handleDeleteResult = async () => {
    await handleDeleteConfirmation(
      async (resultId) => {
        await deleteResult(resultId).unwrap();
        refetch();
      },
      {
        successMessage: "Result deleted successfully",
        errorMessage: "Failed to delete result",
      }
    );
  };

  const totalPages = responseData?.meta?.totalPage || 1;

  const getExamNameById = (examId: number): string => {
    const exam = exams.find((exam: Exam) => exam.id === examId);
    return exam?.name || "N/A";
  };

  // 👇 Compute the list of subjects to show in the dropdown.
  // If the selected class has GroupSubject mappings, use those.
  // Otherwise, fall back to the full subjects list.
  const matchedClass = classes?.find(
    (cls) => cls.name === studentFilters?.className
  );
  const classSubjects =
    matchedClass?.GroupSubject && matchedClass.GroupSubject.length > 0
      ? matchedClass.GroupSubject.map((item) => item.subject).filter(Boolean)
      : subjects;

  const columns = [
    {
      key: "sl",
      header: "SL",
      render: (row: Result, index?: number) =>
        index !== undefined ? index + 1 : null,
      width: 60,
      align: "center",
    },
    {
      key: "student",
      header: "Student Info",
      render: (row: Result) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {row.student?.name || "N/A"}
          </span>
          <span className="text-sm text-gray-500">
            Roll: {row.student?.classRoll || "N/A"}
          </span>
        </div>
      ),
      minWidth: 180,
    },
    {
      key: "exam",
      header: "Exam",
      render: (row: Result) => {
        const examName = getExamNameById(row.examId);
        return (
          <div className="flex flex-col">
            <span className="font-medium">{examName}</span>
          </div>
        );
      },
      minWidth: 150,
    },
    {
      key: "subject",
      header: "Subject",
      render: (row: Result) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.subject?.name || "N/A"}</span>
          <span className="text-sm text-gray-500">
            Code: {row.subject?.code || "N/A"}
          </span>
        </div>
      ),
      minWidth: 150,
    },
    {
      key: "marks",
      header: "Marks/Grade",
      render: (row: Result) => (
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.marks || "0"}</span>
            <span className="text-xs text-gray-500">
              / {row.subject?.marks || "N/A"}
            </span>
          </div>
          {typeof row.grade === "string" && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                row.grade === "A+" || row.grade === "A"
                  ? "bg-green-100 text-green-800"
                  : row.grade === "B"
                  ? "bg-blue-100 text-blue-800"
                  : row.grade === "C"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {row.grade as string} (GPA:{" "}
              {typeof row.gradePoint === "number" ? row.gradePoint : "0"})
            </span>
          )}
        </div>
      ),
      align: "center",
      minWidth: 120,
    },
    {
      key: "status",
      header: "Status",
      render: (row: Result) =>
        row.marks !== undefined && row.subject?.passMarks !== undefined ? (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.marks >= row.subject.passMarks
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {row.marks >= row.subject.passMarks ? "Passed" : "Failed"}
          </span>
        ) : (
          "N/A"
        ),
      align: "center",
      width: 100,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Result) => (
        <div className="flex space-x-2 items-center">
          <IconButton
            onClick={() => handleOpenEditResultModal(row)}
            sx={{
              color: "#1A3C34",
              p: 1,
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "rgba(26, 60, 52, 0.1)",
              },
            }}
          >
            <Edit size={18} />
          </IconButton>

          <IconButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              openDeleteModal(row.id);
            }}
            disabled={isDeleting && itemToDelete === row.id}
            sx={{
              color: "#DC2626",
              p: 1,
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "rgba(220, 38, 38, 0.1)",
              },
            }}
          >
            {isDeleting && itemToDelete === row.id ? (
              <span>{buttonLoader}</span>
            ) : (
              <Trash2 size={18} />
            )}
          </IconButton>
        </div>
      ),
      width: 120,
      align: "center",
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Result Management"
        buttonText="Add Result"
        buttonIcon={<Plus size={20} />}
        onButtonClick={handleOpenAddResultModal}
      />

      {/* Filter Section */}
      <Box
        sx={{
          display: "flex",
          gap: { xs: 1, sm: 2 },
          mb: 2,
          flexWrap: "wrap",
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
          width: "100%",
        }}
      >
        <FormControl
          sx={{
            minWidth: { xs: "100%", sm: 200 },
            width: { xs: "100%", sm: "auto" },
          }}
          variant="outlined"
          size="small"
        >
          <InputLabel
            id="filter-exam-label"
            sx={{
              backgroundColor: "background.paper",
              px: 1,
              transform: "translate(14px, -9px) scale(0.75)",
              "&.Mui-focused": {
                transform: "translate(14px, -9px) scale(0.75)",
              },
            }}
          >
            Filter by Exam {theStar}
          </InputLabel>
          <Select
            labelId="filter-exam-label"
            id="filter-exam"
            value={filterExam || ""}
            onChange={(e) => setFilterExam(Number(e.target.value) || null)}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderRadius: "6px",
              },
              height: { xs: 48, sm: 40 },
              width: "100%",
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: "6px",
                  marginTop: "4px",
                },
              },
            }}
          >
            <MenuItem value="">All Exams</MenuItem>
            {exams.map((exam: Exam) => (
              <MenuItem key={exam.id} value={exam.id}>
                {exam.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          sx={{
            minWidth: { xs: "100%", sm: 200 },
            width: { xs: "100%", sm: "auto" },
          }}
          variant="outlined"
          size="small"
        >
          <InputLabel
            id="filter-class-label"
            sx={{
              backgroundColor: "background.paper",
              px: 1,
              transform: "translate(14px, -9px) scale(0.75)",
              "&.Mui-focused": {
                transform: "translate(14px, -9px) scale(0.75)",
              },
            }}
          >
            Filter by Class {theStar}
          </InputLabel>
          <Select
            labelId="filter-class-label"
            id="filter-class"
            value={filterClass || ""}
            onChange={(e) => setFilterClass(Number(e.target.value) || null)}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderRadius: "6px",
              },
              height: { xs: 48, sm: 40 },
              width: "100%",
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: "6px",
                  marginTop: "4px",
                },
              },
            }}
          >
            <MenuItem value="">All Classes</MenuItem>
            {allClasses.map((cls: Class) => (
              <MenuItem key={cls.id} value={cls.id}>
                {cls.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          sx={{
            minWidth: { xs: "100%", sm: 200 },
            width: { xs: "100%", sm: "auto" },
          }}
          variant="outlined"
          size="small"
        >
          <InputLabel
            id="filter-subject-label"
            sx={{
              backgroundColor: "background.paper",
              px: 1,
              transform: "translate(14px, -9px) scale(0.75)",
              "&.Mui-focused": {
                transform: "translate(14px, -9px) scale(0.75)",
              },
            }}
          >
            Filter by Subject {theStar}
          </InputLabel>
          <Select
            labelId="filter-subject-label"
            id="filter-subject"
            value={filterSubject || ""}
            onChange={(e) => setFilterSubject(Number(e.target.value) || null)}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderRadius: "6px",
              },
              height: { xs: 48, sm: 40 },
              width: "100%",
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: "6px",
                  marginTop: "4px",
                },
              },
            }}
          >
            <MenuItem value="">All Subjects</MenuItem>
            {subjects.map((subject: Subject) => (
              <MenuItem key={subject.id} value={subject.id}>
                {subject.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <SubmitButton
          onClick={applyFilters}
          sx={{
            width: { xs: "100%", sm: "auto" },
            minWidth: { xs: "100%", sm: 120 },
            height: { xs: 48, sm: 40 },
          }}
        >
          Search
        </SubmitButton>
      </Box>

      {/* Add/Edit Result Modal */}
      <AnimatePresence>
        {addResultModalOpen && (
          <Modal
            open={addResultModalOpen}
            onClose={handleCloseAddResultModal}
            closeAfterTransition
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.3,
              }}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                position: "relative",
                padding: "2rem",
                borderRadius: "6px",
                outline: "none",
                width: "480px",
                maxWidth: "95%",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: `
                  linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,252,251,0.98)),
                  radial-gradient(circle at top left, rgba(26,60,52,0.03), transparent 60%)
                `,
              }}
            >
              {/* Floating close button */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: "absolute",
                  top: "-12px",
                  right: "-12px",
                  zIndex: 1,
                }}
              >
                <IconButton
                  onClick={handleCloseAddResultModal}
                  sx={{
                    backgroundColor: "#d32f2f",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(26, 60, 52, 0.2)",
                    "&:hover": {
                      backgroundColor: "#0F2922",
                    },
                  }}
                >
                  <X size={18} />
                </IconButton>
              </motion.div>

              {/* Header with decorative accent */}
              <Box sx={{ position: "relative", mb: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: "#1A3C34",
                    position: "relative",
                    display: "inline-block",
                    "&:after": {
                      content: '""',
                      position: "absolute",
                      bottom: "-8px",
                      left: 0,
                      width: "48px",
                      height: "4px",
                      background:
                        "linear-gradient(90deg, #1A3C34, rgba(26,60,52,0.3))",
                      borderRadius: "2px",
                    },
                  }}
                >
                  {currentResult ? "Edit Result" : "Add New Result"}
                </Typography>
              </Box>

              {/* Form fields */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateOrUpdateResult(e);
                }}
                noValidate
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Student Filter Section */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Filter Students
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <FormControl sx={{ flex: 1, minWidth: 120 }} size="small">
                        <InputLabel>Session {theStar}</InputLabel>
                        <Select
                          value={studentFilters.session}
                          onChange={(e) =>
                            handleStudentFilterChange("session", e.target.value)
                          }
                          label="Session"
                          sx={{ height: 48 }}
                          disabled={loadingDropdowns}
                        >
                          <MenuItem value="">All Sessions</MenuItem>
                          {sessions.map((session) => (
                            <MenuItem key={session.id} value={session.name}>
                              {session.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl sx={{ flex: 1, minWidth: 120 }} size="small">
                        <InputLabel>Class {theStar}</InputLabel>
                        <Select
                          value={studentFilters.className}
                          onChange={(e) =>
                            handleStudentFilterChange(
                              "className",
                              e.target.value
                            )
                          }
                          label="Class"
                          sx={{ height: 48 }}
                          disabled={loadingDropdowns}
                        >
                          <MenuItem value="">All Classes</MenuItem>
                          {classes.map((cls) => (
                            <MenuItem key={cls.id} value={cls.name}>
                              {cls.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl sx={{ flex: 1, minWidth: 120 }} size="small">
                        <InputLabel>Section {theStar}</InputLabel>
                        <Select
                          value={studentFilters.section}
                          onChange={(e) =>
                            handleStudentFilterChange("section", e.target.value)
                          }
                          label="Section"
                          sx={{ height: 48 }}
                          disabled={loadingDropdowns}
                        >
                          <MenuItem value="">All Sections</MenuItem>
                          {sections.map((section) => (
                            <MenuItem key={section.id} value={section.name}>
                              {section.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl sx={{ flex: 1, minWidth: 120 }} size="small">
                        <InputLabel>Group {theStar}</InputLabel>
                        <Select
                          value={studentFilters.stream}
                          onChange={(e) =>
                            handleStudentFilterChange("stream", e.target.value)
                          }
                          label="Stream"
                          sx={{ height: 48 }}
                          disabled={loadingDropdowns}
                        >
                          <MenuItem value="">All Streams</MenuItem>
                          {streams.map((stream) => (
                            <MenuItem key={stream.id} value={stream.name}>
                              {stream.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  {/* Student Select - Searchable */}
                  <Autocomplete
                    options={filteredStudents}
                    getOptionLabel={(option) =>
                      `${option.name} (${option.class?.name || "N/A"}, Roll: ${
                        option.classRoll || "N/A"
                      })`
                    }
                    value={
                      filteredStudents.find(
                        (student) => student.id === selectedStudent
                      ) || null
                    }
                    onChange={(_, newValue) => {
                      setSelectedStudent(newValue?.id || null);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <>
                            Student
                            {theStar}
                          </>
                        }
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <Search size={20} style={{ marginRight: 8 }} />
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                        disabled={
                          !studentFilterApplied ||
                          filteredStudents.length === 0
                        }
                      />
                    )}
                    fullWidth
                    key={`student-select-${selectedStudent}`}
                  />

                  <div className="flex gap-4">
                    {/* Exam Select */}
                    <FormControl fullWidth>
                      <InputLabel id="exam-select-label">
                        Exam {theStar}
                      </InputLabel>
                      <Select
                        labelId="exam-select-label"
                        id="exam-select"
                        value={selectedExam || ""}
                        label="Exam"
                        onChange={(e) => setSelectedExam(Number(e.target.value))}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "6px",
                            "& fieldset": {
                              borderColor: "rgba(26,60,52,0.2)",
                            },
                            "&:hover fieldset": {
                              borderColor: "#1A3C34",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1A3C34",
                              boxShadow: "0 0 0 2px rgba(26,60,52,0.2)",
                            },
                          },
                        }}
                      >
                        {exams.map((exam: Exam) => (
                          <MenuItem key={exam.id} value={exam.id}>
                            {exam.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Subject Select */}
                    {/* 👇 FIXED: uses classSubjects (GroupSubject if available, else all subjects) */}
                    <FormControl fullWidth>
                      <InputLabel id="subject-select-label">
                        Subject {theStar}
                      </InputLabel>
                      <Select
                        labelId="subject-select-label"
                        id="subject-select"
                        value={selectedSubject || ""}
                        label="Subject"
                        disabled={
                          loadingDropdowns || !studentFilters?.className
                        }
                        onChange={(e) =>
                          setSelectedSubject(Number(e.target.value))
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "6px",
                            "& fieldset": {
                              borderColor: "rgba(26,60,52,0.2)",
                            },
                            "&:hover fieldset": {
                              borderColor: "#1A3C34",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1A3C34",
                              boxShadow: "0 0 0 2px rgba(26,60,52,0.2)",
                            },
                          },
                        }}
                      >
                        {classSubjects.map((subject) => (
                          <MenuItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>

                  {/* Marks Input */}
                  <TextField
                    fullWidth
                    label={
                      <span style={{ color: "#5F7161", fontWeight: 500 }}>
                        Marks {theStar}
                      </span>
                    }
                    variant="outlined"
                    type="number"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "6px",
                        "& fieldset": {
                          borderColor: "#035140",
                        },
                        "&:hover fieldset": {
                          borderColor: "#035140",
                        },
                      },
                    }}
                    InputProps={{
                      style: {
                        fontSize: "1rem",
                        padding: "5px 5px",
                      },
                      inputProps: {
                        min: 0,
                        step: "0.01",
                      },
                    }}
                  />
                </Box>

                {/* Action buttons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 4,
                    position: "relative",
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CancelButton onClick={handleCloseAddResultModal}>
                      Cancel
                    </CancelButton>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SubmitButton
                      type="submit"
                      disabled={
                        !selectedStudent ||
                        !selectedExam ||
                        !selectedSubject ||
                        !marks.trim() ||
                        isSubmitting
                      }
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </SubmitButton>
                  </motion.div>
                </Box>
              </form>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Use filter to get student result.
          </Alert>
        ) : results.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No results found.{" "}
            {searchTerm
              ? "Try a different search term."
              : "Create your first result."}
          </Typography>
        ) : (
          <>
            <ReusableTable<Result> columns={columns} data={results} />
            <PaginationComponent
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(page - 1 + newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </>
        )}
      </Paper>

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteResult()}
        title="Delete Result"
        description="Are you sure you want to delete this result? This action cannot be undone."
        isLoading={isDeleting}
      />
    </Box>
  );
};

export default ResultList;