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
    Tooltip,
    Modal,
    TextField,
    Select,
    MenuItem,
    Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useGetAllAccountsQuery } from "@/app/store/api/classes/accountApi";
import { useGetFineBookIssuesQuery, usePayBookFineMutation } from "@/app/store/api/classes/bookIssueApi";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { X } from "lucide-react";

// Define schema for fine payment
const FinePaymentSchema = z.object({
    totalAmount: z.number().min(1, "Amount must be greater than 0"),
    payments: z.array(
        z.object({
            accountId: z.number().min(1, "Account is required"),
            paymentAmount: z.number().min(1, "Amount must be greater than 0"),
        })
    ).min(1, "At least one payment is required"),
});

type FinePaymentFormValues = z.infer<typeof FinePaymentSchema>;

interface BookIssue {
    id: number;
    bookId: number;
    studentId: number;
    issueDate: string;
    dueDate: string;
    returnDate: string | null;
    isReturn: boolean;
    fineAmount: number;
    isFinePaid: boolean;
    createdAt: string;
    updatedAt: string;
    book?: {
        title: string;
        author: string;
    };
    student?: {
        name: string;
        classRoll: string;
        studentUniqueId: string;
        class?: {
            name: string;
        };
        session?: {
            name: string;
        };
        section?: {
            name: string;
        };
        stream?: {
            name: string;
        };
    };
    [key: string]: unknown;
}

interface Account {
    id: number;
    accountName: string;
    accountType: string;
    accountNumber: string;
    currentBalance: number;
}

const FineBookIssueList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [currentIssue, setCurrentIssue] = useState<BookIssue | null>(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);

    // Form control
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
        setValue,
    } = useForm<FinePaymentFormValues>({
        resolver: zodResolver(FinePaymentSchema),
        defaultValues: {
            totalAmount: 0,
            payments: [{ accountId: 0, paymentAmount: 0 }],
        },
    });

    // Fetch data
    const {
        data: issuesResponse,
        isLoading,
        isError,
        refetch,
    } = useGetFineBookIssuesQuery({
        page: page + 1,
        size: rowsPerPage,
    });

    const { data: accountsResponse } = useGetAllAccountsQuery({ type: 'All' });
    console.log(accountsResponse)
    const [payBookFine, { isLoading: isPaying }] = usePayBookFineMutation();

    const totalPages = issuesResponse?.meta?.totalPage || 1;
    const issues: BookIssue[] = Array.isArray(issuesResponse?.data) ? issuesResponse.data : issuesResponse?.data || [];
    const accounts: Account[] = accountsResponse?.data || [];

    const handleOpenPaymentModal = (issue: BookIssue) => {
        setCurrentIssue(issue);
        setValue("totalAmount", issue.fineAmount);
        setPaymentModalOpen(true);
    };

    const handleClosePaymentModal = () => {
        setPaymentModalOpen(false);
        setCurrentIssue(null);
        reset();
    };

    const handleAddPayment = () => {
        setValue("payments", [...watch("payments"), { accountId: 0, paymentAmount: 0 }]);
    };

    const handleRemovePayment = (index: number) => {
        const payments = [...watch("payments")];
        payments.splice(index, 1);
        setValue("payments", payments);
    };

    const onSubmit = async (data: FinePaymentFormValues) => {
        if (!currentIssue) return;

        try {
            await payBookFine({
                id: currentIssue.id,
                data: {
                    totalAmount: data.totalAmount,
                    payments: data.payments,
                },
            }).unwrap();

            toastShowing('Fine paid successfully', 'bottom-right', 2000, 'green', 'white');
            refetch();
            handleClosePaymentModal();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                "Failed to pay fine"
            );
            console.error("Error paying fine:", err);
        }
    };

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: BookIssue, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'book',
            header: 'Book',
            render: (row: BookIssue) => row.book?.title || 'N/A'
        },
        {
            key: 'student',
            header: 'Student',
            render: (row: BookIssue) => (
                <Box>
                    <Typography variant="body2">{row.student?.name || 'N/A'}</Typography>
                    <Typography variant="body2" color="textSecondary">
                        {row.student?.class?.name || ''} Roll: {row.student?.classRoll || ''}
                    </Typography>
                </Box>
            )
        },
        {
            key: 'fineAmount',
            header: 'Fine Amount',
            render: (row: BookIssue) => `BDT ${row.fineAmount.toFixed(2)}/-`
        },
        {
            key: 'dueDate',
            header: 'Due Date',
            render: (row: BookIssue) => {
                const dueDate = new Date(row.dueDate);
                return dueDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
        },
        {
            key: 'status',
            header: 'Payment Status',
            render: (row: BookIssue) => (
                <Chip
                    label={row.isFinePaid ? 'Paid' : 'Unpaid'}
                    color={row.isFinePaid ? 'success' : 'error'}
                    size="small"
                />
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: BookIssue) => {
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
                                {!row.isFinePaid && (
                                    <SubmitButton
                                        onClick={() => {
                                            handleOpenPaymentModal(row);
                                            setOpenMenuId(null);
                                        }}
                                    >
                                        Submit
                                    </SubmitButton>
                                )}
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
                title="Book Fine Management"
                buttonText="Refresh"
                onButtonClick={refetch}
            />

            <Paper>
                {isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        Failed to load book fines
                    </Alert>
                ) : issues.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No book fines found.
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<BookIssue>
                            columns={columns}
                            data={issues}
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

            {/* Payment Modal */}
            <AnimatePresence>
                {paymentModalOpen && currentIssue && (
                    <Modal
                        open={paymentModalOpen}
                        onClose={handleClosePaymentModal}
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
                                    onClick={handleClosePaymentModal}
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

                            {/* Header */}
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
                                    Pay Fine
                                </Typography>
                            </Box>

                            {/* Student and Book Info */}
                            <Box sx={{
                                display: 'grid',
                                gap: 2,
                                maxHeight: '70vh', // or whatever max height works for your design
                                overflowY: 'auto',
                                pr: 1, // add some padding to prevent content from being cut off
                                '&::-webkit-scrollbar': {
                                    display: 'none' // Hide scrollbar for Chrome, Safari and Opera
                                },
                                scrollbarWidth: 'none', // Hide scrollbar for Firefox
                                msOverflowStyle: 'none' // Hide scrollbar for IE and Edge
                            }}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body1" fontWeight={500}>
                                        Student: {currentIssue.student?.name || 'N/A'} (Roll: {currentIssue.student?.classRoll || 'N/A'})
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        Book: {currentIssue.book?.title || 'N/A'} by {currentIssue.book?.author || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500} color="error">
                                        Fine Amount: BDT {currentIssue.fineAmount.toFixed(2)}/-
                                    </Typography>
                                </Box>

                                {/* Payment Form */}
                                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                                    <Controller
                                        name="totalAmount"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Total Amount"
                                                type="number"
                                                fullWidth
                                                margin="normal"
                                                error={!!errors.totalAmount}
                                                helperText={errors.totalAmount?.message}
                                                InputProps={{
                                                    readOnly: true,
                                                }}
                                                sx={{
                                                    '& .MuiInputBase-input.Mui-readOnly': {
                                                        backgroundColor: 'rgba(0, 0, 0, 0.06)',
                                                        cursor: 'not-allowed',
                                                    },
                                                }}
                                            />
                                        )}
                                    />


                                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                                        Payment Methods
                                    </Typography>

                                    {watch("payments").map((payment, index) => {
                                        const accountId = payment.accountId;
                                        const currentBalance = accountId ? accounts.find(a => a.id === accountId)?.currentBalance || 0 : 0;

                                        return (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: { xs: 'column', sm: 'row' },
                                                    alignItems: { sm: 'center' },
                                                    gap: 2,
                                                    mb: 2,
                                                    p: 2,
                                                    backgroundColor: '#f9f9f9',
                                                    borderRadius: 1,
                                                    border: '1px solid #eee',
                                                    position: 'relative'
                                                }}
                                            >
                                                {/* Account Field */}
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', width: '100%', }}>
                                                    {/* Account Field */}
                                                    <Box sx={{ flex: 1, pt: (index !== 0 ? 4 : 0) }}>
                                                        <Typography variant="body2" color="textSecondary" mb={0.5}>
                                                            Account
                                                        </Typography>
                                                        <Controller
                                                            name={`payments.${index}.accountId`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select
                                                                    {...field}
                                                                    value={field.value || ''}
                                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                                    displayEmpty
                                                                    fullWidth
                                                                    sx={{
                                                                        '& .MuiSelect-select': {
                                                                            padding: '8px',
                                                                            height: '40px',
                                                                            boxSizing: 'border-box',
                                                                            fontSize: '14px'
                                                                        }
                                                                    }}
                                                                    MenuProps={{
                                                                        PaperProps: {
                                                                            style: {
                                                                                maxHeight: '200px',
                                                                            },
                                                                        },
                                                                    }}
                                                                    error={!!errors.payments?.[index]?.accountId}
                                                                >
                                                                    <MenuItem value="" disabled sx={{ minHeight: '36px' }}>
                                                                        Select Account
                                                                    </MenuItem>
                                                                    {accounts.map((account) => (
                                                                        <MenuItem
                                                                            key={account.id}
                                                                            value={account.id}
                                                                            disabled={watch("payments").some(
                                                                                (p, i) => i !== index && p.accountId === account.id
                                                                            )}
                                                                            sx={{ minHeight: '36px' }}
                                                                        >
                                                                            {account.accountName} ({account.accountNumber})
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            )}
                                                        />
                                                        {errors.payments?.[index]?.accountId?.message && (
                                                            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                                                {errors.payments?.[index]?.accountId?.message}
                                                            </Typography>
                                                        )}
                                                    </Box>

                                                    {/* Amount Field */}
                                                    <Box sx={{ flex: 1 }}>
                                                        {index !== 0 && (
                                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                <IconButton
                                                                    onClick={() => handleRemovePayment(index)}
                                                                    color="error"
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: 'rgba(211, 47, 47, 0.08)',
                                                                        '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.2)' }
                                                                    }}
                                                                    disabled={watch("payments").length === 1}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                        )}
                                                        <Typography variant="body2" color="textSecondary" mb={0.5}>
                                                            Amount
                                                        </Typography>
                                                        <Controller
                                                            name={`payments.${index}.paymentAmount`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <>
                                                                    <input
                                                                        type="number"
                                                                        value={field.value === 0 ? '' : field.value}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value === '' ? 0 : Number(e.target.value);
                                                                            field.onChange(value);
                                                                        }}
                                                                        placeholder="0.00"
                                                                        style={{
                                                                            width: "100%",
                                                                            padding: "8px",
                                                                            height: "40px",
                                                                            borderRadius: "4px",
                                                                            border: errors.payments?.[index]?.paymentAmount ||
                                                                                (field.value > currentBalance && currentBalance > 0)
                                                                                ? "1px solid #d32f2f"
                                                                                : "1px solid #ccc",
                                                                            backgroundColor: "white",
                                                                            fontSize: '14px',
                                                                            boxSizing: 'border-box'
                                                                        }}
                                                                    />
                                                                    {errors.payments?.[index]?.paymentAmount?.message && (
                                                                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                                                            {errors.payments?.[index]?.paymentAmount?.message}
                                                                        </Typography>
                                                                    )}
                                                                    {field.value > currentBalance && currentBalance > 0 && (
                                                                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                                                            Amount exceeds account balance
                                                                        </Typography>
                                                                    )}
                                                                </>
                                                            )}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Box>
                                        );
                                    })}

                                    <Button
                                        onClick={handleAddPayment}
                                        variant="outlined"
                                        sx={{
                                            fontSize: { xs: '0.75rem', sm: '0.875rem', background: '#035140', color: 'white' }
                                        }}
                                    >
                                        Add Payment Method
                                    </Button>

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                                        <CancelButton
                                            onClick={handleClosePaymentModal}

                                        >
                                            Cancel
                                        </CancelButton>
                                        <SubmitButton
                                            type="submit"
                                            disabled={
                                                isPaying ||
                                                watch("payments").reduce((sum, payment) => sum + (payment.paymentAmount || 0), 0) !== watch("totalAmount")
                                            }
                                            sx={{
                                                backgroundColor: '#1A3C34',
                                                '&:hover': {
                                                    backgroundColor: '#0F2922',
                                                },
                                                '&:disabled': {
                                                    backgroundColor: 'rgba(26, 60, 52, 0.5)',
                                                }
                                            }}
                                        >
                                            {isPaying ? (
                                                <CircularProgress size={24} color="inherit" />
                                            ) : (
                                                'Pay Fine'
                                            )}
                                        </SubmitButton>
                                    </Box>
                                </Box>
                            </Box>


                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>
        </Box>
    );
};

export default FineBookIssueList;