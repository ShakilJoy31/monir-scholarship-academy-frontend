"use client";
import React, { useRef, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Button,
    FormControl,
    CircularProgress,
} from "@mui/material";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import MuiDatePicker from "@/components/ui/common/MuiDatePicker";
import { useLazyGetTeacherAttendanceDailyReportQuery } from "@/app/store/api/attendance/attendanceApi";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PdfTeachersDailyAttendanceReport from "../manageAttendance/pdf/PdfTeachersDailyAttendanceReport";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import PrintTeachersDailyAttendanceReport from "../manageAttendance/print/PrintTeachersDailyAttendanceReport";
import { useReactToPrint } from "react-to-print";
import { appConfiguration } from "@/app/utils/constant/appConfiguration";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";

export interface TeacherInfo {
    name: string;
    designation: string;
    teacherUniqueId: string;
}

export interface TeacherAttendance {
    id: number;
    branchId: number;
    date: string;
    teacherId: number;
    checkIn: string;
    checkOut: string;
    checkInStatus: string;
    checkOutStatus: string;
    status: "Present" | "Absent" | "Leave";
    createdAt: string;
    updatedAt: string;
    teacher: TeacherInfo;
    [key: string]: string | number | TeacherInfo;
}


const TeacherDailyReports = () => {
    const userInfo = getUserInfoFromToken();
    // states start **************************************************
    const [filters, setFilters] = useState({
        date: null,
    });
    // states end **************************************************

    // api (redux) start ************************
    const [triggerTeacherDailyReport, { data: teacherReport, isFetching: isTeacherDataFetching }] = useLazyGetTeacherAttendanceDailyReportQuery()
    // api (redux) end ************************
  const { data: branchConfigData } = useGetBranchConfigQuery(userInfo?.branchId)
  const branchInfo = branchConfigData?.data;

    // handlers start ***********************************************
    const handleFetchTeacherReport = async () => {
        try {
            await triggerTeacherDailyReport(
                {
                    date: filters?.date,
                }
            ).unwrap();

            setFilters({
                date: null,
            })

        } catch (error) {
            console.error("Failed to fetch teacher report:", error);

            const errorMessage = (() => {
                if (error instanceof Error) {
                    return error.message;
                }
                if (typeof error === "object" && error !== null && "data" in error) {
                    const errorData = error as { data?: { message?: string } };
                    return errorData.data?.message;
                }
                return "Failed to get teacher report";
            })();

            toastShowing(
                errorMessage,
                "bottom-right",
                2000,
                "red",
                "white"
            );
        }
    };

    const printTeachersDailyReportRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printTeachersDailyReportRef,
        documentTitle: `${appConfiguration?.appName}_teachers_daily_report`,
    });
    // handlers end ***********************************************

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: TeacherAttendance, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: "name",
            header: "EMPLOYEE",
            render: (row: TeacherAttendance) => row?.teacher?.name,
        },
        {
            key: "id",
            header: "ID",
            render: (row: TeacherAttendance) => row?.teacher?.teacherUniqueId,
        },
        {
            key: "designation",
            header: "DESIGNATION",
            render: (row: TeacherAttendance) => row?.teacher?.designation,
        },
        {
            key: "checkIn",
            header: "CHECK IN",
            render: (row: TeacherAttendance) => row.checkIn,
        },
        {
            key: "checkStatus",
            header: "CHECK STATUS",
            render: (row: TeacherAttendance) => JSON.parse(row.checkInStatus)?.status,
        },
        {
            key: "checkOut",
            header: "CHECK OUT",
            render: (row: TeacherAttendance) => row.checkOut,
        },
        {
            key: "checkOutStatus",
            header: "CHECK OUT STATUS",
            render: (row: TeacherAttendance) => JSON.parse(row.checkOutStatus)?.status,
        },
        {
            key: "status",
            header: "STATUS",
            render: (row: TeacherAttendance) => row.status,
        },
    ];

    if (isTeacherDataFetching) {
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
        <Box>
            <PageHeader
                title="Teacher's Daily Reports"
            />

            <div className="flex flex-col-reverse items-end w-full gap-4">
                <Box sx={{ mb: 2 }} className={" w-full"}>
                    <Paper sx={{ p: 0, mb: 0, backgroundColor: "transparent", border: "none", boxShadow: "none" }} >
                        <div className="flex items-center justify-between">

                            <div className="flex gap-4 max-w-[400px]">
                                {/* Date  */}
                                <FormControl fullWidth size="small" sx={{ mt: "-8px" }}>
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
                                <div className="">
                                    <Button
                                        variant="contained"
                                        onClick={handleFetchTeacherReport}
                                        className="max-h-fit w-fit"
                                        sx={{
                                            backgroundColor: '#035140',
                                            '&:hover': {
                                                backgroundColor: '#024030',
                                            },
                                        }}
                                    >
                                        Search
                                    </Button>
                                </div>
                            </div>
                            {
                                teacherReport?.data?.length > 0 &&
                                <div className="flex gap-2 items-center">
                                    <PDFDownloadLink
                                        document={<PdfTeachersDailyAttendanceReport result={teacherReport?.data} userName={userInfo?.role} branchInfo={branchInfo} />}
                                        fileName="teachers_monthly_report.pdf"
                                    >

                                        {
                                            (params) => {
                                                const { loading } = params;
                                                return (
                                                    <CancelButton
                                                        onClick={() => ""}
                                                        disabled={loading || !teacherReport?.data}
                                                    >
                                                        <span className="font-medium">
                                                            {loading ? 'Processing...' : 'PDF'}
                                                        </span>
                                                    </CancelButton>
                                                )
                                            }}
                                    </PDFDownloadLink>
                                    <Button
                                        variant="contained"
                                        onClick={handlePrint}
                                        disabled={!teacherReport?.data}
                                        className="max-h-fit w-fit"
                                        sx={{
                                            backgroundColor: '#035140',
                                            '&:hover': {
                                                backgroundColor: '#024030',
                                            },
                                        }}
                                    >
                                        Print
                                    </Button>

                                </div>
                            }
                        </div>
                    </Paper>
                </Box>
            </div>

            <Paper>
                {!teacherReport?.data || teacherReport?.data?.length < 1 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No employees found.
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<TeacherAttendance>
                            columns={columns}
                            data={teacherReport?.data}
                        />
                    </>
                )}
            </Paper>
            {/* for print  */}
            <div className="invisible hidden -left-full">
                {teacherReport?.data.length > 0 && (
                    <PrintTeachersDailyAttendanceReport
                        ref={printTeachersDailyReportRef}
                        categoryData={teacherReport?.data as TeacherAttendance[] || []}
                        branchInfo={branchInfo}
                    />
                )}
            </div>
        </Box>
    );
};

export default TeacherDailyReports;