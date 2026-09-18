"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
} from "@mui/material";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useCreateExamMutation, useDeleteExamMutation, useGetAllExamsQuery, useUpdateExamMutation } from "@/app/store/api/classes/examApi";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";

interface Exam {
  id: number;
  name: string;
  sessionYearId: number;
  isPublish: boolean;
  isFinal: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface Session {
  id: number;
  name: string;
  [key: string]: unknown;
}

const ExamList = () => {
  const [addExamModalOpen, setAddExamModalOpen] = useState<boolean>(false);
  const [examName, setExamName] = useState<string>("");
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionYearId, setSessionYearId] = useState<number | "">("");
  const [isPublish, setIsPublish] = useState<boolean>(false);
  const [isFinal, setIsFinal] = useState<boolean>(false);

  // Using the query hook to fetch sessions
  const { data: sessionsResponse, isLoading: isLoadingSessions } = useGetAllSessionsQuery({});
  const sessions: Session[] = sessionsResponse?.data || [];

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllExamsQuery({
    page: page + 1,
    size: rowsPerPage,
    search: searchTerm,
  });

  const [createExam, { isLoading: isCreatingExam }] = useCreateExamMutation();
  const [updateExam, { isLoading: isUpdatingExam }] = useUpdateExamMutation();
  const [deleteExam] = useDeleteExamMutation();

  const {
    isDeleteModalOpen,
    itemToDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    handleDelete: handleDeleteConfirmation,
  } = useDeleteConfirmation();

  const exams: Exam[] = Array.isArray(responseData?.data)
    ? responseData.data
    : responseData?.data || [];

  const handleOpenAddExamModal = () => {
    setCurrentExam(null);
    setExamName("");
    setSessionYearId("");
    setIsPublish(false);
    setIsFinal(false);
    setAddExamModalOpen(true);
  };

  const handleOpenEditExamModal = (exam: Exam) => {
    setCurrentExam(exam);
    setExamName(exam.name);
    setSessionYearId(exam.sessionYearId);
    setIsPublish(exam.isPublish);
    setIsFinal(exam.isFinal);
    setAddExamModalOpen(true);
  };

  const handleCloseAddExamModal = () => {
    setAddExamModalOpen(false);
    setExamName("");
    setSessionYearId("");
    setIsPublish(false);
    setIsFinal(false);
    setCurrentExam(null);
  };

  const totalPages = responseData?.meta?.totalPage || 1;

  const handleCreateOrUpdateExam = async () => {
    try {
      if (!examName.trim()) {
        toastShowing('Exam name cannot be empty', 'bottom-right', 2000, 'red', 'white');
        return;
      }

      if (!sessionYearId) {
        toastShowing('Please select a session year', 'bottom-right', 2000, 'red', 'white');
        return;
      }

      const payload = {
        name: examName,
        sessionYearId: Number(sessionYearId),
        isPublish,
        isFinal
      };

      if (currentExam) {
        await updateExam({
          id: currentExam.id,
          ...payload
        }).unwrap();
        toastShowing('Exam updated successfully', 'bottom-right', 2000, 'green', 'white');
      } else {
        await createExam(payload).unwrap();
        toastShowing('Exam added successfully', 'bottom-right', 2000, 'green', 'white');
      }

      refetch();
      handleCloseAddExamModal();
    } catch (err) {
      toastShowing(
        (err as { data?: { message?: string } })?.data?.message ||
        (currentExam ? "Failed to update exam" : "Failed to add exam"),
        'bottom-right',
        2000,
        'red',
        'white'
      );
      console.error("Error saving exam:", err);
    }
  };

  const handleDeleteExam = async () => {
    await handleDeleteConfirmation(
      async (examId) => {
        await deleteExam(examId).unwrap();
        refetch();
      },
      {
        successMessage: "Exam deleted successfully",
        errorMessage: "Failed to delete exam",
      }
    );
  };

  const columns = [
    {
      key: "sl",
      header: "SL",
      render: (row: Exam, index?: number) => (index !== undefined ? index + 1 : null),
    },
    {
      key: 'name',
      header: 'Exam Name'
    },
    {
      key: 'session.name',
      header: 'Session Year',
      render: (row: Exam) => {
        const session = sessions.find(s => s.id === row.sessionYearId);
        return session?.name || 'N/A';
      }
    },
    {
      key: 'isPublish',
      header: 'Published',
      render: (row: Exam) => (
        <Typography color={row.isPublish ? "success.main" : "error.main"}>
          {row.isPublish ? "Yes" : "No"}
        </Typography>
      )
    },
    {
      key: 'isFinal',
      header: 'Final',
      render: (row: Exam) => (
        <Typography color={row.isFinal ? "success.main" : "error.main"}>
          {row.isFinal ? "Yes" : "No"}
        </Typography>
      )
    },
    {
      key: 'createdAt',
      header: 'Created On',
      render: (row: Exam) => {
        const date = new Date(row.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        return formattedDate;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Exam) => (
        <div className="flex space-x-2 items-center">
          <IconButton onClick={() => handleOpenEditExamModal(row)}>
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
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <SearchingInputField
          placeholder="Search exams..."
          onSearch={(term) => {
            setSearchTerm(term);
            setPage(0);
          }}
          debounceTime={300}
          maxWidth={400}
          height="36px"
        />
      </Box>

      <PageHeader
        title="Exam Management"
        buttonText="Add Exam"
        buttonIcon={<Plus size={20} />}
        onButtonClick={handleOpenAddExamModal}
      />

      <AnimatePresence>
        {addExamModalOpen && (
          <Modal
            open={addExamModalOpen}
            onClose={handleCloseAddExamModal}
            closeAfterTransition
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
                duration: 0.3
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                position: 'relative',
                padding: '2rem',
                borderRadius: '6px',
                outline: 'none',
                width: '480px',
                maxWidth: '95%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
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
                  position: 'absolute',
                  top: '-12px',
                  right: '-12px',
                  zIndex: 1,
                }}
              >
                <IconButton
                  onClick={handleCloseAddExamModal}
                  sx={{
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(26, 60, 52, 0.2)',
                    '&:hover': {
                      backgroundColor: '#0F2922',
                    }
                  }}
                >
                  <X size={18} />
                </IconButton>
              </motion.div>

              <Box sx={{ position: 'relative', mb: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: '#1A3C34',
                    position: 'relative',
                    display: 'inline-block',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-8px',
                      left: 0,
                      width: '48px',
                      height: '4px',
                      background: 'linear-gradient(90deg, #1A3C34, rgba(26,60,52,0.3))',
                      borderRadius: '2px',
                    }
                  }}
                >
                  {currentExam ? "Edit Exam" : "Add Exam"}
                </Typography>
              </Box>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <TextField
                  fullWidth
                  label={
                    <span style={{ color: '#5F7161', fontWeight: 500 }}>
                      Exam Name {theStar}
                    </span>
                  }
                  variant="outlined"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
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
                  autoFocus
                  InputProps={{
                    style: {
                      fontSize: '0.875rem',
                    },
                    inputProps: {
                      style: {
                        height: '100%',
                      }
                    }
                  }}
                />
              </motion.div>

              {/* Session year dropdown */}
              <motion.div className="mt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <FormControl fullWidth>
                  <InputLabel sx={{
                    color: '#5F7161',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: '#1A3C34',
                    }
                  }}>
                    Session Year {theStar}
                  </InputLabel>
                  <Select
                    value={sessionYearId}
                    onChange={(e) => setSessionYearId(Number(e.target.value))}
                    label="Session Year"
                    disabled={isLoadingSessions}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '6px',
                        '& fieldset': {
                          borderColor: 'rgba(26,60,52,0.2)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#1A3C34',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1A3C34',
                          boxShadow: '0 0 0 2px rgba(26,60,52,0.2)',
                        },
                      },
                    }}
                  >
                    {isLoadingSessions ? (
                      <MenuItem disabled>Loading sessions...</MenuItem>
                    ) : (
                      sessions.map((session) => (
                        <MenuItem key={session.id} value={session.id}>
                          {session.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </motion.div>

              {/* Toggle switches */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Stack direction="row" spacing={4} sx={{ mt: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isPublish}
                        onChange={(e) => setIsPublish(e.target.checked)}
                        color="success"
                      />
                    }
                    label="Published"
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: 500,
                        color: '#5F7161',
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isFinal}
                        onChange={(e) => setIsFinal(e.target.checked)}
                        color="success"
                      />
                    }
                    label="Final Exam"
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: 500,
                        color: '#5F7161',
                      }
                    }}
                  />
                </Stack>
              </motion.div>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                  mt: 4,
                  position: 'relative',
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CancelButton
                    onClick={handleCloseAddExamModal}
                  >
                    Cancel
                  </CancelButton>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SubmitButton
                    onClick={handleCreateOrUpdateExam}
                    disabled={(isCreatingExam || isUpdatingExam) || !examName.trim() || !sessionYearId}
                  >
                    {(isCreatingExam || isUpdatingExam) ? (
                      <span>{currentExam ? "Updating..." : "Submitting..."}</span>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{currentExam ? "Update" : "Submit"}</span>

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
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load exams
          </Alert>
        ) : exams.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No exams found. {searchTerm ? "Try a different search term." : "Add your first exam."}
          </Typography>
        ) : (
          <>
            <ReusableTable<Exam>
              columns={columns}
              data={exams}
            />
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
        onConfirm={() => handleDeleteExam()}
        title="Delete Exam"
        description="Are you sure you want to delete this exam? All associated data will be permanently removed."
        isLoading={isDeleting}
      />
    </Box>
  );
};

export default ExamList;