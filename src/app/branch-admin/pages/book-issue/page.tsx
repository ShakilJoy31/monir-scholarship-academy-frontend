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
    Autocomplete,
} from "@mui/material";
import { SelectChangeEvent } from '@mui/material';
import { Plus, X, Search } from "lucide-react";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { motion, AnimatePresence } from "framer-motion";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { BsThreeDotsVertical } from "react-icons/bs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetAllBooksQuery } from "@/app/store/api/classes/bookApi";
import { BookIssueFormValues, BookIssueSchema } from "@/app/super-admin/schemas/book/bookIssueSchema";
import { useCreateBookIssueMutation, useDeleteBookIssueMutation, useGetAllBookIssuesQuery, useReturnBookMutation, useUpdateBookIssueMutation } from "@/app/store/api/classes/bookIssueApi";
import { useGetFilteredStudentsQuery } from "@/app/store/api/student/studentApi";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import { theStar } from "@/lib/requiredJSX";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

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

interface Books {
    id: number;
    title: string;
    author: string;
}

interface Student {
    id: number;
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
    [key: string]: unknown;
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

const BookIssueList = () => {
    const [addIssueModalOpen, setAddIssueModalOpen] = useState<boolean>(false);
    const [viewIssueModalOpen, setViewIssueModalOpen] = useState<boolean>(false);
    const [currentIssue, setCurrentIssue] = useState<BookIssue | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [studentFilters, setStudentFilters] = useState({
        sessionYear: "",
        className: "",
        section: "",
        stream: "",
    });

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
        setValue,
    } = useForm<BookIssueFormValues>({
        resolver: zodResolver(BookIssueSchema),
        defaultValues: {
            bookId: 0,
            studentId: 0,
            dueDate: "",
        },
    });

    // Fetch data
    const {
        data: issuesResponse,
        isLoading,
        isError,
        refetch,
    } = useGetAllBookIssuesQuery({
        page: page + 1,
        size: rowsPerPage,
        search: searchTerm,
    });

    const { data: booksResponse } = useGetAllBooksQuery({
        page: 1,
        size: 10000,
    });

    // Student filtering
    const { data: studentsResponse } = useGetFilteredStudentsQuery({
        page: 1,
        size: 10000,
        sessionYear: studentFilters.sessionYear,
        className: studentFilters.className,
        section: studentFilters.section,
        stream: studentFilters.stream
    });

    // const { data: issueDetails } = useGetBookIssueByIdQuery(currentIssue?.id || 0, {
    //     skip: !currentIssue?.id,
    // });

    // For returnin book. 
    const [returnBookIssue, { isLoading: returningLoading }] = useReturnBookMutation();

    const handleReturnBook = async (id: number) => {
        console.log(id)
        try {
            setItemToReturn(id);
            if (id) {
                await returnBookIssue({ id }).unwrap();
            }
            toastShowing('Book returned successfully', 'bottom-right', 2000, 'green', 'white');
            refetch(); // Refresh the list after returning
            setViewIssueModalOpen(false); // Close the view modal if open
        } catch (err) {
            toastShowing((err as { data?: { message?: string } })?.data?.message ||
                "Failed to return book", 'bottom-right', 2000, 'red', 'white');
            console.error("Error returning book:", err);
        }
    };


    // Fetch filter options
    const { data: classes } = useGetAllClassQuery({});
    const { data: sessions } = useGetAllSessionsQuery({});
    const { data: sections } = useGetAllSectionsQuery({});
    const { data: streams } = useGetAllStreamsQuery({});

    const {
        isDeleteModalOpen,
        itemToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    const [createBookIssue, { isLoading: isCreatingIssue }] = useCreateBookIssueMutation();
    const [updateBookIssue, { isLoading: isUpdatingIssue }] = useUpdateBookIssueMutation();
    const [deleteBookIssue] = useDeleteBookIssueMutation();

    const totalPages = issuesResponse?.meta?.totalPage || 1;
    const issues: BookIssue[] = Array.isArray(issuesResponse?.data) ? issuesResponse.data : issuesResponse?.data || [];
    const books = booksResponse?.data || [];
    const students = studentsResponse?.data || [];

    const [itemToReturn, setItemToReturn] = useState<number | null>(null);



    // Modal handlers
    const handleOpenAddIssueModal = () => {
        setCurrentIssue(null);
        reset();
        setStudentFilters({
            sessionYear: "",
            className: "",
            section: "",
            stream: "",
        });
        setAddIssueModalOpen(true);
    };

    const handleOpenEditIssueModal = (issue: BookIssue) => {
        setCurrentIssue(issue);
        setValue("bookId", issue.bookId);
        setValue("studentId", issue.studentId);
        setValue("dueDate", issue.dueDate);

        // Set student filters based on current student data
        if (issue.student) {
            setStudentFilters({
                sessionYear: issue.student.session?.name || "",
                className: issue.student.class?.name || "",
                section: issue.student.section?.name || "",
                stream: issue.student.stream?.name || "",
            });
        }

        setAddIssueModalOpen(true);
    };

    const handleOpenViewIssueModal = (issue: BookIssue) => {
        setCurrentIssue(issue);
        setViewIssueModalOpen(true);
    };

    const handleCloseAddIssueModal = () => {
        setAddIssueModalOpen(false);
        setCurrentIssue(null);
        reset();
    };

    const handleCloseViewIssueModal = () => {
        setViewIssueModalOpen(false);
        setCurrentIssue(null);
    };

    const handleStudentFilterChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setStudentFilters(prev => ({
            ...prev,
            [name as keyof typeof studentFilters]: value
        }));
    };

    const onSubmit = async (data: BookIssueFormValues) => {
        try {
            if (currentIssue) {
                // Update existing issue
                await updateBookIssue({ id: currentIssue.id, data }).unwrap();
                toastShowing('Book issue updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new issue
                await createBookIssue(data).unwrap();
                toastShowing('Book issued successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddIssueModal();
        } catch (err) {
            toastShowing((err as { data?: { message?: string } })?.data?.message ||
                (currentIssue ? "Failed to update book issue" : "Failed to create book issue"), 'bottom-right', 2000, 'red', 'white');
        }
    };

    const handleDeleteIssue = async () => {
        await handleDeleteConfirmation(
            async (issueId) => {
                await deleteBookIssue(issueId).unwrap();
                refetch();
            },
            {
                successMessage: "Book issue deleted successfully",
                errorMessage: "Failed to delete book issue",
            }
        );
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
            key: 'issueDate',
            header: 'Issued On',
            render: (row: BookIssue) => {
                const date = new Date(row.issueDate);
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
        },
        {
            key: 'dueDate',
            header: 'Due Date',
            render: (row: BookIssue) => {
                const date = new Date(row.dueDate);
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
        },
        {
            key: 'status',
            header: 'Status',
            render: (row: BookIssue) => {
                let status = 'ISSUED';
                if (row.isReturn) {
                    status = 'RETURNED';
                } else if (new Date(row.dueDate) < new Date() && !row.isReturn) {
                    status = 'OVERDUE';
                }

                let color = '';
                switch (status) {
                    case 'ISSUED':
                        color = '#1A3C34';
                        break;
                    case 'RETURNED':
                        color = '#2563EB';
                        break;
                    case 'OVERDUE':
                        color = '#DC2626';
                        break;
                    default:
                        color = '#64748B';
                }
                return (
                    <Typography
                        sx={{
                            color,
                            fontWeight: 500,
                            textTransform: 'capitalize'
                        }}
                    >
                        {status.toLowerCase()}
                    </Typography>
                );
            }
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
                                {/* Only show Return Book button if book is not already returned */}
                                {!row.isReturn && (
                                    returningLoading && itemToReturn === row.id ? (
                                        <div className="flex justify-center items-center">
                                            {buttonLoader}
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => {
                                                handleReturnBook(row.id);
                                                setItemToReturn(row.id);
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
                                            Return Book
                                        </Button>
                                    )
                                )}

                                <Button
                                    onClick={() => {
                                        handleOpenViewIssueModal(row);
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
                                        handleOpenEditIssueModal(row);
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
                title="Book Issue Management"
                buttonText="Issue New Book"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddIssueModal}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search book issues..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            {/* Add/Edit Book Issue Modal */}
            <AnimatePresence>
                {addIssueModalOpen && (
                    <Modal
                        open={addIssueModalOpen}
                        onClose={handleCloseAddIssueModal}
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
                                    onClick={handleCloseAddIssueModal}
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
                                    {currentIssue ? "Edit Book Issue" : "Issue New Book"}
                                </Typography>
                            </Box>

                            {/* Form fields */}
                            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{
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
                                {/* Student Filter Section */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                >
                                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#1A3C34' }}>
                                        Filter Students {theStar}
                                    </Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Session Year</InputLabel>
                                            <Select
                                                name="sessionYear"
                                                value={studentFilters.sessionYear}
                                                onChange={handleStudentFilterChange}
                                                label="Session Year"
                                            >
                                                {sessions?.data?.map((session: Session) => (
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
                                                value={studentFilters.className}
                                                onChange={handleStudentFilterChange}
                                                label="Class"
                                            >
                                                {classes?.data?.map((cls: ClassItem) => (
                                                    <MenuItem key={cls.id} value={cls.name}>
                                                        {cls.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth size="small">
                                            <InputLabel>Section</InputLabel>
                                            <Select
                                                name="section"
                                                value={studentFilters.section}
                                                onChange={handleStudentFilterChange}
                                                label="Section"
                                            >
                                                {sections?.data?.map((section: Section) => (
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
                                                value={studentFilters.stream}
                                                onChange={handleStudentFilterChange}
                                                label="Stream"
                                            >
                                                {streams?.data?.map((stream: Stream) => (
                                                    <MenuItem key={stream.id} value={stream.name}>
                                                        {stream.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >

                                    <Controller
                                        name="studentId"
                                        control={control}
                                        render={({ field }) => (
                                            <Autocomplete
                                                options={students}
                                                getOptionLabel={(student: Student) => `${student.name} | Roll: (${student.classRoll})`}
                                                value={students.find((student: Student) => student.id === field.value) || null}
                                                onChange={(event, newValue) => {
                                                    field.onChange(newValue ? newValue.id : 0);
                                                }}
                                                disabled={!studentFilters.sessionYear || !studentFilters.className}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label={
                                                            <>
                                                                Select Student
                                                                {theStar}
                                                            </>
                                                        }
                                                        error={!!errors.studentId}
                                                        helperText={errors.studentId?.message}
                                                        sx={{
                                                            borderRadius: '6px',
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
                                                renderOption={(props: React.HTMLAttributes<HTMLLIElement>, student: Student) => (
                                                    <MenuItem {...props} key={student.id}>
                                                        {student.name} | Roll: ({student.classRoll})
                                                    </MenuItem>
                                                )}
                                                isOptionEqualToValue={(option: Student, value: Student) => option.id === value.id}
                                            />
                                        )}
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                >

                                    <Controller
                                        name="bookId"
                                        control={control}
                                        render={({ field }) => (
                                            <Autocomplete
                                                options={books}
                                                getOptionLabel={(book: Books) => `${book.title} by ${book.author}`}
                                                value={books.find((book: Books) => book.id === field.value) || null}
                                                onChange={(event, newValue) => {
                                                    field.onChange(newValue ? newValue.id : 0);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label={
                                                            <>
                                                                Select Book
                                                                {theStar}
                                                            </>
                                                        }
                                                        error={!!errors.bookId}
                                                        helperText={errors.bookId?.message}
                                                        sx={{
                                                            borderRadius: '6px',
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
                                                            ...params.InputProps,
                                                            startAdornment: (
                                                                <>
                                                                    <Search size={18} style={{ marginRight: 8 }} />
                                                                    {params.InputProps.startAdornment}
                                                                </>
                                                            ),
                                                        }}
                                                    />
                                                )}
                                                renderOption={(props: React.HTMLAttributes<HTMLLIElement>, book: Books) => (
                                                    <MenuItem {...props} key={book.id}>
                                                        {book.title} by {book.author}
                                                    </MenuItem>
                                                )}
                                                isOptionEqualToValue={(option: Books, value: Books) => option.id === value.id}
                                            />
                                        )}
                                    />
                                    {errors.bookId && (
                                        <Typography variant="caption" color="error">
                                            {errors.bookId.message}
                                        </Typography>
                                    )}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <Controller
                                            name="dueDate"
                                            control={control}
                                            render={({ field }) => (
                                                <DatePicker
                                                    label={
                                                        <>
                                                            Due Date
                                                            {theStar}
                                                        </>
                                                    }
                                                    value={field.value ? new Date(field.value) : null}
                                                    onChange={(date) => {
                                                        if (date) {
                                                            field.onChange(date.toISOString());
                                                        }
                                                    }}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            error: !!errors.dueDate,
                                                            helperText: errors.dueDate?.message,
                                                            sx: {
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: '6px',
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
                                                                },
                                                            },
                                                        },
                                                    }}
                                                />
                                            )}
                                        />
                                    </LocalizationProvider>
                                </motion.div>

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
                                            onClick={handleCloseAddIssueModal}
                                           
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
                                            disabled={isCreatingIssue || isUpdatingIssue}
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
                                            {(isCreatingIssue || isUpdatingIssue) ? (
                                                <span>{currentIssue ? "Updating..." : "Submitting..."}</span>
                                            ) : (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <span>{currentIssue ? "Update" : "Submit"}</span>
                                                   
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

            {/* View Book Issue Modal */}
            <AnimatePresence>
                {viewIssueModalOpen && currentIssue && (
                    <Modal
                        open={viewIssueModalOpen}
                        onClose={handleCloseViewIssueModal}
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
                                    onClick={handleCloseViewIssueModal}
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
                                    Book Issue Details
                                </Typography>
                            </Box>

                            {/* Issue details */}
                            <Box sx={{ display: 'grid', gap: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Book:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {currentIssue.book?.title || 'N/A'} by {currentIssue.book?.author || 'N/A'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Student:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {currentIssue.student?.name || 'N/A'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Roll:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {currentIssue.student?.classRoll || 'N/A'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Class:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {currentIssue.student?.class?.name || 'N/A'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Issued On:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {new Date(currentIssue.issueDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Due Date:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {new Date(currentIssue.dueDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Typography>
                                </Box>

                                {currentIssue.returnDate && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body1" color="textSecondary">Returned On:</Typography>
                                        <Typography variant="body1" fontWeight={500}>
                                            {new Date(currentIssue.returnDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </Typography>
                                    </Box>
                                )}

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Status:</Typography>
                                    <Typography
                                        variant="body1"
                                        fontWeight={500}
                                        sx={{
                                            color:
                                                currentIssue.isReturn ? '#2563EB' :
                                                    new Date(currentIssue.dueDate) < new Date() ? '#DC2626' :
                                                        '#1A3C34',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {currentIssue.isReturn ? 'returned' :
                                            new Date(currentIssue.dueDate) < new Date() ? 'overdue' : 'issued'}
                                    </Typography>
                                </Box>

                                {currentIssue.fineAmount > 0 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body1" color="textSecondary">Fine Amount:</Typography>
                                        <Typography variant="body1" fontWeight={500}>
                                            ${currentIssue.fineAmount.toFixed(2)}
                                            {currentIssue.isFinePaid && (
                                                <span style={{ color: '#10B981', marginLeft: '8px' }}>
                                                    (Paid)
                                                </span>
                                            )}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Close button */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                                <CancelButton
                                    onClick={handleCloseViewIssueModal}
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
                                    Close
                                </CancelButton>
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
                        Failed to load book issues
                    </Alert>
                ) : issues.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No book issues found. {searchTerm ? "Try a different search term." : "Issue your first book."}
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

            <DeleteConfirmationModal
                open={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={() => handleDeleteIssue()}
                title="Delete Book Issue"
                description="Are you sure you want to delete this book issue record? This action cannot be undone."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default BookIssueList;