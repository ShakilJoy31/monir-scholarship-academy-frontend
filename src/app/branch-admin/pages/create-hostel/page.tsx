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
import { Plus, X, } from "lucide-react";
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
import { useCreateHostelMutation, useDeleteHostelMutation, useGetAllHostelsQuery, useGetHostelByIdQuery, useUpdateHostelMutation } from "@/app/store/api/classes/hostelApi";
import { SelectChangeEvent } from '@mui/material';
import { theStar } from "@/lib/requiredJSX";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface Hostel {
    id: number;
    name: string;
    address: string | null;
    type: "Boys" | "Girls" | "Mixed";
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

const HostelList = () => {
    const [addHostelModalOpen, setAddHostelModalOpen] = useState<boolean>(false);
    const [viewHostelModalOpen, setViewHostelModalOpen] = useState<boolean>(false);
    const [currentHostel, setCurrentHostel] = useState<Hostel | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        type: "Boys" as "Boys" | "Girls" | "Mixed",
    });

    // Fetch data
    const {
        data: hostelsResponse,
        isLoading,
        isError,
        refetch,
    } = useGetAllHostelsQuery({
        page: page + 1,
        size: rowsPerPage,
        search: searchTerm,
    });

    const { data: hostelDetails } = useGetHostelByIdQuery(currentHostel?.id || 0, {
        skip: !currentHostel?.id,
    });

    console.log("Hostel Details:", hostelDetails);

    const {
        isDeleteModalOpen,
        itemToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    const [createHostel, { isLoading: isCreatingHostel }] = useCreateHostelMutation();
    const [updateHostel, { isLoading: isUpdatingHostel }] = useUpdateHostelMutation();
    const [deleteHostel] = useDeleteHostelMutation();

    const totalPages = hostelsResponse?.meta?.totalPage || 1;
    const hostels: Hostel[] = Array.isArray(hostelsResponse?.data) ? hostelsResponse.data : hostelsResponse?.data || [];

    // Modal handlers
    const handleOpenAddHostelModal = () => {
        setCurrentHostel(null);
        setFormData({
            name: "",
            address: "",
            type: "Boys",
        });
        setAddHostelModalOpen(true);
    };

    const handleOpenEditHostelModal = (hostel: Hostel) => {
        setCurrentHostel(hostel);
        setFormData({
            name: hostel.name,
            address: hostel.address || "",
            type: hostel.type,
        });
        setAddHostelModalOpen(true);
    };

    const handleOpenViewHostelModal = (hostel: Hostel) => {
        setCurrentHostel(hostel);
        setViewHostelModalOpen(true);
    };

    const handleCloseAddHostelModal = () => {
        setAddHostelModalOpen(false);
        setCurrentHostel(null);
    };

    const handleCloseViewHostelModal = () => {
        setViewHostelModalOpen(false);
        setCurrentHostel(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (e: SelectChangeEvent<"Boys" | "Girls" | "Mixed">) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateOrUpdateHostel = async () => {
        try {
            // Validate required fields
            if (!formData.name.trim() || !formData.type) {
                toastShowing('Name and Type are required', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            const hostelData = {
                name: formData.name,
                address: formData.address.trim() || null,
                type: formData.type,
            };

            if (currentHostel) {
                // Update existing hostel
                await updateHostel({ id: currentHostel.id, ...hostelData }).unwrap();
                toastShowing('Hostel updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new hostel
                await createHostel(hostelData).unwrap();
                toastShowing('Hostel created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddHostelModal();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentHostel ? "Failed to update hostel" : "Failed to create hostel")
            );
            console.error("Error saving hostel:", err);
        }
    };

    const handleDeleteHostel = async () => {
        await handleDeleteConfirmation(
            async (hostelId) => {
                await deleteHostel(hostelId).unwrap();
                refetch();
            },
            {
                successMessage: "Hostel deleted successfully",
                errorMessage: "Failed to delete hostel",
            }
        );
    };

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: Hostel, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'name',
            header: 'Hostel Name'
        },
        {
            key: 'type',
            header: 'Type'
        },
        {
            key: 'address',
            header: 'Address',
            render: (row: Hostel) => row.address || ''
        },
        {
            key: 'createdAt',
            header: 'Added On',
            render: (row: Hostel) => {
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
            render: (row: Hostel) => {
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
                                        handleOpenViewHostelModal(row);
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
                                        handleOpenEditHostelModal(row);
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
                title="Hostel Management"
                buttonText="Add Hostel"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddHostelModal}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search hostels..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            {/* Add/Edit Hostel Modal */}
            <AnimatePresence>
                {addHostelModalOpen && (
                    <Modal
                        open={addHostelModalOpen}
                        onClose={handleCloseAddHostelModal}
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
                                    onClick={handleCloseAddHostelModal}
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
                                    {currentHostel ? "Edit Hostel" : "Add Hostel"}
                                </Typography>
                            </Box>

                            {/* Form fields */}
                            <Box sx={{ display: 'grid', gap: 2 }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <TextField
                                        fullWidth
                                        label={
                                            <>
                                                Hostel Name
                                                {theStar}
                                            </>
                                        }
                                        name="name"
                                        value={formData.name}
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
                                        autoFocus
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <FormControl fullWidth>
                                        <InputLabel>Type {theStar}</InputLabel>
                                        <Select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleSelectChange}
                                            label={
                                                <>
                                                    Hostel Type
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
                                            <MenuItem value="Boys">Boys</MenuItem>
                                            <MenuItem value="Girls">Girls</MenuItem>
                                            <MenuItem value="Mixed">Mixed</MenuItem>
                                        </Select>
                                    </FormControl>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <TextField
                                        fullWidth
                                        label="Address (Optional)"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleFormChange}
                                        multiline
                                        rows={3}
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
                                        onClick={handleCloseAddHostelModal}
                                       
                                    >
                                        Cancel
                                    </CancelButton>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <SubmitButton
                                        onClick={handleCreateOrUpdateHostel}
                                        disabled={
                                            (isCreatingHostel || isUpdatingHostel) ||
                                            !formData.name || !formData.type
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
                                        {(isCreatingHostel || isUpdatingHostel) ? (
                                            <span>{currentHostel ? "Updating..." : "Submitting..."}</span>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{currentHostel ? "Update" : "Submit"}</span>
                                               
                                            </Box>
                                        )}
                                    </SubmitButton>
                                </motion.div>
                            </Box>
                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* View Hostel Modal */}
            <AnimatePresence>
                {viewHostelModalOpen && currentHostel && (
                    <Modal
                        open={viewHostelModalOpen}
                        onClose={handleCloseViewHostelModal}
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
                                    onClick={handleCloseViewHostelModal}
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
                                    Hostel Details
                                </Typography>
                            </Box>

                            {/* Hostel details */}
                            <Box sx={{ display: 'grid', gap: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Name:</Typography>
                                    <Typography variant="body1" fontWeight={500}>{currentHostel.name}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Type:</Typography>
                                    <Typography variant="body1" fontWeight={500}>{currentHostel.type}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Address:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {currentHostel.address || ''}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Added On:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {new Date(currentHostel.createdAt).toLocaleDateString('en-US', {
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
                                    onClick={handleCloseViewHostelModal}
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
                        Failed to load hostels
                    </Alert>
                ) : hostels.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No hostels found. {searchTerm ? "Try a different search term." : "Add your first hostel."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<Hostel>
                            columns={columns}
                            data={hostels}
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
                onConfirm={() => handleDeleteHostel()}
                title="Delete Hostel"
                description="Are you sure you want to delete this hostel? This action cannot be undone."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default HostelList;