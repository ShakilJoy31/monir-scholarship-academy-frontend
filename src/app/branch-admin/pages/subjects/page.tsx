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
} from "@mui/material";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { useCreateSubjectMutation, useDeleteSubjectMutation, useGetAllSubjectsQuery, useUpdateSubjectMutation } from "@/app/store/api/classes/subjectApi";
import { validateEmptyFields } from "@/lib/objectModify";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";

interface Subject {
    id: number;
    name: string;
    code?: string;
    marks: number;
    passMarks: number;
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

const SubjectList = () => {
    const [addSubjectModalOpen, setAddSubjectModalOpen] = useState<boolean>(false);
    const [subjectName, setSubjectName] = useState<string>("");
    const [subjectCode, setSubjectCode] = useState<string>("");
    const [marks, setMarks] = useState<string>("100");
    const [passMarks, setPassMarks] = useState<string>("33");
    const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllSubjectsQuery({
        page: page + 1,
        size: rowsPerPage,
        search: searchTerm,
    });
    
    const {
        isDeleteModalOpen,
        itemToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    const [createSubject, ] = useCreateSubjectMutation();
    const [updateSubject, ] = useUpdateSubjectMutation();
    const [deleteSubject] = useDeleteSubjectMutation();

    const subjects: Subject[] = Array.isArray(responseData?.data)
        ? responseData.data
        : responseData?.data || [];
    const totalPages = responseData?.meta?.totalPage || 1;

    const handleOpenAddSubjectModal = () => {
        setCurrentSubject(null);
        setSubjectName("");
        setSubjectCode("");
        setMarks("100");
        setPassMarks("33");
        setAddSubjectModalOpen(true);
    };

    const handleOpenEditSubjectModal = (subject: Subject) => {
        setCurrentSubject(subject);
        setSubjectName(subject.name);
        setSubjectCode(subject.code || "");
        setMarks(subject.marks.toString());
        setPassMarks(subject.passMarks.toString());
        setAddSubjectModalOpen(true);
    };

    const handleCloseAddSubjectModal = () => {
        setAddSubjectModalOpen(false);
        setSubjectName("");
        setSubjectCode("");
        setMarks("100");
        setPassMarks("33");
        setCurrentSubject(null);
    };

    const handleCreateOrUpdateSubject = async () => {
        try {
            if (!subjectName.trim()) {
                toastShowing('Subject name cannot be empty', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            const numericMarks = marks === "" ? 0 : parseInt(marks);
            const numericPassMarks = passMarks === "" ? 0 : parseInt(passMarks);

            if (numericPassMarks > numericMarks) {
                toastShowing('Pass marks cannot be greater than total marks', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            const subjectData = {
                name: subjectName,
                code: subjectCode.trim() || undefined,
                marks: numericMarks,
                passMarks: numericPassMarks
            };
            const modifiedPayload = validateEmptyFields(subjectData)

            if (currentSubject) {
                await updateSubject({ id: currentSubject.id, ...modifiedPayload }).unwrap();
                toastShowing('Subject updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                await createSubject(modifiedPayload).unwrap();
                toastShowing('Subject created successfully', 'bottom-right', 2000, 'green', 'white');
            }
            refetch();
            handleCloseAddSubjectModal();
        } catch (err) {
            console.log(err)
            toastShowing(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentSubject ? "Failed to update subject" : "Failed to create subject"), 'bottom-right', 2000, 'red', 'white'
            );
        }
    };

    const handleDeleteSubject = async () => {
        await handleDeleteConfirmation(
            async (subjectId) => {
                await deleteSubject(subjectId).unwrap();
                refetch();
            },
            {
                successMessage: "Subject deleted successfully",
                errorMessage: "Failed to delete subject",
            }
        );
    };

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: Subject, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'name',
            header: 'Subject Name'
        },
        {
            key: 'code',
            header: 'Subject Code',
            render: (row: Subject) => row.code || '-'
        },
        {
            key: 'marks',
            header: 'Total Marks',
            render: (row: Subject) => row.marks
        },
        {
            key: 'passMarks',
            header: 'Pass Marks',
            render: (row: Subject) => row.passMarks
        },
        {
            key: 'createdAt',
            header: 'Created On',
            render: (row: Subject) => {
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
            render: (row: Subject) => (
                <div className="flex space-x-2 items-center">
                    <IconButton onClick={() => handleOpenEditSubjectModal(row)}>
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
            <PageHeader
                title="Subject Management"
                buttonText="Add Subject"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddSubjectModal}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search subjects..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            {/* Add/Edit Subject Modal */}
            <AnimatePresence>
                {addSubjectModalOpen && (
                    <Modal
                        open={addSubjectModalOpen}
                        onClose={handleCloseAddSubjectModal}
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
                            {/* Floating close button */}
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
                                    onClick={handleCloseAddSubjectModal}
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

                            {/* Header with decorative accent */}
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
                                    {currentSubject ? "Edit Subject" : "Add New Subject"}
                                </Typography>
                            </Box>

                            {/* Animated input fields */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <TextField
                                    fullWidth
                                    label={
                                        <span style={{ color: '#5F7161', fontWeight: 500 }}>
                                            Subject Name {theStar}
                                        </span>
                                    }
                                    variant="outlined"
                                    value={subjectName}
                                    onChange={(e) => setSubjectName(e.target.value)}
                                    sx={{
                                        mt: 2,
                                        mb: 2,
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
                                            },
                                        },
                                    }}
                                    autoFocus
                                    InputProps={{
                                        style: {
                                            fontSize: '1rem',
                                            padding: '5px 5px',
                                        }
                                    }}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                            >
                                <TextField
                                    fullWidth
                                    label={
                                        <span style={{ color: '#5F7161', fontWeight: 500 }}>
                                            Subject Code
                                        </span>
                                    }
                                    variant="outlined"
                                    value={subjectCode}
                                    onChange={(e) => setSubjectCode(e.target.value)}
                                    sx={{
                                        mb: 2,
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
                                            },
                                        },
                                    }}
                                    InputProps={{
                                        style: {
                                            fontSize: '1rem',
                                            padding: '5px 5px',
                                        }
                                    }}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <TextField
                                    fullWidth
                                    type="number"
                                    label={
                                        <span style={{ color: '#5F7161', fontWeight: 500 }}>
                                            Total Marks {theStar}
                                        </span>
                                    }
                                    variant="outlined"
                                    value={marks}
                                    onChange={(e) => setMarks(e.target.value)}
                                    sx={{
                                        mb: 2,
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
                                            },
                                        },
                                    }}
                                    InputProps={{
                                        style: {
                                            fontSize: '1rem',
                                            padding: '5px 5px',
                                        },
                                        inputProps: {
                                            min: 0
                                        }
                                    }}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                            >
                                <TextField
                                    fullWidth
                                    type="number"
                                    label={
                                        <span style={{ color: '#5F7161', fontWeight: 500 }}>
                                            Pass Marks {theStar}
                                        </span>
                                    }
                                    variant="outlined"
                                    value={passMarks}
                                    onChange={(e) => setPassMarks(e.target.value)}
                                    sx={{
                                        mb: 2,
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
                                            },
                                        },
                                    }}
                                    InputProps={{
                                        style: {
                                            fontSize: '1rem',
                                            padding: '5px 5px',
                                        },
                                        inputProps: {
                                            min: 0
                                        }
                                    }}
                                />
                            </motion.div>

                            {/* Action buttons */}
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
                                        onClick={handleCloseAddSubjectModal}
                                    >Cancel</CancelButton>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <SubmitButton onClick={handleCreateOrUpdateSubject}
                                    >Submit</SubmitButton>
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
                        Failed to load subjects
                    </Alert>
                ) : subjects.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No subjects found. {searchTerm ? "Try a different search term." : "Create your first subject."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<Subject>
                            columns={columns}
                            data={subjects}
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
                onConfirm={() => handleDeleteSubject()}
                title="Delete Subject"
                description="Are you sure you want to delete this subject? All associated data will be permanently removed."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default SubjectList;