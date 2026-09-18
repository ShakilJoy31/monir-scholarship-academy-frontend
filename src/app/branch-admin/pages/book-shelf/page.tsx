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
import { motion, AnimatePresence } from "framer-motion";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { useCreateShelfMutation, useDeleteShelfMutation, useGetAllShelvesQuery, useUpdateShelfMutation } from "@/app/store/api/classes/bookShelfApi";
import { theStar } from "@/lib/requiredJSX";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface Shelf {
    id: number;
    code: string;
    location: string | null;
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

const ShelfList = () => {
    const [addShelfModalOpen, setAddShelfModalOpen] = useState<boolean>(false);
    const [shelfCode, setShelfCode] = useState<string>("");
    const [shelfLocation, setShelfLocation] = useState<string>("");
    const [currentShelf, setCurrentShelf] = useState<Shelf | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllShelvesQuery({
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

    const [createShelf, { isLoading: isCreatingShelf }] = useCreateShelfMutation();
    const [updateShelf, { isLoading: isUpdatingShelf }] = useUpdateShelfMutation();
    const [deleteShelf] = useDeleteShelfMutation();

    const totalPages = responseData?.meta?.totalPage || 1;

    const shelves: Shelf[] = Array.isArray(responseData?.data)
        ? responseData.data
        : responseData?.data || [];

    const handleOpenAddShelfModal = () => {
        setCurrentShelf(null);
        setShelfCode("");
        setShelfLocation("");
        setAddShelfModalOpen(true);
    };

    const handleOpenEditShelfModal = (shelf: Shelf) => {
        setCurrentShelf(shelf);
        setShelfCode(shelf.code);
        setShelfLocation(shelf.location || "");
        setAddShelfModalOpen(true);
    };

    const handleCloseAddShelfModal = () => {
        setAddShelfModalOpen(false);
        setShelfCode("");
        setShelfLocation("");
        setCurrentShelf(null);
    };

    const handleCreateOrUpdateShelf = async () => {
        try {
            if (!shelfCode.trim()) {
                toastShowing('Shelf code cannot be empty', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            const shelfData = {
                code: shelfCode,
                location: shelfLocation.trim() || null
            };

            if (currentShelf) {
                // Update existing shelf
                await updateShelf({ id: currentShelf.id, ...shelfData }).unwrap();
                toastShowing('Shelf updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new shelf
                await createShelf(shelfData).unwrap();
                toastShowing('Shelf created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddShelfModal();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentShelf ? "Failed to update shelf" : "Failed to create shelf")
            );
            console.error("Error saving shelf:", err);
        }
    };

    const handleDeleteShelf = async () => {
        await handleDeleteConfirmation(
            async (shelfId) => {
                await deleteShelf(shelfId).unwrap();
                refetch();
            },
            {
                successMessage: "Shelf deleted successfully",
                errorMessage: "Failed to delete shelf",
            }
        );
    };

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: Shelf, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'code',
            header: 'Shelf Code'
        },
        {
            key: 'location',
            header: 'Location',
            render: (row: Shelf) => row.location || 'N/A'
        },
        {
            key: 'createdAt',
            header: 'Created On',
            render: (row: Shelf) => {
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
            render: (row: Shelf) => (
                <div className="flex space-x-2 items-center">
                    <IconButton onClick={() => handleOpenEditShelfModal(row)}>
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
                title="Shelf Management"
                buttonText="Add Shelf"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddShelfModal}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search shelves..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            {/* Add/Edit Shelf Modal */}
            <AnimatePresence>
                {addShelfModalOpen && (
                    <Modal
                        open={addShelfModalOpen}
                        onClose={handleCloseAddShelfModal}
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
                                    onClick={handleCloseAddShelfModal}
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
                                    {currentShelf ? "Edit Shelf" : "Add New Shelf"}
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
                                            Shelf Code {theStar}
                                        </span>
                                    }
                                    variant="outlined"
                                    value={shelfCode}
                                    onChange={(e) => setShelfCode(e.target.value)}
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

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                            >
                                <TextField
                                    fullWidth
                                    label={
                                        <span style={{ color: '#5F7161', fontWeight: 500 }}>
                                            Location (Optional)
                                        </span>
                                    }
                                    variant="outlined"
                                    value={shelfLocation}
                                    onChange={(e) => setShelfLocation(e.target.value)}
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
                                        onClick={handleCloseAddShelfModal}
                                        
                                    >
                                        Cancel
                                    </CancelButton>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <SubmitButton
                                        onClick={handleCreateOrUpdateShelf}
                                        disabled={(isCreatingShelf || isUpdatingShelf) || !shelfCode.trim()}
                                        sx={{
                                            backgroundColor: '#1A3C34',
                                            borderRadius: '6px',
                                            px: 3,
                                            py: 1,
                                            fontWeight: 500,
                                            boxShadow: '0 4px 16px rgba(26, 60, 52, 0.3)',
                                            '&:hover': {
                                                backgroundColor: '#0F2922',
                                                boxShadow: '0 6px 20px rgba(26, 60, 52, 0.4)',
                                            },
                                            '&:disabled': {
                                                backgroundColor: 'rgba(26, 60, 52, 0.5)',
                                            }
                                        }}
                                    >
                                        {(isCreatingShelf || isUpdatingShelf) ? (
                                            <span>{currentShelf ? "Updating..." : "Submitting..."}</span>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{currentShelf ? "Update" : "Submit"}</span>
                                            
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
                        Failed to load shelves
                    </Alert>
                ) : shelves.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No shelves found. {searchTerm ? "Try a different search term." : "Create your first shelf."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<Shelf>
                            columns={columns}
                            data={shelves}
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
                onConfirm={() => handleDeleteShelf()}
                title="Delete Shelf"
                description="Are you sure you want to delete this shelf? All associated data will be permanently removed."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default ShelfList;