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
} from "@mui/material";
import { Edit, Trash2 } from "lucide-react";
import {
  TeacherFormValues,
} from "@/app/super-admin/schemas/teacherSchema";
import { useRouter } from "next/navigation";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { Visibility } from "@mui/icons-material";
import {
  useDeleteStudentMutation,
  useGetTopStudentsAllQuery,
} from "@/app/store/api/student/studentApi";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";

interface Teacher extends TeacherFormValues {
  id: number;
  status: "active" | "inactive";
  [key: string]: unknown;
}

const TopStudentList = () => {

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetTopStudentsAllQuery({
    page: page + 1,
    size: rowsPerPage,
    search: searchTerm,
  });

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

    console.log(students)

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
            render: (row: Teacher, index?: number) => (index !== undefined ? index + 1 : null),
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
          <IconButton >
            <Edit onClick={() =>
              router.push(`/branch-admin/pages/student-list/edit-student/${row.id}`)
            } color="#035140" size={18} />
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
      <PageHeader
        title="Top Students"
      />

      <Box sx={{ mb: 2 }}>
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
      </Box>



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

export default TopStudentList;