"use client";
import React, { useRef, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
} from "@mui/material";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import MuiDatePicker from "@/components/ui/common/MuiDatePicker";
import { useLazyGetStudentAttendanceDailyReportQuery } from "@/app/store/api/attendance/attendanceApi";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import MuiSingleSelect from "@/components/ui/common/MuiSingleSelect";
import { PDFDownloadLink } from "@react-pdf/renderer";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import PdfStudentsdailyAttendanceReport from "../manageAttendance/pdf/PdfStudentsdailyAttendanceReport";
import { useReactToPrint } from "react-to-print";
import { appConfiguration } from "@/app/utils/constant/appConfiguration";
import PrintStudentsDailyAttendanceReport from "../manageAttendance/print/PrintStudentsDailyAttendanceReport";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";

export interface SessionInfo {
    name: string;
}

export interface ClassInfo {
    name: string;
}

export interface SectionInfo {
    name: string;
}

export interface StudentInfo {
    name: string;
    studentUniqueId: string;
    session: SessionInfo;
    class: ClassInfo;
    section: SectionInfo;
}

export interface StatusDetail {
    status: string;
    hours: number;
    minutes: number;
    seconds: number;
}

export interface StudentAttendance {
    id: number;
    branchId: number;
    date: string; // ISO string
    studentId: number;
    checkIn: string;
    checkOut: string;
    checkInStatus: string;
    checkOutStatus: string;
    status: "Present" | "Absent" | "Leave";
    createdAt: string;
    updatedAt: string;
    student: StudentInfo;
    [key: string]: string | number | StatusDetail | StudentInfo;
}

const StudentDailyReports = () => {
    const userInfo = getUserInfoFromToken();
    // states start **************************************************
    const [filters, setFilters] = useState({
        date: null,
        sessionId: null,
        classId: null,
    });
    // states end **************************************************

    // api (redux) start ************************
    const { data: sessions, isLoading: isSessionsLoading } = useGetAllSessionsQuery({});
    const { data: classes, isLoading: isClassesLoading } = useGetAllClassQuery({ page: 1, size: 1000000 });
    const [triggerStudentDailyReport, { data: studentReport, isFetching: isStudentDataFetching }] = useLazyGetStudentAttendanceDailyReportQuery()
    // api (redux) end ************************


    // handlers start ***********************************************
    const handleFetchTeacherReport = async () => {
        try {
            await triggerStudentDailyReport(
                {
                    date: filters?.date,
                    sessionId: filters?.sessionId,
                    classId: filters?.classId,
                }
            ).unwrap();

            setFilters({
                date: null,
                sessionId: null,
                classId: null,
            })

        } catch (error) {
            console.error("Failed to fetch student's report:", error);

            const errorMessage = (() => {
                if (error instanceof Error) {
                    return error.message;
                }
                if (typeof error === "object" && error !== null && "data" in error) {
                    const errorData = error as { data?: { message?: string } };
                    return errorData.data?.message;
                }
                return "Failed to get student's report";
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

    const printTeachersMonthlyReportRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printTeachersMonthlyReportRef,
        documentTitle: `${appConfiguration?.appName}_students_daily_report`,
    });
    // handlers end ***********************************************

      const { data: branchConfigData } = useGetBranchConfigQuery(userInfo?.branchId)
  const branchInfo = branchConfigData?.data;

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: StudentAttendance, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: "name",
            header: "Name",
            render: (row: StudentAttendance) => row?.student?.name,
        },
        {
            key: "id",
            header: "ID",
            render: (row: StudentAttendance) => row?.student?.studentUniqueId,
        },
        {
            key: "designation",
            header: "Class",
            render: (row: StudentAttendance) => row?.student?.class?.name,
        },
        {
            key: "checkIn",
            header: "CHECK IN",
            render: (row: StudentAttendance) => row.checkIn,
        },
        {
            key: "checkStatus",
            header: "CHECK STATUS",
            render: (row: StudentAttendance) => JSON.parse(row.checkInStatus)?.status,
        },
        {
            key: "checkOut",
            header: "CHECK OUT",
            render: (row: StudentAttendance) => row.checkOut,
        },
        {
            key: "checkOutStatus",
            header: "CHECK OUT STATUS",
            render: (row: StudentAttendance) => JSON.parse(row.checkOutStatus)?.status,
        },
        {
            key: "status",
            header: "STATUS",
            render: (row: StudentAttendance) => row.status,
        },
    ];

    if (isStudentDataFetching || isSessionsLoading || isClassesLoading) {
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
                title="Students's Daily Reports"
            />

            <div className="flex flex-col-reverse items-end w-full gap-4">
                <Box sx={{ mb: 2 }} className={" w-full"}>
                    <Paper sx={{ p: 0, mb: 0, backgroundColor: "transparent", border: "none", boxShadow: "none" }} >
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4 w-full max-w-[800px]">
                                <FormControl fullWidth size="small">
                                    <InputLabel>Session Year</InputLabel>
                                    <Select
                                        name="sessionYear"
                                        value={filters?.sessionId}
                                        onChange={(newValue) =>
                                            setFilters((prev) => ({ ...prev, sessionId: newValue?.target?.value }))
                                        }
                                        label="Session Year"
                                    >
                                        {(sessions?.data)?.map((session) => (
                                            <MenuItem key={session.id} value={session?.id}>
                                                {session.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {/* select class */}
                                <FormControl fullWidth size="small">
                                    <MuiSingleSelect
                                        options={
                                            classes?.data?.map((teacher) => ({ id: teacher?.id, label: teacher?.name }))
                                        }
                                        label="Select Class"
                                        placeholder="Pick one"
                                        selectedId={2}
                                        onChange={(id) => setFilters((prev) => ({ ...prev, classId: id }))}
                                        width={"100%"}
                                        size="small"
                                        textSize="14px"
                                    />
                                </FormControl>
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
                                studentReport?.data?.length > 0 &&
                                <div className="flex gap-2 items-center">
                                    <PDFDownloadLink
                                        document={<PdfStudentsdailyAttendanceReport result={studentReport?.data} userName={userInfo?.role} branchInfo={branchInfo}/>}
                                        fileName="teachers_monthly_report.pdf"
                                    >
                                        {
                                            (params) => {
                                                const { loading } = params;
                                                return (
                                                    <CancelButton
                                                        onClick={() => ""}
                                                        disabled={loading || !studentReport?.data}
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
                                        disabled={!studentReport?.data}
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
                {!studentReport?.data || studentReport?.data?.length < 1 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No data found.
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<StudentAttendance>
                            columns={columns}
                            data={studentReport?.data}
                        />
                    </>
                )}
            </Paper>

            {/* for print  */}
            <div className="invisible hidden -left-full">
                {studentReport?.data.length > 0 && (
                    <PrintStudentsDailyAttendanceReport
                        ref={printTeachersMonthlyReportRef}
                        categoryData={studentReport?.data as StudentAttendance[] || []}
                        logo={{ companyLogoBangla: "https://img.freepik.com/premium-vector/education-school-logo-design-template_731136-92.jpg" }}
                        branchInfo={branchInfo}
                    />
                )}
            </div>
        </Box>
    );
};

export default StudentDailyReports;