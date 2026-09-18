"use client";

import Image from "next/image";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useRef } from "react";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface Teacher {
  id: number;
  teacherUniqueId: string;
  name: string;
  phone?: string;
  email?: string;
  designation?: string;
  gender?: string;
  religion?: string;
  bloodGroup?: string;
  address?: string;
  avatar?: string;
  nid?: string;
  qualification?: string;
  specialistSubject?: string;
  universityName?: string;
  universityStartDate?: string;
  universityEndDate?: string;
  dob?: string;
}

interface TeacherCardViewProps {
  selectedTeacher: Teacher | null;
  onClose: () => void;
  branchInfo: {
    logo?: string;
    schoolName?: string;
    schoolAddress?: string;
    eiinNumber: string;
    idCardBackground: string;
    principalSignature: string;
  };
}

const TeacherCardView = ({
  selectedTeacher,
  onClose,
  branchInfo,
}: TeacherCardViewProps) => {
  const idCardRef = useRef(null);

  const handleDownloadIDCard = async () => {
    if (!selectedTeacher) return;

    try {
      // Create a temporary div with the same structure as your print version
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = `
            <div class="flex justify-center pb-4">
                <div
                    class="w-[350px] h-[500px] text-black rounded-lg shadow-2xl border-2 border-[#0a2c59] relative overflow-hidden flex items-center justify-center"
                    style="
                        background-image: url('${
                          branchInfo?.idCardBackground
                        }');
                        background-size: contain;
                        background-position: center;
                        background-repeat: no-repeat;
                    "
                >
                    <!-- Semi-transparent overlay -->
                    <div class="absolute inset-0 bg-white/80"></div>
                    <!-- Main Card Content -->
                    <div class="flex-1 rounded-md relative z-50">
                        <div class="text-center py-2 px-2">
                            <h2 class="text-xs font-bold leading-tight mt-5">
                                ${branchInfo.schoolName}
                            </h2>
                        </div>

                        <div class="flex justify-center mb-2">
                            <div class="w-36 h-36 overflow-hidden">
                                ${
                                  selectedTeacher.avatar
                                    ? `<img src="${selectedTeacher.avatar}" width="144" height="144" alt="${selectedTeacher.name}" class="w-full h-full object-cover rounded-full p-1 border border-gray-300" />`
                                    : `<div class="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                                            No Photo
                                        </div>`
                                }
                            </div>
                        </div>

                        <div class="text-white bg-[#0a2c59] py-1 text-center">
                            <p class="font-bold uppercase text-[14px]">
                                ${selectedTeacher.name}
                            </p>
                        </div>

                        <div class="space-y-2 px-2 mt-6">
                            <div class="flex items-center">
                                <span class="font-semibold w-28">Designation</span>
                                <span class="px-2">:</span>
                                <span class="flex-1">${
                                  selectedTeacher.designation || "N/A"
                                }</span>
                            </div>
                            <div class="flex items-center">
                                <span class="font-semibold w-28">Phone</span>
                                <span class="px-2">:</span>
                                <span class="flex-1">${
                                  selectedTeacher.phone || "N/A"
                                }</span>
                            </div>
                            <div class="flex items-center">
                                <span class="font-semibold w-28">Email</span>
                                <span class="px-2">:</span>
                                <span class="flex-1">
                                    ${
                                      selectedTeacher.email
                                        ? selectedTeacher.email.length > 15
                                          ? `${selectedTeacher.email.substring(
                                              0,
                                              15
                                            )}...`
                                          : selectedTeacher.email
                                        : "N/A"
                                    }
                                </span>
                            </div>
                            <div class="flex items-center">
                                <span class="font-semibold w-28">Blood Group</span>
                                <span class="px-2">:</span>
                                <span class="flex-1">${
                                  selectedTeacher.bloodGroup || "N/A"
                                }</span>
                            </div>
                            <div class="flex items-center">
                                <span class="font-semibold w-28">Address</span>
                                <span class="px-2">:</span>
                                <span class="flex-1">
                                    ${
                                      selectedTeacher.address
                                        ? selectedTeacher.address.length > 15
                                          ? `${selectedTeacher.address.substring(
                                              0,
                                              15
                                            )}...`
                                          : selectedTeacher.address
                                        : "N/A"
                                    }
                                </span>
                            </div>
                        </div>

                       <div style="display: flex; justify-content: flex-end;">
            <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${
                  branchInfo?.principalSignature
                }" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
                <div class="signature">Principal's Signature</div>
            </div>
                    </div>
                </div>
            </div>
        `;

      // Append to body to render it
      document.body.appendChild(tempDiv);

      // Use html2canvas with proper settings
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        logging: false,
        useCORS: true, // This is important for external images
        allowTaint: true,
        backgroundColor: null,
        onclone: (clonedDoc) => {
          // Ensure styles are applied
          const style = clonedDoc.createElement("style");
          style.innerHTML = `
                    body { margin: 0; padding: 0; }
                    .w-\\[350px\\] { width: 350px; }
                    .h-\\[500px\\] { height: 500px; }
                `;
          clonedDoc.head.appendChild(style);
        },
      });

      // Remove the temporary div
      document.body.removeChild(tempDiv);

      // Convert canvas to image
      const imageData = canvas.toDataURL("image/png");

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
      });

      // Calculate dimensions to fit the PDF page
      const imgWidth = 85; // width in mm (ID card width)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add image to PDF
      pdf.addImage(
        imageData,
        "PNG",
        (210 - imgWidth) / 2,
        (297 - imgHeight) / 2,
        imgWidth,
        imgHeight
      );

      // Save the PDF
      pdf.save(`${selectedTeacher.name}_ID_Card.pdf`);
    } catch (error) {
      console.error("Error generating ID card:", error);
      // Handle error (show toast/message to user)
    }
  };

  const handlePrintIDCard = () => {
    if (!selectedTeacher) return;

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
                                class="w-[350px] h-[500px] text-black rounded-lg shadow-2xl border-2 border-[#0a2c59] relative overflow-hidden flex items-center justify-center"
                                style="
                                    background-image: url('${
                                      branchInfo?.idCardBackground
                                    }');;
                                    background-size: contain;
                                    background-position: center;
                                    background-repeat: no-repeat;
                                "
                            >
                                <!-- Semi-transparent overlay -->
                                <div class="absolute inset-0 bg-white/80"></div>
                                <!-- Main Card Content -->
                                <div class="flex-1 rounded-md relative z-50">
                                    <div class="text-center py-2 px-2">
                                        <h2 class="text-xs font-bold leading-tight mt-5">
                                            ${branchInfo?.schoolName}
                                        </h2>
                                    </div>

                                    <div class="flex justify-center mb-2">
                                        <div class="w-36 h-36 overflow-hidden">
                                            ${
                                              selectedTeacher.avatar
                                                ? `<img src="${selectedTeacher.avatar}" width="144" height="144" alt="${selectedTeacher.name}" class="w-full h-full object-cover rounded-full p-1 border border-gray-300" />`
                                                : `<div class="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                                                        No Photo
                                                    </div>`
                                            }
                                        </div>
                                    </div>

                                    <div class="text-white bg-[#0a2c59] py-1 text-center">
                                        <p class="font-bold uppercase text-[14px]">
                                            ${selectedTeacher.name}
                                        </p>
                                    </div>

                                    <div class="space-y-2 px-2 mt-6">
                                        <div class="flex items-center">
                                            <span class="font-semibold w-28">Designation</span>
                                            <span class="px-2">:</span>
                                            <span class="flex-1">${
                                              selectedTeacher.designation ||
                                              "N/A"
                                            }</span>
                                        </div>
                                        <div class="flex items-center">
                                            <span class="font-semibold w-28">Phone</span>
                                            <span class="px-2">:</span>
                                            <span class="flex-1">${
                                              selectedTeacher.phone || "N/A"
                                            }</span>
                                        </div>
                                        <div class="flex items-center">
                                            <span class="font-semibold w-28">Email</span>
                                            <span class="px-2">:</span>
                                            <span class="flex-1">
                                                ${
                                                  selectedTeacher.email
                                                    ? selectedTeacher.email
                                                        .length > 15
                                                      ? `${selectedTeacher.email.substring(
                                                          0,
                                                          15
                                                        )}...`
                                                      : selectedTeacher.email
                                                    : "N/A"
                                                }
                                            </span>
                                        </div>
                                        <div class="flex items-center">
                                            <span class="font-semibold w-28">Blood Group</span>
                                            <span class="px-2">:</span>
                                            <span class="flex-1">${
                                              selectedTeacher.bloodGroup ||
                                              "N/A"
                                            }</span>
                                        </div>
                                        <div class="flex items-center">
                                            <span class="font-semibold w-28">Address</span>
                                            <span class="px-2">:</span>
                                            <span class="flex-1">
                                                ${
                                                  selectedTeacher.address
                                                    ? selectedTeacher.address
                                                        .length > 15
                                                      ? `${selectedTeacher.address.substring(
                                                          0,
                                                          15
                                                        )}...`
                                                      : selectedTeacher.address
                                                    : "N/A"
                                                }
                                            </span>
                                        </div>
                                    </div>

                                   <div style="display: flex; justify-content: flex-end;">
            <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${
                  branchInfo?.principalSignature
                }" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
                <div class="signature">Principal's Signature</div>
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

      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.print();
          printWindow.close();
        }
      }, 500);
    }
  };

  if (!selectedTeacher) return null;

  return (
    <div className="">
      <div className="w-full bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <CancelButton onClick={onClose}>
            <span className="font-medium">Back</span>
          </CancelButton>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <SubmitButton onClick={handlePrintIDCard}>
              <span className="font-medium">Print</span>
            </SubmitButton>

            <CancelButton onClick={handleDownloadIDCard}>
              <span className="font-medium">PDF</span>
            </CancelButton>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg w-[90vw] h-[90vh] p-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto flex justify-center items-center">
          <div ref={idCardRef} className="p-4">
            <div
              className="w-[350px] h-[500px] text-black rounded-lg shadow-2xl border-2 border-[#0a2c59] relative overflow-hidden flex items-center justify-center"
              style={{
                backgroundImage: `url(${branchInfo?.idCardBackground})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="absolute inset-0 bg-white/80"></div>
              <div className="flex-1 rounded-md relative z-50">
                <div className="text-center py-2 px-2">
                  <h2 className="text-xs font-bold leading-tight mt-5">
                    {branchInfo?.schoolName}
                  </h2>
                </div>

                <div className="flex justify-center mb-2">
                  <div className="w-36 h-36 overflow-hidden">
                    {selectedTeacher.avatar ? (
                      <Image
                        src={selectedTeacher.avatar}
                        width={144}
                        height={144}
                        alt={selectedTeacher.name}
                        className="w-full h-full object-cover rounded-full p-1 border border-gray-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                        No Photo
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-white bg-[#0a2c59] py-1 text-center">
                  <p className="font-bold uppercase text-[14px]">
                    {selectedTeacher.name}
                  </p>
                </div>

                <div className="space-y-2 px-2 mt-6">
                  <div className="flex items-center">
                    <span className="font-semibold w-28">Designation</span>
                    <span className="px-2">:</span>
                    <span className="flex-1">
                      {selectedTeacher.designation || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold w-28">Phone</span>
                    <span className="px-2">:</span>
                    <span className="flex-1">
                      {selectedTeacher.phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold w-28">Email</span>
                    <span className="px-2">:</span>
                    <span className="flex-1">
                      {selectedTeacher.email
                        ? selectedTeacher.email.length > 15
                          ? `${selectedTeacher.email.substring(0, 15)}...`
                          : selectedTeacher.email
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold w-28">Blood Group</span>
                    <span className="px-2">:</span>
                    <span className="flex-1">
                      {selectedTeacher.bloodGroup || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold w-28">Address</span>
                    <span className="px-2">:</span>
                    <span className="flex-1">
                      {selectedTeacher.address
                        ? selectedTeacher.address.length > 15
                          ? `${selectedTeacher.address.substring(0, 15)}...`
                          : selectedTeacher.address
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-end justify-end px-3 py-2 mt-4">
                  <div className="text-center text-xs">
                    <Image
                      src={branchInfo?.principalSignature}
                      width="70"
                      height="60"
                      alt="Principal Signature"
                      style={{ objectFit: "cover", marginBottom: "10px" }}
                    />
                    <div className="border-t border-black pt-1 w-24">
                      Principal
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCardView;
