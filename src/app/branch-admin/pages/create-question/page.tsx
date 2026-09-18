"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Modal,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
} from "@mui/material";
import { Plus, X } from "lucide-react";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { motion, AnimatePresence } from "framer-motion";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { BsThreeDotsVertical } from "react-icons/bs";
import { SelectChangeEvent } from "@mui/material";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { theStar } from "@/lib/requiredJSX";
import Image from "next/image";
import {
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  useGetAllQuestionsQuery,
  useGetQuestionByIdQuery,
  useUpdateQuestionMutation,
} from "@/app/store/api/classes/questionApi";
import { useGetAllTeachersQuery } from "@/app/store/api/teacher/teacherApi";
import { useAddThumbnailMutation } from "@/app/store/api/file/fileApi";
import { Image as ImageIcon } from "lucide-react";
import { usePrintQuestionPdf } from "@/components/pageComponents/dashboard/admin/question/PrintQuestionPdf";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

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
interface Teacher {
  id: number;
  name: string;
  teacherUniqueId: string;
}

interface Question {
  id: number;
  questionType: string;
  sessionYearId: number;
  teacherId: number;
  classNameId: number;
  sectionNameId: number | null;
  streamNameId: number | null;
  question: string;
  answer: string | null;
  createdAt: string;
  updatedAt: string;
  session?: {
    name: string;
  };
  teacher?: {
    name: string;
  };
  class?: {
    name: string;
  };
  section?: {
    name: string;
  };
  stream?: {
    name: string;
  };
  [key: string]: unknown;
}

const QuestionList = () => {
  const [addQuestionModalOpen, setAddQuestionModalOpen] =
    useState<boolean>(false);
  const [viewQuestionModalOpen, setViewQuestionModalOpen] =
    useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
  const [questionImagePreview, setQuestionImagePreview] = useState<
    string | null
  >(null);
  const [answerImageFile, setAnswerImageFile] = useState<File | null>(null);
  const [answerImagePreview, setAnswerImagePreview] = useState<string | null>(
    null
  );

  // Form state
  const [formData, setFormData] = useState({
    questionType: "MCQ",
    sessionYearId: "",
    teacherId: "",
    classNameId: "",
    sectionNameId: "",
    streamNameId: "",
  });

  // Fetch all necessary data
  const {
    data: questionsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetAllQuestionsQuery({
    page: page + 1,
    size: rowsPerPage,
    search: searchTerm,
  });

  const { data: classes } = useGetAllClassQuery({});
  const { data: sessions } = useGetAllSessionsQuery({});
  const { data: sections } = useGetAllSectionsQuery({});
  const { data: streams } = useGetAllStreamsQuery({});
  const { data: teachersData } = useGetAllTeachersQuery({
    page: 1,
    size: 1000000,
  });
  const { data: questionDetails } = useGetQuestionByIdQuery(
    currentQuestion?.id || 0,
    {
      skip: !currentQuestion?.id,
    }
  );

  const [addThumbnail] = useAddThumbnailMutation();

  const {
    isDeleteModalOpen,
    itemToDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    handleDelete: handleDeleteConfirmation,
  } = useDeleteConfirmation();

  const [createQuestion] =
    useCreateQuestionMutation();
  const [updateQuestion] =
    useUpdateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();

  const totalPages = questionsResponse?.meta?.totalPage || 1;
  const questions: Question[] = Array.isArray(questionsResponse?.data)
    ? questionsResponse.data
    : questionsResponse?.data || [];
  const teachers: Teacher[] = teachersData?.data || [];

  // Modal handlers
  const handleOpenAddQuestionModal = () => {
    setCurrentQuestion(null);
    setFormData({
      questionType: "MCQ",
      sessionYearId: "",
      teacherId: "",
      classNameId: "",
      sectionNameId: "",
      streamNameId: "",
    });
    setQuestionImageFile(null);
    setQuestionImagePreview(null);
    setAnswerImageFile(null);
    setAnswerImagePreview(null);
    setAddQuestionModalOpen(true);
  };

  const handleOpenEditQuestionModal = (question: Question) => {
    setCurrentQuestion(question);
    setFormData({
      questionType: question.questionType,
      sessionYearId: question.sessionYearId.toString(),
      teacherId: question.teacherId.toString(),
      classNameId: question.classNameId.toString(),
      sectionNameId: question.sectionNameId?.toString() || "",
      streamNameId: question.streamNameId?.toString() || "",
    });
    setQuestionImagePreview(question.question);
    setAnswerImagePreview(question.answer || null);
    setAddQuestionModalOpen(true);
  };

  const handleOpenViewQuestionModal = async (question: Question) => {
    setCurrentQuestion(question);
    setViewQuestionModalOpen(true);
  };

  const handleCloseAddQuestionModal = () => {
    setAddQuestionModalOpen(false);
    setCurrentQuestion(null);
  };

  const handleCloseViewQuestionModal = () => {
    setViewQuestionModalOpen(false);
    setCurrentQuestion(null);
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuestionImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setQuestionImageFile(file);
      setQuestionImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAnswerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAnswerImageFile(file);
      setAnswerImagePreview(URL.createObjectURL(file));
    }
  };

  const removeQuestionImage = () => {
    setQuestionImageFile(null);
    setQuestionImagePreview(null);
  };

  const removeAnswerImage = () => {
    setAnswerImageFile(null);
    setAnswerImagePreview(null);
  };

  const uploadImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const response = await addThumbnail(formData).unwrap();
      return response?.data?.[0] || "";
    } catch (err) {
      console.error("Image upload error:", err);
      throw new Error("Failed to upload image");
    }
  };

  const handleCreateOrUpdateQuestion = async () => {
    try {
      // Validate required fields
      if (
        !formData.questionType ||
        !formData.sessionYearId ||
        !formData.teacherId ||
        !formData.classNameId ||
        !questionImagePreview
      ) {
        toastShowing(
          "Required fields are missing",
          "bottom-right",
          2000,
          "red",
          "white"
        );
        return;
      }

      // Upload question image if new file was selected
      let questionImageUrl = currentQuestion?.question || "";
      if (questionImageFile) {
        questionImageUrl = await uploadImage(questionImageFile);
      }

      // Upload answer image if new file was selected
      let answerImageUrl = currentQuestion?.answer || null;
      if (answerImageFile) {
        answerImageUrl = await uploadImage(answerImageFile);
      } else if (!answerImagePreview && currentQuestion?.answer) {
        // If answer image was removed
        answerImageUrl = null;
      }

      const questionData = {
        questionType: formData.questionType,
        sessionYearId: Number(formData.sessionYearId),
        teacherId: Number(formData.teacherId),
        classNameId: Number(formData.classNameId),
        sectionNameId: formData.sectionNameId
          ? Number(formData.sectionNameId)
          : null,
        streamNameId: formData.streamNameId
          ? Number(formData.streamNameId)
          : null,
        question: questionImageUrl,
        answer: answerImageUrl,
      };

      if (currentQuestion) {
        // Update existing question
        await updateQuestion({
          id: currentQuestion.id,
          ...questionData,
        }).unwrap();
        toastShowing(
          "Question updated successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      } else {
        // Create new question
        await createQuestion(questionData).unwrap();
        toastShowing(
          "Question created successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      }

      refetch();
      handleCloseAddQuestionModal();
    } catch (err) {
      toastShowing(
        (err as { data?: { message?: string } })?.data?.message ||
        (currentQuestion
          ? "Failed to update question"
          : "Failed to create question"),
        "bottom-right",
        2000,
        "red",
        "white"
      );
      console.error("Error saving question:", err);
    }
  };

  const handleDeleteQuestion = async () => {
    await handleDeleteConfirmation(
      async (questionId) => {
        await deleteQuestion(questionId).unwrap();
        refetch();
      },
      {
        successMessage: "Question deleted successfully",
        errorMessage: "Failed to delete question",
      }
    );
  };

  const columns = [
    {
      key: "sl",
      header: "SL",
      render: (row: Question, index?: number) =>
        index !== undefined ? index + 1 : null,
    },
    {
      key: "questionType",
      header: "Type",
      render: (row: Question) => (
        <Typography variant="body2">{row.questionType}</Typography>
      ),
    },
    {
      key: "question",
      header: "Question",
      render: (row: Question) => (
        <Box sx={{ width: 100, height: 60, position: "relative" }}>
          <Image
            src={row.question}
            alt="Question"
            layout="fill"
            objectFit="contain"
          />
        </Box>
      ),
    },
    {
      key: "answer",
      header: "Answer",
      render: (row: Question) =>
        row.answer ? (
          <Box sx={{ width: 100, height: 60, position: "relative" }}>
            <Image
              src={row.answer}
              alt="Answer"
              layout="fill"
              objectFit="contain"
            />
          </Box>
        ) : (
          <Typography variant="body2"></Typography>
        ),
    },
    {
      key: "teacher",
      header: "Teacher",
      render: (row: Question) => (
        <Typography variant="body2">
          {row.teacher?.name || buttonLoader}
        </Typography>
      ),
    },
    {
      key: "class",
      header: "Class",
      render: (row: Question) => (
        <Typography variant="body2">
          {row.class?.name || buttonLoader}
        </Typography>
      ),
    },
    {
      key: "session",
      header: "Session",
      render: (row: Question) => (
        <Typography variant="body2">
          {row.session?.name || buttonLoader}
        </Typography>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (row: Question) => {
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
      render: (row: Question) => {
        const {
          handlePrintQuestion,
          handlePrintAnswer,
          handleDownloadQuestionPDF,
          handleDownloadAnswerPDF,
          hasAnswer,
          // eslint-disable-next-line react-hooks/rules-of-hooks
        } = usePrintQuestionPdf({
          questionImage: row.question,
          answerImage: row.answer || null,
          questionType: row.questionType,
          teacherName: row.teacher?.name || "",
          className: row.class?.name || "",
          sessionName: row.session?.name || "",
        });

        return (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Tooltip
              title={
                <Paper
                  elevation={3}
                  sx={{
                    backgroundColor: "white",
                    padding: "8px 0",
                    borderRadius: "8px",
                    display: "grid",
                    gap: "4px",
                    minWidth: "120px",
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {/* View Button */}
                  <Button
                    onClick={() => {
                      handleOpenViewQuestionModal(row);
                      setOpenMenuId(null);
                    }}
                    size="small"
                    sx={{
                      color: "#035140",
                      textTransform: "none",
                      fontSize: "14px",
                      fontWeight: 400,
                      justifyContent: "flex-start",
                      padding: "6px 16px",
                      "&:hover": {
                        backgroundColor: "rgba(3, 81, 64, 0.08)",
                      },
                    }}
                  >
                    View
                  </Button>

                  {/* Edit Button */}
                  <Button
                    onClick={() => {
                      handleOpenEditQuestionModal(row);
                      setOpenMenuId(null);
                    }}
                    size="small"
                    sx={{
                      color: "#035140",
                      textTransform: "none",
                      fontSize: "14px",
                      fontWeight: 400,
                      justifyContent: "flex-start",
                      padding: "6px 16px",
                      "&:hover": {
                        backgroundColor: "rgba(3, 81, 64, 0.08)",
                      },
                    }}
                  >
                    Edit
                  </Button>

                  {/* Always show these buttons */}
                  <Button
                    onClick={() => {
                      handlePrintQuestion();
                      setOpenMenuId(null);
                    }}
                    size="small"
                    sx={{
                      color: "#035140",
                      textTransform: "none",
                      fontSize: "14px",
                      fontWeight: 400,
                      justifyContent: "flex-start",
                      padding: "6px 16px",
                      "&:hover": {
                        backgroundColor: "rgba(3, 81, 64, 0.08)",
                      },
                    }}
                  >
                    Print Question
                  </Button>

                  <Button
                    onClick={() => {
                      handleDownloadQuestionPDF();
                      setOpenMenuId(null);
                    }}
                    size="small"
                    sx={{
                      color: "#035140",
                      textTransform: "none",
                      fontSize: "14px",
                      fontWeight: 400,
                      justifyContent: "flex-start",
                      padding: "6px 16px",
                      "&:hover": {
                        backgroundColor: "rgba(3, 81, 64, 0.08)",
                      },
                    }}
                  >
                    PDF Question
                  </Button>

                  {/* Only show answer buttons if answer exists */}
                  {hasAnswer && (
                    <>
                      <Button
                        onClick={() => {
                          handlePrintAnswer();
                          setOpenMenuId(null);
                        }}
                        size="small"
                        sx={{
                          color: "#035140",
                          textTransform: "none",
                          fontSize: "14px",
                          fontWeight: 400,
                          justifyContent: "flex-start",
                          padding: "6px 16px",
                          "&:hover": {
                            backgroundColor: "rgba(3, 81, 64, 0.08)",
                          },
                        }}
                      >
                        Print Answer
                      </Button>

                      <Button
                        onClick={() => {
                          handleDownloadAnswerPDF();
                          setOpenMenuId(null);
                        }}
                        size="small"
                        sx={{
                          color: "#035140",
                          textTransform: "none",
                          fontSize: "14px",
                          fontWeight: 400,
                          justifyContent: "flex-start",
                          padding: "6px 16px",
                          "&:hover": {
                            backgroundColor: "rgba(3, 81, 64, 0.08)",
                          },
                        }}
                      >
                        PDF Answer
                      </Button>
                    </>
                  )}

                  {/* Delete Button */}
                  <Button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      openDeleteModal(row.id);
                      setOpenMenuId(null);
                    }}
                    size="small"
                    disabled={isDeleting && itemToDelete === row.id}
                    sx={{
                      color: "#DC2626",
                      textTransform: "none",
                      fontSize: "14px",
                      fontWeight: 400,
                      justifyContent: "flex-start",
                      padding: "6px 16px",
                      "&:hover": {
                        backgroundColor: "rgba(220, 38, 38, 0.08)",
                      },
                      "&.Mui-disabled": {
                        color: "rgba(220, 38, 38, 0.5)",
                      },
                    }}
                  >
                    {isDeleting && itemToDelete === row.id ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <CircularProgress
                          size={14}
                          thickness={5}
                          color="inherit"
                        />
                        Deleting...
                      </span>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </Paper>
              }
              placement="bottom-end"
              open={openMenuId === row.id}
              onOpen={() => setOpenMenuId(row.id)}
              onClose={() => setOpenMenuId(null)}
              disableFocusListener
              disableHoverListener
              disableTouchListener
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: "transparent",
                    padding: 0,
                    boxShadow: "none",
                  },
                },
              }}
              PopperProps={{
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, -10],
                    },
                  },
                ],
              }}
            >
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === row.id ? null : row.id);
                }}
                sx={{
                  color: "#64748B",
                  p: 1,
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "rgba(100, 116, 139, 0.1)",
                  },
                }}
              >
                <BsThreeDotsVertical size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Question Management"
        buttonText="Add Question"
        buttonIcon={<Plus size={20} />}
        onButtonClick={handleOpenAddQuestionModal}
      />

      <Box sx={{ mb: 2 }}>
        <SearchingInputField
          placeholder="Search questions..."
          onSearch={(term) => {
            setSearchTerm(term);
            setPage(0);
          }}
          debounceTime={300}
          maxWidth={400}
          height="36px"
        />
      </Box>

      {/* Add/Edit Question Modal */}
      <AnimatePresence>
        {addQuestionModalOpen && (
          <Modal
            open={addQuestionModalOpen}
            onClose={handleCloseAddQuestionModal}
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
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                position: "relative",
                borderRadius: "12px",
                outline: "none",
                width: "600px",
                maxWidth: "95vw",
                maxHeight: "95vh",
                boxShadow: "0 20px 60px -10px rgba(0, 0, 0, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                background: `
                        linear-gradient(145deg, rgba(255,255,255,0.99), rgba(250,252,251,0.99)),
                        radial-gradient(circle at top left, rgba(26,60,52,0.05), transparent 60%)
                    `,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Floating close button - fixed position */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  zIndex: 10,
                }}
              >
                <IconButton
                  onClick={handleCloseAddQuestionModal}
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

              {/* Header with decorative accent - fixed position */}
              <Box
                sx={{
                  position: "relative",
                  padding: "24px 24px 16px",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                  zIndex: 2,
                }}
              >
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
                      height: "3px",
                      background:
                        "linear-gradient(90deg, #1A3C34, rgba(26,60,52,0.3))",
                      borderRadius: "2px",
                    },
                  }}
                >
                  {currentQuestion ? "Edit Question" : "Add Question"}
                </Typography>
              </Box>

              {/* Scrollable form content */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "0 24px",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gap: "20px",
                    padding: "16px 0 24px",
                  }}
                >
                  <Box sx={{ display: 'grid', gap: 2 }}>
                    {/* Row 1: Question Type and Teacher */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        <FormControl fullWidth>
                          <InputLabel>Question Type {theStar}</InputLabel>
                          <Select
                            name="questionType"
                            value={formData.questionType}
                            onChange={handleSelectChange}
                            label="Question Type"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                                '& fieldset': {
                                  borderColor: '#035140',
                                },
                                '&:hover fieldset': {
                                  borderColor: '#035140',
                                },
                              },
                            }}
                          >
                            <MenuItem value="MCQ">MCQ</MenuItem>
                            <MenuItem value="Written">Written</MenuItem>
                          </Select>
                        </FormControl>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <FormControl fullWidth>
                          <InputLabel>Teacher {theStar}</InputLabel>
                          <Select
                            name="teacherId"
                            value={formData.teacherId}
                            onChange={handleSelectChange}
                            label="Teacher"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                                '& fieldset': {
                                  borderColor: '#035140',
                                },
                                '&:hover fieldset': {
                                  borderColor: '#035140',
                                },
                              },
                            }}
                          >
                            {teachers.map((teacher: Teacher) => (
                              <MenuItem key={teacher.id} value={teacher.id}>
                                {teacher.name} ({teacher.teacherUniqueId})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </motion.div>
                    </Box>

                    {/* Row 2: Session Year and Class */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <FormControl fullWidth>
                          <InputLabel>Session Year {theStar}</InputLabel>
                          <Select
                            name="sessionYearId"
                            value={formData.sessionYearId}
                            onChange={handleSelectChange}
                            label="Session Year"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                                '& fieldset': {
                                  borderColor: '#035140',
                                },
                                '&:hover fieldset': {
                                  borderColor: '#035140',
                                },
                              },
                            }}
                          >
                            {sessions?.data?.map((session: Session) => (
                              <MenuItem key={session.id} value={session.id}>
                                {session.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <FormControl fullWidth>
                          <InputLabel>Class {theStar}</InputLabel>
                          <Select
                            name="classNameId"
                            value={formData.classNameId}
                            onChange={handleSelectChange}
                            label="Class"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                                '& fieldset': {
                                  borderColor: '#035140',
                                },
                                '&:hover fieldset': {
                                  borderColor: '#035140',
                                },
                              },
                            }}
                          >
                            {classes?.data?.map((cls: ClassItem) => (
                              <MenuItem key={cls.id} value={cls.id}>
                                {cls.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </motion.div>
                    </Box>

                    {/* Row 3: Section and Stream */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <FormControl fullWidth>
                          <InputLabel>Section</InputLabel>
                          <Select
                            name="sectionNameId"
                            value={formData.sectionNameId}
                            onChange={handleSelectChange}
                            label="Section"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                                '& fieldset': {
                                  borderColor: '#035140',
                                },
                                '&:hover fieldset': {
                                  borderColor: '#035140',
                                },
                              },
                            }}
                          >
                            {sections?.data?.map((section: Section) => (
                              <MenuItem key={section.id} value={section.id}>
                                {section.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <FormControl fullWidth>
                          <InputLabel>Stream</InputLabel>
                          <Select
                            name="streamNameId"
                            value={formData.streamNameId}
                            onChange={handleSelectChange}
                            label="Stream"
                            sx={{
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
                            }}
                          >
                            {streams?.data?.map((stream: Stream) => (
                              <MenuItem key={stream.id} value={stream.id}>
                                {stream.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </motion.div>
                    </Box>
                  </Box>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, color: "#1A3C34" }}
                    >
                      Question Image {theStar}
                    </Typography>
                    <Box
                      sx={{
                        border: "2px dashed",
                        borderColor: "rgba(26,60,52,0.2)",
                        borderRadius: "6px",
                        p: 3,
                        textAlign: "center",
                        mb: 2,
                        "&:hover": {
                          borderColor: "#1A3C34",
                        },
                      }}
                    >
                      <label htmlFor="question-upload">
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          <ImageIcon size={40} color="#5F7161" />
                          <Typography
                            variant="body1"
                            sx={{ mt: 1, color: "#5F7161" }}
                          >
                            Click to upload question image
                          </Typography>
                        </Box>
                      </label>
                      <input
                        id="question-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleQuestionImageChange}
                        style={{ display: "none" }}
                      />
                    </Box>

                    {questionImagePreview && (
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: "200px",
                          borderRadius: "6px",
                          overflow: "hidden",
                          border: "1px solid rgba(0,0,0,0.1)",
                          mb: 2,
                        }}
                      >
                        <Image
                          src={questionImagePreview}
                          alt="Question Preview"
                          fill
                          style={{ objectFit: "contain" }}
                        />
                        <IconButton
                          onClick={removeQuestionImage}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "rgba(0,0,0,0.7)",
                            },
                          }}
                        >
                          <X size={18} />
                        </IconButton>
                      </Box>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, color: "#1A3C34" }}
                    >
                      Answer Image (Optional)
                    </Typography>
                    <Box
                      sx={{
                        border: "2px dashed",
                        borderColor: "rgba(26,60,52,0.2)",
                        borderRadius: "6px",
                        p: 3,
                        textAlign: "center",
                        mb: 2,
                        "&:hover": {
                          borderColor: "#1A3C34",
                        },
                      }}
                    >
                      <label htmlFor="answer-upload">
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          <ImageIcon size={40} color="#5F7161" />
                          <Typography
                            variant="body1"
                            sx={{ mt: 1, color: "#5F7161" }}
                          >
                            Click to upload answer image
                          </Typography>
                        </Box>
                      </label>
                      <input
                        id="answer-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAnswerImageChange}
                        style={{ display: "none" }}
                      />
                    </Box>

                    {answerImagePreview && (
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: "200px",
                          borderRadius: "6px",
                          overflow: "hidden",
                          border: "1px solid rgba(0,0,0,0.1)",
                          mb: 2,
                        }}
                      >
                        <Image
                          src={answerImagePreview}
                          alt="Answer Preview"
                          fill
                          style={{ objectFit: "contain" }}
                        />
                        <IconButton
                          onClick={removeAnswerImage}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "rgba(0,0,0,0.7)",
                            },
                          }}
                        >
                          <X size={18} />
                        </IconButton>
                      </Box>
                    )}
                  </motion.div>
                </Box>
              </Box>

              {/* Fixed footer with action buttons */}
              <Box
                sx={{
                  padding: "16px 24px",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  borderTop: "1px solid rgba(0,0,0,0.05)",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  zIndex: 2,
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CancelButton
                    onClick={handleCloseAddQuestionModal}
                  />


                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SubmitButton onClick={handleCreateOrUpdateQuestion}
                  />

                </motion.div>
              </Box>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* View Question Modal */}
      <AnimatePresence>
        {viewQuestionModalOpen && currentQuestion && (
          <Modal
            open={viewQuestionModalOpen}
            onClose={handleCloseViewQuestionModal}
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
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                position: "relative",
                borderRadius: "12px",
                outline: "none",
                width: "600px",
                maxWidth: "95vw",
                maxHeight: "95vh",
                boxShadow: "0 20px 60px -10px rgba(0, 0, 0, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                background: `
                        linear-gradient(145deg, rgba(255,255,255,0.99), rgba(250,252,251,0.99)),
                        radial-gradient(circle at top left, rgba(26,60,52,0.05), transparent 60%)
                    `,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Floating close button - fixed position */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  zIndex: 10,
                }}
              >
                <IconButton
                  onClick={handleCloseViewQuestionModal}
                  sx={{
                    backgroundColor: "#1A3C34",
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

              {/* Header with decorative accent - fixed position */}
              <Box
                sx={{
                  position: "relative",
                  padding: "24px 24px 16px",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                  zIndex: 2,
                }}
              >
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
                      height: "3px",
                      background:
                        "linear-gradient(90deg, #1A3C34, rgba(26,60,52,0.3))",
                      borderRadius: "2px",
                    },
                  }}
                >
                  Question Details
                </Typography>
              </Box>

              {/* Scrollable content */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "0 24px",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gap: "20px",
                    padding: "16px 0 24px",
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Question Type:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {questionDetails?.data?.questionType || "N/A"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Teacher:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {questionDetails?.data?.teacher?.name || "N/A"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Class:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {questionDetails?.data?.class?.name || "N/A"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Session:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {questionDetails?.data?.session?.name || "N/A"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Section:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {questionDetails?.data?.section?.name || "N/A"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Stream:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {questionDetails?.data?.stream?.name || "N/A"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Created At:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(currentQuestion.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      Question:
                    </Typography>
                    <Box
                      sx={{
                        width: "100%",
                        height: "250px",
                        position: "relative",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src={questionDetails?.data?.question || ""}
                        alt="Question"
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    </Box>
                  </Box>

                  {questionDetails?.data?.answer && (
                    <Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 1 }}
                      >
                        Answer:
                      </Typography>
                      <Box
                        sx={{
                          width: "100%",
                          height: "250px",
                          position: "relative",
                          border: "1px solid rgba(0,0,0,0.08)",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          src={questionDetails?.data?.answer}
                          alt="Answer"
                          fill
                          style={{ objectFit: "contain" }}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Fixed footer with close button */}
              <Box
                sx={{
                  padding: "16px 24px",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  borderTop: "1px solid rgba(0,0,0,0.05)",
                  display: "flex",
                  justifyContent: "flex-end",
                  zIndex: 2,
                }}
              >
                <CancelButton
                  onClick={handleCloseViewQuestionModal}
                />

              </Box>
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
            Failed to load questions
          </Alert>
        ) : questions.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No questions found.{" "}
            {searchTerm
              ? "Try a different search term."
              : "Add your first question."}
          </Typography>
        ) : (
          <>
            <ReusableTable<Question> columns={columns} data={questions} />
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
        onConfirm={() => handleDeleteQuestion()}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        isLoading={isDeleting}
      />
    </Box>
  );
};

export default QuestionList;
