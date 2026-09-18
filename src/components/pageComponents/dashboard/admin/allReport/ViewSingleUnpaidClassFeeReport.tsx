/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useGetSingleUnpaidClassFeeQuery } from "@/app/store/api/allReport/allReportApi";
import { useSinglePrint } from "@/components/pageComponents/PrintPDFComponent/SinglePrintComponent";
import { useSinglePDF } from "@/components/pageComponents/PrintPDFComponent/SinglePDFComponent";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";

interface StudentFeeData {
  id: number;
  branchId: number;
  studentId: number;
  month: string;
  year: string;
  classFee: number;
  discountType: string;
  discount: number;
  pay: number;
  netPayable: number;
  status: string;
  parentPhone: string;
  fatherName: string;
  paidAt: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    id: number;
    studentUniqueId: string;
    name: string;
    section: { id: number; name: string };
    class: { id: number; name: string };
    stream: { id: number; name: string };
    classRoll: number;
    session: { id: number; name: string };
    parentPhone: string | null;
    fatherName: string | null;
  };
}

interface ViewSingleUnpaidClassFeeReportProps {
  open: boolean;
  onClose: () => void;
  studentId: number | null;
}

const ViewSingleUnpaidClassFeeReport: React.FC<
  ViewSingleUnpaidClassFeeReportProps
> = ({ open, onClose, studentId }) => {
  const { data, isLoading, isError } = useGetSingleUnpaidClassFeeQuery(
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

  const studentInfo = feeData[0]?.student;

    const { printSingleData } = useSinglePrint<any>();
  const { generateSinglePDF } = useSinglePDF<any>();

    // Define columns for single record
  const singleRecordColumns = [
    {
      key: "sl",
      header: "SL",
      render: (row: any, index: number) => (index + 1).toString()
    },
    {
      key: "month",
      header: "Month",
      render: (row: any) => row.month || "N/A"
    },
    {
      key: "year",
      header: "Year",
      render: (row: any) => row.year || "N/A"
    },
    {
      key: "classFee",
      header: "Class Fee",
      render: (row: any) => `৳${row.classFee?.toLocaleString() || "0"}`
    },
    {
      key: "discount",
      header: "Discount",
      render: (row: any) => `৳${row.discount?.toLocaleString() || "0"}`
    },
    {
      key: "paid",
      header: "Paid",
      render: (row: any) => `৳${(row.pay > 0 ? row.pay : 0)?.toLocaleString() || "0"}`
    },
    {
      key: "parent",
      header: "Parent",
      render: (row: any) => 
        `${row.parentPhone || "N/A"} / ${row.fatherName || "N/A"}`
    },
    {
      key: "status",
      header: "Status",
      render: (row: any) => row.status || "N/A"
    }
  ];

  // Header info generator - matching student information
  const headerInfoGenerator = (data: any) => `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
      <div>
        <strong>Name:</strong> ${studentInfo?.name || "N/A"}
      </div>
      <div>
        <strong>Student ID:</strong> ${studentInfo?.studentUniqueId || "N/A"}
      </div>
      <div>
        <strong>Roll:</strong> ${studentInfo?.classRoll || "N/A"}
      </div>
      <div>
        <strong>Class:</strong> ${studentInfo?.class?.name || "N/A"}
      </div>
      <div>
        <strong>Section:</strong> ${studentInfo?.section?.name || "N/A"}
      </div>
      <div>
        <strong>Stream:</strong> ${studentInfo?.stream?.name || "N/A"}
      </div>
    </div>
  `;

  // Summary generator
  const summaryGenerator = (data: any) => `
    <strong>Total Unpaid Amount:</strong> ৳${feeData.reduce((sum, r) => sum + r.netPayable, 0).toLocaleString()}
  `;


   const handlePrint = () => {
    if (feeData.length > 0) {
      printSingleData(
        feeData[0],
        singleRecordColumns,
        "Student Unpaid Fee Details",
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
        "Student Unpaid Fee Details",
        `student_unpaid_fee_${studentInfo?.studentUniqueId}`,
        headerInfoGenerator,
        summaryGenerator
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ background: "#035140", color: "#fff" }}>
        Unpaid Class Fee Details
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "#fff" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>

         <Stack direction="row" spacing={2} sx={{ my: 3 }}>
          <SubmitButton
            onClick={handlePrint}
            disabled={!feeData.length}
          >
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
            Failed to fetch student fee details.
          </Typography>
        ) : !feeData.length ? (
          <Typography textAlign="center" sx={{ my: 3 }}>
            No unpaid fee data found for this student.
          </Typography>
        ) : (
          <>
            {/* Student Info */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: "#f8f9fa" }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "#035140", mb: 2 }}
              >
                Student Information
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
                    Student ID
                  </Typography>
                  <Typography>
                    {studentInfo?.studentUniqueId || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Roll
                  </Typography>
                  <Typography>{studentInfo?.classRoll || "N/A"}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Class
                  </Typography>
                  <Typography>{studentInfo?.class?.name || "N/A"}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Section
                  </Typography>
                  <Typography>{studentInfo?.section?.name || "N/A"}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Stream
                  </Typography>
                  <Typography>{studentInfo?.stream?.name || "N/A"}</Typography>
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
                        "Class Fee",
                        "Discount",
                        "Paid",
                        "Parent",
                        "Status",
                      ].map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            backgroundColor: "#035140",
                            color: "white",
                            fontWeight: "bold",
                            textAlign: "center"
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
                        <TableCell align="center">৳{row.classFee.toLocaleString()}</TableCell>
                        <TableCell align="center">৳{row.discount.toLocaleString()}</TableCell>
                        <TableCell align="center">
                          ৳{row.pay > 0 ? row.pay.toLocaleString() : "0"}
                        </TableCell>
                        <TableCell align="center">
                          <p>{row.parentPhone || "N/A"}</p>
                          <p>{row.fatherName || "N/A"}</p>
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

export default ViewSingleUnpaidClassFeeReport;
