"use client";
import { useGetStudentByIdQuery, useUpdateStudentMutation } from "@/app/store/api/student/studentApi";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { validateEmptyFields } from "@/lib/objectModify";
import { useParams } from "next/navigation";
import Image from "next/image";
import { XCircle } from "lucide-react";
import { useAddThumbnailMutation } from "@/app/store/api/file/fileApi";
import { StudentUpdateFormValues, StudentUpdateSchema } from "@/app/super-admin/schemas/studentUpdateSchema";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";

export default function EditStudent() {
    const { id } = useParams();
    const { data: studentData, isLoading: isStudentLoading } = useGetStudentByIdQuery(id);
    const student = studentData?.data;

    const [updateStudent, { isLoading: updateLoading }] = useUpdateStudentMutation();
    const [addThumbnail, { isLoading: uploadLoading }] = useAddThumbnailMutation();

    const [preview, setPreview] = useState<string | null>(student?.avatar || null);
    const [uploadedImage, setUploadedImage] = useState<File | undefined>(undefined);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
    } = useForm<StudentUpdateFormValues>({
        resolver: zodResolver(StudentUpdateSchema),
    });

    // Set form values when student data is loaded
    useEffect(() => {
        if (student) {
            reset({
                name: student.name || "",
                email: student.email || "",
                gender: student.gender || "",
                religion: student.religion || "",
                dob: student.dob || "",
                bloodGroup: student.bloodGroup || "",
                address: student.address || "",
                fatherName: student.fatherName || "",
                motherName: student.motherName || "",
                parentPhone: student.parentPhone || "",
                avatar: student.avatar || "",
            });
            setPreview(student.avatar || null);
        }
    }, [student, reset]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setUploadedImage(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setValue("avatar", ""); // Clear the existing URL if new file is uploaded
        }
    };

    const onSubmit = async (data: StudentUpdateFormValues) => {
         console.log("Form data:", data);
  console.log("Form errors:", errors);
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

             console.log(modifiedPayload)

            // Update student
            await updateStudent({ id, ...modifiedPayload }).unwrap();

            toastShowing(
                "Student updated successfully",
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
                return "Failed to update student";
            })();

            toastShowing(
                errorMessage || "Failed to update student",
                "bottom-right",
                2000,
                "red",
                "white"
            );
        }
    };

    if (isStudentLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                {buttonLoader}
            </div>
        );
    }

    if (!student) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500">Student not found</p>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto p-6 bg-white shadow-lg rounded-md mt-8">
            <CancelButton onClick={() => window.history.back()}>Back</CancelButton>
            <h2 className="text-xl font-bold mb-4">Edit Student Information</h2>
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
                            Gender
                        </label>
                        <select
                            {...register("gender")}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.gender && (
                            <p className="text-red-500 text-xs">{errors.gender.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Religion
                        </label>
                        <select
                            {...register("religion")}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Select Religion</option>
                            <option value="Islam">Islam</option>
                            <option value="Hindu">Hindu</option>
                            <option value="Christian">Christian</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.religion && (
                            <p className="text-red-500 text-xs">{errors.religion.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Date of Birth
                        </label>
                        <input
                            {...register("dob")}
                            type="date"
                            className="w-full p-2 border rounded"
                        />
                        {errors.dob && (
                            <p className="text-red-500 text-xs">{errors.dob.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Blood Group
                        </label>
                        <select
                            {...register("bloodGroup")}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                        {errors.bloodGroup && (
                            <p className="text-red-500 text-xs">{errors.bloodGroup.message}</p>
                        )}
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Address
                        </label>
                        <textarea
                            {...register("address")}
                            placeholder="Address"
                            className="w-full p-2 border rounded"
                            rows={3}
                        />
                        {errors.address && (
                            <p className="text-red-500 text-xs">{errors.address.message}</p>
                        )}
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Upload Photo
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

                    {/* Parent Information */}
                    <h2 className="text-xl font-bold my-4 md:col-span-3">
                        Parent Information
                    </h2>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Father&apos;s Name
                        </label>
                        <input
                            {...register("fatherName")}
                            placeholder="Father's Name"
                            className="w-full p-2 border rounded"
                        />
                        {errors.fatherName && (
                            <p className="text-red-500 text-xs">{errors.fatherName.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Mother&apos;s Name
                        </label>
                        <input
                            {...register("motherName")}
                            placeholder="Mother's Name"
                            className="w-full p-2 border rounded"
                        />
                        {errors.motherName && (
                            <p className="text-red-500 text-xs">{errors.motherName.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Parent&apos;s Phone
                        </label>
                        <input
                            {...register("parentPhone")}
                            placeholder="Parent's Phone"
                            className="w-full p-2 border rounded"
                        />
                        {errors.parentPhone && (
                            <p className="text-red-500 text-xs">{errors.parentPhone.message}</p>
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