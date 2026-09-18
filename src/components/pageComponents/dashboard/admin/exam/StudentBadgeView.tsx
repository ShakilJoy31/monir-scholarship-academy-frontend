"use client";

import Image from "next/image";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useRef } from "react";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface Student {
    id: number;
    studentUniqueId: string;
    name: string;
    fatherName?: string;
    motherName?: string;
    classRoll?: number;
    phone?: string;
    bloodGroup?: string;
    avatar?: string;
    class?: {
        name: string;
    };
    section?: {
        name: string;
    };
    stream?: {
        name: string;
    };
    session?: {
        name: string;
    };
}

interface SeatPlanViewProps {
    selectedStudent: Student | null;
    onClose: () => void;
    branchInfo: {
    logo?: string;
    schoolName?: string;
    schoolAddress?: string;
    eiinNumber: string;
  };
}

const StudnetBadgeView = ({ selectedStudent, onClose, branchInfo }: SeatPlanViewProps) => {
    const seatPlanRef = useRef(null);
    
    const handleDownloadBadge = async () => {
        const inputData = seatPlanRef.current;
        try {
            if (!inputData) {
                console.error("Badge element not found");
                return;
            }

            const canvas = await html2canvas(inputData as HTMLElement);
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.95;
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 5;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`${selectedStudent?.name || 'Student_Badge'}.pdf`);
        } catch (error) {
            console.log(error);
        }
    };

    const handlePrintBadge = async () => {
        const inputData = seatPlanRef.current;
        if (!inputData) {
            console.error("Badge element not found");
            return;
        }

        try {
            const canvas = await html2canvas(inputData as HTMLElement);
            const imgData = canvas.toDataURL("image/png");

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Student Badge - ${selectedStudent?.name}</title>
                            <style>
                                @page { 
                                    size: A4 landscape; 
                                    margin: 0;
                                }
                                body { 
                                    margin: 0; 
                                    padding: 0; 
                                    background: white !important;
                                }
                                img { 
                                    width: 100%; 
                                    height: auto;
                                    max-width: 100%;
                                }
                            </style>
                        </head>
                        <body>
                            <img src="${imgData}" />
                            <script>
                                setTimeout(() => {
                                    window.print();
                                    window.close();
                                }, 200);
                            </script>
                        </body>
                    </html>
                `);
                printWindow.document.close();
            } else {
                const printContent = document.createElement('div');
                printContent.innerHTML = `<img src="${imgData}" style="width:100%;height:auto;" />`;
                document.body.appendChild(printContent);
                window.print();
                document.body.removeChild(printContent);
            }
        } catch (error) {
            console.error("Error printing badge:", error);
        }
    };

    if (!selectedStudent) return null;

    return (
        <div className="">
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
                            onClick={handlePrintBadge}
                        >
                            <span className="font-medium">Print</span>
                        </SubmitButton>

                        <CancelButton
                            onClick={handleDownloadBadge}
                        >
                            <span className="font-medium">PDF</span>
                        </CancelButton>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg w-[90vw] h-[90vh] p-0 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto flex justify-center items-start">
                    <div ref={seatPlanRef} className="p-4">
                        <div
                            className="border-4 border-green-600 bg-white shadow-lg"
                            style={{
                                transform: 'scale(0.9)',
                                transformOrigin: 'top center'
                            }} id="badge-container"
                        >
                            <div
                                id="badge"
                                className="p-8"
                                style={{
                                    width: '100%',
                                    maxWidth: '900px',
                                }}
                            >
                                <div className="text-center">
                                    <div className="flex justify-center items-center">
                                        <div>
                                            <h1 className="text-3xl font-bold">{branchInfo?.schoolName}</h1>
                                            <p className="text-lg">EIIN : {branchInfo?.eiinNumber}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center mt-6">
                                    <Image
                                        src={branchInfo?.logo}
                                        width={128}
                                        height={128}
                                        alt={selectedStudent.name}
                                        className="w-32 h-32 object-cover border-2 border-gray-300"
                                    />

                                    <div className="ml-8">
                                        <div className="text-lg space-y-2">
                                            <div className="flex items-center">
                                                <span className="font-semibold w-28">Name</span>
                                                <span className="px-2">:</span>
                                                <span className="flex ml-12">{selectedStudent.name}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold w-28">Student ID</span>
                                                <span className="px-2">:</span>
                                                <span className="flex ml-12">{selectedStudent.studentUniqueId}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold w-28">Class</span>
                                                <span className="px-2">:</span>
                                                <span className="flex ml-12">{selectedStudent.class?.name || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold w-28">Section</span>
                                                <span className="px-2">:</span>
                                                <span className="flex ml-12">{selectedStudent.section?.name || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold w-28">Roll</span>
                                                <span className="px-2">:</span>
                                                <span className="flex ml-12">{selectedStudent.classRoll || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold w-28">Stream</span>
                                                <span className="px-2">:</span>
                                                <span className="flex ml-12">{selectedStudent.stream?.name || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold w-28">Session</span>
                                                <span className="px-2">:</span>
                                                <span className="flex ml-12">{selectedStudent.session?.name || 'N/A'}</span>
                                            </div>
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

export default StudnetBadgeView;