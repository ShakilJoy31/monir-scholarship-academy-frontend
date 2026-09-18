"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  Modal,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import { X } from "lucide-react";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { motion, AnimatePresence } from "framer-motion";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetAllBranchesQuery } from "@/app/store/api/branch/branchApi";
import {
  useCreateUserMutation,
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation
} from "@/app/store/api/user/userApi";
import { UserFormValues, UserSchema } from "@/app/super-admin/schemas/userSchema";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { theStar } from "@/lib/requiredJSX";
import { validateEmptyFields } from "@/lib/objectModify";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  branchId: number;
  branch?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface Branch {
  id: number;
  name: string;
}

const BranchUserList = () => {
  const [addUserModalOpen, setAddUserModalOpen] = useState<boolean>(false);
  const [viewUserModalOpen, setViewUserModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<UserFormValues>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: '',
      branchId: 0,
      phone: '',
      email: '',
      password: ''
    },
  });

  // Fetch data
  const {
    data: usersResponse,
    isLoading,
    isError,
    refetch,
  } = useGetAllUsersQuery({
    page: page + 1,
    size: rowsPerPage,
    search: searchTerm,
  });

  const userInfo = getUserInfoFromToken();
  const { data: branchesResponse } = useGetAllBranchesQuery({id: userInfo?.id});
  // const router = useRouter()

  // const { data: userDetails } = useGetUserByIdQuery(currentUser?.id || 0, {
  //   skip: !currentUser?.id,
  // });

  const {
    isDeleteModalOpen,
    itemToDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    handleDelete: handleDeleteConfirmation,
  } = useDeleteConfirmation();

  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const totalPages = usersResponse?.meta?.totalPage || 1;
  const users: User[] = Array.isArray(usersResponse?.data) ? usersResponse.data : usersResponse?.data || [];
  const branches: Branch[] = branchesResponse?.data || [];

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  // Modal handlers
  const handleOpenAddUserModal = () => {
    setCurrentUser(null);
    reset();
    setAddUserModalOpen(true);
  };

  const handleOpenEditUserModal = (user: User) => {
    setCurrentUser(user);
    setValue("name", user.name);
    setValue("branchId", user.branchId);
    setValue("phone", user.phone);
    setValue("email", user.email || '');
    setValue("password", ''); // Don't pre-fill password for security
    setAddUserModalOpen(true);
  };

  const handleOpenViewUserModal = (user: User) => {
    setCurrentUser(user);
    setViewUserModalOpen(true);
  };

  const handleCloseAddUserModal = () => {
    setAddUserModalOpen(false);
    setCurrentUser(null);
    reset();
    setShowPassword(false);
  };

  const handleCloseViewUserModal = () => {
    setViewUserModalOpen(false);
    setCurrentUser(null);
  };

  const onSubmit = async (data: UserFormValues) => {
    const payload = validateEmptyFields(data);
    console.log("payload", payload);
    console.log(data, currentUser);
    try {
      if (currentUser) {
        // Update existing user
       await updateUser({ id: currentUser.id, ...payload }).unwrap();
        toastShowing('User updated successfully', 'bottom-right', 2000, 'green', 'white');
      } else {
        // Create new user
        await createUser(data).unwrap();
        toastShowing('User created successfully', 'bottom-right', 2000, 'green', 'white');
      }

      refetch();
      handleCloseAddUserModal();
    } catch (err) {
      toastShowing((err as { data?: { message?: string } })?.data?.message ||
        (currentUser ? "Failed to update user" : "Failed to create user"), 'bottom-right', 2000, 'red', 'white');
    }
  };

  const handleDeleteUser = async () => {
    await handleDeleteConfirmation(
      async (userId) => {
        await deleteUser(userId).unwrap();
        refetch();
      },
      {
        successMessage: "User deleted successfully",
        errorMessage: "Failed to delete user",
      }
    );
  };

  const columns = [
    {
      key: "sl",
      header: "SL",
      render: (row: User, index?: number) => (index !== undefined ? index + 1 : null),
    },
    {
      key: 'name',
      header: 'Name',
      render: (row: User) => row.name || 'N/A'
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (row: User) => row.phone || 'N/A'
    },
    {
      key: 'email',
      header: 'Email',
      render: (row: User) => row.email || 'N/A'
    },
    {
      key: 'branch',
      header: 'Branch',
      render: (row: User) => row.branch?.name || 'N/A'
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (row: User) => {
        const date = new Date(row.createdAt);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: User) => {
        return (
          <Tooltip
            title={
              <Paper
                elevation={3}
                sx={{
                  backgroundColor: 'white',
                  padding: '8px 0',
                  borderRadius: '8px',
                  display: 'grid',
                  gap: '4px',
                  minWidth: '120px',
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Button
                  onClick={() => {
                    handleOpenViewUserModal(row);
                    setOpenMenuId(null);
                  }}
                  size="small"
                  sx={{
                    color: "#035140",
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 400,
                    justifyContent: 'flex-start',
                    padding: '6px 16px',
                    "&:hover": {
                      backgroundColor: "rgba(3, 81, 64, 0.08)",
                    },
                  }}
                >
                  View
                </Button>

                <Button
                  onClick={() => {
                    handleOpenEditUserModal(row);
                    setOpenMenuId(null);
                  }}
                  size="small"
                  sx={{
                    color: "#035140",
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 400,
                    justifyContent: 'flex-start',
                    padding: '6px 16px',
                    "&:hover": {
                      backgroundColor: "rgba(3, 81, 64, 0.08)",
                    },
                  }}
                >
                  Edit
                </Button>

                <Button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    openDeleteModal(row.id);
                    setOpenMenuId(null);
                  }}
                  size="small"
                  disabled={isDeleting && itemToDelete === row.id}
                  sx={{
                    color: "#DC2626",
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 400,
                    justifyContent: 'flex-start',
                    padding: '6px 16px',
                    "&:hover": {
                      backgroundColor: "rgba(220, 38, 38, 0.08)",
                    },
                    "&.Mui-disabled": {
                      color: "rgba(220, 38, 38, 0.5)"
                    }
                  }}
                >
                  {isDeleting && itemToDelete === row.id ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CircularProgress size={14} thickness={5} color="inherit" />
                      Deleting...
                    </span>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </Paper>
            }
            placement="bottom-end"
            open={openMenuId === row.id}
            onOpen={() => setOpenMenuId(row.id)}
            onClose={() => setOpenMenuId(null)}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: 'transparent',
                  padding: 0,
                  boxShadow: 'none'
                }
              }
            }}
            PopperProps={{
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, -10],
                  },
                },
              ],
            }}
          >
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === row.id ? null : row.id);
              }}
              sx={{
                color: "#64748B",
                p: 1,
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "rgba(100, 116, 139, 0.1)",
                },
              }}
            >
              <BsThreeDotsVertical size={18} />
            </IconButton>
          </Tooltip>
        );
      }
    }
  ];

  return (
    <Box>

      <h1 className="text-xl font-bold mb-4 pt-16">Branch User Management</h1>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <SearchingInputField
          placeholder="Search users..."
          onSearch={(term) => {
            setSearchTerm(term);
            setPage(0);
          }}
          debounceTime={300}
          maxWidth={400}
          height="36px"
        />

        <SubmitButton onClick={handleOpenAddUserModal}
        >+ Add New User</SubmitButton>
      </Box>

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {addUserModalOpen && (
          <Modal
            open={addUserModalOpen}
            onClose={handleCloseAddUserModal}
            closeAfterTransition
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
                duration: 0.3
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                position: 'relative',
                padding: '2rem',
                borderRadius: '6px',
                outline: 'none',
                width: '480px',
                maxWidth: '95%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
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
                  position: 'absolute',
                  top: '-12px',
                  right: '-12px',
                  zIndex: 1,
                }}
              >
                <IconButton
                  onClick={handleCloseAddUserModal}
                  sx={{
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(26, 60, 52, 0.2)',
                    '&:hover': {
                      backgroundColor: '#0F2922',
                    }
                  }}
                >
                  <X size={18} />
                </IconButton>
              </motion.div>

              {/* Header with decorative accent */}
              <Box sx={{ position: 'relative', mb: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: '#1A3C34',
                    position: 'relative',
                    display: 'inline-block',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-8px',
                      left: 0,
                      width: '48px',
                      height: '4px',
                      background: 'linear-gradient(90deg, #1A3C34, rgba(26,60,52,0.3))',
                      borderRadius: '2px',
                    }
                  }}
                >
                  {currentUser ? "Edit User" : "Add New User"}
                </Typography>
              </Box>

              {/* Form fields */}
              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{
                display: 'grid',
                gap: 2,
                maxHeight: '70vh',
                overflowY: 'auto',
                py: 2,
                pr: 1,
                '&::-webkit-scrollbar': {
                  display: 'none'
                },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={
                          <>
                            Full Name
                            {theStar}
                          </>
                        }
                        fullWidth
                        size="small"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        sx={{
                          borderRadius: '6px',
                          '& .MuiInputBase-root': {
                            height: '48px', // Increased height
                          },
                          '& fieldset': {
                            borderColor: 'rgba(26,60,52,0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: '#1A3C34',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1A3C34',
                            boxShadow: '0 0 0 2px rgba(26,60,52,0.2)',
                          },
                        }}
                      />
                    )}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  
                  <Controller
                    name="branchId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small" error={!!errors.branchId}>
                        <InputLabel>Branch {theStar}</InputLabel>
                         <Select
                                    {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                                >
                                     {branches?.map((branch: Branch) => (
                            <MenuItem
                              key={branch.id}
                              value={branch.id}
                              
                            >
                              {branch.name}
                            </MenuItem>
                          ))}
                                </Select>
                        {errors.branchId && (
                          <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                            {errors.branchId.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={
                          <>
                            Phone Number
                            {theStar}
                          </>
                        }
                        fullWidth
                        size="small"
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                        sx={{
                          borderRadius: '6px',
                          '& .MuiInputBase-root': {
                            height: '48px', // Increased height
                          },
                          '& fieldset': {
                            borderColor: 'rgba(26,60,52,0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: '#1A3C34',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1A3C34',
                            boxShadow: '0 0 0 2px rgba(26,60,52,0.2)',
                          },
                        }}
                      />
                    )}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Email"
                        type="email"
                        fullWidth
                        size="small"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        sx={{
                          borderRadius: '6px',
                          '& .MuiInputBase-root': {
                            height: '48px', // Increased height
                          },
                          '& fieldset': {
                            borderColor: 'rgba(26,60,52,0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: '#1A3C34',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1A3C34',
                            boxShadow: '0 0 0 2px rgba(26,60,52,0.2)',
                          },
                        }}
                      />
                    )}
                  />
                </motion.div>

                {!currentUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={
                            <>
                              Password
                              {theStar}
                            </>
                          }
                          type={showPassword ? 'text' : 'password'}
                          fullWidth
                          size="small"
                          error={!!errors.password}
                          helperText={errors.password?.message}
                          sx={{
                            borderRadius: '6px',
                            '& .MuiInputBase-root': {
                              height: '48px',
                            },
                            '& fieldset': {
                              borderColor: 'rgba(26,60,52,0.2)',
                            },
                            '&:hover fieldset': {
                              borderColor: '#1A3C34',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#1A3C34',
                              boxShadow: '0 0 0 2px rgba(26,60,52,0.2)',
                            },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={handleClickShowPassword}
                                  onMouseDown={handleMouseDownPassword}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </motion.div>
                )}

                {/* Action buttons */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2,
                    mt: 4,
                    position: 'relative',
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CancelButton
                      onClick={handleCloseAddUserModal}
                    >
                      Cancel
                    </CancelButton>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SubmitButton
                      type="submit"
                      disabled={isCreatingUser || isUpdatingUser}
                      sx={{
                        backgroundColor: '#1A3C34',
                        borderRadius: '6px',
                        px: 3,
                        py: 1,
                        fontWeight: 500,
                        boxShadow: '0 4px 16px rgba(26, 60, 52, 0.3)',
                        '&:hover': {
                          backgroundColor: '#0F2922',
                          boxShadow: '0 6px 20px rgba(26, 60, 52, 0.4)',
                        },
                        '&:disabled': {
                          backgroundColor: 'rgba(26, 60, 52, 0.5)',
                        }
                      }}
                    >
                      {(isCreatingUser || isUpdatingUser) ? (
                        <span>{currentUser ? "Updating..." : "Creating..."}</span>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{currentUser ? "Update User" : "Add User"}</span>
                         
                        </Box>
                      )}
                    </SubmitButton>
                  </motion.div>
                </Box>
              </Box>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* View User Modal */}
      <AnimatePresence>
        {viewUserModalOpen && currentUser && (
          <Modal
            open={viewUserModalOpen}
            onClose={handleCloseViewUserModal}
            closeAfterTransition
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
                duration: 0.3
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                position: 'relative',
                padding: '2rem',
                borderRadius: '6px',
                outline: 'none',
                width: '480px',
                maxWidth: '95%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
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
                  position: 'absolute',
                  top: '-12px',
                  right: '-12px',
                  zIndex: 1,
                }}
              >
                <IconButton
                  onClick={handleCloseViewUserModal}
                  sx={{
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(26, 60, 52, 0.2)',
                    '&:hover': {
                      backgroundColor: '#0F2922',
                    }
                  }}
                >
                  <X size={18} />
                </IconButton>
              </motion.div>

              {/* Header with decorative accent */}
              <Box sx={{ position: 'relative', mb: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: '#1A3C34',
                    position: 'relative',
                    display: 'inline-block',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-8px',
                      left: 0,
                      width: '48px',
                      height: '4px',
                      background: 'linear-gradient(90deg, #1A3C34, rgba(26,60,52,0.3))',
                      borderRadius: '2px',
                    }
                  }}
                >
                  User Details
                </Typography>
              </Box>

              {/* User details */}
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="textSecondary">Name:</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {currentUser.name || 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="textSecondary">Branch:</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {currentUser.branch?.name || 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="textSecondary">Phone:</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {currentUser.phone || 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="textSecondary">Email:</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {currentUser.email || 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="textSecondary">Created At:</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="textSecondary">Last Updated:</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {new Date(currentUser.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              </Box>

              {/* Close button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleCloseViewUserModal}
                  sx={{
                    backgroundColor: '#d32f2f',
                    borderRadius: '6px',
                    px: 3,
                    py: 1,
                    fontWeight: 500,
                    boxShadow: '0 4px 16px rgba(26, 60, 52, 0.3)',
                    '&:hover': {
                      backgroundColor: '#0F2922',
                      boxShadow: '0 6px 20px rgba(26, 60, 52, 0.4)',
                    },
                  }}
                >
                  Close
                </Button>
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
            Failed to load users
          </Alert>
        ) : users.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No users found. {searchTerm ? "Try a different search term." : "Add your first user."}
          </Typography>
        ) : (
          <>
            <ReusableTable<User>
              columns={columns}
              data={users}
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

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteUser()}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        isLoading={isDeleting}
      />
    </Box>
  );
};

export default BranchUserList;