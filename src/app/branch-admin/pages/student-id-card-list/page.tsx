"use client";

import { useGetFilteredStudentsQuery } from "@/app/store/api/student/studentApi";
import { Button } from "@/components/ui/button";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { useState, ChangeEvent } from "react";
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  Paper,
  Typography,
} from "@mui/material";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";

interface Student extends Record<string, unknown> {
  id: number;
  studentUniqueId: string;
  name: string;
  fatherName?: string;
  motherName?: string;
  class?: {
    id: number;
    name: string;
  };
  section?: {
    id: number;
    name: string;
  };
  classRoll?: string;
  phone?: string;
  bloodGroup?: string;
  avatar?: string;
  stream?: {
    id: number;
    name: string;
  };
  session?: {
    id: number;
    name: string;
  };
}

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

interface ApiResponse<T> {
  data?: T[];
}

// Column type for the table
interface Column<T> {
  key: keyof T | string;
  header: string | React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

const StudentIdCardList = () => {
  const [tempFilters, setTempFilters] = useState({
    sessionYear: "",
    section: "",
    className: "",
    stream: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    sessionYear: "",
    section: "",
    className: "",
    stream: "",
  });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const { data: classes } = useGetAllClassQuery({});
  const { data: sessions } = useGetAllSessionsQuery({});
  const { data: sections } = useGetAllSectionsQuery({});
  const { data: streams } = useGetAllStreamsQuery({});

  const {
    data: filteredStudents,
    isLoading,
  } = useGetFilteredStudentsQuery({
    sessionYear: appliedFilters?.sessionYear,
    section: appliedFilters?.section,
    className: appliedFilters?.className,
    stream: appliedFilters?.stream,
  });


  // Fetching branch name, email, address and logo. 
  const userInfo = getUserInfoFromToken();
  const { data: branchConfigData } = useGetBranchConfigQuery(userInfo?.branchId)
  const branchInfo = branchConfigData?.data;

  const handleFilterChange = (e: {
    target: { name: string; value: string };
  }) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    setAppliedFilters(tempFilters);
    setSelectedRows([]);
  };

  const handleViewIdCard = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const toggleRowSelection = (studentId: number) => {
    setSelectedRows((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    if (filteredStudents?.data) {
      if (event.target.checked) {
        const allIds = filteredStudents.data.map(
          (student: { id: number }) => student.id
        );
        setSelectedRows(allIds);
      } else {
        setSelectedRows([]);
      }
    }
  };

  // const handleSelectAllClick = () => {
  //   if (filteredStudents?.data) {
  //     if (selectedRows.length === filteredStudents.data.length) {
  //       setSelectedRows([]);
  //     } else {
  //       const allIds = filteredStudents.data.map(
  //         (student: { id: number }) => student.id
  //       );
  //       setSelectedRows(allIds);
  //     }
  //   }
  // };

  const handlePrint = (student: Student) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @page {
                size: A4;
                margin: 10mm;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                  font-family: sans-serif;
                }
                .id-card {
                  page-break-inside: avoid;
                  margin-bottom: 10mm;
                }
              }
            </style>
          </head>
          <body class="p-4 bg-white">
            <div class="flex justify-center pb-4">
              <div
                class="w-[390px] h-[500px] text-black rounded-lg shadow-2xl border-2 border-[#0a2c59] relative overflow-hidden flex items-center justify-center"
                style="
                  background-image: url('${branchInfo?.idCardBackground}');
                  background-size: contain;
                  background-repeat: no-repeat;
                  background-position: center;
                "
              >
                <!-- Semi-transparent overlay -->
                <div class="absolute inset-0 bg-white/80"></div>
                <!-- Main Card Content -->
                <div class="flex-1 rounded-md relative z-50">
                  <!-- Top Header with Logo and ID -->
                  <div class="text-center py-2 px-2">
                    <h2 class="text-xs font-bold leading-tight mt-5">
                      ${branchInfo?.schoolName}
                    </h2>
                  </div>
                  <div class="flex items-center justify-center gap-10">
                    <div>
                      <img src=${branchInfo?.logo} width="70" height="=60" alt="image" class="object-cover border" />
                    </div>

                    <p class="text-xs font-semibold my-10">
                      ID: ${student.studentUniqueId}
                    </p>
                  </div>

                  <!-- User Photo -->
                  <div class="flex justify-center">
                    <div class="w-20 h-24 border border-gray-300 overflow-hidden">
                      ${student.avatar
          ? `<img src="${student.avatar}" width="80" height="96" alt="${student.name}" class="w-full h-full object-cover" />`
          : `<div class="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                          No Photo
                        </div>`
        }
                    </div>
                  </div>

                  <!-- Name Strip -->
                  <div class="text-white bg-[#0a2c59] py-1 text-center mt-2">
                    <p class="font-bold uppercase text-[14px]">
                      ${student.name}
                    </p>
                  </div>

                  <!-- Details -->
                  <div class="px-3 mt-2 text-sm leading-snug">
                    <p>
                      <span class="font-semibold">Father Name</span> : ${student.fatherName || "N/A"
        }
                    </p>
                    <p>
                      <span class="font-semibold">Mother Name</span> : ${student.motherName || "N/A"
        }
                    </p>
                    <p>
                      <span class="font-semibold">Class</span> : ${student.class?.name || "N/A"
        }
                    </p>
                    <p>
                      <span class="font-semibold">Section</span> : ${student.section?.name || "N/A"
        }
                    </p>
                    <p>
                      <span class="font-semibold">Roll</span> : ${student.classRoll || "N/A"
        }
                    </p>
                    <p>
                      <span class="font-semibold">Mobile</span> : ${student.phone || "N/A"
        }
                    </p>
                    <p>
                      <span class="font-semibold">Blood</span> : ${student.bloodGroup || "N/A"
        }
                    </p>
                  </div>

                 
                  <!-- Principal signature at the bottom right -->
        <div style="display: flex; justify-content: flex-end; margin-right: 10px ">
            <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${branchInfo?.principalSignature}" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
                <div class="signature">Principal's Signature</div>
            </div>
        </div>
        
                </div>
              </div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 200);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();

      // Wait for content to load before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const handleDownloadPDF = async (student: Student) => {
    const pdf = new jsPDF();
    try {
      const container = document.createElement("div");
      container.id = "pdf-container";
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "450px";
      container.style.height = "620px";
      container.style.padding = "0";
      container.style.backgroundColor = "transparent";
      container.style.border = "none";
      container.style.boxSizing = "border-box";
      container.style.overflow = "hidden";
      container.style.zIndex = "9999";
      container.style.visibility = "visible";

      container.innerHTML = `
      <div style="
        width: 450px;
        height: 620px;
        color: black;
        border-radius: 0.5rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        border: 2px solid #0a2c59;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background-image: url('${branchInfo?.idCardBackground}');
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
        ">
          <!-- Semi-transparent overlay -->
          <div style="position: absolute; inset: 0; background-color: rgba(255, 255, 255, 0.8);"></div>
          
          <!-- Main Card Content -->
          <div style="flex: 1; border-radius: 0.375rem; position: relative; z-index: 50; margin: 0 8px;">
            <!-- Top Header with Logo and ID -->
            <div style="text-align: center; padding: 0.5rem 0.5rem;">
              <h2 style="font-size: 0.75rem; font-weight: 700; line-height: 1.25; margin-top: 1.25rem;">
                ${branchInfo?.schoolName}
              </h2>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 2.5rem;">
              <div>
                <img src="" width="100" height="100" alt="image" style="width: 100%; height: 100%; object-fit: cover; border: 1px solid #ddd;" />
              </div>
              <p style="font-size: 0.75rem; font-weight: 600; margin: 2.5rem 0;">
                ID: ${student.studentUniqueId}
              </p>
            </div>

            <!-- User Photo -->
            <div style="display: flex; justify-content: center;">
              <div style="width: 80px; height: 96px; border: 1px solid #d1d5db; overflow: hidden;">
                ${student.avatar
          ? `<img src="${student.avatar}" width="80" height="96" alt="${student.name}" 
                    style="width: 100%; height: 100%; object-fit: cover;" />`
          : `<div style="width: 100%; height: 100%; background-color: #d1d5db; 
                    display: flex; align-items: center; justify-content: center; color: #4b5563; font-size: 0.75rem;">
                    No Photo
                  </div>`
        }
              </div>
            </div>

            <!-- Name Strip -->
            <div style="color: white; background-color: #0a2c59; padding: 0.25rem 0; text-align: center; margin-top: 0.5rem;">
              <p style="font-weight: 700; text-transform: uppercase; font-size: 14px; margin: 0;">
                ${student.name}
              </p>
            </div>

            <!-- Details -->
            <div style="padding: 0 0.75rem; margin-top: 0.5rem; font-size: 0.875rem; line-height: 1.5;">
              <p>
                <span style="font-weight: 600;">Father Name</span> : ${student.fatherName || "N/A"
        }
              </p>
              <p>
                <span style="font-weight: 600;">Mother Name</span> : ${student.motherName || "N/A"
        }
              </p>
              <p>
                <span style="font-weight: 600;">Class</span> : ${student.class?.name || "N/A"
        }
              </p>
              <p>
                <span style="font-weight: 600;">Section</span> : ${student.section?.name || "N/A"
        }
              </p>
              <p>
                <span style="font-weight: 600;">Roll</span> : ${student.classRoll || "N/A"
        }
              </p>
              <p>
                <span style="font-weight: 600;">Mobile</span> : ${student.phone || "N/A"
        }
              </p>
              <p>
                <span style="font-weight: 600;">Blood</span> : ${student.bloodGroup || "N/A"
        }
              </p>
            </div>

            <!-- Principal signature at the bottom right -->
        <div style="display: flex; justify-content: flex-end; margin-right: 10px ">
            <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${branchInfo?.principalSignature}" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
                <div class="signature">Principal's Signature</div>
            </div>
        </div>

          </div>
        </div>
      `;

      document.body.appendChild(container);
      await document.fonts.ready;

      const canvas = await html2canvas(container, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scrollX: 0,
        scrollY: 0,
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight,
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/png");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = 350 * 0.264583;
      const imgHeight = (imgWidth * canvas.height) / canvas.width;

      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      pdf.save(`ID_Card_${student.studentUniqueId}.pdf`);
    } catch (error) {
      console.error(
        `Error generating PDF for student ${student.studentUniqueId}:`,
        error
      );
    }
  };

  const generateIDCard = (student: Student) => {
    return `
    <div style="width:100%;height:100%;padding:8px;box-sizing:border-box;border:2px solid #0a2c59;background:white;position:relative;overflow:hidden;">
      <!-- Background Image with Overlay -->
      <div style="position:absolute;inset:0; background-image: url('${branchInfo?.idCardBackground}'); background-size:contain; background-repeat: no-repeat; background-position:center;"></div>
      <div style="position:absolute;inset:0;background-color:rgba(255,255,255,0.8);"></div>
      
      <!-- Main Card Content -->
      <div style="flex:1;border-radius:0.375rem;position:relative;z-index:50;margin:0 8px;">
        <!-- Top Header with Logo and ID -->
        <div style="text-align:center;padding:0.5rem 0.5rem;">
          <h2 style="font-size:0.75rem;font-weight:700;line-height:1.25;margin-top:1.25rem;">
           ${branchInfo?.schoolName}
          </h2>
        </div>
        
        <div style="display:flex;align-items:center;justify-content:center;gap:2.5rem;">
          <div>
            <img src=${branchInfo?.logo} width="70" height="=60" alt="image" class="object-cover border" />
          </div>
          <p style="font-size:0.75rem;font-weight:600;margin:2.5rem 0;">
            ID: ${student.studentUniqueId}
          </p>
        </div>

        <!-- User Photo -->
        <div style="display:flex;justify-content:center;">
          <div style="width:80px;height:96px;border:1px solid #d1d5db;overflow:hidden;">
            ${student.avatar
        ? `<img src="${student.avatar}" width="80" height="96" alt="${student.name}" 
                style="width:100%;height:100%;object-fit:cover;" />`
        : `<div style="width:100%;height:100%;background-color:#d1d5db; 
                display:flex;align-items:center;justify-content:center;color:#4b5563;font-size:0.75rem;">
                No Photo
              </div>`
      }
          </div>
        </div>

        <!-- Name Strip -->
        <div style="color:white;background-color:#0a2c59;padding:0.25rem 0;text-align:center;margin-top:0.5rem;">
          <p style="font-weight:700;text-transform:uppercase;font-size:14px;margin:0;">
            ${student.name}
          </p>
        </div>

        <!-- Details -->
        <div style="padding:0 0.75rem;margin-top:0.5rem;font-size:0.875rem;line-height:1.5;">
          <p>
            <span style="font-weight:600;">Father Name</span> : ${student.fatherName || "N/A"
      }
          </p>
          <p>
            <span style="font-weight:600;">Mother Name</span> : ${student.motherName || "N/A"
      }
          </p>
          <p>
            <span style="font-weight:600;">Class</span> : ${student.class?.name || "N/A"
      }
          </p>
          <p>
            <span style="font-weight:600;">Section</span> : ${student.section?.name || "N/A"
      }
          </p>
          <p>
            <span style="font-weight:600;">Roll</span> : ${student.classRoll || "N/A"
      }
          </p>
          <p>
            <span style="font-weight:600;">Mobile</span> : ${student.phone || "N/A"
      }
          </p>
          <p>
            <span style="font-weight:600;">Blood</span> : ${student.bloodGroup || "N/A"
      }
          </p>
        </div>

         <!-- Principal signature at the bottom right -->
        <div style="display: flex; justify-content: flex-end; margin-right: 10px; ">
            <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${branchInfo?.principalSignature}" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
                <div class="signature">Principal's Signature</div>
            </div>
        </div>

      </div>
    </div>
  `;
  };

  const handlePrintAll = () => {
    if (!selectedRows.length || !filteredStudents?.data) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const selectedStudents = filteredStudents.data.filter(
        (student: { id: number }) => selectedRows.includes(student.id)
      );

      // Group students into pages of 2
      const pages = [];
      for (let i = 0; i < selectedStudents.length; i += 2) {
        pages.push(selectedStudents.slice(i, i + 2));
      }

      printWindow.document.write(`
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                font-family: sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              .page {
                page-break-after: always;
                width: 100%;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              .page:last-child {
                page-break-after: auto;
              }
              .id-cards-container {
                display: flex;
                gap: 10px;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
              }
              .id-card {
                width: calc(50% + 25px); /* Increased width by 50px (25px each side) */
                min-width: 350px; /* Minimum width to ensure proper sizing */
                height: 50%;
                border: 2px solid #0a2c59;
                border-radius: 8px;
                overflow: hidden;
                background: white;
                position: relative;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
            }
          </style>
        </head>
        <body class="bg-white">
          ${pages
          .map(
            (pageStudents) => `
            <div class="page">
              <div class="id-cards-container">
                ${pageStudents
                .map(
                  (student: Student) => `
                  <div class="id-card">
                    ${generateIDCard(student)}
                  </div>
                `
                )
                .join("")}
                ${pageStudents.length === 1
                ? '<div class="id-card"></div>' // Empty card for odd number
                : ""
              }
              </div>
            </div>
          `
          )
          .join("")}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
      printWindow.document.close();
    }
  };

  const handleDownloadAllPDFs = async () => {
    if (!selectedRows.length || !filteredStudents?.data) return;

    const selectedStudents = filteredStudents.data.filter(
      (student: { id: number }) => selectedRows.includes(student.id)
    );

    // Group students into pages of 2
    const pages = [];
    for (let i = 0; i < selectedStudents.length; i += 2) {
      pages.push(selectedStudents.slice(i, i + 2));
    }

    const pdf = new jsPDF();

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const pageStudents = pages[pageIndex];

      try {
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.width = "800px";
        container.style.height = "640px";
        container.style.background = "#ffffff";
        container.style.display = "flex";
        container.style.justifyContent = "center";
        container.style.alignItems = "center";
        container.style.boxSizing = "border-box";
        document.body.appendChild(container);

        // Create flex layout for 2 ID cards (same as print layout)
        container.innerHTML = `
        <div style="display: flex; gap: 10px; justify-content: center; align-items: center; width: 100%; height: 100%; box-sizing: border-box;">
          ${pageStudents
            .map(
              (student: Student) => `
            <div style="width: calc(50% + 25px); min-width: 350px; height: 100%; border: 2px solid #0a2c59; border-radius: 8px; overflow: hidden; background: white; position: relative; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              ${generateIDCard(student)}
            </div>
          `
            )
            .join("")}
          ${pageStudents.length === 1
            ? '<div style="width: calc(50% + 25px); min-width: 350px; height: 50%;"></div>' // Empty card for odd number
            : ""
          }
        </div>
      `;

        await document.fonts.ready;

        const canvas = await html2canvas(container, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
        });

        document.body.removeChild(container);

        const imgData = canvas.toDataURL("image/png", 1.0);

        if (pageIndex > 0) {
          pdf.addPage();
        }

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Calculate dimensions to fit the entire layout on the page
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.95;
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = (pdfHeight - imgHeight * ratio) / 2;

        pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      } catch (error) {
        console.error(`Error processing page ${pageIndex + 1}:`, error);
        continue;
      }
    }

    pdf.save(`ID_Cards_${selectedStudents.length}_Students.pdf`);
  };

  const columns: Column<Student>[] = [
    {
      key: "select",
      header: (
        <div className="flex items-center">
          <Checkbox
            checked={
              filteredStudents?.data &&
              filteredStudents.data.length > 0 &&
              selectedRows.length === filteredStudents.data.length
            }
            indeterminate={
              selectedRows.length > 0 &&
              filteredStudents?.data &&
              selectedRows.length < filteredStudents.data.length
            }
            onChange={toggleSelectAll}
          />
        </div>
      ),
      render: (row: Student) => (
        <Checkbox
          checked={selectedRows.includes(row?.id)}
          onChange={() => toggleRowSelection(row?.id)}
        />
      ),
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
      render: (row: Student) => row?.class?.name || "N/A",
    },
    {
      key: "section",
      header: "Section",
      render: (row: Student) => row?.section?.name || "N/A",
    },
    {
      key: "stream",
      header: "Stream",
      render: (row: Student) => row?.stream?.name || "N/A",
    },
    {
      key: "session",
      header: "Session Year",
      render: (row: Student) => row?.session?.name || "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Student) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewIdCard(row)}
            className="cursor-pointer"
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePrint(row)}
            className="cursor-pointer"
          >
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadPDF(row)}
            className="cursor-pointer"
          >
            PDF
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between py-4">
        <h2 className="text-xl font-semibold my-2">Student ID Cards</h2>
        <div>
          {selectedRows.length > 0 && (
            <div className="flex gap-2">
              <SubmitButton
                onClick={handlePrintAll}
              >
                Print ({selectedRows.length})
              </SubmitButton>
              <CancelButton
                onClick={handleDownloadAllPDFs}
              >
                PDF ({selectedRows.length})
              </CancelButton>
            </div>
          )}
          {/* {filteredStudents?.data && filteredStudents.data.length > 0 && (
            <>
              <Button
                variant={"outline"}
                className="ml-2"
                onClick={handleSelectAllClick}
              >
                {selectedRows.length === filteredStudents.data.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </>
          )} */}
        </div>
      </div>

      <Paper sx={{ p: 3, mb: 3 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormControl fullWidth size="small">
            <InputLabel>Session Year {theStar}</InputLabel>
            <Select
              name="sessionYear"
              value={tempFilters?.sessionYear}
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
              {(sessions as ApiResponse<Session>)?.data?.map((session) => (
                <MenuItem key={session.id} value={session?.name}>
                  {session?.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Class {theStar}</InputLabel>
            <Select
              name="className"
              value={tempFilters.className}
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
              {(classes as ApiResponse<ClassItem>)?.data?.map((classItem) => (
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
              value={tempFilters.section}
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
              {(sections as ApiResponse<Section>)?.data?.map((section) => (
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
              value={tempFilters.stream}
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
              {(streams as ApiResponse<Stream>)?.data?.map((stream) => (
                <MenuItem key={stream.id} value={stream.name}>
                  {stream.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="flex justify-end mt-4">
          <SubmitButton onClick={handleSearch}>
            Search
          </SubmitButton>
        </div>
      </Paper>

      {isLoading && <p className="p-4">Loading students...</p>}
      {/* {error && <p className="p-4 text-red-500">Failed to fetch students.</p>} */}

      <Paper sx={{ p: 2 }}>
        {filteredStudents?.data?.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No students found matching your filters.
          </Typography>
        ) : (
          <>
            {filteredStudents?.data && filteredStudents.data.length > 0 && (
              <div className="flex justify-between items-center mb-2">
                <Typography variant="body2">
                  Showing {filteredStudents.data.length} students
                </Typography>
                {selectedRows.length > 0 && (
                  <Typography variant="body2">
                    {selectedRows.length} selected
                  </Typography>
                )}
              </div>
            )}
            <ReusableTable<Student>
              columns={columns}
              data={filteredStudents?.data || []}
            />
          </>
        )}
      </Paper>


      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[300px] max-h-[80vh] overflow-y-auto mt-3">
          {selectedStudent && (
            <div className="flex justify-center pb-4">
              <div
                className="w-[400px] h-[510px] text-black rounded-lg shadow-2xl border-2 border-[#0a2c59] relative overflow-hidden flex items-center justify-center"
                style={{
                  backgroundImage: `url(${branchInfo?.idCardBackground})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Semi-transparent overlay */}
                <div className="absolute inset-0 bg-white/80"></div>
                {/* Main Card Content */}
                <div className="flex-1 rounded-md relative z-50">
                  {/* Top Header with Logo and ID */}
                  <div className="text-center py-2 px-2">
                    <h2 className="text-xs font-bold leading-tight mt-5">
                      {branchInfo?.schoolName}
                    </h2>
                  </div>
                  <div className="flex items-center justify-center gap-10">
                    <div>
                      <Image
                        src={branchInfo?.logo}
                        width={60}
                        height={76}
                        alt={"image"}
                        className="w-full h-full object-cover border"
                      />
                    </div>

                    <p className="text-xs font-semibold my-10">
                      ID: {selectedStudent.studentUniqueId}
                    </p>
                  </div>

                  {/* User Photo */}
                  <div className="flex justify-center">
                    <div className="w-20 h-24 border border-gray-300 overflow-hidden">
                      {selectedStudent.avatar ? (
                        <Image
                          src={selectedStudent.avatar}
                          width={80}
                          height={96}
                          alt={selectedStudent.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                          No Photo
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name Strip */}
                  <div className="text-white bg-[#0a2c59] py-1 text-center mt-2">
                    <p className="font-bold uppercase text-[14px]">
                      {selectedStudent.name}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="px-3 mt-2 text-sm leading-snug">
                    <p>
                      <span className="font-semibold">Father Name</span> :{" "}
                      {selectedStudent.fatherName || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Mother Name</span> :{" "}
                      {selectedStudent.motherName || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Class</span> :{" "}
                      {selectedStudent.class?.name || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Section</span> :{" "}
                      {selectedStudent.section?.name || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Roll</span> :{" "}
                      {selectedStudent.classRoll || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Mobile</span> :{" "}
                      {selectedStudent.phone || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Blood</span> :{" "}
                      {selectedStudent.bloodGroup || "N/A"}
                    </p>
                  </div>

                  <div className="flex justify-end mr-2">
                    <div className="flex flex-col items-center">
                      <Image
                        src={branchInfo?.principalSignature}
                        width={70}
                        height={60}
                        alt={'Principle Signature'}
                        className="w-full h-full object-cover"
                      />
                      
                      <div>Principal&apos;s Signature</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentIdCardList;