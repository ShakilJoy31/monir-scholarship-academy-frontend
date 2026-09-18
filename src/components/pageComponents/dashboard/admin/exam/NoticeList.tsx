"use client";
import React, { useState, useRef, ChangeEvent } from "react";
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
    Link,
} from "@mui/material";
import { Plus, Edit, Trash2, X, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";

import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import { useCreateNoticeMutation, useDeleteNoticeMutation, useGetAllNoticesQuery, useUpdateNoticeMutation, useUploadFileMutation } from "@/app/store/api/classes/noticeApi";
import { validateEmptyFields } from "@/lib/objectModify";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";

interface Notice {
    id: number;
    noticeType: string;
    titleEnglish: string;
    titleBangla?: string;
    pdfLink: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

const NoticeList = () => {
    const [addNoticeModalOpen, setAddNoticeModalOpen] = useState<boolean>(false);
    const [noticeType, setNoticeType] = useState<string>("Student");
    const [titleEnglish, setTitleEnglish] = useState<string>("");
    const [titleBangla, setTitleBangla] = useState<string>("");
    const [pdfLink, setPdfLink] = useState<string>("");
    const [currentNotice, setCurrentNotice] = useState<Notice | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllNoticesQuery({
        page: page + 1,
        size: rowsPerPage,
        search: searchTerm,
    });

    const [createNotice, { isLoading: isCreatingNotice }] = useCreateNoticeMutation();
    const [updateNotice, { isLoading: isUpdatingNotice }] = useUpdateNoticeMutation();
    const [deleteNotice] = useDeleteNoticeMutation();
    const [uploadFile] = useUploadFileMutation();

    const {
        isDeleteModalOpen,
        itemToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    const notices: Notice[] = Array.isArray(responseData?.data)
        ? responseData.data
        : responseData?.data || [];

    const handleOpenAddNoticeModal = () => {
        setCurrentNotice(null);
        setNoticeType("Student");
        setTitleEnglish("");
        setTitleBangla("");
        setPdfLink("");
        setSelectedFile(null);
        setAddNoticeModalOpen(true);
    };

    console.log("Notices:", notices);

    const handleOpenEditNoticeModal = (notice: Notice) => {
        setCurrentNotice(notice);
        setNoticeType(notice.noticeType);
        setTitleEnglish(notice.titleEnglish);
        setTitleBangla(notice.titleBangla || "");
        setPdfLink(notice.pdfLink);
        setSelectedFile(null);
        setAddNoticeModalOpen(true);
    };

    const handleCloseAddNoticeModal = () => {
        setAddNoticeModalOpen(false);
        setNoticeType("Student");
        setTitleEnglish("");
        setTitleBangla("");
        setPdfLink("");
        setSelectedFile(null);
        setCurrentNotice(null);
    };

    const totalPages = responseData?.meta?.totalPage || 1;

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type === "application/pdf") {
                setSelectedFile(file);
                setPdfLink(""); // Clear any existing link when new file is selected
            } else {
                toastShowing('Please select a PDF file', 'bottom-right', 2000, 'red', 'white');
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toastShowing('Please select a file first', 'bottom-right', 2000, 'red', 'white');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            const response = await uploadFile(formData).unwrap();
            const fileUrl = response.data[0];
            setPdfLink(fileUrl);

            toastShowing('Notice PDF uploaded successfully!', 'bottom-right', 2000, 'green', 'white');
        } catch (err) {
            toastShowing(
                (err as { data?: { message?: string } })?.data?.message || "Failed to upload file",
                'bottom-right',
                2000,
                'red',
                'white'
            );
            console.error("Error uploading file:", err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCreateOrUpdateNotice = async () => {
        try {
            if (!titleEnglish.trim()) {
                toastShowing('English title cannot be empty', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            if (!pdfLink.trim() && !selectedFile) {
                toastShowing('Please upload a PDF file or provide a PDF link', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            const noticeData = {
                noticeType,
                titleEnglish,
                titleBangla: titleBangla || undefined,
                pdfLink
            };

            const modifiedPayload = validateEmptyFields(noticeData);

            if (currentNotice) {
                await updateNotice({ id: currentNotice.id, ...modifiedPayload }).unwrap();
                toastShowing('Notice updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                await createNotice(modifiedPayload).unwrap();
                toastShowing('Notice created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddNoticeModal();
        } catch (err) {
            toastShowing(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentNotice ? "Failed to update notice" : "Failed to create notice"),
                'bottom-right',
                2000,
                'red',
                'white'
            );
            console.error("Error saving notice:", err);
        }
    };

    const handleDeleteNotice = async () => {
        await handleDeleteConfirmation(
            async (noticeId) => {
                await deleteNotice(noticeId).unwrap();
                refetch();
            },
            {
                successMessage: "Notice deleted successfully",
                errorMessage: "Failed to delete notice",
            }
        );
    };

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: Notice, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'titleEnglish',
            header: 'Title (English)'
        },
        {
            key: 'noticeType',
            header: 'Notice Type'
        },
        {
            key: 'pdfLink',
            header: 'PDF',
            render: (row: Notice) => (
                row.pdfLink ? (
                    <Link
                        href={row.pdfLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            color: '#1A3C34',
                            textDecoration: 'none',
                            fontWeight: 500,
                            '&:hover': {
                                textDecoration: 'underline',
                            }
                        }}
                    >
                        View PDF
                    </Link>
                ) : (
                    <span style={{ color: '#999' }}>No PDF</span>
                )
            )
        },
        {
            key: 'createdAt',
            header: 'Created On',
            render: (row: Notice) => {
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
            render: (row: Notice) => (
                <div className="flex space-x-2 items-center">
                    <IconButton onClick={() => handleOpenEditNoticeModal(row)}>
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
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search notices..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            <PageHeader
                title="Notice Management"
                buttonText="Add Notice"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddNoticeModal}
            />

            <AnimatePresence>
                {addNoticeModalOpen && (
                    <Modal
                        open={addNoticeModalOpen}
                        onClose={handleCloseAddNoticeModal}
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
                                    onClick={handleCloseAddNoticeModal}
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
                                    {currentNotice ? "Edit Notice" : "Add New Notice"}
                                </Typography>
                            </Box>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel id="notice-type-label">Notice Type {theStar} </InputLabel>
                                    <Select
                                        labelId="notice-type-label"
                                        value={noticeType}
                                        label="Notice Type"
                                        onChange={(e) => setNoticeType(e.target.value)}
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
                                    >
                                        <MenuItem value="Student">Student</MenuItem>
                                        <MenuItem value="Teacher">Teacher</MenuItem>
                                        <MenuItem value="Staff">Staff</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    fullWidth
                                    label={
                                        <span style={{ color: '#5F7161', fontWeight: 500 }}>
                                            Title (English) {theStar}
                                        </span>
                                    }
                                    variant="outlined"
                                    value={titleEnglish}
                                    onChange={(e) => setTitleEnglish(e.target.value)}
                                    sx={{
                                        mt: 2,
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
                                    InputProps={{
                                        style: {
                                            fontSize: '1rem',
                                            padding: '5px 5px',
                                        }
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label={
                                        <span style={{ color: '#5F7161', fontWeight: 500 }}>
                                            Title (Bangla) - Optional
                                        </span>
                                    }
                                    variant="outlined"
                                    value={titleBangla}
                                    onChange={(e) => setTitleBangla(e.target.value)}
                                    sx={{
                                        mt: 2,
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
                                    InputProps={{
                                        style: {
                                            fontSize: '1rem',
                                            padding: '5px 5px',
                                        }
                                    }}
                                />

                                <Box sx={{ mt: 2 }}>
                                    {selectedFile ? (
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            border: '1px solid rgba(26,60,52,0.2)',
                                            borderRadius: '6px',
                                            p: 1,
                                            mb: 1
                                        }}>
                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                {selectedFile.name}
                                            </Typography>
                                            <IconButton
                                                onClick={() => {
                                                    setSelectedFile(null);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                                size="small"
                                                sx={{ color: '#DC2626' }}
                                            >
                                                <X size={16} />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            value={pdfLink}
                                            onChange={(e) => setPdfLink(e.target.value)}
                                            label={
                                                <>
                                                    Select PDF or Enter URL Here
                                                    {theStar}
                                                </>
                                            }

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
                                    )}

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="application/pdf"
                                        style={{ display: 'none' }}
                                    />

                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<Upload size={16} />}
                                            onClick={() => fileInputRef.current?.click()}
                                            sx={{
                                                borderRadius: '6px',
                                                textTransform: 'none',
                                                fontSize: '0.875rem',
                                                py: 0.5,
                                                borderColor: 'rgba(26,60,52,0.3)',
                                                color: '#1A3C34',
                                                '&:hover': {
                                                    borderColor: '#1A3C34',
                                                    backgroundColor: 'rgba(26, 60, 52, 0.04)',
                                                },
                                            }}
                                        >
                                            Select PDF
                                        </Button>

                                        {selectedFile && (
                                            <Button
                                                variant="contained"
                                                onClick={handleUpload}
                                                disabled={isUploading}
                                                startIcon={isUploading ? <CircularProgress size={16} /> : <Upload size={16} />}
                                                sx={{
                                                    borderRadius: '6px',
                                                    textTransform: 'none',
                                                    fontSize: '0.875rem',
                                                    py: 0.5,
                                                    backgroundColor: '#1A3C34',
                                                    '&:hover': {
                                                        backgroundColor: '#0F2922',
                                                    },
                                                    '&:disabled': {
                                                        backgroundColor: 'rgba(26, 60, 52, 0.5)',
                                                    }
                                                }}
                                            >
                                                {isUploading ? 'Uploading...' : 'Upload'}
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </motion.div>

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
                                        onClick={handleCloseAddNoticeModal}

                                    >
                                        Cancel
                                    </CancelButton>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <SubmitButton
                                        onClick={handleCreateOrUpdateNotice}
                                        // disabled={(isCreatingNotice || isUpdatingNotice || isUploading) || !titleEnglish.trim() || (!pdfLink.trim() && !selectedFile)}
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
                                        {(isCreatingNotice || isUpdatingNotice) ? (
                                            <span>{currentNotice ? "Updating..." : "Submitting..."}</span>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{currentNotice ? "Update" : "Submit"}</span>
                                               
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
                        Failed to load notices
                    </Alert>
                ) : notices.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No notices found. {searchTerm ? "Try a different search term." : "Create your first notice."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<Notice>
                            columns={columns}
                            data={notices}
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
                onConfirm={() => handleDeleteNotice()}
                title="Delete Notice"
                description="Are you sure you want to delete this notice? All associated data will be permanently removed."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default NoticeList;