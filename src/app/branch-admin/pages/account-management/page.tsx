"use client";
import React, { useState, useMemo } from "react";
import {
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
    TextField,
    Modal,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Tooltip,
    Divider,
    Stack,
    Chip,
    CircularProgress
} from "@mui/material";
import {
    AccountBalance as BankIcon,
    Person as PersonIcon,
    AccountBalanceWallet as BalanceIcon,
    CalendarToday as DateIcon
} from '@mui/icons-material';
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
import { useCreateAccountMutation, useDeleteAccountMutation, useGetAllAccountsQuery, useGetAccountByIdQuery, useUpdateAccountMutation } from "@/app/store/api/classes/accountApi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { theStar } from "@/lib/requiredJSX";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface Account {
    id: number;
    bankName: string;
    accountHolderName: string;
    accountName: string;
    accountNumber: string;
    accountType: 'MobileBanking' | 'Bank' | 'Cash';
    openingBalance: number;
    currentBalance: number;
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

const accountTypes = [
    { value: 'MobileBanking', label: 'Mobile Banking' },
    { value: 'Bank', label: 'Bank Account' },
    { value: 'Cash', label: 'Cash' },
];

const AccountList = () => {
    const [addAccountModalOpen, setAddAccountModalOpen] = useState<boolean>(false);
    const [viewAccountModalOpen, setViewAccountModalOpen] = useState<boolean>(false);
    const [accountData, setAccountData] = useState({
        bankName: "",
        accountHolderName: "",
        accountName: "",
        accountNumber: "",
        accountType: "Bank" as 'MobileBanking' | 'Bank' | 'Cash',
        openingBalance: 0,
    });
    const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [accountTypeFilter, setAccountTypeFilter] = useState("All");

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllAccountsQuery({
        type: accountTypeFilter,
    });

    const { data: accountDetails, isLoading: isAccountDetailsLoading } = useGetAccountByIdQuery(
        currentAccount?.id || 0,
        { skip: !currentAccount?.id }
    );
    console.log("responseData", responseData)

    const {
        isDeleteModalOpen,
        itemToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    const [createAccount,] = useCreateAccountMutation();
    const [updateAccount,] = useUpdateAccountMutation();
    const [deleteAccount] = useDeleteAccountMutation();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const accounts: Account[] = Array.isArray(responseData?.data)
        ? responseData.data
        : responseData?.data || [];


    // Filter accounts based on search term
    const filteredAccounts = useMemo(() => {
        if (!searchTerm) return accounts;

        return accounts.filter(account =>
            account.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.accountHolderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [accounts, searchTerm]);

    const handleOpenAddAccountModal = () => {
        setCurrentAccount(null);
        setAccountData({
            bankName: "",
            accountHolderName: "",
            accountName: "",
            accountNumber: "",
            accountType: "Bank",
            openingBalance: 0,
        });
        setAddAccountModalOpen(true);
    };

    const handleOpenEditAccountModal = (account: Account) => {
        setCurrentAccount(account);
        setAccountData({
            bankName: account.bankName,
            accountHolderName: account.accountHolderName,
            accountName: account.accountName,
            accountNumber: account.accountNumber,
            accountType: account.accountType,
            openingBalance: account.openingBalance,
        });
        setAddAccountModalOpen(true);
    };

    const handleOpenViewAccountModal = (account: Account) => {
        setCurrentAccount(account);
        setViewAccountModalOpen(true);
    };

    const handleCloseAddAccountModal = () => {
        setAddAccountModalOpen(false);
        setAccountData({
            bankName: "",
            accountHolderName: "",
            accountName: "",
            accountNumber: "",
            accountType: "Bank",
            openingBalance: 0,
        });
        setCurrentAccount(null);
    };

    const handleCloseViewAccountModal = () => {
        setViewAccountModalOpen(false);
        setCurrentAccount(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAccountData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Only allow numbers and decimal point
        if (/^\d*\.?\d*$/.test(value) || value === "") {
            setAccountData(prev => ({
                ...prev,
                [name]: value === "" ? 0 : parseFloat(value)
            }));
        }
    };
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const handleCreateOrUpdateAccount = async () => {
        try {
            // Validate required fields
            if (!accountData.bankName.trim() ||
                !accountData.accountHolderName.trim() ||
                !accountData.accountName.trim() ||
                !accountData.accountNumber.trim()) {
                toastShowing('All fields are required', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            if (currentAccount) {
                // Update existing account
                await updateAccount({
                    id: currentAccount.id,
                    ...accountData
                }).unwrap();
                toastShowing('Account updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new account
                await createAccount(accountData).unwrap();
                toastShowing('Account created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddAccountModal();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentAccount ? "Failed to update account" : "Failed to create account")
            );
            console.error("Error saving account:", err);
        }
    };

    const handleDeleteAccount = async () => {
        await handleDeleteConfirmation(
            async (accountId) => {
                await deleteAccount(accountId).unwrap();
                refetch();
            },
            {
                successMessage: "Account deleted successfully",
                errorMessage: "Failed to delete account",
            }
        );
    };

    const totalPages = responseData?.meta?.totalPage || 1;

    const columns = [
        {
            key: 'sl',
            header: 'SL',
            render: (row: Account, index: number) => (page * rowsPerPage) + index + 1
        },
        {
            key: 'bankName',
            header: 'Bank Name'
        },
        {
            key: 'accountName',
            header: 'Account Name'
        },
        {
            key: 'accountHolderName',
            header: 'Account Holder'
        },
        {
            key: 'accountNumber',
            header: 'Account Number'
        },
        {
            key: 'accountType',
            header: 'Type',
            render: (row: Account) => {
                switch (row.accountType) {
                    case 'MobileBanking': return 'Mobile Banking';
                    case 'Bank': return 'Bank Account';
                    case 'Cash': return 'Cash';
                    default: return row?.accountType;
                }
            }
        },
        {
            key: 'openingBalance',
            header: 'Balance',
            render: (row: Account) => `BDT ${row?.currentBalance.toFixed(2)}/-`
        },
        {
            key: 'createdAt',
            header: 'Created On',
            render: (row: Account) => {
                const date = new Date(row.createdAt);
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                return formattedDate;
            }
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: Account) => {
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
                                        handleOpenViewAccountModal(row);
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
                                        handleOpenEditAccountModal(row);
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
            <PageHeader
                title="Account Management"
                buttonText="Add Account"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddAccountModal}
            />

            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <SearchingInputField
                    placeholder="Search accounts..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />

                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel id="account-type-filter-label">Account Type</InputLabel>
                    <Select
                        labelId="account-type-filter-label"
                        value={accountTypeFilter}
                        onChange={(e) => {
                            setAccountTypeFilter(e.target.value);
                            setPage(0);
                        }}
                        label="Account Type"
                        size="small"
                        sx={{ height: '36px' }}
                    >
                        <MenuItem value="All">All Types</MenuItem>
                        <MenuItem value="MobileBanking">Mobile Banking</MenuItem>
                        <MenuItem value="Bank">Bank Account</MenuItem>
                        <MenuItem value="Cash">Cash</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Add/Edit Account Modal */}
            <AnimatePresence>
                {addAccountModalOpen && (
                    <Modal
                        open={addAccountModalOpen}
                        onClose={handleCloseAddAccountModal}
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
                                borderRadius: '6px',
                                outline: 'none',
                                width: '480px',
                                maxWidth: '95%',
                                maxHeight: '90vh',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: `
                linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,252,251,0.98)),
                radial-gradient(circle at top left, rgba(26,60,52,0.03), transparent 60%)
            `,
                            }}
                        >
                            {/* Header section - fixed */}
                            <Box sx={{
                                position: 'sticky',
                                top: 0,
                                zIndex: 1,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                padding: '2rem 2rem 1rem 2rem',
                                borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                            }}>
                                {/* Floating close button */}
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                    }}
                                >
                                    <IconButton
                                        onClick={handleCloseAddAccountModal}
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
                                <Box sx={{ position: 'relative' }}>
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
                                        {currentAccount ? "Edit Account" : "Add New Account"}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Scrollable form fields */}
                            <Box sx={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '0 2rem',
                                scrollbarWidth: 'none', // Firefox
                                msOverflowStyle: 'none', // IE
                                '&::-webkit-scrollbar': { // Chrome/Safari
                                    display: 'none'
                                }
                            }}>
                                <Box className='grid grid-cols-2 gap-4 py-4'>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <TextField
                                            fullWidth
                                            label={
                                                <>
                                                Bank Name
                                                {theStar}
                                                </>
                                            }
                                            name="bankName"
                                            value={accountData.bankName}
                                            onChange={handleInputChange}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '6px',
                                                    
                                                },
                                            }}
                                            autoFocus
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        <TextField
                                            fullWidth
                                            label={
                                                <>
                                                Account Holder Name
                                                {theStar}
                                                </>
                                            }
                                            name="accountHolderName"
                                            value={accountData.accountHolderName}
                                            onChange={handleInputChange}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '6px',
                                                    '& fieldset': {
                                                        borderColor: 'rgba(26,60,52,0.2)',
                                                    },
                                                },
                                            }}
                                        />
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
                                                Account Name
                                                {theStar}
                                                </>
                                            }
                                            name="accountName"
                                            value={accountData.accountName}
                                            onChange={handleInputChange}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '6px',
                                                    '& fieldset': {
                                                        borderColor: 'rgba(26,60,52,0.2)',
                                                    },
                                                },
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
                                            label={
                                                <>
                                                Account Number
                                                {theStar}
                                                </>
                                            }
                                            name="accountNumber"
                                            value={accountData.accountNumber}
                                            onChange={handleInputChange}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '6px',
                                                    '& fieldset': {
                                                        borderColor: 'rgba(26,60,52,0.2)',
                                                    },
                                                },
                                            }}
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <p className="mb-1">Account Type {theStar}</p>
                                        <FormControl fullWidth>

                                            <Select
                                                labelId="account-type-label"
                                                label={
                                                    <>
                                                    Account Type
                                                    {theStar}
                                                    </>
                                                }
                                                name="accountType"
                                                value={accountData.accountType}
                                                onChange={(e) => setAccountData(prev => ({
                                                    ...prev,
                                                    accountType: e.target.value as 'MobileBanking' | 'Bank' | 'Cash'
                                                }))}
                                                sx={{
                                                    borderRadius: '6px',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'rgba(26,60,52,0.2)',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#1A3C34',
                                                    },
                                                }}
                                            >
                                                {accountTypes.map((type) => (
                                                    <MenuItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                    >
                                        <p className="mb-1">Opening Balance {theStar}</p>
                                        <TextField
                                            fullWidth
                                            
                                            name="openingBalance"
                                            value={accountData.openingBalance === 0 ? '' : accountData.openingBalance}
                                            onChange={handleNumberInputChange}
                                            type="number"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '6px',
                                                    '& fieldset': {
                                                        borderColor: 'rgba(26,60,52,0.2)',
                                                    },
                                                },
                                            }}
                                            inputProps={{
                                                step: "0.01"
                                            }}
                                        />
                                    </motion.div>
                                </Box>
                            </Box>

                            {/* Fixed footer with buttons */}
                            <Box sx={{
                                position: 'sticky',
                                bottom: 0,
                                zIndex: 1,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                padding: '1.5rem 2rem',
                                borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 2

                                // 
                            }}>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <CancelButton onClick={handleCloseAddAccountModal}>
                                        Cancel
                                    </CancelButton>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <SubmitButton onClick={handleCreateOrUpdateAccount}>
                                        Submit
                                    </SubmitButton>
                                </motion.div>
                            </Box>
                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* View Account Modal */}
            <AnimatePresence>
                {viewAccountModalOpen && currentAccount && (
                    <Modal
                        open={viewAccountModalOpen}
                        onClose={handleCloseViewAccountModal}
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
                                borderRadius: '6px',
                                outline: 'none',
                                width: '600px',
                                maxWidth: '95%',
                                maxHeight: '90vh',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: `
                                linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,252,251,0.98)),
                                radial-gradient(circle at top left, rgba(26,60,52,0.03), transparent 60%)
                            `,
                            }}
                        >
                            {/* Header section - fixed */}
                            <Box sx={{
                                position: 'sticky',
                                top: 0,
                                zIndex: 1,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                padding: '2rem 2rem 1rem 2rem',
                                borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                            }}>
                                {/* Floating close button */}
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                    }}
                                >
                                    <IconButton
                                        onClick={handleCloseViewAccountModal}
                                        sx={{
                                            backgroundColor: '#1A3C34',
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
                                <Box sx={{ position: 'relative' }}>
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
                                        Account Details
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Scrollable content */}
                            <Box sx={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '0 2rem 2rem 2rem',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                '&::-webkit-scrollbar': {
                                    display: 'none'
                                }
                            }}>
                                {isAccountDetailsLoading ? (
                                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <>
                                        {/* Header Section */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3} mt={3}>
                                            <div>
                                                <Typography variant="h4" fontWeight={600} gutterBottom>
                                                    {currentAccount.accountName}
                                                </Typography>
                                                <Typography variant="subtitle1" color="text.secondary">
                                                    {currentAccount.bankName} • {currentAccount.accountNumber}
                                                </Typography>
                                            </div>
                                            <Chip
                                                label={currentAccount.accountType === 'MobileBanking' ? 'Mobile Banking' :
                                                    currentAccount.accountType === 'Bank' ? 'Bank Account' : 'Cash'}
                                                color="primary"
                                                variant="filled"
                                                sx={{
                                                    height: 32,
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    textTransform: 'capitalize'
                                                }}
                                            />
                                        </Stack>

                                        <Divider sx={{ my: 3 }} />

                                        {/* Main Content */}
                                        <Stack spacing={3.5}>
                                            {/* Account Holder Section */}
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <PersonIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
                                                <div>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Account Holder
                                                    </Typography>
                                                    <Typography variant="h6" fontWeight={500}>
                                                        {currentAccount.accountHolderName}
                                                    </Typography>
                                                </div>
                                            </Box>

                                            {/* Bank Details Section */}
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <BankIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
                                                <div>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Bank Details
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {currentAccount.bankName}
                                                    </Typography>
                                                </div>
                                            </Box>

                                            {/* Balance Section */}
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                p: 3,
                                                borderRadius: 2,
                                                bgcolor: 'action.hover'
                                            }}>
                                                <BalanceIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
                                                <div>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Account Balance
                                                    </Typography>
                                                    <Stack direction="row" spacing={4}>
                                                        <div>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Opening Balance
                                                            </Typography>
                                                            <Typography variant="h6" fontWeight={600}>
                                                                {currentAccount.openingBalance.toLocaleString('en-US', {
                                                                    style: 'currency',
                                                                    currency: 'BDT',
                                                                    minimumFractionDigits: 2
                                                                })}
                                                            </Typography>
                                                        </div>
                                                        <div>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Current Balance
                                                            </Typography>
                                                            <Typography variant="h6" fontWeight={600} color="primary">
                                                                {accountDetails?.data?.currentBalance?.toLocaleString('en-US', {
                                                                    style: 'currency',
                                                                    currency: 'BDT',
                                                                    minimumFractionDigits: 2
                                                                }) || 'N/A'}
                                                            </Typography>
                                                        </div>
                                                    </Stack>
                                                </div>
                                            </Box>

                                            {/* Dates Section */}
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <DateIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
                                                <div>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Account Activity
                                                    </Typography>
                                                    <Stack direction="row" spacing={4}>
                                                        <div>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Created On
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {new Date(currentAccount.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </Typography>
                                                        </div>
                                                        <div>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Last Updated
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {new Date(currentAccount.updatedAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
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
                            <Box sx={{
                                position: 'sticky',
                                bottom: 0,
                                zIndex: 1,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                padding: '1.5rem 2rem',
                                borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 2
                            }}>
                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <CancelButton
                                        onClick={handleCloseViewAccountModal}
                                        sx={{
                                            color: '#1A3C34',
                                            borderColor: 'rgba(26,60,52,0.3)',
                                            borderRadius: '6px',
                                            px: 3,
                                            py: 1,
                                            fontWeight: 500,
                                            '&:hover': {
                                                borderColor: '#1A3C34',
                                                backgroundColor: 'rgba(26, 60, 52, 0.04)',
                                            },
                                        }}
                                    >
                                        Close
                                    </CancelButton>
                                </motion.div>

                                {/* <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            handleOpenEditAccountModal(currentAccount);
                                            handleCloseViewAccountModal();
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
                                        Edit Account
                                    </Button>
                                </motion.div> */}
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
                ) : isError ? '' : filteredAccounts.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No accounts found. {searchTerm ? "Try a different search term." : "Create your first account."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<Account>
                            columns={columns}
                            data={filteredAccounts}
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
                onConfirm={() => handleDeleteAccount()}
                title="Delete Account"
                description="Are you sure you want to delete this account? All associated data will be permanently removed."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default AccountList;