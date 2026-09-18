"use client";
import React, { useState } from "react";
import {
    Box,
    Paper,
    IconButton,
    Modal,
    Button,
} from "@mui/material";
import { Plus, Edit, Trash2 } from "lucide-react";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { AnimatePresence } from "framer-motion";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import AddTeachersTime from "./AddTeacherTime";
import EditTeachersTime from "./EditTeacherTime";


interface ZKTecoDevice {
    id: number;
    deviceId: number;
    name: string;
    serial: string;
    deviceIp: string;
    port: number;
    deviceType: number;
    status: string;
    deviceTest: string;
    [key: string | number]: unknown;
}

const ZKTecoDevice = () => {
    const [addTimeModalOpen, setAddTimeModalOpen] = useState<boolean>(false);
    const [editTimeModalOpen, setEditTimeModalOpen] = useState<boolean>(false);
    const [timeForEdit, setTimeForEdit] = useState<ZKTecoDevice | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [, setSearchTerm] = useState("");


    const {
        isDeleteModalOpen,
        itemToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    // get all teachers time 


    const totalPages = 1;

    // local data start ************************
    const devices: ZKTecoDevice[] = [
        {
            id: 1,
            deviceId: 1001,
            name: "Main Entrance Device",
            serial: "SN123456789",
            deviceIp: "192.168.1.10",
            port: 4370,
            deviceType: 1,
            status: "online",
            deviceTest: "passed",
            location: "Head Office",
        },
        {
            id: 2,
            deviceId: 1002,
            name: "Back Door Device",
            serial: "SN987654321",
            deviceIp: "192.168.1.11",
            port: 4370,
            deviceType: 2,
            status: "offline",
            deviceTest: "failed",
            lastChecked: "2025-09-24T10:00:00Z",
        },
    ];

    // local data end ************************

    // handlers start ************************
    const handleOpenAddTeacherTimeModal = () => {
        setAddTimeModalOpen(true);
    };

    const handleCloseAddTimeModal = () => {
        setAddTimeModalOpen(false);
    };

    const handleOpenEditTimeModal = (time: ZKTecoDevice) => {
        setTimeForEdit(time);
        // setClassName(time?.id);
        setEditTimeModalOpen(true);
    };

    const handleCloseEditTimeModal = () => {
        setEditTimeModalOpen(false);
        // setClassName("");
        setTimeForEdit(null);
    };

    // handle delete single time 
    const handleDeleteTime = async () => {
        handleDeleteConfirmation(
            async (
                // id: number
            ) => {
                // await deleteTeacherTime(id).unwrap();
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

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: ZKTecoDevice, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'deviceId',
            header: 'Device Id',
            render: (row: ZKTecoDevice) => {
                return row?.deviceId;
            }
        },
        {
            key: 'name',
            header: 'Name',
            render: (row: ZKTecoDevice) => {
                return row?.name;
            }
        },
        {
            key: 'serial',
            header: 'Serial'
        },
        {
            key: 'deviceIp',
            header: 'Device Ip'
        },
        {
            key: 'port',
            header: 'Port'
        },
        {
            key: 'deviceType',
            header: 'Device Type',
        },
        {
            key: 'status',
            header: 'Status',
        },
        {
            key: 'deviceTest',
            header: 'Device Test',
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: ZKTecoDevice) => (
                <div className="flex space-x-2 items-center">
                    <IconButton onClick={() => handleOpenEditTimeModal(row)}>
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
                title="ZKTeco Device"
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
                    Add Device
                </Button>
            </div>
            <Paper>
                <>
                    <ReusableTable<ZKTecoDevice>
                        columns={columns}
                        data={devices}
                    />
                    <PaginationComponent
                        currentPage={page + 1}
                        totalPages={totalPages}
                        onPageChange={(newPage) => setPage(newPage - 1)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={setRowsPerPage}
                    />
                </>
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
                        <AddTeachersTime handleCloseAddTimeModal={handleCloseAddTimeModal} />
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

export default ZKTecoDevice;