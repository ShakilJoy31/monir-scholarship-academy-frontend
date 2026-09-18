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
    TableRow
} from "@mui/material";
import { toast } from "react-toastify";
import { useGetExamRoutingFilterQuery } from "@/app/store/api/classes/examRoutineApi";
import jsPDF from "jspdf";
import { loader } from "@/app/utils/helper/tokenHelper";
import { useGetAllExamsQuery } from "@/app/store/api/classes/examApi";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { theStar } from "@/lib/requiredJSX";

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
    }
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

const StudentExamRoutine = () => {
    const userInfo = getUserInfoFromToken();
    const [page,] = useState(0);
    const [rowsPerPage] = useState(10);
    const [filters, setFilters] = useState<FilterState>({
        session: userInfo?.session?.name || "",
        className: userInfo?.class?.name || "",
        section: userInfo?.section?.name || "",
        stream: userInfo?.stream?.name || "",
        examName: ""
    });
    const [shouldFetch, setShouldFetch] = useState(false);
    const [examNames, setExamNames] = useState<DropdownOption[]>([]);

    const {
        data: filteredData,
        isLoading: isFilterLoading,
        isError: isFilterError,
        refetch
    } = useGetExamRoutingFilterQuery({
        page: page + 1,
        size: rowsPerPage,
        sessionYear: filters.session,
        section: filters.section,
        className: filters.className,
        stream: filters.stream,
        examName: filters.examName
    }, {
        skip: !shouldFetch
    });

    const { data: examsData } = useGetAllExamsQuery({ page: 1, size: 100000 });

    const routines: ExamRoutine[] = Array.isArray(filteredData?.data)
        ? filteredData.data
        : filteredData?.data || [];

    // Set exam names from API
    useEffect(() => {
        if (examsData?.data) {
            setExamNames(examsData.data);
        }
    }, [examsData]);

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const applyFilters = () => {
        if (filters.examName) {
            setShouldFetch(true);
            refetch();
        }
    };

    const handlePrint = () => {
        const printContent = document.getElementById('exam-routine-print');
        if (printContent) {
            const printWindow = window.open('', '', 'width=800,height=600');
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
                    <div class="school-name">Your School Name</div>
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
                            <th>Time Schedule</th>
                        </tr>
                    </thead>
                    <tbody>
            `);

                // Table rows
                routines.forEach((routine) => {
                    const date = new Date(routine.examDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    });
                    const day = new Date(routine.examDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                    });

                    const start = routine.startTime.split(':').map(Number);
                    const end = routine.endTime.split(':').map(Number);
                    const durationHours = end[0] - start[0];
                    const durationMinutes = end[1] - start[1];
                    const duration = `${durationHours}h ${durationMinutes}m`;

                    printWindow.document.write(`
                    <tr>
                        <td>${date}</td>
                        <td>${day}</td>
                        <td>${routine.subject.name}</td>
                        <td>${routine.startTime} ${","} ${routine.endTime} ${","} ${duration}</td>
                    </tr>
                `);
                });

                // Notice section
                printWindow.document.write(`
                    </tbody>
                </table>
                <div class="notice">
                    <div class="notice-title">Notice:</div>
                    <ol>
                        <li>Students must wear their school uniform.</li>
                        <li>Admit card is mandatory to enter the exam hall.</li>
                        <li>No mobile phones or smart devices allowed during exams.</li>
                        <li>Students must arrive at least 30 minutes before the exam starts.</li>
                        <li>Any form of malpractice will lead to disciplinary action.</li>
                    </ol>
                </div>
                <div class="footer">
                    <div class="signature">Principal's Signature</div>
                </div>
            `);

                printWindow.document.write('</body></html>');
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
        const input = document.getElementById('exam-routine-print');
        if (!input) return;

        try {
            const element = input.cloneNode(true) as HTMLElement;
            document.body.appendChild(element);
            element.style.display = 'block';

            const pdf = new jsPDF('p', 'pt', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 40;
            let y = 60;

            // ===== Title =====
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(18);
            pdf.text(routines[0]?.examName || "Exam Routine", pageWidth / 2, y, { align: 'center' });
            y += 30;

            // ===== Class and Session Info =====
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(
                `${filters.className} - ${filters.section} (${filters.stream}) | Session: ${filters.session}`,
                pageWidth / 2,
                y,
                { align: 'center' }
            );
            y += 40;

            // ===== Table Header Styling =====
            const headers = ['Date', 'Day', 'Subject', 'Time Schedule'];
            const colWidths = [90, 80, 120, 240];
            const tableX = margin;
            let tableY = y;

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.setTextColor(0, 0, 0);

            // Draw headers
            let x = tableX;
            headers.forEach((header, i) => {
                pdf.setFillColor(220, 220, 220);
                pdf.setDrawColor(200, 200, 200);
                pdf.rect(x, tableY, colWidths[i], 25, 'FD');
                pdf.text(header, x + colWidths[i] / 2, tableY + 17, { align: 'center' });
                x += colWidths[i];
            });

            // ===== Table Body =====
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(0, 0, 0);
            tableY += 25;

            routines.forEach((routine) => {
                const date = new Date(routine.examDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                });
                const day = new Date(routine.examDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                });

                const start = routine.startTime.split(':').map(Number);
                const end = routine.endTime.split(':').map(Number);
                const durationHours = end[0] - start[0];
                const durationMinutes = end[1] - start[1];
                const duration = `${durationHours}h ${durationMinutes}m`;

                const timeSchedule = `${routine.startTime} - ${routine.endTime} (${duration})`;

                const row = [
                    date,
                    day,
                    routine.subject.name,
                    timeSchedule
                ];

                let x = tableX;
                row.forEach((cell, i) => {
                    pdf.rect(x, tableY, colWidths[i], 25, 'D');
                    const align = i === 3 ? 'center' : 'left';
                    pdf.text(cell, x + (i === 3 ? colWidths[i] / 2 : 5), tableY + 17, { align });
                    x += colWidths[i];
                });

                tableY += 25;

                // Check if new page is needed
                if (tableY > pdf.internal.pageSize.height - 100) {
                    pdf.addPage();
                    tableY = margin;

                    // Redraw headers on new page
                    let x = tableX;
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(11);
                    headers.forEach((header, i) => {
                        pdf.setFillColor(220, 220, 220);
                        pdf.setDrawColor(200, 200, 200);
                        pdf.rect(x, tableY, colWidths[i], 25, 'FD');
                        pdf.setTextColor(0, 0, 0);
                        pdf.text(header, x + colWidths[i] / 2, tableY + 17, { align: 'center' });
                        x += colWidths[i];
                    });
                    tableY += 25;
                    pdf.setFont('helvetica', 'normal');
                }
            });

            y = tableY + 40;

            // ===== Notice Section =====
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.text('Notice:', margin, y);
            y += 20;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            const noticeLines = [
                '1. Students must wear their school uniform.',
                '2. Admit card is mandatory to enter the exam hall.',
                '3. No mobile phones or smart devices allowed during exams.',
                '4. Students must arrive at least 30 minutes before the exam starts.',
                '5. Any form of malpractice will lead to disciplinary action.'
            ];

            noticeLines.forEach((line) => {
                pdf.text(line, margin, y);
                y += 18;
            });

            // ===== Principal Signature =====
            y += 30;
            pdf.text("Principal's Signature", pageWidth - 160, y);
            pdf.line(pageWidth - 160, y + 5, pageWidth - 60, y + 5);

            // ===== Save the PDF =====
            pdf.save(`${routines[0]?.examName || 'exam'}_routine.pdf`);

            // Clean up
            document.body.removeChild(element);
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF');
        }
    };

    // Create a styled TableCell with borders
    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        border: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(1, 2),
    }));

    // Create a styled TableRow for hover effect
    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    }));

    return (
        <Box>
            <div className="flex justify-between items-center mb-6">
                <Typography variant="h5" component="h1" fontWeight="bold">
                    Exam Routine
                </Typography>

                {routines.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <SubmitButton onClick={handlePrint}>Print</SubmitButton>
                        <CancelButton onClick={handleDownloadPDF}>PDF</CancelButton>
                    </Box>
                )}
            </div>

            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    border: 0,
                    flexWrap: 'wrap',
                    width: '100%'
                }}>
                    {/* Read-only fields for class, section, stream, session */}
                    <FormControl sx={{ flex: 1, minWidth: 180, py: 1 }} size="small">
                        <InputLabel>Class</InputLabel>
                        <Select
                            value={filters.className}
                            label="Class"
                            sx={{ height: 36 }}
                            disabled
                        >
                            <MenuItem value={filters.className}>
                                {filters.className}
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl sx={{ flex: 1, minWidth: 180, py: 1 }} size="small">
                        <InputLabel>Section</InputLabel>
                        <Select
                            value={filters.section}
                            label="Section"
                            sx={{ height: 36 }}
                            disabled
                        >
                            <MenuItem value={filters.section}>
                                {filters.section}
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl sx={{ flex: 1, minWidth: 180, py: 1 }} size="small">
                        <InputLabel>Stream</InputLabel>
                        <Select
                            value={filters.stream}
                            label="Stream"
                            sx={{ height: 36 }}
                            disabled
                        >
                            <MenuItem value={filters.stream}>
                                {filters.stream}
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl sx={{ flex: 1, minWidth: 180, py: 1 }} size="small">
                        <InputLabel>Session</InputLabel>
                        <Select
                            value={filters.session}
                            label="Session"
                            sx={{ height: 36 }}
                            disabled
                        >
                            <MenuItem value={filters.session}>
                                {filters.session}
                            </MenuItem>
                        </Select>
                    </FormControl>

                    {/* Only exam name is selectable */}
                    <FormControl sx={{ flex: 1, minWidth: 180, py: 1 }} size="small">
                        <InputLabel>Exam {theStar}</InputLabel>
                        <Select
                            value={filters.examName}
                            onChange={(e) => handleFilterChange('examName', e.target.value)}
                            label="Exam"
                            sx={{ height: 36 }}
                        >
                            <MenuItem value="">Select Exam</MenuItem>
                            {examNames.map((exam) => (
                                <MenuItem key={exam.id} value={exam.name}>
                                    {exam.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        onClick={applyFilters}
                        disabled={!filters.examName}
                        sx={{
                            height: 36,
                            backgroundColor: "#035140",
                            "&:hover": {
                                backgroundColor: "#024030",
                            },
                        }}
                    >
                        Search
                    </Button>
                </Box>
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
                        {shouldFetch
                            ? "No exam routines found for the selected exam."
                            : "Please select an exam and click Search to view your exam routine."}
                    </Typography>
                ) : (
                    <>
                        <div id="exam-routine-print" style={{ display: 'none' }}>
                            <StyledHeader>
                                <div className="school-name">Your School Name</div>
                                <div className="exam-title">{routines[0]?.examName || "Exam Routine"}</div>
                                <div className="class-info">
                                    {filters.className} - {filters.section} ({filters.stream}) | Session: {filters.session}
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
                                            const start = routine.startTime.split(':').map(Number);
                                            const end = routine.endTime.split(':').map(Number);
                                            const durationHours = end[0] - start[0];
                                            const durationMinutes = end[1] - start[1];
                                            const duration = `${durationHours}h ${durationMinutes}m`;

                                            return (
                                                <TableRow key={routine.id}>
                                                    <TableCell>
                                                        {new Date(routine.examDate).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(routine.examDate).toLocaleDateString('en-US', {
                                                            weekday: 'long'
                                                        })}
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

                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h6" gutterBottom>Notice:</Typography>
                                <ol>
                                    <li>Students must wear their school uniform.</li>
                                    <li>Admit card is mandatory to enter the exam hall.</li>
                                    <li>No mobile phones or smart devices allowed during exams.</li>
                                    <li>Students must arrive at least 30 minutes before the exam starts.</li>
                                    <li>Any form of malpractice will lead to disciplinary action.</li>
                                </ol>
                            </Box>

                            <StyledFooter>
                                <div className="signature">
                                    Principal&apos;s Signature
                                </div>
                            </StyledFooter>
                        </div>

                        <Box>
                            <StyledRoutineContainer>
                                <StyledHeader>
                                    <div className="school-name">Your School Name</div>
                                    <div className="exam-title">Exam Routine</div>
                                    <div className="class-info">
                                        {filters.className} - {filters.section} ({filters.stream}) | Session: {filters.session}
                                    </div>
                                </StyledHeader>

                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <StyledTableRow>
                                                <StyledTableCell>Date</StyledTableCell>
                                                <StyledTableCell>Day</StyledTableCell>
                                                <StyledTableCell>Subject</StyledTableCell>
                                                <StyledTableCell>Time</StyledTableCell>
                                            </StyledTableRow>
                                        </TableHead>
                                        <TableBody>
                                            {routines.map((routine) => (
                                                <StyledTableRow key={routine.id}>
                                                    <StyledTableCell>
                                                        {new Date(routine.examDate).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        {new Date(routine.examDate).toLocaleDateString('en-US', {
                                                            weekday: 'long'
                                                        })}
                                                    </StyledTableCell>
                                                    <StyledTableCell>{routine.subject.name}</StyledTableCell>
                                                    <StyledTableCell>
                                                        {routine.startTime} - {routine.endTime}
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <StyledFooter>
                                    <div className="signature">
                                        Principal&apos;s Signature
                                    </div>
                                </StyledFooter>
                            </StyledRoutineContainer>
                        </Box>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default StudentExamRoutine;