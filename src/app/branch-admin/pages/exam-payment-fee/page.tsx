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
    // AccountBalance as AccountIcon,
    Person as StudentIcon,
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

import { validateEmptyFields } from "@/lib/objectModify";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import { useGetFilteredStudentsQuery } from "@/app/store/api/student/studentApi";
import { useAcceptExamFeePayMutation, useBulkAcceptExamFeePayMutation, useBulkCancelExamFeePayMutation, useCancelExamFeePayMutation, useCreateExamFeePayMutation, useDeleteExamFeePayMutation, useGetAllExamFeePaysQuery, useGetExamFeePayByIdQuery, useGetUnpaidExamFeesByStudentIdQuery, useUpdateExamFeePayMutation } from "@/app/store/api/exams/examFeeDiscountApi";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface StudentFee {
    id: number;
    branchId: number;
    studentId: number;
    month: string;
    year: string;
    classFee: number;
    discountType: string;
    discount: number;
    pay: number;
    netPayable: number;
    status: string;
    paidAt: string | null;
    note: string | null;
    createdAt: string;
    updatedAt: string;
}

interface ClassItem {
    id: number;
    name: string;
}
interface Session {
    id: number;
    name: string;
}
interface Section {
    id: number;
    name: string;
}
interface Stream {
    id: number;
    name: string;
}

interface Student {
    id: number;
    branchId: number;
    type: string;
    migrateStudentId: number | null;
    sessionYearId: number;
    name: string;
    studentUniqueId: string;
    phone: string;
    email: string;
    classNameId: number;
    classRoll: number;
    sectionNameId: number;
    streamNameId: number;
    discountType: string;
    discount: number;
    studentClassFeeDiscountId: number | null;
    gender: string;
    religion: string;
    dob: string;
    bloodGroup: string;
    address: string;
    fatherName: string;
    motherName: string;
    parentPhone: string;
    count: number;
    blockDate: string | null;
    active: boolean;
    avatar: string;
    createdAt: string;
    updatedAt: string;
    class: {
        id: number;
        branchId: number;
        name: string;
        createdAt: string;
        updatedAt: string;
    };
    section: {
        id: number;
        branchId: number;
        name: string;
        createdAt: string;
        updatedAt: string;
    };
    session: {
        id: number;
        branchId: number;
        name: string;
        createdAt: string;
        updatedAt: string;
    };
    stream: {
        id: number;
        branchId: number;
        name: string;
        createdAt: string;
        updatedAt: string;
    };
}

interface ExamFeeAssign {
    id: number;
    branchId: number;
    studentId: number;
    month: string;
    year: string;
    examFee: number;
    discountType: string;
    discount: number;
    pay: number;
    netPayable: number;
    status: string;
    paidAt: string | null;
    note: string | null;
    createdAt: string;
    updatedAt: string;
    student: Student;
    exam: {
        id: number;
        name: string;
    }
}

interface Payment {
    id: number;
    accountId: number;
    paymentAmount: number;
    account?: {
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
    };
}

interface ExamFeePay {
    id: number;
    branchId: number;
    examFeeAssignId: number;
    status: "Pending" | "Accepted" | "Canceled";
    amount: number;
    note: string | null;
    createdAt: string;
    updatedAt: string;
    examFeeAssign: ExamFeeAssign;
    Payment: Payment[];
    selected?: boolean;
    [key: string]: unknown;
}


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
}

const ExamFeeList = () => {
    // Fetching all classes, sections, streams, and sessions
    const { data: classes } = useGetAllClassQuery({});
    const { data: sessions } = useGetAllSessionsQuery({});
    const { data: sections } = useGetAllSectionsQuery({});
    const { data: streams } = useGetAllStreamsQuery({});

    const [filters, setFilters] = useState({
        sessionYear: "",
        section: "",
        className: "",
        stream: "",
    });

    const [searchParams, setSearchParams] = useState<{
        sessionYear: string;
        section: string;
        className: string;
        stream: string;
    } | null>(null);

    const handleFilterChange = (e: {
        target: { name: string; value: string };
    }) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Check if all filters are filled
        const newFilters = {
            ...filters,
            [name]: value
        };

        if (newFilters.sessionYear && newFilters.section && newFilters.className && newFilters.stream) {
            setSearchParams(newFilters);
        } else {
            setSearchParams(null);
        }
    };

    const [unpaidFees, setUnpaidFees] = useState<{ id: number, month: string, year: string, netPayable: number }[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<{ id: number, month: string, year: string, netPayable: number } | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [filteredStudents, setFilteredStudents] = useState<ExamFeePay[]>([]);

    const { data: unpaidStudentResponse } = useGetUnpaidExamFeesByStudentIdQuery(
        selectedStudent?.id,
        { skip: !selectedStudent?.id }
    );

    const {
        data: studentsResponse,
    } = useGetFilteredStudentsQuery(
        searchParams || {
            sessionYear: "",
            section: "",
            className: "",
            stream: "",
        },
        { skip: !searchParams }
    );

    useEffect(() => {
        if (unpaidStudentResponse?.data) {
            setUnpaidFees(unpaidStudentResponse.data.map((fee: StudentFee) => ({
                id: fee.id,
                month: fee.month,
                year: fee.year,
                netPayable: fee.netPayable
            })));
        }
    }, [unpaidStudentResponse]);

    const [addFeePayModalOpen, setAddFeePayModalOpen] = useState<boolean>(false);
    const [viewFeePayModalOpen, setViewFeePayModalOpen] = useState<boolean>(false);
    const [feePayData, setFeePayData] = useState({
        examFeeAssignId: 0,  // Changed from classFeeAssignId to examFeeAssignId
        amount: 0,
        note: "",
        payments: [{ accountId: 0, paymentAmount: 0 }],
    });

    const [currentFeePay, setCurrentFeePay] = useState<ExamFeePay | null>(null);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [confirmAction, setConfirmAction] = useState<{
        open: boolean;
        action: 'accept' | 'cancel' | null;
        feePayId: number | null;
    }>({
        open: false,
        action: null,
        feePayId: null,
    });

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllExamFeePaysQuery({
        page,
        size: rowsPerPage,
        search: searchTerm,
    });

    const { data: accountsResponse } = useGetAllAccountsQuery({ type: 'All' });

    const { data: feePayDetails, isLoading: isFeePayDetailsLoading } = useGetExamFeePayByIdQuery(
        currentFeePay?.id || 0,
        { skip: !currentFeePay?.id }
    );

    console.log(feePayDetails)

    const {
        isDeleteModalOpen,
        itemToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    const [createFeePay, { isLoading: isCreatingFeePay }] = useCreateExamFeePayMutation();
    const [updateFeePay, { isLoading: isUpdatingFeePay }] = useUpdateExamFeePayMutation();
    const [acceptFeePay] = useAcceptExamFeePayMutation();
    const [cancelFeePay] = useCancelExamFeePayMutation();
    const [deleteFeePay] = useDeleteExamFeePayMutation();
    const [bulkAccept] =
        useBulkAcceptExamFeePayMutation();
    const [bulkCancel] =
        useBulkCancelExamFeePayMutation();

    const accounts = useMemo(() => accountsResponse?.data || [], [accountsResponse?.data]);
    const feePays: ExamFeePay[] = useMemo(
        () => responseData?.data || [],
        [responseData?.data]
    );
    const totalPages = responseData?.meta?.totalPage || 1;

    const [approveFeePay, setApproveFeePay] = useState(false);
    const [cancelFeePayConfirm, setCancelFeePayConfirm] = useState(false);
    const [selectedBulkActionType, setSelectedBulkActionType] = useState<"accept" | "cancel" | "">("");

    useEffect(() => {
        if (feePays) {
            const filtered = feePays.map((student: ExamFeePay) => ({
                ...student,
                selected: false,
            }));
            setFilteredStudents(filtered);
        }
    }, [feePays]);

    const handleOpenConfirmation = (action: 'accept' | 'cancel', feePayId: number) => {
        if (action === 'accept') {
            setApproveFeePay(true);
            setCancelFeePayConfirm(false);
        } else {
            setApproveFeePay(false);
            setCancelFeePayConfirm(true);
        }
        setConfirmAction({
            open: true,
            action,
            feePayId,
        });
    };

    const handleCloseConfirmation = () => {
        setApproveFeePay(false);
        setCancelFeePayConfirm(false);
        setConfirmAction({
            open: false,
            action: null,
            feePayId: null,
        });
    };

    const handleConfirmAction = async () => {
        if (!confirmAction.feePayId) return;

        try {
            if (confirmAction.action === 'accept') {
                await acceptFeePay(confirmAction.feePayId).unwrap();
                toastShowing('Exam fee payment accepted successfully', 'bottom-right', 2000, 'green', 'white');
            } else if (confirmAction.action === 'cancel') {
                await cancelFeePay(confirmAction.feePayId).unwrap();
                toastShowing('Exam fee payment cancelled successfully', 'bottom-right', 2000, 'green', 'white');
            }
            refetch();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                `Failed to ${confirmAction.action} exam fee payment`
            );
        } finally {
            handleCloseConfirmation();
        }
    };

    const handleOpenAddFeePayModal = () => {
        setCurrentFeePay(null);
        setSelectedStudent(null);
        setSelectedMonth(null);
        setFeePayData({
            examFeeAssignId: 0,
            amount: 0,
            note: "",
            payments: [{ accountId: 0, paymentAmount: 0 }],
        });
        setAddFeePayModalOpen(true);
    };

    const handleOpenEditFeePayModal = (feePay: ExamFeePay) => {
        setCurrentFeePay(feePay);

        // Set the student data for the fee pay being edited
        const studentData = feePay.examFeeAssign?.student;
        if (studentData) {
            setSelectedStudent(studentData);

            // Set the filters based on student data
            setFilters({
                sessionYear: studentData.session.name,
                section: studentData.section.name,
                className: studentData.class.name,
                stream: studentData.stream.name
            });

            // Set the month/year selection
            setSelectedMonth({
                id: feePay.examFeeAssignId,
                month: feePay.examFeeAssign.month,
                year: feePay.examFeeAssign.year,
                netPayable: feePay.amount
            });
        }

        setFeePayData({
            examFeeAssignId: feePay.examFeeAssignId,
            amount: feePay.amount,
            note: feePay.note || "",
            payments: feePay.Payment?.map(p => ({
                accountId: p.accountId,
                paymentAmount: p.paymentAmount
            })) || [{ accountId: 0, paymentAmount: 0 }],
        });
        setAddFeePayModalOpen(true);
    };

    const handleOpenViewFeePayModal = (feePay: ExamFeePay) => {
        setCurrentFeePay(feePay);
        setViewFeePayModalOpen(true);
    };

    const handleCloseAddFeePayModal = () => {
        setAddFeePayModalOpen(false);
        setFeePayData({
            examFeeAssignId: 0,
            amount: 0,
            note: "",
            payments: [],
        });
        setCurrentFeePay(null);
        setSelectedStudent(null);
        setSelectedMonth(null);
        setFilters({
            sessionYear: "",
            section: "",
            className: "",
            stream: "",
        });
    };

    const handleCloseViewFeePayModal = () => {
        setViewFeePayModalOpen(false);
        setCurrentFeePay(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFeePayData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (/^\d*\.?\d*$/.test(value)) {
            setFeePayData(prev => ({
                ...prev,
                [name]: value === "" ? 0 : parseFloat(value)
            }));
        }
    };

    const handleRemovePayment = (index: number) => {
        setFeePayData(prev => ({
            ...prev,
            payments: prev.payments.filter((_, i) => i !== index),
        }));
    };

    const handleCreateOrUpdateFeePay = async () => {
        try {
            if (!feePayData.examFeeAssignId || feePayData.amount <= 0) {
                toastShowing('Exam fee assignment and valid Amount are required', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            if (feePayData.payments.length === 0) {
                toastShowing('At least one payment is required', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            const totalPayments = feePayData.payments.reduce((sum, payment) => sum + payment.paymentAmount, 0);
            if (Math.abs(totalPayments - feePayData.amount) > 0.01) {
                toastShowing('Sum of payments must equal the total amount', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            const modifiedPayload = validateEmptyFields(feePayData);

            if (currentFeePay) {
                await updateFeePay({
                    id: currentFeePay.id,
                    ...modifiedPayload
                }).unwrap();
                toastShowing('Exam fee payment updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                console.log("from else", modifiedPayload)
                await createFeePay(modifiedPayload).unwrap();
                toastShowing('Exam fee payment created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddFeePayModal();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentFeePay ? "Failed to update exam fee payment" : "Failed to create exam fee payment")
            );
            console.error("Error saving exam fee payment:", err);
        }
    };

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const handleDeleteFeePay = async () => {
        await handleDeleteConfirmation(
            async (feePayId) => {
                await deleteFeePay(feePayId).unwrap();
                refetch();
            },
            {
                successMessage: "Exam fee payment deleted successfully",
                errorMessage: "Failed to delete exam fee payment",
            }
        );
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
            render: (row: ExamFeePay) => (
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
            render: (row: ExamFeePay, index: number) => (page - 1) * rowsPerPage + index + 1
        },
        {
            key: 'student',
            header: 'Student Information',
            render: (row: ExamFeePay) => {
                const student = row.examFeeAssign?.student;
                return (
                    <Box>
                        <Typography variant="body2" fontWeight={500}>
                            {student?.name || ''}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {student?.class?.name || ''}, Roll: {student?.classRoll || ''}
                        </Typography>
                    </Box>
                );
            }
        },
        {
            key: 'month',
            header: 'Exam Name',
            render: (row: ExamFeePay) => {
                return `${row.examFeeAssign?.exam?.name || 'N/A'}`;
            }
        },
        {
            key: 'amount',
            header: 'Amount',
            render: (row: ExamFeePay) => `৳ ${row.amount.toFixed(2)}/-`
        },
        {
            key: 'status',
            header: 'Status',
            render: (row: ExamFeePay) => {
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
            render: (row: ExamFeePay) => {
                const date = new Date(row.createdAt);
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });
            }
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: ExamFeePay) => {
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
                                        handleOpenViewFeePayModal(row);
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
                                                handleOpenEditFeePayModal(row);
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

    return (
        <Box>
            <PageHeader
                title="Exam Fee Payments"
                buttonText="New Payment"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddFeePayModal}
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
                    open={approveFeePay}
                    onClose={handleCloseConfirmation}
                    onConfirm={() => handleConfirmAction()}
                    title="Accept Confirmation"
                    description="Are you sure you want to accept this exam fee payment? This action cannot be undone."
                    isLoading={isDeleting}
                />
            ) : (
                <DeleteConfirmationModal
                    confirmText="Ok"
                    cancelText="Cancel"
                    open={cancelFeePayConfirm}
                    onClose={handleCloseConfirmation}
                    onConfirm={() => handleConfirmAction()}
                    title="Cancel Confirmation"
                    description="Are you sure you want to cancel this exam fee payment? This action cannot be undone."
                    isLoading={isDeleting}
                />
            )}

            {/* Add/Edit Fee Pay Modal */}
            <AnimatePresence>
                {addFeePayModalOpen && (
                    <Dialog
                        open={addFeePayModalOpen}
                        onClose={handleCloseAddFeePayModal}
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
                                    {currentFeePay ? "Edit Exam Fee Payment" : "Add Exam Fee Payment"}
                                </Typography>
                                <IconButton onClick={handleCloseAddFeePayModal} sx={{ color: 'red' }}>
                                    <XCircle />
                                </IconButton>
                            </DialogTitle>

                            <DialogContent sx={{ pt: 3 }}>
                                <Box className='grid gap-4 py-4'>
                                    {/* Student filtering... */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Session Year</InputLabel>
                                            <Select
                                                name="sessionYear"
                                                value={filters.sessionYear}
                                                onChange={handleFilterChange}
                                                label="Session Year"
                                            >
                                                <MenuItem value="">All Sessions</MenuItem>
                                                {(sessions?.data as Session[])?.map((session) => (
                                                    <MenuItem key={session.id} value={session.name}>
                                                        {session.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth size="small">
                                            <InputLabel>Class</InputLabel>
                                            <Select
                                                name="className"
                                                value={filters.className}
                                                onChange={handleFilterChange}
                                                label="Class"
                                            >
                                                <MenuItem value="">All Classes</MenuItem>
                                                {(classes?.data as ClassItem[])?.map((classItem) => (
                                                    <MenuItem key={classItem.id} value={classItem.name}>
                                                        {classItem.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth size="small">
                                            <InputLabel>Section</InputLabel>
                                            <Select
                                                name="section"
                                                value={filters.section}
                                                onChange={handleFilterChange}
                                                label="Section"
                                            >
                                                <MenuItem value="">All Sections</MenuItem>
                                                {(sections?.data as Section[])?.map((section) => (
                                                    <MenuItem key={section.id} value={section.name}>
                                                        {section.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth size="small">
                                            <InputLabel>Stream</InputLabel>
                                            <Select
                                                name="stream"
                                                value={filters.stream}
                                                onChange={handleFilterChange}
                                                label="Stream"
                                            >
                                                <MenuItem value="">All Streams</MenuItem>
                                                {(streams?.data as Stream[])?.map((stream) => (
                                                    <MenuItem key={stream.id} value={stream.name}>
                                                        {stream.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>

                                    <Box>
                                        <div>
                                            <Box sx={{ mb: 2 }}>
                                                <FormControl fullWidth>
                                                    <Autocomplete
                                                        options={studentsResponse?.data || []}
                                                        getOptionLabel={(option: Student) =>
                                                            `${option.name} (Roll: ${option.classRoll})`
                                                        }
                                                        value={selectedStudent}
                                                        onChange={(event, newValue: Student | null) => {
                                                            setSelectedStudent(newValue);
                                                            if (newValue) {
                                                                setFilters({
                                                                    sessionYear: newValue.session.name,
                                                                    section: newValue.section.name,
                                                                    className: newValue.class.name,
                                                                    stream: newValue.stream.name
                                                                });
                                                            }
                                                        }}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Select Student"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                                    />
                                                </FormControl>
                                            </Box>

                                            {selectedStudent && (
                                                <Box sx={{ mb: 2 }}>
                                                    <FormControl fullWidth>
                                                        <Autocomplete
                                                            options={unpaidFees}
                                                            getOptionLabel={(option: { id: number, month: string, year: string, netPayable: number }) =>
                                                                `Payable: ${option.netPayable}`
                                                            }
                                                            value={selectedMonth}
                                                            onChange={(event, newValue: { id: number, month: string, year: string, netPayable: number } | null) => {
                                                                setSelectedMonth(newValue);
                                                                if (newValue) {
                                                                    setFeePayData(prev => ({
                                                                        ...prev,
                                                                        examFeeAssignId: newValue.id,
                                                                        amount: newValue.netPayable
                                                                    }));
                                                                }
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    label="Select Exam Amount"
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                                        />
                                                    </FormControl>
                                                </Box>
                                            )}

                                            <Box>
                                                <TextField
                                                    fullWidth
                                                    label="Amount"
                                                    name="amount"
                                                    value={selectedMonth ? selectedMonth.netPayable : feePayData.amount === 0 ? "" : feePayData.amount}
                                                    onChange={handleNumberInputChange}
                                                    type="number"
                                                    disabled={!!selectedMonth}
                                                    inputProps={{
                                                        step: "0.01"
                                                    }}
                                                />
                                            </Box>
                                        </div>
                                    </Box>

                                    <TextField
                                        fullWidth
                                        label="Note (Optional)"
                                        name="note"
                                        value={feePayData.note}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={3}
                                    />

                                    {/* Payment Details Section */}
                                    <Box>
                                        <Typography fontWeight={600} mb={2} fontSize={{ xs: '0.875rem', sm: '1rem' }}>
                                            Payment Methods *
                                        </Typography>

                                        {feePayData.payments.map((payment, index) => {

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
                                                    <Box sx={{ flex: 1, width: '100%' }}>
                                                        <Typography variant="body2" color="textSecondary" mb={0.5}>
                                                            Account
                                                        </Typography>
                                                        <select
                                                            value={payment.accountId}
                                                            onChange={(e) => {
                                                                const newValue = Number(e.target.value);
                                                                const updatedPayments = [...feePayData.payments];
                                                                updatedPayments[index].accountId = newValue;
                                                                setFeePayData(prev => ({
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
                                                            <option value={0}>Select Account</option>
                                                            {accounts.map((account: Account) => {
                                                                const isDisabled = feePayData.payments.some(
                                                                    (p, i) => i !== index && p.accountId === account.id
                                                                );

                                                                return (
                                                                    <option
                                                                        key={account.id}
                                                                        value={account.id}
                                                                        disabled={isDisabled}
                                                                    >
                                                                        {account.accountName} ({account.accountType})
                                                                        {isDisabled ? " (already selected)" : ""}
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                    </Box>

                                                    {/* Amount Field */}
                                                    <Box sx={{ flex: 1, width: '100%', mb: (index !== 0 ? 4 : 0) }}>
                                                        {index !== 0 && (
                                                            <Box sx={{
                                                                display: 'flex',
                                                                justifyContent: 'flex-end',
                                                            }}>
                                                                <IconButton
                                                                    onClick={() => {
                                                                        if (feePayData.payments.length === 1) {
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
                                                                    disabled={feePayData.payments.length === 1}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                        )}
                                                        <Typography variant="body2" color="textSecondary" mb={0.5}>
                                                            Amount
                                                        </Typography>
                                                        <input
                                                            type="number"
                                                            value={payment.paymentAmount === 0 ? "" : payment.paymentAmount}
                                                            onChange={(e) => {
                                                                const inputValue = e.target.value === "" ? 0 : Number(e.target.value);
                                                                const maxAllowed = selectedMonth?.netPayable || feePayData.amount;
                                                                const value = Math.min(inputValue, maxAllowed);

                                                                const updatedPayments = [...feePayData.payments];
                                                                updatedPayments[index].paymentAmount = value;
                                                                setFeePayData(prev => ({
                                                                    ...prev,
                                                                    payments: updatedPayments
                                                                }));
                                                            }}
                                                            placeholder="0.00"
                                                            style={{
                                                                width: "100%",
                                                                padding: "8px",
                                                                borderRadius: "4px",
                                                                border: "1px solid #ccc",
                                                                backgroundColor: "white",
                                                                fontSize: '14px'
                                                            }}
                                                            max={selectedMonth?.netPayable || feePayData.amount}
                                                        />
                                                        {/* {payment.paymentAmount > currentBalance && (
                                                            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                                                Amount exceeds account balance
                                                            </Typography>
                                                        )} */}
                                                    </Box>
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
                                                setFeePayData(prev => ({
                                                    ...prev,
                                                    payments: [...prev.payments, { accountId: 0, paymentAmount: 0 }]
                                                }));
                                            }}
                                        >
                                            Add Payment Method
                                        </Button>

                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle1">
                                                Total Payment: {feePayData.payments.reduce((sum, payment) => sum + payment.paymentAmount, 0).toFixed(2)}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Remaining: {(feePayData.amount - feePayData.payments.reduce((sum, payment) => sum + payment.paymentAmount, 0)).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </DialogContent>

                            <DialogActions sx={{ px: { xs: 1, sm: 3 }, pb: 2 }}>
                                <CancelButton
                                    onClick={handleCloseAddFeePayModal}

                                >
                                    Cancel
                                </CancelButton>

                                <SubmitButton
                                    onClick={handleCreateOrUpdateFeePay}
                                    disabled={(isCreatingFeePay || isUpdatingFeePay) ||
                                        !feePayData.examFeeAssignId ||
                                        feePayData.amount <= 0 ||
                                        feePayData.payments.length === 0 ||
                                        Math.abs(feePayData.payments.reduce((sum, payment) => sum + payment.paymentAmount, 0) - feePayData.amount) > 0.01}
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
                                    {isCreatingFeePay || isUpdatingFeePay ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : currentFeePay ? (
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

            {/* View Fee Pay Modal */}
            <AnimatePresence>
                {viewFeePayModalOpen && currentFeePay && (
                    <Modal
                        open={viewFeePayModalOpen}
                        onClose={handleCloseViewFeePayModal}
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
                                        onClick={handleCloseViewFeePayModal}
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
                                        Exam Fee Payment Details
                                    </Typography>
                                    <Chip
                                        label={currentFeePay.status}
                                        color={getStatusColor(currentFeePay.status)}
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
                                {isFeePayDetailsLoading ? (
                                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <>
                                        {/* Main Content */}
                                        <Stack spacing={3.5}>
                                            {/* Student Details Section */}
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <StudentIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
                                                <div>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Student Information
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {currentFeePay.examFeeAssign?.student?.name || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        ID: {currentFeePay.examFeeAssign?.student?.studentUniqueId || 'N/A'} •
                                                        Class: {currentFeePay.examFeeAssign?.student?.class?.name || 'N/A'} •
                                                        Roll: {currentFeePay.examFeeAssign?.student?.classRoll || 'N/A'}
                                                    </Typography>
                                                </div>
                                            </Box>

                                            {/* Month/Year Section */}
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <DateIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
                                                <div>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Payment Period
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {currentFeePay.examFeeAssign?.month || 'N/A'} {currentFeePay.examFeeAssign?.year || ''}
                                                    </Typography>
                                                </div>
                                            </Box>

                                            {/* Fee Information Section */}
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <AmountIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
                                                <div>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Fee Information
                                                    </Typography>
                                                    <Stack direction="row" spacing={4} mt={1}>
                                                        <div>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Amount Paid
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight={600} color="primary">
                                                                {currentFeePay.amount.toLocaleString('en-US', {
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
                                            {currentFeePay.note && (
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                                    <NoteIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem', mt: 0.5 }} />
                                                    <div>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            Payment Note
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                                            {currentFeePay.note}
                                                        </Typography>
                                                    </div>
                                                </Box>
                                            )}

                                            {/* Payment Details Section */}
                                            {/* <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
                                                            {currentFeePay.Payment?.map((payment, index) => {
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
                                                                    {currentFeePay.Payment?.reduce((sum, payment) => sum + payment.paymentAmount, 0).toLocaleString('en-US', {
                                                                        style: 'currency',
                                                                        currency: 'BDT',
                                                                        minimumFractionDigits: 2
                                                                    })}
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box> */}

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
                                                                {new Date(currentFeePay.createdAt).toLocaleString('en-US', {
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
                                                                {new Date(currentFeePay.updatedAt).toLocaleString('en-US', {
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
                                        onClick={handleCloseViewFeePayModal}
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

                                {currentFeePay.status === 'Pending' && (
                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            variant="contained"
                                            onClick={() => {
                                                handleOpenEditFeePayModal(currentFeePay);
                                                handleCloseViewFeePayModal();
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
                                )}
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
                        Failed to load exam fee payments. Please try again.
                    </Alert>
                ) : feePays.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No exam fee payments found. {searchTerm ? "Try a different search term." : "Create your first exam fee payment."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<ExamFeePay>
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
                onConfirm={() => handleDeleteFeePay()}
                title="Delete Exam Fee Payment"
                description="Are you sure you want to delete this exam fee payment record? This action cannot be undone."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default ExamFeeList;