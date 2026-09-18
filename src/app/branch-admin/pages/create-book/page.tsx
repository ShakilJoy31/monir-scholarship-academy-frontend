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
    SelectChangeEvent,
} from "@mui/material";
import { Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { motion, AnimatePresence } from "framer-motion";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useCreateBookMutation, useDeleteBookMutation, useGetAllBooksQuery, useGetBookByIdQuery, useUpdateBookMutation } from "@/app/store/api/classes/bookApi";
import { useGetAllBookCategoriesQuery } from "@/app/store/api/classes/bookCategoryApi";
import { useGetAllShelvesQuery } from "@/app/store/api/classes/bookShelfApi";
import { theStar } from "@/lib/requiredJSX";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface Book {
    id: number;
    categoryId: number;
    title: string;
    author: string;
    publishedYear: number;
    quantity: number;
    availableStock: number;
    shelfId: number;
    createdAt: string;
    updatedAt: string;
    category?: {
        name: string;
    };
    shelf?: {
        code: string;
    };
    [key: string]: unknown;
}

interface Category {
    id: number;
    name: string;
}

interface Shelf {
    id: number;
    code: string;
    location?: string;
}

interface FormData {
    categoryId: string;
    title: string;
    author: string;
    publishedYear: string;
    quantity: string;
    availableStock: string;
    shelfId: string;
}

const BookList = () => {
    const [addBookModalOpen, setAddBookModalOpen] = useState<boolean>(false);
    const [viewBookModalOpen, setViewBookModalOpen] = useState<boolean>(false);
    const [currentBook, setCurrentBook] = useState<Book | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState<FormData>({
        categoryId: "",
        title: "",
        author: "",
        publishedYear: "",
        quantity: "",
        availableStock: "",
        shelfId: "",
    });

    // Fetch data
    const {
        data: booksResponse,
        isLoading,
        isError,
        refetch,
    } = useGetAllBooksQuery({
        page: page + 1,
        size: rowsPerPage,
        search: searchTerm,
    });

    const { data: categoriesResponse } = useGetAllBookCategoriesQuery({
        page: 1,
        size: 10000,
    });

    const { data: shelvesResponse } = useGetAllShelvesQuery({
        page: 1,
        size: 10000,
    });

    const { data: bookDetails } = useGetBookByIdQuery(currentBook?.id || 0, {
        skip: !currentBook?.id,
    });

    const {
        isDeleteModalOpen,
        itemToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    const [createBook, { isLoading: isCreatingBook }] = useCreateBookMutation();
    const [updateBook, { isLoading: isUpdatingBook }] = useUpdateBookMutation();
    const [deleteBook] = useDeleteBookMutation();

    const totalPages = booksResponse?.meta?.totalPage || 1;
    const books: Book[] = Array.isArray(booksResponse?.data) ? booksResponse.data : booksResponse?.data || [];
    const categories: Category[] = categoriesResponse?.data || [];
    const shelves: Shelf[] = shelvesResponse?.data || [];

    // Modal handlers
    const handleOpenAddBookModal = () => {
        setCurrentBook(null);
        setFormData({
            categoryId: "",
            title: "",
            author: "",
            publishedYear: "",
            quantity: "",
            availableStock: "",
            shelfId: "",
        });
        setAddBookModalOpen(true);
    };

    const handleOpenEditBookModal = (book: Book) => {
        setCurrentBook(book);
        setFormData({
            categoryId: book.categoryId.toString(),
            title: book.title,
            author: book.author,
            publishedYear: book.publishedYear.toString(),
            quantity: book.quantity.toString(),
            availableStock: book.availableStock.toString(),
            shelfId: book.shelfId.toString(),
        });
        setAddBookModalOpen(true);
    };

    const handleOpenViewBookModal = (book: Book) => {
        setCurrentBook(book);
        setViewBookModalOpen(true);
    };

    const handleCloseAddBookModal = () => {
        setAddBookModalOpen(false);
        setCurrentBook(null);
    };

    const handleCloseViewBookModal = () => {
        setViewBookModalOpen(false);
        setCurrentBook(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateOrUpdateBook = async () => {
        try {
            // Validate required fields
            if (!formData.categoryId || !formData.title || !formData.author ||
                !formData.publishedYear || !formData.quantity || !formData.availableStock ||
                !formData.shelfId) {
                toastShowing('All fields are required', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            const bookData = {
                categoryId: Number(formData.categoryId),
                title: formData.title,
                author: formData.author,
                publishedYear: Number(formData.publishedYear),
                quantity: Number(formData.quantity),
                availableStock: Number(formData.availableStock),
                shelfId: Number(formData.shelfId),
            };

            if (currentBook) {
                // Update existing book
                await updateBook({ id: currentBook.id, ...bookData }).unwrap();
                toastShowing('Book updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new book
                await createBook(bookData).unwrap();
                toastShowing('Book created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddBookModal();
        } catch (err) {
            const error = err as { data?: { message?: string } };
            toast.error(
                error?.data?.message ||
                (currentBook ? "Failed to update book" : "Failed to create book")
            );
            console.error("Error saving book:", err);
        }
    };

    const handleDeleteBook = async () => {
        await handleDeleteConfirmation(
            async (bookId: number) => {
                await deleteBook(bookId).unwrap();
                refetch();
            },
            {
                successMessage: "Book deleted successfully",
                errorMessage: "Failed to delete book",
            }
        );
    };

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: Book, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'title',
            header: 'Title'
        },
        {
            key: 'author',
            header: 'Author'
        },
        {
            key: 'category',
            header: 'Category',
            render: (row: Book) => row.category?.name || 'N/A'
        },
        {
            key: 'shelf',
            header: 'Shelf',
            render: (row: Book) => row.shelf?.code || 'N/A'
        },
        {
            key: 'availableStock',
            header: 'Available',
            render: (row: Book) => `${row.availableStock}/${row.quantity}`
        },
        {
            key: 'createdAt',
            header: 'Added On',
            render: (row: Book) => {
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
            render: (row: Book) => {
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
                                        handleOpenViewBookModal(row);
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
                                        handleOpenEditBookModal(row);
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
                            onClick={(e: React.MouseEvent) => {
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
                title="Book Management"
                buttonText="Add Book"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddBookModal}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search books..."
                    onSearch={(term: string) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            {/* Add/Edit Book Modal */}
            <AnimatePresence>
                {addBookModalOpen && (
                    <Modal
                        open={addBookModalOpen}
                        onClose={handleCloseAddBookModal}
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
                                    onClick={handleCloseAddBookModal}
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
                                    {currentBook ? "Edit Book" : "Add Book"}
                                </Typography>
                            </Box>

                            {/* Form fields */}
                            <Box sx={{ display: 'grid', gap: 2 }}>
                                {/* First Row - Title and Author */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <TextField
                                        fullWidth
                                        label={
                                            <>
                                                Title
                                                {theStar}
                                            </>
                                        }
                                        name="title"
                                        value={formData.title}
                                        onChange={handleFormChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '6px',
                                                '& fieldset': {
                                                    borderColor: '#035140',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#035140',
                                                },
                                            },
                                        }}
                                        autoFocus
                                    />
                                </motion.div>


                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <TextField
                                            fullWidth
                                            label={
                                                <>
                                                    Available Stock
                                                    {theStar}
                                                </>
                                            }
                                            name="availableStock"
                                            type="number"
                                            value={formData.availableStock}
                                            onChange={handleFormChange}
                                            inputProps={{
                                                min: 0,
                                                max: formData.quantity || 100000
                                            }}
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
                                        transition={{ delay: 0.15 }}
                                    >
                                        <TextField
                                            fullWidth
                                            label={
                                                <>
                                                    Author
                                                    {theStar}
                                                </>
                                            }
                                            name="author"
                                            value={formData.author}
                                            onChange={handleFormChange}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '6px',
                                                    '& fieldset': {
                                                        borderColor: '#035140',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: '#035140',
                                                    },
                                                },
                                            }}
                                        />
                                    </motion.div>
                                </Box>

                                {/* Second Row - Category and Shelf */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <FormControl fullWidth>
                                            <InputLabel>Category {theStar}</InputLabel>
                                            <Select
                                                name="categoryId"
                                                value={formData.categoryId}
                                                onChange={handleSelectChange}
                                                label={
                                                    <>
                                                        Category
                                                        {theStar}
                                                    </>
                                                }
                                                sx={{
                                                    borderRadius: '6px',
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '6px',
                                                        '& fieldset': {
                                                            borderColor: '#035140',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: '#035140',
                                                        },
                                                    },
                                                }}
                                            >
                                                {categories.map((category: Category) => (
                                                    <MenuItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        <FormControl fullWidth>
                                            <InputLabel>Shelf {theStar}</InputLabel>
                                            <Select
                                                name="shelfId"
                                                value={formData.shelfId}
                                                onChange={handleSelectChange}
                                                label={
                                                    <>
                                                        Bed Number
                                                        {theStar}
                                                    </>
                                                }
                                                sx={{
                                                    borderRadius: '6px',
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '6px',
                                                        '& fieldset': {
                                                            borderColor: '#035140',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: '#035140',
                                                        },
                                                    },
                                                }}
                                            >
                                                {shelves.map((shelf: Shelf) => (
                                                    <MenuItem key={shelf.id} value={shelf.id.toString()}>
                                                        {shelf.code} {shelf.location ? `(${shelf.location})` : ''}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </motion.div>
                                </Box>

                                {/* Third Row - Published Year, Quantity, and Available Stock */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <TextField
                                            fullWidth
                                            label={
                                                <>
                                                    Published Year
                                                    {theStar}
                                                </>
                                            }
                                            name="publishedYear"
                                            type="number"
                                            value={formData.publishedYear}
                                            onChange={handleFormChange}
                                            inputProps={{ min: 1000, max: new Date().getFullYear() }}
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
                                        transition={{ delay: 0.35 }}
                                    >
                                        <TextField
                                            fullWidth
                                            label={
                                                <>
                                                    Quantity
                                                    {theStar}
                                                </>
                                            }
                                            name="quantity"
                                            type="number"
                                            value={formData.quantity}
                                            onChange={handleFormChange}
                                            inputProps={{ min: 1 }}
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


                                </Box>


                            </Box>

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
                                        onClick={handleCloseAddBookModal}

                                    >
                                        Cancel
                                    </CancelButton>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <SubmitButton
                                        onClick={handleCreateOrUpdateBook}
                                        disabled={
                                            (isCreatingBook || isUpdatingBook) ||
                                            !formData.title || !formData.author ||
                                            !formData.categoryId || !formData.shelfId ||
                                            !formData.publishedYear || !formData.quantity ||
                                            !formData.availableStock
                                        }
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
                                        {(isCreatingBook || isUpdatingBook) ? (
                                            <span>{currentBook ? "Updating..." : "Submitting..."}</span>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{currentBook ? "Update" : "Submit"}</span>

                                            </Box>
                                        )}
                                    </SubmitButton>
                                </motion.div>
                            </Box>
                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* View Book Modal */}
            <AnimatePresence>
                {viewBookModalOpen && currentBook && (
                    <Modal
                        open={viewBookModalOpen}
                        onClose={handleCloseViewBookModal}
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
                                    onClick={handleCloseViewBookModal}
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
                                    Book Details
                                </Typography>
                            </Box>

                            {/* Book details */}
                            <Box sx={{ display: 'grid', gap: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Title:</Typography>
                                    <Typography variant="body1" fontWeight={500}>{currentBook.title}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Author:</Typography>
                                    <Typography variant="body1" fontWeight={500}>{currentBook.author}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Category:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {bookDetails?.data?.category?.name || 'N/A'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Shelf:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {bookDetails?.data?.shelf?.code || 'N/A'}
                                        {bookDetails?.data?.shelf?.location ? ` (${bookDetails.data.shelf.location})` : ''}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Published Year:</Typography>
                                    <Typography variant="body1" fontWeight={500}>{currentBook.publishedYear}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Quantity:</Typography>
                                    <Typography variant="body1" fontWeight={500}>{currentBook.quantity}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Available Stock:</Typography>
                                    <Typography variant="body1" fontWeight={500}>{currentBook.availableStock}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" color="textSecondary">Added On:</Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {new Date(currentBook.createdAt).toLocaleDateString('en-US', {
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
                                <CancelButton
                                    onClick={handleCloseViewBookModal}
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
                        Failed to load books
                    </Alert>
                ) : books.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No books found. {searchTerm ? "Try a different search term." : "Add your first book."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<Book>
                            columns={columns}
                            data={books}
                        />
                        <PaginationComponent
                            currentPage={page + 1}
                            totalPages={totalPages}
                            onPageChange={(newPage: number) => setPage(newPage - 1)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(value: number) => setRowsPerPage(value)}
                        />
                    </>
                )}
            </Paper>

            <DeleteConfirmationModal
                open={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={() => handleDeleteBook()}
                title="Delete Book"
                description="Are you sure you want to delete this book? This action cannot be undone."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default BookList;