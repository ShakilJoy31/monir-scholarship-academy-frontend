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
    Modal,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from "@mui/material";
import { Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { useCreateClassMutation, useDeleteClassMutation, useGetAllClassQuery, useUpdateClassMutation } from "@/app/store/api/classes/classApi";
import { motion, AnimatePresence } from "framer-motion";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
// import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";

interface Class {
  id: number;
  name: string;
  designation: string;
  totalStudent: number;
  presentBoys: number;
  presentGirls: number;
  absentBoys: number;
  absentGirls: number;
  [key: string]: string | number;
}



const StudentAttendSummery = () => {
    // states start **************************************************
    const [addClassModalOpen, setAddClassModalOpen] = useState<boolean>(false);
    const [className, setClassName] = useState<string>("");
    const [currentClass, setCurrentClass] = useState<Class | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm,] = useState("");
    const [filters, setFilters] = useState({
        sessionYear: "",
        section: "",
        className: "",
        stream: "",
    });
    // states end **************************************************

    const staticClasses: Class[] = [
  {
    id: 1449,
    name: "Play - Day - A",
    designation: "Lecturer",
    totalStudent: 4,
    presentBoys: 0,
    presentGirls: 0,
    absentBoys: 4,
    absentGirls: 0,
  },
  {
    id: 3439,
    name: "Saife Hossain (AMO) - Day - A",
    designation: "COMPUTER LAB OPERATOR",
    totalStudent: 9,
    presentBoys: 0,
    presentGirls: 0,
    absentBoys: 9,
    absentGirls: 0,
  },
];


    // data start **************************************************
    const {
        // data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllClassQuery({
        page: page + 1,
        size: rowsPerPage,
        search: searchTerm,
    });

    const {
        isDeleteModalOpen,
        isDeleting,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    const [createClass,] = useCreateClassMutation();
    const [updateClass,] = useUpdateClassMutation();
    const [deleteClass] = useDeleteClassMutation();

    // const totalPages = responseData?.meta?.totalPage || 1;

    // const classes: Class[] = Array.isArray(responseData?.data)
    //     ? responseData.data
    //     : responseData?.data || [];

     const totalPages = Math.ceil(staticClasses.length / rowsPerPage);
    const classes = staticClasses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    // data end **************************************************

    // handlers start ***********************************************
    const handleOpenAddClassModal = () => {
        setCurrentClass(null);
        setClassName("");
        setAddClassModalOpen(true);
    };

    const handleOpenEditClassModal = (classItem: Class) => {
        setCurrentClass(classItem);
        setClassName(classItem.name);
        setAddClassModalOpen(true);
    };
    console.log(handleOpenEditClassModal)

    const handleCloseAddClassModal = () => {
        setAddClassModalOpen(false);
        setClassName("");
        setCurrentClass(null);
    };

    const handleCreateOrUpdateClass = async () => {
        try {
            if (!className.trim()) {
                toastShowing('Class name cannot be empty', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            if (currentClass) {
                // Update existing class
                await updateClass({ id: currentClass.id, name: className }).unwrap();
                toastShowing('Class updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new class
                await createClass({ name: className }).unwrap();
                toastShowing('Class created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddClassModal();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentClass ? "Failed to update class" : "Failed to create class")
            );
            console.error("Error saving class:", err);
        }
    };

    const handleDeleteClass = async () => {
        await handleDeleteConfirmation(
            async (classId) => {
                await deleteClass(classId).unwrap();
                // toastShowing("Class deleted successfully", 'bottom-right', 2000, 'green', 'white');
                refetch();
            },
            {
                successMessage: "Class deleted successfully",
                errorMessage: "Failed to delete class",
            }
        );
    };

    const handleFilterChange = (e: {
        target: { name: string; value: string };
    }) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    // handlers end ***********************************************

   const columns = [
  {
      key: "sl",
      header: "SL",
      render: (row: Class, index?: number) =>
        index !== undefined ? index + 1 : null,
    },
  {
    key: "classInfo",
    header: "CLASS INFORMATION",
    render: (row: Class) => row.name, // or combine with designation if needed
  },
  {
    key: "totalStudent",
    header: "TOTAL STUDENT",
    render: (row: Class) => row.totalStudent ?? "-", // need to calculate or add in data
  },
  {
    key: "presentBoys",
    header: "BOYS",
    group: "PRESENT", // for grouped header
    render: (row: Class) => row.presentBoys ?? 0,
  },
  {
    key: "presentGirls",
    header: "GIRLS",
    group: "PRESENT",
    render: (row: Class) => row.presentGirls ?? 0,
  },
  {
    key: "presentTotal",
    header: "TOTAL",
    group: "PRESENT",
    render: (row: Class) => (row.presentBoys ?? 0) + (row.presentGirls ?? 0),
  },
  {
    key: "absentBoys",
    header: "BOYS",
    group: "ABSENT",
    render: (row: Class) => row.absentBoys ?? 0,
  },
  {
    key: "absentGirls",
    header: "GIRLS",
    group: "ABSENT",
    render: (row: Class) => row.absentGirls ?? 0,
  },
  {
    key: "absentTotal",
    header: "TOTAL",
    group: "ABSENT",
    render: (row: Class) => (row.absentBoys ?? 0) + (row.absentGirls ?? 0),
  },
];


    return (
        <Box>
            <PageHeader
                title="Student's Daily Reports"
            />

            <div className="flex flex-col-reverse items-end w-full gap-4">

                <Box sx={{ mb: 2 }} className={" w-full"}>
                    {/* <SearchingInputField
                        placeholder="Search classes..."
                        onSearch={(term) => {
                            setSearchTerm(term);
                            setPage(0);
                        }}
                        debounceTime={300}
                        maxWidth={400}
                        height="36px"
                    /> */}
                    <Paper sx={{ p: 0, mb: 0, backgroundColor: "transparent", border: "none", boxShadow: "none" }} >
                        <div className="flex">

                            <div className="flex flex-2/3 gap-4">
                                <FormControl fullWidth size="small">
                                    <InputLabel>Session Year</InputLabel>
                                    <Select
                                        name="sessionYear"
                                        value={filters.sessionYear}
                                        onChange={handleFilterChange}
                                        label="Session Year"
                                    >
                                        <MenuItem value="">All Sessions</MenuItem>
                                        {({ data: [] }?.data)?.map((session) => (
                                            <MenuItem key={session.id} value={session.name}>
                                                {session.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small">
                                    <InputLabel>Select Teacher</InputLabel>
                                    <Select
                                        name="className"
                                        value={filters.className}
                                        onChange={handleFilterChange}
                                        label="Class"
                                    >
                                        <MenuItem value="">All Teacher</MenuItem>
                                        {({ data: [] }?.data)?.map((classItem) => (
                                            <MenuItem key={classItem.id} value={classItem.name}>
                                                {classItem.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <div className="">
                                    <Button
                                        variant="contained"
                                        onClick={() => ""}
                                        className="max-h-fit w-fit"

                                        sx={{
                                            backgroundColor: '#035140',
                                            '&:hover': {
                                                backgroundColor: '#024030',
                                            },
                                        }}
                                    >
                                        {isLoading ? "Searching..." : "Search"}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1/3 flex justify-end">
                                <Button
                                    variant="contained"
                                    startIcon={<Plus size={20} />}
                                    onClick={handleOpenAddClassModal}
                                    className="max-h-fit w-fit"

                                    sx={{
                                        backgroundColor: '#035140',
                                        '&:hover': {
                                            backgroundColor: '#024030',
                                        },
                                    }}
                                >
                                    Add Attendance
                                </Button>
                            </div>
                        </div>
                    </Paper>
                </Box>

            </div>

            {/* Add/Edit Class Modal */}
            <AnimatePresence>
                {addClassModalOpen && (
                    <Modal
                        open={addClassModalOpen}
                        onClose={handleCloseAddClassModal}
                        closeAfterTransition
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                            width: '100%',
                            height: '100%'
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
                                width: '96vw',
                                height: "94vh",
                                // maxWidth: '98%',
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
                                    onClick={handleCloseAddClassModal}
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
                                    {currentClass ? "Edit Class" : "Add New Class"}
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
                                            Class Name {theStar}
                                        </span>
                                    }
                                    variant="outlined"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
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
                                        }
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
                                        onClick={handleCloseAddClassModal}
                                    >Cancel</CancelButton>

                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <SubmitButton onClick={handleCreateOrUpdateClass}
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
                        Failed to load classes
                    </Alert>
                ) : classes.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No classes found. {searchTerm ? "Try a different search term." : "Create your first class."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<Class>
                            columns={columns}
                            data={classes}
                        />
                        <PaginationComponent
                            currentPage={page + 1}
                            totalPages={totalPages}
                            onPageChange={(newPage) => setPage(newPage - 1)} // Convert back to 0-based index
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={setRowsPerPage}
                        />
                    </>
                )}
            </Paper>

            <DeleteConfirmationModal
                open={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={() => handleDeleteClass()}
                title="Delete Class"
                description="Are you sure you want to delete this class? All associated data will be permanently removed."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default StudentAttendSummery;