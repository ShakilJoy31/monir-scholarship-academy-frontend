"use client";
import React, { useState, useEffect } from "react";
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
import {
    useCreateHostelBedMutation,
    useDeleteHostelBedMutation,
    useGetAllHostelBedsQuery,
    useGetHostelBedByIdQuery,
    useUpdateHostelBedMutation
} from "@/app/store/api/classes/hostelBedApi";
import { useGetAllHostelRoomsQuery } from "@/app/store/api/classes/hostelRoomApi";
import { useGetAllHostelsQuery } from "@/app/store/api/classes/hostelApi";
import { theStar } from "@/lib/requiredJSX";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface HostelBed {
    id: number;
    roomId: number;
    bedNumber: string;
    isOccupied: boolean;
    createdAt: string;
    updatedAt: string;
    room?: {
        id: number;
        hostelId: number;
        roomNumber: string;
        capacity: number;
        rentAmount: number;
        createdAt: string;
        updatedAt: string;
    };
    [key: string]: unknown;
}

interface HostelRoom {
    id: number;
    hostelId: number;
    roomNumber: string;
    capacity: number;
    rentAmount: number;
    [key: string]: unknown;
}

interface Hostel {
    id: number;
    name: string;
    [key: string]: unknown;
}

const HostelBedList = () => {
    const [addHostelBedModalOpen, setAddHostelBedModalOpen] = useState<boolean>(false);
    const [viewHostelBedModalOpen, setViewHostelBedModalOpen] = useState<boolean>(false);
    const [currentHostelBed, setCurrentHostelBed] = useState<HostelBed | null>(null);
    const [hostelDetailsMap, setHostelDetailsMap] = useState<Record<number, Hostel>>({});
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        roomId: "",
        bedNumber: "",
    });

    // Fetch all necessary data
    const {
        data: hostelBedsResponse,
        isLoading,
        isError,
        refetch,
    } = useGetAllHostelBedsQuery({
        page: page + 1,
        size: rowsPerPage,
        search: searchTerm,
    });

    const { data: hostelRoomsResponse } = useGetAllHostelRoomsQuery({
        page: 1,
        size: 10000,
    });

    const { data: allHostelsResponse } = useGetAllHostelsQuery({
        page: 1,
        size: 10000,
    });

    const { data: hostelBedDetails } = useGetHostelBedByIdQuery(currentHostelBed?.id || 0, {
        skip: !currentHostelBed?.id,
    });
    console.log(hostelBedDetails)

    // Create a map of hostel details for quick lookup
    useEffect(() => {
        if (allHostelsResponse?.data) {
            const hostelsMap: Record<number, Hostel> = {};
            allHostelsResponse.data.forEach((hostel: Hostel) => {
                hostelsMap[hostel.id] = hostel;
            });
            setHostelDetailsMap(hostelsMap);
        }
    }, [allHostelsResponse]);

    const {
        isDeleteModalOpen,
        itemToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    const [createHostelBed, { isLoading: isCreatingHostelBed }] = useCreateHostelBedMutation();
    const [updateHostelBed, { isLoading: isUpdatingHostelBed }] = useUpdateHostelBedMutation();
    const [deleteHostelBed] = useDeleteHostelBedMutation();

    const totalPages = hostelBedsResponse?.meta?.totalPage || 1;
    const hostelBeds: HostelBed[] = Array.isArray(hostelBedsResponse?.data) ? hostelBedsResponse.data : hostelBedsResponse?.data || [];
    const hostelRooms: HostelRoom[] = hostelRoomsResponse?.data || [];

    // Get hostel name for a room
    const getHostelName = (hostelId: number) => {
        return hostelDetailsMap[hostelId]?.name || 'N/A';
    };

    // Modal handlers
    const handleOpenAddHostelBedModal = () => {
        setCurrentHostelBed(null);
        setFormData({
            roomId: "",
            bedNumber: "",
        });
        setAddHostelBedModalOpen(true);
    };

    const handleOpenEditHostelBedModal = (hostelBed: HostelBed) => {
        setCurrentHostelBed(hostelBed);
        setFormData({
            roomId: hostelBed.roomId.toString(),
            bedNumber: hostelBed.bedNumber,
        });
        setAddHostelBedModalOpen(true);
    };

    const handleOpenViewHostelBedModal = async (hostelBed: HostelBed) => {
        setCurrentHostelBed(hostelBed);
        setViewHostelBedModalOpen(true);
    };

    const handleCloseAddHostelBedModal = () => {
        setAddHostelBedModalOpen(false);
        setCurrentHostelBed(null);
    };

    const handleCloseViewHostelBedModal = () => {
        setViewHostelBedModalOpen(false);
        setCurrentHostelBed(null);
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

    const handleCreateOrUpdateHostelBed = async () => {
        try {
            // Validate required fields
            if (!formData.roomId || !formData.bedNumber) {
                toastShowing('All fields are required', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            const hostelBedData = {
                roomId: Number(formData.roomId),
                bedNumber: formData.bedNumber,
            };

            if (currentHostelBed) {
                // Update existing hostel bed
                await updateHostelBed({ id: currentHostelBed.id, ...hostelBedData }).unwrap();
                toastShowing('Hostel bed updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new hostel bed
                await createHostelBed(hostelBedData).unwrap();
                toastShowing('Hostel bed created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddHostelBedModal();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentHostelBed ? "Failed to update hostel bed" : "Failed to create hostel bed")
            );
            console.error("Error saving hostel bed:", err);
        }
    };

    const handleDeleteHostelBed = async () => {
        await handleDeleteConfirmation(
            async (hostelBedId) => {
                await deleteHostelBed(hostelBedId).unwrap();
                refetch();
            },
            {
                successMessage: "Hostel bed deleted successfully",
                errorMessage: "Failed to delete hostel bed",
            }
        );
    };

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: HostelBed, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'room',
            header: 'Hostel & Room',
            render: (row: HostelBed) => (
                <Box>
                    <Typography variant="body2">
                        {row.room ? getHostelName(row.room.hostelId) : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Room: {row.room?.roomNumber || 'N/A'}
                    </Typography>
                </Box>
            )
        },
        {
            key: 'bedNumber',
            header: 'Bed Number'
        },
        {
            key: 'isOccupied',
            header: 'Status',
            render: (row: HostelBed) => (
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: row.isOccupied ? 'error.light' : 'success.light',
                        color: row.isOccupied ? 'error.contrastText' : 'success.contrastText',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                    }}
                >
                    {row.isOccupied ? 'Occupied' : 'Available'}
                </Box>
            )
        },
        {
            key: 'createdAt',
            header: 'Added On',
            render: (row: HostelBed) => {
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
            render: (row: HostelBed) => {
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
                                        handleOpenViewHostelBedModal(row);
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
                                        handleOpenEditHostelBedModal(row);
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
                title="Hostel Bed Management"
                buttonText="Add Bed"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddHostelBedModal}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search beds..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            {/* Add/Edit Hostel Bed Modal */}
            <AnimatePresence>
                {addHostelBedModalOpen && (
                    <Modal
                        open={addHostelBedModalOpen}
                        onClose={handleCloseAddHostelBedModal}
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
                                    onClick={handleCloseAddHostelBedModal}
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
                                    {currentHostelBed ? "Edit Hostel Bed" : "Add Hostel Bed"}
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
                                        <InputLabel>Hostel Room {theStar}</InputLabel>
                                        <Select
                                            name="roomId"
                                            value={formData.roomId}
                                            onChange={handleSelectChange}
                                            label="Hostel Room"
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
                                        >
                                            {hostelRooms.map((room: HostelRoom) => (
                                                <MenuItem key={room.id} value={room.id}>
                                                    {getHostelName(room.hostelId)} - Room {room.roomNumber}
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
                                                Bed Number
                                                {theStar}
                                            </>
                                        }
                                        name="bedNumber"
                                        value={formData.bedNumber}
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
                                        onClick={handleCloseAddHostelBedModal}

                                    >
                                        Cancel
                                    </CancelButton>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <SubmitButton
                                        onClick={handleCreateOrUpdateHostelBed}
                                        disabled={
                                            (isCreatingHostelBed || isUpdatingHostelBed) ||
                                            !formData.roomId || !formData.bedNumber
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
                                        {(isCreatingHostelBed || isUpdatingHostelBed) ? (
                                            <span>{currentHostelBed ? "Updating..." : "Submitting..."}</span>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{currentHostelBed ? "Update" : "Submit"}</span>
                                                
                                            </Box>
                                        )}
                                    </SubmitButton>
                                </motion.div>
                            </Box>
                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* View Hostel Bed Modal */}
            <AnimatePresence>
                {viewHostelBedModalOpen && currentHostelBed && (
                    <Modal
                        open={viewHostelBedModalOpen}
                        onClose={handleCloseViewHostelBedModal}
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
                                    onClick={handleCloseViewHostelBedModal}
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
                                    Hostel Bed Details
                                </Typography>
                            </Box>

                            {/* Hostel bed details */}
                            <Box sx={{ display: 'grid', gap: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Hostel:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {currentHostelBed.room ? getHostelName(currentHostelBed.room.hostelId) : 'N/A'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Room Number:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {currentHostelBed.room?.roomNumber || 'N/A'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Bed Number:</Typography>
                                    <Typography variant="body1" fontWeight={500}>{currentHostelBed.bedNumber}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Status:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        <Box
                                            component="span"
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 1,
                                                backgroundColor: currentHostelBed.isOccupied ? 'error.light' : 'success.light',
                                                color: currentHostelBed.isOccupied ? 'error.contrastText' : 'success.contrastText',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                            }}
                                        >
                                            {currentHostelBed.isOccupied ? 'Occupied' : 'Available'}
                                        </Box>
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Added On:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {new Date(currentHostelBed.createdAt).toLocaleDateString('en-US', {
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
                                    onClick={handleCloseViewHostelBedModal}
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
                        Failed to load hostel beds
                    </Alert>
                ) : hostelBeds.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No hostel beds found. {searchTerm ? "Try a different search term." : "Add your first hostel bed."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<HostelBed>
                            columns={columns}
                            data={hostelBeds}
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
                onConfirm={() => handleDeleteHostelBed()}
                title="Delete Hostel Bed"
                description="Are you sure you want to delete this hostel bed? This action cannot be undone."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default HostelBedList;