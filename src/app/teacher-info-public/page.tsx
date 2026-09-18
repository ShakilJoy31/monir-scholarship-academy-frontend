"use client"

import { CircularProgress } from "@mui/material";
import { useGetAllTeachersQuery } from "../store/api/teacher/teacherApi";
import Image from "next/image";
import Footer from "@/components/pageComponents/publicComponent/footer/page";
import PublicNavigation from "@/components/pageComponents/publicComponent/publicNavigation/page";

interface Teacher {
  id: number;
  branchId: number;
  name: string;
  teacherUniqueId: string;
  phone: string;
  email: string;
  password: string;
  designation: string;
  nid: string;
  gender: string;
  religion: string;
  dob: string;
  bloodGroup: string;
  address: string;
  universityName: string;
  qualification: string;
  specialistSubject: string;
  universityStartDate: string;
  universityEndDate: string;
  count: number;
  blockDate: string | null;
  active: boolean;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

const TeacherInfoPublic = () => {
  const { data: teachersResponse, isLoading, isError } = useGetAllTeachersQuery({});
  const teachers = teachersResponse?.data || [];

  if (isLoading) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-center mb-8 uppercase">
          Teachers
        </h2>
        <div className="items-center flex justify-center"><CircularProgress /></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-center mb-8 uppercase">
          All  Teachers
        </h2>
        <div className="text-center text-red-500">
          Error loading teachers data
        </div>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (

      <>
        <div className="bg-[#035140]">
          <PublicNavigation />
        </div>
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8 uppercase">
            All Teachers
          </h2>
          <div className="text-center">No teachers available</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="bg-[#035140]">
        <PublicNavigation />
      </div>
      <div className="px-4 py-8 sm:px-6 lg:px-24">
        <h2 className="text-2xl font-bold text-center mb-8 uppercase">
          All Teachers
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {teachers.map((teacher: Teacher) => (
            <div
              key={teacher.id}
              className="border-2 border-gray-200 rounded-lg h-[400px]"
            >
              <h2 className="text-lg bg-gray-200 py-2 px-6">
                {teacher.specialistSubject || "Subject not specified"}
              </h2>
              <div className="px-6 py-2">
                <div className="w-full h-48 border-2">
                  {teacher.avatar ? (
                    <Image
                      width={160}
                      height={180}
                      src={''}
                      alt={teacher.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      No Image
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold pt-2">{teacher.name}</h3>
                  <p className="text-gray-600">{teacher.designation}</p>
                  {/* <Button
                  variant={"outline"}
                  className="bg-[#035140] mt-4 text-white px-4 py-2 rounded font-semibold hover:bg-gray-200 cursor-pointer"
                >
                  Read More
                </Button> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TeacherInfoPublic;