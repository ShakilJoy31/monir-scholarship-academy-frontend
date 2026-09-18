"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  Modal,
  Checkbox,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import {
  useCreateSchoolMutation,
  useDeleteSchoolMutation,
  useGetAllSchoolsQuery,
  useUpdateSchoolMutation,
} from "@/app/store/api/createSchool/createSchoolApi";
import { motion, AnimatePresence } from "framer-motion";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { School as SchoolIcon } from "@mui/icons-material";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useRouter } from "next/navigation";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface School {
  id: number;
  name: string;
  email: string;
  password: string;
  branchPermission: number;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

const CreatedSchoolList = () => {
  const router = useRouter()
  const [addSchoolModalOpen, setAddSchoolModalOpen] = useState<boolean>(false);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [branchPermission, setBranchPermission] = useState(1);

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

  const {
    isDeleteModalOpen,
    itemToDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    handleDelete: handleDeleteConfirmation,
  } = useDeleteConfirmation();

  const [createSchool, { isLoading: isCreatingSchool }] = useCreateSchoolMutation();
  const [updateSchool, { isLoading: isUpdatingSchool }] = useUpdateSchoolMutation();
  const [deleteSchool] = useDeleteSchoolMutation();

  const totalPages = responseData?.meta?.totalPage || 1;

  const schools: School[] = Array.isArray(responseData?.data)
    ? responseData.data
    : responseData?.data || [];

  const handleOpenEditSchoolModal = (school: School) => {
    setCurrentSchool(school);
    setName(school.name);
    setEmail(school.email);
    setPassword(""); // Don't show existing password for security
    setBranchPermission(school.branchPermission);
    setShowPassword(false);
    setAddSchoolModalOpen(true);
  };

  const handleCloseAddSchoolModal = () => {
    setAddSchoolModalOpen(false);
    setCurrentSchool(null);
    setName("");
    setEmail("");
    setPassword("");
    setBranchPermission(1); 
    setShowPassword(false);
  };

  const handleCreateOrUpdateSchool = async () => {
    try {
      if (!name.trim() || !email.trim() || (!currentSchool && !password.trim())) {
        toastShowing('Please fill all required fields', 'bottom-right', 2000, 'red', 'white');
        return;
      }

      const schoolData = {
        name,
        email,
        password: currentSchool ? undefined : password, // Only send password for new schools
        branchPermission
      };

      if (currentSchool) {
        // Update existing school
        await updateSchool({ id: currentSchool.id, ...schoolData }).unwrap();
        toastShowing('School updated successfully', 'bottom-right', 2000, 'green', 'white');
      } else {
        await createSchool(schoolData).unwrap();
        toastShowing('School created successfully', 'bottom-right', 2000, 'green', 'white');
      }

      refetch();
      handleCloseAddSchoolModal();
    } catch (err) {
      toastShowing((err as { data?: { message?: string } })?.data?.message ||
        (currentSchool ? "Failed to update school" : "Failed to create school"), 'bottom-right', 2000, 'green', 'white')
      console.error("Error saving school:", err);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleBranchPermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setBranchPermission(value);
  };

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const columns = [
    {
      key: "select",
      header: "",
      render: (row: School) => (
        <Checkbox
          checked={selectedRows.includes(row.id)}
          onChange={() => handleSelectRow(row.id)}
        />
      ),
    },
     {
      key: "sl",
      header: "SL",
      render: (row: School, index?: number) =>
        index !== undefined ? index + 1 : null,
     
    },
    {
      key: "name",
      header: "Name",
      render: (row: School) => (
        <div className="flex items-center gap-2">
          <SchoolIcon color="primary" sx={{ fontSize: 20 }} />
          {row.name}
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "branchPermission",
      header: "Branch Permission",
    },
    {
      key: "createdAt",
      header: "Created On",
      render: (row: School) => {
        if (!row.createdAt) return "-";
        try {
          const date = new Date(row.createdAt);
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          return "-";
        }
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: School) => (
        <div className="flex space-x-2 items-center">
          <IconButton onClick={() => handleOpenEditSchoolModal(row)}>
            <Edit color="#035140" size={20} />
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
              <Trash2 size={20} />
            )}
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="School Management"
        buttonText="Add School"
        buttonIcon={<Plus size={20} />}
        onButtonClick={()=> router.push('/super-admin/pages/create-school')}
      />

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <SearchingInputField
          placeholder="Search schools..."
          onSearch={(term) => {
            setSearchTerm(term);
            setPage(0);
          }}
          debounceTime={300}
          maxWidth={400}
          height="36px"
        />

      </Box>

      {/* Add/Edit School Modal */}
      <AnimatePresence>
        {addSchoolModalOpen && (
          <Modal
            open={addSchoolModalOpen}
            onClose={handleCloseAddSchoolModal}
            closeAfterTransition
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.3,
              }}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                position: "relative",
                padding: "2rem",
                borderRadius: "6px",
                outline: "none",
                width: "480px",
                maxWidth: "95%",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: `
                  linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,252,251,0.98)),
                  radial-gradient(circle at top left, rgba(26,60,52,0.03), transparent 60%)
                `,
              }}
            >
              {/* Floating close button */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: "absolute",
                  top: "-12px",
                  right: "-12px",
                  zIndex: 1,
                }}
              >
                <IconButton
                  onClick={handleCloseAddSchoolModal}
                  sx={{
                    backgroundColor: "#d32f2f",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(26, 60, 52, 0.2)",
                    "&:hover": {
                      backgroundColor: "#b71c1c",
                    },
                  }}
                >
                  <X size={20} />
                </IconButton>
              </motion.div>

              {/* Header with decorative accent */}
              <Box sx={{ position: "relative", mb: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: "#1A3C34",
                    position: "relative",
                    display: "inline-block",
                    "&:after": {
                      content: '""',
                      position: "absolute",
                      bottom: "-8px",
                      left: 0,
                      width: "48px",
                      height: "4px",
                      background: "linear-gradient(90deg, #1A3C34, rgba(26,60,52,0.3))",
                      borderRadius: "2px",
                    },
                  }}
                >
                  {currentSchool ? "Edit School" : "Create New School"}
                </Typography>
              </Box>

              {/* School Name */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <TextField
                  fullWidth
                  label={
                    <span style={{ color: "#5F7161", fontWeight: 500 }}>
                      School Name
                    </span>
                  }
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{
                    mt: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      "& fieldset": {
                        borderColor: "rgba(26,60,52,0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "#1A3C34",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#1A3C34",
                        boxShadow: "0 0 0 2px rgba(26,60,52,0.2)",
                      },
                    },
                  }}
                  autoFocus
                  InputProps={{
                    style: {
                      fontSize: "1rem",
                      padding: "5px 5px",
                    },
                  }}
                />
              </motion.div>

              {/* School Email */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <TextField
                  fullWidth
                  label={
                    <span style={{ color: "#5F7161", fontWeight: 500 }}>
                      School Email
                    </span>
                  }
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    mt: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      "& fieldset": {
                        borderColor: "rgba(26,60,52,0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "#1A3C34",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#1A3C34",
                        boxShadow: "0 0 0 2px rgba(26,60,52,0.2)",
                      },
                    },
                  }}
                  InputProps={{
                    style: {
                      fontSize: "1rem",
                      padding: "5px 5px",
                    },
                  }}
                />
              </motion.div>

              {/* Password - only show for create or if explicitly changing password */}
              {!currentSchool && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <TextField
                    fullWidth
                    label={
                      <span style={{ color: "#5F7161", fontWeight: 500 }}>
                        Password
                      </span>
                    }
                    variant="outlined"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{
                      mt: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "6px",
                        "& fieldset": {
                          borderColor: "rgba(26,60,52,0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "#1A3C34",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#1A3C34",
                          boxShadow: "0 0 0 2px rgba(26,60,52,0.2)",
                        },
                      },
                    }}
                    InputProps={{
                      style: {
                        fontSize: "1rem",
                        padding: "5px 5px",
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? (
                              <Visibility sx={{ fontSize: 20 }} />
                            ) : (
                              <VisibilityOff sx={{ fontSize: 20 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>
              )}

              {/* Branch Permission */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel
                    htmlFor="branch-permission-input"
                    sx={{ color: "#5F7161", fontWeight: 500 }}
                  >
                    Branch Permission
                  </InputLabel>
                  <OutlinedInput
                    id="branch-permission-input"
                    type="number"
                    value={branchPermission}
                    onChange={handleBranchPermissionChange}
                    inputProps={{
                      min: 1,
                    }}
                    label="Branch Permission"
                    sx={{
                      borderRadius: "6px",
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(26,60,52,0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "#1A3C34",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#1A3C34",
                          boxShadow: "0 0 0 2px rgba(26,60,52,0.2)",
                        },
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Enter the number of branch permissions (minimum 1)
                  </Typography>
                </FormControl>
              </motion.div>

              {/* Action buttons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 4,
                  position: "relative",
                }}
              >
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <CancelButton
                    onClick={handleCloseAddSchoolModal}
                  >
                    Cancel
                  </CancelButton>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                  <SubmitButton
                    onClick={handleCreateOrUpdateSchool}
                    disabled={(isCreatingSchool || isUpdatingSchool) || !name.trim() || !email.trim() || (!currentSchool && !password.trim())}
                   
                  >
                    {isCreatingSchool || isUpdatingSchool ? (
                      <span>{currentSchool ? "Updating..." : "Creating..."}</span>
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <span>{currentSchool ? "Update School" : "Create School"}</span>
                       
                      </Box>
                    )}
                  </SubmitButton>
                </motion.div>
              </Box>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

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
            No schools found. {searchTerm ? "Try a different search term." : "Create your first school."}
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
        onConfirm={handleDeleteSchool}
        title="Delete School"
        description="Are you sure you want to delete this school? All associated data will be permanently removed."
        isLoading={isDeleting}
      />
    </Box>
  );
};

export default CreatedSchoolList;
