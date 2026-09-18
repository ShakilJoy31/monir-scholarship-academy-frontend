import React from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { View, Image } from "@react-pdf/renderer";

export interface TeacherInfo {
  name: string;
  designation: string;
  teacherUniqueId: string;
}

export interface TeacherReport {
  id: number;
  branchId: number;
  date: string;
  teacherId: number;
  checkIn: string | null;
  checkOut: string | null;
  checkInStatus: string | null;
  checkOutStatus: string | null;
  status: "Present" | "Absent" | "Leave";
  createdAt: string;
  updatedAt: string;
  teacher: TeacherInfo;
}

export interface TeacherMonthlyReports {
  teacherId: number;
  teacher: TeacherInfo;
  report: TeacherReport[];
  [key: string]: string | number | TeacherInfo | TeacherReport[];
}

interface ISeatStatusPrintProps {
  categoryData: TeacherMonthlyReports[];
  logo: { companyLogoBangla: string };
  selectedMonth: string;
  branchInfo: { schoolName: string; logo: string }
}

const PrintTeachersMonthlyAttendanceReport = React.forwardRef<HTMLDivElement, ISeatStatusPrintProps>(
  ({ categoryData, selectedMonth, branchInfo }, ref) => {
    const currentDate = format(new Date(), "MMMM dd, yyyy");
    const daysInMonth = dayjs(selectedMonth).daysInMonth();

    // Generate day headers
    const dayColumns = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <section ref={ref} className="flex flex-col justify-center items-center" style={{ width: "100%", height: "100%" }}>
        {/* Header */}
        <header className="mb-6 mt-6 text-center">
          <View style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <Image
              src={branchInfo?.logo}
              style={{ width: '60px', height: '50px' }}
            />
          </View>
          <p className="font-bold pb-2 text-sm leading-6">{branchInfo?.schoolName}</p>
          <p className="font-bold pb-2 text-sm leading-6">Monthly Attendance Report</p>
          <p className="font-bold text-sm leading-6">Date: {currentDate}</p>
        </header>

        {/* Table */}
        <div className="w-full px-6 " style={{ transform: `scale(${Math.min(1, 800 / (daysInMonth * 26.5 + 200))})`, transformOrigin: "top left" }}>
          <table className="table-auto border-collapse border border-black text-sm">
            <thead> 
              <tr>
                <th className="border border-black px-2 py-1">SL</th>
                <th className="border border-black px-2 py-1">Teacher Name</th>
                <th className="border border-black px-2 py-1">Designation</th>
                {dayColumns.map(day => (
                  <th key={day} className="border border-black px-2 py-1">{day}</th>
                ))}
                <th className="border border-black px-2 py-1">P</th>
                <th className="border border-black px-2 py-1">A</th>
                <th className="border border-black px-2 py-1">L</th>
              </tr>
            </thead>
            <tbody>
              {categoryData?.map((teacherRow, index) => {
                const presentDays = teacherRow.report.filter(r => r.status === "Present").length;
                const absentDays = teacherRow.report.filter(r => r.status === "Absent").length;
                const leaveDays = teacherRow.report.filter(r => r.status === "Leave").length;

                return (
                  <tr key={teacherRow.teacherId}>
                    <td className="border border-black px-2 py-1">{index + 1}</td>
                    <td className="border border-black px-2 py-1">{teacherRow.teacher.name}</td>
                    <td className="border border-black px-2 py-1">{teacherRow.teacher.designation}</td>

                    {dayColumns.map((day, dayIndex) => {
                      const dayStatus = teacherRow.report?.[dayIndex]?.status?.[0] || "";
                      return (
                        <td key={day} className="border border-black px-2 py-1 text-center">{dayStatus}</td>
                      );
                    })}

                    <td className="border border-black px-2 py-1 text-center">{presentDays}</td>
                    <td className="border border-black px-2 py-1 text-center">{absentDays}</td>
                    <td className="border border-black px-2 py-1 text-center">{leaveDays}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  }
);

// ✅ Add display name here
PrintTeachersMonthlyAttendanceReport.displayName =
  "PrintTeachersMonthlyAttendanceReport";

export default PrintTeachersMonthlyAttendanceReport;

