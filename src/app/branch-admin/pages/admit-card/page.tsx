"use client";
import { useGetFilteredStudentsQuery } from "@/app/store/api/student/studentApi";
import { Button } from "@/components/ui/button";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { useState, useEffect } from "react";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { Paper, Typography } from "@mui/material";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import { FaEye } from "react-icons/fa";
import AdmitCardView from "@/components/pageComponents/dashboard/admin/exam/AdmitCardView";
import JSZip from "jszip";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { Student } from "@/components/shared/reusable-component/studentTypeInterface";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { theStar } from "@/lib/requiredJSX";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { useGetAllExamRoutingsQuery } from "@/app/store/api/classes/examRoutineApi";

interface Subject {
  sl: number;
  date: string;
  subjectCode: string;
  subjectName: string;
  time: string;
}

const Loader = () => (
  <div className="w-full flex justify-center my-4">
    <div className="loader_global_template_2"></div>
  </div>
);

const AdmitCard = () => {
  const [filters, setFilters] = useState({
    sessionYear: "",
    section: "",
    className: "",
    stream: "",
  });
  const [searchParams, setSearchParams] = useState({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAdmitCardModalOpen, setIsAdmitCardModalOpen] = useState(false);
  const [isPdfProcessing, setIsPdfProcessing] = useState(false);
  const [isPrintProcessing, setIsPrintProcessing] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const { data: classes } = useGetAllClassQuery({});
  const { data: sessions } = useGetAllSessionsQuery({});
  const { data: sections } = useGetAllSectionsQuery({});
  const { data: streams } = useGetAllStreamsQuery({});

  const { data: studentsResponse, isLoading } =
    useGetFilteredStudentsQuery(searchParams);

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

  const {data: examRouting} = useGetAllExamRoutingsQuery({})
  // console.log("examRouting", examRouting)

const examSubjects: Subject[] = examRouting?.data?.map((item, index) => ({
  sl: index + 1,
  date: item?.examDate,
  subjectCode: item?.subject.code,
  subjectName: item?.subject.name,
  time: `${item?.startTime} - ${item?.endTime}`,
})) || [];

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
    setSearchParams({
      sessionYear: filters.sessionYear,
      section: filters.section,
      className: filters.className,
      stream: filters.stream,
    });
  };

  const handleViewAdmitCard = (student: Student) => {
    setSelectedStudent(student);
    setIsAdmitCardModalOpen(true);
  };

  interface Column<T> {
    key: keyof T | string;
    header: string | React.ReactNode;
    render?: (row: T, index?: number) => React.ReactNode;
    className?: string;
  }

  const userInfo = getUserInfoFromToken();
  const { data: branchConfigData } = useGetBranchConfigQuery(userInfo?.branchId)

  const branchInfo = branchConfigData?.data;

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
            onClick={() => handleViewAdmitCard(row)}
            className="p-2 text-white hover:text-white bg-[#035140] transition-opacity hover:cursor-pointer duration-100 active:opacity-75 hover:bg-[#035140]/90"
          >
            <FaEye className="mr-1" />
            View
          </Button>
        </div>
      ),
    },
  ];

  const generateStudentAdmitCard = (student: Student) => {
    return `
        <div style="width:100%;height:100%;padding:20px;box-sizing:border-box;">
            <div style="background:white;padding:20px;height:100%;">
                <div style="display:flex;justify-content:center;margin-bottom:20px;">
                    <img src=${branchInfo?.logo || ""}
                         style="width:128px;height:128px;object-fit:cover;border:2px solid gray" 
                         alt="${student.name}" />
                </div>
                
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px;margin-bottom:20px;">
                    <h1 style="font-size:1.75rem;font-weight:bold;margin:0;">${branchInfo?.schoolName}</h1>
                    <p style="font-size:1.125rem;margin:0;">${branchInfo?.schoolAddress}</p>
                    <h2 style="font-size:1.5rem;font-weight:bold;margin:8px 0 0 0;">ADMIT CARD</h2>
                    <p style="font-size:1.125rem;margin:0;">Annual Examination</p>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-top:2rem;">
                    <div style="flex:1;display:flex;flex-direction:column;gap:0.75rem;font-size:1.125rem;">
                        <div style="display:flex;">
                            <span style="font-weight:600;width:40%;">Name:</span>
                            <span style="flex:1;">${student.name}</span>
                        </div>
                        <div style="display:flex;">
                            <span style="font-weight:600;width:40%;">Father's Name:</span>
                            <span style="flex:1;">${student.fatherName}</span>
                        </div>
                        <div style="display:flex;">
                            <span style="font-weight:600;width:40%;">Mother's Name:</span>
                            <span style="flex:1;">${student.motherName}</span>
                        </div>
                        <div style="display:flex;">
                            <span style="font-weight:600;width:40%;">Student ID:</span>
                            <span style="flex:1;">${
                              student.studentUniqueId
                            }</span>
                        </div>
                        <div style="display:flex;">
                            <span style="font-weight:600;width:40%;">Class:</span>
                            <span style="flex:1;">${
                              student.class?.name || ""
                            }</span>
                        </div>
                        <div style="display:flex;">
                            <span style="font-weight:600;width:40%;">Section:</span>
                            <span style="flex:1;">${
                              student.section?.name || ""
                            }</span>
                        </div>
                        <div style="display:flex;">
                            <span style="font-weight:600;width:40%;">Group:</span>
                            <span style="flex:1;">${
                              student.stream?.name || ""
                            }</span>
                        </div>
                        <div style="display:flex;">
                            <span style="font-weight:600;width:40%;">Session:</span>
                            <span style="flex:1;">${
                              student.session?.name || ""
                            }</span>
                        </div>
                    </div>

                    <div style="display:flex;flex-direction:column;align-items:center;">
                        <div style="width:8rem;height:8rem;border:2px solid gray;padding:0.5rem;margin-bottom:0;">
                            ${
                              student.avatar
                                ? `<img src="${student.avatar}" style="width:100%;height:100%;object-fit:cover;" alt="${student.name}" />`
                                : `<div style="width:100%;height:100%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;">No Photo</div>`
                            }
                        </div>

                        <div style="width:8rem;border:2px solid gray;padding:0.25rem;text-align:center;margin-top:0.5rem;">
                            <p style="font-weight:bold;font-size:1.25rem;">Roll</p>
                        </div>

                        <div style="width:8rem;border:2px solid gray;padding:0.5rem;text-align:center;margin-top:0.5rem;">
                            <p style="font-weight:bold;font-size:1.25rem;">${
                              student.classRoll || ""
                            }</p>
                        </div>
                    </div>
                </div>

                <div style="margin-top:2rem;">
                    <h2 style="font-size:1.5rem;font-weight:bold;text-align:center;margin-bottom:1rem;">Exam Schedule</h2>
                    <table style="width:100%;border-collapse:collapse;font-size:1.125rem;">
                        <thead>
                            <tr style="background:#f3f4f6;">
                                <th style="border:1px solid #d1d5db;padding:0.5rem;">SL</th>
                                <th style="border:1px solid #d1d5db;padding:0.5rem;">Date</th>
                                <th style="border:1px solid #d1d5db;padding:0.5rem;">Subject Code</th>
                                <th style="border:1px solid #d1d5db;padding:0.5rem;">Subject Name</th>
                                <th style="border:1px solid #d1d5db;padding:0.5rem;">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${examSubjects
                              .map(
                                (subject, index) => `
                                <tr style="${
                                  index % 2 === 0
                                    ? "background:white;"
                                    : "background:#f9fafb;"
                                }">
                                    <td style="border:1px solid #d1d5db;padding:0.5rem;text-align:center;">${
                                      subject.sl
                                    }</td>
                                    <td style="border:1px solid #d1d5db;padding:0.5rem;">${
                                      subject.date
                                    }</td>
                                    <td style="border:1px solid #d1d5db;padding:0.5rem;">${
                                      subject.subjectCode
                                    }</td>
                                    <td style="border:1px solid #d1d5db;padding:0.5rem;">${
                                      subject.subjectName
                                    }</td>
                                    <td style="border:1px solid #d1d5db;padding:0.5rem;">${
                                      subject.time
                                    }</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>

                <div style="display:flex;justify-content:space-between;margin-top:2rem;padding:0 1rem;">
                    <div style="text-align:center;">
                        <div style="border-top:2px solid black;width:10rem;margin:0 auto;"></div>
                        <p style="font-size:1.125rem;margin-top:0.5rem;">Invigilator's Signature</p>
                    </div>
                    <div style="text-align:center;">
                        <div style="border-top:2px solid black;width:10rem;margin:0 auto;"></div>
                        <p style="font-size:1.125rem;margin-top:0.5rem;">Principal's Signature</p>
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

const handleDownloadAllAdmitCards = async () => {
  const studentsToProcess = getStudentsToProcess();

  if (!studentsToProcess?.length) {
    alert("No students selected to download");
    return;
  }

  setIsPdfProcessing(true);

  try {
    const zip = new JSZip();

    for (const student of studentsToProcess) {
      try {
        // Create temporary container for each student
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.width = "900px";
        container.style.background = "white";
        document.body.appendChild(container);

        // Generate admit card HTML
        container.innerHTML = generateStudentAdmitCard(student);

        // Wait for ALL resources (images, fonts, etc.) to load
        await waitForResources(container);

        // Generate canvas with better settings for images
        const canvas = await html2canvas(container as HTMLElement, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          logging: false,
          onclone: (clonedDoc) => {
            // Ensure images are properly loaded in the cloned document
            const images = clonedDoc.querySelectorAll('img');
            images.forEach(img => {
              if (!img.complete) {
                img.style.visibility = 'hidden';
              }
            });
          }
        });

        document.body.removeChild(container);

        // Create PDF with same settings as single download
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: 'mm',
          format: 'a4'
        });

        // Use same image positioning logic as single download
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const aspectRatio = canvas.width / canvas.height;
        const targetHeight = pdfHeight;
        const targetWidth = targetHeight * aspectRatio;
        const xOffset = (pdfWidth - targetWidth) / 2;

        pdf.addImage(canvas, 'PNG', xOffset > 0 ? xOffset : 0, 0, targetWidth, targetHeight);
        
        // Add to zip file
        zip.file(
          `${student.name}_${student.studentUniqueId}_admit_card.pdf`,
          pdf.output("blob")
        );
      } catch (error) {
        console.error(`Error processing student ${student.name}:`, error);
        continue;
      }
    }

    // Generate and download zip file
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Students_Admit_Cards.zip";
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
  } catch (error) {
    console.error("Error generating zip file:", error);
    alert("Failed to generate admit cards. Check console for details.");
  } finally {
    setIsPdfProcessing(false);
  }
};

const handlePrintAllAdmitCards = async () => {
  const studentsToProcess = getStudentsToProcess();

  if (!studentsToProcess?.length) {
    alert("No students selected to print");
    return;
  }

  setIsPrintProcessing(true);

  try {
    const imgDataUrls: string[] = [];

    // Process each student to generate image data
    for (const student of studentsToProcess) {
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.width = "900px";
      container.style.background = "white";
      document.body.appendChild(container);

      container.innerHTML = generateStudentAdmitCard(student);

      // Wait for ALL resources to load
      await waitForResources(container);

      // Generate canvas with better settings
      const canvas = await html2canvas(container as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/png");
      imgDataUrls.push(imgData);
    }

    // Create print window with same styling as single print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      let imagesHTML = '';
      imgDataUrls.forEach(imgData => {
        imagesHTML += `
          <div style="page-break-after: always; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
            <img src="${imgData}" style="max-width: 100%; max-height: 100%; width: auto; height: auto;" />
          </div>
        `;
      });

      printWindow.document.write(`
        <html>
          <head>
            <title>Students Admit Cards</title>
            <style>
              @page { 
                size: A4 portrait; 
                margin: 10mm;
              }
              body { 
                margin: 0; 
                padding: 0; 
                background: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              div {
                page-break-inside: avoid;
              }
              img {
                display: block;
                margin: 0 auto;
              }
            </style>
          </head>
          <body>
            ${imagesHTML}
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      // Fallback: create print content in current window
      const printContent = document.createElement('div');
      printContent.style.background = 'white';
      
      imgDataUrls.forEach(imgData => {
        const imgDiv = document.createElement('div');
        imgDiv.style.pageBreakAfter = 'always';
        imgDiv.style.display = 'flex';
        imgDiv.style.justifyContent = 'center';
        imgDiv.style.alignItems = 'center';
        imgDiv.style.minHeight = '100vh';
        
        const img = document.createElement('img');
        img.src = imgData;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.width = 'auto';
        img.style.height = 'auto';
        
        imgDiv.appendChild(img);
        printContent.appendChild(imgDiv);
      });
      
      const originalBody = document.body.innerHTML;
      const originalStyles = document.head.innerHTML;
      
      document.head.innerHTML = `
        <style>
          @page { 
            size: A4 portrait; 
            margin: 10mm;
          }
          body { 
            margin: 0; 
            padding: 0; 
            background: white !important;
          }
        </style>
      `;
      document.body.innerHTML = printContent.innerHTML;
      
      window.print();
      
      // Restore original content
      document.head.innerHTML = originalStyles;
      document.body.innerHTML = originalBody;
    }
  } catch (error) {
    console.error("Error printing admit cards:", error);
    alert("An error occurred while printing. Please try again.");
  } finally {
    setIsPrintProcessing(false);
  }
};

// Helper function to wait for all resources to load
const waitForResources = (container: HTMLElement): Promise<void> => {
  return new Promise((resolve) => {
    const images = container.getElementsByTagName('img');
    let imagesLoaded = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      // Also wait a bit for fonts and other resources
      setTimeout(resolve, 100);
      return;
    }

    const imageLoaded = () => {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        // Additional small delay to ensure everything is rendered
        setTimeout(resolve, 100);
      }
    };

    for (let i = 0; i < totalImages; i++) {
      const img = images[i];
      if (img.complete) {
        imageLoaded();
      } else {
        img.addEventListener('load', imageLoaded);
        img.addEventListener('error', imageLoaded); // Continue even if some images fail
      }
    }
  });
};

  return (
    <>
      {isAdmitCardModalOpen && selectedStudent ? (
        <AdmitCardView
          selectedStudent={selectedStudent}
          subjects={examSubjects}
          branchInfo={branchInfo}
          onClose={() => setIsAdmitCardModalOpen(false)}
        />
      ) : (
        <div className="p-4 bg-gray-100 min-h-screen">
          <div className="flex justify-between py-4">
            <h2 className="text-xl font-semibold my-2">Student Admit Card</h2>
            {filteredStudents.length > 0 && (
              <div className="flex gap-4">
                <SubmitButton
                  onClick={handlePrintAllAdmitCards}
                  disabled={
                    isPrintProcessing ||
                    filteredStudents.filter((s) => s.selected).length === 0
                  }
                >
                  <span className="font-medium">
                    {isPrintProcessing ? "Processing..." : "Print"}
                  </span>
                </SubmitButton>

                <CancelButton
                  onClick={handleDownloadAllAdmitCards}
                  disabled={
                    isPdfProcessing ||
                    filteredStudents.filter((s) => s.selected).length === 0
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
                <InputLabel>
                  Session Year <span className="-mt-1">{theStar}</span>
                </InputLabel>
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
                  <MenuItem value="">All Groups</MenuItem>
                  {(streams?.data as Stream[])?.map((stream) => (
                    <MenuItem key={stream.id} value={stream.name}>
                      {stream.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="flex justify-end mt-4">
              <SubmitButton
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : "Search"}
              </SubmitButton>
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

export default AdmitCard;
