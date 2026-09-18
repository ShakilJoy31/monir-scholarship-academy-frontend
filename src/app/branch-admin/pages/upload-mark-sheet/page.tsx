"use client";
import React, { useState, useRef, useMemo } from "react";
import {
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
} from "@mui/material";
import * as XLSX from "xlsx";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { Upload } from "lucide-react";
import { useGetAllExamsQuery } from "@/app/store/api/classes/examApi";
import { useGetAllSubjectsQuery } from "@/app/store/api/classes/subjectApi";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import {
  useCreateBulkResultMutation,
  useGetStudentsForResultQuery,
} from "@/app/store/api/classes/resultApi";
import jsPDF from "jspdf";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";

interface StudentData {
  SL: number;
  "STUDENT ID": string;
  "STUDENT NAME": string;
  "ROLL NO": number;
  "TOTAL MARKS": number;
  MARKS: string;
  STATUS: string;
}

interface Session {
  id: number;
  branchId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Column {
  key: keyof StudentData;
  header: string;
}

type StudentDataKeys = keyof StudentData;

interface Exam {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  marks: number;
  passMarks: number;
}

interface Class {
  id: number;
  name: string;
}

interface Student {
  id: number;
  name: string;
  studentUniqueId: string;
  classRoll: number;
  class: {
    id: number;
    name: string;
  };
}

const UploadMarkSheet = () => {
  const [data, setData] = useState<StudentData[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [filterExam, setFilterExam] = useState<number | null>(null);
  const [filterClass, setFilterClass] = useState<number | null>(null);
  const [filterSession, setFilterSession] = useState<number | null>(null);
  const [filterSubject, setFilterSubject] = useState<number | null>(null);

  // Search params state to trigger API call
  const [searchParams, setSearchParams] = useState<{
    sessionId: number | undefined;
    classNameId: number | undefined;
    subjectId: number | undefined;
  } | null>(null);

  // RTK Query hooks
  const {
    data: studentsResponse,
    isLoading: isLoadingStudents,
    refetch,
  } = useGetStudentsForResultQuery(
    searchParams || {
      sessionId: undefined,
      classNameId: undefined,
      subjectId: undefined,
    },
    { skip: !searchParams }
  );

  const [createBulkResult, { isLoading: isSubmitting }] =
    useCreateBulkResultMutation();

  // Fetch exams for dropdown
  const { data: examsResponse } = useGetAllExamsQuery({});

  const { data: sessionsResponse } = useGetAllSessionsQuery({
    page: 1,
    size: 100000,
  });

  // Fetch subjects for dropdown
  const { data: subjectsResponse } = useGetAllSubjectsQuery({
    page: 1,
    size: 10000,
  });

  // Fetch classes for dropdown
  const { data: classesResponse } = useGetAllClassQuery({
    page: 1,
    size: 100000,
  });

    // Fetching branch name, email, address and logo. 
        const currentBranchId =
        typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("selectedBranch") || "null")?.id
            : null;
    const { data: branchConfigData } = useGetBranchConfigQuery(currentBranchId)
    const branchInfo = branchConfigData?.data;

  const exams: Exam[] = examsResponse?.data || [];
  const subjects: Subject[] = useMemo(
    () => subjectsResponse?.data || [],
    [subjectsResponse?.data]
  );
  const allClasses: Class[] = Array.isArray(classesResponse?.data)
    ? classesResponse.data
    : classesResponse?.data || [];

  const students: Student[] = studentsResponse?.data || [];

  // Define columns
  const columns: Column[] = [
    { key: "SL", header: "SL" },
    { key: "STUDENT NAME", header: "STUDENT NAME" },
    { key: "ROLL NO", header: "ROLL NO" },
    { key: "TOTAL MARKS", header: "TOTAL MARKS" },
    { key: "MARKS", header: "MARKS" },
  ];

  const applyFilters = () => {
    if (!filterSession || !filterClass || !filterSubject) {
      toastShowing(
        "Please select session, class and subject",
        "bottom-right",
        2000,
        "red",
        "white"
      );
      return;
    }

    // Clear previous data before new search
    setData([]);
    setSearchParams({
      sessionId: filterSession,
      classNameId: filterClass,
      subjectId: filterSubject,
    });
  };

  const handleReset = () => {
    setFilterExam(null);
    setFilterClass(null);
    setFilterSession(null);
    setFilterSubject(null);
    setSearchParams(null);
    setData([]);
  };

  React.useEffect(() => {
    if (studentsResponse) {
      // Always update data based on API response, even if empty
      if (studentsResponse.data.length > 0 && filterSubject) {
        const subject = subjects.find((s) => s.id === filterSubject);
        const totalMarks = subject?.marks || 100;

        const studentData = studentsResponse.data.map(
          (student: Student, index: number) => ({
            SL: index + 1,
            "STUDENT ID": student.studentUniqueId,
            "STUDENT NAME": student.name,
            "ROLL NO": student.classRoll,
            "TOTAL MARKS": totalMarks,
            MARKS: "", // Start with empty marks
            STATUS: "", // Start with empty status
          })
        );

        setData(studentData);
      } else {
        // Clear data when API returns empty array
        setData([]);
      }
    }
  }, [studentsResponse, filterSubject, subjects]);

  // Handle input change with proper typing
  const handleInputChange = (
    index: number,
    key: StudentDataKeys,
    value: string
  ) => {
    const newData = [...data];

    if (key === "MARKS") {
      const totalMarks = newData[index]["TOTAL MARKS"];
      const enteredMarks = parseInt(value) || 0;

      // Validate that marks don't exceed total marks
      if (enteredMarks > totalMarks) {
        toastShowing(
          `Marks cannot exceed total marks (${totalMarks})`,
          "bottom-right",
          2000,
          "red",
          "white"
        );
        return; // Don't update the state if validation fails
      }

      (newData[index][key] as string) = value;

      // Update status when marks change
      const passMarks =
        subjects.find((s) => s.id === filterSubject)?.passMarks || 33;
      newData[index]["STATUS"] =
        enteredMarks >= passMarks ? "Passed" : "Failed";
    } else {
      (newData[index][key] as string) = value;
    }

    setData(newData);
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    const file = e.target.files?.[0];
    if (!file) {
      setIsUploading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (loadEvent: ProgressEvent<FileReader>) => {
      try {
        if (!loadEvent.target || !loadEvent.target.result) {
          throw new Error("File reading failed");
        }

        const data = loadEvent.target.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData =
          XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);

        const processedData = jsonData.map((row, index) => {
          const marksValue = row["MARKS"] || row["MARKS OBTAINED"] || "0";
          const marks =
            typeof marksValue === "number"
              ? marksValue
              : parseInt(marksValue.toString(), 10) || 0;

          const totalMarksValue = row["TOTAL MARKS"] || "100";
          const totalMarks =
            typeof totalMarksValue === "number"
              ? totalMarksValue
              : parseInt(totalMarksValue.toString(), 10) || 100;

          const passMarks =
            subjects.find((s) => s.id === filterSubject)?.passMarks || 33;
          const status =
            typeof row["STATUS"] === "string"
              ? row["STATUS"]
              : marks >= passMarks
              ? "Passed"
              : "Failed";

          return {
            SL: index + 1,
            "STUDENT ID": row["STUDENT ID"]?.toString() || "",
            "STUDENT NAME": row["STUDENT NAME"]?.toString() || "",
            "ROLL NO":
              typeof row["ROLL NO"] === "number"
                ? row["ROLL NO"]
                : parseInt(row["ROLL NO"]?.toString() || "0", 10) || 0,
            MARKS: marks.toString(),
            "TOTAL MARKS": totalMarks,
            STATUS: status.toString(),
          };
        });

        setData(processedData);

        // Prepare and submit the bulk results from the uploaded file
        if (filterExam && filterSubject) {
          const students = processedData.map((row) => ({
            studentId: parseInt(row["STUDENT ID"].replace("STU-", "")),
            marks: parseInt(row["MARKS"]) || 0,
          }));

          const payload = {
            examId: filterExam,
            subjectId: filterSubject,
            students,
          };

          try {
            await createBulkResult(payload).unwrap();
            refetch(); // Refresh the data
          } catch (error) {
            console.error(
              "Failed to submit results from uploaded file:",
              error
            );
          }
        }
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toastShowing(
          "Error parsing Excel file. Please check the format.",
          "bottom-right",
          2000,
          "red",
          "white"
        );
      } finally {
        setIsUploading(false);
        // Reset the file input
        const form = e.target.form;
        if (form) {
          form.reset();
        } else {
          const newInput = e.target.cloneNode() as HTMLInputElement;
          newInput.onchange = (ev: Event) => {
            handleFileUpload(
              ev as unknown as React.ChangeEvent<HTMLInputElement>
            );
          };
          e.target.replaceWith(newInput);
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Prepare and submit the bulk results
  const submitResults = async () => {
    // Create students payload using the actual student id from the response
    const studentsPayload = data
      .map((row) => {
        // Find the student in the students array that matches the STUDENT ID
        const student = students.find((s) => s.classRoll === row["ROLL NO"]);
        if (!student) {
          console.error(`Student not found: ${row["ROLL NO"]}`);
          return null;
        }
        return {
          studentId: student.id, // Use the actual student id (e.g., 72)
          marks: parseInt(row["MARKS"]) || 0,
        };
      })
      .filter(Boolean); // Filter out any null entries if students weren't found

    try {
      const payload = {
        examId: filterExam,
        subjectId: filterSubject,
        students: studentsPayload,
      };

      await createBulkResult(payload).unwrap();
      toastShowing(
        "Results submitted successfully!",
        "bottom-right",
        2000,
        "green",
        "white"
      );
      refetch();
    } catch (error) {
      console.error("Failed to submit results:", error);
      toastShowing(
        "Failed to submit results. Please try again.",
        "bottom-right",
        2000,
        "red",
        "white"
      );
    }
  };

  // Download Excel
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MarkSheet");
    XLSX.writeFile(workbook, "MarkSheet.xlsx");
  };


// ===== PRINT FUNCTION =====
const handlePrint = () => {
  if (tableRef.current) {
    const tableClone = tableRef.current.cloneNode(true) as HTMLElement;

    const inputs = tableClone.querySelectorAll("input");
    inputs.forEach((input) => {
      const cell = input.closest("td");
      if (cell) {
        cell.innerHTML = (input as HTMLInputElement).value;
        (cell as HTMLElement).style.padding = "8px";
        (cell as HTMLElement).style.border = "1px solid #ddd";
        (cell as HTMLElement).style.textAlign = "left";
      }
    });

    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      const examName = exams.find((e) => e.id === filterExam)?.name || "";
      const className = allClasses.find((c) => c.id === filterClass)?.name || "";
      const subjectName = subjects.find((s) => s.id === filterSubject)?.name || "";

      printWindow.document.write(`
        <html>
          <head>
            <title>Mark Sheet</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 40px; 
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px;
              }
              .school-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .title {
                font-size: 16px;
                margin-bottom: 20px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px 40px;
                font-size: 12px;
                margin-bottom: 10px;
              }
              .info-grid div:first-child,
              .info-grid div:nth-child(3) {
                text-align: left;
              }
              .info-grid div:nth-child(2),
              .info-grid div:nth-child(4) {
                text-align: right;
              }
              .subject {
                text-align: center;
                font-weight: bold;
                margin: 20px 0;
                font-size: 14px;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 15px; 
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left; 
              }
              th { 
                background-color: #f2f2f2; 
                text-align: center;
              }
              .footer {
                margin-top: 40px;
                display: flex;
                justify-content: flex-end;
              }
              .signature {
                width: 200px;
                border-top: 1px solid #000;
                text-align: center;
                padding-top: 5px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="school-name">${branchInfo?.schoolName}</div>
              <div class="title">MARK SHEET</div>

              <div class="info-grid">
                <div>Exam: ${examName}</div>
                <div>Class: ${className}</div>
                <div>Subject: ${subjectName}</div>
                <div>Date: ${new Date().toLocaleDateString()}</div>
              </div>
            </div>
            
            ${tableClone.outerHTML}
            
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 200);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }
};

// ===== PDF DOWNLOAD FUNCTION =====
const downloadPDF = () => {
  if (!data.length || !filterExam || !filterClass || !filterSubject) return;

  const pdf = new jsPDF("portrait", "pt", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 40;
  let y = 60;

  // ===== HEADER =====
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(branchInfo?.schoolName, pageWidth / 2, y, { align: "center" });
  y += 25;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(16);
  pdf.text("Mark Sheet", pageWidth / 2, y, { align: "center" });
  y += 40;

  // ===== EXAM, CLASS, SUBJECT, DATE (2x2 grid with left/right alignment) =====
  pdf.setFontSize(12);
  const examName = exams.find((e) => e.id === filterExam)?.name || "";
  const className = allClasses.find((c) => c.id === filterClass)?.name || "";
  const subjectName = subjects.find((s) => s.id === filterSubject)?.name || "";
  const date = new Date().toLocaleDateString();

  const leftX = margin; // Left aligned
  const rightX = pageWidth - margin; // Right aligned

  pdf.text(`Exam: ${examName}`, leftX, y, { align: "left" });
  pdf.text(`Class: ${className}`, rightX, y, { align: "right" });
  y += 20;
  pdf.text(`Subject: ${subjectName}`, leftX, y, { align: "left" });
  pdf.text(`Date: ${date}`, rightX, y, { align: "right" });
  y += 40;

  // ===== TABLE SETUP =====
  const availableWidth = pageWidth - margin * 2;

  const colWidths = [
    availableWidth * 0.08, // SL
    availableWidth * 0.28, // STUDENT NAME
    availableWidth * 0.12, // ROLL NO
    availableWidth * 0.16, // TOTAL MARKS
    availableWidth * 0.16, // MARKS
    availableWidth * 0.20, // STATUS
  ];

  const tableX = margin;
  let tableY = y;

  // ===== TABLE HEADER =====
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);

  const headers = ["SL", "Student Name", "Roll No", "Total Marks", "Marks", "Status"];
  let x = tableX;
  headers.forEach((header, i) => {
    pdf.setFillColor(243, 244, 246);
    pdf.rect(x, tableY, colWidths[i], 25, "F");
    pdf.setDrawColor(229, 231, 235);
    pdf.rect(x, tableY, colWidths[i], 25, "D");
    pdf.text(header, x + colWidths[i] / 2, tableY + 16, { align: "center" });
    x += colWidths[i];
  });
  tableY += 25;

  // ===== TABLE CONTENT =====
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  data.forEach((row) => {
    if (tableY > pdf.internal.pageSize.height - 50) {
      pdf.addPage();
      tableY = margin;

      // Redraw headers
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      x = tableX;
      headers.forEach((header, i) => {
        pdf.setFillColor(243, 244, 246);
        pdf.rect(x, tableY, colWidths[i], 25, "F");
        pdf.setDrawColor(229, 231, 235);
        pdf.rect(x, tableY, colWidths[i], 25, "D");
        pdf.text(header, x + colWidths[i] / 2, tableY + 16, { align: "center" });
        x += colWidths[i];
      });
      tableY += 25;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
    }

    const rowData = [
      row.SL.toString(),
      row["STUDENT NAME"],
      row["ROLL NO"].toString(),
      row["TOTAL MARKS"].toString(),
      row["MARKS"],
      row["STATUS"],
    ];

    x = tableX;
    rowData.forEach((data, i) => {
      pdf.setDrawColor(229, 231, 235);
      pdf.rect(x, tableY, colWidths[i], 25, "D");

      const align = i === 1 ? "left" : "center";
      const padding = i === 1 ? 10 : 0;

      pdf.text(
        data,
        x + (align === "center" ? colWidths[i] / 2 : padding),
        tableY + 16,
        { align, maxWidth: colWidths[i] - 10 }
      );

      x += colWidths[i];
    });

    tableY += 25;
  });

  // ===== FOOTER =====
  const footerY = pdf.internal.pageSize.height - 40;
  pdf.setFontSize(12);
  pdf.setDrawColor(0, 0, 0);
  pdf.line(pageWidth - margin - 100, footerY + 5, pageWidth - margin, footerY + 5);

  pdf.save(`marksheet_${examName}_${className}_${subjectName}.pdf`);
};


  const downloadTemplate = () => {
    const totalMarks =
      subjects.find((s) => s.id === filterSubject)?.marks || 100;

    const templateData = [
      {
        SL: 1,
        "STUDENT NAME": "",
        "ROLL NO": "",
        "TOTAL MARKS": totalMarks,
        MARKS: "",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData, {
      skipHeader: false,
    });

    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 25 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MarkSheetTemplate");

    XLSX.writeFile(workbook, "MarkSheet_Template.xlsx", {
      bookType: "xlsx",
      type: "binary",
      compression: true,
    });
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between py-4">
        <h2 className="text-xl font-semibold my-2">Upload Mark Sheet</h2>
      </div>

      <div className="bg-white px-5">
        <Paper sx={{ mt: 2, p: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(8, 1fr) auto",
              },
              gap: 2,
              mb: 2,
              alignItems: "center",
            }}
          >
            <FormControl sx={{ mt: 1 }} variant="outlined" size="small">
              <InputLabel id="filter-exam-label">Exam {theStar}</InputLabel>
              <Select
                labelId="filter-exam-label"
                value={filterExam || ""}
                label="Exam"
                sx={{
                  height: 45,
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                  },
                }}
                onChange={(e) => setFilterExam(Number(e.target.value) || null)}
              >
                <MenuItem value="">All Exams</MenuItem>
                {exams.map((exam) => (
                  <MenuItem key={exam.id} value={exam.id}>
                    {exam.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ mt: 1 }} variant="outlined" size="small">
              <InputLabel id="filter-session-label">
                Session {theStar}
              </InputLabel>
              <Select
                labelId="filter-session-label"
                value={filterSession || ""}
                label="Session"
                sx={{
                  height: 45,
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                  },
                }}
                onChange={(e) =>
                  setFilterSession(Number(e.target.value) || null)
                }
              >
                <MenuItem value="">All Sessions</MenuItem>
                {sessionsResponse?.data?.map((session: Session) => (
                  <MenuItem key={session.id} value={session.id}>
                    {session.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ mt: 1 }} variant="outlined" size="small">
              <InputLabel id="filter-class-label">Class {theStar}</InputLabel>
              <Select
                labelId="filter-class-label"
                value={filterClass || ""}
                label="Class"
                sx={{
                  height: 45,
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                  },
                }}
                onChange={(e) => setFilterClass(Number(e.target.value) || null)}
              >
                <MenuItem value="">All Classes</MenuItem>
                {allClasses.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ mt: 1 }} variant="outlined" size="small">
              <InputLabel id="filter-subject-label">
                Subject {theStar}
              </InputLabel>
              <Select
                labelId="filter-subject-label"
                value={filterSubject || ""}
                label="Subject"
                sx={{
                  height: 45,
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                  },
                }}
                onChange={(e) =>
                  setFilterSubject(Number(e.target.value) || null)
                }
              >
                <MenuItem value="">All Subjects</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <SubmitButton onClick={applyFilters}>Search</SubmitButton>

            <CancelButton onClick={handleReset}>Reset</CancelButton>
          </Box>

          {/* Responsive Action Buttons */}
          {data.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                mb: 2,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    sm: "repeat(3, auto)",
                    md: "repeat(5, auto)",
                  },
                  gap: 2,
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                <SubmitButton onClick={handlePrint}>Print</SubmitButton>

                <CancelButton onClick={downloadPDF}>PDF</CancelButton>

                <SubmitButton onClick={downloadExcel}>Excel</SubmitButton>

                <input
                  type="file"
                  id="excel-upload"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  disabled={!filterExam || !filterSubject}
                />
                <label htmlFor="excel-upload">
                  <Button
                    component="span"
                    startIcon={<Upload size={16} />}
                    variant="contained"
                    color="info"
                    disabled={!filterExam || !filterSubject || isUploading}
                    sx={{
                      bgcolor: "#035140",
                      color: "white",
                      height: 40,
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    {isUploading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Upload"
                    )}
                  </Button>
                </label>

                <SubmitButton onClick={downloadTemplate}>Template</SubmitButton>

                <div className="block md:hidden">
                  <SubmitButton disabled={isSubmitting} onClick={submitResults}>
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Submit"
                    )}
                  </SubmitButton>
                </div>
              </Box>

              <div className="hidden md:block">
                <SubmitButton disabled={isSubmitting} onClick={submitResults}>
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Submit"
                  )}
                </SubmitButton>
              </div>
            </Box>
          )}

          {isLoadingStudents ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <div ref={tableRef}>
              {filterSubject && searchParams && (
                <Typography variant="h6" gutterBottom>
                  Subject: {subjects.find((s) => s.id === filterSubject)?.name}
                  {filterSubject && (
                    <span>
                      {" "}
                      (Total Marks:{" "}
                      {subjects.find((s) => s.id === filterSubject)?.marks},
                      Pass Marks:{" "}
                      {subjects.find((s) => s.id === filterSubject)?.passMarks})
                    </span>
                  )}
                </Typography>
              )}

              {/* Only show table if we have data */}
              {data.length > 0 ? (
                <ReusableTable
                  columns={columns}
                  data={data.map((row, rowIndex) => ({
                    ...row,
                    MARKS: (
                      <TextField
                        value={row["MARKS"]}
                        onChange={(e) =>
                          handleInputChange(rowIndex, "MARKS", e.target.value)
                        }
                        size="small"
                        type="number"
                        inputProps={{
                          min: 0,
                          max: row["TOTAL MARKS"],
                          step: "0.01",
                        }}
                        error={
                          parseInt(row["MARKS"] || "0") > row["TOTAL MARKS"]
                        }
                        helperText={
                          parseInt(row["MARKS"] || "0") > row["TOTAL MARKS"]
                            ? `Marks cannot exceed ${row["TOTAL MARKS"]}`
                            : ""
                        }
                      />
                    ),
                  }))}
                />
              ) : searchParams ? (
                /* Show message when search was performed but no data */
                <Typography variant="body1" sx={{ p: 2 }}>
                  No students found for the selected criteria.
                </Typography>
              ) : (
                /* Show message when no search performed yet */
                <Typography variant="body1" sx={{ p: 2 }}>
                  Please select session, class, and subject, then click Search
                  to view students.
                </Typography>
              )}
            </div>
          )}
        </Paper>
      </div>
    </div>
  );
};

export default UploadMarkSheet;
