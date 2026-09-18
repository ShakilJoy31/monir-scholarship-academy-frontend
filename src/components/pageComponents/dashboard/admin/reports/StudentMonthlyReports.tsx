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
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import MuiDatePicker from "@/components/ui/common/MuiDatePicker";
import { getMonthRange } from "@/app/utils/helper/helpers";
import { useLazyGetStudentAttendanceMonthlyReportQuery } from "@/app/store/api/attendance/attendanceApi";
import dayjs from "dayjs";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import MuiSingleSelect from "@/components/ui/common/MuiSingleSelect";
import PdfStudentsMonthlyAttendanceReport from "../manageAttendance/pdf/PdfStudentsMonthlyAttendanceReport";
import { PDFDownloadLink } from "@react-pdf/renderer";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { useReactToPrint } from "react-to-print";
import { appConfiguration } from "@/app/utils/constant/appConfiguration";
import PrintStudentsMonthlyAttendanceReport from "../manageAttendance/print/PrintStudentsMonthlyAttendanceReport";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";


export interface StudentSession {
  name: string;
}

export interface StudentClass {
  name: string;
}

export interface StudentSection {
  name: string;
}

export interface StudentInfo {
  name: string;
  studentUniqueId: string;
  session: StudentSession;
  class: StudentClass;
  section: StudentSection;
}

export interface StudentReport {
  id: number;
  branchId: number;
  date: string;
  studentId: number;
  checkIn: string | null;
  checkOut: string | null;
  checkInStatus: string | null;
  checkOutStatus: string | null;
  status: "Present" | "Absent" | "Leave";
  createdAt: string;
  updatedAt: string;
  student: StudentInfo;
}

export interface StudentAttendanceMonthlyReport {
  studentId: number;
  student: StudentInfo;
  report: StudentReport[];
  [key: string]: string | number | StudentSession | StudentClass | StudentSection | StudentInfo | StudentReport[];
}


const StudentMonthlyReports = () => {
  const userInfo = getUserInfoFromToken();
  // states start **************************************************
  const [filters, setFilters] = useState({
    selectedMonth: null,
    classNameId: null,
    sessionYearId: null,
  });
  // states end **************************************************


      // Fetching branch name, email, address and logo. 
  const { data: branchConfigData } = useGetBranchConfigQuery(userInfo?.branchId)
  const branchInfo = branchConfigData?.data;

  // api (redux) start ************************
  const [triggerStudentMonthlyReport, { data: studentReport, isFetching: isStudentDataFetching }] = useLazyGetStudentAttendanceMonthlyReportQuery()
  const { data: sessions, isLoading: isSessionsLoading } = useGetAllSessionsQuery({});
  const { data: classes, isLoading: isClassesLoading } = useGetAllClassQuery({});
  // api (redux) end ************************

  // handlers start ***********************************************
  const handleFetchTeacherReport = async () => {
    const { firstDate, lastDate } = getMonthRange(filters?.selectedMonth);
    try {
      await triggerStudentMonthlyReport(
        {
          fromDate: firstDate,
          toDate: lastDate,
          classNameId: filters?.classNameId,
          sessionYearId: filters?.sessionYearId,
        }
      ).unwrap();

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

  const printTeachersMonthlyReportRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printTeachersMonthlyReportRef,
    documentTitle: `${appConfiguration?.appName}_students_monthly_report`,
  });
  // handlers end ***********************************************

  const columns = [
    {
      key: "sl",
      header: "SL",
      render: (row: StudentAttendanceMonthlyReport, index?: number) =>
        index !== undefined ? index + 1 : null,
    },
    {
      key: "name",
      header: "NAME",
      render: (row: StudentAttendanceMonthlyReport) => row?.student?.name,
    },
    // {
    //   key: "session",
    //   header: "Session",
    //   render: (row: StudentAttendanceMonthlyReport) => row?.student?.session,
    // },
    // Days 1–31
    ...Array.from({ length: dayjs(filters?.selectedMonth).daysInMonth() || 31 }, (_, i) => ({
      key: `day${i + 1}`,
      header: `${i + 1}`,
      render: (row: StudentAttendanceMonthlyReport) => `${row?.report[i]?.status?.slice(0, 1) || ""}`,
    })),
    {
      key: "P",
      header: "P",
      render: (row: StudentAttendanceMonthlyReport) => row?.report?.reduce((total, current) => current?.status === "Present" ? total + 1 : total + 0, 0),
    },
    {
      key: "A",
      header: "A",
      render: (row: StudentAttendanceMonthlyReport) => row?.report?.reduce((total, current) => current?.status === "Absent" ? total + 1 : total + 0, 0),
    },
    {
      key: "L",
      header: "L",
      render: (row: StudentAttendanceMonthlyReport) => row?.report?.reduce((total, current) => current?.status === "Leave" ? total + 1 : total + 0, 0),
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
      <PageHeader title="Student's Monthly Reports" />

      <div className="flex flex-col-reverse items-end w-full gap-4">
        <Box sx={{ mb: 2 }} className={" w-full"}>
          <Paper
            sx={{
              p: 0,
              mb: 0,
              backgroundColor: "transparent",
              border: "none",
              boxShadow: "none",
            }}
          >
            <div className="flex items-center justify-between">

              <div className="flex gap-4 w-full max-w-[800px]">
                {/* Select Month  */}
                <FormControl fullWidth size="small" sx={{ mt: "-8px" }}>
                  <MuiDatePicker
                    label="Select Month"
                    value={filters?.selectedMonth}
                    views={['month', 'year']}
                    onChange={(newValue) =>
                      setFilters((prev) => ({ ...prev, selectedMonth: newValue }))
                    }
                    size="small"
                    fullWidth
                  />
                </FormControl>
                {/* Select Session Year */}
                <FormControl fullWidth size="small">
                  <InputLabel>Session Year</InputLabel>
                  <Select
                    name="sessionYear"
                    value={filters?.sessionYearId}
                    onChange={(newValue) =>
                      setFilters((prev) => ({ ...prev, sessionYearId: newValue?.target?.value }))
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
                      classes?.data?.map((singleClass) => ({ id: singleClass?.id, label: singleClass?.name }))
                    }
                    label="Select Class"
                    placeholder="Pick one"
                    selectedId={filters?.classNameId}
                    onChange={(id) => setFilters((prev) => ({ ...prev, classNameId: id }))}
                    width={"100%"}
                    size="small"
                    textSize="14px"
                  />
                </FormControl>
                <div className="">
                  <Button
                    variant="contained"
                    onClick={handleFetchTeacherReport}
                    disabled={
                      !filters?.selectedMonth ||
                      !filters?.classNameId ||
                      !filters?.sessionYearId
                    }
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
                    document={<PdfStudentsMonthlyAttendanceReport result={studentReport?.data} userName={userInfo?.role} selectedMonth={filters?.selectedMonth} branchInfo={branchInfo} />}
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
            <ReusableTable<StudentAttendanceMonthlyReport> columns={columns} data={studentReport?.data} />
          </>
        )}
      </Paper>


      {/* for print  */}
      <div className="invisible hidden -left-full">
        {studentReport?.data.length > 0 && (
          <PrintStudentsMonthlyAttendanceReport
            ref={printTeachersMonthlyReportRef}
            selectedMonth={filters?.selectedMonth}
            categoryData={studentReport?.data as StudentAttendanceMonthlyReport[] || []}
            logo={{ companyLogoBangla: "https://img.freepik.com/premium-vector/education-school-logo-design-template_731136-92.jpg" }}
            branchInfo={branchInfo}
          />
        )}
      </div>
    </Box>
  );
};

export default StudentMonthlyReports;
