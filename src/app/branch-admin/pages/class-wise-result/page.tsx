"use client";

import React, { useState, useMemo } from "react";
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
} from "@mui/material";
import { Download } from "lucide-react";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { useGetAllExamsQuery } from "@/app/store/api/classes/examApi";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import jsPDF from "jspdf";
import { useGetStudentsByClassForResultQuery } from "@/app/store/api/student/studentApi";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { theStar } from "@/lib/requiredJSX";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";
import html2canvas from "html2canvas-pro";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";

interface StudentResult {
  studentId: number;
  name: string;
  roll: number;
  results: {
    subject: string;
    marks: number;
    grade: string;
    gradePoint: number;
  }[];
  gpa: number | null;
  status: "PASSED" | "FAILED" | "INCOMPLETE";
  [key: string]: unknown;
}

interface Exam {
  id: number;
  name: string;
}

interface Class {
  id: number;
  name: string;
}

const ClassWiseResult = () => {
  const [filterExam, setFilterExam] = useState<number | null>(null);
  const [filterClass, setFilterClass] = useState<number | null>(null);
  const [isSearched, setIsSearched] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch exams for dropdown
  const { data: examsResponse } = useGetAllExamsQuery({});

  // Fetch classes for dropdown
  const { data: classesResponse } = useGetAllClassQuery({
    page: 1,
    size: 100000,
  });

  // Fetch results with filters
  const {
    data: resultsResponse,
    isLoading,
    isError,
  } = useGetStudentsByClassForResultQuery(
    {
      examId: filterExam || undefined,
      classId: filterClass || undefined,
    },
    {
      skip: !(filterExam && filterClass && isSearched),
    }
  );

  // Fetching branch name, email, address and logo.
  const userInfo = getUserInfoFromToken();
  const { data: branchConfigData } = useGetBranchConfigQuery(
    userInfo?.branchId
  );

  const branchInfo = branchConfigData?.data;

  const exams: Exam[] = examsResponse?.data || [];
  const allClasses: Class[] = Array.isArray(classesResponse?.data)
    ? classesResponse.data
    : classesResponse?.data || [];
  const results: StudentResult[] = resultsResponse?.data || [];

  // ✅ Compute the full list of unique subjects across ALL students.
  // This is the correct source of truth for the column headers.
  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    results.forEach((student) => {
      student.results?.forEach((r) => {
        if (r.subject) set.add(r.subject);
      });
    });
    return Array.from(set);
  }, [results]);

  const applyFilters = () => {
    setIsSearched(true);
  };

  const resetFilters = () => {
    setFilterExam(null);
    setFilterClass(null);
    setIsSearched(false);
  };

  //! =================== PRINT ===================
  const handlePrint = () => {
    if (!results.length || !filterExam || !filterClass) return;

    const examName = exams.find((e) => e.id === filterExam)?.name || "";
    const className = allClasses.find((c) => c.id === filterClass)?.name || "";

    const printWindow = window.open("", "", "width=1200,height=800");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Class Results - ${examName} - ${className}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .school-name { font-size: 18pt; font-weight: bold; margin-bottom: 10px; }
            .title { font-size: 16pt; margin-bottom: 10px; }
            .exam-info { font-size: 12pt; color: #555; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #f2f2f2; color: #000; text-align: center; padding: 8px; border: 1px solid #ddd; }
            td { padding: 8px; border: 1px solid #ddd; text-align: center; vertical-align: middle; }
            .footer { margin-top: 50px; text-align: right; }
            .signature { border-top: 1px solid #000; width: 200px; padding-top: 5px; display: inline-block; }
            .student-name { text-align: left; padding-left: 10px !important; }
            .passed { background-color: #e6ffed; }
            .failed { background-color: #ffebee; }
            .incomplete { background-color: #fff8e1; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">${branchInfo?.schoolName || ""}</div>
            <div class="title">Class Wise Results</div>
            <div class="exam-info">
              Exam: ${examName} | Class: ${className} | Date: ${new Date().toLocaleDateString()}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Student Name</th>
                <th>Roll</th>
                ${allSubjects.map((s) => `<th>${s}</th>`).join("")}
                <th>GPA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
    `);

    results.forEach((student, index) => {
      const statusClass =
        student.status === "PASSED"
          ? "passed"
          : student.status === "FAILED"
          ? "failed"
          : "incomplete";

      const subjectMap = new Map(
        student.results.map((r) => [r.subject, r])
      );

      const subjectCells = allSubjects
        .map((subject) => {
          const result = subjectMap.get(subject);
          if (!result) return `<td>-</td>`;
          return `
            <td>
              ${result.marks}<br>
              <small>${result.grade} (GPA ${result.gradePoint})</small>
            </td>
          `;
        })
        .join("");

      printWindow.document.write(`
        <tr class="${statusClass}">
          <td>${index + 1}</td>
          <td class="student-name">${student.name}</td>
          <td>${student.roll}</td>
          ${subjectCells}
          <td>${student.gpa !== null ? student.gpa.toFixed(2) : "-"}</td>
          <td>${student.status}</td>
        </tr>
      `);
    });

    printWindow.document.write(`
            </tbody>
          </table>
          <div style="display: flex; justify-content: flex-end;">
            <div style="display: flex; flex-direction: column; align-items: center;">
              <img src="${branchInfo?.principalSignature || ""}" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
              <div class="signature">Principal's Signature</div>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  //! =================== PDF DOWNLOAD (jsPDF only, no DOM) ===================
  const downloadPDF = async () => {
    if (!results.length || !filterExam || !filterClass) return;
    if (isDownloading) return;

    setIsDownloading(true);

    try {
      const examName = exams.find((e) => e.id === filterExam)?.name || "";
      const className =
        allClasses.find((c) => c.id === filterClass)?.name || "";

      // Fixed column widths
      const fixedColWidths = {
        sl: 30,
        name: 130,
        roll: 45,
        gpa: 55,
        status: 80,
      };
      const subjectWidth = 95;

      const totalWidth =
        fixedColWidths.sl +
        fixedColWidths.name +
        fixedColWidths.roll +
        subjectWidth * allSubjects.length +
        fixedColWidths.gpa +
        fixedColWidths.status;

      const margin = 30;
      const pageHeight = 595; // A4 landscape height (pt)
      const pageWidth = Math.max(totalWidth + margin * 2, 842); // min A4 landscape width

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: [pageWidth, pageHeight],
      });

      let y = 50;

      // ---- Header ----
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text(branchInfo?.schoolName || "", pageWidth / 2, y, {
        align: "center",
      });
      y += 22;

      pdf.setFontSize(13);
      pdf.text("Class Wise Results", pageWidth / 2, y, { align: "center" });
      y += 22;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(85);
      pdf.text(
        `Exam: ${examName} | Class: ${className} | Date: ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        y,
        { align: "center" }
      );
      pdf.setTextColor(0);
      y += 22;

      // ---- Column setup ----
      const colWidths = [
        fixedColWidths.sl,
        fixedColWidths.name,
        fixedColWidths.roll,
        ...Array(allSubjects.length).fill(subjectWidth),
        fixedColWidths.gpa,
        fixedColWidths.status,
      ];

      const headers = [
        "SL",
        "Student Name",
        "Roll",
        ...allSubjects,
        "GPA",
        "Status",
      ];

      const drawRow = (
        cells: string[],
        yPos: number,
        isHeader = false,
        rowHeight = 26
      ) => {
        let x = margin;
        pdf.setFont("helvetica", isHeader ? "bold" : "normal");
        pdf.setFontSize(isHeader ? 9 : 8);
        pdf.setTextColor(0);

        for (let i = 0; i < cells.length; i++) {
          const width = colWidths[i];
          pdf.rect(x, yPos, width, rowHeight);

          // Left-align the student name column (index 1)
          const align = i === 1 ? "left" : "center";
          const textX = i === 1 ? x + 4 : x + width / 2;

          // Handle newlines in subject cells (marks\nGrade)
          const lines = String(cells[i]).split("\n");
          lines.forEach((line, idx) => {
            pdf.text(line, textX, yPos + 11 + idx * 10, { align });
          });

          x += width;
        }
      };

      // ---- Header row ----
      drawRow(headers, y, true, 28);
      y += 28;

      // ---- Data rows ----
      for (let index = 0; index < results.length; index++) {
        const student = results[index];

        // Page break if needed
        if (y > pageHeight - 90) {
          pdf.addPage([pageWidth, pageHeight], "landscape");
          y = 50;
          drawRow(headers, y, true, 28);
          y += 28;
        }

        const subjectMap = new Map(
          student.results.map((r) => [r.subject, r])
        );

        const subjectCells = allSubjects.map((subject) => {
          const r = subjectMap.get(subject);
          if (!r) return "-";
          return `${r.marks}\n${r.grade} (${r.gradePoint})`;
        });

        const row = [
          String(index + 1),
          student.name,
          String(student.roll),
          ...subjectCells,
          student.gpa !== null ? student.gpa.toFixed(2) : "-",
          student.status,
        ];

        drawRow(row, y, false, 30);
        y += 30;
      }

      // ---- Principal signature (bottom-right of last page) ----
      const footerY = pageHeight - 40;
      const blockWidth = 180;
      const lineEndX = pageWidth - margin;
      const lineStartX = lineEndX - blockWidth;

      if (branchInfo?.principalSignature) {
        try {
          const tempDiv = document.createElement("div");
          tempDiv.style.position = "absolute";
          tempDiv.style.left = "-9999px";
          tempDiv.style.top = "0";
          tempDiv.innerHTML = `
            <img src="${branchInfo.principalSignature}"
                 width="100"
                 height="90"
                 alt="Principal Signature"
                 style="object-fit: contain;" />
          `;
          document.body.appendChild(tempDiv);

          const canvas = await html2canvas(tempDiv, {
            useCORS: true,
            scale: 2,
            logging: false,
          });

          const imgData = canvas.toDataURL("image/png");
          const sigW = 70;
          const sigH = 60;
          const sigX = lineEndX - blockWidth / 2 - sigW / 2;
          const sigY = footerY - 70;

          pdf.addImage(imgData, "PNG", sigX, sigY, sigW, sigH);

          document.body.removeChild(tempDiv);
        } catch (error) {
          console.error("Error adding signature image to PDF:", error);
        }
      }

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text(
        "Principal's Signature",
        (lineStartX + lineEndX) / 2,
        footerY,
        { align: "center" }
      );
      pdf.line(lineStartX, footerY + 5, lineEndX, footerY + 5);

      pdf.save(`Class_Results_${examName}_${className}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  //! =================== TABLE COLUMNS ===================
  // Fixed: the subject columns now come from `allSubjects` (union of all
  // students' subjects) instead of `results[0].results`, so every student's
  // marks line up under the correct subject.
  const columns = [
    {
      key: "sl",
      header: "SL",
      render: (row: StudentResult, index?: number) =>
        index !== undefined ? index + 1 : null,
      width: 60,
      align: "center",
    },
    {
      key: "student",
      header: "Student Info",
      render: (row: StudentResult) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.name}</span>
        </div>
      ),
      minWidth: 180,
    },
    {
      key: "roll",
      header: "Roll No",
      render: (row: StudentResult) => row.roll,
      align: "center",
      width: 100,
    },
    ...allSubjects.map((subject) => ({
      key: `subject-${subject}`,
      header: (
        <div className="flex justify-center w-full">{subject}</div>
      ),
      render: (row: StudentResult) => {
        const result = row.results.find((r) => r.subject === subject);
        if (!result) {
          return <span className="text-gray-400">-</span>;
        }
        return (
          <div className="flex justify-center">
            <div className="flex flex-col items-center w-44">
              <span className="font-medium">{result.marks}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  result.grade === "A+" || result.grade === "A"
                    ? "bg-green-100 text-green-800"
                    : result.grade === "B"
                    ? "bg-blue-100 text-blue-800"
                    : result.grade === "C"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {result.grade} (GPA: {result.gradePoint})
              </span>
            </div>
          </div>
        );
      },
      align: "center" as const,
      width: 120,
    })),
    {
      key: "gpa",
      header: "GPA",
      render: (row: StudentResult) =>
        row.gpa !== null ? (
          <span className="font-medium">{row.gpa.toFixed(2)}</span>
        ) : (
          "-"
        ),
      align: "center",
      width: 100,
    },
    {
      key: "status",
      header: "Status",
      render: (row: StudentResult) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "PASSED"
              ? "bg-green-100 text-green-800"
              : row.status === "FAILED"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.status}
        </span>
      ),
      align: "center",
      width: 120,
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Class Wise Results"
        buttonText="Download"
        buttonIcon={<Download size={20} />}
      />

      {/* Filter Section */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            width: { xs: "100%", sm: "auto" },
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <FormControl
            sx={{ minWidth: 200, width: { xs: "100%", sm: "50%" } }}
            variant="outlined"
          >
            <InputLabel
              id="filter-exam-label"
              sx={{
                backgroundColor: "background.paper",
                px: 1,
                transform: "translate(14px, -9px) scale(0.75)",
                "&.Mui-focused": {
                  transform: "translate(14px, -9px) scale(0.75)",
                },
              }}
            >
              Exam {theStar}
            </InputLabel>
            <Select
              labelId="filter-exam-label"
              id="filter-exam"
              value={filterExam || ""}
              onChange={(e) =>
                setFilterExam(Number(e.target.value) || null)
              }
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderRadius: "6px",
                },
                height: 40,
                width: "100%",
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: "6px",
                    marginTop: "4px",
                  },
                },
              }}
            >
              <MenuItem value="">All Exams</MenuItem>
              {exams.map((exam: Exam) => (
                <MenuItem key={exam.id} value={exam.id}>
                  {exam.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            sx={{ minWidth: 200, width: { xs: "100%", sm: "50%" } }}
            variant="outlined"
          >
            <InputLabel
              id="filter-class-label"
              sx={{
                backgroundColor: "background.paper",
                px: 1,
                transform: "translate(14px, -9px) scale(0.75)",
                "&.Mui-focused": {
                  transform: "translate(14px, -9px) scale(0.75)",
                },
              }}
            >
              Class {theStar}
            </InputLabel>
            <Select
              labelId="filter-class-label"
              id="filter-class"
              value={filterClass || ""}
              onChange={(e) =>
                setFilterClass(Number(e.target.value) || null)
              }
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderRadius: "6px",
                },
                height: 40,
                width: "100%",
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: "6px",
                    marginTop: "4px",
                  },
                },
              }}
            >
              <MenuItem value="">All Classes</MenuItem>
              {allClasses.map((cls: Class) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <SubmitButton onClick={applyFilters}>Search</SubmitButton>
          <CancelButton onClick={resetFilters}>Reset</CancelButton>
        </Box>
      </Box>

      {/* Action Buttons */}
      {results.length > 0 && (
        <div className="flex justify-end">
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
              flexWrap: "wrap",
            }}
          >
            <SubmitButton onClick={handlePrint}>Print</SubmitButton>
            <CancelButton onClick={downloadPDF} disabled={isDownloading}>
              {isDownloading ? "Generating..." : "PDF"}
            </CancelButton>
          </Box>
        </div>
      )}

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load results. Please try again.
          </Alert>
        ) : results.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            {isSearched
              ? "No results found for the selected filters."
              : "Please select exam and class to view results."}
          </Typography>
        ) : (
          <ReusableTable<StudentResult>
            columns={columns}
            data={results}
          />
        )}
      </Paper>
    </Box>
  );
};

export default ClassWiseResult;