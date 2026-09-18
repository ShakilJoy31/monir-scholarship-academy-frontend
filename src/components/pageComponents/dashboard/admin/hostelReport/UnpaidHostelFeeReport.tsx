/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Button,
  Checkbox,
  IconButton,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { useGetUnpaidHostelFeeQuery } from "@/app/store/api/allReport/allReportApi";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import ViewSingleUnpaidHostelFeeReport from "./ViewSingleUnpaidHostelFeeReport";
import { useGetAllHostelsQuery } from "@/app/store/api/classes/hostelApi";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { usePrint } from "@/components/pageComponents/PrintPDFComponent/PrintComponent";
import { usePDF } from "@/components/pageComponents/PrintPDFComponent/PDFComponent";

interface StudentFeeData {
  [key: string]: unknown;
  id: number;
  name: string;
  studentUniqueId: string;
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
}


const UnpaidHostelFeeReport = () => {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [searchTriggered, setSearchTriggered] = useState(false);
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
    refetch,
  } = useGetUnpaidHostelFeeQuery(selectedClassId, {
    skip: !searchTriggered || !selectedClassId,
  });

  const { data: classesResponse } = useGetAllHostelsQuery({});

  const classes = Array.isArray(classesResponse?.data)
    ? classesResponse.data
    : classesResponse?.data || [];

  const students: StudentFeeData[] = Array.isArray(unpaidFeeResponse?.data)
    ? unpaidFeeResponse.data
    : unpaidFeeResponse?.data || [];

  // Calculate total pages
  const totalPages = Math.ceil(students.length / rowsPerPage);

  // When class changes, reset everything
  const handleClassChange = (event: any) => {
    const classId = event.target.value;
    setSelectedClassId(classId);
    setSearchTriggered(false);
    setSelectedStudents([]);
    setSelectAll(false);
    setPage(0);
  };

  // Trigger search manually
  const handleSearch = () => {
    if (selectedClassId) {
      setSearchTriggered(true);
      refetch();
    }
  };

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
  
      printData(selectedData, printColumns, "Unpaid Hostel Fee Report");
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
        "Unpaid Hostel Fee Report",
        "unpaid_hostel_fee_report"
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
    { key: "name", header: "Student Name" },
    { key: "studentUniqueId", header: "Student ID" },
    { key: "classRoll", header: "Student Roll" },
    {
      key: "className",
      header: "Class Name",
      render: (row: StudentFeeData) => row.class?.name || "N/A",
    },
    {
      key: "sectionName",
      header: "Section Name",
      render: (row: StudentFeeData) => row.section?.name || "N/A",
    },
    {
      key: "totalFee",
      header: "Total Fee",
      render: (row: StudentFeeData) =>
        ((row.totalUnpaid as number) + (row.totalDiscount as number)).toLocaleString(),
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
          Unpaid Hostel Fee Report
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View and manage unpaid hostel fees for students
        </Typography>
      </Box>

      {/* Filter Section */}
      <Paper sx={{ p: 3, mb: 3, display: "flex",
          justifyContent: "space-between",
          alignItems: "center", }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Select Hostel</InputLabel>
            <Select
              value={selectedClassId || ""}
              onChange={handleClassChange}
              label="Select Hostel"
            >
              {classes.map((classItem) => (
                <MenuItem key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={!selectedClassId}
            sx={{
              backgroundColor: "#035140",
              "&:hover": { backgroundColor: "#024030" },
              "&:disabled": { backgroundColor: "#cccccc" },
            }}
          >
            Search
          </Button>
        </Box>

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
        ) : !searchTriggered ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ p: 4, textAlign: "center" }}
          >
            Please select a class and click Search to view unpaid fees
          </Typography>
        ) : students.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ p: 4, textAlign: "center" }}
          >
            No unpaid fees found for the selected class
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
      <ViewSingleUnpaidHostelFeeReport
        open={modalOpen}
        onClose={handleCloseModal}
        studentId={selectedStudentId}
      />
    </Box>
  );
};

export default UnpaidHostelFeeReport;