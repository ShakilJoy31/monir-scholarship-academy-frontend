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
} from "@mui/material";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";

import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useCreateSlotMutation, useDeleteSlotMutation, useGetAllSlotsQuery, useUpdateSlotMutation } from "@/app/store/api/classes/slotApi";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";

interface Slot {
    id: number;
    startTime: string;
    endTime: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

const SlotList = () => {
    const [addSlotModalOpen, setAddSlotModalOpen] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [currentSlot, setCurrentSlot] = useState<Slot | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllSlotsQuery({
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

    const [createSlot, { isLoading: isCreatingSlot }] = useCreateSlotMutation();
    const [updateSlot, { isLoading: isUpdatingSlot }] = useUpdateSlotMutation();
    const [deleteSlot] = useDeleteSlotMutation();

    const slots: Slot[] = Array.isArray(responseData?.data)
        ? responseData.data
        : responseData?.data || [];

    const handleOpenAddSlotModal = () => {
        setCurrentSlot(null);
        setStartTime(null);
        setEndTime(null);
        setAddSlotModalOpen(true);
    };

    const handleOpenEditSlotModal = (slot: Slot) => {
        setCurrentSlot(slot);
        setStartTime(new Date(`1970-01-01T${slot.startTime}`));
        setEndTime(new Date(`1970-01-01T${slot.endTime}`));
        setAddSlotModalOpen(true);
    };

    const handleCloseAddSlotModal = () => {
        setAddSlotModalOpen(false);
        setStartTime(null);
        setEndTime(null);
        setCurrentSlot(null);
    };

const formatTimeForApi = (date: Date | null): string => {
    if (!date) return "";
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    // Convert to 12-hour format
    const twelveHour = hours % 12 || 12;
    return `${twelveHour.toString().padStart(2, '0')}:${minutes}:${period}`;
};

const handleCreateOrUpdateSlot = async () => {
    try {
        if (!startTime || !endTime) {
            toastShowing('Both start and end time are required', 'bottom-right', 2000, 'red', 'white');
            return;
        }

        const formattedStartTime = formatTimeForApi(startTime);
        const formattedEndTime = formatTimeForApi(endTime);

        // Extract just the time part for comparison (HH:MM)
        const startTimePart = formattedStartTime.split(':').slice(0, 2).join(':');
        const endTimePart = formattedEndTime.split(':').slice(0, 2).join(':');

        if (startTimePart >= endTimePart && formattedStartTime.endsWith(formattedEndTime.split(':')[2])) {
            toastShowing('End time must be after start time', 'bottom-right', 2000, 'red', 'white');
            return;
        }

        if (currentSlot) {
            // Update existing slot
            await updateSlot({
                id: currentSlot.id,
                startTime: formattedStartTime,
                endTime: formattedEndTime
            }).unwrap();
            toastShowing('Slot updated successfully', 'bottom-right', 2000, 'green', 'white');
        } else {
            // Create new slot
            await createSlot({
                startTime: formattedStartTime,
                endTime: formattedEndTime
            }).unwrap();
            toastShowing('Slot created successfully', 'bottom-right', 2000, 'green', 'white');
        }

        refetch();
        handleCloseAddSlotModal();
    } catch (err) {
        toast.error(
            (err as { data?: { message?: string } })?.data?.message ||
            (currentSlot ? "Failed to update slot" : "Failed to create slot")
        );
        console.error("Error saving slot:", err);
    }
};

    const handleDeleteSlot = async () => {
        await handleDeleteConfirmation(
            async (slotId) => {
                await deleteSlot(slotId).unwrap();
                refetch();
            },
            {
                successMessage: "Slot deleted successfully",
                errorMessage: "Failed to delete slot",
            }
        );
    };

    const totalPages = responseData?.meta?.totalPage || 1;

const formatTime = (timeString: string) => {
    if (!timeString) return "N/A";
    
    if (timeString.includes('AM') || timeString.includes('PM')) {
        // New format - just reformat slightly for display
        return timeString.replace(/:/g, ':').replace(/(AM|PM)$/, ' $1');
    } else {
        // Old format - convert to AM/PM
        const time = new Date(`1970-01-01T${timeString}`);
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
};

const calculateDuration = (startTime: string, endTime: string) => {
    // Helper function to convert both formats to Date objects
    const parseTime = (timeStr: string) => {
        if (!timeStr) return new Date(); // fallback if timeStr is undefined
        
        if (timeStr.includes('AM') || timeStr.includes('PM')) {
            // New format: "09:30:AM" -> convert to "09:30:00"
            const parts = timeStr.split(':');
            if (parts.length !== 3) return new Date(); // invalid format
            
            let hours = parseInt(parts[0]);
            const minutes = parseInt(parts[1]);
            const period = parts[2];
            
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            
            return new Date(`1970-01-01T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
        } else {
            // Old format "HH:MM:SS"
            return new Date(`1970-01-01T${timeStr}`);
        }
    };

    try {
        const start = parseTime(startTime);
        const end = parseTime(endTime);
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return `${diff.toFixed(1)} hours`;
    } catch (error) {
        console.error("Error calculating duration:", error);
        return "N/A";
    }
};

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: Slot, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
        key: 'startTime',
        header: 'Start Time',
        render: (row: Slot) => formatTime(row.startTime)
    },
    {
        key: 'endTime',
        header: 'End Time',
        render: (row: Slot) => formatTime(row.endTime)
    },
    {
        key: 'duration',
        header: 'Duration',
        render: (row: Slot) => calculateDuration(row.startTime, row.endTime)
    },
        {
            key: 'createdAt',
            header: 'Created On',
            render: (row: Slot) => {
                const date = new Date(row.createdAt);
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: Slot) => (
                <div className="flex space-x-2 items-center">
                    <IconButton onClick={() => handleOpenEditSlotModal(row)}>
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
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box>
                <PageHeader
                    title="Slot Management"
                    buttonText="Add Slot"
                    buttonIcon={<Plus size={20} />}
                    onButtonClick={handleOpenAddSlotModal}
                />

                <Box sx={{ mb: 2 }}>
                    <SearchingInputField
                        placeholder="Search slots..."
                        onSearch={(term) => {
                            setSearchTerm(term);
                            setPage(0);
                        }}
                        debounceTime={300}
                        maxWidth={400}
                        height="36px"
                    />
                </Box>

                {/* Add/Edit Slot Modal */}
                <AnimatePresence>
                    {addSlotModalOpen && (
                        <Modal
                            open={addSlotModalOpen}
                            onClose={handleCloseAddSlotModal}
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
                                        onClick={handleCloseAddSlotModal}
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
                                        {currentSlot ? "Edit Slot" : "Add New Slot"}
                                    </Typography>
                                </Box>

                                {/* Time pickers */}
                                <Box sx={{ display: 'grid', gap: 2, mb: 2 }}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        style={{ flex: 1 }}
                                    >
                                        <TimePicker
                                            label={
                                                <>
                                                    Start Time
                                                    {theStar}
                                                </>
                                            }

                                            value={startTime}
                                            onChange={(newValue) => setStartTime(newValue as Date | null)}

                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    sx: {
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
                                                    }
                                                }
                                            }}
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        style={{ flex: 1 }}
                                    >
                                        <TimePicker
                                            label={
                                                <>
                                                    End Time
                                                    {theStar}
                                                </>
                                            }

                                            value={endTime}
                                            onChange={(newValue) => setEndTime(newValue as Date | null)}

                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    sx: {
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
                                                    }
                                                }
                                            }}
                                        />
                                    </motion.div>
                                </Box>

                                {/* Duration preview */}
                                {/* {startTime && endTime && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{ marginBottom: '16px' }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            color: '#1A3C34',
                                            fontWeight: 500
                                        }}>
                                            <Clock size={16} />
                                            <span>
                                                Duration: {(
                                                    (endTime.getTime() - startTime.getTime()) /
                                                    (1000 * 60 * 60)
                                                ).toFixed(1)} hours
                                            </span>
                                        </Box>
                                    </motion.div>
                                )} */}

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
                                            onClick={handleCloseAddSlotModal}

                                        >
                                            Cancel
                                        </CancelButton>
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <SubmitButton
                                            onClick={handleCreateOrUpdateSlot}
                                            disabled={(isCreatingSlot || isUpdatingSlot) || !startTime || !endTime}
                                        >
                                            {(isCreatingSlot || isUpdatingSlot) ? (
                                                <span>{currentSlot ? "Updating..." : "Submitting..."}</span>
                                            ) : (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <span>{currentSlot ? "Update" : "Submit"}</span>
                                                   
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
                            Failed to load slots
                        </Alert>
                    ) : slots.length === 0 ? (
                        <Typography
                            variant="body1"
                            color="textSecondary"
                            sx={{ mt: 4, textAlign: "center" }}
                        >
                            No slots found. {searchTerm ? "Try a different search term." : "Create your first slot."}
                        </Typography>
                    ) : (
                        <>
                            <ReusableTable<Slot>
                                columns={columns}
                                data={slots}
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
                    onConfirm={() => handleDeleteSlot()}
                    title="Delete Slot"
                    description="Are you sure you want to delete this slot? All associated data will be permanently removed."
                    isLoading={isDeleting}
                />
            </Box>
        </LocalizationProvider>
    );
};

export default SlotList;