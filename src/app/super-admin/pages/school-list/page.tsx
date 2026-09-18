"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { Edit, Trash2 } from "lucide-react";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import {
  useDeleteSchoolMutation,
  useGetAllSchoolsQuery,
  useUpdateSchoolMutation,
} from "@/app/store/api/createSchool/createSchoolApi";

interface School {
  id: number;
  superAdminId: number;
  name: string;
  email: string;
  password: string;
  branchPermission: number;
  count: number;
  blockDate: string | null;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface SchoolData {
  name: string;
  email: string;
  password?: string;
  branchPermission: number;
}

interface ApiError {
  data?: {
    message?: string;
  };
  message?: string;
}

const SchoolList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState<SchoolData>({
    name: "",
    email: "",
    password: "",
    branchPermission: 0,
  });

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllSchoolsQuery({
    page: page + 1,
    size: rowsPerPage,
    search: searchTerm,
  });

  const schools: School[] = Array.isArray(responseData?.data)
    ? responseData.data
    : responseData?.data || [];

  const [updateSchool, { isLoading: updateLoading }] =
    useUpdateSchoolMutation();
  const [deleteSchool] = useDeleteSchoolMutation();

  // Delete confirmation hooks
  const {
    isDeleteModalOpen,
    itemToDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    handleDelete: handleDeleteConfirmation,
  } = useDeleteConfirmation();

  const handleOpenEditModal = (school: School) => {
    setCurrentSchool(school);
    setFormData({
      name: school.name,
      email: school.email,
      password: "", // Don't pre-fill password for security
      branchPermission: school.branchPermission,
    });
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setCurrentSchool(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      branchPermission: 0,
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? 0 : parseInt(value, 10),
    }));
  };

  const handleUpdateSchool = async () => {
    if (!currentSchool) return;

    try {
      // Prepare update data - only include password if it was changed
      const updateData: Partial<SchoolData> = {
        name: formData.name,
        email: formData.email,
        branchPermission: formData.branchPermission,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateSchool({ id: currentSchool.id, ...updateData }).unwrap();
      toastShowing(
        "School updated successfully",
        "bottom-right",
        2000,
        "green",
        "white"
      );
      handleCloseEditModal();
      refetch();
    } catch (err) {
      const error = err as ApiError;
      const errorMessage =
        error?.data?.message || error?.message || "Failed to update school";
      toastShowing(errorMessage, "bottom-right", 2000, "red", "white");
    }
  };

  const handleDeleteSchool = async () => {
    await handleDeleteConfirmation(
      async (schoolId) => {
        await deleteSchool(schoolId).unwrap();
        refetch();
      },
      {
        successMessage: "School deleted successfully",
        errorMessage: "Failed to delete school",
      }
    );
  };

  const columns = [
    {
      key: "name",
      header: "Name",
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "branchPermission",
      header: "Branch Permission",
      render: (row: School) => row.branchPermission,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: School) => (
        <div className="flex space-x-2 items-center">
          <IconButton onClick={() => handleOpenEditModal(row)}>
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

  const totalPages = responseData?.meta?.totalPage || 1;

  return (
    <Box>
      <Box sx={{ mb: 2, pt: 10 }}>
        <Typography component="h1" variant="h3" sx={{ mb: 2 }}>
          School List
        </Typography>
        <SearchingInputField
          placeholder="Search school by name or email..."
          onSearch={(term) => {
            setSearchTerm(term);
            setPage(0);
          }}
          debounceTime={300}
          maxWidth={400}
          height="36px"
        />
      </Box>

      {/* Edit Modal */}
      <Dialog
        open={editModalOpen}
        onClose={handleCloseEditModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit School</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="School Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              variant="outlined"
              type="email"
            />
            <TextField
              fullWidth
              label="New Password (leave blank to keep current)"
              name="password"
              value={formData.password}
              onChange={handleFormChange}
              variant="outlined"
              type="password"
            />
            <TextField
              fullWidth
              label="Branch Permission"
              name="branchPermission"
              value={formData.branchPermission}
              onChange={handleNumberInput}
              variant="outlined"
              type="number"
              inputProps={{ min: 0 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleUpdateSchool}
            color="primary"
            variant="contained"
            disabled={updateLoading}
          >
            {updateLoading ? <CircularProgress size={24} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load schools
          </Alert>
        ) : schools.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No schools found. {searchTerm ? "Try a different search term." : ""}
          </Typography>
        ) : (
          <>
            <ReusableTable<School> columns={columns} data={schools} />
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
        onConfirm={() => handleDeleteSchool()}
        title="Delete School"
        description="Are you sure you want to delete this school? This action cannot be undone."
        isLoading={isDeleting}
      />
    </Box>
  );
};

export default SchoolList;
