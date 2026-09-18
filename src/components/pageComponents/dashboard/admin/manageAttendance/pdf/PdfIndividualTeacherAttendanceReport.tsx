/* eslint-disable @typescript-eslint/no-unused-vars */
import { format } from "date-fns";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { appConfiguration } from "@/app/utils/constant/appConfiguration";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";

export interface TeacherInfo {
  name: string;
  designation: string;
  teacherUniqueId: string;
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
  [key: string]: string | number | TeacherInfo;
}

Font.registerHyphenationCallback((word: string) => {
  const parts = word.split(/([-\s_])/);
  return parts.flatMap((p, i) =>
    i % 2 === 1 ? [p] : p.match(/.{1,10}/g) ?? [p]
  );
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
  infoBox: {
    marginBottom: 10,
    fontSize: 9,
    lineHeight: 1.5,
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
    height: 40,
    marginBottom: 10,
    alignSelf: "center",
  },
});

const PdfIndividualTeacherAttendanceReport = ({
  result,
  userName,
  branchInfo
}: {
  result: TeacherAttendance[];
  userName: string;
  branchInfo: { schoolName: string, logo: string }
}) => {
  const { appName } = appConfiguration;
  const currentDate = format(new Date(), "M/d/yy, h:mm a");

  // Define only relevant columns (date instead of name/id/designation)
  const columns = [
    { key: "sl", header: "SL", width: 20 },
    { key: "date", header: "DATE", width: 70 },
    { key: "checkIn", header: "CHECK IN", width: 60 },
    { key: "checkInStatus", header: "CHECK IN STATUS", width: 80 },
    { key: "checkInStatus", header: "CHECK IN NOTE", width: 80 },
    { key: "checkOut", header: "CHECK OUT", width: 60 },
    { key: "checkOutStatus", header: "CHECK OUT STATUS", width: 80 },
    { key: "checkOutStatus", header: "CHECK OUT NOTE", width: 80 },
    { key: "status", header: "STATUS", width: 50 },
  ];

  const totalTableWidth = columns.reduce((sum, col) => sum + col.width, 0);
  const pageHeight = 842; // A4 height
  const pageWidth = totalTableWidth + 20;

  // Use teacher info from the first row (since it's same for all)
  const teacherInfo = result?.[0]?.teacher;
  // Fetching branch name, email, address and logo.
  // const userInfo = getUserInfoFromToken();
  // const { data: branchConfigData } = useGetBranchConfigQuery(userInfo?.branchId)
  // const branchInfo = branchConfigData?.data;

  return (
    <Document>
      <Page size={[pageWidth, pageHeight]} style={styles.page}>
        <Text style={styles.headerDate}>Generated: {currentDate}</Text>

        <View style={styles.section}>
          <Image
            src={`${branchInfo?.logo}`}
            style={styles.logo}
          />

          <Text style={styles.heading}>{branchInfo?.schoolName}</Text>
          <Text style={styles.subHeading}>
            Individual Teacher Attendance Report
          </Text>
          <Text style={{ ...styles.title, textAlign: "right" }}>
            Download by: {userName}
          </Text>

          {/* Teacher Info Box */}
          {teacherInfo && (
            <View style={styles.infoBox}>
              <Text>Name: {teacherInfo.name}</Text>
              <Text>Designation: {teacherInfo.designation}</Text>
              <Text>ID: {teacherInfo.teacherUniqueId}</Text>
            </View>
          )}

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
            {result?.map((row, index) => (
              <View
                style={styles.tableRow}
                key={row?.teacherId + "-" + index}
                wrap={false}
              >
                {columns.map((col) => {
                  let value = "";

                  try {
                    switch (col.key) {
                      case "sl":
                        value = String(index + 1);
                        break;

                      case "date":
                        value = format(new Date(row?.date), "MM/dd/yyyy");
                        break;

                      case "checkIn":
                        value = row?.checkIn || "";
                        break;

                      case "checkInStatus": {
                        const data = JSON.parse(row?.checkInStatus || "{}");
                        value = data?.status || "";
                        break;
                      }

                      case "checkInNote": {
                        const data = JSON.parse(row?.checkInStatus || "{}");
                        value =
                          data?.hours !== undefined
                            ? `${data.hours}h ${data.minutes}m ${data.seconds}s`
                            : "";
                        break;
                      }

                      case "checkOut":
                        value = row?.checkOut || "";
                        break;

                      case "checkOutStatus": {
                        const data = JSON.parse(row?.checkOutStatus || "{}");
                        value = data?.status || "";
                        break;
                      }

                      case "checkOutNote": {
                        const data = JSON.parse(row?.checkOutStatus || "{}");
                        value =
                          data?.hours !== undefined
                            ? `${data.hours}h ${data.minutes}m ${data.seconds}s`
                            : "";
                        break;
                      }

                      case "status":
                        value = row?.status || "";
                        break;

                      default:
                        value = "";
                    }
                  } catch (error) {
                    value = "";
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

export default PdfIndividualTeacherAttendanceReport;
