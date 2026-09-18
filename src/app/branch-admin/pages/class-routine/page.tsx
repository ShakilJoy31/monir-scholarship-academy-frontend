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
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import { Plus, Edit, Trash2, X, FilterX } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import { useCreateClassRoutingMutation, useDeleteClassRoutingMutation, useGetAllClassRoutingsQuery, useGetClassRoutingFilterQuery, useUpdateClassRoutingMutation } from "@/app/store/api/classes/classRoutineApi";
// import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { Visibility } from "@mui/icons-material";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import { useGetAllSubjectsQuery } from "@/app/store/api/classes/subjectApi";
import { useGetAllTeachersQuery } from "@/app/store/api/teacher/teacherApi";
import { useGetAllSlotsQuery } from "@/app/store/api/classes/slotApi";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";

interface Routine {
    id: number;
    day: string;
    class: {
        id: number;
        name: string;
    };
    section: {
        id: number;
        name: string;
    };
    stream?: {
        id: number;
        name: string;
    };
    subject: {
        id: number;
        name: string;
    };
    startTime: string;
    endTime: string;
    teacher: {
        id: number;
        name: string;
        image?: string;
    };
    createdAt: string;
    [key: string]: unknown;
}

export interface Subject {
    id: number;
    branchId: number;
    name: string;
    code: string;
    marks: number;
    passMarks: number;
    createdAt: string;
    updatedAt: string;
}

export interface IGroupSubjectItem {
    id: number;
    branchId: number;
    classNameId: number;
    subjectNameId: number;
    createdAt: string;
    updatedAt: string;
    subject: Subject;
}

interface DropdownOption {
    id: number;
    name: string;
    GroupSubject: IGroupSubjectItem[];
}

interface Slot {
    id: number;
    startTime: string;
    endTime: string;
    branchId: number;
    createdAt: string;
    updatedAt: string;
}

interface FilterState {
    session: string;
    className: string;
    section: string;
    stream: string;
    exam: string;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ClassRoutineList = () => {
    const [addRoutineModalOpen, setAddRoutineModalOpen] = useState<boolean>(false);
    const [currentRoutine, setCurrentRoutine] = useState<Routine | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<FilterState>({
        session: "",
        className: "",
        section: "",
        stream: "",
        exam: ""
    });

    // Form state
    const [day, setDay] = useState("");
    const [sessionYearId, setSessionYearId] = useState<number | null>(null);
    const [classNameId, setClassNameId] = useState<number | null>(null);
    const [sectionNameId, setSectionNameId] = useState<number | null>(null);
    const [streamNameId, setStreamNameId] = useState<number | null>(null);
    const [subjectId, setSubjectId] = useState<number | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [teacherId, setTeacherId] = useState<number | null>(null);

    // Dropdown data state
    const [sessions, setSessions] = useState<DropdownOption[]>([]);
    const [classes, setClasses] = useState<DropdownOption[]>([]);
    const [sections, setSections] = useState<DropdownOption[]>([]);
    const [streams, setStreams] = useState<DropdownOption[]>([]);
    const [subjects, setSubjects] = useState<DropdownOption[]>([]);
    const [teachers, setTeachers] = useState<DropdownOption[]>([]);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loadingDropdowns, setLoadingDropdowns] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Choose which query to use based on whether filters are active
    const hasFilters = filters.session || filters.className || filters.section || filters.stream;

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllClassRoutingsQuery({
        page: page + 1,
        size: rowsPerPage,
        search: searchTerm,
    });

    const {
        data: filteredData,
        isLoading: isFilterLoading,
        isError: isFilterError,
        isFetching: isFilterFetching,
    } = useGetClassRoutingFilterQuery({
        page: page + 1,
        size: rowsPerPage,
        sessionYear: filters.session,
        section: filters.section,
        className: filters.className,
        stream: filters.stream,
        search: searchTerm,
    }, { skip: !isSearching });

    const {
        isDeleteModalOpen,
        itemToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    const [createRoutine, { isLoading: isCreatingRoutine }] = useCreateClassRoutingMutation();
    const [updateRoutine, { isLoading: isUpdatingRoutine }] = useUpdateClassRoutingMutation();
    const [deleteRoutine] = useDeleteClassRoutingMutation();

    const dataToUse = hasFilters ? filteredData : responseData;
    const routines: Routine[] = Array.isArray(dataToUse?.data)
        ? dataToUse.data
        : dataToUse?.data || [];

    const totalPages = dataToUse?.meta?.totalPage || 1;

    const { data: classesData } = useGetAllClassQuery({});
    const { data: sessionData } = useGetAllSessionsQuery({});
    const { data: sectionsData } = useGetAllSectionsQuery({});
    const { data: streamsData } = useGetAllStreamsQuery({});
    const { data: subjectsData, } = useGetAllSubjectsQuery({
        page: 1,
        size: 10000
    });
    const { data: teachersData } = useGetAllTeachersQuery({
        page: 1,
        size: 10000
    });
    const { data: slotData,
    } = useGetAllSlotsQuery({
        page: 1,
        size: 10000
    });

    // Fetch dropdown data
    useEffect(() => {
        const fetchDropdownData = async () => {
            setLoadingDropdowns(true);


            try {
                setSessions(sessionData?.data || []);
                setClasses(classesData?.data || []);
                setSections(sectionsData?.data || []);
                setStreams(streamsData?.data || []);
                setSubjects(subjectsData?.data || []);
                setTeachers(teachersData?.data || []);
                setSlots(slotData?.data || []);
            } catch (error) {
                console.error("Error fetching dropdown data:", error);
            } finally {
                setLoadingDropdowns(false);
            }
        };
        fetchDropdownData();
    }, [addRoutineModalOpen, classesData?.data, sectionsData?.data, sessionData?.data, slotData?.data, streamsData?.data, subjectsData?.data, teachersData?.data]);

    const handleOpenAddRoutineModal = () => {
        setCurrentRoutine(null);
        resetForm();
        setAddRoutineModalOpen(true);
    };

    const handleOpenEditRoutineModal = (routine: Routine) => {

        setCurrentRoutine(routine);
        setDay(routine.day);

        // 1. Session - match by ID if available, otherwise by name
        const session = routine.sessionYearId
            ? sessions.find(s => s.id === routine.sessionYearId)
            : sessions.find(s => s.name === routine.sessionYear);

        // 2. Class - match by ID
        const cls = classes.find(c => c.id === routine.class?.id);

        // 3. Section - match by sectionNameId from the routine
        const section = sections.find(s => s.id === routine.sectionNameId);

        // 4. Stream - match by streamNameId from the routine
        const stream = streams.find(s => s.id === routine.streamNameId);

        // 5. Subject - match by subjectNameId from the routine
        const subject = subjects.find(s => s.id === routine.subjectNameId);

        // 6. Teacher - match by ID if available, otherwise by name
        const teacher = routine.teacher?.id
            ? teachers.find(t => t.id === routine.teacher.id)
            : teachers.find(t => t.name === routine.teacher?.name);

        // Set all the state values
        setSessionYearId(session?.id ?? null);
        setClassNameId(cls?.id ?? null);
        setSectionNameId(section?.id ?? null);  // This should now work
        setStreamNameId(stream?.id ?? null);
        setSubjectId(subject?.id ?? null);
        setTeacherId(teacher?.id ?? null);

        // 7. Time slot - more robust matching
        const matchingSlot = slots.find(slot => {
            if (!routine.startTime || !routine.endTime) return false;

            const routineStart = routine.startTime.substring(0, 5);
            const routineEnd = routine.endTime.substring(0, 5);
            const slotStart = slot.startTime.substring(0, 5);
            const slotEnd = slot.endTime.substring(0, 5);

            return slotStart === routineStart && slotEnd === routineEnd;
        });

        setSelectedSlot(matchingSlot?.id ?? null);
        setAddRoutineModalOpen(true);
    };

    const resetForm = () => {
        setDay("");
        setSessionYearId(null);
        setClassNameId(null);
        setSectionNameId(null);
        setStreamNameId(null);
        setSubjectId(null);
        setSelectedSlot(null);
        setTeacherId(null);
    };

    const handleCloseAddRoutineModal = () => {
        setAddRoutineModalOpen(false);
        resetForm();
        setCurrentRoutine(null);
    };

    const handleCreateOrUpdateRoutine = async () => {
        try {
            if (!day || !sessionYearId || !classNameId || !sectionNameId || !streamNameId ||
                !subjectId || !selectedSlot || !teacherId) {
                toastShowing('All fields are required', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            const slot = slots.find(s => s.id === selectedSlot);
            if (!slot) {
                toast.error("Selected slot not found");
                return;
            }

            const routineData = {
                day,
                sessionYearId,
                classNameId,
                sectionNameId,
                streamNameId,
                subjectNameId: subjectId,
                startTime: slot.startTime.substring(0, 10),
                endTime: slot.endTime.substring(0, 10),
                teacherId,
            };

            if (currentRoutine) {
                await updateRoutine({ id: currentRoutine.id, ...routineData }).unwrap();
                toastShowing('Routine updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                await createRoutine(routineData).unwrap();
                toastShowing('Routine created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddRoutineModal();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentRoutine ? "Failed to update routine" : "Failed to create routine")
            );
            console.error("Error saving routine:", err);
        }
    };

    const handleDeleteRoutine = async () => {
        await handleDeleteConfirmation(
            async (routineId) => {
                await deleteRoutine(routineId).unwrap();
                refetch();
            },
            {
                successMessage: "Routine deleted successfully",
                errorMessage: "Failed to delete routine",
            }
        );
    };

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setPage(0); // Reset to first page when filters change
    };

    const handleSearch = async () => {
        try {
            setIsSearching(true);
            setPage(0); // Reset to first page when searching
            await refetch(); // Wait for the API call to complete
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false); // This will run whether the call succeeds or fails
        }
    };

    const resetFilters = () => {
        setFilters({
            session: "",
            className: "",
            section: "",
            stream: "",
            exam: ""
        });
        setSearchTerm("");
        setPage(0);
        setIsSearching(false);
    };

    const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
    const [viewingRoutine, setViewingRoutine] = useState<Routine | null>(null);

    const handleOpenViewModal = (routine: Routine) => {
        setViewingRoutine(routine);
        setViewModalOpen(true);
    };

    const columns = [
        {
            key: "serial",
            header: "SL",
            render: (_row: Routine, index?: number) => index !== undefined ? index + 1 : '',
        },
        {
            key: 'class',
            header: 'Class',
            render: (row: Routine) => row.class?.name || 'N/A'
        },
        {
            key: 'section',
            header: 'Group',
            render: (row: Routine) => row.stream?.name || 'N/A'
        },
        {
            key: 'day',
            header: 'Day'
        },
        {
            key: 'subject',
            header: 'Subject',
            render: (row: Routine) => row.subject?.name || 'N/A'
        },
        {
            key: 'teacher',
            header: 'Teacher',
            render: (row: Routine) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {row.teacher?.image && (
                        <Box
                            component="img"
                            src={row.teacher.image}
                            alt={row.teacher.name}
                            sx={{ width: 32, height: 32, borderRadius: '50%' }}
                        />
                    )}
                    <Typography>{row.teacher?.name || 'N/A'}</Typography>
                </Box>
            )
        },
        {
            key: 'timeSlot',
            header: 'Time',
            render: (row: Routine) => `${row.startTime} - ${row.endTime}`
        },
        {
            key: 'createdAt',
            header: 'Created On',
            render: (row: Routine) => {
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
            render: (row: Routine) => (
                <div className="flex space-x-2 items-center">
                    <Visibility
                        onClick={() => handleOpenViewModal(row)}
                        className="hover:cursor-pointer text-[#035140]"
                    />
                    <IconButton onClick={() => handleOpenEditRoutineModal(row)}>
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
                title="Class Routine Management"
                buttonText="Add Routine"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddRoutineModal}
            />

            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                {/* <SearchingInputField
                    placeholder="Search class routines..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                /> */}

                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    border: 0,
                    flexWrap: 'wrap',
                    width: '100%'
                }}>
                    <FormControl sx={{ flex: 1, minWidth: 180, py: 1 }} size="small">
                        <InputLabel>Session {theStar}</InputLabel>
                        <Select
                            value={filters.session}
                            onChange={(e) => handleFilterChange('session', e.target.value)}
                            label="Session"
                            sx={{ height: 36 }}
                        >
                            <MenuItem value="">All Sessions</MenuItem>
                            {sessions.map((session) => (
                                <MenuItem key={session.id} value={session.name}>
                                    {session.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ flex: 1, minWidth: 180, py: 1 }} size="small">
                        <InputLabel>Class {theStar}</InputLabel>
                        <Select
                            value={filters.className}
                            onChange={(e) => handleFilterChange('className', e.target.value)}
                            label="Class"
                            sx={{ height: 36 }}
                        >
                            <MenuItem value="">All Classes</MenuItem>
                            {classes.map((cls) => (
                                <MenuItem key={cls.id} value={cls.name}>
                                    {cls.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ flex: 1, minWidth: 180, py: 1 }} size="small">
                        <InputLabel>Section {theStar}</InputLabel>
                        <Select
                            value={filters.section}
                            onChange={(e) => handleFilterChange('section', e.target.value)}
                            label="Section"
                            sx={{ height: 36 }}
                        >
                            <MenuItem value="">All Sections</MenuItem>
                            {sections.map((section) => (
                                <MenuItem key={section.id} value={section.name}>
                                    {section.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ flex: 1, minWidth: 180, py: 1 }} size="small">
                        <InputLabel>Stream {theStar}</InputLabel>
                        <Select
                            value={filters.stream}
                            onChange={(e) => handleFilterChange('stream', e.target.value)}
                            label="Stream"
                            sx={{ height: 36 }}
                        >
                            <MenuItem value="">All Streams</MenuItem>
                            {streams.map((stream) => (
                                <MenuItem key={stream.id} value={stream.name}>
                                    {stream.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Search button */}
                <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={isFilterFetching}
                    sx={{
                        backgroundColor: '#1A3C34',
                        color: 'white',
                        height: 36,
                        '&:hover': {
                            backgroundColor: '#0F2922',
                        },
                        '&:disabled': {
                            backgroundColor: 'rgba(26, 60, 52, 0.5)',
                        }
                    }}
                >
                    {isSearching ? <CircularProgress size={24} color="inherit" /> : 'Search'}
                </Button>

                {/* Clear filters button */}
                {(filters.session || filters.className || filters.section || filters.stream || filters.exam) && (
                    <Button
                        variant="text"
                        startIcon={<FilterX size={18} />}
                        onClick={resetFilters}
                        sx={{
                            color: '#DC2626',
                        }}
                    >
                        Clear
                    </Button>
                )}
            </Box>

            {/* Add/Edit Routine Modal */}
            <AnimatePresence>
                {addRoutineModalOpen && (
                    <Modal
                        open={addRoutineModalOpen}
                        onClose={handleCloseAddRoutineModal}
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
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: `
                                    linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,252,251,0.98)),
                                    radial-gradient(circle at top left, rgba(26,60,52,0.03), transparent 60%)
                                `,
                            }}
                        >
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
                                    onClick={handleCloseAddRoutineModal}
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
                                    {currentRoutine ? "Edit Routine" : "Add New Routine"}
                                </Typography>
                            </Box>

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
                                            Day {theStar}
                                        </InputLabel>
                                        <Select
                                            value={day}
                                            onChange={(e) => setDay(e.target.value)}
                                            label="Day"
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
                                            {daysOfWeek.map((day) => (
                                                <MenuItem key={day} value={day}>
                                                    {day}
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
                                    <FormControl fullWidth>
                                        <InputLabel sx={{
                                            color: '#5F7161',
                                            fontWeight: 500,
                                            '&.Mui-focused': {
                                                color: '#1A3C34',
                                            }
                                        }}>
                                            Session Year {theStar}
                                        </InputLabel>
                                        <Select
                                            fullWidth
                                            label="Session Year"
                                            variant="outlined"
                                            value={sessionYearId || ''}
                                            onChange={(e) => setSessionYearId(Number(e.target.value))}
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

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        style={{ flex: 1 }}
                                    >
                                        <FormControl fullWidth>
                                            <InputLabel>Class {theStar}</InputLabel>
                                            <Select
                                                value={classNameId || ''}
                                                onChange={(e) => setClassNameId(Number(e.target.value))}
                                                label="Class"
                                                disabled={loadingDropdowns}
                                            >
                                                {classes.map((cls) => (
                                                    <MenuItem key={cls.id} value={cls.id}>
                                                        {cls.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                        style={{ flex: 1 }}
                                    >
                                        <FormControl fullWidth>
                                            <InputLabel>Section {theStar}</InputLabel>
                                            <Select
                                                value={sectionNameId || ''}
                                                onChange={(e) => setSectionNameId(Number(e.target.value))}
                                                label="Section"
                                                disabled={loadingDropdowns}
                                            >
                                                {sections.map((section) => (
                                                    <MenuItem key={section.id} value={section.id}>
                                                        {section.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        style={{ flex: 1 }}
                                    >
                                        <FormControl fullWidth>
                                            <InputLabel>Stream {theStar}</InputLabel>
                                            <Select
                                                value={streamNameId || ''}
                                                onChange={(e) => setStreamNameId(Number(e.target.value))}
                                                label="Stream"
                                                disabled={loadingDropdowns}
                                            >
                                                {streams.map((stream) => (
                                                    <MenuItem key={stream.id} value={stream.id}>
                                                        {stream.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </motion.div>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                        style={{ flex: 1 }}
                                    >
                                        <FormControl fullWidth>
                                            <InputLabel>Subject {theStar}</InputLabel>
                                            <Select
                                                value={subjectId || ''}
                                                onChange={(e) => setSubjectId(Number(e.target.value))}
                                                label="Subject"
                                                disabled={loadingDropdowns || !classNameId}
                                            >
                                                {classes?.find(cls => cls.id === classNameId)?.GroupSubject?.map((subject) => (
                                                    <MenuItem key={subject?.subject?.id} value={subject?.subject?.id}>
                                                        {subject?.subject?.name}
                                                    </MenuItem>
                                                ))}
                                                {/* {subjects.map((subject) => (
                                                    <MenuItem key={subject.id} value={subject.id}>
                                                        {subject.name}
                                                    </MenuItem>
                                                ))} */}
                                            </Select>
                                        </FormControl>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        style={{ flex: 1 }}
                                    >
                                        <FormControl fullWidth>
                                            <InputLabel>Teacher {theStar}</InputLabel>
                                            <Select
                                                value={teacherId || ''}
                                                onChange={(e) => setTeacherId(Number(e.target.value))}
                                                label="Teacher"
                                                disabled={loadingDropdowns}
                                            >
                                                {teachers.map((teacher) => (
                                                    <MenuItem key={teacher.id} value={teacher.id}>
                                                        {teacher.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </motion.div>
                                </Box>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.45 }}
                                >
                                    <FormControl fullWidth>
                                        <InputLabel>Time Slot {theStar}</InputLabel>
                                        <Select
                                            value={selectedSlot || ''}
                                            onChange={(e) => setSelectedSlot(Number(e.target.value))}
                                            label="Time Slot"
                                            disabled={loadingDropdowns}
                                        >
                                            {slots.map((slot) => (
                                                <MenuItem key={slot.id} value={slot.id}>
                                                    {`${slot.startTime.substring(0, 10)} - ${slot.endTime.substring(0, 10)}`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </motion.div>
                            </Box>

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
                                        onClick={handleCloseAddRoutineModal}

                                    >
                                        Cancel
                                    </CancelButton>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <SubmitButton
                                        onClick={handleCreateOrUpdateRoutine}
                                        disabled={(isCreatingRoutine || isUpdatingRoutine || loadingDropdowns) ||
                                            !day || !sessionYearId || !classNameId || !sectionNameId ||
                                            !streamNameId || !subjectId || !selectedSlot || !teacherId}
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
                                        {(isCreatingRoutine || isUpdatingRoutine) ? (
                                            <span>{currentRoutine ? "Updating..." : "Submitting..."}</span>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{currentRoutine ? "Update" : "Submit"}</span>

                                            </Box>
                                        )}
                                    </SubmitButton>
                                </motion.div>
                            </Box>
                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>


            {/* View Routine Modal */}
            <AnimatePresence>
                {viewModalOpen && viewingRoutine && (
                    <Modal
                        open={viewModalOpen}
                        onClose={() => setViewModalOpen(false)}
                        closeAfterTransition
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300,
                                duration: 0.3,
                            }}
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                position: "relative",
                                padding: "2rem",
                                borderRadius: "6px",
                                outline: "none",
                                width: "400px",
                                maxWidth: "75%",
                                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
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
                                    position: "absolute",
                                    top: "-12px",
                                    right: "-12px",
                                    zIndex: 1,
                                }}
                            >
                                <IconButton
                                    onClick={() => setViewModalOpen(false)}
                                    sx={{
                                        backgroundColor: "#1A3C34",
                                        color: "white",
                                        boxShadow: "0 4px 12px rgba(26, 60, 52, 0.2)",
                                        "&:hover": {
                                            backgroundColor: "#0F2922",
                                        },
                                    }}
                                >
                                    <X size={18} />
                                </IconButton>
                            </motion.div>

                            {/* Header with decorative accent */}
                            <Box sx={{ position: "relative", mb: 3 }}>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 600,
                                        color: "#1A3C34",
                                        position: "relative",
                                        display: "inline-block",
                                        "&:after": {
                                            content: '""',
                                            position: "absolute",
                                            bottom: "-8px",
                                            left: 0,
                                            width: "48px",
                                            height: "4px",
                                            background:
                                                "linear-gradient(90deg, #1A3C34, rgba(26,60,52,0.3))",
                                            borderRadius: "2px",
                                        },
                                    }}
                                >
                                    Routine Details
                                </Typography>
                            </Box>

                            {/* Routine details - styled exactly like the example */}
                            <Box sx={{ display: "grid", gap: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="body1" color="textSecondary">
                                        Day:
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {viewingRoutine.day || "N/A"}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="body1" color="textSecondary">
                                        Class:
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {viewingRoutine.class?.name || "N/A"}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="body1" color="textSecondary">
                                        Subject:
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {viewingRoutine.subject?.name || "N/A"}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="body1" color="textSecondary">
                                        Time Slot:
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {`${viewingRoutine.startTime || "N/A"} - ${viewingRoutine.endTime || "N/A"}`}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body1" color="textSecondary">
                                        Teacher:
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        {viewingRoutine.teacher?.image && (
                                            <Box
                                                component="img"
                                                src={viewingRoutine.teacher.image}
                                                alt={viewingRoutine.teacher.name}
                                                sx={{ width: 24, height: 24, borderRadius: "50%" }}
                                            />
                                        )}
                                        <Typography variant="body1" fontWeight={500}>
                                            {viewingRoutine.teacher?.name || "N/A"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Close button */}
                            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                                <CancelButton
                                    onClick={() => setViewModalOpen(false)}
                                    sx={{
                                        backgroundColor: "#1A3C34",
                                        borderRadius: "6px",
                                        px: 3,
                                        py: 1,
                                        fontWeight: 500,
                                        boxShadow: "0 4px 16px rgba(26, 60, 52, 0.3)",
                                        "&:hover": {
                                            backgroundColor: "#0F2922",
                                            boxShadow: "0 6px 20px rgba(26, 60, 52, 0.4)",
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
                {(isLoading || (hasFilters && isFilterLoading)) ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : isError || (hasFilters && isFilterError) ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        Failed to load routines | If you use filter select all fields for filtering.
                    </Alert>
                ) : routines.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No routines found. {searchTerm || hasFilters ? "Try different search or filter criteria." : "Add your first routine."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<Routine>
                            columns={columns}
                            data={routines}
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
                onConfirm={() => handleDeleteRoutine()}
                title="Delete Routine"
                description="Are you sure you want to delete this routine? This action cannot be undone."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default ClassRoutineList;