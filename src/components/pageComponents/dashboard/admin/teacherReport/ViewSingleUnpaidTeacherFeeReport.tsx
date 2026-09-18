/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useGetSingleUnpaidTeacherFeeQuery } from "@/app/store/api/allReport/allReportApi";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { useSinglePrint } from "@/components/pageComponents/PrintPDFComponent/SinglePrintComponent";
import { useSinglePDF } from "@/components/pageComponents/PrintPDFComponent/SinglePDFComponent";

interface StudentFeeData {
  id: number;
  branchId: number;
  studentId: number;
  month: string;
  year: string;
  baseSalary: number;
  discountType: string;
  advance: number;
  pay: number;
  netPayable: number;
  status: string;
  paidAt: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  teacher: {
    id: number;
    teacherUniqueId: string;
    name: string;
    designation: string;
  };
}

interface ViewSingleUnpaidClassFeeReportProps {
  open: boolean;
  onClose: () => void;
  studentId: number | null;
}

const ViewSingleUnpaidTeacherFeeReport: React.FC<
  ViewSingleUnpaidClassFeeReportProps
> = ({ open, onClose, studentId }) => {
  const { data, isLoading, isError } = useGetSingleUnpaidTeacherFeeQuery(
    studentId,
    {
      skip: !studentId || !open,
    }
  );

  const feeData: StudentFeeData[] = Array.isArray(data?.data)
    ? data.data
    : data?.data
    ? [data.data]
    : [];

  const studentInfo = feeData[0]?.teacher;

  const { printSingleData } = useSinglePrint<any>();
  const { generateSinglePDF } = useSinglePDF<any>();

  // Define columns for single record - matching table data
  const singleRecordColumns = [
    {
      key: "sl",
      header: "SL",
      render: (row: any, index: number) => (index + 1).toString(),
    },
    {
      key: "month",
      header: "Month",
      render: (row: any) => row.month || "N/A",
    },
    {
      key: "year",
      header: "Year",
      render: (row: any) => row.year || "N/A",
    },
    {
      key: "baseSalary",
      header: "Monthly Fee",
      render: (row: any) => `৳${row.baseSalary?.toLocaleString() || "0"}`,
    },
    {
      key: "advance",
      header: "Advance",
      render: (row: any) => `৳${row.advance?.toLocaleString() || "0"}`,
    },
    {
      key: "paid",
      header: "Paid",
      render: (row: any) =>
        `৳${(row.pay > 0 ? row.pay : 0)?.toLocaleString() || "0"}`,
    },
    {
      key: "status",
      header: "Status",
      render: (row: any) => row.status || "N/A",
    },
  ];

  // Header info generator - matching teacher information
  const headerInfoGenerator = (data: any) => `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
        <div>
          <strong>Name:</strong> ${studentInfo?.name || "N/A"}
        </div>
        <div>
          <strong>Teacher ID:</strong> ${studentInfo?.teacherUniqueId || "N/A"}
        </div>
        <div>
          <strong>Designation:</strong> ${studentInfo?.designation || "N/A"}
        </div>
      </div>
    `;

  // Summary generator
  const summaryGenerator = (data: any) => `
      <strong>Total Unpaid Amount:</strong> ৳${feeData
        .reduce((sum, r) => sum + r.netPayable, 0)
        .toLocaleString()}
    `;

  const handlePrint = () => {
    if (feeData.length > 0) {
      printSingleData(
        feeData[0],
        singleRecordColumns,
        "Teacher Unpaid Salary Fee Details",
        headerInfoGenerator,
        summaryGenerator
      );
    }
  };

  const handlePDF = () => {
    if (feeData.length > 0) {
      generateSinglePDF(
        feeData[0],
        singleRecordColumns,
        "Teacher Unpaid Salary Fee Details",
        `teacher_unpaid_salary_fee_${studentInfo?.teacherUniqueId}`,
        headerInfoGenerator,
        summaryGenerator
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ background: "#035140", color: "#fff" }}>
        Unpaid Teacher Salary Details
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "#fff" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} sx={{ my: 3 }}>
          <SubmitButton onClick={handlePrint} disabled={!feeData.length}>
            Print
          </SubmitButton>
          <CancelButton
            onClick={handlePDF}
            disabled={!feeData.length}
            sx={{ backgroundColor: "#035140" }}
          >
            PDF
          </CancelButton>
        </Stack>
        {isLoading ? (
          <Typography textAlign="center" sx={{ my: 3 }}>
            Loading...
          </Typography>
        ) : isError ? (
          <Typography color="error" textAlign="center" sx={{ my: 3 }}>
            Failed to fetch teacher salary details.
          </Typography>
        ) : !feeData.length ? (
          <Typography textAlign="center" sx={{ my: 3 }}>
            No unpaid teacher salary data found for this teacher.
          </Typography>
        ) : (
          <>
            {/* Teacher Info */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: "#f8f9fa" }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "#035140", mb: 2 }}
              >
                Teacher Information
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Name
                  </Typography>
                  <Typography>{studentInfo?.name || "N/A"}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Teacher ID
                  </Typography>
                  <Typography>
                    {studentInfo?.teacherUniqueId || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Designation
                  </Typography>
                  <Typography>{studentInfo?.designation || "N/A"}</Typography>
                </Box>
              </Box>
            </Paper>

            {/* Fee Table */}
            <Paper>
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {[
                        "SL",
                        "Month",
                        "Year",
                        "Monthly Fee",
                        "advance",
                        "Paid",
                        "Status",
                      ].map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            backgroundColor: "#035140",
                            color: "white",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feeData.map((row, i) => (
                      <TableRow key={row.id}>
                        <TableCell align="center">{i + 1}</TableCell>
                        <TableCell align="center">{row.month}</TableCell>
                        <TableCell align="center">{row.year}</TableCell>
                        <TableCell align="center">
                          ৳{row?.baseSalary.toLocaleString() || "0"}
                        </TableCell>

                        <TableCell align="center">
                          ৳{row?.advance.toLocaleString() || "0"}
                        </TableCell>
                        <TableCell align="center">
                          ৳{row.pay > 0 ? row.pay.toLocaleString() : "0"}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={row.status}
                            color={row.status === "Paid" ? "success" : "error"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Summary */}
            <Paper sx={{ p: 2, mt: 2, backgroundColor: "#f0f7f5" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography fontWeight="bold">Total Unpaid:</Typography>
                <Typography fontWeight="bold" color="error.main">
                  ৳
                  {feeData
                    .reduce((sum, r) => sum + r.netPayable, 0)
                    .toLocaleString()}
                </Typography>
              </Box>
            </Paper>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewSingleUnpaidTeacherFeeReport;
