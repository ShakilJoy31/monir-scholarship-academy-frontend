"use client";

import { useGetStudentByIdQuery } from "@/app/store/api/student/studentApi";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import Image from "next/image";
import { useParams } from "next/navigation";
import React from "react";

interface Subject {
  id: string;
  name: string;
  code: string;
  marks: number;
  passMarks: number;
}

interface StudentSubject {
  id: string;
  subject: Subject;
}

interface Class {
  name: string;
}

interface Section {
  name: string;
}

interface Stream {
  name: string;
}

interface Student {
  session: {
    id: number;
    name: string;
  };
  id: string;
  avatar: string;
  name: string;
  studentUniqueId: string;
  classRoll: number;
  gender: string;
  religion: string;
  phone: string;
  dob: string;
  class?: Class;
  bloodGroup: string;
  email: string;
  address: string;
  section?: Section;
  stream?: Stream;
  fatherName: string;
  motherName: string;
  parentPhone: string;
  StudentSubject?: StudentSubject[];
}

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: students, isLoading, error } = useGetStudentByIdQuery(id);

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      {buttonLoader}
    </div>
  );

  if (error) return <p className="p-4 text-red-500">Failed to fetch student info.</p>;
  if (!students?.data) return <p className="p-4">No student data found.</p>;

  const student: Student = students.data;

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between py-4">
        <div className="flex gap-4">
          <CancelButton onClick={() => window.history.back()}>Back</CancelButton>
          
          <h2 className="text-xl font-semibold my-2">Student Details</h2>
        </div>
      </div>

      <div className="bg-white px-5">
        <div className="flex gap-10 items-center my-5">
          <Image
            src={student.avatar}
            alt={student.name}
            width={160}
            height={160}
            className="h-40 w-40 object-cover border"
          />

          <div>
            <p className="text-xl font-semibold">{student.name}</p>
            <p>
              <span className="font-medium">ID:</span> {student.studentUniqueId}
            </p>
            <p>
              <span className="font-medium">Class Roll:</span> {student.classRoll}
            </p>
          </div>
        </div>

        <h2 className="text-xl font-semibold my-2">Personal Information</h2>
        <hr />

        <div className="flex justify-between gap-10 pt-5">
          {/* left div */}
          <div className="flex-1">
            <div className="flex justify-between ">
              <div className="space-y-4">
                <p>Gender:</p>
                <p>Religion:</p>
                <p>Phone:</p>
                <p>Date of Birth:</p>
                <p>Assigned Class:</p>
                <p>Assigned Session:</p>
              </div>

              <div className="space-y-4">
                <p>{student.gender || "N/A"}</p>
                <p>{student.religion || "N/A"}</p>
                <p>{student.phone || "N/A"}</p>
                <p>{student.dob || "N/A"}</p>
                <p>{student.class?.name || "N/A"}</p>
                <p>{student.session?.name || "N/A"}</p>
              </div>
            </div>
          </div>
          <div className="border border-gray-300"></div>
          {/* right div */}
          <div className="flex-1">
            <div className="flex justify-between">
              <div className="space-y-4">
                <p>Blood Group:</p>
                <p>Email:</p>
                <p>Address:</p>
                <p>Assigned Section:</p>
                <p>Stream:</p>
              </div>

              <div className="space-y-4">
                <p>{student.bloodGroup || "N/A"}</p>
                <p>{student.email || "N/A"}</p>
                <p>{student.address || "N/A"}</p>
                <p>{student.section?.name || "N/A"}</p>
                <p>{student.stream?.name || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Information */}
        <h2 className="text-xl font-semibold my-2">Subjects Information</h2>
        <hr />

        <div className="py-5">
          {student.StudentSubject && student.StudentSubject.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {student.StudentSubject.map((subjectItem) => (
                <div key={subjectItem.id} className="border p-4 rounded-lg">
                  <p className="font-medium">{subjectItem.subject.name}</p>
                  <p className="text-sm text-gray-600">
                    Code: {subjectItem.subject.code}
                  </p>
                  <p className="text-sm">
                    Marks: {subjectItem.subject.marks} (Pass: {subjectItem.subject.passMarks})
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 py-2">No subjects assigned</p>
          )}
        </div>

        <h2 className="text-xl font-semibold my-2">Parent Information</h2>
        <hr />

        <div className="flex justify-between gap-10 py-5">
          {/* left div */}
          <div className="flex-1">
            <div className="flex justify-between ">
              <div className="space-y-4">
                <p>Father Name:</p>
                <p>Mother Name:</p>
                <p>Address:</p>
              </div>

              <div className="space-y-4">
                <p>{student.fatherName || "N/A"}</p>
                <p>{student.motherName || "N/A"}</p>
                <p>{student.address || "N/A"}</p>
              </div>
            </div>
          </div>
          <div className="border border-gray-300"></div>
          {/* right div */}
          <div className="flex-1">
            <div className="flex justify-between">
              <div className="space-y-4">
                <p>Parent Phone:</p>
                <p>Email:</p>
              </div>

              <div className="space-y-4">
                <p>{student.parentPhone || "N/A"}</p>
                <p>{student.email || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;