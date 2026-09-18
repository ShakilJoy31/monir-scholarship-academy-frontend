"use client";
import { useGetFilteredStudentsQuery } from "@/app/store/api/student/studentApi";
import { Button } from "@/components/ui/button";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { useEffect, useState } from "react";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { Paper, Typography } from "@mui/material";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import { FaEye } from "react-icons/fa";
import SeatPlanView from "@/components/pageComponents/dashboard/admin/exam/SeatPlanDialog";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import JSZip from "jszip";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { theStar } from "@/lib/requiredJSX";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";

interface Student {
  id: number;
  studentUniqueId: string;
  name: string;
  fatherName?: string;
  motherName?: string;
  class?: {
    id: number;
    branchId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  section?: {
    id: number;
    branchId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  classRoll?: number;
  phone?: string;
  bloodGroup?: string;
  avatar?: string;
  stream?: {
    id: number;
    branchId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  session?: {
    id: number;
    branchId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  selected?: boolean;
  [key: string]: unknown;
}

const Loader = () => (
  <div className="w-full flex justify-center my-4">
    <div className="loader_global_template_2"></div>
  </div>
);

const SeatPlan = () => {
  const [filters, setFilters] = useState({
    sessionYear: "",
    section: "",
    className: "",
    stream: "",
  });
  const [searchParams, setSearchParams] = useState({
    sessionYear: "",
    section: "",
    className: "",
    stream: "",
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSeatPlanModalOpen, setIsSeatPlanModalOpen] = useState(false);
  const [isPdfProcessing, setIsPdfProcessing] = useState(false);
  const [isPrintProcessing, setIsPrintProcessing] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const { data: classes } = useGetAllClassQuery({});
  const { data: sessions } = useGetAllSessionsQuery({});
  const { data: sections } = useGetAllSectionsQuery({});
  const { data: streams } = useGetAllStreamsQuery({});

  interface ClassItem {
    id: number;
    name: string;
  }
  interface Session {
    id: number;
    name: string;
  }
  interface Section {
    id: number;
    name: string;
  }
  interface Stream {
    id: number;
    name: string;
  }

  const { data: studentsResponse, isLoading } = useGetFilteredStudentsQuery({
    sessionYear: searchParams.sessionYear,
    section: searchParams.section,
    className: searchParams.className,
    stream: searchParams.stream,
  });

  useEffect(() => {
    if (studentsResponse?.data) {
      const filtered = studentsResponse.data.map((student: Student) => ({
        ...student,
        selected: false,
      }));
      setFilteredStudents(filtered);
    }
  }, [studentsResponse]);

  const handleFilterChange = (e: {
    target: { name: string; value: string };
  }) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    setSearchParams(filters);
  };

  const handleViewSeatPlan = (student: Student) => {
    setSelectedStudent(student);
    setIsSeatPlanModalOpen(true);
  };

  interface Column<T> {
    key: keyof T | string;
    header: string | React.ReactNode;
    render?: (row: T, index?: number) => React.ReactNode;
    className?: string;
  }

  const columns: Column<Student>[] = [
    {
      key: "checkbox",
      header: (
        <input
          type="checkbox"
          onChange={(e) => {
            const isChecked = e.target.checked;
            setFilteredStudents((prev) =>
              prev.map((student) => ({
                ...student,
                selected: isChecked,
              }))
            );
          }}
          checked={
            filteredStudents.length > 0 &&
            filteredStudents.every((student) => student.selected)
          }
        />
      ),
      render: (row: Student) => (
        <input
          type="checkbox"
          checked={row.selected || false}
          onChange={(e) => {
            const isChecked = e.target.checked;
            setFilteredStudents((prev) =>
              prev.map((student) =>
                student.id === row.id
                  ? { ...student, selected: isChecked }
                  : student
              )
            );
          }}
        />
      ),
    },
    {
      key: "sl",
      header: "SL",
      render: (row: Student, index?: number) =>
        index !== undefined ? index + 1 : null,
    },
    {
      key: "studentUniqueId",
      header: "Student ID",
    },
    {
      key: "name",
      header: "Name",
    },
    {
      key: "class",
      header: "Class",
      render: (row: Student) => row.class?.name || "N/A",
    },
    {
      key: "section",
      header: "Section",
      render: (row: Student) => row.section?.name || "N/A",
    },
    {
      key: "stream",
      header: "Stream",
      render: (row: Student) => row.stream?.name || "N/A",
    },
    {
      key: "session",
      header: "Session Year",
      render: (row: Student) => row.session?.name || "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Student) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewSeatPlan(row)}
            className="p-2 text-white hover:text-white bg-[#035140] transition-opacity hover:cursor-pointer duration-100 active:opacity-75 hover:bg-[#035140]/90"
          >
            <FaEye className="mr-1" />
            View
          </Button>
        </div>
      ),
    },
  ];

  const userInfo = getUserInfoFromToken();
  const { data: branchConfigData } = useGetBranchConfigQuery(userInfo?.branchId)

  const branchInfo = branchConfigData?.data;

  const generateStudentSeatPlan = (student: Student) => {
    return `
  <div style="width:100%;height:100%;padding:3px;box-sizing:border-box;">
    <div style="background:white;padding:5px;height:100%;border:1px solid #ccc;font-size:0.6rem;">
      <div style="text-align:center;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <img src=${branchInfo?.logo || ""} 
               style="width:40px;height:40px;object-fit:cover;" 
               alt="${student.name}" />
          <div style="flex:1;margin-left:5px;">
            <h1 style="font-size:0.7rem;font-weight:bold;margin:0;line-height:1;">${branchInfo?.schoolName}</h1>
            <p style="font-size:0.5rem;margin:1px 0;line-height:1;">${branchInfo?.schoolAddress}</p>
            <div style="margin-top:0.2rem;">
              <span style="font-size:0.6rem;color:green;border:1px solid green;border-radius:9999px;padding:0.05rem 0.2rem;">
                Exam Seat Plan
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-top:0.3rem;">
        <div style="flex:1;display:flex;flex-direction:column;gap:0.1rem;font-size:0.55rem;">
          <div style="display:flex;">
            <span style="font-weight:600;width:35%;">Name:</span>
            <span style="flex:1;">${student.name}</span>
          </div>
          <div style="display:flex;">
            <span style="font-weight:600;width:35%;">ID:</span>
            <span style="flex:1;">${student.studentUniqueId}</span>
          </div>
          <div style="display:flex;">
            <span style="font-weight:600;width:35%;">Class:</span>
            <span style="flex:1;">${student.class?.name || ""}</span>
          </div>
          <div style="display:flex;">
            <span style="font-weight:600;width:35%;">Section:</span>
            <span style="flex:1;">${student.section?.name || ""}</span>
          </div>
          <div style="display:flex;">
            <span style="font-weight:600;width:35%;">Group:</span>
            <span style="flex:1;">${student.stream?.name || ""}</span>
          </div>
          <div style="display:flex;">
            <span style="font-weight:600;width:35%;">Session:</span>
            <span style="flex:1;">${student.session?.name || ""}</span>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;margin-left:5px;">
          <div style="width:2.5rem;height:2.5rem;border:1px solid gray;padding:0.1rem;margin-bottom:0;">
            ${student.avatar
        ? `<img src="${student.avatar}" style="width:100%;height:100%;object-fit:cover;" alt="${student.name}" />`
        : `<div style="width:100%;height:100%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:0.4rem;">No Photo</div>`
      }
          </div>

          <div style="width:2.5rem;border:1px solid gray;padding:0.05rem;text-align:center;margin-top:0.1rem;">
            <p style="font-weight:bold;font-size:0.5rem;margin:0;">Roll</p>
          </div>

          <div style="width:2.5rem;border:1px solid gray;padding:0.1rem;text-align:center;margin-top:0.1rem;">
            <p style="font-weight:bold;font-size:0.6rem;margin:0;">${student.classRoll || ""
      }</p>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
  };

  const getStudentsToProcess = () => {
    const selectedStudents = filteredStudents.filter(
      (student) => student.selected
    );
    return selectedStudents.length > 0 ? selectedStudents : filteredStudents;
  };

  const handleDownloadAllSeatPlans = async () => {
    const studentsToProcess = getStudentsToProcess();

    if (!studentsToProcess?.length) {
      alert("No students selected to download");
      return;
    }

    setIsPdfProcessing(true);

    try {
      const zip = new JSZip();

      // Group students into pages of 4
      const pages = [];
      for (let i = 0; i < studentsToProcess.length; i += 4) {
        pages.push(studentsToProcess.slice(i, i + 4));
      }

      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const pageStudents = pages[pageIndex];

        try {
          const container = document.createElement("div");
          container.style.position = "absolute";
          container.style.left = "-9999px";
          container.style.width = "700px";
          container.style.height = "450px";
          document.body.appendChild(container);



          container.innerHTML = `
  <div style="width:100%;height:100%;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:3px;padding:3px;box-sizing:border-box;">
    ${pageStudents.map(student => generateStudentSeatPlan(student)).join('')}
  </div>
`;

          await new Promise((resolve) => {
            const images = container.getElementsByTagName("img");
            let loaded = 0;

            if (images.length === 0) {
              resolve(true);
              return;
            }

            for (const img of images) {
              img.onload = () => {
                loaded++;
                if (loaded === images.length) resolve(true);
              };
              img.onerror = () => {
                loaded++;
                if (loaded === images.length) resolve(true);
              };
            }
          });

          const canvas = await html2canvas(container as HTMLElement, {
            scale: 1.5, // Reduced from 2 to 1.5
            logging: true,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
          });

          document.body.removeChild(container);

          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: "a4",
          });

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;

          // Compute scaling ratio to fit in one page
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

          // Center the content
          const x = (pdfWidth - imgWidth * ratio) / 2;
          const y = (pdfHeight - imgHeight * ratio) / 2;

          const imgData = canvas.toDataURL("image/png", 1.0);
          pdf.addImage(imgData, "PNG", x, y, imgWidth * ratio, imgHeight * ratio);


          zip.file(
            `Seat_Plans_Page_${pageIndex + 1}.pdf`,
            pdf.output("blob")
          );
        } catch (error) {
          console.error(`Error processing page ${pageIndex + 1}:`, error);
          continue;
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Students_Seat_Plans.zip";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Error generating zip file:", error);
      alert("Failed to generate seat plans. Check console for details.");
    } finally {
      setIsPdfProcessing(false);
    }
  };

  const handlePrintAllSeatPlans = async () => {
    const studentsToProcess = getStudentsToProcess();

    if (!studentsToProcess?.length) {
      alert("No students selected to print");
      return;
    }

    setIsPrintProcessing(true);

    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Popup was blocked. Please allow popups for this site.");
        return;
      }

      // Group students into pages of 4
      const pages = [];
      for (let i = 0; i < studentsToProcess.length; i += 4) {
        pages.push(studentsToProcess.slice(i, i + 4));
      }

      let printContent = `
<!DOCTYPE html>
<html>
  <head>
    <title>Students Seat Plans</title>
    <style>
      @page {
        size: A4 landscape;
        margin: 3mm; // Further reduced margin
      }
      body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        font-family: Arial, sans-serif;
      }
      .page {
        width: 100%;
        height: 100vh;
        page-break-after: always;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .page:last-child {
        page-break-after: auto;
      }
      .seat-plans-grid {
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 3px; // Further reduced gap
        padding: 3px; // Further reduced padding
        box-sizing: border-box;
      }
    </style>
  </head>
  <body>
`;

      // Add each page with 4 seat plans
      pages.forEach((pageStudents) => {
        printContent += `
      <div class="page">
        <div class="seat-plans-grid">
          ${pageStudents.map(student => generateStudentSeatPlan(student)).join('')}
        </div>
      </div>
    `;
      });

      // Close the HTML document
      printContent += `
      </body>
      <script>
        // Wait for all images and content to load before printing
        window.onload = function() {
          setTimeout(() => {
            window.print();
            setTimeout(() => {
              window.close();
            }, 500);
          }, 1000);
        };
      </script>
    </html>
  `;

      // Write the content to the print window
      printWindow.document.write(printContent);
      printWindow.document.close();
    } catch (error) {
      console.error("Error printing seat plans:", error);
      alert("An error occurred while printing. Please try again.");
    } finally {
      setIsPrintProcessing(false);
    }
  };

  return (
    <>
      {isSeatPlanModalOpen && selectedStudent ? (
        <SeatPlanView
          selectedStudent={selectedStudent}
          branchInfo={branchInfo}
          onClose={() => setIsSeatPlanModalOpen(false)}
        />
      ) : (
        <div className="p-4 bg-gray-100 min-h-screen">
          <div className="flex justify-between py-4">
            <h2 className="text-xl font-semibold my-2">Students Seat Plan</h2>
            {filteredStudents.length > 0 && (
              <div className="flex gap-4">
                <SubmitButton
                  onClick={handlePrintAllSeatPlans}
                  disabled={
                    isPrintProcessing ||
                    filteredStudents?.filter((s) => s.selected).length === 0
                  }
                >
                  <span className="font-medium">
                    {isPrintProcessing ? "Processing..." : "Print"}
                  </span>
                </SubmitButton>

                <CancelButton
                  onClick={handleDownloadAllSeatPlans}
                  disabled={
                    isPdfProcessing ||
                    filteredStudents?.filter((s) => s.selected).length === 0
                  }
                >
                  <span className="font-medium">
                    {isPdfProcessing ? "Processing..." : "PDF"}
                  </span>
                </CancelButton>
              </div>
            )}
          </div>

          <Paper sx={{ p: 3, mb: 3 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormControl fullWidth size="small">
                <InputLabel>Session Year {theStar}</InputLabel>
                <Select
                  name="sessionYear"
                  value={filters.sessionYear}
                  onChange={handleFilterChange}
                  label="Session Year"
                  sx={{
                    height: 45,
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                >
                  <MenuItem value="">All Sessions</MenuItem>
                  {(sessions?.data as Session[])?.map((session) => (
                    <MenuItem key={session.id} value={session.name}>
                      {session.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Class {theStar}</InputLabel>
                <Select
                  name="className"
                  value={filters.className}
                  onChange={handleFilterChange}
                  label="Class"
                  sx={{
                    height: 45,
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {(classes?.data as ClassItem[])?.map((classItem) => (
                    <MenuItem key={classItem.id} value={classItem.name}>
                      {classItem.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Section {theStar}</InputLabel>
                <Select
                  name="section"
                  value={filters.section}
                  onChange={handleFilterChange}
                  label="Section"
                  sx={{
                    height: 45,
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                >
                  <MenuItem value="">All Sections</MenuItem>
                  {(sections?.data as Section[])?.map((section) => (
                    <MenuItem key={section.id} value={section.name}>
                      {section.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Group {theStar}</InputLabel>
                <Select
                  name="stream"
                  value={filters.stream}
                  onChange={handleFilterChange}
                  label="Stream"
                  sx={{
                    height: 45,
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                >
                  <MenuItem value="">All Streams</MenuItem>
                  {(streams?.data as Stream[])?.map((stream) => (
                    <MenuItem key={stream.id} value={stream.name}>
                      {stream.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                className="bg-[#035140] hover:cursor-pointer"
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </Paper>

          <Paper sx={{ p: 2 }}>
            {isLoading ? (
              <Loader />
            ) : filteredStudents.length === 0 ? (
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{ mt: 4, textAlign: "center" }}
              >
                No students found matching your filters.
              </Typography>
            ) : (
              <>
                {filteredStudents.length > 0 && (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Showing {filteredStudents.length} students
                  </Typography>
                )}
                <ReusableTable<Student>
                  columns={columns}
                  data={filteredStudents}
                />
              </>
            )}
          </Paper>



        </div>
      )}
    </>
  );
};

export default SeatPlan;




//  {/* ID Card Modal */}
//           <Dialog open={isIdCardModalOpen} onOpenChange={setIsIdCardModalOpen}>
//             <DialogContent className="max-w-[300px] max-h-[80vh] overflow-y-auto mt-3">
//               {selectedStudent && (
//                 <div className="flex justify-center pb-4">
//                   <div
//                     className="w-[350px] h-[500px] text-black rounded-lg shadow-2xl border relative overflow-hidden flex"
//                     style={{
//                       backgroundImage: "url('/card-bg.jpg')",
//                       backgroundSize: "cover",
//                       backgroundPosition: "bottom",
//                     }}
//                   >
//                     {/* Main Card Content */}
//                     <div className="flex-1 border m-2 rounded-md">
//                       {/* Top Header with Logo and ID */}
//                       <div className="text-center py-2 px-2">
//                         <h2 className="text-xs font-bold leading-tight mt-5">
//                           SCOPUS INTERNATIONAL SCHOOL
//                           <br />
//                           AND COLLEGE
//                         </h2>
//                       </div>
//                       <div className="flex items-center justify-center gap-10">
//                         <div>
//                           <Image
//                             src={""}
//                             width={100}
//                             height={100}
//                             alt={"image"}
//                             className="w-full h-full object-cover border"
//                           />
//                         </div>

//                         <p className="text-xs font-semibold my-10">
//                           ID: {selectedStudent.studentUniqueId}
//                         </p>
//                       </div>

//                       {/* User Photo */}
//                       <div className="flex justify-center">
//                         <div className="w-20 h-24 border border-gray-300 overflow-hidden">
//                           {selectedStudent.avatar ? (
//                             <Image
//                               src={selectedStudent.avatar}
//                               width={80}
//                               height={96}
//                               alt={selectedStudent.name}
//                               className="w-full h-full object-cover"
//                             />
//                           ) : (
//                             <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
//                               No Photo
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       {/* Name Strip */}
//                       <div className="text-white bg-[#0a2c59] py-1 text-center mt-2">
//                         <p className="font-bold uppercase text-[14px]">
//                           {selectedStudent.name}
//                         </p>
//                       </div>

//                       {/* Details */}
//                       <div className="px-3 mt-1 text-xs leading-snug">
//                         <p>
//                           <span className="font-semibold">F.Name</span> :{" "}
//                           {selectedStudent.fatherName || "N/A"}
//                         </p>
//                         <p>

//                           <span className="font-semibold">M.Name</span> :{" "}
//                           {selectedStudent.motherName || "N/A"}
//                         </p>
//                         <p>
//                           <span className="font-semibold">Class</span> :{" "}
//                           {selectedStudent.class?.name || "N/A"}
//                         </p>
//                         <p>
//                           <span className="font-semibold">Section</span> :{" "}
//                           {selectedStudent.section?.name || "N/A"}
//                         </p>
//                         <p>
//                           <span className="font-semibold">Roll</span> :{" "}
//                           {selectedStudent.classRoll || "N/A"}
//                         </p>
//                         <p>
//                           <span className="font-semibold">Mobile</span> :{" "}
//                           {selectedStudent.phone || "N/A"}
//                         </p>
//                         <p>
//                           <span className="font-semibold">Blood</span> :{" "}
//                           {selectedStudent.bloodGroup || "N/A"}
//                         </p>
//                       </div>

//                       {/* Footer */}
//                       <div className="flex items-end justify-end px-3 py-2 mt-5">
//                         {/* Signature */}
//                         <div className="text-center text-xs">
//                           <div className="border-t border-black pt-1">
//                             Principal
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </DialogContent>
//           </Dialog>