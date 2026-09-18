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

const TeacherClassWiseResult = () => {
  const [filterExam, setFilterExam] = useState<number | null>(null);
  const [filterClass, setFilterClass] = useState<number | null>(null);
  const [isSearched, setIsSearched] = useState(false);

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

  const exams: Exam[] = examsResponse?.data || [];
  const allClasses: Class[] = Array.isArray(classesResponse?.data)
    ? classesResponse.data
    : classesResponse?.data || [];
  const results: StudentResult[] = resultsResponse?.data || [];

  const applyFilters = () => {
    setIsSearched(true);
  };

  const resetFilters = () => {
    setFilterExam(null);
    setFilterClass(null);
    setIsSearched(false);
  };


  const handlePrint = () => {
    if (!results.length || !filterExam || !filterClass) return;

    const examName = exams.find((e) => e.id === filterExam)?.name || "";
    const className = allClasses.find((c) => c.id === filterClass)?.name || "";

    const printWindow = window.open("", "", "width=1000,height=600");
    if (printWindow) {
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
            td { padding: 8px; border: 1px solid #ddd; text-align: center; }
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
            <div class="school-name">Your School Name</div>
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
    `);

      // Write subject headers
      const allSubjects = Array.from(
        new Set(
          results.flatMap((student) =>
            student.results.map((result) => result.subject)
          )
        ));

      allSubjects.forEach(subject => {
        printWindow.document.write(`<th>${subject}</th>`);
      });

      printWindow.document.write(`
                <th>GPA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
    `);

      // Write table rows
      results.forEach((student, index) => {
        const statusClass = student.status === "PASSED" ? "passed" :
          student.status === "FAILED" ? "failed" : "incomplete";

        printWindow.document.write(`
        <tr class="${statusClass}">
          <td>${index + 1}</td>
          <td class="student-name">${student.name}</td>
          <td>${student.roll}</td>
      `);

        // Write subject marks
        const subjectMarksMap = new Map(
          student.results.map((result) => [result.subject, result])
        );

        allSubjects.forEach(subject => {
          const result = subjectMarksMap.get(subject);
          if (result) {
            printWindow.document.write(`
            <td>
              ${result.marks}<br>
              <small>${result.grade} (GPA ${result.gradePoint})</small>
            </td>
          `);
          } else {
            printWindow.document.write(`<td>-</td>`);
          }
        });

        printWindow.document.write(`
          <td>${student.gpa?.toFixed(2) || "-"}</td>
          <td>${student.status}</td>
        </tr>
      `);
      });

      printWindow.document.write(`
            </tbody>
          </table>
          <div class="footer">
            <div class="signature">Principal's Signature</div>
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
  };
  //

  const downloadPDF = () => {
    if (!results.length || !filterExam || !filterClass) return;

    const examName = exams.find((e) => e.id === filterExam)?.name || "";
    const className = allClasses.find((c) => c.id === filterClass)?.name || "";

    const allSubjects = Array.from(new Set(results.flatMap(student => student.results.map(r => r.subject))));

    // Fixed widths
    const fixedColWidths = {
      sl: 30,
      roll: 40,
      gpa: 50,
      status: 80
    };

    const nameWidth = 120;
    const subjectMinWidth = 80;
    const subjectWidth = Math.max(subjectMinWidth, 80);
    const totalSubjectWidth = subjectWidth * allSubjects.length;

    const totalWidth =
      fixedColWidths.sl + nameWidth + fixedColWidths.roll + totalSubjectWidth + fixedColWidths.gpa + fixedColWidths.status;

    const margin = 40;
    const pageHeight = 595; // standard A4 height in pt (landscape)
    const pageWidth = totalWidth + margin * 2;

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: [pageWidth, pageHeight],
    });

    let y = 60;

    // Header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Your School Name", pageWidth / 2, y, { align: "center" });
    y += 25;

    pdf.setFontSize(16);
    pdf.text("Class Wise Results", pageWidth / 2, y, { align: "center" });
    y += 30;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor(85);
    pdf.text(`Exam: ${examName} | Class: ${className} | Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, {
      align: "center",
    });
    y += 30;

    const colWidths = [
      fixedColWidths.sl,
      nameWidth,
      fixedColWidths.roll,
      ...Array(allSubjects.length).fill(subjectWidth),
      fixedColWidths.gpa,
      fixedColWidths.status,
    ];

    const headers = ["SL", "Student Name", "Roll", ...allSubjects, "GPA", "Status"];

    const wrapText = (text: string, width: number, fontSize: number) => {
      pdf.setFontSize(fontSize);
      return pdf.splitTextToSize(text, width - 4);
    };

    const drawRow = (cells: string[], yPos: number, isHeader = false) => {
      let x = margin;
      pdf.setFont("helvetica", isHeader ? "bold" : "normal");
      pdf.setFontSize(isHeader ? 10 : 9);
      pdf.setTextColor(0);

      const rowHeight = 30;

      for (let i = 0; i < cells.length; i++) {
        const width = colWidths[i];
        const cellText = wrapText(cells[i], width, isHeader ? 10 : 9);
        pdf.rect(x, yPos, width, rowHeight);
        cellText.forEach((line: string | string[], lineIndex: number) => {
          pdf.text(line, x + (i === 1 && !isHeader ? 5 : width / 2), yPos + 12 + lineIndex * 10, {
            align: i === 1 && !isHeader ? "left" : "center",
          });
        });
        x += width;
      }

      return rowHeight;
    };

    // Draw headers
    const headerHeight = drawRow(headers, y, true);
    y += headerHeight;

    for (let index = 0; index < results.length; index++) {
      const student = results[index];

      if (y > pageHeight - 80) {
        pdf.addPage([pageWidth, pageHeight], "landscape");
        y = 60;
        drawRow(headers, y, true);
        y += headerHeight;
      }

      const subjectMarksMap = new Map(student.results.map((result) => [result.subject, result]));

      const row: string[] = [
        (index + 1).toString(),
        student.name,
        student.roll.toString(),
        ...allSubjects.map((subject) => {
          const result = subjectMarksMap.get(subject);
          return result ? `${result.marks}\n${result.grade} (GPA ${result.gradePoint})` : "-";
        }),
        student.gpa?.toFixed(2) || "-",
        student.status,
      ];

      const rowHeight = drawRow(row, y);
      y += rowHeight;
    }

    // Footer
    const footerY = pageHeight - 40;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor(0);
    pdf.line(pageWidth - margin - 200, footerY + 5, pageWidth - margin, footerY + 5);
    pdf.text("Principal's Signature", pageWidth - margin - 100, footerY, { align: "center" });

    pdf.save(`Class_Results_${examName}_${className}.pdf`);
  };


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
    ...(results[0]?.results?.map((subjectResult) => ({
      key: `subject-${subjectResult.subject}`,
      header: (
        <div className="flex justify-center w-full">
          {subjectResult.subject}
        </div>
      ),
      render: (row: StudentResult) => {
        const result = row.results.find(
          (r) => r.subject === subjectResult.subject
        );
        return result ? (
          <div className="flex justify-start">
            <div className="flex flex-col items-center w-44">
              <span className="font-medium">{result.marks}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${result.grade === "A+" || result.grade === "A"
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
        ) : (
          ""
        );
      },
      align: "center",
      width: 120,
    })) || []),
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
          className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "PASSED"
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
          <FormControl sx={{ minWidth: 200, width: { xs: "100%", sm: "50%" } }} variant="outlined">
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
              onChange={(e) => setFilterExam(Number(e.target.value) || null)}
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

          <FormControl sx={{ minWidth: 200, width: { xs: "100%", sm: "50%" } }} variant="outlined">
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
              onChange={(e) => setFilterClass(Number(e.target.value) || null)}
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
            <CancelButton onClick={downloadPDF}>PDF</CancelButton>
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

export default TeacherClassWiseResult;