"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Alert,
  TextField,
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
import { loader } from "@/app/utils/helper/tokenHelper";
import { useGetClassRoutingFilterQuery } from "@/app/store/api/classes/classRoutineApi";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";

interface ClassRoutine {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  class: {
    name: string;
  } ;
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

const StudentClassRoutine = () => {
  const [page, ] = useState(0);
  const [rowsPerPage] = useState(10);
  const [userInfo, setUserInfo] = useState<unknown>(null);
  const [filters, setFilters] = useState({
    session: "",
    className: "",
    section: "",
    stream: "",
  });

  // Get user info from token
  useEffect(() => {
    const info = getUserInfoFromToken();
    setUserInfo(info);
    
    if (info) {
      setFilters({
        session: info.session?.name || "",
        className: info.class?.name || "",
        section: info.section?.name || "",
        stream: info.stream?.name || "",
      });
    }
  }, []);

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
    { skip: !userInfo } // Skip until we have user info
  );

  const routines: ClassRoutine[] = Array.isArray(filteredData?.data)
    ? filteredData.data
    : filteredData?.data?.data || [];

  // Refetch when filters change
  useEffect(() => {
    if (userInfo) {
      refetchFilteredData();
    }
  }, [filters, userInfo, refetchFilteredData]);

  const handlePrint = () => {
    const printContent = document.getElementById("class-routine-print");
    if (printContent) {
      const printWindow = window.open("", "", "width=1000,height=600");
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
                th { background-color: #f2f2f2; color: #000; text-align: center; padding: 8px; border: 1px solid #ddd; }
                td { padding: 8px; border: 1px solid #ddd; text-align: center; }
                .footer { margin-top: 50px; text-align: right; }
                .signature { border-top: 1px solid #000; width: 200px; padding-top: 5px; display: inline-block; }
                .time-column { min-width: 100px; }
              </style>
            </head>
            <body>
        `);

        // School header
        printWindow.document.write(`
          <div class="header">
            <div class="school-name">Your School Name</div>
            <div class="class-info">
              ${filters.className} (${filters.stream}) | Session: ${filters.session}
            </div>
          </div>
        `);

        // Table
        printWindow.document.write(`
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Subject</th>
                <th>Teacher</th>
              </tr>
            </thead>
            <tbody>
        `);

        // Table rows
        routines.forEach((routine) => {
          printWindow.document.write(`
            <tr>
              <td>${routine.day}</td>
              <td class="time-column">${routine.startTime} - ${routine.endTime}</td>
              <td>${routine.subject?.name || '-'}</td>
              <td>${routine.teacher?.name || '-'}</td>
            </tr>
          `);
        });

        printWindow.document.write(`
            </tbody>
          </table>
          <div class="footer">
            <div class="signature">Principal's Signature</div>
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

  const handleDownloadPDF = () => {
    try {
      const pdf = new jsPDF("landscape", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 40;
      let y = 60;

      // School Header
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("Your School Name", pageWidth / 2, y, { align: "center" });
      y += 30;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(14);
      pdf.text(
        `${filters.className} (${filters.stream}) | Session: ${filters.session}`,
        pageWidth / 2,
        y,
        { align: "center" }
      );
      y += 40;

      // Table Setup
      const availableWidth = pageWidth - margin * 2;
      const colWidths = [
        availableWidth * 0.2,  // Day
        availableWidth * 0.3,  // Time
        availableWidth * 0.25, // Subject
        availableWidth * 0.25  // Teacher
      ];

      const tableX = margin;
      let tableY = y;

      // Table Headers
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);

      const headers = ["Day", "Time", "Subject", "Teacher"];

      // Draw header row borders
      let x = tableX;
      headers.forEach((header, i) => {
        pdf.setDrawColor(221, 221, 221);
        pdf.rect(x, tableY, colWidths[i], 25, "D");
        pdf.text(header, x + colWidths[i] / 2, tableY + 16, {
          align: "center"
        });
        x += colWidths[i];
      });

      tableY += 25;

      // Table Content
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);

      routines.forEach((routine) => {
        // Page break check
        if (tableY > pdf.internal.pageSize.height - 50) {
          pdf.addPage("landscape");
          tableY = margin;
          
          // Redraw headers on new page
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          x = tableX;
          headers.forEach((header, i) => {
            pdf.setDrawColor(221, 221, 221);
            pdf.rect(x, tableY, colWidths[i], 25, "D");
            pdf.text(header, x + colWidths[i] / 2, tableY + 16, {
              align: "center"
            });
            x += colWidths[i];
          });
          tableY += 25;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(11);
        }

        const rowData = [
          routine.day,
          `${routine.startTime} - ${routine.endTime}`,
          routine.subject?.name || '-',
          routine.teacher?.name || '-'
        ];

        // Draw content row
        x = tableX;
        rowData.forEach((data, i) => {
          pdf.setDrawColor(221, 221, 221);
          pdf.rect(x, tableY, colWidths[i], 25, "D");
          
          pdf.text(data, x + colWidths[i] / 2, tableY + 16, {
            align: "center",
            maxWidth: colWidths[i] - 10
          });
          
          x += colWidths[i];
        });

        tableY += 25;
      });

      // Footer with signature
      const footerY = pdf.internal.pageSize.height - 40;
      pdf.setFontSize(12);
      pdf.text("Principal's Signature", pageWidth - margin - 100, footerY);
      pdf.setDrawColor(0, 0, 0);
      pdf.line(pageWidth - margin - 100, footerY + 5, pageWidth - margin, footerY + 5);

      // Save PDF
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

  if (!userInfo) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        {loader}
      </Box>
    );
  }

  return (
    <Box>
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" component="h1" fontWeight="bold">
          My Class Routine
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
           <SubmitButton disabled={routines.length === 0} onClick={handlePrint}>Print</SubmitButton>
          <CancelButton disabled={routines.length === 0} onClick={handleDownloadPDF}>PDF</CancelButton>
        </Box>
      </div>

     <Box 
  sx={{ 
    mb: 4, 
    display: "flex", 
    gap: 2, 
    flexWrap: 'wrap',
    '& > *': { // Targets all direct children
      width: { xs: 'calc(50% - 8px)', md: 'auto' }, // 2 per row on mobile, auto on desktop
      minWidth: { xs: 'unset', md: 200 }, // Remove min-width on mobile
    }
  }}
>
  <TextField
    label="Session"
    value={filters.session}
    variant="outlined"
    size="small"
    InputProps={{ readOnly: true }}
  />
  <TextField
    label="Class"
    value={filters.className}
    variant="outlined"
    size="small"
    InputProps={{ readOnly: true }}
  />
  <TextField
    label="Section"
    value={filters.section}
    variant="outlined"
    size="small"
    InputProps={{ readOnly: true }}
  />
  <TextField
    label="Stream"
    value={filters.stream}
    variant="outlined"
    size="small"
    InputProps={{ readOnly: true }}
  />
</Box>

      <Paper>
        {isFilterLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            {loader}
          </Box>
        ) : isFilterError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load class routine. Please try again.
          </Alert>
        ) : routines.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No class routine found for your class.
          </Typography>
        ) : (
          <>
            <div id="class-routine-print" style={{ display: "none" }}>
              <StyledHeader>
                <div className="school-name">Your School Name</div>
                <div className="class-info">
                  {filters.className} ({filters.stream}) | Session: {filters.session}
                </div>
              </StyledHeader>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Teacher</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {routines.map((routine) => (
                      <TableRow key={routine.id}>
                        <TableCell>{routine.day}</TableCell>
                        <TableCell>{routine.startTime} - {routine.endTime}</TableCell>
                        <TableCell>{routine.subject?.name || '-'}</TableCell>
                        <TableCell>{routine.teacher?.name || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <StyledFooter>
                <div className="signature">Principal&apos;s Signature</div>
              </StyledFooter>
            </div>

            <Box>
              <StyledRoutineContainer>
                <StyledHeader>
                  <div className="school-name">Your School Name</div>
                  <div className="class-title">Class Routine</div>
                  <div className="class-info">
                    {filters.className} ({filters.stream}) | Session: {filters.session}
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
                    sx={{ minWidth: 800 }}
                    aria-label="class routine table"
                  >
                    <TableHead>
                      <StyledTableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <StyledTableCell>Day</StyledTableCell>
                        <StyledTableCell>Time</StyledTableCell>
                        <StyledTableCell>Subject</StyledTableCell>
                        <StyledTableCell>Teacher</StyledTableCell>
                      </StyledTableRow>
                    </TableHead>
                    <TableBody>
                      {routines.map((routine) => (
                        <StyledTableRow key={routine.id}>
                          <StyledTableCell>{routine.day}</StyledTableCell>
                          <StyledTableCell>{routine.startTime} - {routine.endTime}</StyledTableCell>
                          <StyledTableCell>{routine.subject?.name || '-'}</StyledTableCell>
                          <StyledTableCell>{routine.teacher?.name || '-'}</StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <StyledFooter>
                  <div className="signature">Principal&apos;s Signature</div>
                </StyledFooter>
              </StyledRoutineContainer>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default StudentClassRoutine;