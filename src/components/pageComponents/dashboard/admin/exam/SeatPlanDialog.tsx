"use client";

import Image from "next/image";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useRef } from "react";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface ClassInfo {
  id: number;
  branchId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  id: number;
  studentUniqueId: string;
  name: string;
  class?: ClassInfo;
  section?: ClassInfo;
  classRoll?: number;
  avatar?: string;
  stream?: ClassInfo;
  session?: {
    id: number;
    branchId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface SeatPlanViewProps {
  selectedStudent: Student | null;
  onClose: () => void;
  branchInfo: {
    logo?: string;
    schoolName?: string;
    schoolAddress?: string;
  };
}

const SeatPlanView = ({ selectedStudent, onClose, branchInfo }: SeatPlanViewProps) => {
  const seatPlanRef = useRef(null);

  const handleDownloadSeatPlan = async () => {
    const inputData = seatPlanRef.current;
    try {
      if (!inputData) {
        console.error("Seat plan element not found");
        return;
      }

      const canvas = await html2canvas(inputData as HTMLElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit within A4 page with margins
      const margin = 10; // 10mm margin on each side
      const maxWidth = pdfWidth - (2 * margin);
      const maxHeight = pdfHeight - (2 * margin);
      
      let imgWidth = maxWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If image height is too large, scale down to fit height
      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = (canvas.width * imgHeight) / canvas.height;
      }
      
      // Center the image on the page
      const xPos = (pdfWidth - imgWidth) / 2;
      const yPos = (pdfHeight - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);
      pdf.save(`${selectedStudent?.name || 'Seat_Plan'}.pdf`);
    } catch (error) {
      console.log(error);
    }
  }

  const handlePrintSeatPlan = async () => {
    const inputData = seatPlanRef.current;
    if (!inputData) {
      console.error("Seat plan element not found");
      return;
    }

    try {
      const canvas = await html2canvas(inputData as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL("image/png");

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Seat Plan - ${selectedStudent?.name || 'Seat Plan'}</title>
              <style>
                @page {
                  size: A4 landscape;
                  margin: 10mm;
                }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  background-color: white;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .print-container {
                  max-width: 100%;
                  max-height: 100%;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                }
                img {
                  max-width: 100%;
                  max-height: 100%;
                  width: auto;
                  height: auto;
                  object-fit: contain;
                }
              </style>
            </head>
            <body>
              <div class="print-container">
                <img src="${imgData}" />
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    setTimeout(function() {
                      window.close();
                    }, 100);
                  }, 200);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      console.error("Error printing seat plan:", error);
    }
  };

  if (!selectedStudent) return null;

  return (
    <div className="">
      <div className="bg-white rounded-lg w-full max-h-[90vh] p-0 overflow-auto flex flex-col">

        <div className="w-full bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Back Button */}
            <CancelButton
              onClick={onClose}
            >
              <span className="font-medium">Back</span>
            </CancelButton>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <SubmitButton
                onClick={handlePrintSeatPlan}
              >
                <span className="font-medium">Print</span>
              </SubmitButton>

              <CancelButton
                onClick={handleDownloadSeatPlan}
              >
                <span className="font-medium">PDF</span>
              </CancelButton>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 flex justify-center items-start w-full">
          <div ref={seatPlanRef} className="p-4">
            <div
              id="seat-plan-container"
              className="border-4 border-green-600 bg-white shadow-lg mx-auto"
              style={{
                width: '800px', // Reduced fixed width
                maxWidth: '100%',
              }}
            >
              <div
                id="seat-plan"
                className="p-6" // Reduced padding
                style={{
                  width: '100%',
                }}
              >
                <div className="text-center">
                  <div className="flex justify-around items-center">
                    <Image
                      src={`${branchInfo?.logo || ""}`}
                      width={100} // Reduced size
                      height={100} // Reduced size
                      alt={selectedStudent.name}
                      className="w-24 h-24 object-cover" // Reduced size
                    />
                    <div>
                      <h1 className="text-2xl font-bold">{branchInfo?.schoolName}</h1> {/* Reduced font size */}
                      <p className="text-base">{branchInfo?.schoolAddress}</p> {/* Reduced font size */}
                      <div className="rounded-full mt-4"> {/* Reduced margin */}
                        <span className="text-2xl text-green-600 border-4 border-green-600 rounded-full px-3 py-1">Exam Seat Plan</span> {/* Reduced font size and padding */}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-around items-start mt-6"> {/* Reduced margin */}
                  <div className="flex-1 space-y-2 text-base"> {/* Reduced font size and spacing */}
                    <div className="flex">
                      <span className="font-semibold w-1/3">Name:</span>
                      <span className="flex-1">{selectedStudent.name}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-1/3">Student ID:</span>
                      <span className="flex-1">{selectedStudent.studentUniqueId}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-1/3">Class:</span>
                      <span className="flex-1">{selectedStudent.class?.name}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-1/3">Section:</span>
                      <span className="flex-1">{selectedStudent.section?.name}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-1/3">Group:</span>
                      <span className="flex-1">{selectedStudent.stream?.name}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-1/3">Session:</span>
                      <span className="flex-1">{selectedStudent.session?.name}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-28 h-28 border-2 border-gray-500 p-1 mb-0"> {/* Reduced size */}
                      {selectedStudent.avatar ? (
                        <Image
                          src={selectedStudent.avatar}
                          width={112}
                          height={112}
                          alt={selectedStudent.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm"> {/* Reduced font size */}
                          No Photo
                        </div>
                      )}
                    </div>

                    <div className="w-28 border-2 border-gray-500 py-1 text-center mt-1"> {/* Reduced size and margin */}
                      <p className="font-bold text-lg">Roll</p> {/* Reduced font size */}
                    </div>

                    <div className="w-28 border-2 border-gray-500 py-1 text-center mt-1"> {/* Reduced size and margin */}
                      <p className="font-bold text-lg">{selectedStudent.classRoll}</p> {/* Reduced font size */}
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

export default SeatPlanView;