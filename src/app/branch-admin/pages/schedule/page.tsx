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
    TextField,
    InputAdornment,
    Modal,
} from "@mui/material";
import { Plus, Edit, Trash2, X, CalendarClock } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import { useCreateScheduleMutation, useDeleteScheduleMutation, useGetAllSchedulesQuery, useUpdateScheduleMutation } from "@/app/store/api/classes/scheduleApi";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";

interface Schedule {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

const ScheduleList = () => {
    const [addScheduleModalOpen, setAddScheduleModalOpen] = useState<boolean>(false);
    const [scheduleName, setScheduleName] = useState<string>("");
    const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllSchedulesQuery({
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

    const [createSchedule, { isLoading: isCreatingSchedule }] = useCreateScheduleMutation();
    const [updateSchedule, { isLoading: isUpdatingSchedule }] = useUpdateScheduleMutation();
    const [deleteSchedule] = useDeleteScheduleMutation();

    const schedules: Schedule[] = Array.isArray(responseData?.data)
        ? responseData.data
        : responseData?.data || [];

    const handleOpenAddScheduleModal = () => {
        setCurrentSchedule(null);
        setScheduleName("");
        setAddScheduleModalOpen(true);
    };

    const handleOpenEditScheduleModal = (schedule: Schedule) => {
        setCurrentSchedule(schedule);
        setScheduleName(schedule.name);
        setAddScheduleModalOpen(true);
    };

    const handleCloseAddScheduleModal = () => {
        setAddScheduleModalOpen(false);
        setScheduleName("");
        setCurrentSchedule(null);
    };

    const handleCreateOrUpdateSchedule = async () => {
        try {
            if (!scheduleName.trim()) {
                toastShowing('Schedule name cannot be empty', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            if (currentSchedule) {
                // Update existing schedule
                await updateSchedule({ id: currentSchedule.id, name: scheduleName }).unwrap();
                toastShowing('Schedule updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new schedule
                await createSchedule({ name: scheduleName }).unwrap();
                toastShowing('Schedule created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddScheduleModal();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentSchedule ? "Failed to update schedule" : "Failed to create schedule")
            );
            console.error("Error saving schedule:", err);
        }
    };

    const handleDeleteSchedule = async () => {
        await handleDeleteConfirmation(
            async (scheduleId) => {
                await deleteSchedule(scheduleId).unwrap();
                refetch();
            },
            {
                successMessage: "Schedule deleted successfully",
                errorMessage: "Failed to delete schedule",
            }
        );
    };

    const totalPages = responseData?.meta?.totalPage || 1;

    const columns = [
        {
            key: 'name',
            header: 'Schedule Name'
        },
        {
            key: 'createdAt',
            header: 'Created On',
            render: (row: Schedule) => {
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
            render: (row: Schedule) => (
                <div className="flex space-x-2 items-center">
                    <IconButton onClick={() => handleOpenEditScheduleModal(row)}>
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
                title="Schedule Management"
                buttonText="Add Schedule"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddScheduleModal}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search schedules..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            {/* Add/Edit Schedule Modal */}
            <AnimatePresence>
                {addScheduleModalOpen && (
                    <Modal
                        open={addScheduleModalOpen}
                        onClose={handleCloseAddScheduleModal}
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
                                    onClick={handleCloseAddScheduleModal}
                                    sx={{
                                        backgroundColor: '#1A3C34',
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
                                    {currentSchedule ? "Edit Schedule" : "Create New Schedule"}
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
                                            Schedule Name
                                        </span>
                                    }
                                    variant="outlined"
                                    value={scheduleName}
                                    onChange={(e) => setScheduleName(e.target.value)}
                                    sx={{
                                        mt: 2,
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
                                    autoFocus
                                    InputProps={{
                                        style: {
                                            fontSize: '1rem',
                                            padding: '5px 5px',
                                        },
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CalendarClock size={20} color="#5F7161" />
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
                                    <Button
                                        variant="outlined"
                                        onClick={handleCloseAddScheduleModal}
                                        sx={{
                                            color: '#1A3C34',
                                            borderColor: 'rgba(26,60,52,0.3)',
                                            borderRadius: '6px',
                                            px: 3,
                                            py: 1,
                                            fontWeight: 500,
                                            '&:hover': {
                                                borderColor: '#1A3C34',
                                                backgroundColor: 'rgba(26, 60, 52, 0.04)',
                                            },
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="contained"
                                        onClick={handleCreateOrUpdateSchedule}
                                        disabled={(isCreatingSchedule || isUpdatingSchedule) || !scheduleName.trim()}
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
                                        {(isCreatingSchedule || isUpdatingSchedule) ? (
                                            <span>{currentSchedule ? "Updating..." : "Creating..."}</span>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{currentSchedule ? "Update Schedule" : "Create Schedule"}</span>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </Box>
                                        )}
                                    </Button>
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
                        Failed to load schedules
                    </Alert>
                ) : schedules.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No schedules found. {searchTerm ? "Try a different search term." : "Create your first schedule."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<Schedule>
                            columns={columns}
                            data={schedules}
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
                onConfirm={() => handleDeleteSchedule()}
                title="Delete Schedule"
                description="Are you sure you want to delete this schedule? All associated data will be permanently removed."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default ScheduleList;