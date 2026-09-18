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
import { Plus, Edit, Trash2, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import { useCreateSessionMutation, useDeleteSessionMutation, useGetAllSessionsQuery, useUpdateSessionMutation } from "@/app/store/api/classes/sessionApi";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";

interface Session {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

const SessionList = () => {
    const [addSessionModalOpen, setAddSessionModalOpen] = useState<boolean>(false);
    const [sessionName, setSessionName] = useState<string>("");
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllSessionsQuery({
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

    const [createSession, ] = useCreateSessionMutation();
    const [updateSession, ] = useUpdateSessionMutation();
    const [deleteSession] = useDeleteSessionMutation();

    const sessions: Session[] = Array.isArray(responseData?.data)
        ? responseData.data
        : responseData?.data || [];

    const handleOpenAddSessionModal = () => {
        setCurrentSession(null);
        setSessionName("");
        setAddSessionModalOpen(true);
    };

    const handleOpenEditSessionModal = (session: Session) => {
        setCurrentSession(session);
        setSessionName(session.name);
        setAddSessionModalOpen(true);
    };

    const handleCloseAddSessionModal = () => {
        setAddSessionModalOpen(false);
        setSessionName("");
        setCurrentSession(null);
    };

    const handleCreateOrUpdateSession = async () => {
        try {
            if (!sessionName.trim()) {
                toastShowing('Session name cannot be empty', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            if (currentSession) {
                // Update existing session
                await updateSession({ id: currentSession.id, name: sessionName }).unwrap();
                toastShowing('Session updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new session
                await createSession({ name: sessionName }).unwrap();
                toastShowing('Session created successfully', 'bottom-right', 2000, 'green', 'white');
            }
            
            refetch();
            handleCloseAddSessionModal();
        } catch (err) {
            toastShowing((err as { data?: { message?: string } })?.data?.message ||
                (currentSession ? "Failed to update session" : "Failed to create session"), 'bottom-right', 2000, 'red', 'white');
        }
    };

    const handleDeleteSession = async () => {
        await handleDeleteConfirmation(
            async (sessionId) => {
                await deleteSession(sessionId).unwrap();
                refetch();
            },
            {
                successMessage: "Session deleted successfully",
                errorMessage: "Failed to delete session",
            }
        );
    };

    const totalPages = responseData?.meta?.totalPage || 1;

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: Session, index?: number) => (index !== undefined ? index + 1 : null),
    },
        {
            key: 'name',
            header: 'Session Name'
        },
        {
    key: 'createdAt',
    header: 'Created On',
    render: (row: Session) => {
        const date = new Date(row.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        return (
            <div className="lg:w-auto w-32">  {/* w-32 is 44px in Tailwind (11 * 4px) */}
                {formattedDate}
            </div>
        );
    },
    headerClassName: "lg:w-auto w-32",  // For the header
    cellClassName: "lg:w-auto w-32"     // For the cells
},
        {
            key: 'actions',
            header: 'Actions',
            render: (row: Session) => (
                <div className="flex space-x-2 items-center">
                    <IconButton onClick={() => handleOpenEditSessionModal(row)}>
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
                title="Session Management"
                buttonText="Add Session"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddSessionModal}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search sessions..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            {/* Add/Edit Session Modal */}
            <AnimatePresence>
                {addSessionModalOpen && (
                    <Modal
                        open={addSessionModalOpen}
                        onClose={handleCloseAddSessionModal}
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
                                    onClick={handleCloseAddSessionModal}
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
                                    {currentSession ? "Edit Session" : "Add New Session"}
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
                                            Session Name {theStar}
                                        </span>
                                    }
                                    variant="outlined"
                                    value={sessionName}
                                    onChange={(e) => setSessionName(e.target.value)}
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
                                                <Clock size={20} color="#5F7161" />
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
                                        onClick={handleCloseAddSessionModal}
                                    >Cancel</CancelButton>

                                    
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                     <SubmitButton onClick={handleCreateOrUpdateSession}
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
                        Failed to load sessions
                    </Alert>
                ) : sessions.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No sessions found. {searchTerm ? "Try a different search term." : "Create your first session."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<Session>
                            columns={columns}
                            data={sessions}
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
                onConfirm={() => handleDeleteSession()}
                title="Delete Session"
                description="Are you sure you want to delete this session? All associated data will be permanently removed."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default SessionList;