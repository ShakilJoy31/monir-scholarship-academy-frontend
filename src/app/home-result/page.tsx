"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import jsPDF from "jspdf";
import Footer from "@/components/pageComponents/publicComponent/footer/page";
import PublicNavigation from "@/components/pageComponents/publicComponent/publicNavigation/page";
import { useGetAllExamsQuery } from "@/app/store/api/classes/examApi";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetResultByStudentQuery } from "@/app/store/api/classes/resultApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { useGetBranchConfigQuery } from "../store/api/branch/branchApi";

interface ApiErrorResponse {
  status: number;
  data: {
    message: string;
  };
}

interface Session {
  id: number;
  name: string;
}

interface Exam {
  id: number;
  name: string;
}

interface Class {
  id: number;
  name: string;
}

interface SubjectResult {
  subject: string;
  marks: number;
  grade?: string;
  gradePoint?: number;
}

interface ResultResponse {
  success: boolean;
  message: string;
  data: {
    student: {
      class: {
        id: number;
        name: string;
      };
      section: {
        id: number;
        name: string;
      };
      session: {
        id: number;
        name: string;
      };
      id: number;
      name: string;
      classRoll: number;
      classNameId: number;
      sessionYearId: number;
    };
    results: SubjectResult[];
    gpa: number | null;
    status: string;
  } | null;
}

const ResultComponent = () => {
  const [examId, setExamId] = useState<number | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [roll, setRoll] = useState<string>("");

  const [searchParams, setSearchParams] = useState<{
    examId: number | undefined;
    classId: number | undefined;
    sessionId: number | undefined;
    roll: string | undefined;
  } | null>(null);

  // Fetch exams, classes, and sessions for dropdowns
  const { data: examsData } = useGetAllExamsQuery({
    page: 1,
    size: 1000000,
  });
  const { data: classesData } = useGetAllClassQuery({
    page: 1,
    size: 1000000,
  });
  const { data: sessionsData } = useGetAllSessionsQuery({
    page: 1,
    size: 1000000,
  });

  // Fetch results when search is clicked
  const {
    data: resultsData,
    isLoading,
    isError,
    error
  } = useGetResultByStudentQuery(
    searchParams || {
      examId: undefined,
      classId: undefined,
      sessionId: undefined,
      roll: undefined,
    },
    { skip: !searchParams } // Skip unless searchParams exists
  );


  // Fetching branch name, email, address and logo. 
      const currentBranchId =
        typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("selectedBranch") || "null")?.id
            : null;
  const { data: branchConfigData } = useGetBranchConfigQuery(currentBranchId)
  const branchInfo = branchConfigData?.data;

  const exams: Exam[] = examsData?.data || [];
  const classes: Class[] = classesData?.data || [];
  const sessions: Session[] = sessionsData?.data || [];
  const resultResponse: ResultResponse = resultsData || {
    success: false,
    message: "",
    data: null,
  };
  const handleSearch = () => {
    if (!examId || !classId || !sessionId || !roll) {
      return;
    }
    setSearchParams({
      examId: examId || undefined,
      classId: classId || undefined,
      sessionId: sessionId || undefined,
      roll: roll || undefined,
    });
  };

  const handleReset = () => {
    setExamId(null);
    setClassId(null);
    setSessionId(null);
    setRoll("");
    setSearchParams(null); // Clear search results
  };

  const getStatus = (marks: number, passMarks = 33) => {
    return marks >= passMarks ? "Passed" : "Failed";
  };

  const handlePrint = () => {
    const printContent = document.getElementById("result-print-content");
    if (printContent && resultResponse?.data) {
      const printWindow = window.open("", "", "width=800,height=600");
      if (printWindow) {
        printWindow.document.write(`
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 10px; 
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 10px; 
            }
            .student-info { 
              margin-bottom: 5px; 
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .status { 
              padding: 2px 8px;
              border-radius: 9999px;
              font-size: 0.75rem;
              display: inline-block;
            }
            .status-passed { background-color: #dcfce7; color: #166534; }
            .status-failed { background-color: #fee2e2; color: #991b1b; }
            .status-complete { background-color: #fef9c3; color: #854d0e; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 10px;
              font-size: 11px;
              page-break-inside: avoid;
            }
            th { 
              background-color: #f3f4f6; 
              text-align: left; 
              padding: 8px; 
              border: 1px solid #e5e7eb; 
              font-size: 11px;
            }
            td { 
              padding: 8px; 
              border: 1px solid #e5e7eb; 
            }
            .text-center { text-align: center; }
            .footer { 
              margin-top: 20px; 
              display: flex;
              justify-content: flex-end;
            }
            .signature-container {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .signature-line {
              border-top: 1px solid #000;
              width: 200px;
              margin-top: 5px;
            }
            .signature-text {
              margin-top: 5px;
            }
            @page {
              size: A4;
              margin: 10mm;
            }
          </style>
        </head>
        <body>
      `);

        // School header
        printWindow.document.write(`
      <div class="header">
        <h2 style="margin-bottom: 5px; font-size: 18px;">${branchInfo?.schoolName}</h2>
      </div>
    `);

        // Exam name
        const selectedExam = exams.find(exam => exam.id === examId);
        if (selectedExam) {
          printWindow.document.write(`
          <div class="header">
            <h3 style="margin: 5px 0; font-size: 14px;">Exam: ${selectedExam.name}</h3>
          </div>
        `);
        }

        // Student info
        printWindow.document.write(`
      <div class="student-info">
        <div class="info-row">
          <p><strong>Student Name:</strong> ${resultResponse.data.student?.name || "-"}</p>
          <p><strong>Student Session:</strong> ${resultResponse.data.student?.session?.name || "-"}</p>
        </div>
        <div class="info-row">
          <p><strong>Roll Number:</strong> ${resultResponse.data.student?.classRoll || "-"}</p>
          <p><strong>Section:</strong> ${resultResponse.data.student?.section?.name || "-"}</p>
        </div>
        <div class="info-row">
          <p><strong>Status:</strong> 
            <span class="status ${resultResponse.data.status === "COMPLETE" ? "status-complete" : "status-pending"}">
              ${resultResponse.data.status || "-"}
            </span>
          </p>
          ${resultResponse.data.gpa !== null ? `<p><strong>GPA:</strong> ${resultResponse.data.gpa}</p>` : ""}
        </div>
      </div>
    `);

        // Table
        printWindow.document.write(`
      <table>
        <thead>
          <tr>
            <th style="width: 35%;">Subject</th>
            <th style="width: 15%;" class="text-center">Marks</th>
            <th style="width: 15%;" class="text-center">Grade</th>
            <th style="width: 15%;" class="text-center">Grade Point</th>
            <th style="width: 20%;" class="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
    `);

        resultResponse.data.results?.forEach((result) => {
          const status = getStatus(result.marks);
          printWindow.document.write(`
        <tr>
          <td>${result.subject}</td>
          <td class="text-center">${result.marks}</td>
          <td class="text-center">${result.grade || "-"}</td>
          <td class="text-center">${result.gradePoint || "-"}</td>
          <td class="text-center">
            <span class="status ${status === "Passed" ? "status-passed" : "status-failed"}">
              ${status}
            </span>
          </td>
        </tr>
      `);
        });

        printWindow.document.write(`
        </tbody>
      </table>

      <!-- Footer with principal signature -->
      <div class="footer">
        <div class="signature-container">
          <img src="${branchInfo?.principalSignature}" width="70" height="60" alt="Principal Signature" style="object-fit: cover;" />
          <div class="signature-line"></div>
          <div class="signature-text">Principal's Signature</div>
        </div>
      </div>
    `);

        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };


const handleDownloadPDF = async () => {
  if (!resultResponse?.data) return;

  const pdf = new jsPDF("portrait", "pt", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 40;
  let y = 60;

  const student = resultResponse.data.student;

  // Header
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(branchInfo?.schoolName, pageWidth / 2, y, { align: "center" });
  y += 30;

  // Exam name
  const selectedExam = exams.find(exam => exam.id === examId);
  if (selectedExam) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text(`Exam: ${selectedExam.name}`, pageWidth / 2, y, { align: "center" });
    y += 30;
  }

  // Student Info
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);

  pdf.text(`Student Name: ${student.name || "-"}`, margin, y);
  pdf.text(`Session: ${student.session?.name || "-"}`, pageWidth - margin, y, { align: "right" });
  y += 20;

  pdf.text(`Roll Number: ${student.classRoll || "-"}`, margin, y);
  pdf.text(`Class: ${student.class?.name || "-"}`, pageWidth - margin, y, { align: "right" });
  y += 20;

  const status = resultResponse.data.status || "-";
  const gpa = resultResponse.data.gpa !== null ? resultResponse.data.gpa : null;
  pdf.text(`Status: ${status}`, margin, y);
  if (gpa !== null) pdf.text(`GPA: ${gpa}`, pageWidth - margin, y, { align: "right" });
  y += 15;

  // Table setup
  const availableWidth = pageWidth - margin * 2;
  const colWidths = [availableWidth * 0.35, availableWidth * 0.15, availableWidth * 0.15, availableWidth * 0.15, availableWidth * 0.20];
  const headers = ["Subject", "Marks", "Grade", "Grade Point", "Status"];
  let tableY = y;

  const drawTableHeaders = () => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    let x = margin;
    headers.forEach((header, i) => {
      pdf.rect(x, tableY, colWidths[i], 25, 'S');
      pdf.text(header, x + colWidths[i] / 2, tableY + 16, { align: "center" });
      x += colWidths[i];
    });
    tableY += 25;
  };

  drawTableHeaders();

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  resultResponse.data.results?.forEach((result) => {
    if (tableY > pdf.internal.pageSize.height - 120) {
      pdf.addPage();
      tableY = margin;
      drawTableHeaders();
    }

    const rowData = [result.subject, result.marks.toString(), result.grade || "-", result.gradePoint?.toString() || "-", getStatus(result.marks)];
    let x = margin;
    rowData.forEach((cell, i) => {
      pdf.rect(x, tableY, colWidths[i], 25, 'S');
      pdf.text(cell, x + colWidths[i] / 2, tableY + 16, { align: "center", maxWidth: colWidths[i] - 10 });
      x += colWidths[i];
    });

    tableY += 25;
  });

  // Footer: Principal signature section - RIGHT ALIGNED
  const footerY = pdf.internal.pageSize.height - 100;

  // Signature configuration for right alignment
  const lineWidth = 200;
  const signatureWidth = 70;
  const signatureHeight = 60;
  
  // Right alignment - position from the right edge
  const signatureRightMargin = margin;
  const lineStartX = pageWidth - signatureRightMargin - lineWidth;
  const lineEndX = pageWidth - signatureRightMargin;
  const signatureCenterX = lineStartX + (lineWidth / 2);
  const signatureX = signatureCenterX - (signatureWidth / 2);
  const signatureY = footerY - 75;
  const textX = signatureCenterX;

  // Add principal signature image if available
  if (branchInfo?.principalSignature) {
    try {
      // Create a new promise to handle image loading
      const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
      };

      // Load the image
      const img = await loadImage(branchInfo.principalSignature);
      
      // Create a canvas to draw the image
      const canvas = document.createElement('canvas');
      canvas.width = 70;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw the image on canvas
        ctx.drawImage(img, 0, 0, 70, 60);
        
        // Convert canvas to data URL
        const imgData = canvas.toDataURL('image/png');
        
        // Add signature image centered above the line (right aligned)
        pdf.addImage(imgData, 'PNG', signatureX, signatureY, signatureWidth, signatureHeight);
      }
    } catch (error) {
      console.error("Error adding signature image to PDF:", error);
      // The text and line are already added, so just continue
    }
  }

  // Add signature line and text (right aligned, with image centered above line)
  pdf.setDrawColor(0, 0, 0);
  pdf.line(lineStartX, footerY, lineEndX, footerY); // line
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.text("Principal's Signature", textX, footerY + 15, { align: "center" });

  pdf.save(`result_${student.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

  return (
    <>
      <div className="bg-[#035140]">
        <PublicNavigation />
      </div>
      <div className="px-6 lg:px-24 py-8 min-h-[80vh]">
        <Typography variant="h4" gutterBottom className="text-center mb-8">
          Student Result
        </Typography>

        {/* Filter Section */}
        <Paper elevation={3} className="p-6 mb-8 md:w-3/6 lg:w-2/6 mx-auto">
          {/* <Typography sx={{alignItems: "center",}} variant="h6" gutterBottom className="mb-4">
            Search Result
          </Typography> */}
          <div className=" space-y-3">
            <div className="text-center">
              {/* Session Select */}
              <FormControl fullWidth sx={{ py: 1 }}>
                <InputLabel id="session-select-label">Session</InputLabel>
                <Select
                  labelId="session-select-label"
                  id="session-select"
                  value={sessionId || ""}
                  label="Session"
                  onChange={(e) => setSessionId(Number(e.target.value))}
                  sx={{
                    height: 42,
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center", // Vertically center text
                    },
                  }}
                >
                  {sessions.map((session) => (
                    <MenuItem key={session.id} value={session.id}>
                      {session.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Class Select */}
              <FormControl fullWidth sx={{ py: 1 }}>
                <InputLabel id="class-select-label">Class</InputLabel>
                <Select
                  labelId="class-select-label"
                  id="class-select"
                  value={classId || ""}
                  label="Class"
                  onChange={(e) => setClassId(Number(e.target.value))}
                  sx={{
                    height: 42,
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Exam Select */}
              <FormControl fullWidth sx={{ py: 1 }}>
                <InputLabel id="exam-select-label">Exam</InputLabel>
                <Select
                  labelId="exam-select-label"
                  id="exam-select"
                  value={examId || ""}
                  label="Exam"
                  onChange={(e) => setExamId(Number(e.target.value))}
                  sx={{
                    height: 42,
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                >
                  {exams.map((exam) => (
                    <MenuItem key={exam.id} value={exam.id}>
                      {exam.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Roll Number TextField */}
              <FormControl fullWidth sx={{ pt: 1 }}>
                <TextField
                  fullWidth
                  label="Roll Number"
                  value={roll}
                  onChange={(e) => setRoll(e.target.value)}
                  sx={{
                    "& .MuiInputBase-root": {
                      height: 42,
                    },
                    "& .MuiInputLabel-root": {
                      lineHeight: "12px", // Match the input height
                    },
                    "& .MuiOutlinedInput-input": {
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                />
              </FormControl>
            </div>
            <div className="flex justify-center gap-4">
              <SubmitButton
                color="primary"
                onClick={handleSearch}
              >
                Search
              </SubmitButton>
              <CancelButton onClick={handleReset}>
                Reset
              </CancelButton>
            </div>
          </div>
        </Paper>

        {/* Results Section */}
        {isLoading ? (
          <Box className="flex justify-center p-8">
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" className="mb-8">
            {error && 'status' in error && typeof error.status === 'number'
              ? (error as ApiErrorResponse).data.message
              : 'An unknown error occurred'}
          </Alert>
        ) : searchParams && !resultResponse.data ? (
          <Alert severity="info" className="mb-8">
            No results found for the given criteria.
          </Alert>
        ) : searchParams && resultResponse.data ? (
          <>
            {/* Hidden content for printing */}
            <div id="result-print-content" style={{ display: "none" }}>
              <div className="header">
                <h2>{branchInfo?.schoolName}</h2>
                <h3>Student Result</h3>
              </div>
              <div className="student-info">
                <p>
                  <strong>Student Name:</strong>{" "}
                  {resultResponse.data.student.name}
                </p>
                <p>
                  <strong>Student Session:</strong>{" "}
                  {resultResponse.data.student.session?.name}
                </p>
                <p>
                  <strong>Roll Number:</strong>{" "}
                  {resultResponse.data.student.classRoll}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    className={`status ${resultResponse.data.status === "COMPLETE"
                      ? "status-complete"
                      : "status-pending"
                      }`}
                  >
                    {resultResponse.data.status}
                  </span>
                </p>
                {resultResponse.data.gpa !== null && (
                  <p>
                    <strong>GPA:</strong> {resultResponse.data.gpa}
                  </p>
                )}
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th className="text-center">Marks</th>
                    <th className="text-center">Grade</th>
                    <th className="text-center">Grade Point</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {resultResponse.data.results.map((result, index) => {
                    const status = getStatus(result.marks);
                    return (
                      <tr key={index}>
                        <td>{result.subject}</td>
                        <td className="text-center">{result.marks}</td>
                        <td className="text-center">{result.grade || "-"}</td>
                        <td className="text-center">
                          {result.gradePoint || "-"}
                        </td>
                        <td className="text-center">
                          <span
                            className={`status ${status === "Passed"
                              ? "status-passed"
                              : "status-failed"
                              }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="footer" style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {/* Principal Signature Image */}
                  <img
                    src={branchInfo?.principalSignature}
                    width={70}
                    height={60}
                    alt="Principal Signature"
                    style={{ objectFit: "cover" }}
                  />
                  {/* Line under signature */}
                  <div style={{
                    borderTop: "1px solid #000",
                    width: "200px",
                    marginTop: "5px"
                  }} />
                  {/* Text under line */}
                  <div style={{ marginTop: "5px", textAlign: "center" }}>
                    Principal&apos;s Signature
                  </div>
                </div>
              </div>

            </div>

            {/* Visible content */}
            <Paper elevation={3} className="p-6 relative">
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  display: "flex",
                  gap: 1,
                  mb: { xs: 10, sm: 10 },
                }}
              >
                <SubmitButton
                  onClick={handlePrint}

                >
                  Print
                </SubmitButton>
                <CancelButton
                  onClick={handleDownloadPDF}

                >
                  PDF
                </CancelButton>
              </Box>

              <Typography
                variant="h6"
                gutterBottom
                className="mb-4 text-center"
                sx={{ mt: { xs: 10, sm: 10 } }}
              >
                {branchInfo?.schoolName}
              </Typography>
              {examId && (
                <Typography variant="h6" gutterBottom className="mb-4 text-center">
                  Exam: {exams.find(exam => exam.id === examId)?.name}
                </Typography>
              )}
              <div className="mb-6 text-center">
                <div className="flex justify-between items-center">
                  <Typography variant="subtitle1">
                    Name: {resultResponse.data.student.name}
                  </Typography>
                  <Typography variant="subtitle1">
                    Session: {resultResponse.data.student.session?.name}
                  </Typography>
                </div>
                <div className="flex justify-between items-center">
                  <Typography variant="subtitle1">
                    Roll: {resultResponse.data.student.classRoll}
                  </Typography>
                  <Typography variant="subtitle1">
                    Class: {resultResponse.data.student.class?.name}
                  </Typography>
                </div>
                <div className="flex justify-between items-center">
                  <Typography variant="subtitle1">
                    Status:{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${resultResponse.data.status === "PASSED"
                        ? "bg-green-600 text-white"
                        : "bg-red-500 text-white"
                        }`}
                    >
                      {resultResponse.data.status}
                    </span>
                  </Typography>
                  {resultResponse.data.gpa !== null && (
                    <Typography variant="subtitle1">
                      GPA: {resultResponse.data.gpa}
                    </Typography>
                  )}
                </div>
              </div>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow className="bg-gray-100">
                      <TableCell>Subject</TableCell>
                      <TableCell align="center">Marks</TableCell>
                      <TableCell align="center">Grade</TableCell>
                      <TableCell align="center">Grade Point</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resultResponse.data.results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{result.subject}</TableCell>
                        <TableCell align="center">{result.marks}</TableCell>
                        <TableCell align="center">
                          {result.grade || "-"}
                        </TableCell>
                        <TableCell align="center">
                          {result.gradePoint || "-"}
                        </TableCell>
                        <TableCell align="right">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatus(result.marks) === "Passed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                              }`}
                          >
                            {getStatus(result.marks)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        ) : (
          <p className="text-sm text-center">
            Please select the exam class session roll and hit the search button
          </p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ResultComponent;
