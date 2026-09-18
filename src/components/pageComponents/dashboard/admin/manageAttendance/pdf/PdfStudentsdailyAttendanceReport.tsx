import { format } from "date-fns";
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";

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

Font.registerHyphenationCallback((word: string) => {
  const parts = word.split(/([-\s_])/);
  return parts.flatMap((p, i) => (i % 2 === 1 ? [p] : p.match(/.{1,10}/g) ?? [p]));
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 8,
    paddingBottom: 40,
  },
  headerDate: {
    fontSize: 8,
    position: "absolute",
    top: 10,
    left: 10,
  },
  footer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    fontSize: 8,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  heading: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: "center",
    fontWeight: "bold",
  },
  subHeading: {
    fontSize: 10,
    marginBottom: 5,
    textAlign: "center",
  },
  title: {
    fontSize: 10,
    marginBottom: 5,
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    flexDirection: "column",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    fontSize: 7,
    textAlign: "center",
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  logo: {
    width: 50,
    height: 25,
    marginBottom: 10,
    alignSelf: "center",
  },
});

const PdfStudentsdailyAttendanceReport = ({
  result,
  userName,
  branchInfo
}: {
  result: StudentAttendance[];
  userName: string;
  branchInfo: { schoolName: string, logo: string }
}) => {
  const currentDate = format(new Date(), "M/d/yy, h:mm a");


  // Define the required columns
  const columns = [
    { key: "sl", header: "SL", width: 15 },
    { key: "name", header: "NAME", width: 80 },
    { key: "id", header: "ID", width: 60 },
    { key: "class", header: "CLASS", width: 50 },
    { key: "checkIn", header: "CHECK IN", width: 50 },
    { key: "checkInStatus", header: "CHECK IN STATUS", width: 70 },
    { key: "checkOut", header: "CHECK OUT", width: 50 },
    { key: "checkOutStatus", header: "CHECK OUT STATUS", width: 70 },
    { key: "status", header: "STATUS", width: 50 },
  ];

  const totalTableWidth = columns.reduce((sum, col) => sum + col.width, 0);
  const pageHeight = 842; // A4 height
  const pageWidth = totalTableWidth + 20; // add padding

  return (
    <Document>
      <Page size={[pageWidth, pageHeight]} style={styles.page}>
        <Text style={styles.headerDate}>Date: {currentDate}</Text>

        <View style={styles.section}>
            <Image
              src={branchInfo?.logo}
              style={{ width: '60px', height: '50px' }}
            />

          <Text style={styles.heading}>{branchInfo?.schoolName}</Text>
          <Text style={styles.subHeading}>Students Daily Attendance Report</Text>
          <Text style={{ ...styles.title, textAlign: "right" }}>
            Download by: {userName}
          </Text>

          {/* Table */}
          <View style={[styles.table, { width: totalTableWidth }]}>
            {/* Headers */}
            <View style={styles.tableRow}>
              {columns.map((col) => (
                <Text
                  key={col.key}
                  style={[styles.tableHeader, { width: col.width }]}
                >
                  {col.header}
                </Text>
              ))}
            </View>

            {/* Data rows */}
            {result?.map((row) => (
              <View style={styles.tableRow} key={row.studentId} wrap={false}>
                {columns.map((col, index) => {
                  let value = "";

                  switch (col.key) {
                    case "sl":
                      value = JSON.stringify(index + 1);
                      break;
                    case "name":
                      value = row?.student?.name || "";
                      break;
                    case "id":
                      value = row?.student?.studentUniqueId || "";
                      break;
                    case "class":
                      value = row?.student?.class?.name || "";
                      break;
                    case "checkIn":
                      value = row?.checkIn || "";
                      break;
                    case "checkInStatus":
                      value = JSON.parse(row?.checkInStatus)?.status || "";
                      break;
                    case "checkOut":
                      value = row?.checkOut || "";
                      break;
                    case "checkOutStatus":
                      value = JSON?.parse(row?.checkOutStatus)?.status || "";
                      break;
                    case "status":
                      value = row?.status || "";
                      break;
                  }

                  return (
                    <Text
                      key={col.key}
                      style={[styles.tableCol, { width: col.width }]}
                    >
                      {value}
                    </Text>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};

export default PdfStudentsdailyAttendanceReport;
