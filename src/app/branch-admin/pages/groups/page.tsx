"use client";
import React, { useState, useMemo } from "react";
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import { useDeleteGroupSubjectMutation, useGetAllGroupSubjectsQuery } from "@/app/store/api/classes/groupApi";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { SelectChangeEvent } from '@mui/material';

interface GroupSubject {
    id: number;
    branchId: number;
    classNameId: number;
    subjectNameId: number;
    createdAt: string;
    updatedAt: string;
    class: {
        id: number;
        branchId: number;
        name: string;
        createdAt: string;
        updatedAt: string;
    };
    subject: {
        id: number;
        branchId: number;
        name: string;
        code: string;
        marks: number;
        passMarks: number;
        createdAt: string;
        updatedAt: string;
    };
    [key: string]: unknown;
}

interface ClassItem {
    id: number;
    name: string;
}

const GroupList = () => {
    const router = useRouter();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClass, setSelectedClass] = useState<number>(0); // 0 means all classes

    const { data: classes } = useGetAllClassQuery({ page: 1, size: 100000 });

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllGroupSubjectsQuery({
        page: page + 1,
        size: rowsPerPage,
        search: searchTerm,
        classId: selectedClass !== 0 ? selectedClass : undefined // More explicit handling
    });

    console.log("Selected Class:", selectedClass); // Debug what's being selected

    const {
        isDeleteModalOpen,
        itemToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    const [deleteGroup] = useDeleteGroupSubjectMutation();

    const transformedData = useMemo(() => {
        if (!responseData?.data) return [];
        return Array.isArray(responseData.data) ? responseData.data : [responseData.data];
    }, [responseData]);

    const handleOpenEditGroupModal = (group: GroupSubject) => {
        router.push(`/branch-admin/pages/groups/edit-group/${group.id}`);
    };

    const handleCreateGroup = () => {
        router.push('/branch-admin/pages/groups/create-group');
    };

    const handleClassChange = (event: SelectChangeEvent<number>) => {
        const value = Number(event.target.value);
        setSelectedClass(value);
        setPage(0);
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(0); // Reset to first page when searching
    };

    const handleDeleteGroup = async () => {
        if (itemToDelete === null) return;

        await handleDeleteConfirmation(
            async () => {
                await deleteGroup(itemToDelete).unwrap();
                refetch();
            },
            {
                successMessage: "Group deleted successfully",
                errorMessage: "Failed to delete group",
            }
        );
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage - 1); // Convert back to 0-based for state
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0); // Reset to first page when changing rows per page
    };

    const totalPages = responseData?.meta?.totalPage || 1;

const columns = [
    {
        key: "sl",
        header: "SL",
        render: (row: GroupSubject, index?: number) => (
            <div className="">
                {index !== undefined ? index + 1 : null}
            </div>
        ),
        headerClassName: "", // Center header
    },
    {
        key: 'class.name',
        header: 'Class Name',
        render: (row: GroupSubject) => (
            <div className="lg:w-auto w-32">
                {row.class.name}
            </div>
        ),
        headerClassName: "lg:w-auto w-32",
    },
    {
        key: 'subject.name',
        header: 'Subject Name',
        render: (row: GroupSubject) => (
            <div className="lg:w-auto w-32">
                {row.subject.name}
            </div>
        ),
        headerClassName: "lg:w-auto w-32",
    },
    {
        key: 'createdAt',
        header: 'Created On',
        render: (row: GroupSubject) => {
            try {
                const date = new Date(row.createdAt);
                return (
                    <div className="lg:w-auto w-32">
                        {date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                );
            } catch {
                return <div className="lg:w-auto w-32">Invalid date</div>;
            }
        },
        headerClassName: "lg:w-auto w-32 ",
    },
    {
        key: 'actions',
        header: 'Actions',
        render: (row: GroupSubject) => (
            <Box 
                display="flex" 
                gap={1} 
                className="lg:w-auto w-32 justify-center" // Center actions
            >
                <IconButton
                    onClick={() => handleOpenEditGroupModal(row)}
                    size="small"
                >
                    <Edit color="#035140" size={18} />
                </IconButton>
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(row.id);
                    }}
                    disabled={isDeleting && itemToDelete === row.id}
                    size="small"
                    sx={{
                        color: "#DC2626",
                        "&:hover": {
                            backgroundColor: "rgba(220, 38, 38, 0.1)",
                        },
                    }}
                >
                    {isDeleting && itemToDelete === row.id ? (
                        <CircularProgress size={18} />
                    ) : (
                        <Trash2 size={18} />
                    )}
                </IconButton>
            </Box>
        ),
        headerClassName: "lg:w-auto w-32",
    },
];

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader
                title="Group Management"
                buttonText="Add Group"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleCreateGroup}
            />

           <Box 
  sx={{ 
    mb: 3, 
    display: 'flex', 
    gap: 4, 
    width: { xs: '100%', lg: '50%' }, // Full width on mobile/tablet (xs), 50% on laptop (lg)
    flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on mobile, row on tablet+
    alignItems: { xs: 'stretch', sm: 'center' }, // Stretch inputs on mobile, center on tablet+
  }}
>
  <SearchingInputField
    placeholder="Search subjects..."
    onSearch={handleSearch}
    debounceTime={300}
    maxWidth={400}
    height="36px"
  />

  <FormControl fullWidth size="small" sx={{ width: { xs: '100%', sm: 'auto' } }}>
    <InputLabel>Class</InputLabel>
    <Select
      sx={{ height: 36 }}
      value={selectedClass}
      onChange={handleClassChange}
      label="Class"
    >
      <MenuItem value={0}>All Classes</MenuItem>
      {classes?.data?.map((cls: ClassItem) => (
        <MenuItem key={cls.id} value={cls.id}>
          {cls.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>

            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                {isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        Failed to load data. Please try again.
                    </Alert>
                ) : transformedData.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="body1" color="textSecondary">
                            {searchTerm || selectedClass !== 0
                                ? "No records match your search criteria."
                                : "No records found. Create your first group."}
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <ReusableTable<GroupSubject>
                            columns={columns}
                            data={transformedData}
                        />
                        <PaginationComponent
                            currentPage={page + 1}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleRowsPerPageChange}
                        />
                    </>
                )}
            </Paper>

            <DeleteConfirmationModal
                open={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteGroup}
                title="Delete Group Subject"
                description="Are you sure you want to delete this group subject? This action cannot be undone."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default GroupList;