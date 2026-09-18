// hooks/useDeleteConfirmation.ts
import { useState } from "react";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";

interface DeleteOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const useDeleteConfirmation = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = (id: number) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleDelete = async (
    deleteFunction: (id: number) => Promise<void>,
    options?: DeleteOptions
  ) => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      await deleteFunction(itemToDelete);
      toastShowing(
        options?.successMessage || "Item deleted successfully",
        "bottom-right",
        2000,
        "green",
        "white"
      );
      options?.onSuccess?.();
    } catch (error) {
      console.error("Error deleting item:", error);
      toastShowing(
        options?.errorMessage || "Failed to delete item",
        "bottom-right",
        2000,
        "red",
        "white"
      );
      options?.onError?.(error);
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  return {
    isDeleteModalOpen,
    itemToDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
  };
};