"use client";
import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  IconButton,
  TextField,
  Modal,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Tooltip,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  SwapHoriz as TransferIcon,
  AttachMoney as AmountIcon,
  Notes as NoteIcon,
  CalendarToday as DateIcon,
} from "@mui/icons-material";
import { Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { useGetAllAccountsQuery } from "@/app/store/api/classes/accountApi";
import {
  useCreateBalanceTransferMutation,
  useGetAllBalanceTransfersQuery,
  useGetBalanceTransferByIdQuery,
  useUpdateBalanceTransferMutation,
  useAcceptBalanceTransferMutation,
  useCancelBalanceTransferMutation,
  useDeleteBalanceTransferMutation,
} from "@/app/store/api/classes/balanceTransferApi";
import { AcceptModal } from "@/components/shared/reusable-component/AcceptModal";
import { BsThreeDotsVertical } from "react-icons/bs";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";
import { removeFalsyProperties } from "@/app/utils/helper/removeEmptyStringProperties";

interface Account {
  id: number;
  bankName: string;
  accountHolderName: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  branchId: number;
  openingBalance: number;
  currentBalance: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface BalanceTransfer {
  id: number;
  branchId: number;
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  note: string;
  status: "Pending" | "Accepted" | "Canceled";
  createdAt: string;
  updatedAt: string;
  fromAccount?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  toAccount?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  [key: string]: unknown;
}

const BalanceTransferList = () => {
  const [addTransferModalOpen, setAddTransferModalOpen] =
    useState<boolean>(false);
  const [viewTransferModalOpen, setViewTransferModalOpen] =
    useState<boolean>(false);
  const [transferData, setTransferData] = useState({
    fromAccountId: 0,
    toAccountId: 0,
    amount: 0,
    note: "",
  });
  const [currentTransfer, setCurrentTransfer] =
    useState<BalanceTransfer | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    action: "accept" | "cancel" | null;
    transferId: number | null;
  }>({
    open: false,
    action: null,
    transferId: null,
  });

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllBalanceTransfersQuery({
    page,
    size: rowsPerPage,
    search: searchTerm,
  });

  // Get accounts for dropdowns
  const { data: accountsResponse } = useGetAllAccountsQuery({ type: "All" });

  // Get transfer details for view modal
  const { data: transferDetails, isLoading: isTransferDetailsLoading } =
    useGetBalanceTransferByIdQuery(currentTransfer?.id || 0, {
      skip: !currentTransfer?.id,
    });

  console.log(transferDetails);

  const {
    isDeleteModalOpen,
    itemToDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    handleDelete: handleDeleteConfirmation,
  } = useDeleteConfirmation();

  const [createTransfer] = useCreateBalanceTransferMutation();
  const [updateTransfer] = useUpdateBalanceTransferMutation();
  const [acceptTransfer] = useAcceptBalanceTransferMutation();
  const [cancelTransfer] = useCancelBalanceTransferMutation();
  const [deleteTransfer] = useDeleteBalanceTransferMutation();

  const accounts = useMemo(
    () => accountsResponse?.data || [],
    [accountsResponse?.data]
  );
  const transfers: BalanceTransfer[] = responseData?.data || [];
  const totalPages = responseData?.meta?.totalPage || 1;

  // Create a map of account IDs to account details for quick lookup
  const accountMap = useMemo(() => {
    const map = new Map<number, Account>();
    accounts.forEach((account: Account) => {
      map.set(account.id, account);
    });
    return map;
  }, [accounts]);

  const [approveTransfer, setApproveTransfer] = useState(false);
  const [cancelATransfer, setCancelTransfer] = useState(false);

  const handleOpenConfirmation = (
    action: "accept" | "cancel",
    transferId: number
  ) => {
    if (action === "accept") {
      setApproveTransfer(true);
      setCancelTransfer(false);
    } else {
      setApproveTransfer(false);
      setCancelTransfer(true);
    }
    setConfirmAction({
      open: true,
      action,
      transferId,
    });
  };

  const handleCloseConfirmation = () => {
    setApproveTransfer(false);
    setCancelTransfer(false);
    setConfirmAction({
      open: false,
      action: null,
      transferId: null,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction.transferId) return;

    try {
      if (confirmAction.action === "accept") {
        await acceptTransfer(confirmAction.transferId).unwrap();
        toastShowing(
          "Transfer accepted successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      } else if (confirmAction.action === "cancel") {
        await cancelTransfer(confirmAction.transferId).unwrap();
        toastShowing(
          "Transfer cancelled successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      }
      refetch();
    } catch (err) {
      toast.error(
        (err as { data?: { message?: string } })?.data?.message ||
          `Failed to ${confirmAction.action} transfer`
      );
    } finally {
      handleCloseConfirmation();
    }
  };

  const handleOpenAddTransferModal = () => {
    setCurrentTransfer(null);
    setTransferData({
      fromAccountId: 0,
      toAccountId: 0,
      amount: 0,
      note: "",
    });
    setAddTransferModalOpen(true);
  };

  const handleOpenEditTransferModal = (transfer: BalanceTransfer) => {
    setCurrentTransfer(transfer);
    setTransferData({
      fromAccountId: transfer.fromAccountId,
      toAccountId: transfer.toAccountId,
      amount: transfer.amount,
      note: transfer.note || "",
    });
    setAddTransferModalOpen(true);
  };

  const handleOpenViewTransferModal = (transfer: BalanceTransfer) => {
    setCurrentTransfer(transfer);
    setViewTransferModalOpen(true);
  };

  const handleCloseAddTransferModal = () => {
    setAddTransferModalOpen(false);
    setTransferData({
      fromAccountId: 0,
      toAccountId: 0,
      amount: 0,
      note: "",
    });
    setCurrentTransfer(null);
  };

  const handleCloseViewTransferModal = () => {
    setViewTransferModalOpen(false);
    setCurrentTransfer(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransferData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d*\.?\d*$/.test(value)) {
      setTransferData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : parseFloat(value),
      }));
    }
  };

  const handleCreateOrUpdateTransfer = async () => {
    try {
      // Validate required fields
      if (
        !transferData.fromAccountId ||
        !transferData.toAccountId ||
        transferData.amount <= 0
      ) {
        toastShowing(
          "From Account, To Account and valid Amount are required",
          "bottom-right",
          2000,
          "red",
          "white"
        );
        return;
      }

      if (transferData.fromAccountId === transferData.toAccountId) {
        toastShowing(
          "From Account and To Account must be different",
          "bottom-right",
          2000,
          "red",
          "white"
        );
        return;
      }

      if (currentTransfer) {
        // Update existing transfer
        await updateTransfer({
          id: currentTransfer.id,
          ...transferData,
        }).unwrap();
        toastShowing(
          "Transfer updated successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      } else {
        const cleanedData = removeFalsyProperties(transferData, [
          "amount",
          "fromAccountId",
          "note",
          "toAccountId",
        ]);
        // Create new transfer
        await createTransfer(cleanedData).unwrap();
        toastShowing(
          "Transfer created successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      }

      refetch();
      handleCloseAddTransferModal();
    } catch (err) {
      toast.error(
        (err as { data?: { message?: string } })?.data?.message ||
          (currentTransfer
            ? "Failed to update transfer"
            : "Failed to create transfer")
      );
      console.error("Error saving transfer:", err);
    }
  };
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const handleDeleteTransfer = async () => {
    await handleDeleteConfirmation(
      async (transferId) => {
        await deleteTransfer(transferId).unwrap();
        refetch();
      },
      {
        successMessage: "Transfer deleted successfully",
        errorMessage: "Failed to delete transfer",
      }
    );
  };

  const getStatusColor = () => {
    if (!currentTransfer) return "default";
    switch (currentTransfer.status) {
      case "Canceled":
        return "error";
      case "Accepted":
        return "success";
      default:
        return "warning";
    }
  };

  const columns = [
    {
      key: "sl",
      header: "SL",
      render: (row: BalanceTransfer, index: number) =>
        (page - 1) * rowsPerPage + index + 1,
    },
    {
      key: "fromAccount",
      header: "From Account",
      render: (row: BalanceTransfer) => {
        const account = accountMap.get(row.fromAccountId);
        return (
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {account?.bankName || "N/A"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {account?.accountName || "N/A"} ({account?.accountNumber || "N/A"}
              )
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "toAccount",
      header: "To Account",
      render: (row: BalanceTransfer) => {
        const account = accountMap.get(row.toAccountId);
        return (
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {account?.bankName || "N/A"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {account?.accountName || "N/A"} ({account?.accountNumber || "N/A"}
              )
            </Typography>
          </Box>
        );
      },
    },

    {
      key: "status",
      header: "Status",
      render: (row: BalanceTransfer) => {
        let color:
          | "default"
          | "primary"
          | "secondary"
          | "error"
          | "info"
          | "success"
          | "warning";
        switch (row.status) {
          case "Accepted":
            color = "success";
            break;
          case "Canceled":
            color = "error";
            break;
          default:
            color = "warning";
        }
        return (
          <Chip
            label={row.status}
            color={color}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        );
      },
    },
    {
      key: "createdAt",
      header: "Date",
      render: (row: BalanceTransfer) => {
        const date = new Date(row.createdAt);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      key: "amount",
      header: "Amount",
      render: (row: BalanceTransfer) => `BDT ${row.amount.toFixed(2)}/-`,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: BalanceTransfer) => {
        return (
          <Tooltip
            title={
              <Paper
                elevation={3}
                sx={{
                  backgroundColor: "white",
                  padding: "6px 0",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  minWidth: "140px",
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Button
                  onClick={() => {
                    handleOpenViewTransferModal(row);
                    setOpenMenuId(null);
                  }}
                  size="small"
                  sx={{
                    color: "#035140",
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 400,
                    justifyContent: "flex-start",
                    padding: "6px 16px",
                    "&:hover": {
                      backgroundColor: "rgba(3, 81, 64, 0.08)",
                    },
                  }}
                >
                  View
                </Button>

                {row.status === "Pending" && (
                  <>
                    <Button
                      onClick={() => {
                        handleOpenEditTransferModal(row);
                        setOpenMenuId(null);
                      }}
                      size="small"
                      sx={{
                        color: "#035140",
                        textTransform: "none",
                        fontSize: "14px",
                        fontWeight: 400,
                        justifyContent: "flex-start",
                        padding: "6px 16px",
                        "&:hover": {
                          backgroundColor: "rgba(3, 81, 64, 0.08)",
                        },
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      onClick={() => {
                        handleOpenConfirmation("accept", row.id);
                        setOpenMenuId(null);
                      }}
                      size="small"
                      sx={{
                        color: "#10B981",
                        textTransform: "none",
                        fontSize: "14px",
                        fontWeight: 400,
                        justifyContent: "flex-start",
                        padding: "6px 16px",
                        "&:hover": {
                          backgroundColor: "rgba(16, 185, 129, 0.08)",
                        },
                      }}
                    >
                      Accept
                    </Button>

                    <Button
                      onClick={() => {
                        handleOpenConfirmation("cancel", row.id);
                        setOpenMenuId(null);
                      }}
                      size="small"
                      sx={{
                        color: "#EF4444",
                        textTransform: "none",
                        fontSize: "14px",
                        fontWeight: 400,
                        justifyContent: "flex-start",
                        padding: "6px 16px",
                        "&:hover": {
                          backgroundColor: "rgba(239, 68, 68, 0.08)",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}

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
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 400,
                    justifyContent: "flex-start",
                    padding: "6px 16px",
                    "&:hover": {
                      backgroundColor: "rgba(220, 38, 38, 0.08)",
                    },
                    "&.Mui-disabled": {
                      color: "rgba(220, 38, 38, 0.5)",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  {isDeleting && itemToDelete === row.id ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <CircularProgress
                        size={14}
                        thickness={5}
                        color="inherit"
                      />
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
                  backgroundColor: "transparent",
                  padding: 0,
                  boxShadow: "none",
                },
              },
            }}
            PopperProps={{
              modifiers: [
                {
                  name: "offset",
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
      },
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Balance Transfer"
        buttonText="New Transfer"
        buttonIcon={<Plus size={20} />}
        onButtonClick={handleOpenAddTransferModal}
      />

      <Box sx={{ mb: 2 }}>
        <SearchingInputField
          placeholder="Search transfers..."
          onSearch={(term) => {
            setSearchTerm(term);
            setPage(1);
          }}
          debounceTime={300}
          maxWidth={400}
          height="36px"
        />
      </Box>

      {/* Action Confirmation Dialog */}
      {confirmAction.action === "accept" ? (
        <AcceptModal
          confirmText="Accept"
          cancelText="Cancel"
          open={approveTransfer}
          onClose={handleCloseConfirmation}
          onConfirm={() => handleConfirmAction()}
          title="Accept Confirmation"
          description="Are you sure you want to accept this? This action cannot be undone."
          isLoading={isDeleting}
        />
      ) : (
        <DeleteConfirmationModal
          confirmText="Ok"
          cancelText="Cancel"
          open={cancelATransfer}
          onClose={handleCloseConfirmation}
          onConfirm={() => handleConfirmAction()}
          title="Cancel Confirmation"
          description="Are you sure you want to cancel this? This action cannot be undone."
          isLoading={isDeleting}
        />
      )}

      {/* Add/Edit Transfer Modal */}
      <AnimatePresence>
        {addTransferModalOpen && (
          <Modal
            open={addTransferModalOpen}
            onClose={handleCloseAddTransferModal}
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
                borderRadius: "6px",
                outline: "none",
                width: "480px",
                maxWidth: "95%",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: `
                  linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,252,251,0.98)),
                  radial-gradient(circle at top left, rgba(26,60,52,0.03), transparent 60%)
                `,
              }}
            >
              {/* Header section - fixed */}
              <Box
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  padding: "2rem 2rem 1rem 2rem",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Floating close button */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                  }}
                >
                  <IconButton
                    onClick={handleCloseAddTransferModal}
                    sx={{
                      backgroundColor: "#d32f2f",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(26, 60, 52, 0.2)",
                      "&:hover": {
                        backgroundColor: "#0F2922",
                      },
                    }}
                  >
                    <X size={18} />
                  </IconButton>
                </motion.div>

                {/* Header with decorative accent */}
                <Box sx={{ position: "relative" }}>
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
                        background:
                          "linear-gradient(90deg, #1A3C34, rgba(26,60,52,0.3))",
                        borderRadius: "2px",
                      },
                    }}
                  >
                    {currentTransfer ? "Edit Transfer" : "Add New Transfer"}
                  </Typography>
                </Box>
              </Box>

              {/* Scrollable form fields */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "0 2rem",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
              >
                <Box className="grid gap-4 py-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <FormControl fullWidth>
                      <InputLabel id="from-account-label">
                        From Account {theStar}
                      </InputLabel>

                      <Select
                        labelId="from-account-label"
                        label={
                          <>
                            From Account
                            {theStar}
                          </>
                        }
                        name="fromAccountId"
                        value={transferData.fromAccountId}
                        onChange={(e) =>
                          setTransferData((prev) => ({
                            ...prev,
                            fromAccountId: Number(e.target.value),
                          }))
                        }
                        sx={{
                          borderRadius: "6px",
                        }}
                      >
                        {accounts.map((account: Account) => (
                          <MenuItem key={account.id} value={account.id}>
                            {account.bankName} - {account.accountName} (
                            {account.accountNumber})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <FormControl fullWidth>
                      <InputLabel id="to-account-label">
                        To Account {theStar}
                      </InputLabel>
                      <Select
                        labelId="to-account-label"
                        label={
                          <>
                            To Account
                            {theStar}
                          </>
                        }
                        name="toAccountId"
                        value={transferData.toAccountId}
                        onChange={(e) =>
                          setTransferData((prev) => ({
                            ...prev,
                            toAccountId: Number(e.target.value),
                          }))
                        }
                        sx={{
                          borderRadius: "6px",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(26,60,52,0.2)",
                          },
                        }}
                      >
                        {accounts.map((account: Account) => (
                          <MenuItem key={account.id} value={account.id}>
                            {account.bankName} - {account.accountName} (
                            {account.accountNumber})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <TextField
                      fullWidth
                      label={
                        <>
                          Amount to Transfer
                          {theStar}
                        </>
                      }
                      name="amount"
                      value={
                        transferData.amount === 0 ? "" : transferData.amount
                      }
                      onChange={handleNumberInputChange}
                      type="number"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "6px",
                          "& fieldset": {
                            borderColor: "rgba(26,60,52,0.2)",
                          },
                        },
                      }}
                      inputProps={{
                        step: "0.01",
                      }}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <TextField
                      fullWidth
                      label="Note (Optional)"
                      name="note"
                      value={transferData.note}
                      onChange={handleInputChange}
                      multiline
                      rows={3}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "6px",
                          "& fieldset": {
                            borderColor: "rgba(26,60,52,0.2)",
                          },
                        },
                      }}
                    />
                  </motion.div>
                </Box>
              </Box>

              {/* Fixed footer with buttons */}
              <Box
                sx={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  padding: "1.5rem 2rem",
                  borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,

                  //
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CancelButton onClick={handleCloseAddTransferModal}>
                    Cancel
                  </CancelButton>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SubmitButton onClick={handleCreateOrUpdateTransfer}>
                    Submit
                  </SubmitButton>
                </motion.div>
              </Box>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* View Transfer Modal */}
      <AnimatePresence>
        {viewTransferModalOpen && currentTransfer && (
          <Modal
            open={viewTransferModalOpen}
            onClose={handleCloseViewTransferModal}
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
                borderRadius: "6px",
                outline: "none",
                width: "600px",
                maxWidth: "95%",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: `
                  linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,252,251,0.98)),
                  radial-gradient(circle at top left, rgba(26,60,52,0.03), transparent 60%)
                `,
              }}
            >
              {/* Header section - fixed */}
              <Box
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  padding: "2rem 2rem 1rem 2rem",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Floating close button */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                  }}
                >
                  <IconButton
                    onClick={handleCloseViewTransferModal}
                    sx={{
                      backgroundColor: "#1A3C34",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(26, 60, 52, 0.2)",
                      "&:hover": {
                        backgroundColor: "#0F2922",
                      },
                    }}
                  >
                    <X size={18} />
                  </IconButton>
                </motion.div>

                {/* Header with decorative accent */}
                <Box sx={{ position: "relative" }}>
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
                        background:
                          "linear-gradient(90deg, #1A3C34, rgba(26,60,52,0.3))",
                        borderRadius: "2px",
                      },
                    }}
                  >
                    Balance Transfer Details
                  </Typography>
                  <Chip
                    label={currentTransfer.status}
                    color={getStatusColor()}
                    variant="outlined"
                    sx={{
                      height: 32,
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      textTransform: "capitalize",
                      pl: 1,
                      ml: 4,
                    }}
                  />
                </Box>
              </Box>

              {/* Scrollable content */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "0 2rem 2rem 2rem",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
              >
                {isTransferDetailsLoading ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="200px"
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    {/* Main Content */}
                    <Stack spacing={3.5}>
                      {/* Transfer Details Section */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <TransferIcon
                          color="primary"
                          sx={{ mr: 2, fontSize: "1.5rem" }}
                        />
                        <div>
                          <Stack direction="row" spacing={6} mt={1}>
                            <div>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                From Account
                              </Typography>
                              {accountMap.get(currentTransfer.fromAccountId) ? (
                                <>
                                  <Typography variant="body1" fontWeight={500}>
                                    {
                                      accountMap.get(
                                        currentTransfer.fromAccountId
                                      )?.accountName
                                    }
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {
                                      accountMap.get(
                                        currentTransfer.fromAccountId
                                      )?.accountNumber
                                    }{" "}
                                    •{" "}
                                    {
                                      accountMap.get(
                                        currentTransfer.fromAccountId
                                      )?.bankName
                                    }
                                  </Typography>
                                </>
                              ) : (
                                <Typography
                                  variant="body1"
                                  color="text.secondary"
                                >
                                  Loading account...
                                </Typography>
                              )}
                            </div>

                            <div>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                To Account
                              </Typography>
                              {accountMap.get(currentTransfer.toAccountId) ? (
                                <>
                                  <Typography variant="body1" fontWeight={500}>
                                    {
                                      accountMap.get(
                                        currentTransfer.toAccountId
                                      )?.accountName
                                    }
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {
                                      accountMap.get(
                                        currentTransfer.toAccountId
                                      )?.accountNumber
                                    }{" "}
                                    •{" "}
                                    {
                                      accountMap.get(
                                        currentTransfer.toAccountId
                                      )?.bankName
                                    }
                                  </Typography>
                                </>
                              ) : (
                                <Typography
                                  variant="body1"
                                  color="text.secondary"
                                >
                                  Loading account...
                                </Typography>
                              )}
                            </div>
                          </Stack>
                        </div>
                      </Box>

                      {/* Amount Section */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AmountIcon
                          color="primary"
                          sx={{ mr: 2, fontSize: "1.5rem" }}
                        />
                        <div>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Transfer Amount
                          </Typography>
                          <Typography
                            variant="h5"
                            fontWeight={600}
                            color="primary"
                          >
                            {currentTransfer.amount.toLocaleString("en-US", {
                              style: "currency",
                              currency: "BDT",
                              minimumFractionDigits: 2,
                            })}
                          </Typography>
                        </div>
                      </Box>

                      {/* Note Section */}
                      {currentTransfer.note && (
                        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                          <NoteIcon
                            color="primary"
                            sx={{ mr: 2, fontSize: "1.5rem", mt: 0.5 }}
                          />
                          <div>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Transfer Note
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ whiteSpace: "pre-wrap" }}
                            >
                              {currentTransfer.note}
                            </Typography>
                          </div>
                        </Box>
                      )}

                      {/* Dates Section */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <DateIcon
                          color="primary"
                          sx={{ mr: 2, fontSize: "1.5rem" }}
                        />
                        <div>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Transfer Timeline
                          </Typography>
                          <Stack direction="row" spacing={4} mt={1}>
                            <div>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Created On
                              </Typography>
                              <Typography variant="body1">
                                {new Date(
                                  currentTransfer.createdAt
                                ).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </Typography>
                            </div>
                            <div>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Last Updated
                              </Typography>
                              <Typography variant="body1">
                                {new Date(
                                  currentTransfer.updatedAt
                                ).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </Typography>
                            </div>
                          </Stack>
                        </div>
                      </Box>
                    </Stack>
                  </>
                )}
              </Box>

              {/* Fixed footer with buttons */}
              <Box
                sx={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  padding: "1.5rem 2rem",
                  borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CancelButton
                    onClick={handleCloseViewTransferModal}
                    sx={{
                      color: "#1A3C34",
                      borderColor: "rgba(26,60,52,0.3)",
                      borderRadius: "6px",
                      px: 3,
                      py: 1,
                      fontWeight: 500,
                      "&:hover": {
                        borderColor: "#1A3C34",
                        backgroundColor: "rgba(26, 60, 52, 0.04)",
                      },
                    }}
                  >
                    Close
                  </CancelButton>
                </motion.div>

                {/* {currentTransfer.status === 'Pending' && (
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => {
                        handleOpenEditTransferModal(currentTransfer);
                        handleCloseViewTransferModal();
                      }}
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
                      }}
                    >
                      Edit Transfer
                    </Button>
                  </motion.div>
                )} */}
              </Box>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <div className="loader_global_template_2"></div>
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ m: 2 }}>
            Failed to load transfers. Please try again.
          </Alert>
        ) : transfers.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No transfers found.{" "}
            {searchTerm
              ? "Try a different search term."
              : "Create your first transfer."}
          </Typography>
        ) : (
          <>
            <ReusableTable<BalanceTransfer>
              columns={columns}
              data={transfers}
            />
            <PaginationComponent
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </>
        )}
      </Paper>

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteTransfer()}
        title="Delete Transfer"
        description="Are you sure you want to delete this transfer record? This action cannot be undone."
        isLoading={isDeleting}
      />
    </Box>
  );
};

export default BalanceTransferList;
