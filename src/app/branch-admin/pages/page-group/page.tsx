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
    InputAdornment,
    Modal,
} from "@mui/material";
import { Plus, Edit, Trash2, X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import { useCreatePageGroupMutation, useDeletePageGroupMutation, useGetAllPageGroupsQuery, useUpdatePageGroupMutation } from "@/app/store/api/classes/pageGroupApi";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";

interface PageGroup {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

const PageGroupList = () => {
    const [addPageGroupModalOpen, setAddPageGroupModalOpen] = useState<boolean>(false);
    const [pageGroupTitle, setPageGroupTitle] = useState<string>("");
    const [currentPageGroup, setCurrentPageGroup] = useState<PageGroup | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllPageGroupsQuery({
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

    const [createPageGroup] = useCreatePageGroupMutation();
    const [updatePageGroup] = useUpdatePageGroupMutation();
    const [deletePageGroup] = useDeletePageGroupMutation();

    const pageGroups: PageGroup[] = Array.isArray(responseData?.data)
        ? responseData.data
        : responseData?.data || [];

    const handleOpenAddPageGroupModal = () => {
        setCurrentPageGroup(null);
        setPageGroupTitle("");
        setAddPageGroupModalOpen(true);
    };

    const handleOpenEditPageGroupModal = (pageGroup: PageGroup) => {
        setCurrentPageGroup(pageGroup);
        setPageGroupTitle(pageGroup.title);
        setAddPageGroupModalOpen(true);
    };

    const handleCloseAddPageGroupModal = () => {
        setAddPageGroupModalOpen(false);
        setPageGroupTitle("");
        setCurrentPageGroup(null);
    };

    const handleCreateOrUpdatePageGroup = async () => {
        try {
            if (!pageGroupTitle.trim()) {
                toastShowing('Page group title cannot be empty', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            if (currentPageGroup) {
                // Update existing page group
                await updatePageGroup({ id: currentPageGroup.id, title: pageGroupTitle }).unwrap();
                toastShowing('Page group updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new page group
                await createPageGroup({ title: pageGroupTitle }).unwrap();
                toastShowing('Page group created successfully', 'bottom-right', 2000, 'green', 'white');
            }
            
            refetch();
            handleCloseAddPageGroupModal();
        } catch (err) {
            toastShowing((err as { data?: { message?: string } })?.data?.message ||
                (currentPageGroup ? "Failed to update page group" : "Failed to create page group"), 'bottom-right', 2000, 'red', 'white');
        }
    };

    const handleDeletePageGroup = async () => {
        await handleDeleteConfirmation(
            async (pageGroupId) => {
                await deletePageGroup(pageGroupId).unwrap();
                refetch();
            },
            {
                successMessage: "Page group deleted successfully",
                errorMessage: "Failed to delete page group",
            }
        );
    };

    const totalPages = responseData?.meta?.totalPage || 1;

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: PageGroup, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'title',
            header: 'Page Group Title'
        },
        {
            key: 'createdAt',
            header: 'Created On',
            render: (row: PageGroup) => {
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
            render: (row: PageGroup) => (
                <div className="flex space-x-2 items-center">
                    <IconButton onClick={() => handleOpenEditPageGroupModal(row)}>
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
                title="Page Group Management"
                buttonText="Add Page Group"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddPageGroupModal}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search page groups..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            {/* Add/Edit Page Group Modal */}
            <AnimatePresence>
                {addPageGroupModalOpen && (
                    <Modal
                        open={addPageGroupModalOpen}
                        onClose={handleCloseAddPageGroupModal}
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
                                    onClick={handleCloseAddPageGroupModal}
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
                                    {currentPageGroup ? "Edit Page Group" : "Add Page Group"}
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
                                            Page Group Title {theStar}
                                        </span>
                                    }
                                    variant="outlined"
                                    value={pageGroupTitle}
                                    onChange={(e) => setPageGroupTitle(e.target.value)}
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
                                        },
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FileText size={20} color="#5F7161" />
                                            </InputAdornment>
                                        )
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
                                        onClick={handleCloseAddPageGroupModal}
                                    >Cancel</CancelButton>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                     <SubmitButton onClick={handleCreateOrUpdatePageGroup}
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
                        Failed to load page groups
                    </Alert>
                ) : pageGroups.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No page groups found. {searchTerm ? "Try a different search term." : "Create your first page group."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<PageGroup>
                            columns={columns}
                            data={pageGroups}
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
                onConfirm={() => handleDeletePageGroup()}
                title="Delete Page Group"
                description="Are you sure you want to delete this page group? All associated data will be permanently removed."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default PageGroupList;