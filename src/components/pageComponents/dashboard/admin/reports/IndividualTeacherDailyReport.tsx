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
import { useGetAllTeachersQuery } from "@/app/store/api/teacher/teacherApi";
import MuiSingleSelect from "@/components/ui/common/MuiSingleSelect";
import { useLazyGetTeacherAttendanceIndividualReportQuery } from "@/app/store/api/attendance/attendanceApi";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PdfIndividualTeacherAttendanceReport from "../manageAttendance/pdf/PdfIndividualTeacherAttendanceReport";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { useReactToPrint } from "react-to-print";
import { appConfiguration } from "@/app/utils/constant/appConfiguration";
import PrintIndividualTeacherAttendanceReport from "../manageAttendance/print/PrintIndividualTeacherAttendanceReport";
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

const IndividualTeacherDailyReport = () => {
  const userInfo = getUserInfoFromToken();
  // states start **************************************************
  const [filters, setFilters] = useState({
    fromDate: null,
    toDate: null,
    teacherId: null,
  });
  // states end **************************************************

  // api (redux) start ************************
  const { data: teachersData, isLoading: teachersLoading } =
    useGetAllTeachersQuery({ page: 1, size: 1000 });
  const [
    triggerIndividualTeacherReport,
    { data: teacherReport, isFetching: isTeacherDataFetching },
  ] = useLazyGetTeacherAttendanceIndividualReportQuery();

// Fetching branch name, email, address and logo. 
  const { data: branchConfigData } = useGetBranchConfigQuery(userInfo?.branchId)
  const branchInfo = branchConfigData?.data;

  // handlers start ***********************************************
  const handleFetchTeacherReport = async () => {
    try {
      await triggerIndividualTeacherReport({
        teacherId: filters?.teacherId,
        fromDate: filters?.fromDate,
        toDate: filters?.toDate,
      }).unwrap();

      setFilters({
        fromDate: null,
        toDate: null,
        teacherId: null,
      });
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

      toastShowing(errorMessage, "bottom-right", 2000, "red", "white");
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
      render: (row: TeacherAttendance, index?: number) =>
        index !== undefined ? index + 1 : null,
    },
    {
      key: "date",
      header: "DATE",
      render: (row: TeacherAttendance) =>
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
      render: (row: TeacherAttendance) => row?.checkIn,
    },
    {
      key: "checkInStatus",
      header: "CHECK IN STATUS",
      render: (row: TeacherAttendance) => JSON.parse(row.checkInStatus)?.status,
    },
    {
      key: "checkInNote",
      header: "CHECK IN NOTE",
      render: (row: TeacherAttendance) => {
        if (!row?.checkInStatus) return "—";
        const data = JSON.parse(row.checkInStatus);
        return ` (${data.hours}h ${data.minutes}m ${data.seconds}s)`;
      },
    },

    {
      key: "checkOutTime",
      header: "CHECK OUT TIME",
      render: (row: TeacherAttendance) => row?.checkOut,
    },
    {
      key: "checkOutStatus",
      header: "CHECK OUT STATUS",
      render: (row: TeacherAttendance) =>
        JSON.parse(row.checkOutStatus)?.status,
    },
    {
      key: "checkOutNote",
      header: "CHECK OUT NOTE",
      render: (row: TeacherAttendance) => {
        if (!row?.checkOutStatus) return "—";
        const data = JSON.parse(row.checkOutStatus);
        return ` (${data.hours}h ${data.minutes}m ${data.seconds}s)`;
      },
    },
  ];

  if (teachersLoading || isTeacherDataFetching) {
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
      <PageHeader title="Individual Teacher Daily Reports" />

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
                    options={teachersData?.data?.map((teacher) => ({
                      id: teacher?.id,
                      label: teacher?.name,
                    }))}
                    label="Select Teacher"
                    placeholder="Pick one"
                    selectedId={2}
                    onChange={(id) =>
                      setFilters((prev) => ({ ...prev, teacherId: id }))
                    }
                    width={"100%"}
                    size="small"
                    textSize="14px"
                  />
                </FormControl>
                <div className="">
                  <Button
                    variant="contained"
                    onClick={handleFetchTeacherReport}
                    className="max-h-fit w-fit"
                    sx={{
                      backgroundColor: "#035140",
                      "&:hover": {
                        backgroundColor: "#024030",
                      },
                    }}
                  >
                    Search
                  </Button>
                </div>
              </div>
              {teacherReport?.data?.length > 0 && (
                <div className="flex gap-2 items-center">
                  <PDFDownloadLink
                    document={
                      <PdfIndividualTeacherAttendanceReport
                        result={teacherReport?.data}
                        userName={userInfo?.role}
                        branchInfo={branchInfo}
                      />
                    }
                    fileName="teachers_monthly_report.pdf"
                  >
                    {(params) => {
                      const { loading } = params;
                      return (
                        <CancelButton
                          onClick={() => ""}
                          disabled={loading || !teacherReport?.data}
                        >
                          <span className="font-medium">
                            {loading ? "Processing..." : "PDF"}
                          </span>
                        </CancelButton>
                      );
                    }}
                  </PDFDownloadLink>
                  <Button
                    variant="contained"
                    onClick={handlePrint}
                    disabled={!teacherReport?.data}
                    className="max-h-fit w-fit"
                    sx={{
                      backgroundColor: "#035140",
                      "&:hover": {
                        backgroundColor: "#024030",
                      },
                    }}
                  >
                    Print
                  </Button>
                </div>
              )}
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
            No report found.
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
          <PrintIndividualTeacherAttendanceReport
            ref={printTeachersDailyReportRef}
            categoryData={(teacherReport?.data as TeacherAttendance[]) || []}
            logo={{
              companyLogoBangla:
                "https://img.freepik.com/premium-vector/education-school-logo-design-template_731136-92.jpg",
            }}
          />
        )}
      </div>
    </Box>
  );
};

export default IndividualTeacherDailyReport;
