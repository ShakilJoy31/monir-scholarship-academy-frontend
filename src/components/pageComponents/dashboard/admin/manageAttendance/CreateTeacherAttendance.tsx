"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Button,
    FormControl,
    CircularProgress,
} from "@mui/material";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import MuiMultiSelect from "@/components/ui/common/muiMultiSelect";
import MuiTimePicker from "@/components/ui/common/MuiTimePicker";
import { useGetAllTeachersQuery } from "@/app/store/api/teacher/teacherApi";
import { Dayjs } from "dayjs";
import { useCreateTeacherAttendanceMutation } from "@/app/store/api/attendance/attendanceApi";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import MuiDatePicker from "@/components/ui/common/MuiDatePicker";
import MuiRadioGroup from "@/components/ui/common/MuiRadioGroup";

type TStatus = "Present" | "Absent" | "Leave";

interface ITeacherTimes {
    id: number;
    name: string;
    designation: string;
    inTime: Dayjs | null;
    outTime: Dayjs | null;
    date: Dayjs | null;
    status: TStatus;
    [key: string]: unknown;
}



const CreateTeacherAttendance = ({ handleCloseAddTimeModal }) => {
    // states start **************************************************
    const [addedTimes, setAddedTimes] = useState<ITeacherTimes[]>([])
    const [filters, setFilters] = useState({
        selectedTeachersIds: [],
        inTime: null,
        outTime: null,
        date: null,
    });
    // states end **************************************************

    // api (redux) start ************************
    const { data: teachersData, isLoading: teachersLoading } = useGetAllTeachersQuery({ page: 1, size: 1000 });
    const [createTeacherAttendance] = useCreateTeacherAttendanceMutation();
    // api (redux) end ************************

    // handlers start ***********************************************
    const hangleDetele = (id) => {
        setAddedTimes((prev) => {
            const updatedData = prev.filter((time) => time.id !== id)
            return updatedData
        })
    }

    const handleAddTime = () => {
        const selectedTeachersIds = filters?.selectedTeachersIds
        const updatedAddedTimes = [...addedTimes]

        selectedTeachersIds.forEach((id) => {
            updatedAddedTimes.push({
                id: id,
                name: teachersData?.data?.find((teacher) => teacher?.id == id)?.name,
                designation: teachersData?.data?.find((teacher) => teacher?.id == id)?.designation,
                inTime: filters?.inTime,
                outTime: filters?.outTime,
                date: filters?.date,
                status: "Present",
            })
        })
        setAddedTimes(updatedAddedTimes)
        setFilters({
            selectedTeachersIds: [],
            inTime: null,
            outTime: null,
            date: null,
        })
    }

    const handleSubmitTeachersTime = async () => {
        const arrayOfItems = addedTimes?.map((item) => ({
            teacherId: item?.id,
            checkIn: item?.inTime?.format("hh:mm A"),
            checkOut: item?.outTime?.format("hh:mm A"),
            date: item?.date,
            status: item?.status,
        }));

        try {
            await createTeacherAttendance({ teacherAttendance: arrayOfItems }).unwrap();
            handleCloseAddTimeModal(true);
            toastShowing(
                "Added teachers attendance successfully",
                "bottom-right",
                2000,
                "green",
                "white"
            );
        } catch (error) {
            console.error("Submission error:", error);

            const errorMessage = (() => {
                if (error instanceof Error) {
                    return error.message;
                }
                if (typeof error === "object" && error !== null && "data" in error) {
                    const errorData = error as { data?: { message?: string } };
                    return errorData.data?.message;
                }
                return "Failed to update teacher";
            })();

            toastShowing(
                errorMessage || "Failed to crate teacher's attendance",
                "bottom-right",
                2000,
                "red",
                "white"
            );
        }
    };
    // handlers end ***********************************************

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: ITeacherTimes, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'name',
            header: 'Name'
        },
        {
            key: 'designation',
            header: 'Designation'
        },
        {
            key: 'inTime',
            header: 'In Time',
            render: (row: ITeacherTimes) => {
                return (
                    < FormControl fullWidth size="small" sx={{ width: "150px" }} >
                        <MuiTimePicker
                            label="In Time"
                            value={row.inTime}
                            onChange={(newValue) => {
                                setAddedTimes((prev) => {
                                    return prev.map((item) =>
                                        item.id === row.id
                                            ? { ...item, inTime: newValue }
                                            : item
                                    );
                                });
                            }}
                            size="small"
                            fullWidth
                            width={"100px"}
                        />
                    </FormControl >
                )
            }
        },
        {
            key: 'outTime',
            header: 'Out Time',
            render: (row: ITeacherTimes) => {
                return (
                    < FormControl fullWidth size="small" className="" sx={{ width: "150px" }}>
                        <MuiTimePicker
                            label="Out Time"
                            value={row.outTime}
                            onChange={(newValue) => {
                                setAddedTimes((prev) => {
                                    return prev.map((item) =>
                                        item.id === row.id
                                            ? { ...item, outTime: newValue }
                                            : item
                                    );
                                });
                            }}
                            size="small"
                            fullWidth
                            width={"100px"}
                        />
                    </FormControl >
                )
            }
        },
        {
            key: 'status',
            header: 'Status',
            render: (row: ITeacherTimes) => {
                console.log("row", row)
                return (
                    <MuiRadioGroup
                        row
                        options={[
                            { label: "Present", value: "Present" },
                            { label: "Absent", value: "Absent" },
                            { label: "Leave", value: "Leave" },
                        ]}
                        value={addedTimes?.find((item) => item?.id === row?.id)?.status}
                        onChange={(newValue) => {
                            setAddedTimes((prev) => {
                                return prev.map((item) =>
                                    item.id === row.id
                                        ? { ...item, status: newValue as TStatus }
                                        : item
                                );
                            });
                        }}
                    />
                )
            }
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: ITeacherTimes) => (
                <div className="flex space-x-2 items-center">
                    <IconButton
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            hangleDetele(row.id);
                        }}
                        // disabled={isDeleting && itemToDelete === row.id}
                        sx={{
                            color: "#DC2626",
                            p: 1,
                            borderRadius: "8px",
                            "&:hover": {
                                backgroundColor: "rgba(220, 38, 38, 0.1)",
                            },
                        }}
                    >
                        <Trash2 size={18} />
                    </IconButton>
                </div>
            )
        }
    ];


    if (teachersLoading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "70vh",
                    width: "100%",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
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
                    maxWidth: "1280px",
                    width: '96vw',
                    maxHeight: "94vh",
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
                        onClick={handleCloseAddTimeModal}
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
                        {"Add Attendance"}
                    </Typography>
                </Box>
                <div className="max-h-[64vh] overflow-scroll scrollbar-hide">
                    <Box>
                        <div className="flex flex-col-reverse items-end w-full gap-4">

                            <Box sx={{ mb: 2 }} className={" w-full"}>
                                <Paper sx={{ p: 0, mb: 0, backgroundColor: "transparent", border: "none", boxShadow: "none" }} >
                                    <div className="flex items-start gap-4">
                                        <div className="flex gap-4 items-start w-[calc(100%-64px)]">
                                            {/* select teachers */}
                                            <FormControl fullWidth size="small" className="flex-1/4">
                                                <MuiMultiSelect
                                                    options={
                                                        teachersData?.data
                                                            ?.filter((teacher) => !addedTimes?.find((item) => item?.id === teacher?.id))
                                                            ?.map((teacher) => ({ id: teacher?.id, label: teacher?.name }))
                                                    }
                                                    label="Select Teachers"
                                                    placeholder="Select Teachers"
                                                    selectedIds={filters?.selectedTeachersIds}
                                                    onChange={(e) => setFilters((prev) => ({ ...prev, selectedTeachersIds: e }))}
                                                    width={"100%"}
                                                />
                                            </FormControl>
                                            {/* Date  */}
                                            <FormControl fullWidth size="small" className="flex-1/4" sx={{ mt: "-8px" }}>
                                                <MuiDatePicker
                                                    label="Select Date"
                                                    value={filters.date}
                                                    onChange={(newValue) =>
                                                        setFilters((prev) => ({ ...prev, date: newValue }))
                                                    }
                                                    size="small"
                                                    fullWidth
                                                />
                                            </FormControl>
                                            {/* In time  */}
                                            <FormControl fullWidth size="small" className="flex-1/4">
                                                <MuiTimePicker
                                                    label="In Time"
                                                    value={filters.inTime}
                                                    onChange={(newValue) =>
                                                        setFilters((prev) => ({ ...prev, inTime: newValue }))
                                                    }
                                                    size="small"
                                                    fullWidth
                                                />
                                            </FormControl>
                                            {/* out time  */}
                                            <FormControl fullWidth size="small" className="flex-1/4">
                                                <MuiTimePicker
                                                    label="Out Time"
                                                    value={filters?.outTime}
                                                    onChange={(newValue) =>
                                                        setFilters((prev) => ({ ...prev, outTime: newValue }))
                                                    }
                                                    size="small"
                                                    fullWidth
                                                />
                                            </FormControl>
                                        </div>
                                        <div className="">
                                            <Button
                                                variant="contained"
                                                onClick={handleAddTime}
                                                className="max-h-fit w-fit"
                                                disabled={
                                                    !filters?.date ||
                                                    !filters?.inTime ||
                                                    !filters?.outTime ||
                                                    !filters?.selectedTeachersIds?.length
                                                }

                                                sx={{
                                                    backgroundColor: '#035140',
                                                    '&:hover': {
                                                        backgroundColor: '#024030',
                                                    },
                                                }}
                                            >
                                                {"Add"}
                                            </Button>
                                        </div>
                                    </div>
                                </Paper>
                            </Box>

                        </div>

                        <Paper>
                            <ReusableTable<ITeacherTimes>
                                columns={columns}
                                data={addedTimes}
                            />
                            {/* <PaginationComponent
                            currentPage={page + 1}
                            totalPages={2}
                            onPageChange={(newPage) => setPage(newPage - 1)} // Convert back to 0-based index
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={setRowsPerPage}
                        /> */}
                        </Paper>
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
                                onClick={handleCloseAddTimeModal}
                            >Cancel</CancelButton>

                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <SubmitButton
                                onClick={handleSubmitTeachersTime}
                                disabled={addedTimes?.length === 0}
                            >
                                Submit
                            </SubmitButton>


                        </motion.div>
                    </Box>
                </div>
            </motion.div>

        </>
    );
};

export default CreateTeacherAttendance;