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
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import MuiDatePicker from "@/components/ui/common/MuiDatePicker";
import { getMonthRange } from "@/app/utils/helper/helpers";
import { useLazyGetTeacherAttendanceMonthlyReportQuery } from "@/app/store/api/attendance/attendanceApi";
import dayjs from "dayjs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import PdfTeachersMonthlyAttendanceReport from "../manageAttendance/pdf/PdfTeachersMonthlyAttendanceReport";
import { appConfiguration } from "@/app/utils/constant/appConfiguration";
import { useReactToPrint } from 'react-to-print';
import PrintTeachersMonthlyAttendanceReport from "../manageAttendance/print/PrintTeachersMonthlyAttendanceReport";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";


export interface TeacherInfo {
  name: string;
  designation: string;
  teacherUniqueId: string;
}

export interface TeacherReport {
  id: number;
  branchId: number;
  date: string;
  teacherId: number;
  checkIn: string | null;
  checkOut: string | null;
  checkInStatus: string | null;
  checkOutStatus: string | null;
  status: "Present" | "Absent" | "Leave";
  createdAt: string;
  updatedAt: string;
  teacher: TeacherInfo;
}

export interface TeacherMonthlyReports {
  teacherId: number;
  teacher: TeacherInfo;
  report: TeacherReport[];
  [key: string]: string | number | TeacherInfo | TeacherReport[];
}

const TeacherMonthlyReports = () => {
  const userInfo = getUserInfoFromToken();
  // states start **************************************************
  const [filters, setFilters] = useState({
    selectedMonth: null,
  });
  // states end **************************************************

  const { data: branchConfigData } = useGetBranchConfigQuery(userInfo?.branchId)
  const branchInfo = branchConfigData?.data;

  // api (redux) start ************************
  const [triggerTeacherMonthlyReport, { data: teacherReport, isFetching: isTeacherDataFetching }] = useLazyGetTeacherAttendanceMonthlyReportQuery()
  // api (redux) end ************************

  // handlers start ***********************************************
  const handleFetchTeacherReport = async () => {
    const { firstDate, lastDate } = getMonthRange(filters?.selectedMonth);
    try {
      await triggerTeacherMonthlyReport(
        {
          fromDate: firstDate,
          toDate: lastDate,
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
    documentTitle: `${appConfiguration?.appName}_teachers_monthly_report`,
  });

  // handlers end ***********************************************

  const columns = [
    {
      key: "sl",
      header: "SL",
      render: (row: TeacherMonthlyReports, index?: number) =>
        index !== undefined ? index + 1 : null,
    },
    {
      key: "name",
      header: "NAME",
      render: (row: TeacherMonthlyReports) => row?.teacher?.name,
    },
    {
      key: "designation",
      header: "DESIGNATION",
      render: (row: TeacherMonthlyReports) => row?.teacher?.designation,
    },
    // Days 1–31
    ...Array.from({ length: dayjs(filters?.selectedMonth).daysInMonth() || 31 }, (_, i) => ({
      key: `day${i + 1}`,
      header: `${i + 1}`,
      render: (row: TeacherMonthlyReports) => `${row?.report[i]?.status?.slice(0, 1) || ""}`,
    })),
    {
      key: "P",
      header: "P",
      render: (row: TeacherMonthlyReports) => row?.report?.reduce((total, current) => current?.status === "Present" ? total + 1 : total + 0, 0),
    },
    {
      key: "A",
      header: "A",
      render: (row: TeacherMonthlyReports) => row?.report?.reduce((total, current) => current?.status === "Absent" ? total + 1 : total + 0, 0),
    },
    {
      key: "L",
      header: "L",
      render: (row: TeacherMonthlyReports) => row?.report?.reduce((total, current) => current?.status === "Leave" ? total + 1 : total + 0, 0),
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
    <>
      <Box>
        <PageHeader title="Teacher's Monthly Reports" />

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
                <div className="flex gap-4 max-w-[400px]">
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
                  <div className="">
                    <Button
                      variant="contained"
                      onClick={handleFetchTeacherReport}
                      disabled={!filters?.selectedMonth}
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
                      document={<PdfTeachersMonthlyAttendanceReport result={teacherReport?.data} userName={userInfo?.role} selectedMonth={filters?.selectedMonth} branchInfo={branchInfo} />}
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
              <ReusableTable<TeacherMonthlyReports> columns={columns} data={teacherReport?.data} />
            </>
          )}
        </Paper>

      </Box>

      {/* for print  */}
      <div className="invisible hidden -left-full">
        {teacherReport?.data.length > 0 && (
          <PrintTeachersMonthlyAttendanceReport
            ref={printTeachersMonthlyReportRef}
            selectedMonth={filters?.selectedMonth}
            categoryData={teacherReport?.data as TeacherMonthlyReports[] || []}
            logo={{ companyLogoBangla: "https://img.freepik.com/premium-vector/education-school-logo-design-template_731136-92.jpg" }}
            branchInfo={branchInfo}
          />
        )}
      </div>
    </>
  );
};

export default TeacherMonthlyReports;
