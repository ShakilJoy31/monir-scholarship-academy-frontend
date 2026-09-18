"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { X } from "lucide-react";
import {
    Box,
    Typography,
    Paper,
    IconButton,
    FormControl,
    CircularProgress,
} from "@mui/material";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import MuiTimePicker from "@/components/ui/common/MuiTimePicker";
import MuiTextInput from "@/components/ui/common/muiInput";
import { Dayjs } from "dayjs";
import { useUpdateTeacherTimeMutation } from "@/app/store/api/attendance/attendanceApi";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";

// extend dayjs once
dayjs.extend(customParseFormat);

interface ITeacher {
    name: string;
    designation: string;
}

interface ITeacherTime {
    id: number;
    branchId: number;
    teacherId: number;
    inTime: Dayjs | null;
    outTime: Dayjs | null;
    maxDelay: number;
    maxEarly: number;
    createdAt: string;
    updatedAt: string;
    teacher: ITeacher;
    [key: string | number]: unknown;
}



const EditTeachersTime = ({ handleCloseEditTimeModal, timeForEdit }) => {
    // states start **************************************************
    const [updatedTime, setUpdatedTime] = useState<ITeacherTime>(null)
    // states end **************************************************

    useEffect(() => {
        const inTime = dayjs(timeForEdit?.inTime, "hh:mm A");
        const outTime = dayjs(timeForEdit?.outTime, "hh:mm A");
        setUpdatedTime({ ...timeForEdit, inTime, outTime })
    }, [timeForEdit])


    // api (redux) start ************************
    const [updateTeacherTime] = useUpdateTeacherTimeMutation();
    // api (redux) end ************************

    // handlers start ***********************************************
    const handleUpdateTime = async () => {
        const arrayOfItems = {
            id: updatedTime?.id,
            inTime: updatedTime?.inTime?.format("hh:mm A"),
            outTime: updatedTime?.outTime?.format("hh:mm A"),
            maxDelay: Number(updatedTime?.maxDelay),
            maxEarly: Number(updatedTime?.maxEarly),
        };

        try {
            await updateTeacherTime(arrayOfItems).unwrap();
            handleCloseEditTimeModal(true);
            toastShowing(
                "Updated time successfully",
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
                return "Failed to update time";
            })();

            toastShowing(
                errorMessage || "Failed to update time",
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
            render: (row: ITeacherTime, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'teacher.name',
            header: 'Name',
            render: (row: ITeacherTime) => {
                return row?.teacher?.name;
            }
        },
        {
            key: 'teacher.designation',
            header: 'Designation',
            render: (row: ITeacherTime) => {
                return row?.teacher?.designation;
            }
        },
        {
            key: 'inTime',
            header: 'In Time',
            render: (row: ITeacherTime) => {
                return (
                    < FormControl fullWidth size="small" className="" >
                        <MuiTimePicker
                            label="In Time"
                            value={row.inTime}
                            onChange={(newValue) => {
                                setUpdatedTime((prev) => ({ ...prev, inTime: newValue }));
                            }}
                            size="small"
                            fullWidth
                        />
                    </FormControl >
                )
            }
        },
        {
            key: 'outTime',
            header: 'Out Time',
            render: (row: ITeacherTime) => {
                return (
                    < FormControl fullWidth size="small" className="" >
                        <MuiTimePicker
                            label="Out Time"
                            value={row.outTime}
                            onChange={(newValue) => {
                                setUpdatedTime((prev) => ({ ...prev, outTime: newValue }));
                            }}
                            size="small"
                            fullWidth
                        />
                    </FormControl >
                )
            }
        },
        {
            key: 'maxDelay',
            header: 'Out Time',
            render: (row: ITeacherTime) => {
                return (
                    < FormControl fullWidth size="small" className="flex-1/4" >
                        <MuiTextInput
                            name="maxDelay"
                            label="Max Delay"
                            type="number"
                            value={row.maxDelay}
                            onChange={(newValue) => {
                                setUpdatedTime((prev) => ({ ...prev, maxDelay: Number(newValue?.target?.value) }));
                            }}
                            placeholder="Enter number"
                        />
                    </FormControl >
                )
            }
        },
        {
            key: 'maxEarly',
            header: 'Max Early',
            render: (row: ITeacherTime) => {
                return (
                    < FormControl fullWidth size="small" className="flex-1/4" >
                        <MuiTextInput
                            name="maxEarly"
                            label="Max Early"
                            type="number"
                            value={row.maxEarly}
                            onChange={(newValue) => {
                                setUpdatedTime((prev) => ({ ...prev, maxEarly: Number(newValue?.target?.value) }));
                            }}
                            placeholder="Enter number"
                        />
                    </FormControl >
                )
            }
        },
    ];


    if (!updatedTime) {
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
                        onClick={handleCloseEditTimeModal}
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
                        {"Update Time"}
                    </Typography>
                </Box>

                <Box>


                    <Paper>
                        <ReusableTable<ITeacherTime>
                            columns={columns}
                            data={[updatedTime]}
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
                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <CancelButton
                            onClick={handleCloseEditTimeModal}
                        >Cancel</CancelButton>

                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <SubmitButton
                            onClick={handleUpdateTime}
                            disabled={updatedTime?.length === 0}
                        >
                            Update
                        </SubmitButton>


                    </motion.div>
                </Box>
            </motion.div>

        </>
    );
};

export default EditTeachersTime;