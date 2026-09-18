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
import { motion, AnimatePresence } from "framer-motion";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { useCreateSectionMutation, useDeleteSectionMutation, useGetAllSectionsQuery, useUpdateSectionMutation } from "@/app/store/api/classes/sectionApi";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";


interface Section {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

const SectionList = () => {
    const [addSectionModalOpen, setAddSectionModalOpen] = useState<boolean>(false);
    const [sectionName, setSectionName] = useState<string>("");
    const [currentSection, setCurrentSection] = useState<Section | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllSectionsQuery({
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

    const [createSection, ] = useCreateSectionMutation();
    const [updateSection, ] = useUpdateSectionMutation();
    const [deleteSection] = useDeleteSectionMutation();

    const sections: Section[] = Array.isArray(responseData?.data)
        ? responseData.data
        : responseData?.data || [];

    const handleOpenAddSectionModal = () => {
        setCurrentSection(null);
        setSectionName("");
        setAddSectionModalOpen(true);
    };

    const handleOpenEditSectionModal = (section: Section) => {
        setCurrentSection(section);
        setSectionName(section.name);
        setAddSectionModalOpen(true);
    };

    const totalPages = responseData?.meta?.totalPage || 1;

    const handleCloseAddSectionModal = () => {
        setAddSectionModalOpen(false);
        setSectionName("");
        setCurrentSection(null);
    };

    const handleCreateOrUpdateSection = async () => {
        try {
            if (!sectionName.trim()) {
                toastShowing('Section name cannot be empty', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            if (currentSection) {
                // Update existing section
                await updateSection({ id: currentSection.id, name: sectionName }).unwrap();
                toastShowing('Section updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new section
                await createSection({ name: sectionName }).unwrap();
                toastShowing('Section created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddSectionModal();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentSection ? "Failed to update section" : "Failed to create section")
            );
            console.error("Error saving section:", err);
        }
    };

    const handleDeleteSection = async () => {
        await handleDeleteConfirmation(
            async (sectionId) => {
                await deleteSection(sectionId).unwrap();
                refetch();
            },
            {
                successMessage: "Section deleted successfully",
                errorMessage: "Failed to delete section",
            }
        );
    };

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: Section, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'name',
            header: 'Section Name'
        },
        {
            key: 'createdAt',
            header: 'Created On',
            render: (row: Section) => {
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
            render: (row: Section) => (
                <div className="flex space-x-2 items-center">
                    <IconButton onClick={() => handleOpenEditSectionModal(row)}>
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
                title="Section Management"
                buttonText="Add Section"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddSectionModal}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search sections..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            {/* Add/Edit Section Modal */}
            <AnimatePresence>
                {addSectionModalOpen && (
                    <Modal
                        open={addSectionModalOpen}
                        onClose={handleCloseAddSectionModal}
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
                                    onClick={handleCloseAddSectionModal}
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
                                    {currentSection ? "Edit Section" : "Add New Section"}
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
                                            Section Name {theStar}
                                        </span>
                                    }
                                    variant="outlined"
                                    value={sectionName}
                                    onChange={(e) => setSectionName(e.target.value)}
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
                                        onClick={handleCloseAddSectionModal}
                                    >Cancel</CancelButton>





                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <SubmitButton onClick={handleCreateOrUpdateSection}
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
                        Failed to load sections
                    </Alert>
                ) : sections.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No sections found. {searchTerm ? "Try a different search term." : "Create your first section."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<Section>
                            columns={columns}
                            data={sections}
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
                onConfirm={() => handleDeleteSection()}
                title="Delete Section"
                description="Are you sure you want to delete this section? All associated data will be permanently removed."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default SectionList;