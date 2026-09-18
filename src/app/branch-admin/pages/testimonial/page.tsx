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
import Image from "next/image";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";

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

interface Column<T> {
  key: keyof T | string;
  header: string | React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

const Testimonial = () => {
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
          <title>Testimonial - ${student.name}</title>
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
              input {
                border: 1px solid #ccc !important;
                background: white !important;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body class="p-4 bg-white">
          <div class="w-full max-w-[1200px] mx-auto my-4 text-black font-sans relative border-[10px] border-[#004d5c] p-6 shadow-lg">
            <div class="w-full text-black font-sans relative border-[6px] border-white p-4">
              <div class="border-4 border-[#004d5c] p-6">
                <div class="flex gap-32">
                  <div>
                    <div class="w-28 h-24">
                      <div class="w-full h-full bg-gray-200">
                      <img src=${branchInfo?.logo || ""}
                         style="width:112px;height:96px;bg:cover;" 
                         alt="${student.name}" />
                      </div>
                    </div>
                    <div class="text-sm">
                      <p><strong>ID:</strong> ${student.id || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div class="flex-1">
                    <div class="text-center">
                      <h2 class="text-xl font-bold uppercase">
                        ${branchInfo?.schoolName || "School Name"}
                      </h2>
                      <p class="text-sm">${branchInfo?.schoolAddress}</p>
                      <p class="text-sm">Email: ${
                        branchInfo?.schoolEmail || "info@scopus.edu.bd"
                      }</p>
                      <h1 class="text-xl font-semibold mt-2">Testimonial</h1>
                    </div>
                  </div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-sm">
                  <div>
                    <label class="block font-semibold">Name</label>
                    <input type="text" readonly value="${
                      student.name
                    }" class="w-full border px-2 py-1" />
                  </div>
                  <div>
                    <label class="block font-semibold">Father's Name</label>
                    <input type="text" readonly value="${
                      student.fatherName || ""
                    }" class="w-full border px-2 py-1" />
                  </div>
                  <div>
                    <label class="block font-semibold">Mother's Name</label>
                    <input type="text" readonly value="${
                      student.motherName || ""
                    }" class="w-full border px-2 py-1" />
                  </div>
                  <div>
                    <label class="block font-semibold">Registration</label>
                    <input type="text" readonly value="${
                      student.registrationNo || ""
                    }" class="w-full border px-2 py-1" />
                  </div>
                  <div>
                    <label class="block font-semibold">Roll</label>
                    <input type="text" readonly value="${
                      student.classRoll || ""
                    }" class="w-full border px-2 py-1" />
                  </div>
                  <div>
                    <label class="block font-semibold">Division</label>
                    <input type="text" readonly value="${
                      student.division || "select one"
                    }" class="w-full border px-2 py-1" />
                  </div>
                  <div>
                    <label class="block font-semibold">District</label>
                    <input type="text" readonly value="${
                      student.district || ""
                    }" class="w-full border px-2 py-1" />
                  </div>
                  <div>
                    <label class="block font-semibold">Upazila</label>
                    <input type="text" readonly value="${
                      student.upazila || ""
                    }" class="w-full border px-2 py-1" />
                  </div>
                  <div>
                    <label class="block font-semibold">Session</label>
                    <input type="text" readonly value="${
                      student.session?.name || ""
                    }" class="w-full border px-2 py-1" />
                  </div>
                  <div>
                    <label class="block font-semibold">Class</label>
                    <input type="text" readonly value="${
                      student.class?.name || ""
                    }" class="w-full border px-2 py-1" />
                  </div>
                  <div>
                    <label class="block font-semibold">Exam</label>
                    <input type="text" readonly value="${
                      student.examName || "Half Yearly"
                    }" class="w-full border px-2 py-1" />
                  </div>
                  <div>
                    <label class="block font-semibold">Board</label>
                    <input type="text" readonly value="${
                      student.board || ""
                    }" class="w-full border px-2 py-1" />
                  </div>
                  <div class="md:col-span-3">
                    <label class="block font-semibold">Result</label>
                    <input type="text" readonly value="${
                      student.result || ""
                    }" class="w-full border px-2 py-1" />
                  </div>
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
                <div class="signature">ACADEMIC PLANNER & ADVISOR</div>
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
          <title>Testimonials - Multiple Students</title>
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
              .certificate {
                page-break-after: always;
                margin-bottom: 20mm;
              }
              .certificate:last-child {
                page-break-after: auto;
              }
              input {
                border: 1px solid #ccc !important;
                background: white !important;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body class="p-4 bg-white">
          ${selectedStudents
            .map(
              (student: Student) => `
            <div class="certificate w-full max-w-[1200px] mx-auto my-4 text-black font-sans relative border-[10px] border-[#004d5c] p-6 shadow-lg">
            
              <div class="w-full text-black font-sans relative border-[6px] border-white p-4">
                <div class="border-4 border-[#004d5c] p-6">
                  
                  <div class="flex gap-32">
                    <div>
                      <div class="w-28 h-24">
                        <div class="w-full h-full bg-gray-200">
                        <img src=${branchInfo?.logo || ""}
                         style="width:112px;height:96px;bg:cover;" 
                         alt="${student.name}" />
                        </div>
                      </div>
                      <div class="text-sm">
                        <p><strong>ID:</strong> ${student.id || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div class="flex-1">
                      <div class="text-center">
                        <h2 class="text-xl font-bold uppercase">
                          ${branchInfo?.schoolName || "School Name"}
                        </h2>
                        <p class="text-sm">${branchInfo?.schoolAddress}</p>
                        <p class="text-sm">Email: ${
                          branchInfo?.schoolEmail || "info@scopus.edu.bd"
                        }</p>
                        <h1 class="text-xl font-semibold mt-2">Testimonial</h1>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-sm">
                    <div>
                      <label class="block font-semibold">Name</label>
                      <input type="text" readonly value="${
                        student.name
                      }" class="w-full border px-2 py-1" />
                    </div>
                    <div>
                      <label class="block font-semibold">Father's Name</label>
                      <input type="text" readonly value="${
                        student.fatherName || ""
                      }" class="w-full border px-2 py-1" />
                    </div>
                    <div>
                      <label class="block font-semibold">Mother's Name</label>
                      <input type="text" readonly value="${
                        student.motherName || ""
                      }" class="w-full border px-2 py-1" />
                    </div>
                    <div>
                      <label class="block font-semibold">Registration</label>
                      <input type="text" readonly value="${
                        student.registrationNo || ""
                      }" class="w-full border px-2 py-1" />
                    </div>
                    <div>
                      <label class="block font-semibold">Roll</label>
                      <input type="text" readonly value="${
                        student.classRoll || ""
                      }" class="w-full border px-2 py-1" />
                    </div>
                    <div>
                      <label class="block font-semibold">Division</label>
                      <input type="text" readonly value="${
                        student.division || "select one"
                      }" class="w-full border px-2 py-1" />
                    </div>
                    <div>
                      <label class="block font-semibold">District</label>
                      <input type="text" readonly value="${
                        student.district || ""
                      }" class="w-full border px-2 py-1" />
                    </div>
                    <div>
                      <label class="block font-semibold">Upazila</label>
                      <input type="text" readonly value="${
                        student.upazila || ""
                      }" class="w-full border px-2 py-1" />
                    </div>
                    <div>
                      <label class="block font-semibold">Session</label>
                      <input type="text" readonly value="${
                        student.session?.name || ""
                      }" class="w-full border px-2 py-1" />
                    </div>
                    <div>
                      <label class="block font-semibold">Class</label>
                      <input type="text" readonly value="${
                        student.class?.name || ""
                      }" class="w-full border px-2 py-1" />
                    </div>
                    <div>
                      <label class="block font-semibold">Exam</label>
                      <input type="text" readonly value="${
                        student.examName || "Half Yearly"
                      }" class="w-full border px-2 py-1" />
                    </div>
                    <div>
                      <label class="block font-semibold">Board</label>
                      <input type="text" readonly value="${
                        student.board || ""
                      }" class="w-full border px-2 py-1" />
                    </div>
                    <div class="md:col-span-3">
                      <label class="block font-semibold">Result</label>
                      <input type="text" readonly value="${
                        student.result || ""
                      }" class="w-full border px-2 py-1" />
                    </div>
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
                <div class="signature">ACADEMIC PLANNER & ADVISOR</div>
            </div>
                  </div>
                </div>
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
      const container = document.createElement("div");
      container.id = "pdf-container";
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "200mm";
      container.style.height = "287mm";
      container.style.padding = "10mm";
      container.style.backgroundColor = "transparent";
      container.style.border = "none";
      container.style.boxSizing = "border-box";
      container.style.overflow = "hidden";
      container.style.zIndex = "9999";
      container.style.visibility = "visible";

      container.innerHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Testimonial - ${student.name}</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-family: sans-serif;
              margin: 0;
              padding: 0;
            }
            .certificate-container {
              width: 100%;
              height: 100%;
              color: black;
              font-family: sans-serif;
              position: relative;
              border: 10px solid #004d5c;
              padding: 15px;
              margin: 0;
              box-sizing: border-box;
            }
            .inner-border {
              border: 6px solid white;
              padding: 15px;
              height: calc(100% - 30px);
            }
            .content-border {
              border: 4px solid #004d5c;
              padding: 15px;
              height: calc(100% - 30px);
            }
            .fake-input {
              border: 1px solid #ccc;
              background: white;
              padding: 2px 5px;
              min-height: 22px;
              line-height: 20px;
              box-sizing: border-box;
              width: 100%;
              white-space: pre-wrap;
              overflow-wrap: break-word;
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0;">
          <div class="certificate-container">
            <div class="inner-border">
              <div class="content-border">
                <div style="display: flex; gap: 8rem;">
                  <div>
                    <div style="width: 96px; height: 96px; background: #e5e7eb;">
                     <img src=${branchInfo?.logo || ""}
                         style="width:112px;height:96px;bg:cover;" 
                         alt="${student.name}" />
                    </div>
                    <div style="font-size: 0.875rem;">
                      <p><strong>ID:</strong> ${student.id || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div style="flex: 1; text-align: center;">
                    <h2 style="font-size: 1.25rem; font-weight: bold; text-transform: uppercase;">
                      ${branchInfo?.schoolName || "School Name"}
                    </h2>
                    <p style="font-size: 0.875rem;">${
                      branchInfo?.schoolAddress
                    }</p>
                    <p style="font-size: 0.875rem;">Email: ${
                      branchInfo?.schoolEmail || "info@scopus.edu.bd"
                    }</p>
                    <h1 style="font-size: 1.25rem; font-weight: 600; margin-top: 0.5rem;">Testimonial</h1>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.5rem; font-size: 0.875rem;">
                  <div>
                    <label style="font-weight: 600;">Name</label>
                    <div class="fake-input">${student.name}</div>
                  </div>
                  <div>
                    <label style="font-weight: 600;">Father's Name</label>
                    <div class="fake-input">${student.fatherName || ""}</div>
                  </div>
                  <div>
                    <label style="font-weight: 600;">Mother's Name</label>
                    <div class="fake-input">${student.motherName || ""}</div>
                  </div>
                  <div>
                    <label style="font-weight: 600;">Registration</label>
                    <div class="fake-input">${
                      student.registrationNo || ""
                    }</div>
                  </div>
                  <div>
                    <label style="font-weight: 600;">Roll</label>
                    <div class="fake-input">${student.classRoll || ""}</div>
                  </div>
                  <div>
                    <label style="font-weight: 600;">Division</label>
                    <div class="fake-input">${
                      student.division || "select one"
                    }</div>
                  </div>
                  <div>
                    <label style="font-weight: 600;">District</label>
                    <div class="fake-input">${student.district || ""}</div>
                  </div>
                  <div>
                    <label style="font-weight: 600;">Upazila</label>
                    <div class="fake-input">${student.upazila || ""}</div>
                  </div>
                  <div>
                    <label style="font-weight: 600;">Session</label>
                    <div class="fake-input">${student.session?.name || ""}</div>
                  </div>
                  <div>
                    <label style="font-weight: 600;">Class</label>
                    <div class="fake-input">${student.class?.name || ""}</div>
                  </div>
                  <div>
                    <label style="font-weight: 600;">Exam</label>
                    <div class="fake-input">${
                      student.examName || "Half Yearly"
                    }</div>
                  </div>
                  <div>
                    <label style="font-weight: 600;">Board</label>
                    <div class="fake-input">${student.board || ""}</div>
                  </div>
                  <div style="grid-column: span 3;">
                    <label style="font-weight: 600;">Result</label>
                    <div class="fake-input">${student.result || ""}</div>
                  </div>
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
                <div class="signature">ACADEMIC PLANNER & ADVISOR</div>
            </div>
              </div>
            </div>
          </div>
        </body>
      </html>
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

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      pdf.addImage(
        canvas.toDataURL("image/png", 1.0),
        "PNG",
        5,
        5,
        200,
        287,
        undefined,
        "FAST"
      );

      document.body.removeChild(container);
      pdf.save(`Testimonial_${student.studentUniqueId}.pdf`);
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
        const container = document.createElement("div");
        container.id = "pdf-container";
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.left = "0";
        container.style.width = "200mm";
        container.style.height = "287mm";
        container.style.padding = "10mm";
        container.style.backgroundColor = "transparent";
        container.style.border = "none";
        container.style.boxSizing = "border-box";
        container.style.overflow = "hidden";
        container.style.zIndex = "9999";
        container.style.visibility = "visible";

        container.innerHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Testimonial - ${student.name}</title>
            <style>
              @page {
                size: A4;
                margin: 10mm;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                font-family: sans-serif;
                margin: 0;
                padding: 0;
              }
              .certificate-container {
                width: 100%;
                height: 100%;
                color: black;
                font-family: sans-serif;
                position: relative;
                border: 10px solid #004d5c;
                padding: 15px;
                margin: 0;
                box-sizing: border-box;
              }
              .inner-border {
                border: 6px solid white;
                padding: 15px;
                height: calc(100% - 30px);
              }
              .content-border {
                border: 4px solid #004d5c;
                padding: 15px;
                height: calc(100% - 30px);
              }
              .fake-input {
                border: 1px solid #ccc;
                background: white;
                padding: 2px 5px;
                min-height: 22px;
                line-height: 20px;
                box-sizing: border-box;
                width: 100%;
                white-space: pre-wrap;
                overflow-wrap: break-word;
              }
            </style>
          </head>
          <body style="margin: 0; padding: 0;">
            <div class="certificate-container">
              <div class="inner-border">
                <div class="content-border">
                  <div style="display: flex; gap: 8rem;">
                    <div>
                      <div style="width: 96px; height: 96px; background: #e5e7eb;">
                       <img src=${branchInfo?.logo || ""}
                         style="width:112px;height:96px;bg:cover;" 
                         alt="${student.name}" />
                      </div>
                      <div style="font-size: 0.875rem;">
                        <p><strong>ID:</strong> ${student.id || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div style="flex: 1; text-align: center;">
                      <h2 style="font-size: 1.25rem; font-weight: bold; text-transform: uppercase;">
                        ${branchInfo?.schoolName || "School Name"}
                      </h2>
                      <p style="font-size: 0.875rem;">${
                        branchInfo?.schoolAddress
                      }</p>
                      <p style="font-size: 0.875rem;">Email: ${
                        branchInfo?.schoolEmail || "info@scopus.edu.bd"
                      }</p>
                      <h1 style="font-size: 1.25rem; font-weight: 600; margin-top: 0.5rem;">Testimonial</h1>
                    </div>
                  </div>

                  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.5rem; font-size: 0.875rem;">
                    <div>
                      <label style="font-weight: 600;">Name</label>
                      <div class="fake-input">${student.name}</div>
                    </div>
                    <div>
                      <label style="font-weight: 600;">Father's Name</label>
                      <div class="fake-input">${student.fatherName || ""}</div>
                    </div>
                    <div>
                      <label style="font-weight: 600;">Mother's Name</label>
                      <div class="fake-input">${student.motherName || ""}</div>
                    </div>
                    <div>
                      <label style="font-weight: 600;">Registration</label>
                      <div class="fake-input">${
                        student.registrationNo || ""
                      }</div>
                    </div>
                    <div>
                      <label style="font-weight: 600;">Roll</label>
                      <div class="fake-input">${student.classRoll || ""}</div>
                    </div>
                    <div>
                      <label style="font-weight: 600;">Division</label>
                      <div class="fake-input">${
                        student.division || "select one"
                      }</div>
                    </div>
                    <div>
                      <label style="font-weight: 600;">District</label>
                      <div class="fake-input">${student.district || ""}</div>
                    </div>
                    <div>
                      <label style="font-weight: 600;">Upazila</label>
                      <div class="fake-input">${student.upazila || ""}</div>
                    </div>
                    <div>
                      <label style="font-weight: 600;">Session</label>
                      <div class="fake-input">${
                        student.session?.name || ""
                      }</div>
                    </div>
                    <div>
                      <label style="font-weight: 600;">Class</label>
                      <div class="fake-input">${student.class?.name || ""}</div>
                    </div>
                    <div>
                      <label style="font-weight: 600;">Exam</label>
                      <div class="fake-input">${
                        student.examName || "Half Yearly"
                      }</div>
                    </div>
                    <div>
                      <label style="font-weight: 600;">Board</label>
                      <div class="fake-input">${student.board || ""}</div>
                    </div>
                    <div style="grid-column: span 3;">
                      <label style="font-weight: 600;">Result</label>
                      <div class="fake-input">${student.result || ""}</div>
                    </div>
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
                <div class="signature">ACADEMIC PLANNER & ADVISOR</div>
            </div>
                </div>
              </div>
            </div>
          </body>
        </html>
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

        if (pdf.getNumberOfPages() > 0 && student !== selectedStudents[0]) {
          pdf.addPage();
        }

        pdf.addImage(imgData, "PNG", 5, 5, 200, 287, undefined, "FAST");
      } catch (error) {
        console.error(
          `Error generating PDF for student ${student.studentUniqueId}:`,
          error
        );
      }
    }

    pdf.save(`Testimonials_${selectedStudents.length}_Students.pdf`);
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
        <h2 className="text-xl font-semibold my-2">Testimonial List</h2>
        <div>
          {/* <Button variant={"outline"}>Export All</Button> */}
          {selectedRows.length > 0 && (
            <>
              {/* <Button variant={"outline"} className="ml-2">
                Export Selected ({selectedRows.length})
              </Button> */}
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
                PDF Selected ({selectedRows.length})
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
        <DialogContent className="sm:max-w-[1200px] w-full max-h-[90vh] bg-white border-[10px] border-[#004d5c] p-6 shadow-lg overflow-y-auto mt-5">
          {selectedStudent && (
            <div className="w-full text-black font-sans relative border-[6px] border-white p-4">
              {/* Outer Border */}
              <div className="border-4 border-[#004d5c] p-6">
                {/* Logo */}
                <div className="flex justify-between">
                  <div>
                    <div className="w-24 h-24">
                      <Image
                        width={100}
                        height={100}
                        src={branchInfo?.logo}
                        alt="School Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* ID Info */}
                    <div className="text-sm ">
                      {/* <p><strong>Sl. No.</strong> {selectedStudent?.serialNo || "N/A"}</p> */}
                      <p>
                        <strong>ID:</strong> {selectedStudent?.id || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    {/* Title */}
                    <div className="text-center flex-1">
                      <h2 className="text-xl font-bold uppercase">
                        {branchInfo?.schoolName || "School Name"}
                      </h2>
                      <p className="text-sm">{branchInfo?.schoolAddress}</p>
                      <p className="text-sm">
                        Email: {branchInfo?.schoolEmail || "info@scopus.edu.bd"}
                      </p>
                      <h1 className="text-xl font-semibold mt-2">
                        Testimonial
                      </h1>
                    </div>
                  </div>
                </div>
                {/* Grid Fields Styled Like Inputs */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-sm">
                  <div>
                    <label className="block font-semibold">Name</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedStudent.name}
                      className="w-full border px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">Father’s Name</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedStudent.fatherName}
                      className="w-full border px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">Mother’s Name</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedStudent.motherName}
                      className="w-full border px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">Registration</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedStudent.registrationNo || ""}
                      className="w-full border px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">Roll</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedStudent.classRoll || ""}
                      className="w-full border px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">Division</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedStudent.division || "select one"}
                      className="w-full border px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">District</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedStudent.district || ""}
                      className="w-full border px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">Upazila</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedStudent.upazila || ""}
                      className="w-full border px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">Session</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedStudent.session?.name || ""}
                      className="w-full border px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">Class</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedStudent.class?.name || ""}
                      className="w-full border px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">Exam</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedStudent.examName || "Half Yearly"}
                      className="w-full border px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">Board</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedStudent.board || ""}
                      className="w-full border px-2 py-1"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block font-semibold">Result</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedStudent.result || ""}
                      className="w-full border px-2 py-1"
                    />
                  </div>
                </div>

                {/* Footer Signatures */}
                <div className="flex justify-between mt-10 text-center text-sm">
                  <div className="w-1/2">
                    <p className="border-t border-black mx-auto w-32 pt-1">
                      Office Assistant
                    </p>
                  </div>
                  <div className="w-1/2">
                    <p className="border-t border-black mx-auto w-48 pt-1">
                      ACADEMIC PLANNER & ADVISOR
                    </p>
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

export default Testimonial;
