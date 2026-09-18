"use client";
import { Button } from "@/components/ui/button";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { useEffect, useState } from "react";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { Paper, Typography } from "@mui/material";
import { useGetAllDesignationsQuery } from "@/app/store/api/classes/designationApi";
import { FaEye } from "react-icons/fa";
import { useGetAllTeachersQuery } from "@/app/store/api/teacher/teacherApi";
import TeacherCardView from "@/components/pageComponents/dashboard/admin/exam/TeacherIdCard";
import JSZip from 'jszip';
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";

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
    selected?: boolean;
    [key: string]: unknown;
}

const Loader = () => (
    <div className="w-full flex justify-center my-4"><div className="loader_global_template_2"></div></div>
);

const TeacherIdCard = () => {
    const { data: designationsResponse, isLoading: designationsLoading } =
        useGetAllDesignationsQuery({});

    const [isPdfProcessing, setIsPdfProcessing] = useState(false);
    const [isPrintProcessing, setIsPrintProcessing] = useState(false);

    const {
        data: teachersResponse,
        isLoading: teachersLoading,
    } = useGetAllTeachersQuery({
        page: 1,
        size: 10000,
    });

      // Fetching branch name, email, address and logo. 
    
      const userInfo = getUserInfoFromToken();
  const { data: branchConfigData } = useGetBranchConfigQuery(userInfo?.branchId)

      const branchInfo = branchConfigData?.data;

    const [filters, setFilters] = useState({
        designation: "",
    });
    const [searchParams, setSearchParams] = useState({
        designation: "",
    });
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);

    const handleFilterChange = (e: {
        target: { name: string; value: string };
    }) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };



    const handleViewCard = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setIsCardModalOpen(true);
    };

    const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);

    // Replace your current filteredTeachers declaration with:
    useEffect(() => {
        if (teachersResponse?.data) {
            const filtered = teachersResponse.data.filter((teacher: Teacher) =>
                searchParams.designation === "" ||
                teacher.designation === searchParams.designation
            ).map((teacher: Teacher) => ({ ...teacher, selected: false }));
            setFilteredTeachers(filtered);
        }
    }, [teachersResponse, searchParams]);

    interface Column<T> {
        key: keyof T | string;
        header: string | React.ReactNode;
        render?: (row: T, index?: number) => React.ReactNode;
        className?: string;
    }

    const columns: Column<Teacher>[] = [

        {
            key: "checkbox",
            header: (
                <input
                    type="checkbox"
                    onChange={(e) => {
                        const isChecked = e.target.checked;
                        setFilteredTeachers(prev =>
                            prev.map(teacher => ({
                                ...teacher,
                                selected: isChecked
                            }))
                        );
                    }}
                    checked={filteredTeachers.length > 0 &&
                        filteredTeachers.every(teacher => teacher.selected)}
                />
            ),
            render: (row: Teacher) => (
                <input
                    type="checkbox"
                    checked={row.selected || false}
                    onChange={(e) => {
                        const isChecked = e.target.checked;
                        setFilteredTeachers(prev =>
                            prev.map(teacher =>
                                teacher.id === row.id
                                    ? { ...teacher, selected: isChecked }
                                    : teacher
                            )
                        );
                    }}
                />
            ),
        },
        {
            key: "sl",
            header: "SL",
            render: (row: Teacher, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: "teacherUniqueId",
            header: "Teacher ID",
        },
        {
            key: "name",
            header: "Name",
        },
        {
            key: "designation",
            header: "Designation",
        },
        {
            key: "phone",
            header: "Phone",
        },
        {
            key: "email",
            header: "Email",
        },
        {
            key: "actions",
            header: "Actions",
            render: (row: Teacher) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCard(row)}
                        className="p-2 text-white hover:text-white bg-[#035140] transition-opacity hover:cursor-pointer duration-100 active:opacity-75 hover:bg-[#035140]/90"
                    >
                        <FaEye className="mr-1" />
                        View ID Card
                    </Button>
                </div>
            ),
        },
    ];

    if (isCardModalOpen && selectedTeacher) {
        return <TeacherCardView
            selectedTeacher={selectedTeacher}
            onClose={() => setIsCardModalOpen(false)}
            branchInfo={branchInfo}
        />
    }

    const getTeachersToProcess = () => {
        const selectedTeachers = filteredTeachers.filter(teacher => teacher.selected);
        return selectedTeachers.length > 0 ? selectedTeachers : filteredTeachers;
    };

    const handleDownloadAllIDCards = async () => {
        const teachersToProcess = getTeachersToProcess();

        if (!teachersToProcess?.length) {
            alert("No teachers selected to download");
            return;
        }

        setIsPdfProcessing(true);

        try {
            const zip = new JSZip();

            for (const teacher of teachersToProcess) {
                try {
                    // Create a temporary div with the same structure as your print version
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = `
                    <div class="flex justify-center pb-4">
                        <div
                            class="w-[350px] h-[500px] text-black rounded-lg shadow-2xl border-2 border-[#0a2c59] relative overflow-hidden flex items-center justify-center"
                            style="
                                background-image: url('${branchInfo?.idCardBackground}');
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
                                        ${teacher.avatar
                            ? `<img src="${teacher.avatar}" width="144" height="144" alt="${teacher.name}" class="w-full h-full object-cover rounded-full p-1 border border-gray-300" />`
                            : `<div class="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                                                    No Photo
                                                </div>`
                        }
                                    </div>
                                </div>

                                <div class="text-white bg-[#0a2c59] py-1 text-center">
                                    <p class="font-bold uppercase text-[14px]">
                                        ${teacher.name}
                                    </p>
                                </div>

                                <div class="space-y-2 px-2 mt-6">
                                    <div class="flex items-center">
                                        <span class="font-semibold w-28">Designation</span>
                                        <span class="px-2">:</span>
                                        <span class="flex-1">${teacher.designation || "N/A"}</span>
                                    </div>
                                    <div class="flex items-center">
                                        <span class="font-semibold w-28">Phone</span>
                                        <span class="px-2">:</span>
                                        <span class="flex-1">${teacher.phone || "N/A"}</span>
                                    </div>
                                    <div class="flex items-center">
                                        <span class="font-semibold w-28">Email</span>
                                        <span class="px-2">:</span>
                                        <span class="flex-1">
                                            ${teacher.email ?
                            (teacher.email.length > 15
                                ? `${teacher.email.substring(0, 15)}...`
                                : teacher.email)
                            : "N/A"}
                                        </span>
                                    </div>
                                    <div class="flex items-center">
                                        <span class="font-semibold w-28">Blood Group</span>
                                        <span class="px-2">:</span>
                                        <span class="flex-1">${teacher.bloodGroup || "N/A"}</span>
                                    </div>
                                    <div class="flex items-center">
                                        <span class="font-semibold w-28">Address</span>
                                        <span class="px-2">:</span>
                                        <span class="flex-1">
                                            ${teacher.address ?
                            (teacher.address.length > 15
                                ? `${teacher.address.substring(0, 15)}...`
                                : teacher.address)
                            : "N/A"}
                                        </span>
                                    </div>
                                </div>

                               <div style="display: flex; justify-content: flex-end;">
            <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${branchInfo?.principalSignature}" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
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
                            const style = clonedDoc.createElement('style');
                            style.innerHTML = `
                            body { margin: 0; padding: 0; }
                            .w-\\[350px\\] { width: 350px; }
                            .h-\\[500px\\] { height: 500px; }
                        `;
                            clonedDoc.head.appendChild(style);
                        }
                    });

                    // Remove the temporary div
                    document.body.removeChild(tempDiv);

                    // Convert canvas to image
                    const imageData = canvas.toDataURL('image/png');

                    // Create PDF
                    const pdf = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm'
                    });

                    // Calculate dimensions to fit the PDF page
                    const imgWidth = 85; // width in mm (ID card width)
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    // Add image to PDF
                    pdf.addImage(imageData, 'PNG', (210 - imgWidth) / 2, (297 - imgHeight) / 2, imgWidth, imgHeight);

                    // Add PDF to zip
                    zip.file(`${teacher.name}_ID_Card.pdf`, pdf.output('blob'));

                } catch (error) {
                    console.error(`Error processing teacher ${teacher.name}:`, error);
                    continue;
                }
            }

            // Generate and download the zip file
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Teachers_ID_Cards.zip';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

        } catch (error) {
            console.error("Error generating zip file:", error);
            alert('Failed to generate ID cards. Check console for details.');
        } finally {
            setIsPdfProcessing(false);
        }
    };

    const handlePrintAllIDCards = async () => {
        const teachersToProcess = getTeachersToProcess();

        if (!teachersToProcess?.length) {
            alert("No teachers selected to print");
            return;
        }

        setIsPrintProcessing(true);

        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Popup was blocked. Please allow popups for this site.');
                return;
            }

            printWindow.document.write(`
            <html>
                <head>
                    <title>Teachers ID Cards</title>
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
                            .page {
                                page-break-after: always;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                            }
                            .page:last-child {
                                page-break-after: auto;
                            }
                            .id-card {
                                page-break-inside: avoid;
                                margin-bottom: 10mm;
                            }
                        }
                    </style>
                </head>
                <body class="p-4 bg-white">
        `);

            teachersToProcess.forEach((teacher: Teacher) => {
                printWindow.document.write(`
                <div class="page">
                    <div class="flex justify-center">
                        <div
                            class="w-[350px] h-[500px] text-black rounded-lg shadow-2xl border-2 border-[#0a2c59] relative overflow-hidden flex items-center justify-center id-card"
                            style="
                                background-image: url('${branchInfo?.idCardBackground}');
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
                                        ${teacher.avatar
                        ? `<img src="${teacher.avatar}" width="144" height="144" alt="${teacher.name}" class="w-full h-full object-cover rounded-full p-1 border border-gray-300" />`
                        : `<div class="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                                                    No Photo
                                                </div>`
                    }
                                    </div>
                                </div>

                                <div class="text-white bg-[#0a2c59] py-1 text-center">
                                    <p class="font-bold uppercase text-[14px]">
                                        ${teacher.name}
                                    </p>
                                </div>

                                <div class="space-y-2 px-2 mt-6">
                                    <div class="flex items-center">
                                        <span class="font-semibold w-28">Designation</span>
                                        <span class="px-2">:</span>
                                        <span class="flex-1">${teacher.designation || "N/A"}</span>
                                    </div>
                                    <div class="flex items-center">
                                        <span class="font-semibold w-28">Phone</span>
                                        <span class="px-2">:</span>
                                        <span class="flex-1">${teacher.phone || "N/A"}</span>
                                    </div>
                                    <div class="flex items-center">
                                        <span class="font-semibold w-28">Email</span>
                                        <span class="px-2">:</span>
                                        <span class="flex-1">
                                            ${teacher.email ?
                        (teacher.email.length > 15
                            ? `${teacher.email.substring(0, 15)}...`
                            : teacher.email)
                        : "N/A"}
                                        </span>
                                    </div>
                                    <div class="flex items-center">
                                        <span class="font-semibold w-28">Blood Group</span>
                                        <span class="px-2">:</span>
                                        <span class="flex-1">${teacher.bloodGroup || "N/A"}</span>
                                    </div>
                                    <div class="flex items-center">
                                        <span class="font-semibold w-28">Address</span>
                                        <span class="px-2">:</span>
                                        <span class="flex-1">
                                            ${teacher.address ?
                        (teacher.address.length > 15
                            ? `${teacher.address.substring(0, 15)}...`
                            : teacher.address)
                        : "N/A"}
                                        </span>
                                    </div>
                                </div>

                               <div style="display: flex; justify-content: flex-end;">
            <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${branchInfo?.principalSignature}" width="70" height="60" alt="Principal Signature" style="object-fit: cover; margin-bottom: 10px;" />
                <div class="signature">Principal's Signature</div>
            </div>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            });

            printWindow.document.write(`
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

        } catch (error) {
            console.error("Error printing ID cards:", error);
        } finally {
            setIsPrintProcessing(false);
        }
    };

    return (
        <>
            <div className="p-4 bg-gray-100 min-h-screen">
                <div className="flex justify-between py-4">
                    <h2 className="text-xl font-semibold my-2">Teacher ID Cards</h2>
                    {
                        filteredTeachers && <div className="flex gap-4">
                            <SubmitButton
                                onClick={handlePrintAllIDCards}
                                disabled={isPrintProcessing || (filteredTeachers?.filter(t => t.selected).length === 0)}
                            >
                                <span className="font-medium">
                                    {isPrintProcessing ? 'Processing...' : 'Print'}
                                </span>
                            </SubmitButton>

                            <CancelButton
                                onClick={handleDownloadAllIDCards}
                                disabled={isPdfProcessing || (filteredTeachers?.filter(t => t.selected).length === 0)}
                            >
                                <span className="font-medium">
                                    {isPdfProcessing ? 'Processing...' : 'PDF'}
                                </span>
                            </CancelButton>
                        </div>
                    }
                </div>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <div className="grid grid-cols-1 gap-4">
                        <FormControl fullWidth size="small">
                            <InputLabel>Designation</InputLabel>
                            <Select
                                name="designation"
                                value={filters.designation}
                                onChange={(e) => {
                                    handleFilterChange(e); // Handle the filter change first
                                    setSearchParams({ ...filters, designation: e.target.value }); // Then update search params
                                }}
                                label="Designation"
                                disabled={designationsLoading}
                            >
                                <MenuItem value="">All Designations</MenuItem>
                                {designationsResponse?.data?.map((designation: { id: number, name: string }) => (
                                    <MenuItem key={designation.id} value={designation.name}>
                                        {designation.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                </Paper>

                <Paper sx={{ p: 2 }}>
                    {teachersLoading ? (
                        <Loader />
                    ) : filteredTeachers.length === 0 ? (
                        <Typography
                            variant="body1"
                            color="textSecondary"
                            sx={{ mt: 4, textAlign: "center" }}
                        >
                            No teachers found matching your filters.
                        </Typography>
                    ) : (
                        <>
                            {filteredTeachers.length > 0 && (
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    Showing {filteredTeachers.length} teachers
                                </Typography>
                            )}
                            <ReusableTable<Teacher>
                                columns={columns}
                                data={filteredTeachers}
                            />
                        </>
                    )}
                </Paper>
            </div>
        </>
    );
};

export default TeacherIdCard;