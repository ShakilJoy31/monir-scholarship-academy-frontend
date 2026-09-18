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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import Image from "next/image";

interface Student extends Record<string, unknown> {
  id: number;
  branchId: number;
  type: string;
  migrateStudentId: number | null;
  sessionYearId: number;
  name: string;
  studentUniqueId: string;
  phone: string;
  email: string;
  password: string;
  classNameId: number;
  classRoll: number;
  sectionNameId: number;
  streamNameId: number;
  discountType: string;
  discount: number;
  studentClassFeeDiscountId: number | null;
  gender: string;
  religion: string;
  dob: string;
  bloodGroup: string;
  address: string;
  fatherName: string;
  motherName: string;
  parentPhone: string;
  count: number;
  blockDate: string | null;
  active: boolean;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  class: {
    id: number;
    branchId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  section: {
    id: number;
    branchId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  session: {
    id: number;
    branchId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  stream: {
    id: number;
    branchId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  examName?: string;
  result?: string;
  upazila?: string;
  registrationNo?: string;
  division?: string;
  board?: string;
  district?: string;
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

const TransferCertificate = () => {
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

  const { data: filteredStudents, isLoading } = useGetFilteredStudentsQuery({
    sessionYear: appliedFilters.sessionYear,
    section: appliedFilters.section,
    className: appliedFilters.className,
    stream: appliedFilters.stream,
  });

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

  const handleSelectAllClick = () => {
    if (filteredStudents?.data) {
      if (selectedRows.length === filteredStudents.data.length) {
        setSelectedRows([]);
      } else {
        const allIds = filteredStudents.data.map(
          (student: { id: number }) => student.id
        );
        setSelectedRows(allIds);
      }
    }
  };

  // Fetching branch name, email, address and logo.

  const userInfo = getUserInfoFromToken();
  const { data: branchConfigData } = useGetBranchConfigQuery(
    userInfo?.branchId
  );

  const branchInfo = branchConfigData?.data;

  const handlePrint = (student: Student) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Transfer Certificate - ${student.name}</title>
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
                font-family: serif;
              }
            }
          </style>
        </head>
        <body class="p-4">
          <div class="w-full text-black text-sm leading-relaxed font-serif relative border-4 border-[#a95c00] p-4 m-2">
            <!-- Certificate content goes here (same as your dialog content) -->
            <div class="flex justify-between items-center">
              <div>
                <span class="font-semibold">Student ID:</span> ${
                  student.id || "N/A"
                }
              </div>
              <div class="text-center mb-4">
                <h2 class="text-xl font-bold text-[#5b00a9] uppercase leading-snug">
                  ${branchInfo?.schoolName}
                </h2>
                <hr class="border-blue-500" />
                <p class="text-sm mt-1 text-end">
                  <span class="font-semibold">Address:</span> ${
                    branchInfo?.schoolAddress || "N/A"
                  }
                </p>
                <p class="text-sm mt-1 text-end">
                  <span class="font-semibold">Email:</span> ${
                    branchInfo?.schoolEmail
                  }
                </p>
              </div>
            </div>
            <h1 class="text-center text-2xl font-bold text-red-700 underline mb-4">
              TRANSFER CERTIFICATE
            </h1>
            <div class="text-sm leading-relaxed px-2">
              <p class="mb-4">
                This is to certify that ${
                  student.gender === "Male" ? "he" : "she"
                }: 
                <span class="font-bold underline"> ${student.name} </span>
                son/daughter of <span class="font-bold underline">${
                  student.fatherName || "N/A"
                }</span> and 
                <span class="font-bold underline"> ${
                  student.motherName || "N/A"
                }</span>, 
                Division: <span class="font-bold underline">${
                  student.division || "N/A"
                }</span>, 
                District: <span class="font-bold underline">${
                  student.district || "N/A"
                }</span>, 
                Police Station / Upazila: <span class="font-bold underline">${
                  student.upazila || "N/A"
                }</span>, 
                was a student of this institute.
              </p>
              <p class="mb-4">
                ${
                  student.gender === "Male" ? "He" : "She"
                } duly passed the examination under the 
                <span class="font-bold underline"> ${
                  student.board || "N/A"
                } </span> board, held in 
                <span class="font-bold underline"> ${
                  student.section.name || "N/A"
                } </span> from 
                <span class="font-bold underline"> ${
                  student.stream.name || "N/A"
                } </span> group, bearing roll no 
                <span class="font-bold underline"> ${
                  student.classRoll || "N/A"
                } </span> and registration no 
                <span class="font-bold underline"> ${
                  student.registrationNo || "N/A"
                } </span>. 
                In the session <span class="font-bold underline">${
                  student.session.name || "N/A"
                }</span>, 
                ${student.gender === "Male" ? "he" : "she"} achieved GPA: 
                <span class="font-bold underline"> ${
                  student.result || "N/A"
                }</span>.
              </p>
              <p class="mb-4">
                ${
                  student.gender === "Male" ? "He" : "She"
                } is a Bangladeshi by birth. To the best of my knowledge, 
                ${
                  student.gender === "Male" ? "he" : "she"
                } did not take part in any subversive activity 
                against the discipline of the state. ${
                  student.gender === "Male" ? "He" : "She"
                } has a good moral character. 
                I wish ${
                  student.gender === "Male" ? "him" : "her"
                } every success in life.
              </p>
            </div>
            <div class="flex justify-between mt-10 text-center text-sm">
                   <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${
                  branchInfo?.principalSignature
                }" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
                <div class="signature">Office Assistant</div>
            </div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${
                  branchInfo?.principalSignature
                }" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
                <div class="signature">Head Master</div>
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
    }
  };

  const handlePrintAll = () => {
    if (!selectedRows.length || !filteredStudents?.data) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const selectedStudents = filteredStudents.data.filter(
        (student: { id: number }) => selectedRows.includes(student.id)
      );

      printWindow.document.write(`
      <html>
        <head>
          <title>Transfer Certificates - Multiple Students</title>
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
                font-family: serif;
              }
              .certificate {
                page-break-after: always;
                margin-bottom: 20mm;
              }
              .certificate:last-child {
                page-break-after: auto;
              }
            }
          </style>
        </head>
        <body class="p-4">
          ${selectedStudents
            .map(
              (student: Student) => `
            <div class="certificate w-full text-black text-sm leading-relaxed font-serif relative border-4 border-[#a95c00] p-4 m-2">
              <div class="flex justify-between items-center">
                <div>
                  <span class="font-semibold">Student ID:</span> ${
                    student.id || "N/A"
                  }
                </div>
                <div class="text-center mb-4">
                  <h2 class="text-xl font-bold text-[#5b00a9] uppercase leading-snug">
                    ${branchInfo?.schoolName}
                  </h2>
                  <hr class="border-blue-500" />
                  <p class="text-sm mt-1 text-end">
                    <span class="font-semibold">Address:</span> ${
                      branchInfo?.schoolAddress || "N/A"
                    }
                  </p>
                  <p class="text-sm mt-1 text-end">
                    <span class="font-semibold">Email:</span> ${
                      branchInfo?.schoolEmail
                    }
                  </p>
                </div>
              </div>
              <h1 class="text-center text-2xl font-bold text-red-700 underline mb-4">
                TRANSFER CERTIFICATE
              </h1>
              <div class="text-sm leading-relaxed px-2">
                <p class="mb-4">
                  This is to certify that ${
                    student.gender === "Male" ? "he" : "she"
                  }: 
                  <span class="font-bold underline"> ${student.name} </span>
                  son/daughter of <span class="font-bold underline">${
                    student.fatherName || "N/A"
                  }</span> and 
                  <span class="font-bold underline"> ${
                    student.motherName || "N/A"
                  }</span>, 
                  Division: <span class="font-bold underline">${
                    student.division || "N/A"
                  }</span>, 
                  District: <span class="font-bold underline">${
                    student.district || "N/A"
                  }</span>, 
                  Police Station / Upazila: <span class="font-bold underline">${
                    student.upazila || "N/A"
                  }</span>, 
                  was a student of this institute.
                </p>
                <p class="mb-4">
                  ${
                    student.gender === "Male" ? "He" : "She"
                  } duly passed the examination under the 
                  <span class="font-bold underline"> ${
                    student.board || "N/A"
                  } </span> board, held in 
                  <span class="font-bold underline"> ${
                    student.section.name || "N/A"
                  } </span> from 
                  <span class="font-bold underline"> ${
                    student.stream.name || "N/A"
                  } </span> group, bearing roll no 
                  <span class="font-bold underline"> ${
                    student.classRoll || "N/A"
                  } </span> and registration no 
                  <span class="font-bold underline"> ${
                    student.registrationNo || "N/A"
                  } </span>. 
                  In the session <span class="font-bold underline">${
                    student.session.name || "N/A"
                  }</span>, 
                  ${student.gender === "Male" ? "he" : "she"} achieved GPA: 
                  <span class="font-bold underline"> ${
                    student.result || "N/A"
                  }</span>.
                </p>
                <p class="mb-4">
                  ${
                    student.gender === "Male" ? "He" : "She"
                  } is a Bangladeshi by birth. To the best of my knowledge, 
                  ${
                    student.gender === "Male" ? "he" : "she"
                  } did not take part in any subversive activity 
                  against the discipline of the state. ${
                    student.gender === "Male" ? "He" : "She"
                  } has a good moral character. 
                  I wish ${
                    student.gender === "Male" ? "him" : "her"
                  } every success in life.
                </p>
              </div>
              <div class="flex justify-between mt-10 text-center text-sm">
                   <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${
                  branchInfo?.principalSignature
                }" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
                <div class="signature">Office Assistant</div>
            </div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${
                  branchInfo?.principalSignature
                }" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
                <div class="signature">Head Master</div>
            </div>
          `
            )
            .join("")}
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
    }
  };

  const handleDownloadPDF = async (student: Student) => {
    try {
      // Create a container with slightly smaller dimensions to ensure borders are visible
      const container = document.createElement("div");
      container.id = "pdf-container";
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "200mm"; // Slightly smaller than A4 width
      container.style.height = "287mm"; // Slightly smaller than A4 height
      container.style.padding = "10mm"; // Add padding to ensure content fits
      container.style.backgroundColor = "transparent";
      container.style.border = "none";
      container.style.boxSizing = "border-box";
      container.style.overflow = "hidden";
      container.style.zIndex = "9999";
      container.style.visibility = "visible";

      // HTML structure matching the print version exactly
      container.innerHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transfer Certificate - ${student.name}</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-family: serif;
              margin: 0;
              padding: 0;
            }
            .certificate-container {
              width: 100%;
              height: 70%;
              color: black;
              font-family: serif;
              position: relative;
              border: 4px solid #a95c00;
              padding: 15px;
              margin: 0;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0;">
          <div class="certificate-container">
            <!-- Header -->
            <div class="flex justify-between items-center">
              <div>
                <span class="font-semibold">Student ID:</span> ${
                  student.id || "N/A"
                }
              </div>
              <div class="text-center mb-4">
                <h2 class="text-xl font-bold text-[#5b00a9] uppercase leading-snug">
                  ${branchInfo?.schoolName}
                </h2>
                <hr class="border-blue-500" />
                <p class="text-sm mt-1 text-end">
                  <span class="font-semibold">Address:</span> ${
                    branchInfo?.schoolAddress || "N/A"
                  }
                </p>
                <p class="text-sm mt-1 text-end">
                  <span class="font-semibold">Email:</span> ${
                    branchInfo?.schoolEmail
                  }
                </p>
              </div>
            </div>

            <!-- Title -->
            <h1 style="text-align: center; font-size: 24px; font-weight: 700; color: red; text-decoration: underline; margin-bottom: 20px;">
              TRANSFER CERTIFICATE
            </h1>

            <!-- Certificate Body -->
            <div style="font-size: 14px; line-height: 1.6; padding: 0 10px;">
              <p style="margin-bottom: 15px;">
                This is to certify that ${
                  student.gender === "Male" ? "he" : "she"
                }: 
                <span style="font-weight: 700; text-decoration: underline;"> ${
                  student.name
                } </span>
                son/daughter of <span style="font-weight: 700; text-decoration: underline;">${
                  student.fatherName || "N/A"
                }</span> and 
                <span style="font-weight: 700; text-decoration: underline;"> ${
                  student.motherName || "N/A"
                }</span>, 
                Division: <span style="font-weight: 700; text-decoration: underline;">${
                  student.division || "N/A"
                }</span>, 
                District: <span style="font-weight: 700; text-decoration: underline;">${
                  student.district || "N/A"
                }</span>, 
                Police Station / Upazila: <span style="font-weight: 700; text-decoration: underline;">${
                  student.upazila || "N/A"
                }</span>, 
                was a student of this institute.
              </p>

              <p style="margin-bottom: 15px;">
                ${
                  student.gender === "Male" ? "He" : "She"
                } duly passed the examination under the 
                <span style="font-weight: 700; text-decoration: underline;"> ${
                  student.board || "N/A"
                } </span> board, held in 
                <span style="font-weight: 700; text-decoration: underline;"> ${
                  student.section.name || "N/A"
                } </span> from 
                <span style="font-weight: 700; text-decoration: underline;"> ${
                  student.stream.name || "N/A"
                } </span> group, bearing roll no 
                <span style="font-weight: 700; text-decoration: underline;"> ${
                  student.classRoll || "N/A"
                } </span> and registration no 
                <span style="font-weight: 700; text-decoration: underline;"> ${
                  student.registrationNo || "N/A"
                } </span>. 
                In the session <span style="font-weight: 700; text-decoration: underline;">${
                  student.session.name || "N/A"
                }</span>, 
                ${student.gender === "Male" ? "he" : "she"} achieved GPA: 
                <span style="font-weight: 700; text-decoration: underline;"> ${
                  student.result || "N/A"
                }</span>.
              </p>

              <p style="margin-bottom: 15px;">
                ${
                  student.gender === "Male" ? "He" : "She"
                } is a Bangladeshi by birth. To the best of my knowledge, 
                ${
                  student.gender === "Male" ? "he" : "she"
                } did not take part in any subversive activity 
                against the discipline of the state. ${
                  student.gender === "Male" ? "He" : "She"
                } has a good moral character. 
                I wish ${
                  student.gender === "Male" ? "him" : "her"
                } every success in life.
              </p>
            </div>

            <!-- Signatures -->
             <div class="flex justify-between mt-10 text-center text-sm">
                   <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${
                  branchInfo?.principalSignature
                }" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
                <div class="signature">Office Assistant</div>
            </div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${
                  branchInfo?.principalSignature
                }" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
                <div class="signature">Head Master</div>
            </div>
        </body>
      </html>
    `;

      document.body.appendChild(container);

      // Ensure fonts are loaded
      await document.fonts.ready;

      // Generate canvas with proper settings
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

      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add image to PDF with slight offset to ensure borders are visible
      pdf.addImage(
        canvas.toDataURL("image/png", 1.0),
        "PNG",
        5, // X offset
        5, // Y offset
        200, // Width (slightly smaller than A4)
        287, // Height (slightly smaller than A4)
        undefined,
        "FAST"
      );

      // Clean up
      document.body.removeChild(container);

      // Save PDF
      pdf.save(`Transfer_Certificate_${student.studentUniqueId}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert(
        `Failed to generate PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleDownloadAllPDFs = async () => {
    if (!selectedRows.length || !filteredStudents?.data) return;

    const selectedStudents = filteredStudents.data.filter(
      (student: { id: number }) => selectedRows.includes(student.id)
    );

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    for (const student of selectedStudents) {
      try {
        // Create a container with slightly smaller dimensions to ensure borders are visible
        const container = document.createElement("div");
        container.id = "pdf-container";
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.left = "0";
        container.style.width = "200mm"; // Slightly smaller than A4 width
        container.style.height = "287mm"; // Slightly smaller than A4 height
        container.style.padding = "10mm"; // Add padding to ensure content fits
        container.style.backgroundColor = "transparent";
        container.style.border = "none";
        container.style.boxSizing = "border-box";
        container.style.overflow = "hidden";
        container.style.zIndex = "9999";
        container.style.visibility = "visible";

        // HTML structure matching the print version exactly
        container.innerHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Transfer Certificate - ${student.name}</title>
            <style>
              @page {
                size: A4;
                margin: 10mm;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                font-family: serif;
                margin: 0;
                padding: 0;
              }
              .certificate-container {
                width: 100%;
                height: 70%;
                color: black;
                font-family: serif;
                position: relative;
                border: 4px solid #a95c00;
                padding: 15px;
                margin: 0;
                box-sizing: border-box;
              }
            </style>
          </head>
          <body style="margin: 0; padding: 0;">
            <div class="certificate-container">
              <!-- Header -->
              <div class="flex justify-between items-center">
              <div>
                <span class="font-semibold">Student ID:</span> ${
                  student.id || "N/A"
                }
              </div>
              <div class="text-center mb-4">
                <h2 class="text-xl font-bold text-[#5b00a9] uppercase leading-snug">
                  ${branchInfo?.schoolName}
                </h2>
                <hr class="border-blue-500" />
                <p class="text-sm mt-1 text-end">
                  <span class="font-semibold">Address:</span> ${
                    branchInfo?.schoolAddress || "N/A"
                  }
                </p>
                <p class="text-sm mt-1 text-end">
                  <span class="font-semibold">Email:</span> ${
                    branchInfo?.schoolEmail
                  }
                </p>
              </div>
            </div>

              <!-- Title -->
              <h1 style="text-align: center; font-size: 24px; font-weight: 700; color: red; text-decoration: underline; margin-bottom: 20px;">
                TRANSFER CERTIFICATE
              </h1>

              <!-- Certificate Body -->
              <div style="font-size: 14px; line-height: 1.6; padding: 0 10px;">
                <p style="margin-bottom: 15px;">
                  This is to certify that ${
                    student.gender === "Male" ? "he" : "she"
                  }: 
                  <span style="font-weight: 700; text-decoration: underline;"> ${
                    student.name
                  } </span>
                  son/daughter of <span style="font-weight: 700; text-decoration: underline;">${
                    student.fatherName || "N/A"
                  }</span> and 
                  <span style="font-weight: 700; text-decoration: underline;"> ${
                    student.motherName || "N/A"
                  }</span>, 
                  Division: <span style="font-weight: 700; text-decoration: underline;">${
                    student.division || "N/A"
                  }</span>, 
                  District: <span style="font-weight: 700; text-decoration: underline;">${
                    student.district || "N/A"
                  }</span>, 
                  Police Station / Upazila: <span style="font-weight: 700; text-decoration: underline;">${
                    student.upazila || "N/A"
                  }</span>, 
                  was a student of this institute.
                </p>

                <p style="margin-bottom: 15px;">
                  ${
                    student.gender === "Male" ? "He" : "She"
                  } duly passed the examination under the 
                  <span style="font-weight: 700; text-decoration: underline;"> ${
                    student.board || "N/A"
                  } </span> board, held in 
                  <span style="font-weight: 700; text-decoration: underline;"> ${
                    student.section.name || "N/A"
                  } </span> from 
                  <span style="font-weight: 700; text-decoration: underline;"> ${
                    student.stream.name || "N/A"
                  } </span> group, bearing roll no 
                  <span style="font-weight: 700; text-decoration: underline;"> ${
                    student.classRoll || "N/A"
                  } </span> and registration no 
                  <span style="font-weight: 700; text-decoration: underline;"> ${
                    student.registrationNo || "N/A"
                  } </span>. 
                  In the session <span style="font-weight: 700; text-decoration: underline;">${
                    student.session.name || "N/A"
                  }</span>, 
                  ${student.gender === "Male" ? "he" : "she"} achieved GPA: 
                  <span style="font-weight: 700; text-decoration: underline;"> ${
                    student.result || "N/A"
                  }</span>.
                </p>

                <p style="margin-bottom: 15px;">
                  ${
                    student.gender === "Male" ? "He" : "She"
                  } is a Bangladeshi by birth. To the best of my knowledge, 
                  ${
                    student.gender === "Male" ? "he" : "she"
                  } did not take part in any subversive activity 
                  against the discipline of the state. ${
                    student.gender === "Male" ? "He" : "She"
                  } has a good moral character. 
                  I wish ${
                    student.gender === "Male" ? "him" : "her"
                  } every success in life.
                </p>
              </div>

              <!-- Signatures -->
              <div class="flex justify-between mt-10 text-center text-sm">
                   <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${
                  branchInfo?.principalSignature
                }" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
                <div class="signature">Office Assistant</div>
            </div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${
                  branchInfo?.principalSignature
                }" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
                <div class="signature">Head Master</div>
            </div>
            </div>
          </body>
        </html>
      `;

        document.body.appendChild(container);

        // Ensure fonts are loaded
        await document.fonts.ready;

        // Generate canvas with proper settings
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

        // Clean up
        document.body.removeChild(container);

        const imgData = canvas.toDataURL("image/png");

        // Add a new page for each student after the first one
        if (pdf.getNumberOfPages() > 0 && student !== selectedStudents[0]) {
          pdf.addPage();
        }

        // Add image to PDF with slight offset to ensure borders are visible
        pdf.addImage(
          imgData,
          "PNG",
          5, // X offset
          5, // Y offset
          200, // Width (slightly smaller than A4)
          287, // Height (slightly smaller than A4)
          undefined,
          "FAST"
        );
      } catch (error) {
        console.error(
          `Error generating PDF for student ${student.studentUniqueId}:`,
          error
        );
      }
    }

    pdf.save(`Transfer_Certificates_${selectedStudents.length}_Students.pdf`);
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
          checked={selectedRows.includes(row.id)}
          onChange={() => toggleRowSelection(row.id)}
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
      key: "sessionYear",
      header: "Session Year",
      render: (row: Student) => row.session?.name || "N/A",
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
        <h2 className="text-xl font-semibold my-2">
          Transfer Certificate List
        </h2>
        <div>
          {selectedRows.length > 0 && (
            <>
              <Button
                variant={"outline"}
                className="ml-2"
                onClick={handlePrintAll}
              >
                Print Selected ({selectedRows.length})
              </Button>
              <Button
                variant={"outline"}
                className="ml-2"
                onClick={handleDownloadAllPDFs}
              >
                Download PDF ({selectedRows.length})
              </Button>
            </>
          )}
          {filteredStudents?.data && filteredStudents.data.length > 0 && (
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
          )}
        </div>
      </div>

      <Paper sx={{ p: 3, mb: 3 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormControl fullWidth size="small">
            <InputLabel>Session Year {theStar}</InputLabel>
            <Select
              name="sessionYear"
              value={tempFilters.sessionYear}
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
          <SubmitButton onClick={handleSearch}>Search</SubmitButton>
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
        <DialogContent className="sm:max-w-[1000px] w-full max-h-[80vh] bg-white border-[10px] border-yellow-600 p-6 overflow-y-auto">
          {selectedStudent && (
            <div className="w-full text-black text-[14px] leading-relaxed font-serif relative border-4 border-[#a95c00] p-4 m-2">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-lg">Student ID:</span>{" "}
                  <span className="font-bold text-lg">
                    {selectedStudent?.id || "N/A"}
                  </span>
                </div>
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-[#5b00a9] uppercase leading-snug">
                    {branchInfo?.schoolName}
                  </h2>
                  <hr className="border-blue-500" />
                  <p className="text-sm mt-1 text-end">
                    <span className="font-semibold">Address:</span>{" "}
                    {branchInfo?.schoolAddress || "N/A"}
                  </p>
                  <p className="text-sm mt-1 text-end">
                    <span className="font-semibold">Email:</span>{" "}
                    {branchInfo?.schoolEmail}
                  </p>
                </div>
              </div>

              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    selectedStudent && handlePrint(selectedStudent)
                  }
                >
                  Print Certificate
                </Button>
              </div>
              {/* Title */}
              <h1 className="text-center text-2xl font-bold text-red-700 underline mb-4">
                TRANSFER CERTIFICATE
              </h1>

              {/* Certificate Body */}
              <div className="text-sm leading-relaxed px-2">
                <p className="mb-4">
                  This is to certify that{" "}
                  {selectedStudent.gender === "Male" ? "he" : "she"}:
                  <span className="font-bold underline">
                    {" "}
                    {selectedStudent.name}{" "}
                  </span>
                  son/daughter of{" "}
                  <span className="font-bold underline">
                    {selectedStudent.fatherName}
                  </span>{" "}
                  and
                  <span className="font-bold underline">
                    {" "}
                    {selectedStudent.motherName}
                  </span>
                  , Division:{" "}
                  <span className="font-bold underline">
                    {selectedStudent.division || "N/A"}
                  </span>
                  , District:{" "}
                  <span className="font-bold underline">
                    {selectedStudent.district || "N/A"}
                  </span>
                  , Police Station / Upazila:{" "}
                  <span className="font-bold underline">
                    {selectedStudent.upazila || "N/A"}
                  </span>
                  , was a student of this institute.
                </p>

                <p className="mb-4">
                  {selectedStudent.gender === "Male" ? "He" : "She"} duly passed
                  the examination under the
                  <span className="font-bold underline">
                    {" "}
                    {selectedStudent.board || "N/A"}{" "}
                  </span>{" "}
                  board, held in
                  <span className="font-bold underline">
                    {" "}
                    {selectedStudent.section?.name || "N/A"}{" "}
                  </span>{" "}
                  from
                  <span className="font-bold underline">
                    {" "}
                    {selectedStudent.stream?.name || "N/A"}{" "}
                  </span>{" "}
                  group, bearing roll no
                  <span className="font-bold underline">
                    {" "}
                    {selectedStudent.classRoll || "N/A"}{" "}
                  </span>{" "}
                  and registration no
                  <span className="font-bold underline">
                    {" "}
                    {selectedStudent.registrationNo || "N/A"}{" "}
                  </span>
                  . In the session{" "}
                  <span className="font-bold underline">
                    {selectedStudent.session?.name || "N/A"}
                  </span>
                  ,{selectedStudent.gender === "Male" ? "he" : "she"} achieved
                  GPA:
                  <span className="font-bold underline">
                    {" "}
                    {selectedStudent.result || "N/A"}
                  </span>
                  .
                </p>

                <p className="mb-4">
                  {selectedStudent.gender === "Male" ? "He" : "She"} is a
                  Bangladeshi by birth. To the best of my knowledge,
                  {selectedStudent.gender === "Male" ? "he" : "she"} did not
                  take part in any subversive activity against the discipline of
                  the state. {selectedStudent.gender === "Male" ? "He" : "She"}{" "}
                  has a good moral character. I wish{" "}
                  {selectedStudent.gender === "Male" ? "him" : "her"} every
                  success in life.
                </p>
              </div>

              {/* Signatures */}
              <div className="flex justify-between mt-8 text-center text-sm">
                <div className="text-center text-xs">
                  <Image
                    src={branchInfo?.principalSignature}
                    width="70"
                    height="60"
                    alt="Principal Signature"
                    style={{ objectFit: "cover", marginLeft: "10px", marginBottom: "10px" }}
                  />
                  <div className="border-t border-black pt-1 w-24">
                    Office Assistant
                  </div>
                </div>

                <div className="text-center text-xs">
                  <Image
                    src={branchInfo?.principalSignature}
                    width="70"
                    height="60"
                    alt="Principal Signature"
                    style={{ objectFit: "cover", marginLeft: "10px", marginBottom: "10px" }}
                  />
                  <div className="border-t border-black pt-1 w-24">
                    Head Master
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

export default TransferCertificate;
