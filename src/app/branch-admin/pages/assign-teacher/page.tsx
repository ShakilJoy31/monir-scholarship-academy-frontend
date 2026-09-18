"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    IconButton,
    Modal,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { theStar } from "@/lib/requiredJSX";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import { useCreateAssignTeacherMutation, useDeleteAssignTeacherMutation, useGetAllAssignTeachersQuery, useUpdateAssignTeacherMutation } from "@/app/store/api/classes/assignTeacherApi";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllTeachersQuery } from "@/app/store/api/teacher/teacherApi";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface AssignTeacher {
    id: number;
    branchId: number;
    teacherId: number;
    sessionYearId: number;
    classNameId: number;
    sectionNameId: number;
    createdAt: string;
    updatedAt: string;
    teacher: {
        id: number;
        branchId: number;
        name: string;
        teacherUniqueId: string;
        phone: string;
        email: string;
        password: string;
        designation: string;
        nid: string;
        gender: string;
        religion: string;
        dob: string;
        bloodGroup: string;
        address: string;
        universityName: string;
        qualification: string;
        specialistSubject: string;
        universityStartDate: string;
        universityEndDate: string;
        count: number;
        blockDate: string | null;
        active: boolean;
        avatar: string;
        createdAt: string;
        updatedAt: string;
    };
    class: {
        id: number;
        branchId: number;
        name: string;
        createdAt: string;
        updatedAt: string;
    };
    section: {
        id: number;
        branchId: number;
        name: string;
        createdAt: string;
        updatedAt: string;
    };
    session: {
        id: number;
        branchId: number;
        name: string;
        createdAt: string;
        updatedAt: string;
    };
    [key: string]: unknown;
}

interface DropdownOption {
    id: number;
    name: string;
    avatar?: string;
}

const AssignTeacherList = () => {
    const [addAssignTeacherModalOpen, setAddAssignTeacherModalOpen] = useState<boolean>(false);
    const [currentAssignTeacher, setCurrentAssignTeacher] = useState<AssignTeacher | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    // Form state
    const [sessionYearId, setSessionYearId] = useState<number | null>(null);
    const [classNameId, setClassNameId] = useState<number | null>(null);
    const [sectionNameId, setSectionNameId] = useState<number | null>(null);
    const [teacherId, setTeacherId] = useState<number | null>(null);

    // Dropdown data state
    const [sessions, setSessions] = useState<DropdownOption[]>([]);
    const [classes, setClasses] = useState<DropdownOption[]>([]);
    const [sections, setSections] = useState<DropdownOption[]>([]);
    const [teachers, setTeachers] = useState<DropdownOption[]>([]);
    const [loadingDropdowns, setLoadingDropdowns] = useState(false);

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllAssignTeachersQuery({
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

    const [createAssignTeacher, ] = useCreateAssignTeacherMutation();
    const [updateAssignTeacher, ] = useUpdateAssignTeacherMutation();
    const [deleteAssignTeacher] = useDeleteAssignTeacherMutation();

    const { data: allClass } = useGetAllClassQuery({ page: 1, size: 1000 });
    const { data: allSessions } = useGetAllSessionsQuery({ page: 1, size: 1000 });
    const { data: allSections } = useGetAllSectionsQuery({ page: 1, size: 1000 });
    const { data: teachersData } = useGetAllTeachersQuery({ page: 1, size: 1000 });

    const assignTeachers: AssignTeacher[] = Array.isArray(responseData?.data)
        ? responseData.data
        : responseData?.data || [];

    const totalPages = responseData?.meta?.totalPage || 1;

    // Fetch dropdown data
    useEffect(() => {
        const fetchDropdownData = async () => {
            setLoadingDropdowns(true);
            try {
                setSessions(allSessions?.data || []);
                setClasses(allClass?.data || []);
                setSections(allSections?.data || []);
                setTeachers(teachersData?.data || []);
            } catch (error) {
                console.error("Error fetching dropdown data:", error);
            } finally {
                setLoadingDropdowns(false);
            }
        };
        fetchDropdownData();
    }, [allClass, allSections, allSessions, teachersData]);

    const handleOpenAddAssignTeacherModal = () => {
        setCurrentAssignTeacher(null);
        resetForm();
        setAddAssignTeacherModalOpen(true);
    };

    const handleOpenEditAssignTeacherModal = (assignTeacher: AssignTeacher) => {
        setCurrentAssignTeacher(assignTeacher);
        setSessionYearId(assignTeacher.sessionYearId);
        setClassNameId(assignTeacher.classNameId);
        setSectionNameId(assignTeacher.sectionNameId);
        setTeacherId(assignTeacher.teacherId);
        setAddAssignTeacherModalOpen(true);
    };

    const resetForm = () => {
        setSessionYearId(null);
        setClassNameId(null);
        setSectionNameId(null);
        setTeacherId(null);
    };

    const handleCloseAddAssignTeacherModal = () => {
        setAddAssignTeacherModalOpen(false);
        resetForm();
        setCurrentAssignTeacher(null);
    };

    const handleCreateOrUpdateAssignTeacher = async () => {
        try {
            if (!sessionYearId || !classNameId || !sectionNameId || !teacherId) {
                toastShowing('All fields are required', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            const assignTeacherData = {
                sessionYearId,
                classNameId,
                sectionNameId,
                teacherId
            };

            if (currentAssignTeacher) {
                // Update existing assignment
                await updateAssignTeacher({
                    id: currentAssignTeacher.id,
                    ...assignTeacherData
                }).unwrap();
                toastShowing('Assignment updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new assignment
                await createAssignTeacher(assignTeacherData).unwrap();
                toastShowing('Teacher assigned successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddAssignTeacherModal();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentAssignTeacher ? "Failed to update assignment" : "Failed to assign teacher")
            );
            console.error("Error saving assignment:", err);
        }
    };

    const handleDeleteAssignTeacher = async () => {
        await handleDeleteConfirmation(
            async (assignTeacherId) => {
                await deleteAssignTeacher(assignTeacherId).unwrap();
                refetch();
            },
            {
                successMessage: "Assignment deleted successfully",
                errorMessage: "Failed to delete assignment",
            }
        );
    };

   const columns = [
    {
        key: "sl",
        header: "SL",
        render: (row: AssignTeacher, index?: number) => (index !== undefined ? index + 1 : null),
    },
    {
        key: 'class',
        header: 'Class',
        render: (row: AssignTeacher) => row.class?.name || 'N/A'
    },
    {
        key: 'section',
        header: 'Section',
        render: (row: AssignTeacher) => row.section?.name || 'N/A'
    },
    {
        key: 'session',
        header: 'Session Year',
        render: (row: AssignTeacher) => row.session?.name || 'N/A'
    },
    {
        key: 'teacher',
        header: 'Teacher',
        render: (row: AssignTeacher) => {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {row.teacher?.avatar && (
                        <Box
                            component="img"
                            src={row.teacher.avatar}
                            alt={row.teacher.name}
                            sx={{ width: 32, height: 32, borderRadius: '50%' }}
                        />
                    )}
                    <Typography>{row.teacher?.name || 'N/A'}</Typography>
                </Box>
            )
        }
    },
    {
        key: 'createdAt',
        header: 'Assigned On',
        render: (row: AssignTeacher) => {
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
        render: (row: AssignTeacher) => (
            <div className="flex space-x-2 items-center">
                <IconButton onClick={() => handleOpenEditAssignTeacherModal(row)}>
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
                title="Teacher Assignment Management"
                buttonText="Assign Teacher"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddAssignTeacherModal}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search assignments..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            {/* Add/Edit Assign Teacher Modal */}
            <AnimatePresence>
                {addAssignTeacherModalOpen && (
                    <Modal
                        open={addAssignTeacherModalOpen}
                        onClose={handleCloseAddAssignTeacherModal}
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
                                    onClick={handleCloseAddAssignTeacherModal}
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
                                    {currentAssignTeacher ? "Edit Assignment" : "Assign Teacher"}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {/* Session Year */}
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
                                            Session Year {theStar}
                                        </InputLabel>
                                        <Select
                                            value={sessionYearId || ''}
                                            onChange={(e) => setSessionYearId(Number(e.target.value))}
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

                                {/* Class and Section */}
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
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
                                        transition={{ delay: 0.2 }}
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
                                </Box>

                                {/* Teacher */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
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

                            {/* Action buttons */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: 2,
                                    mt: 4,
                                    position: 'relative',
                                    // 
                                }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <CancelButton onClick={handleCloseAddAssignTeacherModal}>
                                        Cancel
                                    </CancelButton>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <SubmitButton onClick={handleCreateOrUpdateAssignTeacher}>
                                        Submit
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
                        Failed to load teacher assignments
                    </Alert>
                ) : assignTeachers.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No teacher assignments found. {searchTerm ? "Try a different search term." : "Create your first assignment."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<AssignTeacher>
                            columns={columns}
                            data={assignTeachers}
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
                onConfirm={() => handleDeleteAssignTeacher()}
                title="Delete Assignment"
                description="Are you sure you want to delete this teacher assignment? This action cannot be undone."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default AssignTeacherList;