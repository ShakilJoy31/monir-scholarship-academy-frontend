"use client";
import { useGetOnlineAdmissionByIdQuery } from "@/app/store/api/admission/admissionApi";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import { Badge } from "@mui/material";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";

interface Item {
  id: number;
  name: string;
}

const ViewOnlineStudentForm = () => {
  const { id } = useParams();
  const { data: admissionData, isLoading: isAdmissionLoading } = useGetOnlineAdmissionByIdQuery(id);
  const admission = admissionData?.data;

  const { data: classes } = useGetAllClassQuery({});
  const { data: sessions } = useGetAllSessionsQuery({});
  const { data: sections } = useGetAllSectionsQuery({});
  const { data: streams } = useGetAllStreamsQuery({});


  const getItemNameById = (items: Item[] | undefined, id: number | undefined) => {
    if (!items || !id) return "N/A";
    const item = items.find((item) => item.id === id);
    return item?.name || "N/A";
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
    <>
      <div className="w-full max-w-6xl mx-auto p-8 bg-white shadow-lg rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {admission.avatar && (
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                <Image
                  src={admission.avatar}
                  alt="Student Photo"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{admission.name}</h1>
              <p className="text-sm text-gray-500">{admission.email || "N/A"}</p>
            </div>
          </div>
          <Badge
            className={`px-4 py-1 rounded-md text-sm capitalize ${admission.status === "approved"
                ? "bg-green-100 text-green-800"
                : admission.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
          >
            {admission.status}
          </Badge>
        </div>

        {/* Student Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
            Student Information
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
            <div>
              <dt className="text-sm text-gray-500">Phone</dt>
              <dd className="font-medium text-gray-900">{admission.phone || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Class</dt>
              <dd className="font-medium text-gray-900">
                {getItemNameById(classes?.data, admission.classNameId)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Session Year</dt>
              <dd className="font-medium text-gray-900">
                {getItemNameById(sessions?.data, admission.sessionYearId)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Section</dt>
              <dd className="font-medium text-gray-900">
                {getItemNameById(sections?.data, admission.sectionNameId)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Group</dt>
              <dd className="font-medium text-gray-900">
                {getItemNameById(streams?.data, admission.streamNameId)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Gender</dt>
              <dd className="font-medium text-gray-900">{admission.gender || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Religion</dt>
              <dd className="font-medium text-gray-900">{admission.religion || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Date of Birth</dt>
              <dd className="font-medium text-gray-900">
                {formatDate(admission.dob)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Blood Group</dt>
              <dd className="font-medium text-gray-900">{admission.bloodGroup || "N/A"}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-sm text-gray-500">Address</dt>
              <dd className="font-medium text-gray-900">{admission.address || "N/A"}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-sm text-gray-500">Previous School</dt>
              <dd className="font-medium text-gray-900">{admission.previousSchool || "N/A"}</dd>
            </div>
          </dl>
        </div>

        {/* Parent Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
            Parent Information
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
            <div>
              <dt className="text-sm text-gray-500">Father&apos;s Name</dt>
              <dd className="font-medium text-gray-900">{admission.fatherName || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Mother&apos;s Name</dt>
              <dd className="font-medium text-gray-900">{admission.motherName || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Parent Phone</dt>
              <dd className="font-medium text-gray-900">{admission.parentPhone || "N/A"}</dd>
            </div>
          </dl>
        </div>
      </div>


    </>
  );
};

export default ViewOnlineStudentForm;