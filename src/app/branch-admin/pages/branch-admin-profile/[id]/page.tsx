"use client";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { validateEmptyFields } from "@/lib/objectModify";
import { useParams } from "next/navigation";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { z } from 'zod';
import { Button } from "@mui/material";
import { FaArrowLeftLong } from "react-icons/fa6";
import Image from "next/image";
import { XCircle } from "lucide-react";
import { useAddThumbnailMutation } from "@/app/store/api/file/fileApi";
import { useGetBranchAdminByIdQuery, useUpdateBranchAdminMutation } from "@/app/store/api/branch/branchApi";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";

// Schema for branch admin update
const UpdateBranchAdminSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    branchId: z.number().optional(),
    phone: z.string().optional(),
    avatar: z.string().optional(),
});

type UpdateBranchAdminFormValues = z.infer<typeof UpdateBranchAdminSchema>;

export default function EditBranchAdmin() {
    const { id } = useParams();
    const { data: adminData, isLoading: isAdminLoading } = useGetBranchAdminByIdQuery(id);
    const admin = adminData?.data;

    const [updateAdmin, { isLoading: updateLoading }] = useUpdateBranchAdminMutation();
    const [addThumbnail, { isLoading: uploadLoading }] = useAddThumbnailMutation();

    const [preview, setPreview] = useState<string | null>(admin?.avatar || null);
    const [uploadedImage, setUploadedImage] = useState<File | undefined>(undefined);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
    } = useForm<UpdateBranchAdminFormValues>({
        resolver: zodResolver(UpdateBranchAdminSchema),
    });

    // Set form values when admin data is loaded
    useEffect(() => {
        if (admin) {
            reset({
                name: admin.name || "",
                email: admin.email || "",
                branchId: admin.branchId || undefined,
                phone: admin.phone || "",
                avatar: admin.avatar || "",
            });
            setPreview(admin.avatar || null);
        }
    }, [admin, reset]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setUploadedImage(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setValue("avatar", ""); // Clear the existing URL if new file is uploaded
        }
    };

    const onSubmit = async (data: UpdateBranchAdminFormValues) => {
        try {
            let imageUrl = data.avatar || "";

            // Upload image if new file was selected
            if (uploadedImage) {
                const formData = new FormData();
                formData.append("photo", uploadedImage);
                const response = await addThumbnail(formData).unwrap();
                imageUrl = response?.data?.[0] || "";
            }

            // Prepare payload
            const payload = {
                ...data,
                avatar: imageUrl,
            };

            // Remove empty fields
            const modifiedPayload = validateEmptyFields(payload);

            // Update admin
            await updateAdmin({ id, ...modifiedPayload }).unwrap();

            toastShowing(
                "Branch admin updated successfully",
                "bottom-right",
                2000,
                "green",
                "white"
            );
        } catch (error: unknown) {
            console.error("Submission error:", error);

            const errorMessage = (() => {
                if (error instanceof Error) {
                    return error.message;
                }
                if (typeof error === "object" && error !== null && "data" in error) {
                    const errorData = error as { data?: { message?: string } };
                    return errorData.data?.message;
                }
                return "Failed to update branch admin";
            })();

            toastShowing(
                errorMessage || "Failed to update branch admin",
                "bottom-right",
                2000,
                "red",
                "white"
            );
        }
    };

    if (isAdminLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                {buttonLoader}
            </div>
        );
    }

    if (!admin) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500">Branch admin not found</p>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto p-6 bg-white shadow-lg rounded-md mt-10">
            <Button
                startIcon={<FaArrowLeftLong />}
                onClick={() => window.history.back()}
                sx={{
                    textTransform: 'none',
                    color: '#d32f2f',
                    py: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
                size={'medium'}
            >
                Back
            </Button>

            <h2 className="text-xl font-bold mb-4">Edit Branch Admin Information</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {/* Personal Information */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            {...register("name")}
                            placeholder="Full Name"
                            className="w-full p-2 border rounded"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="Email"
                            className="w-full p-2 border rounded"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Phone
                        </label>
                        <input
                            {...register("phone")}
                            placeholder="Phone"
                            className="w-full p-2 border rounded"
                            onInput={(e) => {
                                let value = (e.target as HTMLInputElement).value;

                                // Allow only digits
                                value = value.replace(/\D/g, "");

                                // Enforce max 11 digits
                                if (value.length > 11) {
                                    value = value.slice(0, 11);
                                }

                                // Must start with "01"
                                if (value.length > 0 && !value.startsWith("01")) {
                                    value = value.startsWith("0") ? "0" : "";
                                }

                                (e.target as HTMLInputElement).value = value;
                            }}
                        />

                        {errors.phone && (
                            <p className="text-red-500 text-xs">{errors.phone.message}</p>
                        )}
                    </div>

                    {/* Photo Upload */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Profile Photo
                        </label>
                        <div className="flex gap-3">
                            {preview && (
                                <div className="relative w-20 h-20 border rounded-md overflow-hidden mt-2">
                                    <Image
                                        src={preview}
                                        alt="Preview"
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        onClick={() => {
                                            setPreview(null);
                                            setUploadedImage(undefined);
                                            setValue("avatar", "");
                                        }}
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                            <div>
                                <div className="border-2 border-dashed rounded-md py-3 px-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#035140] file:text-white
                      hover:file:bg-[#035140]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-4 gap-x-4">
                    <CancelButton
                        onClick={() => window.history.back()}
                    >
                        Cancel
                    </CancelButton>
                    <SubmitButton
                        type="submit"
                        disabled={updateLoading || uploadLoading}
                    >
                        {updateLoading || uploadLoading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        ) : (
                            "Update"
                        )}
                    </SubmitButton>
                </div>
            </form>
        </div>
    );
}