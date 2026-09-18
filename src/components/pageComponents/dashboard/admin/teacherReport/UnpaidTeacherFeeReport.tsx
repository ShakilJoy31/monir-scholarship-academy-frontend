"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Checkbox,
  IconButton,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { useGetUnpaidTeacherFeeQuery } from "@/app/store/api/allReport/allReportApi";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import ViewSingleUnpaidTeacherFeeReport from "./ViewSingleUnpaidTeacherFeeReport";
import { usePrint } from "@/components/pageComponents/PrintPDFComponent/PrintComponent";
import { usePDF } from "@/components/pageComponents/PrintPDFComponent/PDFComponent";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";

interface StudentFeeData {
  [key: string]: unknown;
  id: number;
  name: string;
  teacherUniqueId: string;
  designation: string;
  classRoll: number;
  class: {
    id: number;
    name: string;
  };
  section: {
    id: number;
    name: string;
  };
  totalUnpaid: number;
  totalDiscount: number;
  totalPay: number;
  unpaidCount: number;
  totalAdvance: number;
}


const UnpaidTeacherFeeReport = () => {
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // Only fetch data when searchTriggered = true
  const {
    data: unpaidFeeResponse,
    isLoading,
    isError,
  } = useGetUnpaidTeacherFeeQuery({});


  const students: StudentFeeData[] = Array.isArray(unpaidFeeResponse?.data)
    ? unpaidFeeResponse.data
    : unpaidFeeResponse?.data || [];

  // Calculate total pages
  const totalPages = Math.ceil(students.length / rowsPerPage);





  // Select all checkbox
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allStudentIds = students.map((student) => student.id);
      setSelectedStudents(allStudentIds);
      setSelectAll(true);
    } else {
      setSelectedStudents([]);
      setSelectAll(false);
    }
  };

  // Select single student
  const handleSelectStudent = (studentId: number) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        const newSelected = prev.filter((id) => id !== studentId);
        setSelectAll(newSelected.length === students.length);
        return newSelected;
      } else {
        const newSelected = [...prev, studentId];
        setSelectAll(newSelected.length === students.length);
        return newSelected;
      }
    });
  };

  // Handle view student - open modal
  const handleViewStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStudentId(null);
  };

    const { printData } = usePrint<StudentFeeData>();
    const { generatePDF } = usePDF<StudentFeeData>();
  
    const handlePrint = () => {
      if (selectedStudents.length === 0) {
        alert("Please select at least one student to print");
        return;
      }
  
      const selectedData = students.filter((student) =>
        selectedStudents.includes(student.id)
      );
  
      // Define columns for print (similar to table columns but without actions)
      const printColumns = columns
        .filter((col) => col.key !== "select" && col.key !== "actions")
        .map((col) => ({
          ...col,
          header:
            typeof col.header === "string"
              ? col.header
              : typeof col.header === "object" &&
                "props" in col.header &&
                col.header.props?.children
              ? col.header.props.children
              : col.key,
        }));
  
      printData(selectedData, printColumns, "Paid Class Fee Report");
    };
  
    // PDF handler
    const handlePDF = async () => {
      if (selectedStudents.length === 0) {
        alert("Please select at least one student to generate PDF");
        return;
      }
  
      const selectedData = students.filter((student) =>
        selectedStudents.includes(student.id)
      );
  
      // Define columns for PDF (without select and actions)
      const pdfColumns = columns
        .filter((col) => col.key !== "select" && col.key !== "actions")
        .map((col) => ({
          key: col.key,
          header:
            typeof col.header === "string"
              ? col.header
              : typeof col.header === "object" &&
                "props" in col.header &&
                col.header.props?.children
              ? col.header.props.children
              : col.key,
          render: col.render,
        }));
  
      await generatePDF(
        selectedData,
        pdfColumns,
        "Paid Class Fee Report",
        "paid_class_fee_report"
      );
    };

  // Table columns
  const columns = [
    {
      key: "select",
      header: (
        <Checkbox
          checked={selectAll}
          onChange={handleSelectAll}
          indeterminate={
            selectedStudents.length > 0 &&
            selectedStudents.length < students.length
          }
        />
      ),
      render: (row: StudentFeeData) => (
        <Checkbox
          checked={selectedStudents.includes(row.id)}
          onChange={() => handleSelectStudent(row.id)}
        />
      ),
    },
    {
      key: "sl",
      header: "SL",
      render: (_: StudentFeeData, index?: number) =>
        index !== undefined ? page * rowsPerPage + index + 1 : null,
    },
    { key: "name", 
      header: "Teacher Name",
      render: (row: StudentFeeData) => row?.name || "N/A", 
    },
    { key: "teacherUniqueId", 
      header: "Teacher ID",
      render: (row: StudentFeeData) => row?.teacherUniqueId || "N/A", 
    },
    { key: "designation",
      header: "Teacher Designation",
      render: (row: StudentFeeData) => row?.designation || "N/A", 
    },
    {
      key: "totalAdvance",
      header: "Total Advance",
      render: (row: StudentFeeData) => row?.totalAdvance || "0",
    },
    {
      key: "paid",
      header: "Paid",
      render: (row: StudentFeeData) => (row.totalPay as number).toLocaleString(),
    },
    {
      key: "totalDue",
      header: "Total Due",
      render: (row: StudentFeeData) => (row.totalUnpaid as number).toLocaleString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: StudentFeeData) => (
        <IconButton
          onClick={() => handleViewStudent(row.id)}
          color="primary"
          size="small"
          sx={{
            "&:hover": {
              backgroundColor: "rgba(3, 81, 64, 0.1)",
            },
          }}
        >
          <Visibility />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Unpaid Teacher Salary Report
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View and manage unpaid teacher salary for students
        </Typography>
      </Box>

       <Paper
        sx={{
          p: 3,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >

         <div className="flex gap-4">
          <SubmitButton
            onClick={handlePrint}
            disabled={selectedStudents.length === 0}
          >
            <span className="font-medium">Print</span>
          </SubmitButton>

          <CancelButton
            onClick={handlePDF}
            disabled={selectedStudents.length === 0}
          >
            <span className="font-medium">PDF</span>
          </CancelButton>
        </div>
      </Paper>

      {/* Results Section */}
      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load unpaid fee data
          </Alert>
        ) : students.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ p: 4, textAlign: "center" }}
          >
            No unpaid teacher salary found for the selected class
          </Typography>
        ) : (
          <>
            <ReusableTable<StudentFeeData>
              columns={columns}
              data={students.slice(
                page * rowsPerPage,
                (page + 1) * rowsPerPage
              )}
            />
            <PaginationComponent
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage - 1)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Selected Students Info */}
      {selectedStudents.length > 0 && (
        <Paper sx={{ p: 2, mt: 2, backgroundColor: "#e8f5e8" }}>
          <Typography variant="body2">
            {selectedStudents.length} student(s) selected
          </Typography>
        </Paper>
      )}

      {/* Modal for viewing single student fee details */}
      <ViewSingleUnpaidTeacherFeeReport
        open={modalOpen}
        onClose={handleCloseModal}
        studentId={selectedStudentId}
      />
    </Box>
  );
};

export default UnpaidTeacherFeeReport;