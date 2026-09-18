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
    Modal,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Avatar,
} from "@mui/material";
import { Plus, Edit, Trash2, X, User, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
    useCreateStaffMutation,
    useDeleteStaffMutation,
    useGetAllStaffQuery,
    useUpdateStaffMutation
} from "@/app/store/api/classes/staffApi";
import { useAddThumbnailMutation } from "@/app/store/api/file/fileApi";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { validateEmptyFields } from "@/lib/objectModify";
import { bloodGroups } from "@/lib/requiredVariable";
import { useGetAllDesignationsQuery } from "@/app/store/api/classes/designationApi";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";

interface Designation {
    id: number;
    branchId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

interface Staff {
    id: number;
    name: string;
    phone: string;
    email?: string;
    designation: string;
    nid?: string;
    gender?: "Male" | "Female" | "Other";
    religion?: "Islam" | "Hindu" | "Christian" | "Other";
    dob?: string;
    bloodGroup?: string;
    address?: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

const StaffList = () => {
    const [addStaffModalOpen, setAddStaffModalOpen] = useState<boolean>(false);
    const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
    const [formData, setFormData] = useState<Partial<Staff>>({
        name: '',
        phone: '',
        email: '',
        designation: '',
        nid: '',
        gender: undefined,
        religion: undefined,
        dob: undefined,
        bloodGroup: undefined,
        address: '',
        avatar: '',
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [preview, setPreview] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<File | undefined>(undefined);

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllStaffQuery({
        page: page + 1,
        size: rowsPerPage,
        search: searchTerm,
    });

    const { data: designationsResponse } =
        useGetAllDesignationsQuery({ page: 1, size: 10000 });

    const [designations, setDesignations] = useState<Designation[]>([]);

    useEffect(() => {
        if (designationsResponse?.data) {
            setDesignations(designationsResponse.data);
        }
    }, [designationsResponse]);


    const {
        isDeleteModalOpen,
        itemToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    const [createStaff, { isLoading: isCreatingStaff }] = useCreateStaffMutation();
    const [updateStaff, { isLoading: isUpdatingStaff }] = useUpdateStaffMutation();
    const [deleteStaff] = useDeleteStaffMutation();
    const [addThumbnail, { isLoading: isUploading }] = useAddThumbnailMutation();

    const staffs: Staff[] = Array.isArray(responseData?.data)
        ? responseData.data
        : responseData?.data || [];

    const handleOpenAddStaffModal = () => {
        setCurrentStaff(null);
        setFormData({
            name: '',
            phone: '',
            email: '',
            designation: '',
            nid: '',
            gender: undefined,
            religion: undefined,
            dob: undefined,
            bloodGroup: undefined,
            address: '',
            avatar: '',
        });
        setPreview(null);
        setUploadedImage(undefined);
        setAddStaffModalOpen(true);
    };

    const handleOpenEditStaffModal = (staff: Staff) => {
        setCurrentStaff(staff);
        setFormData({
            name: staff.name,
            phone: staff.phone,
            email: staff.email || '',
            designation: staff.designation,
            nid: staff.nid || '',
            gender: staff.gender,
            religion: staff.religion,
            dob: staff.dob,
            bloodGroup: staff.bloodGroup,
            address: staff.address || '',
            avatar: staff.avatar || '',
        });
        setPreview(staff.avatar || null);
        setUploadedImage(undefined);
        setAddStaffModalOpen(true);
    };

    const handleCloseAddStaffModal = () => {
        setAddStaffModalOpen(false);
        setFormData({
            name: '',
            phone: '',
            email: '',
            designation: '',
            nid: '',
            gender: undefined,
            religion: undefined,
            dob: undefined,
            bloodGroup: undefined,
            address: '',
            avatar: '',
        });
        setPreview(null);
        setUploadedImage(undefined);
        setCurrentStaff(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (name: keyof Staff, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (date: Date | null) => {
        setFormData(prev => ({
            ...prev,
            dob: date ? date.toISOString() : undefined
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setUploadedImage(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            // Clear the avatar URL field when uploading a new image
            setFormData(prev => ({ ...prev, avatar: '' }));
        }
    };

    const handleCreateOrUpdateStaff = async () => {
        try {
            // Required field validation
            if (!formData.name || !formData.phone || !formData.designation) {
                toastShowing('Name, phone and designation are required', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            let avatarUrl = formData.avatar || "";

            // Upload image if new file was selected
            if (uploadedImage) {
                try {
                    const formData = new FormData();
                    formData.append("photo", uploadedImage);

                    const response = await addThumbnail(formData).unwrap();
                    avatarUrl = response?.data?.[0] || "";
                } catch (err) {
                    console.error(err);
                    toastShowing('Image upload error', 'bottom-right', 2000, 'red', 'white');
                    return;
                }
            }

            const payload = {
                ...formData,
                avatar: avatarUrl
            };

            const staffData = validateEmptyFields(payload);

            if (currentStaff) {
                // Update existing staff
                await updateStaff({
                    id: currentStaff.id,
                    ...staffData
                }).unwrap();
                toastShowing('Staff updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new staff
                console.log("Creating staff with data:", staffData);
                await createStaff(staffData).unwrap();
                toastShowing('Staff created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddStaffModal();
        } catch (err) {
            toastShowing((err as { data?: { message?: string } })?.data?.message ||
                (currentStaff ? "Failed to update staff" : "Failed to create staff"), 'bottom-right', 2000, 'red', 'white');
            console.error("Error saving staff:", err);
        }
    };

    const handleDeleteStaff = async () => {
        await handleDeleteConfirmation(
            async (staffId) => {
                await deleteStaff(staffId).unwrap();
                refetch();
            },
            {
                successMessage: "Staff deleted successfully",
                errorMessage: "Failed to delete staff",
            }
        );
    };

    const totalPages = responseData?.meta?.totalPage || 1;

    // const formatDate = (dateString?: string) => {
    //     if (!dateString) return 'N/A';
    //     const date = new Date(dateString);
    //     return date.toLocaleDateString('en-US', {
    //         year: 'numeric',
    //         month: 'short',
    //         day: 'numeric',
    //     });
    // };

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: Staff, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'name',
            header: 'Name',
            render: (row: Staff) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        src={row.avatar}
                        sx={{ width: 36, height: 36 }}
                    >
                        {row.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">{row.name}</Typography>
                </Box>
            )
        },
        {
            key: 'phone',
            header: 'Phone',
            render: (row: Staff) => row.phone
        },
        {
            key: 'designation',
            header: 'Designation',
            render: (row: Staff) => row.designation
        },
        {
            key: 'email',
            header: 'Email',
            render: (row: Staff) => row.email || 'N/A'
        },
        {
            key: 'gender',
            header: 'Gender',
            render: (row: Staff) => row.gender || 'N/A'
        },
        {
            key: 'createdAt',
            header: 'Created On',
            render: (row: Staff) => {
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
            render: (row: Staff) => (
                <div className="flex space-x-2 items-center">
                    <IconButton onClick={() => handleOpenEditStaffModal(row)}>
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
                    title="Staff Management"
                    buttonText="Add Staff"
                    buttonIcon={<Plus size={20} />}
                    onButtonClick={handleOpenAddStaffModal}
                />

                <Box sx={{ mb: 2 }}>
                    <SearchingInputField
                        placeholder="Search staff..."
                        onSearch={(term) => {
                            setSearchTerm(term);
                            setPage(0);
                        }}
                        debounceTime={300}
                        maxWidth={400}
                        height="36px"
                    />
                </Box>

                {/* Add/Edit Staff Modal */}
                <AnimatePresence>
                    {addStaffModalOpen && (
                        <Modal
                            open={addStaffModalOpen}
                            onClose={handleCloseAddStaffModal}
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
                                    width: '600px',
                                    maxWidth: '95%',
                                    maxHeight: '90vh',
                                    overflowY: 'auto',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: `
                                        linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,252,251,0.98)),
                                        radial-gradient(circle at top left, rgba(26,60,52,0.03), transparent 60%)
                                    `,
                                }}
                            >

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
                                        {currentStaff ? "Edit Staff" : "Add Staff"}
                                    </Typography>
                                </Box>

                                {/* Avatar Upload Section */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                                        {/* Avatar Preview */}
                                        <Box sx={{ position: 'relative' }}>
                                            <Avatar
                                                src={preview || undefined}
                                                sx={{ width: 80, height: 80 }}
                                            >
                                                {formData.name?.charAt(0) || <User size={40} />}
                                            </Avatar>
                                            {preview && (
                                                <IconButton
                                                    onClick={() => {
                                                        setPreview(null);
                                                        setUploadedImage(undefined);
                                                        setFormData(prev => ({ ...prev, avatar: '' }));
                                                    }}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -8,
                                                        right: -8,
                                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                                        color: 'white',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(0,0,0,0.7)',
                                                        }
                                                    }}
                                                >
                                                    <X size={16} />
                                                </IconButton>
                                            )}
                                        </Box>

                                        {/* Upload Button */}
                                        <Box>
                                            <input
                                                accept="image/*"
                                                id="avatar-upload"
                                                type="file"
                                                onChange={handleImageUpload}
                                                style={{ display: 'none' }}
                                            />
                                            <label htmlFor="avatar-upload">
                                                <Button
                                                    variant="outlined"
                                                    component="span"
                                                    startIcon={<ImageIcon size={18} />}
                                                    sx={{
                                                        borderColor: 'rgba(26,60,52,0.3)',
                                                        color: '#1A3C34',
                                                        '&:hover': {
                                                            borderColor: '#1A3C34',
                                                            backgroundColor: 'rgba(26, 60, 52, 0.04)',
                                                        },
                                                    }}
                                                >
                                                    Upload Photo
                                                </Button>
                                            </label>
                                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                                                Recommended size: 500x500px
                                            </Typography>
                                        </Box>
                                    </Box>
                                </motion.div>

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
                                                    Name
                                                    {/* {theStar} */}
                                                </>
                                            }
                                            name="name"
                                            value={formData.name}
                                            onChange={handleFormChange}
                                            required
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

                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15 }}
                                            style={{ flex: 1 }}
                                        >
                                           <TextField
  fullWidth
  label={
    <>
      Phone
      {/* {theStar} */}
    </>
  }
  name="phone"
  value={formData.phone}
  onChange={(e) => {
    // Only allow digits and limit to 11 characters
    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
    setFormData(prev => ({ ...prev, phone: value }));
  }}
  inputProps={{
    maxLength: 11,
    inputMode: 'numeric',
    pattern: '[0-9]*'
  }}
  required
  error={formData.phone ? formData.phone.length !== 11 : false}
  helperText={formData.phone && formData.phone.length !== 11 ? "Phone number must be exactly 11 digits" : ""}
/>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            style={{ flex: 1 }}
                                        >
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleFormChange}
                                            />
                                        </motion.div>
                                    </Box>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        <FormControl fullWidth>
                                            <InputLabel>Designation {theStar}</InputLabel>
                                            <Select
                                                value={formData.designation || ''}
                                                onChange={(e) => handleSelectChange('designation', e.target.value)}
                                                label="Designation"
                                                required
                                            >
                                                {designations.map((designation) => (
                                                    <MenuItem key={designation.id} value={designation.name}>
                                                        {designation.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </motion.div>

                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            style={{ flex: 1 }}
                                        >
                                            <FormControl fullWidth>
                                                <InputLabel>Gender</InputLabel>
                                                <Select
                                                    value={formData.gender || ''}
                                                    onChange={(e) => handleSelectChange('gender', e.target.value)}
                                                    label="Gender"
                                                >
                                                    <MenuItem value="Male">Male</MenuItem>
                                                    <MenuItem value="Female">Female</MenuItem>
                                                    <MenuItem value="Other">Other</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.35 }}
                                            style={{ flex: 1 }}
                                        >
                                            <FormControl fullWidth>
                                                <InputLabel>Religion</InputLabel>
                                                <Select
                                                    value={formData.religion || ''}
                                                    onChange={(e) => handleSelectChange('religion', e.target.value)}
                                                    label="Religion"
                                                >
                                                    <MenuItem value="Islam">Islam</MenuItem>
                                                    <MenuItem value="Hindu">Hindu</MenuItem>
                                                    <MenuItem value="Christian">Christian</MenuItem>
                                                    <MenuItem value="Other">Other</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </motion.div>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            style={{ flex: 1 }}
                                        >
                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                <DatePicker
                                                    label="Date of Birth"
                                                    value={formData.dob ? new Date(formData.dob) : null}
                                                    onChange={(newValue) => handleDateChange(newValue as Date | null)}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true
                                                        }
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.45 }}
                                            style={{ flex: 1 }}
                                        >
                                            <FormControl fullWidth>
                                                <InputLabel>Blood Group</InputLabel>
                                                <Select
                                                    value={formData.bloodGroup || ''}
                                                    onChange={(e) => handleSelectChange('bloodGroup', e.target.value)}
                                                    label="Blood Group"
                                                >
                                                    {bloodGroups.map((group) => (
                                                        <MenuItem key={group} value={group}>
                                                            {group}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </motion.div>
                                    </Box>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <TextField
                                            fullWidth
                                            label="NID Number"
                                            name="nid"
                                            value={formData.nid}
                                            onChange={handleFormChange}
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.55 }}
                                    >
                                        <TextField
                                            fullWidth
                                            label="Address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleFormChange}
                                            multiline
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
                                            onClick={handleCloseAddStaffModal}

                                        >
                                            Cancel
                                        </CancelButton>
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <SubmitButton
                                            onClick={handleCreateOrUpdateStaff}
                                            disabled={(isCreatingStaff || isUpdatingStaff || isUploading) || !formData.name || !formData.phone || !formData.designation}

                                        >
                                            {(isCreatingStaff || isUpdatingStaff || isUploading) ? (
                                                <span>{currentStaff ? "Updating..." : "Submitting..."}</span>
                                            ) : (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <span>{currentStaff ? "Update" : "Submit"}</span>

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
                            Failed to load staff
                        </Alert>
                    ) : staffs.length === 0 ? (
                        <Typography
                            variant="body1"
                            color="textSecondary"
                            sx={{ mt: 4, textAlign: "center" }}
                        >
                            No staff found. {searchTerm ? "Try a different search term." : "Create your first staff member."}
                        </Typography>
                    ) : (
                        <>
                            <ReusableTable<Staff>
                                columns={columns}
                                data={staffs}
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
                    onConfirm={() => handleDeleteStaff()}
                    title="Delete Staff"
                    description="Are you sure you want to delete this staff member? All associated data will be permanently removed."
                    isLoading={isDeleting}
                />
            </Box>
        </LocalizationProvider>
    );
};

export default StaffList;