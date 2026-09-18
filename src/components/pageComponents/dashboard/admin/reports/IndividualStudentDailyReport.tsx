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
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import MuiDatePicker from "@/components/ui/common/MuiDatePicker";
import MuiSingleSelect from "@/components/ui/common/MuiSingleSelect";
import { useLazyGetStudentAttendanceIndividualReportQuery } from "@/app/store/api/attendance/attendanceApi";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { useGetAllStudentsQuery } from "@/app/store/api/student/studentApi";
import { PDFDownloadLink } from "@react-pdf/renderer";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import PdfIndividualStudentsAttendanceReport from "../manageAttendance/pdf/PdfIndividualStudentsAttendanceReport";
import { useReactToPrint } from "react-to-print";
import { appConfiguration } from "@/app/utils/constant/appConfiguration";
import PrintIndividualStudentAttendanceReport from "../manageAttendance/print/PrintIndividualStudentAttendanceReport";
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
    date: string;
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

const IndividualStudentDailyReport = () => {
    const userInfo = getUserInfoFromToken();
    // states start **************************************************
    const [filters, setFilters] = useState({
        fromDate: null,
        toDate: null,
        studentId: null,
    });
    // states end **************************************************

    // Fetching branch name, email, address and logo. 
  const { data: branchConfigData } = useGetBranchConfigQuery(userInfo?.branchId)
  const branchInfo = branchConfigData?.data;

    // api (redux) start ************************
    const { data: studentsData, isLoading: studentsLoading } = useGetAllStudentsQuery({ page: 1, size: 1000 });
    const [triggerIndividualStudentReport, { data: studentReport, isFetching: isStudentDataFetching }] = useLazyGetStudentAttendanceIndividualReportQuery()
    console.log("studentReport", studentReport);
    // api (redux) end ************************

    // handlers start ***********************************************
    const handleFetchStudentReport = async () => {
        try {
            await triggerIndividualStudentReport(
                {
                    studentId: filters?.studentId,
                    fromDate: filters?.fromDate,
                    toDate: filters?.toDate
                }
            ).unwrap();

            setFilters({
                fromDate: null,
                toDate: null,
                studentId: null,
            })

        } catch (error) {
            console.error("Failed to fetch student report:", error);

            const errorMessage = (() => {
                if (error instanceof Error) {
                    return error.message;
                }
                if (typeof error === "object" && error !== null && "data" in error) {
                    const errorData = error as { data?: { message?: string } };
                    return errorData.data?.message;
                }
                return "Failed to get student report";
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
        documentTitle: `${appConfiguration?.appName}_individual_student_report`,
    });
    // handlers end ***********************************************

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: StudentAttendance, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: "date",
            header: "DATE",
            render: (row: StudentAttendance) =>
                   new Date(row?.date).toLocaleString("en-BD", {
                     day: "2-digit",
                     month: "short",
                     year: "numeric",
                     hour: "2-digit",
                     minute: "2-digit",
                     hour12: true,
                     timeZone: "Asia/Dhaka", // 👈 ensures correct local time
                   }),
        },
        {
            key: "checkInTime",
            header: "CHECK IN TIME",
            render: (row: StudentAttendance) => row?.checkIn,
        },
        {
            key: "checkInStatus",
            header: "CHECK IN STATUS",
            render: (row: StudentAttendance) => JSON.parse(row.checkInStatus)?.status,
        },
        {
              key: "checkInNote",
              header: "CHECK IN NOTE",
              render: (row: StudentAttendance) => {
                if (!row?.checkInStatus) return "—";
                const data = JSON.parse(row.checkInStatus);
                return ` (${data.hours}h ${data.minutes}m ${data.seconds}s)`;
              },
            },
        {
            key: "checkOutTime",
            header: "CHECK OUT TIME",
            render: (row: StudentAttendance) => row?.checkOut,
        },
        {
            key: "checkOutStatus",
            header: "CHECK OUT STATUS",
            render: (row: StudentAttendance) => JSON.parse(row.checkOutStatus)?.status,
        },
         {
              key: "checkOutNote",
              header: "CHECK OUT NOTE",
              render: (row: StudentAttendance) => {
                if (!row?.checkOutStatus) return "—";
                const data = JSON.parse(row.checkOutStatus);
                return ` (${data.hours}h ${data.minutes}m ${data.seconds}s)`;
              },
            },
    ];

    if (studentsLoading || isStudentDataFetching) {
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
                title="Individual Student Daily Reports"
            />

            <div className="flex flex-col-reverse items-end w-full gap-4">
                <Box sx={{ mb: 2 }} className={" w-full"}>
                    <Paper sx={{ p: 0, mb: 0, backgroundColor: "transparent", border: "none", boxShadow: "none" }} >
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4 w-full max-w-[800px]">
                                {/* From Date  */}
                                <FormControl fullWidth size="small" sx={{ mt: "-8px" }}>
                                    <MuiDatePicker
                                        label="From Date"
                                        value={filters.fromDate}
                                        onChange={(newValue) =>
                                            setFilters((prev) => ({ ...prev, fromDate: newValue }))
                                        }
                                        size="small"
                                        fullWidth
                                    />
                                </FormControl>
                                {/* To Date  */}
                                <FormControl fullWidth size="small" sx={{ mt: "-8px" }}>
                                    <MuiDatePicker
                                        label="From Date"
                                        value={filters.toDate}
                                        onChange={(newValue) =>
                                            setFilters((prev) => ({ ...prev, toDate: newValue }))
                                        }
                                        size="small"
                                        fullWidth
                                    />
                                </FormControl>
                                <FormControl fullWidth size="small">
                                    <MuiSingleSelect
                                        options={
                                            studentsData?.data?.map((student) => ({ id: student?.id, label: student?.name }))
                                        }
                                        label="Select Student"
                                        placeholder="Pick one"
                                        selectedId={2}
                                        onChange={(id) => setFilters((prev) => ({ ...prev, studentId: id }))}
                                        width={"100%"}
                                        size="small"
                                        textSize="14px"
                                    />
                                </FormControl>
                                <div className="">
                                    <Button
                                        variant="contained"
                                        onClick={handleFetchStudentReport}
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
                                        document={<PdfIndividualStudentsAttendanceReport result={studentReport?.data} userName={userInfo?.role} branchInfo={branchInfo} />}
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
                        No report found.
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
                    <PrintIndividualStudentAttendanceReport
                        ref={printTeachersDailyReportRef}
                        categoryData={studentReport?.data as StudentAttendance[] || []}
                        logo={{ companyLogoBangla: "https://img.freepik.com/premium-vector/education-school-logo-design-template_731136-92.jpg" }}
                        branchInfo={branchInfo}
                    />
                )}
            </div>
        </Box>
    );
};

export default IndividualStudentDailyReport;