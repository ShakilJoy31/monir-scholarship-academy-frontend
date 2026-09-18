"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { FilterX } from "lucide-react";
import { toast } from "react-toastify";
import { useGetExamRoutingFilterQuery } from "@/app/store/api/classes/examRoutineApi";
// import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import dayjs from "dayjs";
// import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getUserInfoFromToken, loader } from "@/app/utils/helper/tokenHelper";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import { useGetAllExamsQuery } from "@/app/store/api/classes/examApi";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { theStar } from "@/lib/requiredJSX";
import html2canvas from "html2canvas-pro";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";
import Image from "next/image";

interface ExamRoutine {
  id: number;
  examName: string;
  sessionYear: string;
  className: string;
  sectionName: string;
  streamName: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  examDate: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
  subject: {
    id: number;
    name: string;
  };
}

interface DropdownOption {
  id: number;
  name: string;
}

interface FilterState {
  session: string;
  className: string;
  section: string;
  stream: string;
  examName: string;
}

const StyledRoutineContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const StyledHeader = styled(Box)(({ theme }) => ({
  textAlign: "center",
  marginBottom: theme.spacing(4),
  "& .school-name": {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: theme.spacing(1),
  },
  "& .exam-title": {
    fontSize: "1.2rem",
    marginBottom: theme.spacing(1),
  },
  "& .class-info": {
    fontSize: "1rem",
    color: theme.palette.text.secondary,
  },
}));

const StyledFooter = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  marginTop: theme.spacing(4),
  "& .signature": {
    borderTop: `1px solid ${theme.palette.text.primary}`,
    paddingTop: theme.spacing(1),
    width: "200px",
    textAlign: "center",
  },
}));

const ExamRoutineList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterState>({
    session: "",
    className: "",
    section: "",
    stream: "",
    examName: "",
  });
  const [filterApplied, setFilterApplied] = useState(false);

  // Dropdown data state
  const [sessions, setSessions] = useState<DropdownOption[]>([]);
  const [classes, setClasses] = useState<DropdownOption[]>([]);
  const [sections, setSections] = useState<DropdownOption[]>([]);
  const [streams, setStreams] = useState<DropdownOption[]>([]);
  const [examNames, setExamNames] = useState<DropdownOption[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  console.log(loadingDropdowns);

  const {
    data: filteredData,
    isLoading: isFilterLoading,
    isError: isFilterError,
    refetch: refetchFilteredData,
  } = useGetExamRoutingFilterQuery(
    {
      page: page + 1,
      size: rowsPerPage,
      sessionYear: filters.session,
      section: filters.section,
      className: filters.className,
      stream: filters.stream,
      examName: filters.examName,
    },
    { skip: !filterApplied }
  );

  const routines: ExamRoutine[] = Array.isArray(filteredData?.data)
    ? filteredData?.data
    : filteredData?.data || [];

  const { data: classesData } = useGetAllClassQuery({ page: 1, size: 100000 });
  const { data: sessionsData } = useGetAllSessionsQuery({
    page: 1,
    size: 100000,
  });
  const { data: sectionsData } = useGetAllSectionsQuery({
    page: 1,
    size: 100000,
  });
  const { data: streamsData } = useGetAllStreamsQuery({
    page: 1,
    size: 100000,
  });
  const { data: examsData } = useGetAllExamsQuery({ page: 1, size: 100000 });



  // Fetching branch name, email, address and logo. 
  const userInfo = getUserInfoFromToken();
  const { data: branchConfigData } = useGetBranchConfigQuery(userInfo?.branchId)

  const branchInfo = branchConfigData?.data;

  // Fetch dropdown data
  useEffect(() => {
    setLoadingDropdowns(true);
    try {
      if (sessionsData?.data) {
        setSessions(sessionsData?.data);
      }
      if (classesData?.data) {
        setClasses(classesData?.data);
      }
      if (sectionsData?.data) {
        setSections(sectionsData?.data);
      }
      if (streamsData?.data) {
        setStreams(streamsData?.data);
      }
      if (examsData?.data) {
        setExamNames(examsData?.data);
      }
    } catch (error) {
      console.error("Error setting dropdown data:", error);
    } finally {
      setLoadingDropdowns(false);
    }
  }, [classesData, sessionsData, sectionsData, streamsData, examsData?.data]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    setFilterApplied(true);
    setPage(0);
    refetchFilteredData();
  };

  const resetFilters = () => {
    setFilters({
      session: "",
      className: "",
      section: "",
      stream: "",
      examName: "",
    });
    setFilterApplied(false);
    setPage(0);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("exam-routine-print");
    if (printContent) {
      const printWindow = window.open("", "", "width=1000,height=600");
      if (printWindow) {
        printWindow.document.write(`
                <html>
                    <head>
                        <title>Exam Routine</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .school-name { font-size: 18pt; font-weight: bold; margin-bottom: 10px; }
                            .exam-title { font-size: 16pt; margin-bottom: 10px; }
                            .class-info { font-size: 12pt; color: #555; margin-bottom: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                            th { background-color: #f2f2f2; text-align: left; padding: 8px; border: 1px solid #ddd; }
                            td { padding: 8px; border: 1px solid #ddd; }
                            .footer { margin-top: 50px; text-align: right; }
                            .signature { border-top: 1px solid #000; width: 200px; padding-top: 5px; display: inline-block; }
                            .notice { margin-top: 30px; }
                            .notice-title { font-weight: bold; margin-bottom: 10px; }
                        </style>
                    </head>
                    <body>
            `);

        // School header
        printWindow.document.write(`
                <div class="header">
                    <div class="school-name">${branchInfo?.schoolName}</div>
                    <div class="exam-title">${routines[0]?.examName || "Exam Routine"
          }</div>
                    <div class="class-info">
                        ${filters.className} - ${filters.section} (${filters.stream
          }) | Session: ${filters.session}
                    </div>
                </div>
            `);

        // Table
        printWindow.document.write(`
                <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Subject</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
      `);

        // Table rows
        routines.forEach((routine) => {
          const parseTime = (timeStr) => {
            const [hourStr, minuteStr, period] = timeStr.split(":");
            let hours = parseInt(hourStr, 10);
            const minutes = parseInt(minuteStr, 10);

            if (period === "PM" && hours !== 12) hours += 12;
            if (period === "AM" && hours === 12) hours = 0;

            return hours * 60 + minutes; // total minutes
          };

          const start = parseTime(routine.startTime);
          const end = parseTime(routine.endTime);
          const diff = end - start;
          const h = Math.floor(diff / 60);
          const m = diff % 60;
          const duration = `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m" : ""}`.trim();

          const date = new Date(routine.examDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          const day = new Date(routine.examDate).toLocaleDateString("en-US", {
            weekday: "long",
          });

          printWindow.document.write(`
          <tr>
            <td>${date}</td>
            <td>${day}</td>
            <td>${routine.subject.name}</td>
            <td>${routine.startTime}</td>
            <td>${routine.endTime}</td>
            <td><span class="duration-badge">${duration}</span></td>
          </tr>
        `);
        });

        printWindow.document.write(`
          </tbody>
        </table>

        <!-- Principal signature at the bottom right -->
        <div style="display: flex; justify-content: flex-end; ">
            <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${branchInfo?.principalSignature}" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
                <div class="signature">Principal's Signature</div>
            </div>
        </div>
        `);
        
        printWindow.document.write("</body></html>");
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

  // Function to download the exam routine as a PDF
  const handleDownloadPDF = async () => {
    const printContent = document.getElementById("exam-routine-print");
    if (printContent) {
      const printWindow = window.open("", "", "width=1000,height=600");
      if (printWindow) {
        printWindow.document.write(`
        <html>
          <head>
            <title>Exam Routine</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .school-name { font-size: 18pt; font-weight: bold; margin-bottom: 10px; }
              .exam-title { font-size: 16pt; margin-bottom: 10px; }
              .class-info { font-size: 12pt; color: #555; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th { background-color: #f2f2f2; text-align: left; padding: 8px; border: 1px solid #ddd; }
              td { padding: 8px; border: 1px solid #ddd; }
              .footer { margin-top: 50px; text-align: right; }
              .signature { border-top: 1px solid #000; width: 200px; padding-top: 5px; display: inline-block; }
              .notice { margin-top: 30px; }
              .notice-title { font-weight: bold; margin-bottom: 10px; }
              .duration-badge { background-color: #f0f0f0; padding: 2px 6px; border-radius: 4px; }
            </style>
          </head>
          <body>
      `);

        // School header
        printWindow.document.write(`
        <div class="header">
          <div class="school-name">${branchInfo?.schoolName}</div>
          <div class="exam-title">${routines[0]?.examName || "Exam Routine"}</div>
          <div class="class-info">
            ${filters.className} - ${filters.section} (${filters.stream}) | Session: ${filters.session}
          </div>
        </div>
      `);

        // Table
        printWindow.document.write(`
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Subject</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
      `);

        // Table rows
        routines.forEach((routine) => {
          const parseTime = (timeStr) => {
            const [hourStr, minuteStr, period] = timeStr.split(":");
            let hours = parseInt(hourStr, 10);
            const minutes = parseInt(minuteStr, 10);

            if (period === "PM" && hours !== 12) hours += 12;
            if (period === "AM" && hours === 12) hours = 0;

            return hours * 60 + minutes; // total minutes
          };

          const start = parseTime(routine.startTime);
          const end = parseTime(routine.endTime);
          const diff = end - start;
          const h = Math.floor(diff / 60);
          const m = diff % 60;
          const duration = `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m" : ""}`.trim();

          const date = new Date(routine.examDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          const day = new Date(routine.examDate).toLocaleDateString("en-US", {
            weekday: "long",
          });

          printWindow.document.write(`
          <tr>
            <td>${date}</td>
            <td>${day}</td>
            <td>${routine.subject.name}</td>
            <td>${routine.startTime}</td>
            <td>${routine.endTime}</td>
            <td><span class="duration-badge">${duration}</span></td>
          </tr>
        `);
        });

        printWindow.document.write(`
          </tbody>
        </table>

        <!-- Principal signature at the bottom right -->
        <div style="display: flex; justify-content: flex-end;">
            <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${branchInfo?.principalSignature}" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
                <div class="signature">Principal's Signature</div>
            </div>
        </div>
        `);
        
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.focus();

        // Wait for content to load before generating PDF
        setTimeout(async () => {
          try {
            const element = printWindow.document.documentElement;

            // Use html2canvas and jsPDF to generate PDF
            const canvas = await html2canvas(element, {
              scale: 2,
              useCORS: true,
              logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add new pages if content is longer than one page
            while (heightLeft >= 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
              heightLeft -= pageHeight;
            }

            // Save the PDF
            pdf.save(`${routines[0]?.examName || 'exam'}_routine.pdf`);

            // Close the print window
            printWindow.close();
          } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Failed to generate PDF");
            printWindow.close();
          }
        }, 500);
      }
    }
  };

  // Create a styled TableCell with borders
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1, 2),
  }));

  // Create a styled TableRow for hover effect
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  }));


  return (
    <Box>
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" component="h1" fontWeight="bold">
          Print | Download Exam Routine
        </Typography>

        {filterApplied && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <SubmitButton
              onClick={handlePrint}
              disabled={routines.length === 0}
            >
              Print
            </SubmitButton>

            <CancelButton
              onClick={handleDownloadPDF}
              disabled={routines.length === 0}
            >
              PDF
            </CancelButton>
          </Box>
        )}
      </div>

      <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            border: 0,
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          <FormControl sx={{ flex: 1, minWidth: 180, py: 1 }} size="small">
            <InputLabel>Exam {theStar}</InputLabel>
            <Select
              value={filters.examName}
              onChange={(e) => handleFilterChange("examName", e.target.value)}
              label="Exam"
              sx={{ height: 36 }}
            >
              <MenuItem value="">All Exams</MenuItem>
              {examNames.map((exam) => (
                <MenuItem key={exam.id} value={exam.name}>
                  {exam.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ flex: 1, minWidth: 180, py: 1 }} size="small">
            <InputLabel>Session {theStar}</InputLabel>
            <Select
              value={filters.session}
              onChange={(e) => handleFilterChange("session", e.target.value)}
              label="Session"
              sx={{ height: 36 }}
            >
              <MenuItem value="">All Sessions</MenuItem>
              {sessions.map((session) => (
                <MenuItem key={session.id} value={session.name}>
                  {session.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ flex: 1, minWidth: 180, py: 1 }} size="small">
            <InputLabel>Class {theStar}</InputLabel>
            <Select
              value={filters.className}
              onChange={(e) => handleFilterChange("className", e.target.value)}
              label="Class"
              sx={{ height: 36 }}
            >
              <MenuItem value="">All Classes</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.name}>
                  {cls.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ flex: 1, minWidth: 180, py: 1 }} size="small">
            <InputLabel>Section {theStar}</InputLabel>
            <Select
              value={filters.section}
              onChange={(e) => handleFilterChange("section", e.target.value)}
              label="Section"
              sx={{ height: 36 }}
            >
              <MenuItem value="">All Sections</MenuItem>
              {sections.map((section) => (
                <MenuItem key={section.id} value={section.name}>
                  {section.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ flex: 1, minWidth: 180, py: 1 }} size="small">
            <InputLabel>Group {theStar}</InputLabel>
            <Select
              value={filters.stream}
              onChange={(e) => handleFilterChange("stream", e.target.value)}
              label="Stream"
              sx={{ height: 36 }}
            >
              <MenuItem value="">All Streams</MenuItem>
              {streams.map((stream) => (
                <MenuItem key={stream.id} value={stream.name}>
                  {stream.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={applyFilters}
            disabled={
              !filters.examName ||
              !filters.session ||
              !filters.className ||
              !filters.section ||
              !filters.stream
            }
            sx={{
              height: 36,
              backgroundColor: "#035140",
              "&:hover": {
                backgroundColor: "#024030",
              },
              mt: 1,
            }}
          >
            Search
          </Button>
        </Box>

        {filterApplied && (
          <Button
            variant="text"
            startIcon={<FilterX size={18} />}
            onClick={resetFilters}
            sx={{
              color: "#DC2626",
            }}
          >
            Clear
          </Button>
        )}
      </Box>

      <Paper>
        {isFilterLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            {loader}
          </Box>
        ) : isFilterError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load exam routines. Please try again.
          </Alert>
        ) : routines.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            {filterApplied
              ? "No exam routines found for the selected filters."
              : "Please select all filters and click Search to view exam routines."}
          </Typography>
        ) : (
          <>
            <div id="exam-routine-print" style={{ display: "none" }}>
              <StyledHeader>
                <div className="school-name">{branchInfo?.schoolName}</div>
                <div className="exam-title">
                  {routines[0]?.examName || "Exam Routine"}
                </div>
                <div className="class-info">
                  {filters.className} - {filters.section} ({filters.stream}) |
                  Session: {filters.session}
                </div>
              </StyledHeader>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Day</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                      <TableCell>Duration</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {routines.map((routine) => {
                      const parseTime = (timeStr) => {
                        const [hourStr, minuteStr, period] =
                          timeStr.split(":");
                        let hours = parseInt(hourStr, 10);
                        const minutes = parseInt(minuteStr, 10);

                        if (period === "PM" && hours !== 12) hours += 12;
                        if (period === "AM" && hours === 12) hours = 0;

                        return hours * 60 + minutes; // total minutes
                      };

                      const start = parseTime(routine.startTime);
                      const end = parseTime(routine.endTime);

                      const diff = end - start;
                      const h = Math.floor(diff / 60);
                      const m = diff % 60;
                      const duration = `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m" : ""
                        }`.trim();

                      return (
                        <TableRow key={routine.id}>
                          <TableCell>
                            {new Date(routine.examDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(routine.examDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                              }
                            )}
                          </TableCell>
                          <TableCell>{routine.subject.name}</TableCell>
                          <TableCell>{routine.startTime}</TableCell>
                          <TableCell>{routine.endTime}</TableCell>
                          <TableCell>{duration}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <div className="flex justify-end ">
                <StyledFooter className="flex flex-col items-center">
                  <Image
                    src={branchInfo?.principalSignature}
                    width={144}
                    height={144}
                    alt={'Principle Signature'}
                    className="w-24 h-24 object-cover rounded-full p-1 border border-gray-300"
                  />
                  <div className="signature">Principal&apos;s Signature</div>
                </StyledFooter>
              </div>

            </div>

            <Box>
              <StyledRoutineContainer>
                <StyledHeader>
                  <div className="school-name">{branchInfo?.schoolName}</div>
                  <div className="exam-title">Exam Routine</div>
                  <div className="class-info">
                    {filters.className} - {filters.section} ({filters.stream}) |
                    Session: {filters.session}
                  </div>
                </StyledHeader>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <StyledTableRow>
                        <StyledTableCell>Date</StyledTableCell>
                        <StyledTableCell>Day</StyledTableCell>
                        <StyledTableCell>Subject</StyledTableCell>
                        <StyledTableCell>Start Time</StyledTableCell>
                        <StyledTableCell>End Time</StyledTableCell>
                        <StyledTableCell>Duration</StyledTableCell>
                      </StyledTableRow>
                    </TableHead>
                    <TableBody>
                      {routines.map((routine) => {
                        const parseTime = (timeStr) => {
                          const [hourStr, minuteStr, period] =
                            timeStr.split(":");
                          let hours = parseInt(hourStr, 10);
                          const minutes = parseInt(minuteStr, 10);

                          if (period === "PM" && hours !== 12) hours += 12;
                          if (period === "AM" && hours === 12) hours = 0;

                          return hours * 60 + minutes; // total minutes
                        };

                        const start = parseTime(routine.startTime);
                        const end = parseTime(routine.endTime);

                        const diff = end - start;
                        const h = Math.floor(diff / 60);
                        const m = diff % 60;
                        const duration = `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m" : ""
                          }`.trim();
                        return (
                          <StyledTableRow key={routine.id}>
                            <StyledTableCell>
                              {new Date(routine.examDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </StyledTableCell>
                            <StyledTableCell>
                              {new Date(routine.examDate).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                }
                              )}
                            </StyledTableCell>
                            <StyledTableCell>
                              {routine.subject.name}
                            </StyledTableCell>
                            <StyledTableCell>
                              {routine.startTime}
                            </StyledTableCell>
                            <StyledTableCell>{routine.endTime}</StyledTableCell>
                            <StyledTableCell>{duration}</StyledTableCell>
                          </StyledTableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <div className="flex justify-end ">
                  <StyledFooter className="flex flex-col items-center">
                    <Image
                      src={branchInfo?.principalSignature}
                      width={144}
                      height={144}
                      alt={'Principle Signature'}
                      className="w-24 h-24 object-cover rounded-full p-1 border border-gray-300"
                    />
                    <div className="signature">Principal&apos;s Signature</div>
                  </StyledFooter>
                </div>

              </StyledRoutineContainer>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ExamRoutineList;
