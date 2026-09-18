"use client";
import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    IconButton,
    Modal,
} from "@mui/material";
import { Plus, Edit, Trash2, X, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { buttonLoader, getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
import { useCreateBannerMutation, useDeleteBannerMutation, useGetAllBannersQuery, useUpdateBannerMutation } from "@/app/store/api/classes/bannerApi";
import { useAddThumbnailMutation } from "@/app/store/api/file/fileApi";
import Image from "next/image";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface Banner {
    id: number;
    image: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

const BannerList = () => {
    const [addBannerModalOpen, setAddBannerModalOpen] = useState<boolean>(false);
    const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [preview, setPreview] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<File | undefined>(undefined);

    const userInfo = getUserInfoFromToken();
    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllBannersQuery({
        page: page + 1,
        size: rowsPerPage,
        search: searchTerm,
        branchId: userInfo?.branchId,
    });

    const {
        isDeleteModalOpen,
        itemToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDelete: handleDeleteConfirmation,
    } = useDeleteConfirmation();

    const [createBanner, { isLoading: isCreatingBanner }] = useCreateBannerMutation();
    const [updateBanner, { isLoading: isUpdatingBanner }] = useUpdateBannerMutation();
    const [deleteBanner] = useDeleteBannerMutation();
    const [addThumbnail, { isLoading: isUploading }] = useAddThumbnailMutation();

    const banners: Banner[] = Array.isArray(responseData?.data)
        ? responseData.data
        : responseData?.data || [];

    const handleOpenAddBannerModal = () => {
        setCurrentBanner(null);
        setPreview(null);
        setUploadedImage(undefined);
        setAddBannerModalOpen(true);
    };

    const handleOpenEditBannerModal = (banner: Banner) => {
        setCurrentBanner(banner);
        setPreview(banner.image);
        setUploadedImage(undefined);
        setAddBannerModalOpen(true);
    };

    const handleCloseAddBannerModal = () => {
        setAddBannerModalOpen(false);
        setPreview(null);
        setUploadedImage(undefined);
        setCurrentBanner(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setUploadedImage(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleCreateOrUpdateBanner = async () => {
        try {
            let imageUrl = currentBanner?.image || "";

            // Upload image if new file was selected
            if (uploadedImage) {
                try {
                    const formData = new FormData();
                    formData.append("photo", uploadedImage);

                    const response = await addThumbnail(formData).unwrap();
                    imageUrl = response?.data?.[0] || "";
                } catch (err) {
                    console.error(err);
                    toastShowing('Image upload error', 'bottom-right', 2000, 'red', 'white');
                    return;
                }
            }

            if (!imageUrl) {
                toastShowing('Please upload an image', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            if (currentBanner) {
                // Update existing banner
                await updateBanner({ id: currentBanner.id, image: imageUrl }).unwrap();
                toastShowing('Banner updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new banner
                await createBanner({ image: imageUrl }).unwrap();
                toastShowing('Banner created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddBannerModal();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentBanner ? "Failed to update banner" : "Failed to create banner")
            );
            console.error("Error saving banner:", err);
        }
    };

    const handleDeleteBanner = async () => {
        await handleDeleteConfirmation(
            async (bannerId) => {
                await deleteBanner(bannerId).unwrap();
                refetch();
            },
            {
                successMessage: "Banner deleted successfully",
                errorMessage: "Failed to delete banner",
            }
        );
    };

    const totalPages = responseData?.meta?.totalPage || 1;

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: Banner, index?: number) => (index !== undefined ? index + 1 : null),
    },
        {
            key: 'image',
            header: 'Banner Image',
            render: (row: Banner) => (
                <Box sx={{ width: 100, height: 60, position: 'relative' }}>
                    <Image
                        src={row.image}
                        alt="Banner"
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded"
                    />
                </Box>
            )
        },
        {
            key: 'createdAt',
            header: 'Created On',
            render: (row: Banner) => {
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
            render: (row: Banner) => (
                <div className="flex space-x-2 items-center">
                    <IconButton onClick={() => handleOpenEditBannerModal(row)}>
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
             <PageHeader
                title="Banner Management"
                buttonText="Add Banner"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddBannerModal}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search banners..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            {/* Add/Edit Banner Modal */}
            <AnimatePresence>
                {addBannerModalOpen && (
                    <Modal
                        open={addBannerModalOpen}
                        onClose={handleCloseAddBannerModal}
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
                                    onClick={handleCloseAddBannerModal}
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
                                    {currentBanner ? "Edit Banner" : "Add Banner"}
                                </Typography>
                            </Box>

                            {/* Image upload section */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Box
                                    sx={{
                                        border: '2px dashed',
                                        borderColor: 'rgba(26,60,52,0.2)',
                                        borderRadius: '6px',
                                        p: 3,
                                        textAlign: 'center',
                                        mb: 2,
                                        '&:hover': {
                                            borderColor: '#1A3C34',
                                        }
                                    }}
                                >
                                    <label htmlFor="banner-upload">
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <ImageIcon size={40} color="#5F7161" />
                                            <Typography variant="body1" sx={{ mt: 1, color: '#5F7161' }}>
                                                Click to upload banner image
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#5F7161' }}>
                                                (Recommended size: 1200x400px)
                                            </Typography>
                                        </Box>
                                    </label>
                                    <input
                                        id="banner-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                    />
                                </Box>

                                {/* Preview of Uploaded Image */}
                                {preview && (
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '200px',
                                            borderRadius: '6px',
                                            overflow: 'hidden',
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            mb: 2
                                        }}
                                    >
                                        <Image
                                            src={preview}
                                            alt="Banner Preview"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                        <IconButton
                                            onClick={() => {
                                                setPreview(null);
                                                setUploadedImage(undefined);
                                            }}
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                                }
                                            }}
                                        >
                                            <X size={18} />
                                        </IconButton>
                                    </Box>
                                )}
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
                                        onClick={handleCloseAddBannerModal}
                                       
                                    >
                                        Cancel
                                    </CancelButton>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <SubmitButton
                                        onClick={handleCreateOrUpdateBanner}
                                        disabled={(isCreatingBanner || isUpdatingBanner || isUploading) || !preview}
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
                                        {(isCreatingBanner || isUpdatingBanner || isUploading) ? (
                                            <span>{currentBanner ? "Updating..." : "Submitting..."}</span>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{currentBanner ? "Update" : "Submit"}</span>
                                                
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
                        Failed to load banners
                    </Alert>
                ) : banners.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No banners found. {searchTerm ? "Try a different search term." : "Create your first banner."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<Banner>
                            columns={columns}
                            data={banners}
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
                onConfirm={() => handleDeleteBanner()}
                title="Delete Banner"
                description="Are you sure you want to delete this banner? This action cannot be undone."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default BannerList;