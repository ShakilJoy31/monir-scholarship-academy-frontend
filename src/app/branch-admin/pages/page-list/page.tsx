"use client";
import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Button,
} from "@mui/material";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { useRouter } from "next/navigation";
import { useDeletePageMutation, useGetAllPagesQuery } from "@/app/store/api/classes/PageApi";
import { BsThreeDotsVertical } from "react-icons/bs";

interface Page {
    id: number;
    title: string;
    slug: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

const PageList = () => {
    const router = useRouter();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllPagesQuery({
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

    const [deletePage] = useDeletePageMutation();

    const pages: Page[] = Array.isArray(responseData?.data)
        ? responseData.data
        : responseData?.data || [];

    const handleOpenAddPage = () => {
        router.push('/branch-admin/pages/page-list/create-page');
    };

    const handleOpenEditPage = (page: Page) => {
        router.push(`/branch-admin/pages/page-list/edit-page/${page.slug}`);
    };

    const handleOpenViewPage = (page: Page) => {
        router.push(`/branch-admin/pages/page-list/view-page/${page.slug}`);
    };

    const handleDeletePage = async () => {
        await handleDeleteConfirmation(
            async (pageId) => {
                await deletePage(pageId).unwrap();
                refetch();
            },
            {
                successMessage: "Page deleted successfully",
                errorMessage: "Failed to delete page",
            }
        );
    };

    const totalPages = responseData?.meta?.totalPage || 1;

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: Page, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'title',
            header: 'Page Title'
        },
        {
            key: 'slug',
            header: 'Slug'
        },
        {
            key: 'status',
            header: 'Status',
            render: (row: Page) => (
                <span style={{ 
                    color: row.status === 'Published' ? '#10B981' : 
                          row.status === 'Draft' ? '#F59E0B' : '#EF4444',
                    fontWeight: 500
                }}>
                    {row.status}
                </span>
            )
        },
        {
            key: 'createdAt',
            header: 'Created On',
            render: (row: Page) => {
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
            render: (row: Page) => {
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
                                        handleOpenViewPage(row);
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
                                    startIcon={<Eye size={16} />}
                                >
                                    View
                                </Button>

                                <Button
                                    onClick={() => {
                                        handleOpenEditPage(row);
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
                                    startIcon={<Edit size={16} />}
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
                                    startIcon={<Trash2 size={16} />}
                                >
                                    {isDeleting && itemToDelete === row.id ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            Deleting
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
                title="Page Management"
                buttonText="Add Page"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddPage}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search pages..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            <Paper>
                {isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        Failed to load pages
                    </Alert>
                ) : pages.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No pages found. {searchTerm ? "Try a different search term." : "Create your first page."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<Page>
                            columns={columns}
                            data={pages}
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
                onConfirm={() => handleDeletePage()}
                title="Delete Page"
                description="Are you sure you want to delete this page? All associated data will be permanently removed."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default PageList;