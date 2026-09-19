"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
    Box,
    Button,
    Typography,
    Paper,
    Alert,
    IconButton,
    TextField,
    Modal,
    FormControl,
    Chip,
    Tooltip,
    Stack,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Autocomplete,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
    AttachMoney as AmountIcon,
    Notes as NoteIcon,
    CalendarToday as DateIcon,
    Person as TeacherIcon,
    AccountBalance as AccountIcon,
} from '@mui/icons-material';
import { Plus, X, XCircle } from "lucide-react";
import DeleteIcon from "@mui/icons-material/Delete";
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

import { AcceptModal } from "@/components/shared/reusable-component/AcceptModal";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useAcceptTeacherSalaryPayMutation, useBulkAcceptTeacherSalaryPayMutation, useBulkCancelTeacherSalaryPayMutation, useCancelTeacherSalaryPayMutation, useCreateTeacherSalaryPayMutation, useDeleteTeacherSalaryPayMutation, useGetAllTeacherSalaryPaysQuery, useGetTeacherSalaryPayByIdQuery, useGetTeacherUnpaidSalaryAssignQuery, useUpdateTeacherSalaryPayMutation } from "@/app/store/api/teacher/teacherSalaryPayApi";
import { useGetAllTeachersQuery } from "@/app/store/api/teacher/teacherApi";
import { ITeacherSalaryAssign } from "../../../../../types/teacher";
import { theStar } from "@/lib/requiredJSX";
import { validateEmptyFields } from "@/lib/objectModify";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";

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

interface Teacher {
    id: number;
    name: string;
    phone: string;
    email: string;
    teacherUniqueId: string;
    [key: string]: unknown;
}

interface TeacherSalaryAssign {
    id: number;
    teacherId: number;
    month: string;
    year: string;
    baseSalary: number;
    netPayable: number;
    teacher?: Teacher;
    [key: string]: unknown;
}

interface Payment {
    id: number;
    accountId: number;
    paymentAmount: number;
    account?: Account;
    [key: string]: unknown;
}

interface TeacherSalaryPay {
    id: number;
    branchId: number;
    teacherSalaryAssignId: number;
    amount: number;
    note: string;
    status: "Pending" | "Accepted" | "Canceled";
    createdAt: string;
    updatedAt: string;
    Payment: Payment[];
    selected?: boolean;
    teacherSalaryAssign?: TeacherSalaryAssign;
    [key: string]: unknown;
}

const TeacherSalaryPayList = () => {
    const [addSalaryPayModalOpen, setAddSalaryPayModalOpen] = useState<boolean>(false);
    const [viewSalaryPayModalOpen, setViewSalaryPayModalOpen] = useState<boolean>(false);
    const [salaryPayData, setSalaryPayData] = useState({
        teacherSalaryAssignId: 0,
        amount: 0,
        note: "",
        payments: [{ accountId: 0, paymentAmount: 0 }], // Default one empty payment
    });
    const [selectedBulkActionType, setSelectedBulkActionType] = useState<"accept" | "cancel" | "">("");

    const [currentSalaryPay, setCurrentSalaryPay] = useState<TeacherSalaryPay | null>(null);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [confirmAction, setConfirmAction] = useState<{
        open: boolean;
        action: 'accept' | 'cancel' | null;
        salaryPayId: number | null;
    }>({
        open: false,
        action: null,
        salaryPayId: null,
    });

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllTeacherSalaryPaysQuery({
        page,
        size: rowsPerPage,
        search: searchTerm,
    });

    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
    const [filteredStudents, setFilteredStudents] = useState<TeacherSalaryPay[]>([]);

    const {
        data: unpaidAssignments,
        isLoading: isLoadingAssignments,
    } = useGetTeacherUnpaidSalaryAssignQuery(selectedTeacherId || 0, {
        skip: !selectedTeacherId,
    });

    // Get accounts for dropdowns
    const { data: accountsResponse } = useGetAllAccountsQuery({ type: 'All' });
    // Get teachers
    const { data: teachersResponse } = useGetAllTeachersQuery({});

    // Get salary pay details for view modal
    const { isLoading: isSalaryPayDetailsLoading } = useGetTeacherSalaryPayByIdQuery(
        currentSalaryPay?.id || 0,
        { skip: !currentSalaryPay?.id }
    );

    // console.log(salaryPayDetails)

    const {
        isDeleteModalOpen,
        itemToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    const [createSalaryPay, { isLoading: isCreatingSalaryPay }] = useCreateTeacherSalaryPayMutation();
    const [updateSalaryPay, { isLoading: isUpdatingSalaryPay }] = useUpdateTeacherSalaryPayMutation();
    const [acceptSalaryPay] = useAcceptTeacherSalaryPayMutation();
    const [cancelSalaryPay] = useCancelTeacherSalaryPayMutation();
    const [deleteSalaryPay] = useDeleteTeacherSalaryPayMutation();

    const [bulkAccept] =
        useBulkAcceptTeacherSalaryPayMutation();
    const [bulkCancel] =
        useBulkCancelTeacherSalaryPayMutation();

    const accounts = useMemo(() => accountsResponse?.data || [], [accountsResponse?.data]);
    const salaryPays = useMemo(
    () => responseData?.data || [],
    [responseData?.data]
);
    const totalPages = responseData?.meta?.totalPage || 1;

    useEffect(() => {
        if (salaryPays) {
            const filtered = salaryPays?.map((student: TeacherSalaryPay) => ({
                ...student,
                selected: false,
            }));
            setFilteredStudents(filtered);
        }
    }, [salaryPays]);

    // Create maps for quick lookup
    const accountMap = useMemo(() => {
        const map = new Map<number, Account>();
        accounts.forEach((account: Account) => {
            map.set(account.id, account);
        });
        return map;
    }, [accounts]);

    // const teacherMap = useMemo(() => {
    //     const map = new Map<number, Teacher>();
    //     teachers.forEach((teacher: Teacher) => {
    //         map.set(teacher.id, teacher);
    //     });
    //     return map;
    // }, [teachers]);

    const [approveSalaryPay, setApproveSalaryPay] = useState(false);
    const [cancelSalaryPayConfirm, setCancelSalaryPayConfirm] = useState(false);

    const handleOpenConfirmation = (action: 'accept' | 'cancel', salaryPayId: number) => {
        if (action === 'accept') {
            setApproveSalaryPay(true);
            setCancelSalaryPayConfirm(false);
        } else {
            setApproveSalaryPay(false);
            setCancelSalaryPayConfirm(true);
        }
        setConfirmAction({
            open: true,
            action,
            salaryPayId,
        });
    };

    const handleCloseConfirmation = () => {
        setApproveSalaryPay(false);
        setCancelSalaryPayConfirm(false);
        setConfirmAction({
            open: false,
            action: null,
            salaryPayId: null,
        });
    };

    const handleConfirmAction = async () => {
        if (!confirmAction.salaryPayId) return;

        try {
            if (confirmAction.action === 'accept') {
                await acceptSalaryPay(confirmAction.salaryPayId).unwrap();
                toastShowing('Salary payment accepted successfully', 'bottom-right', 2000, 'green', 'white');
            } else if (confirmAction.action === 'cancel') {
                await cancelSalaryPay(confirmAction.salaryPayId).unwrap();
                toastShowing('Salary payment cancelled successfully', 'bottom-right', 2000, 'green', 'white');
            }
            refetch();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                `Failed to ${confirmAction.action} salary payment`
            );
        } finally {
            handleCloseConfirmation();
        }
    };

    const handleOpenAddSalaryPayModal = () => {
        setCurrentSalaryPay(null);
        setSelectedTeacherId(null);
        setSalaryPayData({
            teacherSalaryAssignId: 0,
            amount: 0,
            note: "",
            payments: [{ accountId: 0, paymentAmount: 0 }], // Always start with one payment
        });
        setAddSalaryPayModalOpen(true);
    };



    const handleOpenEditSalaryPayModal = (salaryPay: TeacherSalaryPay) => {
        setCurrentSalaryPay(salaryPay);
        setSelectedTeacherId(salaryPay.teacherSalaryAssign?.teacherId || null);
        setSalaryPayData({
            teacherSalaryAssignId: salaryPay.teacherSalaryAssignId,
            amount: salaryPay.amount,
            note: salaryPay.note || "",
            payments: salaryPay.Payment?.map(p => ({
                accountId: p.accountId,
                paymentAmount: p.paymentAmount
            })) || [],
        });
        setAddSalaryPayModalOpen(true);
    };

    const handleOpenViewSalaryPayModal = (salaryPay: TeacherSalaryPay) => {
        setCurrentSalaryPay(salaryPay);
        setViewSalaryPayModalOpen(true);
    };

    const handleCloseAddSalaryPayModal = () => {
        setAddSalaryPayModalOpen(false);
        setSalaryPayData({
            teacherSalaryAssignId: 0,
            amount: 0,
            note: "",
            payments: [],
        });
        setCurrentSalaryPay(null);
        setSelectedTeacherId(null);
    };

    const handleCloseViewSalaryPayModal = () => {
        setViewSalaryPayModalOpen(false);
        setCurrentSalaryPay(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSalaryPayData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (/^\d*\.?\d*$/.test(value)) {
            setSalaryPayData(prev => ({
                ...prev,
                [name]: value === "" ? 0 : parseFloat(value)
            }));
        }
    };

    // const handleAddPayment = () => {
    //     if (!currentPayment.accountId || currentPayment.paymentAmount <= 0) {
    //         toastShowing('Please select an account and enter a valid payment amount', 'bottom-right', 2000, 'red', 'white');
    //         return;
    //     }

    //     setSalaryPayData(prev => ({
    //         ...prev,
    //         payments: [...prev.payments, currentPayment],
    //     }));

    //     setCurrentPayment({
    //         accountId: 0,
    //         paymentAmount: 0,
    //     });
    // };

    const handleRemovePayment = (index: number) => {
        setSalaryPayData(prev => ({
            ...prev,
            payments: prev.payments.filter((_, i) => i !== index),
        }));
    };

    // const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const { name, value } = e.target;
    //     if (name === 'paymentAmount' && /^\d*\.?\d*$/.test(value)) {
    //         setCurrentPayment(prev => ({
    //             ...prev,
    //             [name]: value === "" ? 0 : parseFloat(value)
    //         }));
    //     } else {
    //         setCurrentPayment(prev => ({
    //             ...prev,
    //             [name]: value
    //         }));
    //     }
    // };

    const handleCreateOrUpdateSalaryPay = async () => {
        try {
            // Validate required fields
            if (!salaryPayData.teacherSalaryAssignId || salaryPayData.amount <= 0) {
                toastShowing('Teacher and valid Amount are required', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            if (salaryPayData.payments.length === 0) {
                toastShowing('At least one payment is required', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            const totalPayments = salaryPayData.payments.reduce((sum, payment) => sum + payment.paymentAmount, 0);
            if (Math.abs(totalPayments - salaryPayData.amount) > 0.01) {
                toastShowing('Sum of payments must equal the total amount', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            const modifiedPayload = validateEmptyFields(salaryPayData);

            if (currentSalaryPay) {
                // Update existing salary pay
                await updateSalaryPay({
                    id: currentSalaryPay.id,
                    ...modifiedPayload
                }).unwrap();
                toastShowing('Salary payment updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new salary pay
                await createSalaryPay(modifiedPayload).unwrap();
                toastShowing('Salary payment created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddSalaryPayModal();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentSalaryPay ? "Failed to update salary payment" : "Failed to create salary payment")
            );
            console.error("Error saving salary payment:", err);
        }
    };

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const handleDeleteSalaryPay = async () => {
        await handleDeleteConfirmation(
            async (salaryPayId) => {
                await deleteSalaryPay(salaryPayId).unwrap();
                refetch();
            },
            {
                successMessage: "Salary payment deleted successfully",
                errorMessage: "Failed to delete salary payment",
            }
        );
    };

    const handleBulkSubmit = async () => {
        try {
            const selectedItems = filteredStudents?.filter(item => item.selected === true && item?.id)
            const ids = selectedItems.reduce((all, current) => [...all, current.id], [])
            if (selectedBulkActionType === "accept") {
                await bulkAccept(ids).unwrap();

                toastShowing(
                    "Class fee payments accepted successfully",
                    "bottom-right",
                    2000,
                    "green",
                    "white"
                );
            }
            if (selectedBulkActionType === "cancel") {
                await bulkCancel(ids).unwrap();

                toastShowing(
                    "Class fee payments canceled successfully",
                    "bottom-right",
                    2000,
                    "green",
                    "white"
                );
            }
            //   handleCloseBulkModal();
            refetch();
        } catch (err) {
            const errorMessage =
                (err as { data?: { message?: string } })?.data?.message ||
                (err as Error).message ||
                "An error occurred";

            toastShowing(errorMessage, "bottom-right", 2000, "red", "white");
            console.error("Error saving class fee assignment:", err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Canceled':
                return 'error';
            case 'Accepted':
                return 'success';
            default:
                return 'warning';
        }
    };

    const columns = [
        {
            key: "checkbox",
            header: (
                <input
                    type="checkbox"
                    onChange={(e) => {
                        console.log({ event: e.target.checked }, filteredStudents)
                        const isChecked = e.target.checked;
                        setFilteredStudents((prev) =>
                            prev.map((student) => ({
                                ...student,
                                selected: isChecked,
                            }))
                        );
                    }}

                    checked={
                        filteredStudents.length > 0 &&
                        filteredStudents.every((student) => student.selected)
                    }
                />
            ),
            render: (row: TeacherSalaryPay) => (
                <input
                    type="checkbox"
                    checked={row?.selected || false}
                    onChange={(e) => {
                        console.log({ e: e.target.checked }, row)
                        const isChecked = e.target.checked;
                        setFilteredStudents((prev) =>
                            prev.map((student) =>
                                student.id === row.id
                                    ? { ...student, selected: isChecked }
                                    : student
                            )
                        );
                    }}
                />
            ),
        },
        {
            key: 'sl',
            header: 'SL',
            render: (row: TeacherSalaryPay, index: number) => (page - 1) * rowsPerPage + index + 1
        },
        {
            key: 'teacher',
            header: 'Teacher',
            render: (row: TeacherSalaryPay) => {
                const teacher = row.teacherSalaryAssign?.teacher;
                return (
                    <Box>
                        <Typography variant="body2" fontWeight={500}>
                            {teacher?.name || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {teacher?.teacherUniqueId || 'N/A'}
                        </Typography>
                    </Box>
                );
            }
        },
        {
            key: 'month',
            header: 'Month/Year',
            render: (row: TeacherSalaryPay) => {
                return `${row.teacherSalaryAssign?.month || 'N/A'} ${row.teacherSalaryAssign?.year || ''}`;
            }
        },
        {
            key: 'status',
            header: 'Status',
            render: (row: TeacherSalaryPay) => {
                return (
                    <Chip
                        label={row.status}
                        color={getStatusColor(row.status)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                );
            }
        },
        {
            key: 'createdAt',
            header: 'Date',
            render: (row: TeacherSalaryPay) => {
                const date = new Date(row.createdAt);
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });
            }
        },
        {
            key: 'amount',
            header: 'Paid Amount',
            render: (row: TeacherSalaryPay) => `BDT ${row.amount.toFixed(2)}/-`
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: TeacherSalaryPay) => {
                return (
                    <Tooltip
                        title={
                            <Paper
                                elevation={3}
                                sx={{
                                    backgroundColor: 'white',
                                    padding: '6px 0',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    minWidth: '140px',
                                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <Button
                                    onClick={() => {
                                        handleOpenViewSalaryPayModal(row);
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

                                {row.status === 'Pending' && (
                                    <>
                                        <Button
                                            onClick={() => {
                                                handleOpenEditSalaryPayModal(row);
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
                                            onClick={() => {
                                                handleOpenConfirmation('accept', row.id);
                                                setOpenMenuId(null);
                                            }}
                                            size="small"
                                            sx={{
                                                color: "#10B981",
                                                textTransform: 'none',
                                                fontSize: '14px',
                                                fontWeight: 400,
                                                justifyContent: 'flex-start',
                                                padding: '6px 16px',
                                                "&:hover": {
                                                    backgroundColor: "rgba(16, 185, 129, 0.08)",
                                                },
                                            }}
                                        >
                                            Accept
                                        </Button>

                                        <Button
                                            onClick={() => {
                                                handleOpenConfirmation('cancel', row.id);
                                                setOpenMenuId(null);
                                            }}
                                            size="small"
                                            sx={{
                                                color: "#EF4444",
                                                textTransform: 'none',
                                                fontSize: '14px',
                                                fontWeight: 400,
                                                justifyContent: 'flex-start',
                                                padding: '6px 16px',
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
                                        textTransform: 'none',
                                        fontSize: '14px',
                                        fontWeight: 400,
                                        justifyContent: 'flex-start',
                                        padding: '6px 16px',
                                        "&:hover": {
                                            backgroundColor: "rgba(220, 38, 38, 0.08)",
                                        },
                                        "&.Mui-disabled": {
                                            color: "rgba(220, 38, 38, 0.5)",
                                            backgroundColor: 'transparent'
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
                title="Teacher Salary Payments"
                buttonText="New Payment"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddSalaryPayModal}
            />

            <div className="flex w-full items-center mb-2 gap-4">
                <div className="flex items-center gap-2 min-w-[200px]">
                    <FormControl fullWidth size="small">
                        <InputLabel>Bulk Action</InputLabel>
                        <Select
                            name="sessionYear"
                            value={selectedBulkActionType}
                            onChange={(e) => setSelectedBulkActionType(e.target.value)}
                            label="Session Year"
                            disabled={!filteredStudents?.find((student) => student.selected)}
                        >
                            <MenuItem value="accept">Accept All</MenuItem>
                            <MenuItem value="cancel">Cancel All</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        onClick={handleBulkSubmit}
                        disabled={!filteredStudents?.find((student) => student.selected) || !selectedBulkActionType}
                        sx={{
                            backgroundColor: '#035140',
                            '&:hover': {
                                backgroundColor: '#024030',
                            },
                        }}
                    >
                        Apply
                    </Button>
                </div>

                <Box sx={{}}>
                    <SearchingInputField
                        placeholder="Search payments..."
                        onSearch={(term) => {
                            setSearchTerm(term);
                            setPage(1);
                        }}
                        debounceTime={300}
                        maxWidth={400}
                        height="36px"
                    />
                </Box>
            </div>

            {/* Action Confirmation Dialog */}
            {confirmAction.action === 'accept' ? (
                <AcceptModal
                    confirmText="Accept"
                    cancelText="Cancel"
                    open={approveSalaryPay}
                    onClose={handleCloseConfirmation}
                    onConfirm={() => handleConfirmAction()}
                    title="Accept Confirmation"
                    description="Are you sure you want to accept this salary payment? This action cannot be undone."
                    isLoading={isDeleting}
                />
            ) : (
                <DeleteConfirmationModal
                    confirmText="Ok"
                    cancelText="Cancel"
                    open={cancelSalaryPayConfirm}
                    onClose={handleCloseConfirmation}
                    onConfirm={() => handleConfirmAction()}
                    title="Cancel Confirmation"
                    description="Are you sure you want to cancel this salary payment? This action cannot be undone."
                    isLoading={isDeleting}
                />
            )}

            {/* Add/Edit Salary Pay Modal */}
            <AnimatePresence>
                {addSalaryPayModalOpen && (
                    <Dialog
                        open={addSalaryPayModalOpen}
                        onClose={handleCloseAddSalaryPayModal}
                        maxWidth="md"
                        fullWidth
                        sx={{
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
                        >
                            <DialogTitle sx={{
                                bgcolor: "white",
                                color: "black",
                                py: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                            }}>
                                <Typography variant="h6">
                                    {currentSalaryPay ? "Edit Salary Payment" : "Add Salary Payment"}
                                </Typography>
                                <IconButton onClick={handleCloseAddSalaryPayModal} sx={{ color: 'red' }}>
                                    <XCircle />
                                </IconButton>
                            </DialogTitle>

                            <DialogContent sx={{ pt: 3 }}>
                                <Box className='grid gap-4 py-4'>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        <FormControl fullWidth>
                                            <Autocomplete
                                                options={teachersResponse?.data || []}
                                                getOptionLabel={(option: Teacher) =>
                                                    `${option?.name || 'Unknown Teacher'} - ID: ${option.teacherUniqueId || ''}`
                                                }
                                                value={teachersResponse?.data?.find(
                                                    (teacher: Teacher) => teacher.id === selectedTeacherId
                                                ) || null}
                                                onChange={(event, newValue: Teacher | null) => {
                                                    setSelectedTeacherId(newValue?.id || null);
                                                    // Reset salary assignment when teacher changes
                                                    setSalaryPayData(prev => ({
                                                        ...prev,
                                                        teacherSalaryAssignId: 0,
                                                        amount: 0,
                                                        payments: currentSalaryPay ? prev.payments : [{ accountId: 0, paymentAmount: 0 }]
                                                    }));
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label={
                                                            <>
                                                                Select Teacher
                                                                {theStar}
                                                            </>
                                                        }
                                                        variant="outlined"
                                                    />
                                                )}
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                            />
                                        </FormControl>

                                        {/* Month Selection Dropdown */}
                                        <FormControl fullWidth>
                                            {/* <InputLabel id="month-assign-label">Select Month&apos;s Salary {theStar}</InputLabel>
                                            <Select
                                                labelId="month-assign-label"
                                                label="Select Month's Salary"
                                                value={salaryPayData.teacherSalaryAssignId}
                                                onChange={(e) => {
                                                    const assignId = Number(e.target.value);
                                                    const assignment = unpaidAssignments?.data?.find((a: ITeacherSalaryAssign) => a.id === assignId);
                                                    setSalaryPayData(prev => ({
                                                        ...prev,
                                                        teacherSalaryAssignId: assignId,
                                                        amount: assignment?.netPayable || 0,
                                                    }));
                                                }}
                                                disabled={!selectedTeacherId || isLoadingAssignments}
                                            >
                                                {isLoadingAssignments ? (
                                                    <MenuItem disabled>Loading unpaid months...</MenuItem>
                                                ) : isAssignmentsError ? (
                                                    <MenuItem disabled>Error loading unpaid months</MenuItem>
                                                ) : unpaidAssignments?.data?.length ? (
                                                    unpaidAssignments?.data?.map((assignment: ITeacherSalaryAssign) => (
                                                        <MenuItem key={assignment.id} value={assignment.id}>
                                                            {assignment.month} {assignment.year} - Amount: {assignment.netPayable?.toFixed(2) || '0.00'}
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem disabled>
                                                        {selectedTeacherId ? 'No unpaid months found' : 'Select a teacher first'}
                                                    </MenuItem>
                                                )}
                                            </Select> */}

                                            <Autocomplete
                                                options={unpaidAssignments?.data || []}
                                                value={unpaidAssignments?.data?.find((a: ITeacherSalaryAssign) => a.id === salaryPayData.teacherSalaryAssignId) || null}
                                                onChange={(event, newValue: ITeacherSalaryAssign | null) => {
                                                    setSalaryPayData(prev => ({
                                                        ...prev,
                                                        teacherSalaryAssignId: newValue?.id || 0,
                                                        amount: newValue?.netPayable || 0,
                                                    }));
                                                }}
                                                disabled={!selectedTeacherId || isLoadingAssignments}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label={
                                                            <>
                                                                Select Month&apos;s Salary
                                                                {theStar}
                                                            </>
                                                        }
                                                        variant="outlined"
                                                    />
                                                )}
                                                getOptionLabel={(option: ITeacherSalaryAssign) =>
                                                    `${option.month} ${option.year} - Amount: ${option.netPayable?.toFixed(2) || '0.00'}`
                                                }
                                                isOptionEqualToValue={(option: ITeacherSalaryAssign, value: ITeacherSalaryAssign) =>
                                                    option.id === value.id
                                                }
                                            />
                                        </FormControl>

                                        <TextField
                                            fullWidth
                                            label="Amount"
                                            name="amount"
                                            value={salaryPayData.amount === 0 ? "" : salaryPayData.amount}
                                            onChange={handleNumberInputChange}
                                            type="number"
                                            disabled
                                            inputProps={{
                                                step: "0.01"
                                            }}
                                        />
                                    </div>

                                    <TextField
                                        fullWidth
                                        label="Note (Optional)"
                                        name="note"
                                        value={salaryPayData.note}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={3}
                                    />

                                    {/* Payment Details Section */}
                                    <Box>
                                        <Typography fontWeight={600} mb={2} fontSize={{ xs: '0.875rem', sm: '1rem' }}>
                                            Payment Methods {theStar}
                                        </Typography>

                                        {salaryPayData.payments.map((payment, index) => {
                                            const account = accountMap.get(payment.accountId);
                                            const currentBalance = account?.currentBalance || 0;

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
                                                        border: '1px solid #eee'
                                                    }}
                                                >
                                                    <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 }, width: '100%' }}>
                                                        <Typography variant="body2" color="textSecondary" mb={0.5}>
                                                            Account
                                                        </Typography>
                                                        <select
                                                            value={payment.accountId}
                                                            onChange={(e) => {
                                                                const newValue = Number(e.target.value);
                                                                const updatedPayments = [...salaryPayData.payments];
                                                                updatedPayments[index].accountId = newValue;
                                                                setSalaryPayData(prev => ({
                                                                    ...prev,
                                                                    payments: updatedPayments
                                                                }));
                                                            }}
                                                            style={{
                                                                width: "100%",
                                                                padding: "8px",
                                                                borderRadius: "4px",
                                                                border: "1px solid #ccc",
                                                                backgroundColor: "white",
                                                                fontSize: '14px'
                                                            }}
                                                        >
                                                            <option value="">Select payment account</option>
                                                            {accounts.map((account: Account) => {
                                                                const isDisabled = salaryPayData.payments.some(
                                                                    (p, i) => i !== index && p.accountId === account.id
                                                                );

                                                                return (
                                                                    <option
                                                                        key={account.id}
                                                                        value={account.id}
                                                                        disabled={isDisabled}
                                                                    >
                                                                        {account.accountType} - {account.currentBalance}
                                                                        {isDisabled ? " (already selected)" : ""}
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                    </Box>

                                                    <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 150 }, width: '100%' }}>
                                                        <Typography variant="body2" color="textSecondary" mb={0.5}>
                                                            Amount
                                                        </Typography>
                                                        <input
                                                            type="number"
                                                            value={payment.paymentAmount === 0 ? "" : payment.paymentAmount}
                                                            onChange={(e) => {
                                                                const value = e.target.value === "" ? 0 : Number(e.target.value);
                                                                // Enforce max value
                                                                const limitedValue = Math.min(value, salaryPayData?.amount);

                                                                const updatedPayments = [...salaryPayData.payments];
                                                                updatedPayments[index].paymentAmount = limitedValue;
                                                                setSalaryPayData(prev => ({
                                                                    ...prev,
                                                                    payments: updatedPayments
                                                                }));
                                                            }}
                                                            placeholder="0.00"
                                                            style={{
                                                                width: "100%",
                                                                padding: "8px",
                                                                borderRadius: "4px",
                                                                border: payment.paymentAmount > currentBalance
                                                                    ? "1px solid #d32f2f"
                                                                    : "1px solid #ccc",
                                                                backgroundColor: "white",
                                                                fontSize: '14px'
                                                            }}
                                                            max={salaryPayData?.amount}
                                                        />
                                                    </Box>

                                                    {
                                                        index !== 0 && <Box sx={{
                                                            alignSelf: { xs: 'flex-end', sm: 'flex-end' },
                                                            mb: { xs: 0, sm: 1 },
                                                            mt: { xs: 1, sm: 0 }
                                                        }}>
                                                            <IconButton
                                                                onClick={() => {
                                                                    if (salaryPayData.payments.length === 1) {
                                                                        toast.error("At least one payment method is required");
                                                                        return;
                                                                    }
                                                                    handleRemovePayment(index);
                                                                }}
                                                                color="error"
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: 'rgba(211, 47, 47, 0.08)',
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(211, 47, 47, 0.2)'
                                                                    }
                                                                }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    }
                                                </Box>
                                            );
                                        })}

                                        <Button
                                            startIcon={<AddIcon />}
                                            variant="outlined"

                                            sx={{
                                                mt: 1,
                                                py: 1,
                                                fontSize: { xs: '0.75rem', sm: '0.875rem', background: '#035140', color: 'white' }
                                            }}
                                            onClick={() => {
                                                setSalaryPayData(prev => ({
                                                    ...prev,
                                                    payments: [...prev.payments, { accountId: 0, paymentAmount: 0 }]
                                                }));
                                            }}
                                        >
                                            Add Payment Method
                                        </Button>

                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle1">
                                                Total Payment: {salaryPayData.payments.reduce((sum, payment) => sum + payment.paymentAmount, 0).toFixed(2)}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Remaining: {(salaryPayData.amount - salaryPayData.payments.reduce((sum, payment) => sum + payment.paymentAmount, 0)).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </DialogContent>

                            <DialogActions sx={{ px: { xs: 1, sm: 3 }, pb: 2 }}>
                                <CancelButton
                                    onClick={handleCloseAddSalaryPayModal}

                                >
                                    Cancel
                                </CancelButton>

                                <SubmitButton
                                    onClick={handleCreateOrUpdateSalaryPay}
                                    disabled={(isCreatingSalaryPay || isUpdatingSalaryPay) ||
                                        !salaryPayData.teacherSalaryAssignId ||
                                        salaryPayData.amount <= 0 ||
                                        salaryPayData.payments.length === 0 ||
                                        Math.abs(salaryPayData.payments.reduce((sum, payment) => sum + payment.paymentAmount, 0) - salaryPayData.amount) > 0.01}
                                    sx={{
                                        backgroundColor: '#035140',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#023a2d',
                                        },
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        padding: { xs: '6px 8px', sm: '6px 12px' }
                                    }}
                                >
                                    {isCreatingSalaryPay || isUpdatingSalaryPay ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : currentSalaryPay ? (
                                        "Update"
                                    ) : (
                                        "Submit"
                                    )}
                                </SubmitButton>
                            </DialogActions>
                        </motion.div>
                    </Dialog>
                )}
            </AnimatePresence>

            {/* View Salary Pay Modal */}
            <AnimatePresence>
                {viewSalaryPayModalOpen && currentSalaryPay && (
                    <Modal
                        open={viewSalaryPayModalOpen}
                        onClose={handleCloseViewSalaryPayModal}
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
                                        onClick={handleCloseViewSalaryPayModal}
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
                                        Salary Payment Details
                                    </Typography>
                                    <Chip
                                        label={currentSalaryPay.status}
                                        color={getStatusColor(currentSalaryPay.status)}
                                        variant="outlined"
                                        sx={{
                                            height: 32,
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            textTransform: 'capitalize',
                                            pl: 1,
                                            ml: 4
                                        }}
                                    />
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
                                {isSalaryPayDetailsLoading ? (
                                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <>
                                        {/* Main Content */}
                                        <Stack spacing={3.5}>
                                            {/* Teacher Details Section */}
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <TeacherIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
                                                <div>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Teacher Information
                                                    </Typography>
                                                    {currentSalaryPay.teacherSalaryAssign?.teacher ? (
                                                        <>
                                                            <Typography variant="body1" fontWeight={500}>
                                                                {currentSalaryPay.teacherSalaryAssign.teacher.name}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {currentSalaryPay.teacherSalaryAssign.teacher.phone} • {currentSalaryPay.teacherSalaryAssign.teacher.email}
                                                            </Typography>
                                                        </>
                                                    ) : (
                                                        <Typography variant="body1" color="text.secondary">
                                                            Loading teacher information...
                                                        </Typography>
                                                    )}
                                                </div>
                                            </Box>

                                            {/* Salary Information Section */}
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <AmountIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
                                                <div>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Salary Information
                                                    </Typography>
                                                    <Stack direction="row" spacing={4} mt={1}>
                                                        <div>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Month/Year
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {currentSalaryPay.teacherSalaryAssign?.month} {currentSalaryPay.teacherSalaryAssign?.year}
                                                            </Typography>
                                                        </div>
                                                        <div>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Net Payable
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {currentSalaryPay.teacherSalaryAssign?.netPayable?.toLocaleString('en-US', {
                                                                    style: 'currency',
                                                                    currency: 'BDT',
                                                                    minimumFractionDigits: 2
                                                                }) || 'N/A'}
                                                            </Typography>
                                                        </div>
                                                        <div>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Paid Amount
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight={600} color="primary">
                                                                {currentSalaryPay.amount.toLocaleString('en-US', {
                                                                    style: 'currency',
                                                                    currency: 'BDT',
                                                                    minimumFractionDigits: 2
                                                                })}
                                                            </Typography>
                                                        </div>
                                                    </Stack>
                                                </div>
                                            </Box>

                                            {/* Note Section */}
                                            {currentSalaryPay.note && (
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                                    <NoteIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem', mt: 0.5 }} />
                                                    <div>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            Payment Note
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                                            {currentSalaryPay.note}
                                                        </Typography>
                                                    </div>
                                                </Box>
                                            )}

                                            {/* Payment Details Section */}
                                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <AccountIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Payment Details
                                                    </Typography>
                                                </Box>
                                                <TableContainer component={Paper}>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Account</TableCell>
                                                                <TableCell align="right">Amount</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {currentSalaryPay.Payment?.map((payment, index) => {
                                                                const account = payment.account || accountMap.get(payment.accountId);
                                                                return (
                                                                    <TableRow key={index}>
                                                                        <TableCell>
                                                                            {account ? (
                                                                                <>
                                                                                    {account.bankName} - {account.accountName}
                                                                                    <Typography variant="body2" color="textSecondary">
                                                                                        {account.accountNumber}
                                                                                    </Typography>
                                                                                </>
                                                                            ) : 'Unknown Account'}
                                                                        </TableCell>
                                                                        <TableCell align="right">
                                                                            {payment.paymentAmount.toLocaleString('en-US', {
                                                                                style: 'currency',
                                                                                currency: 'BDT',
                                                                                minimumFractionDigits: 2
                                                                            })}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                            <TableRow>
                                                                <TableCell sx={{ fontWeight: 500 }}>Total</TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: 500 }}>
                                                                    {currentSalaryPay.Payment?.reduce((sum, payment) => sum + payment.paymentAmount, 0).toLocaleString('en-US', {
                                                                        style: 'currency',
                                                                        currency: 'BDT',
                                                                        minimumFractionDigits: 2
                                                                    })}
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>

                                            {/* Dates Section */}
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <DateIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
                                                <div>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Payment Timeline
                                                    </Typography>
                                                    <Stack direction="row" spacing={4} mt={1}>
                                                        <div>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Created On
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {new Date(currentSalaryPay.createdAt).toLocaleString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </Typography>
                                                        </div>
                                                        <div>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Last Updated
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {new Date(currentSalaryPay.updatedAt).toLocaleString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
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
                                        onClick={handleCloseViewSalaryPayModal}
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

                                {/* {currentSalaryPay.status === 'Pending' && (
                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            variant="contained"
                                            onClick={() => {
                                                handleOpenEditSalaryPayModal(currentSalaryPay);
                                                handleCloseViewSalaryPayModal();
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
                                            Edit Payment
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
                        Failed to load salary payments. Please try again.
                    </Alert>
                ) : salaryPays.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No salary payments found. {searchTerm ? "Try a different search term." : "Create your first salary payment."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<TeacherSalaryPay>
                            columns={columns}
                            data={filteredStudents}
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
                onConfirm={() => handleDeleteSalaryPay()}
                title="Delete Salary Payment"
                description="Are you sure you want to delete this salary payment record? This action cannot be undone."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default TeacherSalaryPayList;