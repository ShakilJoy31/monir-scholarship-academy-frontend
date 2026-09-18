"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Avatar,
  Chip,
} from "@mui/material";
import { Download, Edit, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { Visibility } from "@mui/icons-material";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { OnlineAdmissionFormValues } from "@/app/super-admin/schemas/admission/onlineAdmissionSchema";
import { useDeleteOnlineAdmissionMutation, useGetAllOnlineAdmissionsQuery } from "@/app/store/api/admission/admissionApi";
import Link from "next/link";


interface OnlineAdmission extends OnlineAdmissionFormValues {
  id: number;
  status: "pending" | "Accepted" | "Canceled";
  [key: string]: unknown;
}

const OnlineAdmission = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllOnlineAdmissionsQuery({
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

  const admissions: OnlineAdmission[] = Array.isArray(responseData?.data)
    ? responseData.data
    : responseData?.data || [];

  const [deleteAdmission] = useDeleteOnlineAdmissionMutation();

  const totalPages = responseData?.meta?.totalPage || 1;

  const handleDeleteAdmission = async () => {
    await handleDeleteConfirmation(
      async (admissionId) => {
        await deleteAdmission(admissionId).unwrap();
        refetch();
      },
      {
        successMessage: "Admission deleted successfully",
        errorMessage: "Failed to delete admission",
      }
    );
  };

  const columns = [
    {
      key: "sl",
      header: "SL",
      render: (row: OnlineAdmission, index?: number) =>
        index !== undefined ? index + 1 : null,
    },
    {
      key: "applicationId",
      header: "Application ID",
    },
    {
      key: "avatar",
      header: "Image",
      render: (row: OnlineAdmission) => (
        <Avatar
          src={row.avatar || "/default-avatar.png"}
          alt={row.name}
          sx={{ width: 40, height: 40 }}
        />
      ),
    },
    {
      key: "name",
      header: "Name",
    },
    {
      key: "phone",
      header: "Phone",
    },
    {
      key: "email",
      header: "Email",
    },
   {
  key: "status",
  header: "Status",
  render: (row: OnlineAdmission) => {
    let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "warning";
    if (row.status === "Accepted") color = "success";
    else if (row.status === "Canceled") color = "error";
    
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
      key: "actions",
      header: "Actions",
      render: (row: OnlineAdmission) => (
        <div className="flex space-x-2 items-center">
          <Visibility
            className="cursor-pointer"
            onClick={() =>
              router.push(`/branch-admin/pages/online-admission/${row.id}`)
            }
          />
          <IconButton
            onClick={() =>
              router.push(`/branch-admin/pages/online-admission/edit/${row.id}`)
            }
          >
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
      ),
    },
  ];

  return (
    <Box>
      {/* <PageHeader
        title="Online Admissions"
        buttonText="Add Admission"
        buttonIcon={<Plus size={20} />}
        onButtonClick={() => router.push("/branch-admin/pages/online-admission-student")}
      /> */}

        <div className="flex justify-between items-center mb-8 w-full">
          <h2 className="text-sm md:text-2xl font-bold">Online Admissions</h2>
          <div className="flex gap-3">
            <Link href={"/branch-admin/pages/online-admission-student"}>
            <button className="text-xs md:text-[18px] px-3 md:px-6 py-1.5 rounded-sm bg-[#035140] hover:bg-[#024030] hover:cursor-pointer text-white flex items-center gap-2"><Plus className="hidden md:flex md:w-[1em] md:h-[1em]" />Add Admission</button>
            </Link>
            <Link href={"/branch-admin/pages/online-admission-student-form"}>
            <button className="text-xs md:text-[18px] px-3 md:px-6 py-1.5 rounded-sm  bg-[#035140] hover:bg-[#024030] hover:cursor-pointer text-white flex items-center gap-2"><Download className="hidden md:flex md:w-[1em] md:h-[1em]" />Download Form</button>
            </Link>
            
          </div>
        </div>


      <Box sx={{ mb: 2 }}>
        <SearchingInputField
          placeholder="Search admissions..."
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
            Failed to load admissions
          </Alert>
        ) : admissions.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No admissions found.{" "}
            {searchTerm
              ? "Try a different search term."
              : "Create your first admission."}
          </Typography>
        ) : (
          <>
            <ReusableTable<OnlineAdmission> columns={columns} data={admissions} />
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
        onConfirm={() => handleDeleteAdmission()}
        title="Delete Admission"
        description="Are you sure you want to delete this admission? All associated data will be permanently removed."
        isLoading={isDeleting}
      />
    </Box>
  );
};

export default OnlineAdmission;