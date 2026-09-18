"use client";
import { useGetOnlineAdmissionByIdQuery, useUpdateOnlineAdmissionMutation } from "@/app/store/api/admission/admissionApi";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { validateEmptyFields } from "@/lib/objectModify";
import { useRouter, useParams } from "next/navigation";
import { theStar } from "@/lib/requiredJSX";
import Image from "next/image";
import { XCircle } from "lucide-react";
import { useAddThumbnailMutation } from "@/app/store/api/file/fileApi";
import { OnlineAdmissionFormValues, OnlineAdmissionSchema } from "@/app/super-admin/schemas/admission/onlineAdmissionSchema";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";

export default function EditOnlineStudentForm() {
  const { id } = useParams();
  const { data: admissionData, isLoading: isAdmissionLoading } = useGetOnlineAdmissionByIdQuery(id);
  const admission = admissionData?.data;

  const [updateAdmission, { isLoading: updateLoading }] = useUpdateOnlineAdmissionMutation();
  const [addThumbnail, { isLoading: uploadLoading }] = useAddThumbnailMutation();

  const { data: classes } = useGetAllClassQuery({});
  const { data: sessions } = useGetAllSessionsQuery({});
  const { data: sections } = useGetAllSectionsQuery({});
  const { data: streams } = useGetAllStreamsQuery({});

  const [preview, setPreview] = useState<string | null>(admission?.avatar || null);
  const [uploadedImage, setUploadedImage] = useState<File | undefined>(undefined);

  const router = useRouter();

  interface ClassItem {
    id: number;
    name: string;
  }
  interface Session {
    id: number;
    name: string;
  }
  interface Section {
    id: number;
    name: string;
  }
  interface Stream {
    id: number;
    name: string;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<OnlineAdmissionFormValues>({
    resolver: zodResolver(OnlineAdmissionSchema),
  });

  // Set form values when admission data is loaded
  useEffect(() => {
    if (admission) {
      reset({
        sessionYearId: admission.sessionYearId || undefined,
        classNameId: admission.classNameId || undefined,
        sectionNameId: admission.sectionNameId || undefined,
        streamNameId: admission.streamNameId || undefined,
        name: admission.name || "",
        phone: admission.phone || "",
        email: admission.email || "",
        gender: admission.gender || undefined,
        religion: admission.religion || undefined,
        dob: admission.dob || "",
        bloodGroup: admission.bloodGroup || "",
        address: admission.address || "",
        fatherName: admission.fatherName || "",
        motherName: admission.motherName || "",
        parentPhone: admission.parentPhone || "",
        previousSchool: admission.previousSchool || "",
        avatar: admission.avatar || "",
      });
      setPreview(admission.avatar || null);
    }
  }, [admission, reset]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setUploadedImage(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setValue("avatar", ""); // Clear the existing URL if new file is uploaded
    }
  };

  const onSubmit = async (data: OnlineAdmissionFormValues) => {
    try {
      let imageUrl = data.avatar || "";

      // Upload image if new file was selected
      if (uploadedImage) {
        try {
          const formData = new FormData();
          formData.append("photo", uploadedImage);

          const response = await addThumbnail(formData).unwrap();
          imageUrl = response?.data?.[0] || "";
        } catch (err) {
          console.error(err);
          toastShowing(
            "Photo upload error",
            "bottom-right",
            2000,
            "red",
            "white"
          );
          return;
        }
      }

      const payload = {
        ...data,
        avatar: imageUrl,
      };

      const modifiedPayload = validateEmptyFields(payload);

      try {
        await updateAdmission({ id, data: modifiedPayload }).unwrap();
        toastShowing(
          "Student admission has been updated successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
        router.push("/branch-admin/pages/online-admission");
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
          return "Failed to update student admission";
        })();

        toastShowing(
          errorMessage || "Failed to update student admission",
          "bottom-right",
          2000,
          "red",
          "white"
        );
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toastShowing(
        "An unexpected error occurred",
        "bottom-right",
        2000,
        "red",
        "white"
      );
    }
  };

  if (isAdmissionLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        {buttonLoader}
      </div>
    );
  }

  if (!admission) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Admission not found</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-6 bg-white shadow-lg rounded-md">
      <CancelButton
       onClick={() => router.push('/branch-admin/pages/online-admission')}
      >
        Back
      </CancelButton>
      <h2 className="text-xl font-bold my-4">Edit Student Information</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="">
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Personal Information */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Full Name {theStar}
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
              Phone Number {theStar}
            </label>
            <input
              {...register("phone")}
              placeholder="Phone"
              className="w-full p-2 border rounded"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs">{errors.phone.message}</p>
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

          {/* Class Dropdown */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Class {theStar}
            </label>
            <select
              {...register("classNameId", { valueAsNumber: true })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Class</option>
              {(classes?.data as ClassItem[])?.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
            {errors.classNameId && (
              <p className="text-red-500 text-xs">{errors.classNameId.message}</p>
            )}
          </div>

          {/* Session Year Dropdown */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Session Year {theStar}
            </label>
            <select
              {...register("sessionYearId", { valueAsNumber: true })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Session</option>
              {(sessions?.data as Session[])?.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
            {errors.sessionYearId && (
              <p className="text-red-500 text-xs">{errors.sessionYearId.message}</p>
            )}
          </div>

          {/* Section Dropdown */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Section
            </label>
            <select
              {...register("sectionNameId", { valueAsNumber: true })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Section</option>
              {(sections?.data as Section[])?.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
            {errors.sectionNameId && (
              <p className="text-red-500 text-xs">{errors.sectionNameId.message}</p>
            )}
          </div>

          {/* Stream Dropdown */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Group
            </label>
            <select
              {...register("streamNameId", { valueAsNumber: true })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Stream</option>
              {(streams?.data as Stream[])?.map((stream) => (
                <option key={stream.id} value={stream.id}>
                  {stream.name}
                </option>
              ))}
            </select>
            {errors.streamNameId && (
              <p className="text-red-500 text-xs">{errors.streamNameId.message}</p>
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

          <div className="space-y-1 md:col-span-1">
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

          <div className="space-y-1 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">
              Previous School
            </label>
            <textarea
              {...register("previousSchool")}
              placeholder="Previous school"
              className="w-full p-2 border rounded"
              rows={3}
            />
            {errors.previousSchool && (
              <p className="text-red-500 text-xs">{errors.previousSchool.message}</p>
            )}
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Photo
            </label>
            <div className="flex gap-3">
              {/* Preview of Uploaded Image */}
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
            disabled={updateLoading || uploadLoading}
            onClick={() => {
              router.push("/branch-admin/pages/online-admission");
            }}
          >
            Cancel
          </CancelButton>
          <SubmitButton
            type="submit"
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