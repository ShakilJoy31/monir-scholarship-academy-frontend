"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Button,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    IconButton,
    Modal,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Tooltip,
    TextField,
    Autocomplete,
} from "@mui/material";
import { Plus, X } from "lucide-react";
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
    useCreateHostelResidentMutation,
    useDeleteHostelResidentMutation,
    useExitHostelResidentMutation,
    useGetAllHostelResidentsQuery,
    useGetHostelResidentByIdQuery,
    useUpdateHostelResidentMutation
} from "@/app/store/api/classes/hostelResidentApi";
import { useGetAllHostelsQuery } from "@/app/store/api/classes/hostelApi";
import { useGetAllHostelRoomsQuery } from "@/app/store/api/classes/hostelRoomApi";
import { useGetAllHostelBedsQuery } from "@/app/store/api/classes/hostelBedApi";
import { useGetStudentByUniqueIdQuery, useGetStudentByIdQuery } from "@/app/store/api/student/studentApi";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { theStar } from "@/lib/requiredJSX";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface HostelResident {
    id: number;
    studentId: number;
    hostelId: number;
    roomId: number;
    bedId: number;
    isActive: boolean;
    entryDate: string;
    createdAt: string;
    updatedAt: string;
    student?: {
        id: number;
        name: string;
        studentUniqueId: string;
        classRoll?: string;
        class?: {
            name: string;
        };
        session?: {
            name: string;
        };
        section?: {
            name: string;
        };
        stream?: {
            name: string;
        };
    };
    hostel?: {
        name: string;
    };
    room?: {
        roomNumber: string;
    };
    bed?: {
        bedNumber: string;
    };
    [key: string]: unknown;
}

interface Student {
    id: number;
    name: string;
    classRoll: string;
    studentUniqueId: string;
    class?: {
        name: string;
    };
    session?: {
        name: string;
    };
    section?: {
        name: string;
    };
    stream?: {
        name: string;
    };
    [key: string]: unknown;
}

interface Hostel {
    id: number;
    name: string;
    [key: string]: unknown;
}

interface HostelRoom {
    id: number;
    hostelId: number;
    roomNumber: string;
    [key: string]: unknown;
}

interface HostelBed {
    id: number;
    roomId: number;
    bedNumber: string;
    isOccupied: boolean;
    [key: string]: unknown;
}

const HostelResidentList = () => {
    const [addHostelResidentModalOpen, setAddHostelResidentModalOpen] = useState<boolean>(false);
    const [viewHostelResidentModalOpen, setViewHostelResidentModalOpen] = useState<boolean>(false);
    const [currentHostelResident, setCurrentHostelResident] = useState<HostelResident | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [, setStudentsData] = useState<Record<number, Student>>({});
    const [uniqueId, setUniqueId] = useState("");
    const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        studentId: "",
        hostelId: "",
        roomId: "",
        bedId: "",
        entryDate: new Date().toISOString().split('T')[0],
    });

    // Fetch student by unique ID
    const { data: studentResponseByUniqueId, isLoading: uniqueStudentLoading } =
        useGetStudentByUniqueIdQuery({ uniqueId }, { skip: !uniqueId });

    // Fetch student by ID (for edit mode)
    const { data: studentByIdResponse, isLoading: studentByIdLoading } =
        useGetStudentByIdQuery(currentHostelResident?.studentId || 0, {
            skip: !currentHostelResident?.studentId || !addHostelResidentModalOpen
        });

    // Fetch all necessary data
    const {
        data: hostelResidentsResponse,
        isLoading,
        isError,
        refetch,
    } = useGetAllHostelResidentsQuery({
        page: page + 1,
        size: rowsPerPage,
        search: searchTerm,
    });

    const { data: hostelsResponse } = useGetAllHostelsQuery({
        page: 1,
        size: 10000,
    });

    const { data: hostelRoomsResponse } = useGetAllHostelRoomsQuery({
        page: 1,
        size: 10000,
        hostelId: selectedHostelId || undefined,
    });

    const { data: hostelBedsResponse } = useGetAllHostelBedsQuery({
        page: 1,
        size: 10000,
        roomId: selectedRoomId || undefined,
    });

    const { data: hostelResidentDetails } = useGetHostelResidentByIdQuery(currentHostelResident?.id || 0, {
        skip: !currentHostelResident?.id,
    });

    const id = hostelResidentDetails?.data?.studentId;
    const { data: singleStudents } = useGetStudentByIdQuery(id, { skip: !id });

    const {
        isDeleteModalOpen,
        itemToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    const [createHostelResident,] = useCreateHostelResidentMutation();
    const [updateHostelResident,] = useUpdateHostelResidentMutation();
    const [deleteHostelResident] = useDeleteHostelResidentMutation();
    const [exitHostelResident] = useExitHostelResidentMutation();

    const totalPages = hostelResidentsResponse?.meta?.totalPage || 1;
    const hostelResidents: HostelResident[] = useMemo(() => Array.isArray(hostelResidentsResponse?.data) ? hostelResidentsResponse.data : hostelResidentsResponse?.data || [], [hostelResidentsResponse]);
    const hostels: Hostel[] = hostelsResponse?.data || [];
    const hostelRooms: HostelRoom[] = hostelRoomsResponse?.data || [];
    const hostelBeds: HostelBed[] = hostelBedsResponse?.data || [];

    // Fetch student data for each hostel resident
    useEffect(() => {
        if (hostelResidents.length > 0) {
            const newStudentsData: Record<number, Student> = {};
            hostelResidents.forEach(resident => {
                if (resident.student) {
                    newStudentsData[resident.studentId] = {
                        ...resident.student,
                        classRoll: resident.student.classRoll ?? "",
                    };
                }
            });
            setStudentsData(newStudentsData);
        }
    }, [hostelResidents]);

    // Set current student when editing
    useEffect(() => {
        if (studentByIdResponse?.data) {
            setCurrentStudent(studentByIdResponse.data);
            setUniqueId(studentByIdResponse.data.studentUniqueId);
        }
    }, [studentByIdResponse]);

    // Set student ID when student is selected (for both add and edit)
    useEffect(() => {
        if (studentResponseByUniqueId?.data) {
            setCurrentStudent(studentResponseByUniqueId.data);
            setFormData(prev => ({
                ...prev,
                studentId: studentResponseByUniqueId.data.id.toString()
            }));
        }
    }, [studentResponseByUniqueId]);

    // Modal handlers
    const handleOpenAddHostelResidentModal = () => {
        setCurrentHostelResident(null);
        setFormData({
            studentId: "",
            hostelId: "",
            roomId: "",
            bedId: "",
            entryDate: new Date().toISOString().split('T')[0],
        });
        setSelectedHostelId(null);
        setSelectedRoomId(null);
        setUniqueId("");
        setCurrentStudent(null);
        setAddHostelResidentModalOpen(true);
    };

    const handleOpenEditHostelResidentModal = (hostelResident: HostelResident) => {
        setCurrentHostelResident(hostelResident);
        setFormData({
            studentId: hostelResident.studentId.toString(),
            hostelId: hostelResident.hostelId.toString(),
            roomId: hostelResident.roomId.toString(),
            bedId: hostelResident.bedId.toString(),
            entryDate: hostelResident.entryDate,
        });
        setSelectedHostelId(hostelResident.hostelId);
        setSelectedRoomId(hostelResident.roomId);

        // Set the unique ID for the student if it exists
        if (hostelResident.student) {
            setUniqueId(hostelResident.student.studentUniqueId);
        }

        setAddHostelResidentModalOpen(true);
    };

    const handleOpenViewHostelResidentModal = async (hostelResident: HostelResident) => {
        setCurrentHostelResident(hostelResident);
        setViewHostelResidentModalOpen(true);
    };

    const handleCloseAddHostelResidentModal = () => {
        setAddHostelResidentModalOpen(false);
        setCurrentHostelResident(null);
        setUniqueId("");
        setCurrentStudent(null);
    };

    const handleCloseViewHostelResidentModal = () => {
        setViewHostelResidentModalOpen(false);
        setCurrentHostelResident(null);
    };

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;

        if (name === 'hostelId') {
            setSelectedHostelId(Number(value));
            setSelectedRoomId(null);
            setFormData(prev => ({
                ...prev,
                hostelId: value,
                roomId: "",
                bedId: ""
            }));
        } else if (name === 'roomId') {
            setSelectedRoomId(Number(value));
            setFormData(prev => ({
                ...prev,
                roomId: value,
                bedId: ""
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCreateOrUpdateHostelResident = async () => {
        try {
            // Validate required fields
            if (!formData.studentId || !formData.hostelId || !formData.roomId || !formData.bedId || !formData.entryDate) {
                toastShowing('All fields are required', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            const hostelResidentData = {
                studentId: Number(formData.studentId),
                hostelId: Number(formData.hostelId),
                roomId: Number(formData.roomId),
                bedId: Number(formData.bedId),
                entryDate: formData.entryDate,
            };

            if (currentHostelResident) {
                // Update existing hostel resident
                await updateHostelResident({ id: currentHostelResident.id, ...hostelResidentData }).unwrap();
                toastShowing('Hostel resident updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new hostel resident
                await createHostelResident(hostelResidentData).unwrap();
                toastShowing('Hostel resident created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddHostelResidentModal();
        } catch (err) {
            toastShowing((err as { data?: { message?: string } })?.data?.message ||
                (currentHostelResident ? "Failed to update hostel resident" : "Failed to create hostel resident"), 'bottom-right', 2000, 'red', 'white');
            console.error("Error saving hostel resident:", err);
        }
    };

    const handleExitHostelResident = async (id) => {
        try {

            await exitHostelResident(id).unwrap();
            toastShowing('Hostel resident exit successfully', 'bottom-right', 2000, 'green', 'white');

            refetch();
        } catch (err) {
            toastShowing((err as { data?: { message?: string } })?.data?.message ||
                ("Failed to exit hostel resident"), 'bottom-right', 2000, 'red', 'white');
            console.error("Error exit hostel resident:", err);
        }
    };

    const handleDeleteHostelResident = async () => {
        await handleDeleteConfirmation(
            async (hostelResidentId) => {
                await deleteHostelResident(hostelResidentId).unwrap();
                refetch();
            },
            {
                successMessage: "Hostel resident deleted successfully",
                errorMessage: "Failed to delete hostel resident",
            }
        );
    };

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: HostelResident, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'student',
            header: 'Student',
            render: (row: HostelResident) => {
                const student = row.student;
                return (
                    <Box>
                        <Typography variant="body2">{student?.name || ''}</Typography>
                        <Typography variant="body2" color="textSecondary">
                            Roll: {student?.classRoll || ''}
                        </Typography>
                    </Box>
                );
            }
        },
        {
            key: 'hostel',
            header: 'Hostel',
            render: (row: HostelResident) => (
                <Typography variant="body2">{row.hostel?.name || buttonLoader}</Typography>
            )
        },
        {
            key: 'room',
            header: 'Room',
            render: (row: HostelResident) => (
                <Typography variant="body2">Room {row.room?.roomNumber || 'N/A'}</Typography>
            )
        },
        {
            key: 'bed',
            header: 'Bed',
            render: (row: HostelResident) => (
                <Typography variant="body2">Bed {row.bed?.bedNumber || 'N/A'}</Typography>
            )
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (row: HostelResident) => (
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: row.isActive ? 'error.light' : 'success.light',
                        color: row.isOccupied ? 'error.contrastText' : 'success.contrastText',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                    }}
                >
                    {row.isActive ? 'Occupied' : 'Available'}
                </Box>
            )
        },
        {
            key: 'entryDate',
            header: 'Entry Date',
            render: (row: HostelResident) => {
                const date = new Date(row.entryDate);
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
            render: (row: HostelResident) => {
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
                                        handleOpenViewHostelResidentModal(row);
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

                                {
                                    row.isActive &&
                                    <Button
                                        onClick={() => handleExitHostelResident(row?.id)}
                                        size="small"
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
                                        Exit
                                    </Button>
                                }

                                <Button
                                    onClick={() => {
                                        handleOpenEditHostelResidentModal(row);
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
                title="Hostel Resident Management"
                buttonText="Add Resident"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddHostelResidentModal}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search residents..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            {/* Add/Edit Hostel Resident Modal */}
            <AnimatePresence>
                {addHostelResidentModalOpen && (
                    <Modal
                        open={addHostelResidentModalOpen}
                        onClose={handleCloseAddHostelResidentModal}
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
                                    onClick={handleCloseAddHostelResidentModal}
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
                                    {currentHostelResident ? "Edit Hostel Resident" : "Add Hostel Resident"}
                                </Typography>
                            </Box>

                            {/* Form fields */}
                            <Box sx={{
                                display: 'grid',
                                gap: 2,
                                maxHeight: '70vh',
                                overflowY: 'auto',
                                pr: 1,
                                '&::-webkit-scrollbar': {
                                    display: 'none'
                                },
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                            }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                >
                                    <Typography variant="body1" component="label">
                                        Select Student {theStar}
                                    </Typography>

                                    <Autocomplete
                                        id="student-autocomplete"
                                        options={currentStudent ? [currentStudent] : studentResponseByUniqueId?.data ? [studentResponseByUniqueId.data] : []}
                                        getOptionLabel={(student: Student) =>
                                            `${student.name} - Roll: ${student.classRoll} (${student.studentUniqueId})`
                                        }
                                        value={
                                            currentStudent ||
                                            (studentResponseByUniqueId?.data && formData.studentId === studentResponseByUniqueId.data.id.toString()
                                                ? studentResponseByUniqueId.data
                                                : null)
                                        }
                                        onChange={(_, newValue) => {
                                            if (newValue) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    studentId: newValue.id.toString()
                                                }));
                                                setCurrentStudent(newValue);
                                            } else {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    studentId: ""
                                                }));
                                                setCurrentStudent(null);
                                                setUniqueId("");
                                            }
                                        }}
                                        onInputChange={(_, newInputValue) => {
                                            setUniqueId(newInputValue);
                                        }}
                                        loading={uniqueStudentLoading || studentByIdLoading}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={<>Student Unique ID {theStar}</>}
                                                placeholder="Enter student unique ID (e.g., STU-00001)"
                                                value={uniqueId}
                                                sx={{
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
                                                }}
                                            />
                                        )}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        filterOptions={(options) => options}
                                        clearOnBlur={false}
                                        fullWidth
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <FormControl fullWidth>
                                        <InputLabel>Hostel {theStar}</InputLabel>
                                        <Select
                                            name="hostelId"
                                            value={formData.hostelId}
                                            onChange={handleSelectChange}
                                            label="Hostel"
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
                                    transition={{ delay: 0.2 }}
                                >
                                    <FormControl fullWidth>
                                        <InputLabel>Room {theStar}</InputLabel>
                                        <Select
                                            name="roomId"
                                            value={formData.roomId}
                                            onChange={handleSelectChange}
                                            label="Room"
                                            disabled={!formData.hostelId}
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
                                            {hostelRooms.map((room: HostelRoom) => (
                                                <MenuItem key={room.id} value={room.id}>
                                                    Room: {room.roomNumber}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                >
                                    <FormControl fullWidth>
                                        <InputLabel className="flex items-center">Bed {theStar}</InputLabel>
                                        <Select
                                            name="bedId"
                                            value={formData.bedId}
                                            onChange={handleSelectChange}
                                            label="Bed"
                                            disabled={!formData.roomId}
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
                                            {hostelBeds.map((bed: HostelBed) => (
                                                <MenuItem key={bed.id} value={bed.id} disabled={bed.isOccupied}>
                                                    Bed {bed.bedNumber} {bed.isOccupied ? '(Occupied)' : ''}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label={
                                                <>
                                                    Entry Date
                                                    {theStar}
                                                </>
                                            }
                                            value={dayjs(formData.entryDate)}
                                            onChange={(newValue) => {
                                                if (newValue) {
                                                    const dayjsValue = dayjs(newValue);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        entryDate: dayjsValue.format('YYYY-MM-DD')
                                                    }));
                                                }
                                            }}
                                            sx={{
                                                width: '100%',
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
                                    </LocalizationProvider>
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
                                        onClick={handleCloseAddHostelResidentModal}
                                    >Cancel</CancelButton>

                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <SubmitButton
                                        onClick={handleCreateOrUpdateHostelResident}
                                        disabled={!formData.studentId || !formData.hostelId || !formData.roomId || !formData.bedId}
                                    >Submit</SubmitButton>

                                </motion.div>
                            </Box>
                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* View Hostel Resident Modal */}
            <AnimatePresence>
                {viewHostelResidentModalOpen && currentHostelResident && (
                    <Modal
                        open={viewHostelResidentModalOpen}
                        onClose={handleCloseViewHostelResidentModal}
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
                                    onClick={handleCloseViewHostelResidentModal}
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
                                    Hostel Resident Details
                                </Typography>
                            </Box>

                            {/* Hostel resident details */}
                            <Box sx={{
                                display: 'grid',
                                gap: 2,
                                maxHeight: '70vh',
                                overflowY: 'auto',
                                pr: 1,
                                '&::-webkit-scrollbar': {
                                    display: 'none'
                                },
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Student:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {singleStudents?.data?.name || buttonLoader}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Roll:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {singleStudents?.data?.classRoll || buttonLoader}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Class:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {singleStudents?.data?.class?.name || buttonLoader}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Section:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {singleStudents?.data?.section?.name || buttonLoader}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Stream:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {singleStudents?.data?.stream?.name || buttonLoader}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Hostel:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {currentHostelResident.hostel?.name || buttonLoader}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Room:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        Room {currentHostelResident.room?.roomNumber || buttonLoader}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Bed:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        Bed {currentHostelResident.bed?.bedNumber || buttonLoader}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Entry Date:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {new Date(currentHostelResident.entryDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Close button */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    mt: 4,
                                    position: 'relative',
                                }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <CancelButton
                                        onClick={handleCloseViewHostelResidentModal}
                                        sx={{
                                            backgroundColor: '#1A3C34',
                                            color: 'white',
                                            borderRadius: '6px',
                                            px: 3,
                                            py: 1,
                                            textTransform: 'none',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            '&:hover': {
                                                backgroundColor: '#0F2922',
                                            }
                                        }}
                                    >
                                        Close
                                    </CancelButton>
                                </motion.div>
                            </Box>
                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Main content */}
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : isError ? (
                <Alert severity="error">Failed to load hostel residents</Alert>
            ) : (
                <>
                    <ReusableTable
                        columns={columns}
                        data={hostelResidents}
                    />

                    <Box sx={{ mt: 3 }}>
                        <PaginationComponent
                            // count={totalPages}
                            totalPages={totalPages}
                            // page={page}
                            onPageChange={(newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(newRowsPerPage) => {
                                setRowsPerPage(newRowsPerPage);
                                setPage(0);
                            }} currentPage={0} />
                    </Box>
                </>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                open={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteHostelResident} title={"hostel resident"} description={""} isLoading={false}                // isDeleting={isDeleting}
            // itemName="hostel resident"
            />
        </Box>
    );
};

export default HostelResidentList;


