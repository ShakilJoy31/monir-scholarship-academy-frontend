"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
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
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import MuiMultiSelect from "@/components/ui/common/muiMultiSelect";
import MuiTextInput from "@/components/ui/common/muiInput";
import { useGetAllTeachersQuery } from "@/app/store/api/teacher/teacherApi";
// import { useCreateTeacherTimeMutation } from "@/app/store/api/attendance/attendanceApi";
// import { toastShowing } from "@/components/shared/reusable-component/toastShowing";

interface TeachersSetup {
    id: number;
    teacherUniqueId: string;
    name: string;
    designation: number;
    phone: string;
    deviceId: number;
    fingerId: number;
    [key: string]: string | number;
}


const StudentSetup = () => {
    // states start **************************************************
    const [addedTimes, setAddedTimes] = useState<TeachersSetup[]>([])
    const [filters, setFilters] = useState({
        selectedTeachersIds: [] as number[],
        deviceId: "" as number | string,
        fingerId: "" as number | string,
    });
    // states end **************************************************

    // api (redux) start ************************
    const { data: teachersData, isLoading: teachersLoading } = useGetAllTeachersQuery({ page: 1, size: 1000 });
    // const [createTeacherTime] = useCreateTeacherTimeMutation();
    // api (redux) end ************************

    // handlers start ***********************************************
    const hangleDetele = (id: number) => {
        setAddedTimes((prev) => prev.filter((time) => time.id !== id))
    }

    const handleAddTime = () => {
        const selectedTeachersIds = filters?.selectedTeachersIds
        const updatedAddedTimes = [...addedTimes]

        selectedTeachersIds.forEach((id) => {
            const teacher = teachersData?.data?.find((t) => t?.id == id)
            if (teacher) {
                updatedAddedTimes.push({
                    id: id,
                    teacherUniqueId: teacher?.teacherUniqueId,
                    name: teacher?.name,
                    designation: teacher?.designation,
                    phone: teacher?.phone,
                    deviceId: Number(filters?.deviceId),
                    fingerId: Number(filters?.fingerId),
                })
            }
        })
        setAddedTimes(updatedAddedTimes)
        setFilters({
            selectedTeachersIds: [],
            deviceId: "",
            fingerId: "",
        })
    }

    const handleSubmitTeachersTime = async () => {
        // const arrayOfItems = addedTimes?.map((item) => ({
        //     teacherId: item?.teacherId,
        //     deviceId: Number(item?.deviceId),
        //     fingerId: Number(item?.fingerId),
        // }));

        // try {
        //     await createTeacherTime({ teachersTime: arrayOfItems }).unwrap();
        //     toastShowing(
        //         "Added teachers setup successfully",
        //         "bottom-right",
        //         2000,
        //         "green",
        //         "white"
        //     );
        // } catch (error) {
        //     console.error("Submission error:", error);

        //     const errorMessage = (() => {
        //         if (error instanceof Error) {
        //             return error.message;
        //         }
        //         if (typeof error === "object" && error !== null && "data" in error) {
        //             const errorData = error as { data?: { message?: string } };
        //             return errorData.data?.message;
        //         }
        //         return "Failed to update teacher";
        //     })();

        //     toastShowing(
        //         errorMessage || "Failed to create teacher setup",
        //         "bottom-right",
        //         2000,
        //         "red",
        //         "white"
        //     );
        // }
    };
    // handlers end ***********************************************

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: TeachersSetup, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'teacherUniqueId',
            header: 'Id No'
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
            key: 'phone',
            header: 'Mobile'
        },
        {
            key: 'deviceId',
            header: 'Device ID',
            render: (row: TeachersSetup) => (
                <FormControl fullWidth size="small">
                    <MuiTextInput
                        name="deviceId"
                        label="Device ID"
                        type="number"
                        value={row.deviceId}
                        onChange={(newValue) => {
                            setAddedTimes((prev) =>
                                prev.map((item) =>
                                    item.id === row.id
                                        ? { ...item, deviceId: Number(newValue?.target?.value) }
                                        : item
                                )
                            );
                        }}
                        placeholder="Enter device ID"
                    />
                </FormControl>
            )
        },
        {
            key: 'fingerId',
            header: 'Finger ID',
            render: (row: TeachersSetup) => (
                <FormControl fullWidth size="small">
                    <MuiTextInput
                        name="fingerId"
                        label="Finger ID"
                        type="number"
                        value={row.fingerId}
                        onChange={(newValue) => {
                            setAddedTimes((prev) =>
                                prev.map((item) =>
                                    item.id === row.id
                                        ? { ...item, fingerId: Number(newValue?.target?.value) }
                                        : item
                                )
                            );
                        }}
                        placeholder="Enter finger ID"
                    />
                </FormControl>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: TeachersSetup) => (
                <div className="flex space-x-2 items-center">
                    <IconButton
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            hangleDetele(row.id);
                        }}
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
            >
                {/* Header */}
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
                        {"Student Setup"}
                    </Typography>
                </Box>

                <Box>
                    <div className="flex flex-col-reverse items-end w-full gap-4">
                        <Box sx={{ mb: 2 }} className={" w-full"}>
                            <Paper sx={{ p: 0, mb: 0, backgroundColor: "transparent", border: "none", boxShadow: "none" }}>
                                <div className="flex items-start gap-4">
                                    <div className="flex gap-4 items-start w-full max-w-[800px]">
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
                                                onChange={(e) => setFilters((prev) => ({ ...prev, selectedTeachersIds: e.map(Number) }))}
                                                width={"100%"}
                                            />
                                        </FormControl>
                                        {/* deviceId */}
                                        <FormControl fullWidth size="small" className="flex-1/4">
                                            <MuiTextInput
                                                name="deviceId"
                                                label="Device ID"
                                                type="number"
                                                value={filters.deviceId || ""}
                                                onChange={(newValue) =>
                                                    setFilters((prev) => ({ ...prev, deviceId: newValue?.target?.value }))
                                                }
                                                placeholder="Enter device ID"
                                            />
                                        </FormControl>
                                        {/* fingerId */}
                                        <FormControl fullWidth size="small" className="flex-1/4">
                                            <MuiTextInput
                                                name="fingerId"
                                                label="Finger ID"
                                                type="number"
                                                value={filters.fingerId || ""}
                                                onChange={(newValue) =>
                                                    setFilters((prev) => ({ ...prev, fingerId: newValue?.target?.value }))
                                                }
                                                placeholder="Enter finger ID"
                                            />
                                        </FormControl>
                                    </div>
                                    <div>
                                        <Button
                                            variant="contained"
                                            onClick={handleAddTime}
                                            className="max-h-fit w-fit"
                                            disabled={!filters?.deviceId || !filters?.fingerId || !filters?.selectedTeachersIds?.length}
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
                        <ReusableTable<TeachersSetup>
                            columns={columns}
                            data={addedTimes}
                        />
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
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                        <SubmitButton
                            onClick={handleSubmitTeachersTime}
                            disabled={addedTimes?.length === 0}
                        >
                            Submit
                        </SubmitButton>
                    </motion.div>
                </Box>
            </motion.div>
        </>
    );
};

export default StudentSetup;
