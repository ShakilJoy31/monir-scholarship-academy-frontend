"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
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
import { useGetAllExamsQuery } from "@/app/store/api/classes/examApi";
import { useGetResultByMeQuery } from "@/app/store/api/classes/resultApi";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface Exam {
  id: number;
  name: string;
  isFinal: boolean;
  isPublish: boolean;
}

interface SubjectResult {
  subject: string;
  marks: number;
  grade?: string;
  gradePoint?: number;
  passMarks?: number;
}

interface ResultResponse {
  success: boolean;
  message: string;
  data: {
    student: {
      section: {
        id: number;
        name: string;
      };
      id: number;
      name: string;
      classRoll: number;
      classNameId: number;
      sessionYearId: number;
      session?: {
        id: number;
        name: string;
      };
    };
    results: SubjectResult[];
    gpa: number | null;
    status: string;
  } | null;
}

const StudentResult = () => {
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [isSearched, setIsSearched] = useState(false);

  // Fetch results for the authenticated student
  const {
    data: resultsData,
    isLoading,
    isError,
  } = useGetResultByMeQuery(
    { examId: selectedExam || undefined },
    { skip: !selectedExam || !isSearched }
  );

  const userInfo = getUserInfoFromToken();
  console.log(userInfo?.session?.name)
  // Fetch exams for dropdown
  const { data: examsResponse } = useGetAllExamsQuery({});

  const exams: Exam[] = examsResponse?.data || [];
  const resultResponse: ResultResponse = resultsData || {
    success: false,
    message: "",
    data: null,
  };

  const handleSearch = () => {
    if (!selectedExam) {
      alert("Please select an exam");
      return;
    }
    setIsSearched(true);
  };

  const handleReset = () => {
    setSelectedExam(null);
    setIsSearched(false);
  };

  const getStatus = (marks: number, passMarks = 33) => {
    return marks >= passMarks ? "Passed" : "Failed";
  };

  const handlePrint = () => {
    const printContent = document.getElementById("result-print-content");
    if (printContent && resultResponse?.data) {
      const printWindow = window.open("", "", "width=900,height=600");
      if (printWindow) {
        const selectedExamName = exams.find(exam => exam.id === selectedExam)?.name;

        printWindow.document.write(`
          <html>
            <head>
              
              <style>
                @page {
                  size: A4;
                  margin: 10mm;
                }
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0;
                  padding: 10px;
                  width: 100%;
                  height: 100%;
                  box-sizing: border-box;
                }
                .page-container {
                  width: 100%;
                  height: 100%;
                  display: flex;
                  flex-direction: column;
                }
                .header { 
                  text-align: center; 
                  margin-bottom: 10px; 
                }
                .exam-info { 
                  text-align: center; 
                  margin-bottom: 10px; 
                  font-weight: bold; 
                }
                .student-info { 
                  text-align: center; 
                  margin-bottom: 10px; 
                }
                .session-info, .roll-info, .status-info { 
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
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
                  table-layout: fixed;
                }
                th { 
                  background-color: #f3f4f6; 
                  text-align: left; 
                  padding: 8px; 
                  border: 1px solid #e5e7eb; 
                  font-size: 12px;
                }
                td { 
                  padding: 8px; 
                  border: 1px solid #e5e7eb; 
                  font-size: 12px;
                  word-wrap: break-word;
                }
                .text-center { text-align: center; }
                .footer { 
                  margin-top: 20px; 
                  text-align: right; 
                }
                .signature { 
                  border-top: 1px solid #000; 
                  width: 200px; 
                  display: inline-block; 
                  padding-top: 5px; 
                }
              </style>
            </head>
            <body>
              <div class="page-container">
                <div class="header">
                  <h2 style="margin: 5px 0; font-size: 18px;">Your School Name</h2>
                </div>
                ${selectedExamName ? `<div class="exam-info" style="font-size: 14px;">Exam: ${selectedExamName}</div>` : ''}
                <div class="student-info">
                  <div class="session-info">
                    <p style="margin: 3px 0; font-size: 12px;"><strong>Student Name:</strong> ${resultResponse.data.student?.name || "-"}</p>
                    ${userInfo?.session?.name ? `<p style="margin: 3px 0; font-size: 12px;"><strong>Session:</strong> ${userInfo?.session?.name}</p>` : ""}
                  </div>
                  <div class="roll-info">
                    <p style="margin: 3px 0; font-size: 12px;"><strong>Roll Number:</strong> ${resultResponse.data.student?.classRoll || "-"}</p>
                    <p style="margin: 3px 0; font-size: 12px;"><strong>Class:</strong> ${userInfo?.class?.name || "-"}</p>
                  </div>
                  <div class="status-info">
                    <p style="margin: 3px 0; font-size: 12px;"><strong>Status:</strong> 
                      <span class="status ${resultResponse.data.status === "COMPLETE" ? "status-complete" : "status-pending"}">
                        ${resultResponse.data.status || "-"}
                      </span>
                    </p>
                    ${resultResponse.data.gpa !== null ? `<p style="margin: 3px 0; font-size: 12px;"><strong>GPA:</strong> ${resultResponse.data.gpa}</p>` : ""}
                  </div>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th style="width: 40%;">Subject</th>
                      <th style="width: 15%;" class="text-center">Marks</th>
                      <th style="width: 15%;" class="text-center">Grade</th>
                      <th style="width: 15%;" class="text-center">Grade Point</th>
                      <th style="width: 15%;" class="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
        `);

        // Table rows
        resultResponse.data.results?.forEach((result) => {
          const status = getStatus(result.marks, result.passMarks || 33);
          printWindow.document.write(`
            <tr>
              <td>${result.subject}</td>
              <td class="text-center">${result.marks}</td>
              <td class="text-center">${result.grade || "N/A"}</td>
              <td class="text-center">${result.gradePoint || "N/A"}</td>
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
                <div class="footer">
                  <div class="signature">Principal's Signature</div>
                </div>
              </div>
            </body>
          </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        // Wait for content to load before printing
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  const handleDownloadPDF = () => {
    if (!resultResponse.data) return;

    const pdf = new jsPDF("portrait", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 40;
    let y = 60;

    // School Header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Your School Name", pageWidth / 2, y, { align: "center" });
    y += 25;

    // Exam Name
    const selectedExamName = exams.find(exam => exam.id === selectedExam)?.name;
    if (selectedExamName) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text(`Exam: ${selectedExamName}`, pageWidth / 2, y, { align: "center" });
      y += 20;
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(16);
    // pdf.text("Student Result", pageWidth / 2, y, { align: "center" });
    // y += 40;

    // Student Info
    pdf.setFontSize(12);

    // Name and Session
    pdf.text(
      `Student Name: ${resultResponse.data.student?.name || "-"}`,
      margin,
      y
    );
    if (userInfo?.session?.name) {
      pdf.text(
        `Session: ${userInfo?.session?.name}`,
        pageWidth - margin,
        y,
        { align: "right" }
      );
    }
    y += 20;

    // Roll and Section
    pdf.text(
      `Roll Number: ${resultResponse.data.student?.classRoll || "-"}`,
      margin,
      y
    );
    if (userInfo?.class?.name) {
      pdf.text(
        `Class: ${userInfo?.class?.name}`,
        pageWidth - margin,
        y,
        { align: "right" }
      );
    }
    y += 20;

    // Status and GPA
    const status = resultResponse.data.status || "-";
    pdf.text(`Status: ${status}`, margin, y);
    if (resultResponse.data.gpa !== null) {
      pdf.text(`GPA: ${resultResponse.data.gpa}`, pageWidth - margin, y, {
        align: "right",
      });
    }
    y += 15;

    // Table Setup
    const availableWidth = pageWidth - margin * 2;
    const colWidths = [
      availableWidth * 0.4, // Subject
      availableWidth * 0.15, // Marks
      availableWidth * 0.15, // Grade
      availableWidth * 0.15, // Grade Point
      availableWidth * 0.15, // Status
    ];

    const tableX = margin;
    let tableY = y;

    // Table Headers
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);

    const headers = ["Subject", "Marks", "Grade", "Grade Point", "Status"];

    // Draw header row with borders
    let x = tableX;
    headers.forEach((header, i) => {
      pdf.rect(x, tableY, colWidths[i], 25, "D"); // Border only
      pdf.text(header, x + colWidths[i] / 2, tableY + 16, {
        align: "center",
      });
      x += colWidths[i];
    });

    tableY += 25;

    // Table Content
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    resultResponse.data.results?.forEach((result) => {
      // Page break check
      if (tableY > pdf.internal.pageSize.height - 50) {
        pdf.addPage();
        tableY = margin;

        // Redraw headers on new page
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        x = tableX;
        headers.forEach((header, i) => {
          pdf.rect(x, tableY, colWidths[i], 25, "D");
          pdf.text(header, x + colWidths[i] / 2, tableY + 16, {
            align: "center",
          });
          x += colWidths[i];
        });
        tableY += 25;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
      }

      const status = getStatus(result.marks, result.passMarks || 33);

      const rowData = [
        result.subject,
        result.marks.toString(),
        result.grade || "N/A",
        result.gradePoint?.toString() || "N/A",
        status,
      ];

      // Draw content row with borders
      x = tableX;
      rowData.forEach((data, i) => {
        pdf.rect(x, tableY, colWidths[i], 25, "D");
        // Center text in cell (right align for status)
        const align = i === 4 ? "right" : "center";
        pdf.text(data, x + (i === 4 ? colWidths[i] - 10 : colWidths[i] / 2), tableY + 16, {
          align: align,
          maxWidth: colWidths[i] - 10,
        });
        x += colWidths[i];
      });

      tableY += 25;
    });

    // Footer with signature
    const footerY = pdf.internal.pageSize.height - 40;
    pdf.setFontSize(12);
    pdf.text("Principal's Signature", pageWidth - margin - 100, footerY);
    pdf.line(
      pageWidth - margin - 100,
      footerY + 5,
      pageWidth - margin,
      footerY + 5
    );

    // Save PDF
    pdf.save(
      `result_${resultResponse.data.student?.name?.replace(/\s+/g, "_") || "student"
      }_${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  return (
    <Box>
      <PageHeader title="My Results" />

      {/* Filter Section */}
      <Paper elevation={3} className="p-6 mb-8">
        <Typography variant="h6" gutterBottom className="mb-4">
          Search Result
        </Typography>
        <div className="flex w-full lg:w-[30vw] items-center gap-4">
          
            <FormControl fullWidth>
              <InputLabel id="exam-select-label">Exam</InputLabel>
              <Select
                labelId="exam-select-label"
                sx={{ height: 40 }}
                id="exam-select"
                value={selectedExam || ""}
                label="Exam"
                onChange={(e) => setSelectedExam(Number(e.target.value))}
              >
                {exams.map((exam) => (
                  <MenuItem key={exam.id} value={exam.id}>
                    {exam.name} {exam.isFinal && "(Final)"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          
          <div className="flex justify-center gap-4">

            <CancelButton onClick={handleReset}>Reset</CancelButton>
            <SubmitButton onClick={handleSearch}>Search</SubmitButton>

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
          Error loading results. Please try again.
        </Alert>
      ) : isSearched && !resultResponse.data ? (
        <Alert severity="info" className="mb-8">
          No results found for the selected exam.
        </Alert>
      ) : isSearched && resultResponse.data ? (
        <>
          {/* Hidden content for printing */}
          <div id="result-print-content" style={{ display: "none" }}>
            <div className="header">
              <h2>Your School Name</h2>
              <h3>Student Result</h3>
            </div>
            <div className="student-info">
              <p>
                <strong>Student Name:</strong>{" "}
                {resultResponse.data.student.name}
              </p>
              {resultResponse.data.student.session && (
                <p>
                  <strong>Student Session:</strong>{" "}
                  {resultResponse.data.student.session.name}
                </p>
              )}
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
                  const status = getStatus(
                    result.marks,
                    result.passMarks || 33
                  );
                  return (
                    <tr key={index}>
                      <td>{result.subject}</td>
                      <td className="text-center">{result.marks}</td>
                      <td className="text-center">{result.grade || "N/A"}</td>
                      <td className="text-center">
                        {result.gradePoint || "N/A"}
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
            <div className="footer">
              <div className="signature">Principal&apos;s Signature</div>
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
              <SubmitButton onClick={handlePrint}>Print</SubmitButton>
              <SubmitButton onClick={handleDownloadPDF}>PDF</SubmitButton>
            </Box>

            <Typography
              variant="h6"
              gutterBottom
              className="mb-4 text-center"
              sx={{ mt: { xs: 10, sm: 10 } }}
            >
              Your School Name
            </Typography>
            {selectedExam && (
              <Typography variant="h6" gutterBottom className="mb-2 text-center">
                Exam: {exams.find(exam => exam.id === selectedExam)?.name}
              </Typography>
            )}

            <div className="mb-6 text-center">
              <div className="flex justify-between items-center">
                <Typography variant="subtitle1">
                  Name: {resultResponse.data.student.name}
                </Typography>

                <Typography variant="subtitle1">
                  Session: {userInfo?.session?.name}
                </Typography>

              </div>
              <div className="flex justify-between items-center">
                <Typography variant="subtitle1">
                  Roll: {resultResponse.data.student.classRoll}
                </Typography>

                <Typography variant="subtitle1">
                  Class: {userInfo?.class?.name}
                </Typography>

              </div>
              <div className="flex justify-between items-center">
                <Typography variant="subtitle1">
                  Status:{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${resultResponse.data.status === "COMPLETE"
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
                        {result.grade || "N/A"}
                      </TableCell>
                      <TableCell align="center">
                        {result.gradePoint || "N/A"}
                      </TableCell>
                      <TableCell align="right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatus(result.marks, result.passMarks || 33) ===
                            "Passed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                        >
                          {getStatus(result.marks, result.passMarks || 33)}
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
          Please select an exam and hit the search button
        </p>
      )}
    </Box>
  );
};

export default StudentResult;
