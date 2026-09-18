"use client";
import { useCreateTeacherMutation } from "@/app/store/api/teacher/teacherApi";
import {
  TeacherFormValues,
  TeacherSchema,
} from "@/app/super-admin/schemas/teacherSchema";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { validateEmptyFields } from "@/lib/objectModify";
import { useRouter } from "next/navigation";
import { theStar } from "@/lib/requiredJSX";
import { useAddThumbnailMutation } from "@/app/store/api/file/fileApi";
import { Eye, EyeOff, XCircle } from "lucide-react";
import Image from "next/image";
import { useGetAllDesignationsQuery } from "@/app/store/api/classes/designationApi";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";

export default function TeacherForm() {
  const [createTeacher, { isLoading: createLoading }] =
    useCreateTeacherMutation();
  const [addThumbnail, { isLoading: uploadLoading }] =
    useAddThumbnailMutation();

  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | undefined>(
    undefined
  );
  const [showPassword, setShowPassword] = useState(false);
  const { data: designationsResponse, isLoading: designationsLoading } = 
    useGetAllDesignationsQuery({});

  const designations = designationsResponse?.data || [];

  interface Designation {
    id: number;
    name: string;
  }

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(TeacherSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      designation: "",
      nid: "",
      gender: "",
      religion: "",
      dob: "",
      bloodGroup: "",
      address: "",
      universityName: "",
      qualification: "",
      specialistSubject: "",
      universityStartDate: "",
      universityEndDate: "",
      avatar: "",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setUploadedImage(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const onSubmit = async (data: TeacherFormValues) => {
    try {
      const stringData = {
        ...data,
        nid: data?.nid ? data.nid.toString() : "",
      };

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
        ...stringData,
        avatar: imageUrl,
      };

      const modifiedPayload = validateEmptyFields(payload);

      try {
        await createTeacher(modifiedPayload).unwrap();
        toastShowing(
          "New teacher has been created successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
        router.push("/branch-admin/pages/teacher-list");
        reset();
        setPreview(null);
        setUploadedImage(undefined);
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
          return "Failed to create teacher";
        })();

        toastShowing(
          errorMessage || "Failed to create teacher",
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

  return (
    <div className="w-full mx-auto p-6 bg-white shadow-lg rounded-md">

      <div className="flex gap-4">
         <CancelButton
         onClick={()=> window.history.back()}
        >
          Back
        </CancelButton>
        <h2 className="text-xl font-bold">Teacher Information</h2>
      </div>
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
    {...register("phone", {
      maxLength: {
        value: 11,
        message: "Phone number cannot exceed 11 digits"
      },
      pattern: {
        value: /^[0-9]*$/,
        message: "Only numbers are allowed"
      }
    })}
    placeholder="Phone"
    className="w-full p-2 border rounded"
    maxLength={11}
    onInput={(e: React.FormEvent<HTMLInputElement>) => {
      e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
    }}
  />
  {errors.phone && (
    <p className="text-red-500 text-xs">{errors.phone.message}</p>
  )}
</div>

          <div className="space-y-1 mt-2">
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

         <div className="space-y-1 relative">
            <label className="block text-sm font-medium text-gray-700">
              Password {theStar}
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full p-2 border rounded pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Designation {theStar}
            </label>
            <select
              {...register("designation")}
              className="w-full p-2 border rounded"
              disabled={designationsLoading}
            >
              <option value="">Select Designation</option>
              {(designations as Designation[])?.map((designation) => (
                <option key={designation.id} value={designation.name}>
                  {designation.name}
                </option>
              ))}
            </select>
            {errors.designation && (
              <p className="text-red-500 text-xs">{errors.designation.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              NID Number
            </label>
            <input
              {...register("nid", {
                setValueAs: (value) => value === "" ? "" : String(value)
              })}
              placeholder="NID Number"
              className="w-full p-2 border rounded"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            {errors.nid && (
              <p className="text-red-500 text-xs">{errors.nid.message}</p>
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
              <p className="text-red-500 text-xs">
                {errors.bloodGroup.message}
              </p>
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
                  width={"80"}
                  height={"80"}
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
                {/* <label className="block text-sm font-medium text-gray-700">
                  Upload Photo
                </label> */}
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

        <h2 className="text-xl font-bold my-4">Teacher Qualification</h2>
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              University/Institute
            </label>
            <input
              {...register("universityName")}
              placeholder="University/Institute"
              className="w-full p-2 border rounded"
            />
            {errors.universityName && (
              <p className="text-red-500 text-xs">
                {errors.universityName.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Qualification
            </label>
            <input
              {...register("qualification")}
              placeholder="Qualification"
              className="w-full p-2 border rounded"
            />
            {errors.qualification && (
              <p className="text-red-500 text-xs">
                {errors.qualification.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Specialist Subject
            </label>
            <input
              {...register("specialistSubject")}
              placeholder="Specialist Subject"
              className="w-full p-2 border rounded"
            />
            {errors.specialistSubject && (
              <p className="text-red-500 text-xs">
                {errors.specialistSubject.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              {...register("universityStartDate")}
              type="date"
              className="w-full p-2 border rounded"
            />
            {errors.universityStartDate && (
              <p className="text-red-500 text-xs">
                {errors.universityStartDate.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              {...register("universityEndDate")}
              type="date"
              className="w-full p-2 border rounded"
            />
            {errors.universityEndDate && (
              <p className="text-red-500 text-xs">
                {errors.universityEndDate.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-4 gap-x-4">
          <CancelButton
            disabled={createLoading || uploadLoading || designationsLoading}
            onClick={() => {
              reset();
              setPreview(null);
              setUploadedImage(undefined);
              window.history.back();
            }}
          >
            Cancel
          </CancelButton>
          <SubmitButton
            type="submit"
            disabled={createLoading || uploadLoading || designationsLoading}
          >
            {(createLoading || uploadLoading || designationsLoading) ? (
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
              "Submit"
            )}
          </SubmitButton>
          
        </div>
      </form>
    </div>
  );
}