"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useGetAllBranchesQuery,
} from "@/app/store/api/branch/branchApi";
import { BranchFormValues, BranchSchema } from "../../../super-admin/schemas/branchSchema";
import AddEditBranch from "@/components/pageComponents/super-admin-components/AddEditBranch";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import { theStar } from "@/lib/requiredJSX";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";

interface Branch extends BranchFormValues {
  id: number;
  status: "active" | "inactive";
  [key: string]: unknown;
}

interface ApiResponse {
  data?: Branch[];
}

const CreateBranch = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [branchToDelete, setBranchToDelete] = useState<number | null>(null);
  const [currentBranch, setCurrentBranch] = useState<{
    id: number | null;
    data: BranchFormValues;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const userInfo = getUserInfoFromToken();

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllBranchesQuery({id: userInfo?.id});

  const branches: Branch[] = Array.isArray(responseData)
    ? responseData
    : (responseData as ApiResponse)?.data || [];

  const [createBranch, { isLoading: createLoading }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: updateLoading }] = useUpdateBranchMutation();
  const [deleteBranch, { data: deleteData }] = useDeleteBranchMutation();

  const handleOpenModal = (branch: Branch | null = null) => {
    if (branch) {
      setCurrentBranch({ id: branch.id, data: branch });
    } else {
      setCurrentBranch(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentBranch(null);
    setError(null);
  };

  const handleSubmit = async (data: BranchFormValues) => {
    if(!data?.name){
     return toastShowing("Please add Branch name", 'bottom-right', 2000, 'red', 'white')
    }
    if(!data?.address){
     return toastShowing("Please address name", 'bottom-right', 2000, 'red', 'white')
    }
    if(!data?.hotline){
     return toastShowing("Please hotline", 'bottom-right', 2000, 'red', 'white')
    }
    if(!data?.location){
     return toastShowing("Please location", 'bottom-right', 2000, 'red', 'white')
    }
    if(!data?.email){
    return  toastShowing("Please email", 'bottom-right', 2000, 'red', 'white')
    }
    if(!data?.phone){
     return toastShowing("Please phone", 'bottom-right', 2000, 'red', 'white')
    }
    // console.log(data)
      // remove empty fields
  const cleanedData = Object.fromEntries(
    Object.entries(data).filter(
      ([key, value]) =>
        !["eiin", "address", "principalVoice", "vicePrincipalVoice"].includes(
          key
        ) || (value !== "" && value !== null && value !== undefined)
    )
  );
  // console.log("cleanedData", cleanedData)
    try {
      if (currentBranch?.id) {
        await updateBranch({ id: currentBranch.id, ...cleanedData }).unwrap();
        toastShowing("Branch has been updated successfully", 'bottom-right', 2000, 'green', 'white');
      } else {
        await createBranch({schoolId:userInfo.id, ...cleanedData}).unwrap();
        toastShowing("New branch has been created successfully", 'bottom-right', 2000, 'green', 'white');
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      toastShowing((err as { data?: { message?: string } })?.data?.message ||
        (err as Error).message ||
        'Unknown error', 'bottom-right', 2000, 'red', 'white');

      setError(
        (err as { data?: { message?: string } })?.data?.message ||
        (err as Error).message ||
        'Unknown error'
      );
      console.error("Error saving branch:", err);
    }
  };

  const handleDeleteClick = (id: number) => {
    setBranchToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!branchToDelete) return;

    try {
      setIsDeleting(true);
      await deleteBranch(branchToDelete).unwrap();
      toastShowing(deleteData?.message, 'bottom-right', 2000, 'green', 'white');
      refetch();
    } catch (err) {
      toastShowing((err as { data?: { message?: string } })?.data?.message || 'OPPS! Something went wrong!'
        , 'bottom-right', 2000, 'green', 'white')
      console.error("Error saving school:", err);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setBranchToDelete(null);
    }
  };


  const columns = [
    {
      key: "sl",
      header: "SL",
      render: (row: Branch, index?: number) => (index !== undefined ? index + 1 : null),
    },
    {
      key: "name",
      header: "Name",
    },
    {
      key: "location",
      header: "Location",
    },
    {
      key: "address",
      header: "Address",
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "hotline",
      header: "Hotline",
    },
    {
      key: "phone",
      header: "Phone",
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Branch) => (
        <div className="flex gap-2">
          <IconButton
            onClick={() => handleOpenModal(row)}
            
          >
            <Edit className="text-[#035140] hover:bg-[#035140]/10" size={18} /> 
          </IconButton>
          <IconButton
            onClick={() => handleDeleteClick(row.id)}
            
          >
            <Trash2 className="text-red-500  hover:text-red-600" size={18} />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <Box sx={{ mx: "auto", pt: 10 }}>
      <PageHeader
        title="Branches Management"
        buttonText="Add Branch"
        buttonIcon={<Plus size={20} />}
        onButtonClick={() => handleOpenModal()}
      />

      <AddEditBranch
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentBranch}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={currentBranch?.id ? "Edit Branch" : "Create New Branch"}
        schema={BranchSchema}
        defaultValues={{
          name: "",
          location: "",
          address: "",
          email: "",
          hotline: "",
          phone: "",
          principalVoice: "",
          vicePrincipalVoice: "",
          eiin: "",
        }}
        formFields={[
          { name: "name", label: "Branch Name", gridWidth: 6, theStar },
          { name: "location", label: "Location", gridWidth: 6, theStar },
          { name: "address", label: "Address", multiline: true, rows: 3, gridWidth: 12, theStar },
          { name: "email", label: "Email", type: "email", gridWidth: 4, theStar },
          { name: "hotline", label: "Hotline", gridWidth: 4, theStar },
          { name: "phone", label: "Phone", gridWidth: 4, theStar },
          { name: "principalVoice", label: "principalVoice", gridWidth: 4 },
          { name: "vicePrincipalVoice", label: "vicePrincipalVoice", gridWidth: 4 },
          { name: "eiin", label: "eiin", gridWidth: 4 },
        ]}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Branch"
        description="Are you sure you want to delete this branch? All associated data will be permanently removed."
        isLoading={isDeleting}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load branches
          </Alert>
        ) : branches.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No branches found. Create your first branch.
          </Typography>
        ) : (
          <ReusableTable<Branch>
            columns={columns}
            data={branches}
          />
        )}
      </Paper>
    </Box>
  );
};

export default CreateBranch;