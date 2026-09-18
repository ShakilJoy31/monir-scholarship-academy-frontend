"use client";
import { useCreateStudentMutation } from "@/app/store/api/student/studentApi";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { validateEmptyFields } from "@/lib/objectModify";
import { useRouter } from "next/navigation";
import {
  StudentFormValues,
  StudentSchema,
} from "@/app/super-admin/schemas/studentSchema";
import { theStar } from "@/lib/requiredJSX";
import Image from "next/image";
import { Eye, EyeOff, XCircle } from "lucide-react";
import { useAddThumbnailMutation } from "@/app/store/api/file/fileApi";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import { useGetAllGroupSubjectsQuery } from "@/app/store/api/classes/groupApi";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import Checkbox from "@mui/material/Checkbox";

interface ISubject {
  id: number;
  name: string;
  code: string;
  marks: number;
  passMarks: number;
}

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

interface GroupSubjectResponse {
  id: number;
  classNameId: number;
  subjectNameId: number;
  createdAt: string;
  updatedAt: string;
  class: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  subject: ISubject;
}

export default function StudentForm() {
  const [createStudent, { isLoading: createLoading }] =
    useCreateStudentMutation();
  const [addThumbnail, { isLoading: uploadLoading }] =
    useAddThumbnailMutation();

  const { data: classes } = useGetAllClassQuery({ page: 1, size: 1000000 });
  const { data: sessions } = useGetAllSessionsQuery({});
  const { data: sections } = useGetAllSectionsQuery({});
  const { data: streams } = useGetAllStreamsQuery({});
  const { data: groupSubjects, refetch: refetchGroupSubjects } = useGetAllGroupSubjectsQuery(
    {
      page: 1,
      size: 1000000,
      classId: undefined // We'll fetch all and filter client-side
    },
    { skip: false }
  );

  const [showPassword, setShowPassword] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | undefined>(
    undefined
  );
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<ISubject[]>([]);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StudentFormValues>({
    resolver: zodResolver(StudentSchema),
    defaultValues: {
      sessionYearId: undefined,
      name: "",
      phone: "",
      email: "",
      password: "",
      classNameId: undefined,
      classRoll: 0,
      sectionNameId: undefined,
      streamNameId: undefined,
      gender: "",
      religion: "",
      dob: "",
      bloodGroup: "",
      address: "",
      // isTopStudent: false,
      fatherName: "",
      motherName: "",
      parentPhone: "",
      avatar: "",
      subjects: [],
    },
  });

  const selectedClassId = watch("classNameId");

  // Filter subjects based on selected class
  useEffect(() => {
    if (selectedClassId && groupSubjects?.data) {
      // Filter group subjects by selected class ID
      const filteredGroupSubjects = groupSubjects.data.filter(
        (item: GroupSubjectResponse) => item.classNameId === Number(selectedClassId)
      );

      // Extract unique subjects from filtered group subjects
      const uniqueSubjectsMap = new Map<number, ISubject>();
      filteredGroupSubjects.forEach((item: GroupSubjectResponse) => {
        if (item.subject && !uniqueSubjectsMap.has(item.subject.id)) {
          uniqueSubjectsMap.set(item.subject.id, item.subject);
        }
      });

      const uniqueSubjects = Array.from(uniqueSubjectsMap.values());
      setAvailableSubjects(uniqueSubjects);
    } else {
      setAvailableSubjects([]);
    }

    // Reset selected subjects when class changes
    setSelectedSubjects([]);
    setValue("subjects", []);
  }, [selectedClassId, groupSubjects, setValue]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setUploadedImage(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const onSubmit = async (data: StudentFormValues) => {
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
        subjects: selectedSubjects,
        // isTopStudent: data.isTopStudent || false,
      };

      console.log("payload", payload);

      const modifiedPayload = validateEmptyFields(payload);

      try {
        await createStudent(modifiedPayload).unwrap();
        toastShowing(
          "New student has been created successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
        router.push("/branch-admin/pages/student-list");
        reset();
        setPreview(null);
        setUploadedImage(undefined);
        setSelectedSubjects([]);
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
          return "Failed to create student";
        })();

        toastShowing(
          errorMessage || "Failed to create student",
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
          onClick={() => router.push('/branch-admin/pages/student-list')}
        >
          Back
        </CancelButton>
        <h2 className="text-xl font-bold">Student Information</h2>
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
                  message: "Phone number must be 11 digits",
                },
                pattern: {
                  value: /^\d*$/,
                  message: "Only digits (0-9) are allowed",
                },
              })}
              placeholder="Phone"
              className="w-full p-2 border rounded"
              maxLength={11}
              onInput={(e: React.FormEvent<HTMLInputElement>) => {
                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 11);
              }}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1 mt-2 ">
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

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Class Roll {theStar}
            </label>
            <input
              {...register("classRoll", { valueAsNumber: true })}
              type="number"
              placeholder="Class Roll"
              className="w-full p-2 border rounded"
            />
            {errors.classRoll && (
              <p className="text-red-500 text-xs">{errors.classRoll.message}</p>
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
              <p className="text-red-500 text-xs">
                {errors.sessionYearId.message}
              </p>
            )}
          </div>

          {/* Section Dropdown */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Section {theStar}
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
              Group {theStar}
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

          {/* Subjects Multi-Select */}
          <div className="space-y-1 md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subjects
            </label>
            {selectedClassId ? (
              availableSubjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto p-2 border rounded">
                  {availableSubjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center space-x-2 p-2 hover:bg-blue-100 cursor-pointer bg-blue-50 border border-gray-200 rounded"
                      onClick={() => {
                        const newSelectedSubjects = selectedSubjects.includes(subject.id)
                          ? selectedSubjects.filter(id => id !== subject.id)
                          : [...selectedSubjects, subject.id];
                        setSelectedSubjects(newSelectedSubjects);
                        setValue("subjects", newSelectedSubjects);
                      }}
                    >
                      <Checkbox
                        checked={selectedSubjects.includes(subject.id)}
                        onChange={(e) => {
                          const newSelectedSubjects = e.target.checked
                            ? [...selectedSubjects, subject.id]
                            : selectedSubjects.filter(id => id !== subject.id);
                          setSelectedSubjects(newSelectedSubjects);
                          setValue("subjects", newSelectedSubjects);
                        }}
                        size="small"
                      />
                      <span className="text-sm">
                        {subject.name} ({subject.code}) - {subject.marks} marks
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 p-4 border rounded bg-gray-50">
                  No subjects available for this class. Please add subjects to this class first.
                </div>
              )
            ) : (
              <div className="text-sm text-gray-500 p-4 border rounded bg-gray-50">
                Please select a class first to view available subjects
              </div>
            )}
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
              <p className="text-red-500 text-xs">
                {errors.fatherName.message}
              </p>
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
              <p className="text-red-500 text-xs">
                {errors.motherName.message}
              </p>
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
              <p className="text-red-500 text-xs">
                {errors.parentPhone.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-4 gap-x-4">
          <CancelButton
            disabled={createLoading || uploadLoading}
            onClick={() => {
              reset();
              setPreview(null);
              setUploadedImage(undefined);
              setSelectedSubjects([]);
              window.history.back();
            }}
          >
            Cancel
          </CancelButton>

          <SubmitButton
            type="submit"
            disabled={createLoading || uploadLoading}
          >
            {createLoading || uploadLoading ? (
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