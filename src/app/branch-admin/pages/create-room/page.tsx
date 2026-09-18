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
    Modal,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Tooltip,
} from "@mui/material";
import { Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { motion, AnimatePresence } from "framer-motion";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { BsThreeDotsVertical } from "react-icons/bs";
import { SelectChangeEvent } from '@mui/material';
import { useCreateHostelRoomMutation, useDeleteHostelRoomMutation, useGetAllHostelRoomsQuery, useGetHostelRoomByIdQuery, useUpdateHostelRoomMutation } from "@/app/store/api/classes/hostelRoomApi";
import { useGetAllHostelsQuery } from "@/app/store/api/classes/hostelApi";
import { theStar } from "@/lib/requiredJSX";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface HostelRoom {
    id: number;
    hostelId: number;
    roomNumber: string;
    capacity: number;
    rentAmount: number;
    createdAt: string;
    updatedAt: string;
    hostel?: {
        name: string;
    };
    [key: string]: unknown;
}

interface Hostel {
    id: number;
    name: string;
    [key: string]: unknown;
}

const HostelRoomList = () => {
    const [addHostelRoomModalOpen, setAddHostelRoomModalOpen] = useState<boolean>(false);
    const [viewHostelRoomModalOpen, setViewHostelRoomModalOpen] = useState<boolean>(false);
    const [currentHostelRoom, setCurrentHostelRoom] = useState<HostelRoom | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        hostelId: "",
        roomNumber: "",
        capacity: "",
        rentAmount: "",
    });

    // Fetch data
    const {
        data: hostelRoomsResponse,
        isLoading,
        isError,
        refetch,
    } = useGetAllHostelRoomsQuery({
        page: page + 1,
        size: rowsPerPage,
        search: searchTerm,
    });

    const { data: hostelsResponse } = useGetAllHostelsQuery({
        page: 1,
        size: 10000,
    });

    const { data: hostelRoomDetails } = useGetHostelRoomByIdQuery(currentHostelRoom?.id || 0, {
        skip: !currentHostelRoom?.id,
    });

    const {
        isDeleteModalOpen,
        itemToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    const [createHostelRoom, { isLoading: isCreatingHostelRoom }] = useCreateHostelRoomMutation();
    const [updateHostelRoom, { isLoading: isUpdatingHostelRoom }] = useUpdateHostelRoomMutation();
    const [deleteHostelRoom] = useDeleteHostelRoomMutation();

    const totalPages = hostelRoomsResponse?.meta?.totalPage || 1;
    const hostelRooms: HostelRoom[] = Array.isArray(hostelRoomsResponse?.data) ? hostelRoomsResponse.data : hostelRoomsResponse?.data || [];
    const hostels: Hostel[] = hostelsResponse?.data || [];

    // Modal handlers
    const handleOpenAddHostelRoomModal = () => {
        setCurrentHostelRoom(null);
        setFormData({
            hostelId: "",
            roomNumber: "",
            capacity: "",
            rentAmount: "",
        });
        setAddHostelRoomModalOpen(true);
    };

    const handleOpenEditHostelRoomModal = (hostelRoom: HostelRoom) => {
        setCurrentHostelRoom(hostelRoom);
        setFormData({
            hostelId: hostelRoom.hostelId.toString(),
            roomNumber: hostelRoom.roomNumber,
            capacity: hostelRoom.capacity.toString(),
            rentAmount: hostelRoom.rentAmount.toString(),
        });
        setAddHostelRoomModalOpen(true);
    };

    const handleOpenViewHostelRoomModal = (hostelRoom: HostelRoom) => {
        setCurrentHostelRoom(hostelRoom);
        setViewHostelRoomModalOpen(true);
    };

    const handleCloseAddHostelRoomModal = () => {
        setAddHostelRoomModalOpen(false);
        setCurrentHostelRoom(null);
    };

    const handleCloseViewHostelRoomModal = () => {
        setViewHostelRoomModalOpen(false);
        setCurrentHostelRoom(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateOrUpdateHostelRoom = async () => {
        try {
            // Validate required fields
            if (!formData.hostelId || !formData.roomNumber || !formData.capacity || !formData.rentAmount) {
                toastShowing('All fields are required', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            const hostelRoomData = {
                hostelId: Number(formData.hostelId),
                roomNumber: formData.roomNumber,
                capacity: Number(formData.capacity),
                rentAmount: Number(formData.rentAmount),
            };

            if (currentHostelRoom) {
                // Update existing hostel room
                await updateHostelRoom({ id: currentHostelRoom.id, ...hostelRoomData }).unwrap();
                toastShowing('Hostel room updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new hostel room
                await createHostelRoom(hostelRoomData).unwrap();
                toastShowing('Hostel room created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddHostelRoomModal();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentHostelRoom ? "Failed to update hostel room" : "Failed to create hostel room")
            );
            console.error("Error saving hostel room:", err);
        }
    };

    const handleDeleteHostelRoom = async () => {
        await handleDeleteConfirmation(
            async (hostelRoomId) => {
                await deleteHostelRoom(hostelRoomId).unwrap();
                refetch();
            },
            {
                successMessage: "Hostel room deleted successfully",
                errorMessage: "Failed to delete hostel room",
            }
        );
    };

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: HostelRoom, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'hostel',
            header: 'Hostel',
            render: (row: HostelRoom) => row.hostel?.name || 'N/A'
        },
        {
            key: 'roomNumber',
            header: 'Room Number'
        },
        {
            key: 'capacity',
            header: 'Capacity'
        },
        {
            key: 'rentAmount',
            header: 'Rent Amount',
            render: (row: HostelRoom) => `BDT ${row.rentAmount.toFixed(2)}/-`
        },
        {
            key: 'createdAt',
            header: 'Added On',
            render: (row: HostelRoom) => {
                const date = new Date(row.createdAt);
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: HostelRoom) => {
                return (
                    <Tooltip
                        title={
                            <Paper
                                elevation={3}
                                sx={{
                                    backgroundColor: 'white',
                                    padding: '8px 0',
                                    borderRadius: '8px',
                                    display: 'grid',
                                    gap: '4px',
                                    minWidth: '120px',
                                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <Button
                                    onClick={() => {
                                        handleOpenViewHostelRoomModal(row);
                                        setOpenMenuId(null);
                                    }}
                                    size="small"
                                    sx={{
                                        color: "#035140",
                                        textTransform: 'none',
                                        fontSize: '14px',
                                        fontWeight: 400,
                                        justifyContent: 'flex-start',
                                        padding: '6px 16px',
                                        "&:hover": {
                                            backgroundColor: "rgba(3, 81, 64, 0.08)",
                                        },
                                    }}
                                >
                                    View
                                </Button>

                                <Button
                                    onClick={() => {
                                        handleOpenEditHostelRoomModal(row);
                                        setOpenMenuId(null);
                                    }}
                                    size="small"
                                    sx={{
                                        color: "#035140",
                                        textTransform: 'none',
                                        fontSize: '14px',
                                        fontWeight: 400,
                                        justifyContent: 'flex-start',
                                        padding: '6px 16px',
                                        "&:hover": {
                                            backgroundColor: "rgba(3, 81, 64, 0.08)",
                                        },
                                    }}
                                >
                                    Edit
                                </Button>

                                <Button
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        openDeleteModal(row.id);
                                        setOpenMenuId(null);
                                    }}
                                    size="small"
                                    disabled={isDeleting && itemToDelete === row.id}
                                    sx={{
                                        color: "#DC2626",
                                        textTransform: 'none',
                                        fontSize: '14px',
                                        fontWeight: 400,
                                        justifyContent: 'flex-start',
                                        padding: '6px 16px',
                                        "&:hover": {
                                            backgroundColor: "rgba(220, 38, 38, 0.08)",
                                        },
                                        "&.Mui-disabled": {
                                            color: "rgba(220, 38, 38, 0.5)"
                                        }
                                    }}
                                >
                                    {isDeleting && itemToDelete === row.id ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <CircularProgress size={14} thickness={5} color="inherit" />
                                            Deleting...
                                        </span>
                                    ) : (
                                        "Delete"
                                    )}
                                </Button>
                            </Paper>
                        }
                        placement="bottom-end"
                        open={openMenuId === row.id}
                        onOpen={() => setOpenMenuId(row.id)}
                        onClose={() => setOpenMenuId(null)}
                        disableFocusListener
                        disableHoverListener
                        disableTouchListener
                        componentsProps={{
                            tooltip: {
                                sx: {
                                    backgroundColor: 'transparent',
                                    padding: 0,
                                    boxShadow: 'none'
                                }
                            }
                        }}
                        PopperProps={{
                            modifiers: [
                                {
                                    name: 'offset',
                                    options: {
                                        offset: [0, -10],
                                    },
                                },
                            ],
                        }}
                    >
                        <IconButton
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === row.id ? null : row.id);
                            }}
                            sx={{
                                color: "#64748B",
                                p: 1,
                                borderRadius: "8px",
                                "&:hover": {
                                    backgroundColor: "rgba(100, 116, 139, 0.1)",
                                },
                            }}
                        >
                            <BsThreeDotsVertical size={18} />
                        </IconButton>
                    </Tooltip>
                );
            }
        }
    ];

    return (
        <Box>
            <PageHeader
                title="Hostel Room Management"
                buttonText="Add Room"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddHostelRoomModal}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search rooms..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            {/* Add/Edit Hostel Room Modal */}
            <AnimatePresence>
                {addHostelRoomModalOpen && (
                    <Modal
                        open={addHostelRoomModalOpen}
                        onClose={handleCloseAddHostelRoomModal}
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
                                    onClick={handleCloseAddHostelRoomModal}
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
                                    {currentHostelRoom ? "Edit Hostel Room" : "Add Hostel Room"}
                                </Typography>
                            </Box>

                            {/* Form fields */}
                            <Box sx={{ display: 'grid', gap: 2 }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <FormControl fullWidth>
                                        <InputLabel>Hostel {theStar}</InputLabel>
                                        <Select
                                            name="hostelId"
                                            value={formData.hostelId}
                                            onChange={handleSelectChange}
                                            label={
                                                <>
                                                    Hostel
                                                    {theStar}
                                                </>
                                            }
                                            sx={{
                                                borderRadius: '6px',
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
                                        >
                                            {hostels.map((hostel: Hostel) => (
                                                <MenuItem key={hostel.id} value={hostel.id}>
                                                    {hostel.name}
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
                                            <>
                                                Room Number
                                                {theStar}
                                            </>
                                        }
                                        name="roomNumber"
                                        value={formData.roomNumber}
                                        onChange={handleFormChange}
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
                                    />
                                </motion.div>

                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <TextField
                                            fullWidth
                                            label={
                                                <>
                                                    Capacity
                                                    {theStar}
                                                </>
                                            }
                                            name="capacity"
                                            type="number"
                                            value={formData.capacity}
                                            onChange={handleFormChange}
                                            inputProps={{ min: 1 }}
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        <TextField
                                            fullWidth
                                            label={
                                                <>
                                                    Rent Amount (BDT)
                                                    {theStar}
                                                </>
                                            }
                                            name="rentAmount"
                                            type="number"
                                            value={formData.rentAmount}
                                            onChange={handleFormChange}
                                            inputProps={{ min: 0, step: "0.01" }}
                                        />
                                    </motion.div>
                                </Box>
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
                                    <CancelButton
                                        onClick={handleCloseAddHostelRoomModal}
                                       
                                    >
                                        Cancel
                                    </CancelButton>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <SubmitButton
                                        onClick={handleCreateOrUpdateHostelRoom}
                                        disabled={
                                            (isCreatingHostelRoom || isUpdatingHostelRoom) ||
                                            !formData.hostelId || !formData.roomNumber ||
                                            !formData.capacity || !formData.rentAmount
                                        }
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
                                        {(isCreatingHostelRoom || isUpdatingHostelRoom) ? (
                                            <span>{currentHostelRoom ? "Updating..." : "Submitting..."}</span>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{currentHostelRoom ? "Update" : "Submit"}</span>
                                               
                                            </Box>
                                        )}
                                    </SubmitButton>
                                </motion.div>
                            </Box>
                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* View Hostel Room Modal */}
            <AnimatePresence>
                {viewHostelRoomModalOpen && currentHostelRoom && (
                    <Modal
                        open={viewHostelRoomModalOpen}
                        onClose={handleCloseViewHostelRoomModal}
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
                                    onClick={handleCloseViewHostelRoomModal}
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
                                    Hostel Room Details
                                </Typography>
                            </Box>

                            {/* Hostel room details */}
                            <Box sx={{ display: 'grid', gap: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Hostel:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {hostelRoomDetails?.data?.hostel?.name || 'N/A'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Room Number:</Typography>
                                    <Typography variant="body1" fontWeight={500}>{currentHostelRoom.roomNumber}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Capacity:</Typography>
                                    <Typography variant="body1" fontWeight={500}>{currentHostelRoom.capacity}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Rent Amount:</Typography>
                                    <Typography variant="body1" fontWeight={500}>BDT {currentHostelRoom.rentAmount.toFixed(2)}/-</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Added On:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {new Date(currentHostelRoom.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Close button */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                                <CancelButton
                                    onClick={handleCloseViewHostelRoomModal}
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
                                    }}
                                >
                                    Close
                                </CancelButton>
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
                        Failed to load hostel rooms
                    </Alert>
                ) : hostelRooms.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No hostel rooms found. {searchTerm ? "Try a different search term." : "Add your first hostel room."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<HostelRoom>
                            columns={columns}
                            data={hostelRooms}
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
                onConfirm={() => handleDeleteHostelRoom()}
                title="Delete Hostel Room"
                description="Are you sure you want to delete this hostel room? This action cannot be undone."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default HostelRoomList;