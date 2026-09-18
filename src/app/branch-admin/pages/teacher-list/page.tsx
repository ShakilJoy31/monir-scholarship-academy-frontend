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
  Button,
} from "@mui/material";
import { Plus, Edit, Trash2, Download } from "lucide-react";
import {
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useGetAllTeachersQuery,
} from "@/app/store/api/teacher/teacherApi";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import {
  TeacherFormValues,
  TeacherSchema,
} from "@/app/super-admin/schemas/teacherSchema";
import AddEditBranch from "@/components/pageComponents/super-admin-components/AddEditBranch";
import { useRouter } from "next/navigation";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { Visibility } from "@mui/icons-material";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import * as XLSX from "xlsx";

interface Teacher extends TeacherFormValues {
  id: number;
  status: "active" | "inactive";
  [key: string]: unknown;
}

interface TeacherExcelData {
  SL: number;
  "TEACHER NAME": string;
  "PHONE NUMBER": string;
  EMAIL: string;
  PASSWORD: string;
  DESIGNATION: string;
}

const TeacherList = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [currentTeacher, setCurrentTeacher] = useState<{
    id: number | null;
    data: TeacherFormValues;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, ] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [uploadedData, setUploadedData] = useState<TeacherExcelData[]>([]);
  const router = useRouter();

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllTeachersQuery({
    page: page + 1,
    size: rowsPerPage,
    search: searchTerm,
  });

  const teachers: Teacher[] = Array.isArray(responseData?.data)
    ? responseData.data
    : responseData?.data || [];

  const [createTeacher, { isLoading: createLoading }] =
    useCreateTeacherMutation();
  const [updateTeacher, { isLoading: updateLoading }] =
    useUpdateTeacherMutation();
  const [deleteTeacher] = useDeleteTeacherMutation();

  const totalPages = responseData?.meta?.totalPage || 1;

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentTeacher(null);
    setError(null);
  };

  const handleSubmit = async (data: TeacherFormValues) => {
    try {
      if (currentTeacher?.id) {
        await updateTeacher({ id: currentTeacher.id, ...data }).unwrap();
        toastShowing(
          "Teacher has been updated successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      } else {
        await createTeacher(data).unwrap();
        toastShowing(
          "New teacher has been created successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      console.log(err);
      toastShowing(
        (err as { data?: { message?: string } })?.data?.message ||
          (err as Error).message ||
          "Unknown error",
        "bottom-right",
        2000,
        "red",
        "white"
      );

      setError(
        (err as { data?: { message?: string } })?.data?.message ||
          (err as Error).message ||
          "Unknown error"
      );
      console.error("Error saving teacher:", err);
    }
  };

  // New delete hooks.............
  const {
    isDeleteModalOpen,
    itemToDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    handleDelete: handleDeleteConfirmation,
  } = useDeleteConfirmation();

  const handleDeleteTeacher = async () => {
    await handleDeleteConfirmation(
      async (teacherId) => {
        await deleteTeacher(teacherId).unwrap();
        refetch();
      },
      {
        successMessage: "Teacher deleted successfully",
        errorMessage: "Failed to delete teacher",
      }
    );
  };

  // Download Excel Template
  // const downloadExcelTemplate = () => {
  //   const templateData: TeacherExcelData[] = [
  //     {
  //       SL: 1,
  //       "TEACHER NAME": "",
  //       "PHONE NUMBER": "",
  //       EMAIL: "",
  //       PASSWORD: "",
  //       DESIGNATION: "",
  //     },
  //   ];

  //   const worksheet = XLSX.utils.json_to_sheet(templateData, {
  //     skipHeader: false,
  //   });

  //   // Set column widths
  //   worksheet["!cols"] = [
  //     { wch: 5 }, // SL
  //     { wch: 25 }, // TEACHER NAME
  //     { wch: 15 }, // PHONE NUMBER
  //     { wch: 30 }, // EMAIL
  //     { wch: 15 }, // PASSWORD
  //     { wch: 20 }, // DESIGNATION
  //   ];

  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "TeacherTemplate");

  //   XLSX.writeFile(workbook, "Teacher_Template.xlsx", {
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

  //       const processedData: TeacherExcelData[] = jsonData.map((row, index) => {
  //         return {
  //           SL: index + 1,
  //           "TEACHER NAME": row["TEACHER NAME"]?.toString() || "",
  //           "PHONE NUMBER": row["PHONE NUMBER"]?.toString() || "",
  //           EMAIL: row["EMAIL"]?.toString() || "",
  //           PASSWORD: row["PASSWORD"]?.toString() || "",
  //           DESIGNATION: row["DESIGNATION"]?.toString() || "",
  //         };
  //       });

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
  //       toastShowing(
  //         "Error parsing Excel file. Please check the format.",
  //         "bottom-right",
  //         2000,
  //         "red",
  //         "white"
  //       );
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
      toastShowing(
        "No data to submit",
        "bottom-right",
        2000,
        "red",
        "white"
      );
      return;
    }

    try {
      const teachersPayload = uploadedData.map((row) => ({
        name: row["TEACHER NAME"],
        phone: row["PHONE NUMBER"],
        email: row["EMAIL"],
        password: row["PASSWORD"],
        designation: row["DESIGNATION"],
        // Add default values for required fields
        nid: "",
        gender: "",
        religion: "",
        dob: "",
        bloodGroup: "",
        address: "",
        universityName: "",
        qualification: "",
        specialistSubject: "",
        universityStartDate: "",
        universityEndDate: "",
      }));

      await createTeacher(teachersPayload).unwrap();
      
      toastShowing(
        `${uploadedData.length} teachers created successfully!`,
        "bottom-right",
        2000,
        "green",
        "white"
      );
      
      setShowUploadSection(false);
      setUploadedData([]);
      refetch();
      
    } catch (error) {
      console.error("Failed to create teachers:", error);
      toastShowing(
        "Failed to create teachers. Please try again.",
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
  if (!teachers || teachers.length === 0) {
    toastShowing(
      "No teacher data available to export",
      "bottom-right",
      2000,
      "red",
      "white"
    );
    return;
  }

  try {
    // Map the teacher data to the export format
    const exportData = teachers.map((teacher, index) => ({
      SL: index + 1,
      "TEACHER NAME": teacher.name || "",
      "PHONE NUMBER": teacher.phone || "",
      EMAIL: teacher.email || "",
      PASSWORD: "", // Password is not stored in response for security
      DESIGNATION: teacher.designation || "",
      NID: teacher.nid || "",
      GENDER: teacher.gender || "",
      RELIGION: teacher.religion || "",
      "DATE OF BIRTH": teacher.dob || "",
      "BLOOD GROUP": teacher.bloodGroup || "",
      ADDRESS: teacher.address || "",
      "UNIVERSITY NAME": teacher.universityName || "",
      QUALIFICATION: teacher.qualification || "",
      "SPECIALIST SUBJECT": teacher.specialistSubject || "",
      "UNIVERSITY START DATE": teacher.universityStartDate || "",
      "UNIVERSITY END DATE": teacher.universityEndDate || "",
      "AVATAR URL": teacher.avatar || "/default-avatar.png",
      "TEACHER ID": teacher.teacherUniqueId || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData, {
      skipHeader: false,
    });

    // Set column widths for better readability
    worksheet["!cols"] = [
      { wch: 5 }, // SL
      { wch: 25 }, // TEACHER NAME
      { wch: 15 }, // PHONE NUMBER
      { wch: 25 }, // EMAIL
      { wch: 15 }, // PASSWORD
      { wch: 20 }, // DESIGNATION
      { wch: 15 }, // NID
      { wch: 10 }, // GENDER
      { wch: 10 }, // RELIGION
      { wch: 12 }, // DATE OF BIRTH
      { wch: 10 }, // BLOOD GROUP
      { wch: 30 }, // ADDRESS
      { wch: 25 }, // UNIVERSITY NAME
      { wch: 15 }, // QUALIFICATION
      { wch: 20 }, // SPECIALIST SUBJECT
      { wch: 15 }, // UNIVERSITY START DATE
      { wch: 15 }, // UNIVERSITY END DATE
      { wch: 30 }, // AVATAR URL
      { wch: 15 }, // TEACHER ID
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TeachersData");

    // Generate filename with current date
    const date = new Date();
    const dateString = date.toISOString().split('T')[0];
    const fileName = `Teachers_Data_${dateString}.xlsx`;

    XLSX.writeFile(workbook, fileName, {
      bookType: "xlsx",
      type: "binary",
      compression: true,
    });

    toastShowing(
      `Exported ${teachers.length} teacher records successfully!`,
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

  const columns = [
    {
      key: "sl",
      header: "SL",
      render: (row: Teacher, index?: number) =>
        index !== undefined ? index + 1 : null,
    },
    {
      key: "teacherUniqueId",
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
      key: "specialistSubject",
      header: "Subject",
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
              router.push(`/branch-admin/pages/teacher-list/${row.id}`)
            }
          />

          <IconButton
            onClick={() =>
              router.push(
                `/branch-admin/pages/teacher-list/edit-teacher/${row.id}`
              )
            }
          >
            <Edit color="#035140" size={18} />
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

  return (
    <Box>
      <div className="flex w-full gap-2 items-center">
        <PageHeader
          title="Teachers Management"
          buttonText="Add Teacher"
          buttonIcon={<Plus size={20} />}
          onButtonClick={() =>
            router.push("/branch-admin/pages/create-new-teacher")
          }
        />

       
      </div>



      {isUploading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Processing Excel file...
          </Typography>
        </Box>
      )}

      <Box sx={{ mb: 2 }}>
        <SearchingInputField
          placeholder="Search teacher by name..."
          onSearch={(term) => {
            setSearchTerm(term);
            setPage(0);
          }}
          debounceTime={300}
          maxWidth={400}
          height="36px"
        />
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
                  <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>SL</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Teacher Name</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Phone</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Email</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Designation</th>
                </tr>
              </thead>
              <tbody>
                {uploadedData.map((row, index) => (
                  <tr key={index}>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.SL}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row["TEACHER NAME"]}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row["PHONE NUMBER"]}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.EMAIL}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.DESIGNATION}</td>
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
              {createLoading ? "Submitting..." : `Submit ${uploadedData.length} Teachers`}
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

      <AddEditBranch
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentTeacher}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={currentTeacher?.id ? "Edit Teacher" : "Create New Teacher"}
        schema={TeacherSchema}
        defaultValues={{
          name: "",
          phone: "",
          email: "",
          password: "",
          nid: "",
          gender: "",
          religion: "",
          dob: "",
          bloodGroup: "",
          address: "",
          universityName: "",
          qualification: "",
          specialistSubject: "",
          universityStartDate: "",
          universityEndDate: "",
        }}
        formFields={[
          { name: "name", label: "Full Name", gridWidth: 6 },
          { name: "phone", label: "Phone Number", gridWidth: 6 },
          { name: "email", label: "Email", type: "email", gridWidth: 6 },
          {
            name: "password",
            label: "Password",
            type: "password",
            gridWidth: 6,
          },
          { name: "nid", label: "NID Number", gridWidth: 6 },
          {
            name: "gender",
            label: "Gender",
            gridWidth: 6,
            select: true,
            options: ["Male", "Female", "Other"],
          },
          {
            name: "religion",
            label: "Religion",
            gridWidth: 6,
            select: true,
            options: ["Islam", "Hindu", "Christian", "Other"],
          },
          { name: "dob", label: "Date of Birth", type: "date", gridWidth: 6 },
          { name: "bloodGroup", label: "Blood Group", gridWidth: 6 },
          {
            name: "address",
            label: "Address",
            multiline: true,
            rows: 3,
            gridWidth: 12,
          },
          { name: "universityName", label: "University Name", gridWidth: 6 },
          { name: "qualification", label: "Qualification", gridWidth: 6 },
          {
            name: "specialistSubject",
            label: "Specialist Subject",
            gridWidth: 6,
          },
          {
            name: "universityStartDate",
            label: "University Start Date",
            type: "date",
            gridWidth: 6,
          },
          {
            name: "universityEndDate",
            label: "University End Date",
            type: "date",
            gridWidth: 6,
          },
        ]}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load teachers
          </Alert>
        ) : teachers.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No teachers found.{" "}
            {searchTerm
              ? "Try a different search term."
              : "Create your first teacher."}
          </Typography>
        ) : (
          <>
            <ReusableTable<Teacher> columns={columns} data={teachers} />
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

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteTeacher()}
        title="Delete Teacher"
        description="Are you sure you want to delete this teacher? All associated data will be permanently removed."
        isLoading={isDeleting}
      />
    </Box>
  );
};

export default TeacherList;