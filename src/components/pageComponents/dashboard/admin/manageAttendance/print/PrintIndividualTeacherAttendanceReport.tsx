import React from "react";
import { format } from "date-fns";
import Image from "next/image";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";

export interface TeacherInfo {
  name: string;
  designation: string;
  teacherUniqueId: string;
}

export interface StatusDetail {
  status: string;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface TeacherAttendance {
  id: number;
  branchId: number;
  date: string;
  teacherId: number;
  checkIn: string;
  checkOut: string;
  checkInStatus: string;
  checkOutStatus: string;
  status: "Present" | "Absent" | "Leave";
  createdAt: string;
  updatedAt: string;
  teacher: TeacherInfo;
  [key: string]: string | number | StatusDetail | TeacherInfo;
}

interface ISeatStatusPrintProps {
  categoryData: TeacherAttendance[];
  logo: { companyLogoBangla: string };
}

const PrintIndividualTeacherAttendanceReport = React.forwardRef<
  HTMLDivElement,
  ISeatStatusPrintProps
>(({ categoryData, logo }, ref) => {
  const currentDate = format(new Date(), "MMMM dd, yyyy");
  console.log(logo)
  const teacher = categoryData?.[0]?.teacher; // since it's the same for all
  // Fetching branch name, email, address and logo. 
  const userInfo = getUserInfoFromToken();
  const { data: branchConfigData } = useGetBranchConfigQuery(userInfo?.branchId)
  const branchInfo = branchConfigData?.data;

  return (
    <section
      ref={ref}
      className="flex flex-col justify-center items-center"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Header */}
      <header className="mb-6 mt-6 text-center">
        <Image
          src={branchInfo?.logo}
          alt="Logo"
          className="w-32 h-auto mx-auto mb-4"
          width={100}
          height={100}
        />
        <p className="font-bold pb-2 text-sm leading-6">
          Teacher&apos;ss Daily Attendance Report
        </p>
        <p className="text-sm leading-6">Date: {currentDate}</p>
        {teacher && (
          <div className="mt-2 text-sm leading-5">
            <p><span className="font-bold">Name:</span> {teacher.name}</p>
            <p><span className="font-bold">ID:</span> {teacher.teacherUniqueId}</p>
            <p><span className="font-bold">Designation:</span> {teacher.designation}</p>
          </div>
        )}
      </header>

      {/* Table */}
      <div className="w-full px-6">
        <table className="table-auto border-collapse border border-black text-sm w-full">
  <thead>
    <tr>
      <th className="border border-black px-2 py-1">SL</th>
      <th className="border border-black px-2 py-1">DATE</th>
      <th className="border border-black px-2 py-1">CHECK IN</th>
      <th className="border border-black px-2 py-1">CHECK IN STATUS</th>
      <th className="border border-black px-2 py-1">CHECK IN NOTE</th>
      <th className="border border-black px-2 py-1">CHECK OUT</th>
      <th className="border border-black px-2 py-1">CHECK OUT STATUS</th>
      <th className="border border-black px-2 py-1">CHECK OUT NOTE</th>
      <th className="border border-black px-2 py-1">STATUS</th>
    </tr>
  </thead>

  <tbody>
    {categoryData?.map((row, index) => {
      let checkInStatus = "";
      let checkInNote = "";
      let checkOutStatus = "";
      let checkOutNote = "";

      try {
        const data = JSON.parse(row?.checkInStatus);
        checkInStatus = data?.status || "";
        checkInNote = `${data?.hours}h ${data?.minutes}m ${data?.seconds}s`;
      } catch {
        checkInStatus = row?.checkInStatus || "";
      }

      try {
        const data = JSON.parse(row?.checkOutStatus);
        checkOutStatus = data?.status || "";
        checkOutNote = `${data?.hours}h ${data?.minutes}m ${data?.seconds}s`;
      } catch {
        checkOutStatus = row?.checkOutStatus || "";
      }

      return (
        <tr key={row?.teacherId + "-" + index}>
          <td className="border border-black px-2 py-1 text-center">
            {index + 1}
          </td>

          <td className="border border-black px-2 py-1 text-center">
            {format(new Date(row?.date), "MMMM dd, yyyy")}
          </td>

          <td className="border border-black px-2 py-1 text-center">
            {row?.checkIn || "—"}
          </td>

          <td className="border border-black px-2 py-1 text-center">
            {checkInStatus || "—"}
          </td>

          <td className="border border-black px-2 py-1 text-center">
            {checkInNote || "—"}
          </td>

          <td className="border border-black px-2 py-1 text-center">
            {row?.checkOut || "—"}
          </td>

          <td className="border border-black px-2 py-1 text-center">
            {checkOutStatus || "—"}
          </td>

          <td className="border border-black px-2 py-1 text-center">
            {checkOutNote || "—"}
          </td>

          <td className="border border-black px-2 py-1 text-center">
            {row?.status || "—"}
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

      </div>
    </section>
  );
});

// ✅ Add display name here
PrintIndividualTeacherAttendanceReport.displayName =
  "PrintIndividualTeacherAttendanceReport";
  
export default PrintIndividualTeacherAttendanceReport;
