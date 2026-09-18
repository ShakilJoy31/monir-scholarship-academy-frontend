import { format } from "date-fns";
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import dayjs from "dayjs";

export interface StudentSession {
    name: string;
}

export interface StudentClass {
    name: string;
}

export interface StudentSection {
    name: string;
}

export interface StudentInfo {
    name: string;
    studentUniqueId: string;
    session: StudentSession;
    class: StudentClass;
    section: StudentSection;
}

export interface StudentReport {
    id: number;
    branchId: number;
    date: string;
    studentId: number;
    checkIn: string | null;
    checkOut: string | null;
    checkInStatus: string | null;
    checkOutStatus: string | null;
    status: "Present" | "Absent" | "Leave";
    createdAt: string;
    updatedAt: string;
    student: StudentInfo;
}

export interface StudentAttendanceMonthlyReport {
    studentId: number;
    student: StudentInfo;
    report: StudentReport[];
    [key: string]: string | number | StudentSession | StudentClass | StudentSection | StudentInfo | StudentReport[];
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

const PdfStudentsMonthlyAttendanceReport = ({
    result,
    userName,
    selectedMonth,
    branchInfo
}: {
    result: StudentAttendanceMonthlyReport[];
    userName: string;
    selectedMonth: string;
    branchInfo: { schoolName: string; logo: string }
}) => {
    const currentDate = format(new Date(), "M/d/yy, h:mm a");

    const daysInMonth = dayjs(selectedMonth).daysInMonth();

    // Define base widths for certain columns
    const columns = [
        { key: "sl", header: "SL", width: 15 },
        { key: "name", header: "NAME", width: 100 },
        { key: "session", header: "Session", width: 40 },
        { key: "class", header: "Class", width: 80 },
        ...Array.from({ length: daysInMonth }, (_, i) => ({
            key: `day${i + 1}`,
            header: `${i + 1}`,
            width: 15,
        })),
        { key: "P", header: "P", width: 15 },
        { key: "A", header: "A", width: 15 },
        { key: "L", header: "L", width: 15 },
    ];

    // ✅ Dynamic page width based on total column widths
    const totalTableWidth = columns.reduce((sum, col) => sum + col.width, 0);
    const pageHeight = 842; // A4 height
    const pageWidth = totalTableWidth + 20; // add some padding

    return (
        <Document>
            <Page size={[pageWidth, pageHeight]} style={styles.page}>
                <Text style={styles.headerDate}>Date: {currentDate}</Text>

                <View style={styles.section}>
                    <View style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                        <Image
                            src={branchInfo?.logo}
                            style={{ width: '60px', height: '50px' }}
                        />
                    </View>

                    <Text style={styles.heading}>{branchInfo?.schoolName}</Text>
                    <Text style={styles.subHeading}>Students monthly Attendance Report</Text>
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
                        {result?.map((row, index) => (
                            <View style={styles.tableRow} key={row?.studentId} wrap={false}>
                                {columns.map((col) => {
                                    let value = "";

                                    if (col.key === "sl") value = `${index + 1}`;
                                    else if (col.key === "name") value = row?.student?.name || "";
                                    else if (col.key === "session")
                                        value = row?.student?.session?.name || "";
                                    else if (col.key === "class")
                                        value = row?.student?.class?.name || "";
                                    else if (col.key.startsWith("day")) {
                                        const dayIndex = parseInt(col.key.replace("day", "")) - 1;
                                        value = row?.report?.[dayIndex]?.status?.slice(0, 1) || "";
                                    } else if (col.key === "P") {
                                        value = row?.report?.filter((r) => r.status === "Present")?.length.toString();
                                    } else if (col.key === "A") {
                                        value = row?.report?.filter((r) => r.status === "Absent")?.length.toString();
                                    } else if (col.key === "L") {
                                        value = row?.report?.filter((r) => r.status === "Leave")?.length.toString();
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


export default PdfStudentsMonthlyAttendanceReport;
