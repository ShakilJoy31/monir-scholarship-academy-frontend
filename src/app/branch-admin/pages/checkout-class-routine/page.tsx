"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
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
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import { getUserInfoFromToken, loader } from "@/app/utils/helper/tokenHelper";
import { useGetClassRoutingFilterQuery } from "@/app/store/api/classes/classRoutineApi";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { theStar } from "@/lib/requiredJSX";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";
import Image from "next/image";
import html2canvas from "html2canvas-pro";

interface ClassRoutine {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  class: {
    name: string;
  };
  section: {
    name: string;
  };
  stream: {
    name: string;
  };
  subject: {
    name: string;
    code?: string;
  };
  teacher: {
    name: string;
    designation?: string;
    specialistSubject?: string;
  };
  session: {
    name: string;
  };
  [key: string]: unknown;
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
  "& .class-title": {
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

const CheckoutClassRoutine = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterState>({
    session: "",
    className: "",
    section: "",
    stream: "",
  });
  const [filterApplied, setFilterApplied] = useState(false);

  // Dropdown data state
  const [sessions, setSessions] = useState<DropdownOption[]>([]);
  const [classes, setClasses] = useState<DropdownOption[]>([]);
  const [sections, setSections] = useState<DropdownOption[]>([]);
  const [streams, setStreams] = useState<DropdownOption[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  const {
    data: filteredData,
    isLoading: isFilterLoading,
    isError: isFilterError,
    refetch: refetchFilteredData,
  } = useGetClassRoutingFilterQuery(
    {
      page: page + 1,
      size: rowsPerPage,
      sessionYear: filters.session,
      section: filters.section,
      className: filters.className,
      stream: filters.stream,
    },
    { skip: !filterApplied }
  );

  const routines: ClassRoutine[] = useMemo(
    () => Array.isArray(filteredData?.data)
      ? filteredData.data
      : filteredData?.data?.data || []
    , [filteredData]
  );

  const { data: classesData, isLoading: classesLoading } = useGetAllClassQuery({ page: 1, size: 100000 });
  const { data: sessionsData, isLoading: sessionsLoading } = useGetAllSessionsQuery({ page: 1, size: 100000 });
  const { data: sectionsData, isLoading: sectionsLoading } = useGetAllSectionsQuery({ page: 1, size: 100000 });
  const { data: streamsData, isLoading: streamsLoading } = useGetAllStreamsQuery({ page: 1, size: 100000 });


  // Fetching branch name, email, address and logo. 
  const userInfo = getUserInfoFromToken();
  const { data: branchConfigData } = useGetBranchConfigQuery(userInfo?.branchId)

  const branchInfo = branchConfigData?.data;

  // Process data for the timetable view
  const { uniqueTimes, days } = useMemo(() => {
    if (!routines || routines.length === 0) {
      return { uniqueTimes: [], days: [] };
    }

    // Get all unique time slots
    const timeSlots = new Set(
      routines.map((routine) => `${routine.startTime}-${routine.endTime}`)
    );
    const sortedTimes = Array.from(timeSlots).sort((a, b) => {
      const [aStart] = a.split("-");
      const [bStart] = b.split("-");
      return aStart.localeCompare(bStart);
    });

    // Get all unique days
    const daySet = new Set(routines.map((routine) => routine.day));
    const sortedDays = Array.from(daySet).sort((a, b) => {
      const daysOrder = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      return daysOrder.indexOf(a) - daysOrder.indexOf(b);
    });

    return { uniqueTimes: sortedTimes, days: sortedDays };
  }, [routines]);

  // Fetch dropdown data
  useEffect(() => {
    setLoadingDropdowns(true);
    try {
      if (sessionsData?.data) {
        setSessions(sessionsData.data);
      }
      if (classesData?.data) {
        setClasses(classesData.data);
      }
      if (sectionsData?.data) {
        setSections(sectionsData.data);
      }
      if (streamsData?.data) {
        setStreams(streamsData.data);
      }
    } catch (error) {
      console.error("Error setting dropdown data:", error);
    } finally {
      setLoadingDropdowns(false);
    }
  }, [classesData, sessionsData, sectionsData, streamsData]);

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
    });
    setFilterApplied(false);
    setPage(0);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("class-routine-print");
    if (printContent) {
      const printWindow = window.open("", "", "width=800,height=600");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Class Routine</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .school-name { font-size: 18pt; font-weight: bold; margin-bottom: 10px; }
                .class-title { font-size: 16pt; margin-bottom: 10px; }
                .class-info { font-size: 12pt; color: #555; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { background-color: #f2f2f2; text-align: center; padding: 6px; border: 1px solid #ddd; }
                td { padding: 6px; border: 1px solid #ddd; text-align: center; }
                .footer { margin-top: 50px; text-align: right; }
                .signature { border-top: 1px solid #000; width: 200px; padding-top: 5px; display: inline-block; }
                .notice { margin-top: 30px; }
                .notice-title { font-weight: bold; margin-bottom: 10px; }
                .subject { font-weight: bold; }
                .teacher { font-size: 10pt; color: #555; }
              </style>
            </head>
            <body>
        `);

        // School header
        printWindow.document.write(`
          <div class="header">
            <div class="school-name">${branchInfo?.schoolName}</div>
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
                <th>Day</th>
                ${uniqueTimes
            .map(
              (time) => `
                  <th class="truncate max-w-[260px]">
                    <small>${time.replace("-", " - ")}</small>
                  </th>
                `
            )
            .join("")}
              </tr>
            </thead>
            <tbody>
        `);

        // Table rows
        days.forEach((day) => {
          printWindow.document.write(`
            <tr>
              <td>${day}</td>
              ${uniqueTimes
              .map((time) => {
                const [startTime, endTime] = time.split("-");
                const routine = routines.find(
                  (r) =>
                    r.day === day &&
                    r.startTime === startTime &&
                    r.endTime === endTime
                );

                return `
                    <td class="truncate max-w-[260px]">
                      ${routine
                    ? `
                            <div class="subject">${routine.subject?.name || ""}</div>
                            <div class="teacher">${routine.teacher?.name || ""
                    }</div>
                          `
                    : "-"
                  }
                    </td>
                  `;
              })
              .join("")}
            </tr>
          `);
        });

        // Notice section
        printWindow.document.write(`
            </tbody>
          </table>
          
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

        // Wait for content to load before printing
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

const handleDownloadPDF = async () => {
    const printContent = document.getElementById("class-routine-print");
    if (!printContent) return;

    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 40;
      let y = 60;

      // ===== Header Section =====
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text(branchInfo?.schoolName, pageWidth / 2, y, { align: "center" });
      y += 30;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(14);
      pdf.text(
        `${filters.className} - ${filters.section} (${filters.stream}) | Session: ${filters.session}`,
        pageWidth / 2,
        y,
        { align: "center" }
      );
      y += 40;

      // ===== Table Setup =====
      const colWidths = [
        60,
        ...Array(uniqueTimes.length).fill(
          (pageWidth - 60 - margin * 2) / uniqueTimes.length
        ),
      ];
      const tableX = margin;
      let tableY = y;

      // ===== Table Headers =====
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setFillColor(255, 255, 255); // White fill
      pdf.setDrawColor(0, 0, 0); // Black border
      pdf.setTextColor(0, 0, 0); // Black text

      // Day header
      pdf.rect(tableX, tableY, colWidths[0], 25, "D");
      pdf.text("Day", tableX + colWidths[0] / 2, tableY + 17, {
        align: "center",
      });

      // Time headers - Only showing time slots
      let x = tableX + colWidths[0];
      uniqueTimes.forEach((time) => {
        pdf.rect(x, tableY, colWidths[1], 25, "D");
        pdf.text(time.replace("-", " - "), x + colWidths[1] / 2, tableY + 17, {
          align: "center",
        });
        x += colWidths[1];
      });

      tableY += 25;

      // ===== Table Rows =====
      pdf.setFont("helvetica", "normal");
      days.forEach((day) => {
        // Check if we need a new page
        if (tableY > pdf.internal.pageSize.height - 100) {
          pdf.addPage();
          tableY = margin;

          // Redraw headers on new page
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(9);
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(0, 0, 0);

          // Day header
          pdf.rect(tableX, tableY, colWidths[0], 25, "D");
          pdf.text("Day", tableX + colWidths[0] / 2, tableY + 17, {
            align: "center",
          });

          // Time headers
          let x = tableX + colWidths[0];
          uniqueTimes.forEach((time) => {
            pdf.rect(x, tableY, colWidths[1], 25, "D");
            pdf.text(
              time.replace("-", " - "),
              x + colWidths[1] / 2,
              tableY + 17,
              { align: "center" }
            );
            x += colWidths[1];
          });

          tableY += 25;
          pdf.setFont("helvetica", "normal");
        }

        // Day cell
        pdf.rect(tableX, tableY, colWidths[0], 25, "D");
        pdf.text(day, tableX + colWidths[0] / 2, tableY + 17, {
          align: "center",
        });

        // Period cells
        let x = tableX + colWidths[0];
        uniqueTimes.forEach((time) => {
          const [startTime, endTime] = time.split("-");
          const routine = routines.find(
            (r) =>
              r.day === day &&
              r.startTime === startTime &&
              r.endTime === endTime
          );

          pdf.rect(x, tableY, colWidths[1], 25, "D");

          if (routine) {
            pdf.setFont("helvetica", "bold");
            pdf.text(routine.subject?.name || "", x + colWidths[1] / 2, tableY + 12, {
              align: "center",
            });
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(7);
            pdf.setTextColor(85, 85, 85);
            pdf.text(
              routine.teacher?.name || "",
              x + colWidths[1] / 2,
              tableY + 20,
              { align: "center" }
            );
            pdf.setFontSize(9);
            pdf.setTextColor(0, 0, 0);
          } else {
            pdf.text("-", x + colWidths[1] / 2, tableY + 15, {
              align: "center",
            });
          }

          x += colWidths[1];
        });

        tableY += 25;
      });

      // ===== Principal Signature Section =====
      const signatureY = tableY + 90;

      // Add principal signature text and line
      pdf.setFontSize(11);
      pdf.text("Principal's Signature", pageWidth - margin - 100, signatureY);
      pdf.line(pageWidth - margin - 100, signatureY + 5, pageWidth - margin, signatureY + 5);

      // If signature image exists, use html2canvas approach
      if (branchInfo?.principalSignature) {
        try {
          // Create a temporary div with the signature image
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.top = '0';
          tempDiv.innerHTML = `
            <img src="${branchInfo.principalSignature}" 
                 width="70" 
                 height="60" 
                 alt="Principal Signature" 
                 style="object-fit: cover; " />
          `;
          document.body.appendChild(tempDiv);

          // Use html2canvas to capture the image
          const canvas = await html2canvas(tempDiv, {
            useCORS: true,
            scale: 2,
            logging: false
          });

          // Convert to image data and add to PDF
          const imgData = canvas.toDataURL('image/png');
          
          // Add signature image above the text
          pdf.addImage(imgData, 'PNG', pageWidth - margin - 85, signatureY - 75, 70, 60);

          // Clean up
          document.body.removeChild(tempDiv);
        } catch (error) {
          console.error("Error adding signature image to PDF:", error);
          // Continue without the image - text signature is already added
        }
      }

      // ===== Save the PDF =====
      pdf.save(
        `${filters.className || "class"}_routine_${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
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
          Print  Class Routine
        </Typography>

        {filterApplied && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <SubmitButton
              // startIcon={<Printer size={18} />}
              onClick={handlePrint}
              disabled={routines.length === 0}
            >
              Print
            </SubmitButton>
            <CancelButton
              // startIcon={<Download size={18} />}
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
            <InputLabel>Session {theStar}</InputLabel>
            <Select
              value={filters.session}
              onChange={(e) => handleFilterChange("session", e.target.value)}
              label="Session"
              sx={{ height: 36 }}
              disabled={loadingDropdowns || sessionsLoading}
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
              disabled={loadingDropdowns || classesLoading}
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
              disabled={loadingDropdowns || sectionsLoading}
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
              disabled={loadingDropdowns || streamsLoading}
            >
              <MenuItem value="">All Streams</MenuItem>
              {streams.map((stream) => (
                <MenuItem key={stream.id} value={stream.name}>
                  {stream.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <SubmitButton
            onClick={applyFilters}
            disabled={
              !filters.session ||
              !filters.className ||
              !filters.section ||
              !filters.stream
            }
            sx={{ height: 36, mt: 1 }}
          >
            Search
          </SubmitButton>
        </Box>

        {filterApplied && (
          <CancelButton
            onClick={resetFilters}

          >
            Reset
          </CancelButton>
        )}
      </Box>

      <Paper>
        {isFilterLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            {loader}
          </Box>
        ) : isFilterError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load class routines. Please try again.
          </Alert>
        ) : routines.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            {filterApplied
              ? "No class routines found for the selected filters."
              : "Please select all filters and click Search to view class routines."}
          </Typography>
        ) : (
          <>
            <div id="class-routine-print" style={{ display: "none" }}>
              <StyledHeader>
                <div className="school-name">Your School Name</div>
                <div className="class-info">
                  {filters.className} - {filters.section} ({filters.stream}) |
                  Session: {filters.session}
                </div>
              </StyledHeader>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      {uniqueTimes.map((time) => (
                        <TableCell key={time}>
                          <small>{time.replace("-", " - ")}</small>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {days.map((day) => (
                      <TableRow key={day}>
                        <TableCell>{day}</TableCell>
                        {uniqueTimes.map((time) => {
                          const [startTime, endTime] = time.split("-");
                          const routine = routines.find(
                            (r) =>
                              r.day === day &&
                              r.startTime === startTime &&
                              r.endTime === endTime
                          );

                          return (
                            <TableCell key={time}>
                              {routine ? (
                                <>
                                  <div style={{ fontWeight: "bold" }}>
                                    {routine.subject?.name || ""}
                                  </div>
                                  <div
                                    style={{ fontSize: "12px", color: "#555" }}
                                  >
                                    {routine.teacher?.name || ""}
                                  </div>
                                </>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <div className="flex justify-end border">
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
                  <div className="class-title">Class Routine</div>
                  <div className="class-info">
                    {filters.className} - {filters.section} ({filters.stream}) |
                    Session: {filters.session}
                  </div>
                </StyledHeader>

                <TableContainer
                  component={Paper}
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    boxShadow: 1,
                    mt: 2,
                    overflowX: "auto",
                  }}
                >
                  <Table
                    sx={{ minWidth: 700 }}
                    aria-label="class routine table"
                  >
                    <TableHead>
                      <StyledTableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <StyledTableCell>Day</StyledTableCell>
                        {uniqueTimes.map((time) => (
                          <StyledTableCell key={time} align="center">
                            <Typography variant="caption">
                              {time.replace("-", " - ")}
                            </Typography>
                          </StyledTableCell>
                        ))}
                      </StyledTableRow>
                    </TableHead>
                    <TableBody>
                      {days.map((day) => (
                        <StyledTableRow key={day}>
                          <StyledTableCell>{day}</StyledTableCell>
                          {uniqueTimes.map((time) => {
                            const [startTime, endTime] = time.split("-");
                            const routine = routines.find(
                              (r) =>
                                r.day === day &&
                                r.startTime === startTime &&
                                r.endTime === endTime
                            );

                            return (
                              <StyledTableCell key={time} align="center">
                                {routine ? (
                                  <>
                                    <Typography fontWeight="bold">
                                      {routine.subject?.name || ""}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {routine.teacher?.name || ""}
                                    </Typography>
                                  </>
                                ) : (
                                  "-"
                                )}
                              </StyledTableCell>
                            );
                          })}
                        </StyledTableRow>
                      ))}
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

export default CheckoutClassRoutine;