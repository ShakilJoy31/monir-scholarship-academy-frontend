"use client";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { validateEmptyFields } from "@/lib/objectModify";
import { useParams } from "next/navigation";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { CircularProgress } from "@mui/material";
import { UpdateSchoolFormValues, UpdateSchoolSchema } from "@/app/super-admin/schemas/schoolUpdateSchema";
import { useGetSchoolByIdQuery, useUpdateSchoolMutation } from "@/app/store/api/createSchool/createSchoolApi";

export default function EditSchool() {
    const { id } = useParams();
    const { data: schoolData, isLoading: isSchoolLoading } = useGetSchoolByIdQuery(id);
    const school = schoolData?.data;

    const [updateSchool, { isLoading: updateLoading }] = useUpdateSchoolMutation();


    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<UpdateSchoolFormValues>({
        resolver: zodResolver(UpdateSchoolSchema),
    });

    // Set form values when school data is loaded
    useEffect(() => {
        if (school) {
            reset({
                name: school.name || "",
                email: school.email || "",
                branchPermission: school.branchPermission || 0,
            });
        }
    }, [school, reset]);

    const onSubmit = async (data: UpdateSchoolFormValues) => {
        try {
            // Prepare payload
            const payload = {
                ...data,
            };

            // Remove empty fields
            const modifiedPayload = validateEmptyFields(payload);

            // Update school
            await updateSchool({ id, ...modifiedPayload }).unwrap();

            toastShowing(
                "School updated successfully",
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
                return "Failed to update school";
            })();

            toastShowing(
                errorMessage || "Failed to update school",
                "bottom-right",
                2000,
                "red",
                "white"
            );
        }
    };

    if (isSchoolLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="items-center flex justify-center"><CircularProgress /></div>
            </div>
        );
    }

    if (!school) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500">School not found</p>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto p-6 bg-white shadow-lg rounded-md mt-10">
            <CancelButton
                // startIcon={<FaArrowLeftLong />}
                onClick={() => window.history.back()}
                // sx={{
                //     textTransform: 'none',
                //     color: '#d32f2f',
                //     py: { xs: 0.5, sm: 1 },
                //     fontSize: { xs: '0.875rem', sm: '1rem' }
                // }}
                // size={'medium'}
            >
                Back
            </CancelButton>

            <h2 className="text-xl font-bold my-4">Edit School Information</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            School Name
                        </label>
                        <input
                            {...register("name")}
                            placeholder="School Name"
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
                            Branch Permission
                        </label>
                        <input
                            {...register("branchPermission", { valueAsNumber: true })}
                            type="number"
                            placeholder="Branch Permission"
                            className="w-full p-2 border rounded"
                        />
                        {errors.branchPermission && (
                            <p className="text-red-500 text-xs">{errors.branchPermission.message}</p>
                        )}
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
                        disabled={updateLoading}
                    >
                        {updateLoading ? (
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