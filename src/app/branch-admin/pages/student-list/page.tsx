/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { TeacherFormValues } from "@/app/super-admin/schemas/teacherSchema";
import { useRouter } from "next/navigation";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { Visibility } from "@mui/icons-material";
import {
  useCreateStudentMutation,
  useDeleteStudentMutation,
  useGetAllStudentsQuery,
} from "@/app/store/api/student/studentApi";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import MuiSingleSelect from "@/components/ui/common/MuiSingleSelect";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { Plus, Edit, Trash2, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
// import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
// import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";

interface Teacher extends TeacherFormValues {
  id: number;
  status: "active" | "inactive";
  name: string;
  phone: string;
  email: string;
  classRoll: number;
  gender: "" | "Male" | "Female" | "Other";
  religion: "" | "Other" | "Islam" | "Hindu" | "Christian";
  dob: string;
  bloodGroup: string;
  address: string;
  fatherName: string | null;
  motherName: string | null;
  parentPhone: string | null;
  avatar: string;
  studentUniqueId: string;
  // Corrected field names based on API response
  session?: { 
    id: number;
    name: string;
  };
  class?: { 
    id: number;
    name: string;
  };
  section?: { 
    id: number;
    name: string;
  };
  stream?: { 
    id: number;
    name: string;
  };
  [key: string]: unknown;
}

interface StudentExcelData {
  SL: number;
  "STUDENT NAME": string;
  "PHONE NUMBER": string;
  PASSWORD: string;
  SESSION: string;
  CLASS: string;
  "CLASS ROLL": number;
  SECTION: string;
  STREAM: string;
  // Internal fields for submission
  sessionYearId?: number;
  classNameId?: number;
  sectionNameId?: number;
  streamNameId?: number;
}


const StudentList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const [filters, setFilters] = useState({
    sessionId: null,
    classId: null,
  });

  const [selectedSessionAndClass, setSelectedSessionAndClass] = useState({
    sessionId: null,
    classId: null,
  });

  const [isUploading, ] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [uploadedData, setUploadedData] = useState<StudentExcelData[]>([]);
  const [createStudent, { isLoading: createLoading }] =
    useCreateStudentMutation();

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllStudentsQuery({
    page: page + 1,
    size: rowsPerPage,
    search: searchTerm,
    sessionId: selectedSessionAndClass?.sessionId,
    classId: selectedSessionAndClass?.classId,
  });

  const {
    data: sessions,
    // isLoading: isSessionsLoading
  } = useGetAllSessionsQuery({});
  const {
    data: classes,
    // isLoading: isClassesLoading
  } = useGetAllClassQuery({});

    // const { data: sections } = useGetAllSectionsQuery({});
    // const { data: streams } = useGetAllStreamsQuery({});

  const {
    isDeleteModalOpen,
    itemToDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    handleDelete: handleDeleteConfirmation,
  } = useDeleteConfirmation();

  const students: Teacher[] = Array.isArray(responseData?.data)
    ? responseData.data
    : responseData?.data || [];

  // console.log(students)

  const [deleteStudent] = useDeleteStudentMutation();

  const totalPages = responseData?.meta?.totalPage || 1;

  const handleDeleteStudent = async () => {
    await handleDeleteConfirmation(
      async (studentId) => {
        await deleteStudent(studentId).unwrap();
        refetch();
      },
      {
        successMessage: "Student deleted successfully",
        errorMessage: "Failed to delete student",
      }
    );
  };
  const columns = [
    {
      key: "sl",
      header: "SL",
      render: (row: Teacher, index?: number) =>
        index !== undefined ? index + 1 : null,
    },
    {
      key: "studentUniqueId",
      header: "ID",
    },
    {
      key: "teacherAvatar",
      header: "Image",
      render: (row: Teacher) => (
        <Avatar
          src={row.avatar || "/default-avatar.png"}
          alt={row.name}
          sx={{ width: 40, height: 40 }}
        />
      ),
    },
    {
      key: "name",
      header: "Name",
    },
    {
      key: "phone",
      header: "Phone",
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Teacher) => (
        <div className="flex space-x-2 items-center">
          <Visibility
            className="cursor-pointer"
            onClick={() =>
              router.push(`/branch-admin/pages/student-list/${row.id}`)
            }
          />
          <IconButton>
            <Edit
              onClick={() =>
                router.push(
                  `/branch-admin/pages/student-list/edit-student/${row.id}`
                )
              }
              color="#035140"
              size={18}
            />
          </IconButton>
          <IconButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              openDeleteModal(row.id);
            }}
            disabled={isDeleting && itemToDelete === row.id}
            sx={{
              color: "#DC2626",
              p: 1,
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "rgba(220, 38, 38, 0.1)",
              },
            }}
          >
            {isDeleting && itemToDelete === row.id ? (
              <span>{buttonLoader}</span>
            ) : (
              <Trash2 size={18} />
            )}
          </IconButton>
        </div>
      ),
    },
  ];

 // Download Excel Template
// const downloadExcelTemplate = () => {
//   // Get the first available options for each dropdown to show as examples
//   const sampleSession = sessions?.data?.[0];
//   const sampleClass = classes?.data?.[0];
//   const sampleSection = sections?.data?.[0];
//   const sampleStream = streams?.data?.[0];

//   const templateData: StudentExcelData[] = [
//     {
//       SL: 1,
//       "STUDENT NAME": "John Doe",
//       "PHONE NUMBER": "0123456789",
//       PASSWORD: "password123",
//       SESSION: sampleSession?.name || "2024",
//       CLASS: sampleClass?.name || "Class 1",
//       "CLASS ROLL": 1,
//       SECTION: sampleSection?.name || "A",
//       STREAM: sampleStream?.name || "Science",
//     },
//   ];

//   const worksheet = XLSX.utils.json_to_sheet(templateData, {
//     skipHeader: false,
//   });

//   // Set column widths
//   worksheet["!cols"] = [
//     { wch: 5 }, // SL
//     { wch: 25 }, // STUDENT NAME
//     { wch: 15 }, // PHONE NUMBER
//     { wch: 15 }, // PASSWORD
//     { wch: 15 }, // SESSION
//     { wch: 15 }, // CLASS
//     { wch: 10 }, // CLASS ROLL
//     { wch: 10 }, // SECTION
//     { wch: 15 }, // STREAM
//   ];

//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, "StudentTemplate");

//   XLSX.writeFile(workbook, "Student_Template.xlsx", {
//     bookType: "xlsx",
//     type: "binary",
//     compression: true,
//   });
// };

// Handle Excel File Upload
// const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//   setIsUploading(true);
//   const file = e.target.files?.[0];
//   if (!file) {
//     setIsUploading(false);
//     return;
//   }

//   const reader = new FileReader();
//   reader.onload = async (loadEvent: ProgressEvent<FileReader>) => {
//     try {
//       if (!loadEvent.target || !loadEvent.target.result) {
//         throw new Error("File reading failed");
//       }

//       const data = loadEvent.target.result as ArrayBuffer;
//       const workbook = XLSX.read(data, { type: "array" });
//       const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData =
//         XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);

//       // Validate and process the data
//       const validationErrors: string[] = [];
//       const processedData: StudentExcelData[] = [];

//       for (const [index, row] of jsonData.entries()) {
//         const studentName = row["STUDENT NAME"]?.toString() || "";
//         const phoneNumber = row["PHONE NUMBER"]?.toString() || "";
//         const password = row["PASSWORD"]?.toString() || "";
//         const sessionName = row["SESSION"]?.toString() || "";
//         const className = row["CLASS"]?.toString() || "";
//         const classRoll = Number(row["CLASS ROLL"]) || 0;
//         const sectionName = row["SECTION"]?.toString() || "";
//         const streamName = row["STREAM"]?.toString() || "";

//         // Validate required fields
//         if (!studentName) {
//           validationErrors.push(`Row ${index + 1}: STUDENT NAME is required`);
//         }
//         if (!phoneNumber) {
//           validationErrors.push(`Row ${index + 1}: PHONE NUMBER is required`);
//         }
//         if (!password) {
//           validationErrors.push(`Row ${index + 1}: PASSWORD is required`);
//         }

//         // Find IDs from names
//         const session = sessions?.data?.find((s: any) => 
//           s.name?.toString().toLowerCase() === sessionName.toLowerCase()
//         );
//         const classItem = classes?.data?.find((c: any) => 
//           c.name?.toString().toLowerCase() === className.toLowerCase()
//         );
//         const section = sections?.data?.find((s: any) => 
//           s.name?.toString().toLowerCase() === sectionName.toLowerCase()
//         );
//         const stream = streams?.data?.find((s: any) => 
//           s.name?.toString().toLowerCase() === streamName.toLowerCase()
//         );

//         // Validate reference fields
//         if (!session && sessionName) {
//           validationErrors.push(`Row ${index + 1}: SESSION "${sessionName}" not found`);
//         }
//         if (!classItem && className) {
//           validationErrors.push(`Row ${index + 1}: CLASS "${className}" not found`);
//         }
//         if (!section && sectionName) {
//           validationErrors.push(`Row ${index + 1}: SECTION "${sectionName}" not found`);
//         }
//         if (!stream && streamName) {
//           validationErrors.push(`Row ${index + 1}: STREAM "${streamName}" not found`);
//         }

//         processedData.push({
//           SL: index + 1,
//           "STUDENT NAME": studentName,
//           "PHONE NUMBER": phoneNumber,
//           PASSWORD: password,
//           SESSION: sessionName,
//           CLASS: className,
//           "CLASS ROLL": classRoll,
//           SECTION: sectionName,
//           STREAM: streamName,
//           // Store the found IDs for submission
//           sessionYearId: session?.id || 0,
//           classNameId: classItem?.id || 0,
//           sectionNameId: section?.id || 0,
//           streamNameId: stream?.id || 0,
//         });
//       }

//       // If there are validation errors, show them and stop
//       if (validationErrors.length > 0) {
//         validationErrors.forEach(error => {
//           toastShowing(
//             error,
//             "bottom-right",
//             3000,
//             "red",
//             "white"
//           );
//         });
//         throw new Error("Validation failed");
//       }

//       setUploadedData(processedData);
//       setShowUploadSection(true);

//       toastShowing(
//         "Excel file uploaded successfully! Please review and submit.",
//         "bottom-right",
//         2000,
//         "green",
//         "white"
//       );
//     } catch (error) {
//       console.error("Error parsing Excel file:", error);
//       if (!error.message.includes("Validation failed")) {
//         toastShowing(
//           "Error parsing Excel file. Please check the format.",
//           "bottom-right",
//           2000,
//           "red",
//           "white"
//         );
//       }
//     } finally {
//       setIsUploading(false);
//       // Reset the file input
//       if (e.target) {
//         e.target.value = "";
//       }
//     }
//   };
//   reader.readAsArrayBuffer(file);
// };

// Submit Uploaded Data
const submitUploadedData = async () => {
  if (uploadedData.length === 0) {
    toastShowing("No data to submit", "bottom-right", 2000, "red", "white");
    return;
  }

  try {
    // Validate all data before submission
    const validationErrors: string[] = [];
    
    uploadedData.forEach((row, index) => {
      if (!row.sessionYearId || !row.classNameId || !row.sectionNameId || !row.streamNameId) {
        validationErrors.push(`Row ${index + 1}: Missing valid reference IDs`);
      }
    });

    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        toastShowing(
          error,
          "bottom-right",
          3000,
          "red",
          "white"
        );
      });
      return;
    }

    const studentsPayload = uploadedData.map((row) => ({
      name: row["STUDENT NAME"],
      phone: row["PHONE NUMBER"],
      email: "",
      password: row["PASSWORD"],
      sessionYearId: row.sessionYearId,
      classNameId: row.classNameId,
      classRoll: row["CLASS ROLL"],
      sectionNameId: row.sectionNameId,
      streamNameId: row.streamNameId,
      gender: "",
      religion: "",
      dob: "",
      bloodGroup: "",
      address: "",
      fatherName: "",
      motherName: "",
      parentPhone: "",
      avatar: "",
      subjects: [],
    }));

    await createStudent(studentsPayload).unwrap();

    toastShowing(
      `${uploadedData.length} students created successfully!`,
      "bottom-right",
      2000,
      "green",
      "white"
    );

    setShowUploadSection(false);
    setUploadedData([]);
    refetch();
  } catch (error) {
    console.error("Failed to create students:", error);
    toastShowing(
      "Failed to create students. Please try again.",
      "bottom-right",
      2000,
      "red",
      "white"
    );
  }
};



  // Cancel Upload
  const cancelUpload = () => {
    setShowUploadSection(false);
    setUploadedData([]);
  };

  // Export Excel with table data
const exportExcel = () => {
  if (!students || students.length === 0) {
    toastShowing(
      "No student data available to export",
      "bottom-right",
      2000,
      "red",
      "white"
    );
    return;
  }

  try {
    // Map the student data to the export format with correct field mappings
    const exportData = students.map((student, index) => ({
      SL: index + 1,
      "STUDENT NAME": student.name || "",
      "PHONE NUMBER": student.phone || "",
      EMAIL: student.email || "",
      PASSWORD: "", // Password is not stored in response for security
      SESSION: student.session?.name || "", // Changed from sessionYear to session
      CLASS: student.class?.name || "", // Changed from className to class
      "CLASS ROLL": student.classRoll || 0,
      SECTION: student.section?.name || "", // Changed from sectionName to section
      STREAM: student.stream?.name || "", // Changed from streamName to stream
      GENDER: student.gender || "",
      RELIGION: student.religion || "",
      "DATE OF BIRTH": student.dob || "",
      "BLOOD GROUP": student.bloodGroup || "",
      ADDRESS: student.address || "",
      "FATHER NAME": student.fatherName || "",
      "MOTHER NAME": student.motherName || "",
      "PARENT PHONE": student.parentPhone || "",
      "AVATAR URL": student.avatar || "/default-avatar.png",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData, {
      skipHeader: false,
    });

    // Set column widths for better readability
    worksheet["!cols"] = [
      { wch: 5 }, // SL
      { wch: 25 }, // STUDENT NAME
      { wch: 15 }, // PHONE NUMBER
      { wch: 25 }, // EMAIL
      { wch: 15 }, // PASSWORD
      { wch: 15 }, // SESSION
      { wch: 15 }, // CLASS
      { wch: 10 }, // CLASS ROLL
      { wch: 10 }, // SECTION
      { wch: 15 }, // STREAM
      { wch: 10 }, // GENDER
      { wch: 10 }, // RELIGION
      { wch: 12 }, // DATE OF BIRTH
      { wch: 10 }, // BLOOD GROUP
      { wch: 30 }, // ADDRESS
      { wch: 20 }, // FATHER NAME
      { wch: 20 }, // MOTHER NAME
      { wch: 15 }, // PARENT PHONE
      { wch: 30 }, // AVATAR URL
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "StudentsData");

    // Generate filename with current date
    const date = new Date();
    const dateString = date.toISOString().split('T')[0];
    const fileName = `Students_Data_${dateString}.xlsx`;

    XLSX.writeFile(workbook, fileName, {
      bookType: "xlsx",
      type: "binary",
      compression: true,
    });

    toastShowing(
      `Exported ${students.length} student records successfully!`,
      "bottom-right",
      2000,
      "green",
      "white"
    );
  } catch (error) {
    console.error("Error exporting Excel file:", error);
    toastShowing(
      "Failed to export Excel file. Please try again.",
      "bottom-right",
      2000,
      "red",
      "white"
    );
  }
};

  return (
    <Box>
      <PageHeader
        title="Students Management"
        buttonText="Add Student"
        buttonIcon={<Plus size={20} />}
        onButtonClick={() =>
          router.push("/branch-admin/pages/create-new-student")
        }
      />

      {isUploading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Processing Excel file...
          </Typography>
        </Box>
      )}

      <Box sx={{ mb: 2 }}>
        <div className="flex justify-between">
          <SearchingInputField
            placeholder="Search students..."
            onSearch={(term) => {
              setSearchTerm(term);
              setPage(0);
            }}
            debounceTime={300}
            maxWidth={400}
            height="36px"
          />



          <div className="flex gap-4 w-full max-w-[800px]">
            <FormControl fullWidth size="small">
              <InputLabel>Session Year</InputLabel>
              <Select
                name="sessionYear"
                value={filters?.sessionId}
                onChange={(newValue) =>
                  setFilters((prev) => ({
                    ...prev,
                    sessionId: newValue?.target?.value,
                  }))
                }
                label="Session Year"
              >
                {sessions?.data?.map((session) => (
                  <MenuItem key={session.id} value={session?.id}>
                    {session.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* select class */}
            <FormControl fullWidth size="small">
              <MuiSingleSelect
                options={classes?.data?.map((teacher) => ({
                  id: teacher?.id,
                  label: teacher?.name,
                }))}
                label="Select Class"
                placeholder="Pick one"
                selectedId={2}
                onChange={(id) =>
                  setFilters((prev) => ({ ...prev, classId: id }))
                }
                width={"100%"}
                size="small"
                textSize="14px"
              />
            </FormControl>
            <div className="">
              <Button
                variant="contained"
                onClick={() => setSelectedSessionAndClass(filters)}
                className="max-h-fit w-fit"
                sx={{
                  backgroundColor: "#035140",
                  "&:hover": {
                    backgroundColor: "#024030",
                  },
                }}
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </Box>

                <div className="flex gap-2 justify-end mb-4">
            <Button
              variant="contained"
              startIcon={<Download size={20} />}
              onClick={exportExcel}
              sx={{
                backgroundColor: "#035140",
                "&:hover": {
                  backgroundColor: "#024030",
                },
                minWidth: "fit-content",
                height: "36px",
                marginTop: "8px",
              }}
            >
              EXPORT EXCEL
            </Button>

            {/* <Button
              variant="contained"
              startIcon={<Download size={20} />}
              onClick={downloadExcelTemplate}
              sx={{
                backgroundColor: "#035140",
                "&:hover": {
                  backgroundColor: "#024030",
                },
                minWidth: "fit-content",
                height: "36px",
                marginTop: "8px",
              }}
            >
              Download EXCEL
            </Button>

            <Button
              variant="outlined"
              startIcon={<Upload size={20} />}
              component="label"
              sx={{
                borderColor: "#035140",
                color: "#035140",
                "&:hover": {
                  borderColor: "#024030",
                  backgroundColor: "rgba(3, 81, 64, 0.04)",
                },
                minWidth: "fit-content",
                height: "36px",
                marginTop: "8px",
              }}
            >
              Upload Excel
              <input
                type="file"
                hidden
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
              />
            </Button> */}
          </div>

          {/* Upload Section */}
          {showUploadSection && (
            <Paper sx={{ p: 3, mb: 2, backgroundColor: "#f8f9fa" }}>
              <Typography variant="h6" gutterBottom>
                Uploaded Teacher Data ({uploadedData.length} records)
              </Typography>

              <Box sx={{ maxHeight: 300, overflow: "auto", mb: 2 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
  <thead>
    <tr style={{ backgroundColor: "#035140", color: "white" }}>
      <th
        style={{
          padding: "8px",
          border: "1px solid #ddd",
          textAlign: "left",
        }}
      >
        SL
      </th>
      <th
        style={{
          padding: "8px",
          border: "1px solid #ddd",
          textAlign: "left",
        }}
      >
        Student Name
      </th>
      <th
        style={{
          padding: "8px",
          border: "1px solid #ddd",
          textAlign: "left",
        }}
      >
        Phone
      </th>
      <th
        style={{
          padding: "8px",
          border: "1px solid #ddd",
          textAlign: "left",
        }}
      >
        Session
      </th>
      <th
        style={{
          padding: "8px",
          border: "1px solid #ddd",
          textAlign: "left",
        }}
      >
        Class
      </th>
      <th
        style={{
          padding: "8px",
          border: "1px solid #ddd",
          textAlign: "left",
        }}
      >
        Class Roll
      </th>
      <th
        style={{
          padding: "8px",
          border: "1px solid #ddd",
          textAlign: "left",
        }}
      >
        Section
      </th>
      <th
        style={{
          padding: "8px",
          border: "1px solid #ddd",
          textAlign: "left",
        }}
      >
        Stream
      </th>
    </tr>
  </thead>
  <tbody>
    {uploadedData.map((row, index) => (
      <tr key={index}>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>
          {row.SL}
        </td>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>
          {row["STUDENT NAME"]}
        </td>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>
          {row["PHONE NUMBER"]}
        </td>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>
          {row.SESSION}
        </td>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>
          {row.CLASS}
        </td>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>
          {row["CLASS ROLL"]}
        </td>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>
          {row.SECTION}
        </td>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>
          {row.STREAM}
        </td>
      </tr>
    ))}
  </tbody>
</table>
              </Box>

              <div className="flex gap-2">
                <Button
                  variant="contained"
                  onClick={submitUploadedData}
                  disabled={createLoading || uploadedData.length === 0}
                  sx={{
                    backgroundColor: "#035140",
                    "&:hover": {
                      backgroundColor: "#024030",
                    },
                  }}
                >
                  {createLoading
                    ? "Submitting..."
                    : `Submit ${uploadedData.length} Teachers`}
                </Button>

                <Button
                  variant="outlined"
                  onClick={cancelUpload}
                  sx={{
                    borderColor: "#DC2626",
                    color: "#DC2626",
                    "&:hover": {
                      borderColor: "#B91C1C",
                      backgroundColor: "rgba(220, 38, 38, 0.04)",
                    },
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Paper>
          )}

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load students
          </Alert>
        ) : students.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No students found.{" "}
            {searchTerm
              ? "Try a different search term."
              : "Create your first student."}
          </Typography>
        ) : (
          <>
            <ReusableTable<Teacher> columns={columns} data={students} />
            <PaginationComponent
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage - 1)} // Convert back to 0-based index
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </>
        )}
      </Paper>

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteStudent()}
        title="Delete Student"
        description="Are you sure you want to delete this student? All associated data will be permanently removed."
        isLoading={isDeleting}
      />
    </Box>
  );
};

export default StudentList;
