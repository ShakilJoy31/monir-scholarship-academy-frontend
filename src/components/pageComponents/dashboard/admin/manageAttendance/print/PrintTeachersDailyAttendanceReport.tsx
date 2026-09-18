import React from "react";
import { format } from "date-fns";
import { View, Image } from "@react-pdf/renderer";

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
  branchInfo: {schoolName: string; logo: string}
}

const PrintTeachersDailyAttendanceReport = React.forwardRef<
  HTMLDivElement,
  ISeatStatusPrintProps
>(({ categoryData, branchInfo }, ref) => {
  const currentDate = format(new Date(), "MMMM dd, yyyy");

  return (
    <section
      ref={ref}
      className="flex flex-col justify-center items-center"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Header */}
      <header className="mb-6 mt-6 text-center">
        <View style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <Image
                src={branchInfo?.logo}
                style={{ width: '60px', height: '50px' }}
            />
        </View>
        <p className="font-bold pb-2 text-sm leading-6">
          {branchInfo?.schoolName}
        </p>
        <p className="font-bold pb-2 text-sm leading-6">
          Teacher&apos;s Daily Attendance Report
        </p>
        <p className="font-bold text-sm leading-6">Date: {currentDate}</p>
      </header>

      {/* Table */}
      <div className="w-full px-6">
        <table className="table-auto border-collapse border border-black text-sm w-full">
          <thead>
            <tr>
              <th className="border border-black px-2 py-1">SL</th>
              <th className="border border-black px-2 py-1">NAME</th>
              <th className="border border-black px-2 py-1">ID</th>
              <th className="border border-black px-2 py-1">DESIGNATION</th>
              <th className="border border-black px-2 py-1">CHECK IN</th>
              <th className="border border-black px-2 py-1">CHECK IN STATUS</th>
              <th className="border border-black px-2 py-1">CHECK OUT</th>
              <th className="border border-black px-2 py-1">CHECK OUT STATUS</th>
              <th className="border border-black px-2 py-1">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {categoryData?.map((row, index) => {
              let checkInStatus = "";
              let checkOutStatus = "";

              try {
                checkInStatus = JSON.parse(row?.checkInStatus)?.status || "";
              } catch {
                checkInStatus = row?.checkInStatus || "";
              }

              try {
                checkOutStatus = JSON.parse(row?.checkOutStatus)?.status || "";
              } catch {
                checkOutStatus = row?.checkOutStatus || "";
              }

              return (
                <tr key={row?.teacherId}>
                  <td className="border border-black px-2 py-1 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-black px-2 py-1 text-center">
                    {row?.teacher?.name}
                  </td>
                  <td className="border border-black px-2 py-1 text-center">
                    {row?.teacher?.teacherUniqueId}
                  </td>
                  <td className="border border-black px-2 py-1 text-center">
                    {row?.teacher?.designation}
                  </td>
                  <td className="border border-black px-2 py-1 text-center">
                    {row?.checkIn}
                  </td>
                  <td className="border border-black px-2 py-1 text-center">
                    {checkInStatus}
                  </td>
                  <td className="border border-black px-2 py-1 text-center">
                    {row?.checkOut}
                  </td>
                  <td className="border border-black px-2 py-1 text-center">
                    {checkOutStatus}
                  </td>
                  <td className="border border-black px-2 py-1 text-center">
                    {row?.status}
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
PrintTeachersDailyAttendanceReport.displayName =
  "PrintTeachersDailyAttendanceReport";

export default PrintTeachersDailyAttendanceReport;
