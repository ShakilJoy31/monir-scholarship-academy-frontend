"use client";
import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    IconButton,
    Modal
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
import { useCreateGalleryMutation, useDeleteGalleryMutation, useGetAllGalleriesQuery, useUpdateGalleryMutation } from "@/app/store/api/classes/galleryApi";
import { useAddThumbnailMutation } from "@/app/store/api/file/fileApi";
import Image from "next/image";
import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface Gallery {
    id: number;
    image: string;  // Changed from images[] to image (string)
    branchId: number;
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

const GalleryList = () => {
    const [addGalleryModalOpen, setAddGalleryModalOpen] = useState<boolean>(false);
    const [currentGallery, setCurrentGallery] = useState<Gallery | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const userInfo = getUserInfoFromToken();

    const {
        data: responseData,
        isLoading,
        isError,
        refetch,
    } = useGetAllGalleriesQuery({
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

    const [createGallery, { isLoading: isCreatingGallery }] = useCreateGalleryMutation();
    const [updateGallery, { isLoading: isUpdatingGallery }] = useUpdateGalleryMutation();
    const [deleteGallery] = useDeleteGalleryMutation();
    const [addThumbnail, { isLoading: isUploading }] = useAddThumbnailMutation();

    const galleries: Gallery[] = Array.isArray(responseData?.data)
        ? responseData.data
        : responseData?.data?.Galleries || []; // Updated to match your response structure

    const handleOpenAddGalleryModal = () => {
        setCurrentGallery(null);
        setPreviews([]);
        setUploadedImages([]);
        setAddGalleryModalOpen(true);
    };

    const handleOpenEditGalleryModal = (gallery: Gallery) => {
        setCurrentGallery(gallery);
        setPreviews([gallery.image]); // Changed to use single image
        setUploadedImages([]);
        setAddGalleryModalOpen(true);
    };

    const handleCloseAddGalleryModal = () => {
        setAddGalleryModalOpen(false);
        setPreviews([]);
        setUploadedImages([]);
        setCurrentGallery(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            const newFiles = Array.from(selectedFiles);
            setUploadedImages(prev => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setPreviews(prev => prev.filter((_, i) => i !== index));
        setUploadedImages(prev => prev.filter((_, i) => i !== index - (currentGallery ? 1 : 0))); // Adjusted for single image
    };


    const handleCreateOrUpdateGallery = async () => {
        try {
            let imageUrls = currentGallery?.image ? [currentGallery.image] : [];

            // Upload new images if selected
            if (uploadedImages.length > 0) {
                try {
                    const newImageUrls = [];
                    for (const file of uploadedImages) {
                        const formData = new FormData();
                        formData.append("photo", file);
                        const response = await addThumbnail(formData).unwrap();
                        if (response?.data?.[0]) {
                            newImageUrls.push(response.data[0]);
                        }
                    }
                    imageUrls = [...imageUrls, ...newImageUrls];
                } catch (err) {
                    console.error(err);
                    toastShowing('Image upload error', 'bottom-right', 2000, 'red', 'white');
                    return;
                }
            }

            if (!imageUrls.length) {
                toastShowing('Please upload an image', 'bottom-right', 2000, 'red', 'white');
                return;
            }

            if (currentGallery) {
                // Update existing gallery
                await updateGallery({ id: currentGallery.id, image: imageUrls[0] }).unwrap();
                toastShowing('Gallery updated successfully', 'bottom-right', 2000, 'green', 'white');
            } else {
                // Create new gallery
                const payload = { images: imageUrls };
                await createGallery(payload).unwrap();
                toastShowing('Gallery created successfully', 'bottom-right', 2000, 'green', 'white');
            }

            refetch();
            handleCloseAddGalleryModal();
        } catch (err) {
            toast.error(
                (err as { data?: { message?: string } })?.data?.message ||
                (currentGallery ? "Failed to update gallery" : "Failed to create gallery")
            );
            console.error("Error saving gallery:", err);
        }
    };

    const handleDeleteGallery = async () => {
        await handleDeleteConfirmation(
            async (galleryId) => {
                await deleteGallery(galleryId).unwrap();
                refetch();
            },
            {
                successMessage: "Gallery deleted successfully",
                errorMessage: "Failed to delete gallery",
            }
        );
    };

    const totalPages = responseData?.meta?.totalPage || 1;

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: Gallery, index?: number) => (index !== undefined ? index + 1 : null),
    },
        {
            key: 'image',
            header: 'Gallery Image',
            render: (row: Gallery) => (
                <Box sx={{ width: 80, height: 60, position: 'relative' }}>
                    <Image
                        src={row.image}
                        alt={`Gallery ${row.id}`}
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
            render: (row: Gallery) => {
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
            render: (row: Gallery) => (
                <div className="flex space-x-2 items-center">
                    <IconButton onClick={() => handleOpenEditGalleryModal(row)}>
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
                title="Gallery Management"
                buttonText="Add Gallery"
                buttonIcon={<Plus size={20} />}
                onButtonClick={handleOpenAddGalleryModal}
            />

            <Box sx={{ mb: 2 }}>
                <SearchingInputField
                    placeholder="Search galleries..."
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setPage(0);
                    }}
                    debounceTime={300}
                    maxWidth={400}
                    height="36px"
                />
            </Box>

            {/* Add/Edit Gallery Modal */}
            <AnimatePresence>
                {addGalleryModalOpen && (
                    <Modal
                        open={addGalleryModalOpen}
                        onClose={handleCloseAddGalleryModal}
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
                                width: '600px',
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
                                    onClick={handleCloseAddGalleryModal}
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
                                    {currentGallery ? "Edit Gallery" : "Add Gallery"}
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
                                    <label htmlFor="gallery-upload">
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
                                                Click to upload gallery image
                                            </Typography>
                                        </Box>
                                    </label>
                                    <input
                                        id="gallery-upload"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                    />
                                </Box>

                                {/* Preview of Uploaded Images */}
                                {previews.length > 0 && (
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                            gap: 2,
                                            mb: 2,
                                            maxHeight: '400px',
                                            overflowY: 'auto',
                                            p: 1
                                        }}
                                    >
                                        {previews.map((preview, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    height: '120px',
                                                    borderRadius: '6px',
                                                    overflow: 'hidden',
                                                    border: '1px solid rgba(0,0,0,0.1)',
                                                }}
                                            >
                                                <Image
                                                    src={preview}
                                                    alt={`Gallery Preview ${index + 1}`}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                />
                                                <IconButton
                                                    onClick={() => removeImage(index)}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 4,
                                                        right: 4,
                                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                                        color: 'white',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(0,0,0,0.7)',
                                                        }
                                                    }}
                                                >
                                                    <X size={16} />
                                                </IconButton>
                                            </Box>
                                        ))}
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
                                        onClick={handleCloseAddGalleryModal}
                                       
                                    >
                                        Cancel
                                    </CancelButton>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <SubmitButton
                                        onClick={handleCreateOrUpdateGallery}
                                        disabled={(isCreatingGallery || isUpdatingGallery || isUploading) || previews.length === 0}
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
                                        {(isCreatingGallery || isUpdatingGallery || isUploading) ? (
                                            <span>{currentGallery ? "Updating..." : "Submitting..."}</span>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{currentGallery ? "Update" : "Submit"}</span>
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
                        Failed to load galleries
                    </Alert>
                ) : galleries.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No galleries found. {searchTerm ? "Try a different search term." : "Create your first gallery."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<Gallery>
                            columns={columns}
                            data={galleries}
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
                onConfirm={() => handleDeleteGallery()}
                title="Delete Gallery"
                description="Are you sure you want to delete this gallery? This action cannot be undone."
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default GalleryList;