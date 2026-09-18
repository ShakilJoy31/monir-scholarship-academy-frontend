"use client";
import {
  useGetStudentByIdQuery,
  useUpdateStudentMutation,
} from "@/app/store/api/student/studentApi";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { validateEmptyFields } from "@/lib/objectModify";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { XCircle } from "lucide-react";
import { useAddThumbnailMutation } from "@/app/store/api/file/fileApi";
import {
  StudentUpdateFormValues,
  StudentUpdateSchema,
} from "@/app/super-admin/schemas/studentUpdateSchema";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import Checkbox from "@mui/material/Checkbox";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";

interface Subject {
  id: number;
  name: string;
  code: string;
  marks?: number;
  passMarks?: number;
}

interface StudentSubject {
  id: string;
  subject: Subject;
}

interface Class {
  id: number;
  branchId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  id: number;
  branchId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Section {
  id: number;
  branchId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Stream {
  id: number;
  branchId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  id: number;
  branchId: number;
  type: string;
  sessionYearId: number;
  name: string;
  phone: string;
  email: string;
  classNameId: number;
  classRoll: number;
  sectionNameId: number;
  isTopStudent: boolean; 
  streamNameId: number;
  gender: "Male" | "Female" | "Other";
  religion: "Islam" | "Hindu" | "Christian" | "Other";
  dob: string;
  bloodGroup: string;
  address: string;
  topStudent: boolean;
  fatherName: string;
  motherName: string;
  parentPhone: string;
  avatar: string;
  StudentSubject?: StudentSubject[];
  class: {
    id: number;
    name: string;
  };
  section: {
    id: number;
    name: string;
  };
  session: {
    id: number;
    name: string;
  };
  stream: {
    id: number;
    name: string;
  };
}

export default function EditStudent() {
  const { id } = useParams<{ id: string }>();
  const { data: studentData, isLoading: isStudentLoading } =
    useGetStudentByIdQuery(id);
  const student: Student | undefined = studentData?.data;

  const [updateStudent, { isLoading: updateLoading }] =
    useUpdateStudentMutation();
  const [addThumbnail, { isLoading: uploadLoading }] =
    useAddThumbnailMutation();

  const { data: classes, isLoading: classesLoading } = useGetAllClassQuery({ page: 1, size: 1000000 });
  const { data: sessions } = useGetAllSessionsQuery({});
  const { data: sections } = useGetAllSectionsQuery({});
  const { data: streams } = useGetAllStreamsQuery({});

  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | undefined>(
    undefined
  );
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<StudentUpdateFormValues>({
    resolver: zodResolver(StudentUpdateSchema),
  });

  const selectedClassId = watch("classNameId");

  // Set form values when student data is loaded
  useEffect(() => {
    if (student) {
      const initialSubjects =
        student.StudentSubject?.map((sub: StudentSubject) => sub.subject) || [];

      reset({
        name: student.name || "",
        phone: student.phone || "",
        email: student.email || "",
        classNameId: student.classNameId || undefined,
        classRoll: student.classRoll || 0,
        sectionNameId: student.sectionNameId || undefined,
        streamNameId: student.streamNameId || undefined,
        sessionYearId: student.sessionYearId || undefined,
        gender: student.gender || "",
        religion: student.religion || "",
        dob: student.dob || "",
        bloodGroup: student.bloodGroup || "",
        address: student.address || "",
        isTopStudent: student.isTopStudent || false,
        fatherName: student.fatherName || "",
        motherName: student.motherName || "",
        parentPhone: student.parentPhone || "",
        avatar: student.avatar || "",
      });

      setPreview(student.avatar || null);
      setSelectedSubjects(initialSubjects);
      
      // Set available subjects from student's own subjects
      if (initialSubjects.length > 0) {
        setAvailableSubjects(initialSubjects);
      }
    }
  }, [student, reset]);

  // Update available subjects when class changes
  useEffect(() => {
    if (selectedClassId && student) {
      // If the selected class is the student's original class, show their subjects
      if (selectedClassId === student.classNameId) {
        const studentSubjects = student.StudentSubject?.map((sub: StudentSubject) => sub.subject) || [];
        setAvailableSubjects(studentSubjects);
        setSelectedSubjects(studentSubjects);
      } else {
        // If it's a different class, clear subjects (user will need to select new ones)
        setAvailableSubjects([]);
        setSelectedSubjects([]);
      }
    }
  }, [selectedClassId, student]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setUploadedImage(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setValue("avatar", ""); // Clear the existing URL if new file is uploaded
    }
  };

  const onSubmit = async (data: StudentUpdateFormValues) => {
    try {
      // Validate that subjects are selected
      if (selectedSubjects.length === 0) {
        toastShowing(
          "Please select at least one subject",
          "bottom-right",
          2000,
          "red",
          "white"
        );
        return;
      }

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
        subjects: selectedSubjects.map((subject) => subject.id),
        isTopStudent: data.isTopStudent || false,
      };

      // Remove empty fields
      const modifiedPayload = validateEmptyFields(payload);

      // Update student
      await updateStudent({ id, ...modifiedPayload }).unwrap();

      toastShowing(
        "Student updated successfully",
        "bottom-right",
        2000,
        "green",
        "white"
      );
      router.push("/branch-admin/pages/student-list");
    } catch (error) {
      console.error("Submission error:", error);

      let errorMessage = "Failed to update student";
      if (typeof error === "object" && error !== null && "data" in error) {
        const errorData = error as { data?: { message?: string } };
        errorMessage = errorData.data?.message || errorMessage;
      }

      toastShowing(errorMessage, "bottom-right", 2000, "red", "white");
    }
  };

  if (isStudentLoading || classesLoading) {
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
    <div className="w-full mx-auto p-6 bg-white shadow-lg rounded-md">
      <div className="flex gap-4 items-center mb-4">
        <CancelButton onClick={() => window.history.back()}>Back</CancelButton>
        <h2 className="text-xl font-bold">Edit Student Information</h2>
      </div>

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
              Phone Number
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
              Class
            </label>
            <select
              {...register("classNameId", { valueAsNumber: true })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Class</option>
              {classes?.data?.map((classItem: Class) => (
                <option
                  key={classItem.id}
                  value={classItem.id}
                >
                  {classItem.name}
                </option>
              ))}
            </select>
            {errors.classNameId && (
              <p className="text-red-500 text-xs">
                {errors.classNameId.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Class Roll
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
              Session Year
            </label>
            <select
              {...register("sessionYearId", { valueAsNumber: true })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Session</option>
              {sessions?.data?.map((session: Session) => (
                <option
                  key={session.id}
                  value={session.id}
                >
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
              Section
            </label>
            <select
              {...register("sectionNameId", { valueAsNumber: true })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Section</option>
              {sections?.data?.map((section: Section) => (
                <option
                  key={section.id}
                  value={section.id}
                >
                  {section.name}
                </option>
              ))}
            </select>
            {errors.sectionNameId && (
              <p className="text-red-500 text-xs">
                {errors.sectionNameId.message}
              </p>
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
              {streams?.data?.map((stream: Stream) => (
                <option
                  key={stream.id}
                  value={stream.id}
                >
                  {stream.name}
                </option>
              ))}
            </select>
            {errors.streamNameId && (
              <p className="text-red-500 text-xs">
                {errors.streamNameId.message}
              </p>
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

          <div className="space-y-1">
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("isTopStudent")}
              id="topStudent"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="topStudent" className="text-sm font-medium text-gray-700">
              Is Top Student
            </label>
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

          {/* Subjects Multi-Select */}
          <div className="space-y-1 md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subjects <span className="text-red-500">*</span>
            </label>
            {selectedClassId ? (
              availableSubjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2">
                  {availableSubjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center space-x-2 p-1 border border-gray-200 hover:bg-blue-100 cursor-pointer bg-blue-50"
                      onClick={() => {
                        const isSelected = selectedSubjects.some(
                          (s) => s.id === subject.id
                        );
                        const newSelectedSubjects = isSelected
                          ? selectedSubjects.filter((s) => s.id !== subject.id)
                          : [...selectedSubjects, subject];
                        setSelectedSubjects(newSelectedSubjects);
                      }}
                    >
                      <Checkbox
                        checked={selectedSubjects.some(
                          (s) => s.id === subject.id
                        )}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const newSelectedSubjects = isChecked
                            ? [...selectedSubjects, subject]
                            : selectedSubjects.filter((s) => s.id !== subject.id);
                          setSelectedSubjects(newSelectedSubjects);
                        }}
                        size="small"
                      />
                      <span className="text-sm">
                        {subject.name} ({subject.code})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-yellow-600 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  {selectedClassId === student.classNameId 
                    ? "No subjects assigned to this student yet." 
                    : "Please select subjects for this class."}
                </div>
              )
            ) : (
              <div className="text-sm text-gray-500 p-2 bg-gray-50 border border-gray-200 rounded">
                Please select a class first
              </div>
            )}
            {selectedSubjects.length === 0 && selectedClassId && (
              <p className="text-amber-600 text-xs mt-1">
                Please select at least one subject
              </p>
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
            onClick={() => router.push("/branch-admin/pages/student-list")}
          >
            Cancel
          </CancelButton>
          <SubmitButton type="submit" disabled={updateLoading || uploadLoading}>
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