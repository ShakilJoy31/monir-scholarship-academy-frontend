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
import { toast } from "react-toastify";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { useCreateClassMutation, useDeleteClassMutation, useGetAllClassQuery, useUpdateClassMutation } from "@/app/store/api/classes/classApi";
import { motion, AnimatePresence } from "framer-motion";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";

interface Class {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    branchId: number;
    [key: string]: unknown;
}

const ClassList = () => {
    const [addClassModalOpen, setAddClassModalOpen] = useState<boolean>(false);
    const [className, setClassName] = useState<string>("");
    const [currentClass, setCurrentClass] = useState<Class | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllClassQuery({
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

    const [createClass, ] = useCreateClassMutation();
    const [updateClass, ] = useUpdateClassMutation();
    const [deleteClass] = useDeleteClassMutation();

    const totalPages = responseData?.meta?.totalPage || 1;

    const classes: Class[] = Array.isArray(responseData?.data)
        ? responseData.data
        : responseData?.data || [];

    const handleOpenAddClassModal = () => {
        setCurrentClass(null);
        setClassName("");
        setAddClassModalOpen(true);
    };

    const handleOpenEditClassModal = (classItem: Class) => {
        setCurrentClass(classItem);
        setClassName(classItem.name);
        setAddClassModalOpen(true);
    };

    const handleCloseAddClassModal = () => {
        setAddClassModalOpen(false);
        setClassName("");
        setCurrentClass(null);
    };

    const handleCreateOrUpdateClass = async () => {
        try {
            if (!className.trim()) {
                toastShowing('Class name cannot be empty', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            if (currentClass) {
                // Update existing class
                await updateClass({ id: currentClass.id, name: className }).unwrap();
                toastShowing('Class updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new class
                await createClass({ name: className }).unwrap();
                toastShowing('Class created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddClassModal();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentClass ? "Failed to update class" : "Failed to create class")
            );
            console.error("Error saving class:", err);
        }
    };

    const handleDeleteClass = async () => {
        await handleDeleteConfirmation(
            async (classId) => {
                await deleteClass(classId).unwrap();
                // toastShowing("Class deleted successfully", 'bottom-right', 2000, 'green', 'white');
                refetch();
            },
            {
                successMessage: "Class deleted successfully",
                errorMessage: "Failed to delete class",
            }
        );
    };

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: Class, index?: number) => (index !== undefined ? index + 1 : null),
    },
        {
            key: 'name',
            header: 'Class Name'
        },
        {
            key: 'createdAt',
            header: 'Created On',
            render: (row: Class) => {
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
            render: (row: Class) => (
                <div className="flex space-x-2 items-center">
                    <IconButton onClick={() => handleOpenEditClassModal(row)}>
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
                title="Class Management"
                buttonText="Add Class"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddClassModal}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search classes..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            {/* Add/Edit Class Modal */}
            <AnimatePresence>
                {addClassModalOpen && (
                    <Modal
                        open={addClassModalOpen}
                        onClose={handleCloseAddClassModal}
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
                                    onClick={handleCloseAddClassModal}
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
                                    {currentClass ? "Edit Class" : "Add New Class"}
                                </Typography>
                            </Box>

                            {/* Animated input field */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <TextField
                                    fullWidth
                                    label={
                                        <span style={{ color: '#5F7161', fontWeight: 500 }}>
                                            Class Name {theStar}
                                        </span>
                                    }
                                    variant="outlined"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    sx={{
                                        mt: 2,
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
                                            fontSize: '1rem',
                                            padding: '5px 5px',
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
                                        onClick={handleCloseAddClassModal}
                                    >Cancel</CancelButton>
                                   
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                     <SubmitButton onClick={handleCreateOrUpdateClass}
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
                        Failed to load classes
                    </Alert>
                ) : classes.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No classes found. {searchTerm ? "Try a different search term." : "Create your first class."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<Class>
                            columns={columns}
                            data={classes}
                        />
                        <PaginationComponent
                            currentPage={page + 1}
                            totalPages={totalPages}
                            onPageChange={(newPage) => setPage(newPage - 1)} // Convert back to 0-based index
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={setRowsPerPage}
                        />
                    </>
                )}
            </Paper>

            <DeleteConfirmationModal
                open={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={() => handleDeleteClass()}
                title="Delete Class"
                description="Are you sure you want to delete this class? All associated data will be permanently removed."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default ClassList;