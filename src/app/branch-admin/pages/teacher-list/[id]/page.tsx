"use client";

import { useGetTeacherByIdQuery } from "@/app/store/api/teacher/teacherApi";
import Image from "next/image";
import { useParams } from "next/navigation";
import { CircularProgress, Paper, Typography } from "@mui/material";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import CancelButton from "@/components/shared/reusable-component/CancelButton";

interface Teacher extends Record<string, unknown> {
  id: number;
  studentUniqueId: string;
  name: string;
  fatherName?: string;
  motherName?: string;
  class?: {
    id: number;
    name: string;
  };
  section?: {
    id: number;
    name: string;
  };
  classRoll?: string;
  phone?: string;
  bloodGroup?: string;
  avatar?: string;
  stream?: {
    id: number;
    name: string;
  };
  session?: {
    id: number;
    name: string;
  };
  subject: {
    id: number;
    name: string;
  }
}

const DetailPage = () => {
  const { id } = useParams();
  const { data: teachers, isLoading, error } = useGetTeacherByIdQuery(id);

  if (isLoading) return  <div className="flex justify-center items-center h-64">
       <CircularProgress />
      </div>;
  if (error)
    return <p className="p-4 text-red-500">Failed to fetch teacher info.</p>;
  if (!teachers?.data) return <p className="p-4">No teacher data found.</p>;

  const teacher = teachers?.data;
  const classRoutings = teacher?.ClassRouting || [];

  const columns = [
    {
      key: 'day',
      header: 'Day'
    },
    {
      key: 'className',
      header: 'Class',
      render: (row: Teacher) => row.class?.name || "N/A",
    },
    {
      key: 'sessionName',
      header: 'Session',
       render: (row: Teacher) => row.session?.name || "N/A",
    },
    {
      key: 'sectionName',
      header: 'Section',
       render: (row: Teacher) => row.section?.name || "N/A",
    },
    {
      key: 'subjectName',
      header: 'Subject',
      render: (row: Teacher) => row.subject?.name || "N/A",
    },
     {
      key: 'streamName',
      header: 'Stream',
       render: (row: Teacher) => row.stream?.name || "N/A",
    },
    {
      key: 'startTime',
      header: 'Start Time'
    },
    {
      key: 'endTime',
      header: 'End Time'
    },
   
  ];

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className=" py-4">
          <CancelButton onClick={() => window.history.back()}>Back</CancelButton>
          <h2 className="text-xl font-semibold my-2">Teacher Details</h2>
      </div>

      <div className="bg-white px-5">
        <div className="flex gap-10 items-center my-5">
          <Image
            src={teacher.avatar}
            alt={teacher.name}
            width={"40"}
            height={"40"}
            className="h-40 w-40 object-cover  border"
          />

          <div>
            <p>{teacher?.name}</p>
            <p>
              <span>ID:</span> {teacher?.teacherUniqueId}
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
                <p>Blood Group:</p>
                <p>Religion:</p>
              </div>

              <div className="space-y-4">
                <p>{teacher?.gender || "N/A"}</p>
                <p>{teacher?.bloodGroup || "N/A"}</p>
                <p>{teacher?.religion || "N/A"}</p>
              </div>
            </div>
          </div>
          <div className="border border-gray-300"></div>
          {/* right div */}
          <div className="flex-1">
            <div className="flex justify-between">
              <div className="space-y-4">
                <p>Email:</p>
                <p>Address:</p>
                <p>NID Number:</p>
                <p>Phone:</p>
              </div>

              <div className="space-y-4">
                <p>{teacher?.email || "N/A"}</p>
                <p>{teacher?.address || "N/A"}</p>
                <p>{teacher?.nid || "N/A"}</p>
                <p>{teacher?.phone || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold my-2">Professional Information</h2>
        <hr />

        <div className="flex justify-between gap-10 py-5">
          {/* left div */}
          <div className="flex-1">
            <div className="flex justify-between ">
              <div className="space-y-4">
                <p>University/Institute:</p>
                <p>Qualification:</p>
                <p>Designation:</p>
                <p>Specialization/Subjects Taught:</p>
              </div>

              <div className="space-y-4">
                <p>{teacher?.universityName || "N/A"}</p>
                <p>{teacher?.qualification || "N/A"}</p>
                <p>{teacher?.designation || "N/A"}</p>
                <p>{teacher?.specialistSubject || "N/A"}</p>
              </div>
            </div>
          </div>
          <div className="border border-gray-300"></div>
          {/* right div */}
          <div className="flex-1">
            <div className="flex justify-between">
              <div className="space-y-4">
                <p>Start date:</p>
                <p>End date:</p>
                <p>City:</p>
              </div>

              <div className="space-y-4">
                <p>{teacher?.universityStartDate || "N/A"}</p>
                <p>{teacher?.universityEndDate || "N/A"}</p>
                <p>{teacher?.address || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-2 mt-10">Timetable Overview</h2>
        <hr />

        <Paper sx={{ mt: 2, p: 2 }}>
          {classRoutings.length === 0 ? (
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ mt: 4, textAlign: "center" }}
            >
              No timetable data found for this teacher.
            </Typography>
          ) : (
            <ReusableTable
              columns={columns}
              data={classRoutings}
            />
          )}
        </Paper>
      </div>
    </div>
  );
};

export default DetailPage;