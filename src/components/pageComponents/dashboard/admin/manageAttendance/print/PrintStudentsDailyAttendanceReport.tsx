import React from "react";
import { format } from "date-fns";
import { View, Image } from "@react-pdf/renderer";

export interface SessionInfo {
  name: string;
}

export interface ClassInfo {
  name: string;
}

export interface SectionInfo {
  name: string;
}

export interface StudentInfo {
  name: string;
  studentUniqueId: string;
  session: SessionInfo;
  class: ClassInfo;
  section: SectionInfo;
}

export interface StatusDetail {
  status: string;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface StudentAttendance {
  id: number;
  branchId: number;
  date: string; // ISO string
  studentId: number;
  checkIn: string;
  checkOut: string;
  checkInStatus: string;
  checkOutStatus: string;
  status: "Present" | "Absent" | "Leave";
  createdAt: string;
  updatedAt: string;
  student: StudentInfo;
  [key: string]: string | number | StatusDetail | StudentInfo;
}

interface ISeatStatusPrintProps {
  categoryData: StudentAttendance[];
  logo: { companyLogoBangla: string };
  branchInfo: { schoolName: string; logo: string }
}

const PrintStudentsDailyAttendanceReport = React.forwardRef<
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
          Students Daily Attendance Report
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
              <th className="border border-black px-2 py-1">CLASS</th>
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
                <tr key={row?.studentId}>
                  <td className="border border-black px-2 py-1 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-black px-2 py-1 text-center">
                    {row?.student?.name}
                  </td>
                  <td className="border border-black px-2 py-1 text-center">
                    {row?.student?.studentUniqueId}
                  </td>
                  <td className="border border-black px-2 py-1 text-center">
                    {row?.student?.class?.name}
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
PrintStudentsDailyAttendanceReport.displayName =
  "PrintStudentsDailyAttendanceReport";

export default PrintStudentsDailyAttendanceReport;
