"use client";
import React, { useState } from "react";
import {
    Box,
    Paper,
    // IconButton,
    Modal,
    Button,
    CircularProgress,
    Alert,
    Typography,
} from "@mui/material";
import { Plus } from "lucide-react";
// import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { AnimatePresence } from "framer-motion";
// import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { useDeleteTeacherTimeMutation, useGetAllTeacherTimeQuery } from "@/app/store/api/attendance/attendanceApi";
import EditTeachersTime from "./EditTeacherTime";
import CreateTeacherAttendance from "./CreateTeacherAttendance";


interface ITeacher {
    name: string;
    designation: string;
}

interface ITeacherTime {
    id: number;
    branchId: number;
    teacherId: number;
    inTime: string;
    outTime: string;
    maxDelay: number;
    maxEarly: number;
    createdAt: string;
    updatedAt: string;
    teacher: ITeacher;
    [key: string | number]: unknown;
}

const TeachersAttendance = () => {
    const [addTimeModalOpen, setAddTimeModalOpen] = useState<boolean>(false);
    const [editTimeModalOpen, setEditTimeModalOpen] = useState<boolean>(false);
    // const [className, setClassName] = useState<string>("");
    const [timeForEdit, setTimeForEdit] = useState<ITeacherTime | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");


    const {
        isDeleteModalOpen,
        // itemToDelete,
        isDeleting,
        // openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    // get all teachers time 
    const {
        data: teacherTimes,
        isLoading: isTeacherTimesLoading,
        isError: isTeacherTimesError,
    } = useGetAllTeacherTimeQuery(
        {
            page: page + 1,
            size: rowsPerPage,
            search: searchTerm,
        }
    );
    // delete single teacher time 
    const [deleteTeacherTime] = useDeleteTeacherTimeMutation();

    const totalPages = teacherTimes?.meta?.totalPage || 1;

    // handlers start ************************
    const handleOpenAddTeacherTimeModal = () => {
        setAddTimeModalOpen(true);
    };

    const handleCloseAddTimeModal = () => {
        setAddTimeModalOpen(false);
    };

    // const handleOpenEditTimeModal = (time: ITeacherTime) => {
    //     setTimeForEdit(time);
    //     // setClassName(time?.id);
    //     setEditTimeModalOpen(true);
    // };

    const handleCloseEditTimeModal = () => {
        setEditTimeModalOpen(false);
        // setClassName("");
        setTimeForEdit(null);
    };

    // handle delete single time 
    const handleDeleteTime = async () => {
        handleDeleteConfirmation(
            async (id: number) => {
                await deleteTeacherTime(id).unwrap();
            },
            {
                successMessage: "Teacher time deleted successfully",
                errorMessage: "Failed to delete teacher time",
                onSuccess: () => {
                    console.log("Teacher time deleted");
                },
                onError: (error) => {
                    console.error("Teacher time delete failed:", error);
                },
            }
        )
    };
    // handlers end ************************

    // const columns = [
    //     {
    //         key: "sl",
    //         header: "SL",
    //         render: (row: ITeacherTime, index?: number) => (index !== undefined ? index + 1 : null),
    //     },
    //     {
    //         key: 'teacher.name',
    //         header: 'Name',
    //         render: (row: ITeacherTime) => {
    //             return row?.teacher?.name;
    //         }
    //     },
    //     {
    //         key: 'teacher.designation',
    //         header: 'Designation',
    //         render: (row: ITeacherTime) => {
    //             return row?.teacher?.designation;
    //         }
    //     },
    //     {
    //         key: 'inTime',
    //         header: 'In Time'
    //     },
    //     {
    //         key: 'outTime',
    //         header: 'Out Time'
    //     },
    //     {
    //         key: 'maxDelay',
    //         header: 'Max Delay'
    //     },
    //     {
    //         key: 'maxEarly',
    //         header: 'Max Early',
    //     },
    //     {
    //         key: 'actions',
    //         header: 'Actions',
    //         render: (row: ITeacherTime) => (
    //             <div className="flex space-x-2 items-center">
    //                 <IconButton onClick={() => handleOpenEditTimeModal(row)}>
    //                     <Edit color="#035140" size={18} />
    //                 </IconButton>
    //                 <IconButton
    //                     onClick={(e: React.MouseEvent) => {
    //                         e.stopPropagation();
    //                         openDeleteModal(row.id);
    //                     }}
    //                     disabled={isDeleting && itemToDelete === row.id}
    //                     sx={{
    //                         color: "#DC2626",
    //                         p: 1,
    //                         borderRadius: "8px",
    //                         "&:hover": {
    //                             backgroundColor: "rgba(220, 38, 38, 0.1)",
    //                         },
    //                     }}
    //                 >
    //                     {isDeleting && itemToDelete === row.id ? (
    //                         <span>{buttonLoader}</span>
    //                     ) : (
    //                         <Trash2 size={18} />
    //                     )}
    //                 </IconButton>
    //             </div>
    //         )
    //     }
    // ];

    return (
        <Box>
            <PageHeader
                title="Teacher's Attendance"
            />

            <div className="flex justify-between">

                <Box sx={{ mb: 2 }}>
                    <SearchingInputField
                        placeholder="Search classes..."
                        onSearch={(term) => {
                            setSearchTerm(term);
                            setPage(0);
                        }}
                        debounceTime={300}
                        maxWidth={400}
                        height="36px"
                    />
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={handleOpenAddTeacherTimeModal}
                    className="mb-3 max-h-fit"

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
            <Paper>
                {isTeacherTimesLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : isTeacherTimesError ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        Failed to load teachers time
                    </Alert>
                ) : teacherTimes.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No time found. {searchTerm ? "Try a different search term." : "Create your first time."}
                    </Typography>
                ) : (
                    <>
                        {/* <ReusableTable<ITeacherTime>
                            columns={columns}
                            data={teacherTimes?.data}
                        /> */}
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

            {/* Add Time Modal */}
            <AnimatePresence>
                {addTimeModalOpen && (
                    <Modal
                        open={addTimeModalOpen}
                        onClose={handleCloseAddTimeModal}
                        closeAfterTransition
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        <CreateTeacherAttendance handleCloseAddTimeModal={handleCloseAddTimeModal} />
                    </Modal>
                )}
            </AnimatePresence>

            {/* Edit Time Modal */}
            <AnimatePresence>
                {editTimeModalOpen && (
                    <Modal
                        open={editTimeModalOpen}
                        onClose={handleCloseEditTimeModal}
                        closeAfterTransition
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        <EditTeachersTime handleCloseEditTimeModal={handleCloseEditTimeModal} timeForEdit={timeForEdit} />
                    </Modal>
                )}
            </AnimatePresence>

            {/* delete single time modal */}
            <DeleteConfirmationModal
                open={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={() => handleDeleteTime()}
                title="Delete Time"
                description="Are you sure you want to delete this time? All associated data will be permanently removed."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default TeachersAttendance;