"use client";
import React, { useEffect, useState } from "react";
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
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import {
    useCreateMonthlyFeesMutation,
    useDeleteMonthlyFeesMutation,
    useGetAllMonthlyFeesQuery,
    useUpdateMonthlyFeesMutation
} from "@/app/store/api/classes/monthlyFeesApi";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";

interface MonthlyFee {
    id: number;
    branchId: number;
    sessionYearId: number;
    classNameId: number;
    amount: number;
    createdAt: string;
    updatedAt: string;
    className?: string;
    sessionYear?: string;
    [key: string]: unknown;
}

interface Class {
    id: number;
    name: string;
    [key: string]: unknown;
}

// interface Session {
//     id: number;
//     name: string;
//     [key: string]: unknown;
// }

interface DropdownOption {
  id: number;
  name: string;
  avatar?: string;
}

const MonthlyExamFee = () => {
    const [addFeeModalOpen, setAddFeeModalOpen] = useState<boolean>(false);
    const [selectedClass, setSelectedClass] = useState<{id: number, name: string} | null>(null);
    const [amount, setAmount] = useState<string>("");
    const [currentFee, setCurrentFee] = useState<MonthlyFee | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    const [sessionYear, setSessionYear] = useState<{id: number, name: string} | null>(null);
    const [loadingDropdowns, setLoadingDropdowns] = useState(false);
    const [sessions, setSessions] = useState<DropdownOption[]>([]);

    const { data: sessionsData } = useGetAllSessionsQuery({ page: 1, size: 100000 });
    useEffect(() => {
        setLoadingDropdowns(true);
        try {
            if (sessionsData?.data) {
                setSessions(sessionsData.data);
            }
        } catch (error) {
            console.error("Error setting dropdown data:", error);
        } finally {
            setLoadingDropdowns(false);
        }
    }, [sessionsData]);

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllMonthlyFeesQuery({
        page: page + 1,
        size: rowsPerPage,
        search: searchTerm,
    });

    const [createMonthlyFee, { isLoading: isCreatingFee }] = useCreateMonthlyFeesMutation();
    const { data: classesData, isLoading: isClassesLoading } = useGetAllClassQuery({});
    const [updateMonthlyFee, { isLoading: isUpdatingFee }] = useUpdateMonthlyFeesMutation();
    const [deleteMonthlyFee] = useDeleteMonthlyFeesMutation();

    const {
        isDeleteModalOpen,
        itemToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    // Process fees data to include class and session names
    const fees: MonthlyFee[] = Array.isArray(responseData?.data)
        ? responseData.data.map((fee: { classNameId: number; sessionYearId: number; }) => {
            const classItem = classesData?.data?.find((c: Class) => c.id === fee.classNameId);
            const sessionItem = sessions.find(s => s.id === fee.sessionYearId);
            
            return {
                ...fee,
                className: classItem?.name || `Class ID: ${fee.classNameId}`,
                sessionYear: sessionItem?.name || `Session ID: ${fee.sessionYearId}`
            };
        })
        : [];

    const classes: Class[] = Array.isArray(classesData?.data)
        ? classesData.data
        : classesData?.data || [];

    const handleOpenAddFeeModal = () => {
        setCurrentFee(null);
        setSelectedClass(null);
        setAmount("");
        setSessionYear(null);
        setAddFeeModalOpen(true);
    };

    const handleOpenEditFeeModal = (fee: MonthlyFee) => {
        setCurrentFee(fee);
        // Find the class and session from the fee data
        const classItem = classes.find(c => c.id === fee.classNameId);
        setSelectedClass(classItem ? {id: classItem.id, name: classItem.name} : null);
        
        // Find the session from the fee data
        const sessionItem = sessions.find(s => s.id === fee.sessionYearId);
        setSessionYear(sessionItem ? {id: sessionItem.id, name: sessionItem.name} : null);
        
        setAmount(fee.amount.toString());
        setAddFeeModalOpen(true);
    };

    const handleCloseAddFeeModal = () => {
        setAddFeeModalOpen(false);
        setSelectedClass(null);
        setAmount("");
        setSessionYear(null);
        setCurrentFee(null);
    };

    const handleCreateOrUpdateFee = async () => {
        try {
            if (!selectedClass) {
                toastShowing('Please select a class', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            if (!sessionYear) {
                toastShowing('Please select a session year', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            if (!amount || isNaN(Number(amount))) {
                toastShowing('Please enter a valid amount', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            const feeData = {
                classNameId: selectedClass.id,
                sessionYearId: sessionYear.id,
                amount: Number(amount)
            };

            if (currentFee) {
                // Update existing fee
                await updateMonthlyFee({ id: currentFee.id, ...feeData }).unwrap();
                toastShowing('Fee updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new fee
                await createMonthlyFee(feeData).unwrap();
                toastShowing('Fee created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddFeeModal();
        } catch (err) {
            toastShowing(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentFee ? "Failed to update fee" : "Failed to create fee"),
                'bottom-right',
                2000,
                'red',
                'white'
            );
            console.error("Error saving fee:", err);
        }
    };

    const handleDeleteStream = async () => {
        await handleDeleteConfirmation(
            async (streamId) => {
                await deleteMonthlyFee(streamId).unwrap();
                refetch();
            },
            {
                successMessage: "Stream deleted successfully",
                errorMessage: "Failed to delete stream",
            }
        );
    };

    const totalPages = responseData?.meta?.totalPage || 1;
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers and decimal point
        if (/^\d*\.?\d*$/.test(value) || value === "") {
            setAmount(value);
        }
    };

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: MonthlyFee, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'className',
            header: 'Class Name'
        },
        {
            key: 'sessionYear',
            header: 'Session Year'
        },
        {
            key: 'amount',
            header: 'Amount',
            render: (row: MonthlyFee) => `৳${row.amount.toFixed(2)}`
        },
        {
            key: 'createdAt',
            header: 'Created On',
            render: (row: MonthlyFee) => {
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
            render: (row: MonthlyFee) => (
                <div className="flex space-x-2 items-center">
                    <IconButton onClick={() => handleOpenEditFeeModal(row)}>
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
                title="Monthly Fees Management"
                buttonText="Add Monthly Fee"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddFeeModal}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search fees..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            {/* Add/Edit Fee Modal */}
            <AnimatePresence>
                {addFeeModalOpen && (
                    <Modal
                        open={addFeeModalOpen}
                        onClose={handleCloseAddFeeModal}
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
                                    onClick={handleCloseAddFeeModal}
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
                                    {currentFee ? "Edit Monthly Fee" : "Create New Monthly Fee"}
                                </Typography>
                            </Box>

                            {/* Animated input fields */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <motion.div
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
                                            Class
                                        </InputLabel>
                                        <Select
                                            value={selectedClass?.id || ''}
                                            onChange={(e) => {
                                                const classId = e.target.value as number;
                                                const classItem = classes.find(c => c.id === classId);
                                                setSelectedClass(classItem ? {id: classItem.id, name: classItem.name} : null);
                                            }}
                                            label="Class"
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
                                            disabled={isClassesLoading}
                                        >
                                            {isClassesLoading ? (
                                                <MenuItem disabled>Loading classes...</MenuItem>
                                            ) : (
                                                classes.map((classItem) => (
                                                    <MenuItem
                                                        key={classItem.id}
                                                        value={classItem.id}
                                                    >
                                                        {classItem.name}
                                                    </MenuItem>
                                                ))
                                            )}
                                        </Select>
                                    </FormControl>
                                </motion.div>

                                <motion.div className=""
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
                                            Session Year
                                        </InputLabel>
                                        <Select
                                            value={sessionYear?.id || ''}
                                            onChange={(e) => {
                                                const sessionId = e.target.value as number;
                                                const sessionItem = sessions.find(s => s.id === sessionId);
                                                setSessionYear(sessionItem ? {id: sessionItem.id, name: sessionItem.name} : null);
                                            }}
                                            label="Session Year"
                                            disabled={loadingDropdowns}
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
                                            {sessions.map((session) => (
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
                                    transition={{ delay: 0.15 }}
                                >
                                    <TextField
                                        fullWidth
                                        label={
                                            <span style={{ color: '#5F7161', fontWeight: 500 }}>
                                                Amount (৳)
                                            </span>
                                        }
                                        variant="outlined"
                                        value={amount}
                                        onChange={handleAmountChange}
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
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">৳</InputAdornment>
                                            ),
                                            style: {
                                                fontSize: '1rem',
                                                padding: '5px 5px',
                                            }
                                        }}
                                    />
                                </motion.div>
                            </Box>

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
                                        onClick={handleCloseAddFeeModal}
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
                                        onClick={handleCreateOrUpdateFee}
                                        disabled={(isCreatingFee || isUpdatingFee) || !selectedClass || !sessionYear || !amount}
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
                                        {(isCreatingFee || isUpdatingFee) ? (
                                            <span>{currentFee ? "Updating..." : "Creating..."}</span>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{currentFee ? "Update Fee" : "Create Fee"}</span>
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
                        Failed to load fees
                    </Alert>
                ) : fees.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No fees found. {searchTerm ? "Try a different search term." : "Create your first fee."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<MonthlyFee>
                            columns={columns}
                            data={fees}
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
                onConfirm={() => handleDeleteStream()}
                title="Delete Fees"
                description="Are you sure you want to delete this fee? All associated data will be permanently removed."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default MonthlyExamFee;