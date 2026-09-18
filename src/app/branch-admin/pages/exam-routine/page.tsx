"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  useCreateExamRoutingMutation,
  useDeleteExamRoutingMutation,
  useGetAllExamRoutingsQuery,
  useGetExamRoutingFilterQuery,
  useUpdateExamRoutingMutation,
} from "@/app/store/api/classes/examRoutineApi";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import { useGetAllSubjectsQuery } from "@/app/store/api/classes/subjectApi";
import { useGetAllExamsQuery } from "@/app/store/api/classes/examApi";
import { useGetAllSlotsQuery } from "@/app/store/api/classes/slotApi";
import { ExamRoutineSchema } from "@/app/super-admin/schemas/examRoutineSchema";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";

interface ExamRoutine {
  id: number;
  branchId: number;
  examNameId: number;
  sessionYearId: number;
  classNameId: number;
  sectionNameId: number;
  streamNameId: number;
  subjectNameId: number;
  slotId?: number;
  startTime?: string;
  endTime?: string;
  examDate: string;
  createdAt: string;
  updatedAt: string;
  exam: {
    id: number;
    name: string;
  };
  session: {
    id: number;
    name: string;
  };
  class: {
    id: number;
    name: string;
  };
  section: {
    id: number;
    name: string;
  };
  stream: {
    id: number;
    name: string;
  };
  subject: {
    id: number;
    name: string;
  };
  slot: {
    id: number;
    startTime: string;
    endTime: string;
  };
  [key: string]: unknown;
}

interface FilterState {
  sessionYearId: string;
  classNameId: string;
  sectionNameId: string;
  streamNameId: string;
  examNameId: string;
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

interface Exam {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

interface Slot {
  id: number;
  startTime: string;
  endTime: string;
  branchId: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data?: T[];
}

interface ExamRoutineFormValues {
  examNameId?: number;
  sessionYearId?: number;
  classNameId?: number;
  sectionNameId?: number;
  streamNameId?: number;
  subjectNameId?: number;
  slotId?: number;
  startTime?: string;
  endTime?: string;
  examDate?: string;
}

const ExamRoutineList = () => {
  const [addRoutineModalOpen, setAddRoutineModalOpen] =
    useState<boolean>(false);
  const [currentRoutine, setCurrentRoutine] = useState<ExamRoutine | null>(
    null
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters] = useState<FilterState>({
    sessionYearId: "",
    classNameId: "",
    sectionNameId: "",
    streamNameId: "",
    examNameId: "",
  });

  // Form state using the schema's inferred type
  const [formValues, setFormValues] = useState<ExamRoutineFormValues>({
    examNameId: undefined,
    sessionYearId: undefined,
    classNameId: undefined,
    sectionNameId: undefined,
    streamNameId: undefined,
    subjectNameId: undefined,
    startTime: undefined,
    slotId: undefined,
    endTime: undefined,
    examDate: undefined,
  });

  // Fetch all necessary data using RTK Query hooks
  const { data: classesData } = useGetAllClassQuery({});
  const { data: sessionsData } = useGetAllSessionsQuery({});
  const { data: sectionsData } = useGetAllSectionsQuery({});
  const { data: streamsData } = useGetAllStreamsQuery({});
  const { data: subjectsData } = useGetAllSubjectsQuery({});
  const { data: examsData } = useGetAllExamsQuery({});
  const { data: slotsData } = useGetAllSlotsQuery({});

  // Choose which query to use based on whether filters are active
  const hasFilters =
    filters.sessionYearId ||
    filters.classNameId ||
    filters.sectionNameId ||
    filters.streamNameId ||
    filters.examNameId;

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllExamRoutingsQuery({
    page: page + 1,
    size: rowsPerPage,
    search: searchTerm,
  });

  const {
    data: filteredData,
    isLoading: isFilterLoading,
    isError: isFilterError,
  } = useGetExamRoutingFilterQuery(
    {
      page: page + 1,
      size: rowsPerPage,
      sessionYearId: filters.sessionYearId
        ? Number(filters.sessionYearId)
        : undefined,
      sectionNameId: filters.sectionNameId
        ? Number(filters.sectionNameId)
        : undefined,
      classNameId: filters.classNameId
        ? Number(filters.classNameId)
        : undefined,
      streamNameId: filters.streamNameId
        ? Number(filters.streamNameId)
        : undefined,
      examNameId: filters.examNameId ? Number(filters.examNameId) : undefined,
    },
    { skip: !hasFilters }
  );

  const {
    isDeleteModalOpen,
    itemToDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    handleDelete: handleDeleteConfirmation,
  } = useDeleteConfirmation();

  const [createRoutine, { isLoading: isCreatingRoutine }] =
    useCreateExamRoutingMutation();
  const [updateRoutine, { isLoading: isUpdatingRoutine }] =
    useUpdateExamRoutingMutation();
  const [deleteRoutine] = useDeleteExamRoutingMutation();

  const dataToUse = hasFilters ? filteredData : responseData;
  const routines: ExamRoutine[] = Array.isArray(dataToUse?.data)
    ? dataToUse.data
    : dataToUse?.data || [];

  const totalPages = dataToUse?.meta?.totalPage || 1;

  const handleOpenAddRoutineModal = () => {
    setCurrentRoutine(null);
    resetForm();
    setAddRoutineModalOpen(true);
  };

  const handleOpenEditRoutineModal = (routine: ExamRoutine) => {
    setCurrentRoutine(routine);
    setFormValues({
      examNameId: routine.examNameId,
      sessionYearId: routine.sessionYearId,
      classNameId: routine.classNameId,
      sectionNameId: routine.sectionNameId,
      streamNameId: routine.streamNameId,
      subjectNameId: routine.subjectNameId,
      startTime: routine.startTime || routine.slot?.startTime,
      endTime: routine.endTime || routine.slot?.endTime,
      examDate: routine.examDate,
      slotId: routine.slotId,
    });
    setAddRoutineModalOpen(true);
  };

  const resetForm = () => {
    setFormValues({
      examNameId: undefined,
      sessionYearId: undefined,
      classNameId: undefined,
      sectionNameId: undefined,
      streamNameId: undefined,
      subjectNameId: undefined,
      startTime: undefined,
      endTime: undefined,
      examDate: undefined,
    });
  };

  const handleCloseAddRoutineModal = () => {
    setAddRoutineModalOpen(false);
    resetForm();
    setCurrentRoutine(null);
  };

  const handleFormChange = (
    field: keyof ExamRoutineFormValues,
    value: unknown
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateOrUpdateRoutine = async () => {
    try {
      // Validate the form values against the schema
      const validatedData = ExamRoutineSchema.parse(formValues);

      if (currentRoutine) {
        await updateRoutine({
          id: currentRoutine.id,
          ...validatedData,
        }).unwrap();
        toastShowing(
          "Exam routine updated successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      } else {
        await createRoutine(validatedData).unwrap();
        toastShowing(
          "Exam routine added successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      }

      refetch();
      handleCloseAddRoutineModal();
    } catch (err) {
      toast.error(
        (err as { data?: { message?: string } })?.data?.message ||
          (currentRoutine
            ? "Failed to update exam routine"
            : "Failed to add exam routine")
      );
      console.error("Error saving exam routine:", err);
    }
  };

  const handleDeleteRoutine = async () => {
    await handleDeleteConfirmation(
      async (routineId) => {
        await deleteRoutine(routineId).unwrap();
        refetch();
      },
      {
        successMessage: "Exam routine deleted successfully",
        errorMessage: "Failed to delete exam routine",
      }
    );
  };

  const columns = [
    {
      key: "serial",
      header: "SL",
      render: (_row: ExamRoutine, index?: number) =>
        index !== undefined ? index + 1 : "",
    },
    {
      key: "exam",
      header: "Exam",
      render: (row: ExamRoutine) => row.exam?.name || "N/A",
    },
    {
      key: "class",
      header: "Class",
      render: (row: ExamRoutine) => row.class?.name || "N/A",
    },
    {
      key: "section",
      header: "Section",
      render: (row: ExamRoutine) => row.section?.name || "N/A",
    },
    {
      key: "subject",
      header: "Subject",
      render: (row: ExamRoutine) => row.subject?.name || "N/A",
    },
    {
      key: "examDate",
      header: "Date",
      render: (row: ExamRoutine) => {
        const date = new Date(row.examDate);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      key: "timeSlot",
      header: "Time",
      render: (row: ExamRoutine) => {
        // Handle cases where either time is missing
        if (!row.startTime || !row.endTime) return "N/A";

        // Safely format the times (assuming format is "HH:mm:ss")
        return `${row.startTime.substring(0, 10)} - ${row.endTime.substring(
          0,
          10
        )}`;
      },
    },
    {
      key: "createdAt",
      header: "Created On",
      render: (row: ExamRoutine) => {
        const date = new Date(row.createdAt);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: ExamRoutine) => (
        <div className="flex space-x-2 items-center">
          <IconButton onClick={() => handleOpenEditRoutineModal(row)}>
            <Edit color="#035140" size={18} />
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
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Exam Routine Management"
        buttonText="Add Routine"
        buttonIcon={<Plus size={20} />}
        onButtonClick={handleOpenAddRoutineModal}
      />

      <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
        <SearchingInputField
          placeholder="Search exam routines..."
          onSearch={(term) => {
            setSearchTerm(term);
            setPage(0);
          }}
          debounceTime={300}
          maxWidth={400}
          height="36px"
        />
      </Box>

      {/* Add/Edit Routine Modal */}
      <AnimatePresence>
        {addRoutineModalOpen && (
          <Modal
            open={addRoutineModalOpen}
            onClose={handleCloseAddRoutineModal}
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
                width: "600px",
                maxWidth: "95%",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: `
                  linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,252,251,0.98)),
                  radial-gradient(circle at top left, rgba(26,60,52,0.03), transparent 60%)
                `,
              }}
            >
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
                  onClick={handleCloseAddRoutineModal}
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
                  {currentRoutine ? "Edit Exam Routine" : "Add Exam Routine"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <FormControl fullWidth>
                    <InputLabel
                      sx={{
                        color: "#5F7161",
                        fontWeight: 500,
                        "&.Mui-focused": {
                          color: "#1A3C34",
                        },
                      }}
                    >
                      Exam Name {theStar}
                    </InputLabel>
                    <Select
                      value={formValues.examNameId || ""}
                      onChange={(e) =>
                        handleFormChange("examNameId", Number(e.target.value))
                      }
                      label="Exam Name"
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
                      {(examsData as ApiResponse<Exam>)?.data?.map((exam) => (
                        <MenuItem key={exam.id} value={exam.id}>
                          {exam.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <FormControl fullWidth>
                    <InputLabel
                      sx={{
                        color: "#5F7161",
                        fontWeight: 500,
                        "&.Mui-focused": {
                          color: "#1A3C34",
                        },
                      }}
                    >
                      Session Year {theStar}
                    </InputLabel>
                    <Select
                      fullWidth
                      label="Session Year"
                      variant="outlined"
                      value={formValues.sessionYearId || ""}
                      onChange={(e) =>
                        handleFormChange(
                          "sessionYearId",
                          Number(e.target.value)
                        )
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
                      {(sessionsData as ApiResponse<Session>)?.data?.map(
                        (session) => (
                          <MenuItem key={session.id} value={session.id}>
                            {session.name}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </motion.div>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ flex: 1 }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>Class {theStar}</InputLabel>
                      <Select
                        value={formValues.classNameId || ""}
                        onChange={(e) =>
                          handleFormChange(
                            "classNameId",
                            Number(e.target.value)
                          )
                        }
                        label="Class"
                      >
                        {(classesData as ApiResponse<ClassItem>)?.data?.map(
                          (cls) => (
                            <MenuItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    style={{ flex: 1 }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>Section {theStar}</InputLabel>
                      <Select
                        value={formValues.sectionNameId || ""}
                        onChange={(e) =>
                          handleFormChange(
                            "sectionNameId",
                            Number(e.target.value)
                          )
                        }
                        label="Section"
                      >
                        {(sectionsData as ApiResponse<Section>)?.data?.map(
                          (section) => (
                            <MenuItem key={section.id} value={section.id}>
                              {section.name}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ flex: 1 }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>Stream {theStar}</InputLabel>
                      <Select
                        value={formValues.streamNameId || ""}
                        onChange={(e) =>
                          handleFormChange(
                            "streamNameId",
                            Number(e.target.value)
                          )
                        }
                        label="Stream"
                      >
                        {(streamsData as ApiResponse<Stream>)?.data?.map(
                          (stream) => (
                            <MenuItem key={stream.id} value={stream.id}>
                              {stream.name}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>
                  </motion.div>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    style={{ flex: 1 }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>Subject {theStar}</InputLabel>
                      <Select
                        value={formValues.subjectNameId || ""}
                        onChange={(e) =>
                          handleFormChange(
                            "subjectNameId",
                            Number(e.target.value)
                          )
                        }
                        label="Subject"
                      >
                        {(subjectsData as ApiResponse<Subject>)?.data?.map(
                          (subject) => (
                            <MenuItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ flex: 1 }}
                  >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label={
                          <>
                          Enter Date {theStar}
                          </>
                        }
                        value={
                          formValues.examDate
                            ? dayjs(formValues.examDate)
                            : null
                        }
                        onChange={(newValue) => {
                          handleFormChange(
                            "examDate",
                            newValue
                              ? (newValue as dayjs.Dayjs).format("YYYY-MM-DD")
                              : undefined
                          );
                        }}
                        sx={{ width: "100%" }}
                      />
                    </LocalizationProvider>
                  </motion.div>
                </Box>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <FormControl fullWidth>
                    <InputLabel>Time Slot {theStar}</InputLabel>
                    <Select
                      value={formValues.slotId || ""} // Use slotId instead of startTime
                      onChange={(e) => {
                        const slotId = Number(e.target.value);
                        const selectedSlot = (
                          slotsData as ApiResponse<Slot>
                        )?.data?.find((slot) => slot.id === slotId);

                        if (selectedSlot) {
                          setFormValues((prev) => ({
                            ...prev,
                            slotId: slotId,
                            startTime: selectedSlot.startTime,
                            endTime: selectedSlot.endTime,
                          }));
                        }
                      }}
                      label="Time Slot"
                    >
                      {(slotsData as ApiResponse<Slot>)?.data?.map((slot) => (
                        <MenuItem key={slot.id} value={slot.id}>
                          {`${slot.startTime.substring(
                            0,
                            10
                          )} - ${slot.endTime.substring(0, 10)}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </motion.div>
              </Box>

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
                  <CancelButton onClick={handleCloseAddRoutineModal}>
                    Cancel
                  </CancelButton>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SubmitButton
                    onClick={handleCreateOrUpdateRoutine}
                    disabled={
                      isCreatingRoutine ||
                      isUpdatingRoutine ||
                      !formValues.examNameId ||
                      !formValues.sessionYearId ||
                      !formValues.classNameId ||
                      !formValues.sectionNameId ||
                      !formValues.streamNameId ||
                      !formValues.subjectNameId ||
                      !formValues.startTime ||
                      !formValues.examDate
                    }
                  
                  >
                    {isCreatingRoutine || isUpdatingRoutine ? (
                      <span>
                        {currentRoutine ? "Updating..." : "Submitting..."}
                      </span>
                    ) : (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <span>{currentRoutine ? "Update" : "Submit"}</span>
                      </Box>
                    )}
                  </SubmitButton>
                </motion.div>
              </Box>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <Paper>
        {isLoading || (hasFilters && isFilterLoading) ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError || (hasFilters && isFilterError) ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load exam routines | If you use filter select all fields
            for filtering.
          </Alert>
        ) : routines.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No exam routines found.{" "}
            {searchTerm || hasFilters
              ? "Try different search or filter criteria."
              : "Add your first exam routine."}
          </Typography>
        ) : (
          <>
            <ReusableTable<ExamRoutine> columns={columns} data={routines} />
            <PaginationComponent
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage - 1)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </>
        )}
      </Paper>

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteRoutine()}
        title="Delete Exam Routine"
        description="Are you sure you want to delete this exam routine? This action cannot be undone."
        isLoading={isDeleting}
      />
    </Box>
  );
};

export default ExamRoutineList;
