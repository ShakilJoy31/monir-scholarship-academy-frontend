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
    date: string;
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
        height: 25,
        marginBottom: 10,
        alignSelf: "center",
    },
});

const PdfIndividualStudentsAttendanceReport = ({
    result,
    userName,
    branchInfo
}: {
    result: StudentAttendance[];
    userName: string;
    branchInfo: { schoolName: string; logo: string }
}) => {
    const currentDate = format(new Date(), "M/d/yy, h:mm a");

    // Define only relevant columns (date instead of name/id/designation)
    const columns = [
        { key: "sl", header: "SL", width: 20 },
        { key: "date", header: "DATE", width: 70 },
        { key: "checkIn", header: "CHECK IN", width: 60 },
        { key: "checkInStatus", header: "CHECK IN STATUS", width: 80 },
        { key: "checkOut", header: "CHECK OUT", width: 60 },
        { key: "checkOutStatus", header: "CHECK OUT STATUS", width: 80 },
        { key: "status", header: "STATUS", width: 50 },
    ];

    const totalTableWidth = columns.reduce((sum, col) => sum + col.width, 0);
    const pageHeight = 842; // A4 height
    const pageWidth = totalTableWidth + 20;

    // Use teacher info from the first row (since it's same for all)
    const studentInfo = result?.[0]?.student;

    return (
        <Document>
            <Page size={[pageWidth, pageHeight]} style={styles.page}>
                <Text style={styles.headerDate}>Generated: {currentDate}</Text>

                <View style={styles.section}>
                    <View style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                        <Image
                            src={branchInfo?.logo}
                            style={{ width: '60px', height: '50px' }}
                        />
                    </View>

                    <Text style={styles.heading}>{branchInfo?.schoolName}</Text>
                    <Text style={styles.subHeading}>Individual Teacher Attendance Report</Text>
                    <Text style={{ ...styles.title, textAlign: "right" }}>
                        Download by: {userName}
                    </Text>

                    {/* Teacher Info Box */}
                    {studentInfo && (
                        <View style={styles.infoBox}>
                            <Text>Name: {studentInfo?.name}</Text>
                            <Text>Section: {studentInfo?.section?.name}</Text>
                            <Text>Class: {studentInfo?.class?.name}</Text>
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
                            <View style={styles.tableRow} key={row?.teacherId + "-" + index} wrap={false}>
                                {columns.map((col) => {
                                    let value = "";

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
                                        case "checkInStatus":
                                            value = JSON.parse(row?.checkInStatus)?.status || "";
                                            break;
                                        case "checkOut":
                                            value = row?.checkOut || "";
                                            break;
                                        case "checkOutStatus":
                                            value = JSON.parse(row?.checkOutStatus)?.status || "";
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

export default PdfIndividualStudentsAttendanceReport;
