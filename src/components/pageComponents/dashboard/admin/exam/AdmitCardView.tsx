"use client";

import Image from "next/image";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useRef } from "react";
import { Student } from "@/components/shared/reusable-component/studentTypeInterface";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface Subject {
    sl: number;
    date: string;
    subjectCode: string;
    subjectName: string;
    time: string;
}

interface AdmitCardViewProps {
    selectedStudent: Student | null;
    subjects: Subject[];
    onClose: () => void;
    branchInfo: {
        logo?: string;
        schoolName?: string;
        schoolAddress?: string;
    };
}

const AdmitCardView = ({ selectedStudent, subjects, onClose, branchInfo }: AdmitCardViewProps) => {
    const admitCardRef = useRef(null);

    
    const handleDownloadAdmitCard = async () => {
        const inputData = admitCardRef.current;
        try {
            if (!inputData) {
                console.error("Admit card element not found");
                return;
            }

            const canvas = await html2canvas(inputData as HTMLElement);
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const aspectRatio = canvas.width / canvas.height;
            const targetHeight = pdfHeight;
            const targetWidth = targetHeight * aspectRatio;
            const xOffset = (pdfWidth - targetWidth) / 2;

            pdf.addImage(imgData, 'PNG', xOffset > 0 ? xOffset : 0, 0, targetWidth, targetHeight);
            pdf.save(`${selectedStudent?.name || 'Admit_Card'}.pdf`);
        } catch (error) {
            console.log(error)
        }
    }

    const handlePrintAdmitCard = async () => {
        const inputData = admitCardRef.current;
        if (!inputData) {
            console.error("Admit card element not found");
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
                            <title>Admit Card - ${selectedStudent?.name}</title>
                            <style>
                                @page { 
                                    size: A4 portrait; 
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
            console.error("Error printing admit card:", error);
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

                    {/* Action Buttons - Exactly like SeatPlanView */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">

                        <SubmitButton
                            onClick={handlePrintAdmitCard}
                        >
                            <span className="font-medium">Print</span>
                        </SubmitButton>

                        <CancelButton
                            onClick={handleDownloadAdmitCard}
                        >
                            <span className="font-medium">PDF</span>
                        </CancelButton>
                    </div>
                </div>
            </div>

            {/* Rest of your component remains the same */}
            <div className="bg-white rounded-lg w-[90vw] h-[90vh] p-0 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto flex justify-center items-start">
                    <div ref={admitCardRef} className="p-4">
                        <div
                            className="border-4 border-green-600 bg-white shadow-lg"
                            style={{
                                transform: 'scale(0.9)',
                                transformOrigin: 'top center'
                            }} id="admit-card-container"
                        >
                            <div
                                id="admit-card"
                                className="p-8"
                                style={{
                                    width: '100%',
                                    maxWidth: '900px',
                                }}
                            >
                                {/* Your admit card content remains the same */}
                                <div className="flex justify-center">
                                    <Image
                                        src={`${branchInfo?.logo || ""}`}
                                        width={128}
                                        height={128}
                                        alt={selectedStudent.name}
                                        className="w-32 h-32 object-cover"
                                    />
                                </div>
                                
                                <div className="flex flex-col items-center gap-1 mb-4">
                                    <h1 className="text-3xl font-bold">{branchInfo?.schoolName}</h1>
                                    <p className="text-lg">{branchInfo?.schoolAddress}</p>
                                    <h2 className="text-2xl font-bold mt-2">ADMIT CARD</h2>
                                    <p className="text-lg">Annual Examination</p>
                                </div>

                                <div className="flex justify-between items-start mt-8">
                                    <div className="space-y-3 text-lg">
                                        <p><span className="font-semibold">Name:</span> {selectedStudent.name}</p>
                                        <p><span className="font-semibold">Father&apos;s Name:</span> {selectedStudent.fatherName}</p>
                                        <p><span className="font-semibold">Mother&apos;s Name:</span> {selectedStudent.motherName}</p>
                                        <p><span className="font-semibold">Student ID:</span> {selectedStudent.studentUniqueId}</p>
                                        {/* <p><span className="font-semibold">Class:</span> {selectedStudent?.class?.name}</p> */}
                                        <p><span className="font-semibold">Class:</span>{typeof selectedStudent?.class === 'string' ? selectedStudent?.class : selectedStudent?.class?.name}</p>
                                        <p><span className="font-semibold">Section:</span>{typeof selectedStudent?.section === 'string' ? selectedStudent?.section : selectedStudent?.section?.name}</p>
                                         <p><span className="font-semibold">Group:</span>{typeof selectedStudent?.stream === 'string' ? selectedStudent?.stream : selectedStudent?.section?.name}</p>
                                         <p><span className="font-semibold">Session:</span>{typeof selectedStudent?.session  === 'string' ? selectedStudent?.session  : selectedStudent?.session ?.name}</p>

                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="w-32 h-32 border-2 border-gray-500 p-2 mb-0">
                                            {selectedStudent.avatar ? (
                                                <Image
                                                    src={selectedStudent.avatar}
                                                    width={128}
                                                    height={128}
                                                    alt={selectedStudent.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    No Photo
                                                </div>
                                            )}
                                        </div>

                                        <div className="w-32 border-2 border-gray-500 py-1 text-center mt-2">
                                            <p className="font-bold text-xl">Roll</p>
                                        </div>

                                        <div className="w-32 border-2 border-gray-500 py-2 text-center mt-2">
                                            <p className="font-bold text-xl">{selectedStudent.classRoll}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10">
                                    <h2 className="text-2xl font-semibold mb-4 text-center">Exam Schedule</h2>
                                    <table className="w-full border-collapse text-lg">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-300 p-2">SL</th>
                                                <th className="border border-gray-300 p-2">Date</th>
                                                <th className="border border-gray-300 p-2">Subject Code</th>
                                                <th className="border border-gray-300 p-2">Subject Name</th>
                                                <th className="border border-gray-300 p-2">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subjects.map((subject, index) => (
                                                <tr key={index} className={index % 2 === 0 ? '' : 'bg-gray-50'}>
                                                    <td className="border border-gray-300 p-2">{subject.sl}</td>
                                                    <td className="border border-gray-300 p-2">{subject.date}</td>
                                                    <td className="border border-gray-300 p-2">{subject.subjectCode}</td>
                                                    <td className="border border-gray-300 p-2">{subject.subjectName}</td>
                                                    <td className="border border-gray-300 p-2">{subject.time}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-10 flex justify-between px-4">
                                    <div className="text-center">
                                        <div className="border-t-2 border-black w-40 mx-auto"></div>
                                        <p className="text-lg">Invigilator&apos;s Signature</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="border-t-2 border-black w-40 mx-auto"></div>
                                        <p className="text-lg">Principal&apos;s Signature</p>
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

export default AdmitCardView;