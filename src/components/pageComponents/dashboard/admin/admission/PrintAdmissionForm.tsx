"use client";

import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export const PrintAdmissionForm = () => {
  // Fetching branch name, email, address and logo. 
  const userInfo = getUserInfoFromToken();
  const { data: branchConfigData } = useGetBranchConfigQuery(userInfo?.branchId)
  const branchInfo = branchConfigData?.data;
 const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Admission Form</title>
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
              .underline-field {
                border-bottom: 1px solid black;
                display: inline-block;
                min-width: 200px;
                padding-bottom: 2px;
              }
            }
          </style>
        </head>
        <body class="bg-white">
            <div class="w-full text-black font-sans relative border-[6px] border-white p-1">
              <div class="border-2 border-[#004d5c] p-4">
                <div class="text-center mb-4">
                  <h1 class="text-2xl font-bold text-gray-700">
                    ${branchInfo?.schoolName}
                  </h1>
                  <p class="text-sm -mt-1">${branchInfo?.schoolName}</p>
                 
                  <h3 class="text-lg font-semibold underline mt-1">
                    ADMISSION FORM
                  </h3>
                </div>

                <div class="space-y-4 text-sm text-gray-700">
                  <!-- Student Info -->
                  <div class="grid grid-cols-2 gap-4">
                    <div class="flex">
                      <label class="block font-semibold">Student's Name:</label>
                      <span class="underline-field"></span>
                    </div>
                    <div class="flex">
                      <label class="block font-semibold">Father's Name:</label>
                      <span class="underline-field"></span>
                    </div>
                    <div class="flex">
                      <label class="block font-semibold">Mother's Name:</label>
                      <span class="underline-field"></span>
                    </div>
                    <div class="flex">
                      <label class="block font-semibold">Birth Date:</label>
                      <span class="underline-field"></span>
                    </div>
                  </div>

                  <!-- Academic Info -->
                  <div class="grid grid-cols-2 gap-4 mt-4">
                    <div class="flex">
                      <label class="block font-semibold">Session:</label>
                      <span class="underline-field"></span>
                    </div>
                    <div class="flex">
                      <label class="block font-semibold">Section:</label>
                      <span class="underline-field"></span>
                    </div>
                    <div class="flex">
                      <label class="block font-semibold">Class:</label>
                      <span class="underline-field"></span>
                    </div>
                    <div class="flex">
                      <label class="block font-semibold">Group:</label>
                      <span class="underline-field"></span>
                    </div>
                  </div>

                  <!-- Gender -->
                  <div class="flex items-center gap-5">
                    <label class="block font-semibold">Gender:</label>
                    <div class="flex items-center gap-4 mt-1">
                      <label class="flex items-center gap-1">
                        <input type="checkbox" name="gender" value="male" disabled />
                        Male
                      </label>
                      <label class="flex items-center gap-1">
                        <input type="checkbox" name="gender" value="female" disabled />
                        Female
                      </label>
                      <label class="flex items-center gap-1">
                        <input type="checkbox" name="gender" value="christian" disabled />
                        Christian
                      </label>
                      <label class="flex items-center gap-1">
                        <input type="checkbox" name="gender" value="other" disabled />
                        Other
                      </label>
                    </div>
                  </div>

                  <!-- Present Address -->
                  <div>
                    <h4 class="font-semibold underline">Present Address</h4>
                    <div class="grid grid-cols-2 gap-4 mt-2">
                      <div class="flex">
                        <label class="block font-semibold">Division:</label>
                        <span class="underline-field"></span>
                      </div>
                      <div class="flex">
                        <label class="block font-semibold">District:</label>
                        <span class="underline-field"></span>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mt-2">
                      <div class="mt-2 flex">
                        <label class="block font-semibold">Address:</label>
                        <span class="underline-field"></span>
                      </div>
                      <div class="mt-2 flex">
                        <label class="block font-semibold">Previous School:</label>
                        <span class="underline-field"></span>
                      </div>
                    </div>
                  </div>

                  <!-- Permanent Address -->
                  <div>
                    <h4 class="font-semibold underline">Permanent Address</h4>
                    <div class="grid grid-cols-2 gap-4 mt-2">
                      <div class="flex">
                        <label class="block font-semibold">Division:</label>
                        <span class="underline-field"></span>
                      </div>
                      <div class="flex">
                        <label class="block font-semibold">District:</label>
                        <span class="underline-field"></span>
                      </div>
                    </div>
                    <div class="mt-2 flex">
                      <label class="block font-semibold">Address:</label>
                      <div class="underline-field" style="min-width: 30%;"></div>
                    </div>
                  </div>

                  <!-- Other Details -->
                  <h4 class="font-semibold underline mt-2">Other Details</h4>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="flex">
                      <label class="block font-semibold">Religion:</label>
                      <span class="underline-field"></span>
                    </div>
                    <div class="flex">
                      <label class="block font-semibold">Nationality:</label>
                      <span class="underline-field"></span>
                    </div>
                    <div class="flex">
                      <label class="block font-semibold">Phone Number:</label>
                      <span class="underline-field"></span>
                    </div>
                    <div class="flex">
                      <label class="block font-semibold">Blood Group:</label>
                      <span class="underline-field"></span>
                    </div>
                    <div class="flex">
                      <label class="block font-semibold">NID Number:</label>
                      <span class="underline-field"></span>
                    </div>
                    <div class="flex">
                      <label class="block font-semibold">Email Address:</label>
                      <span class="underline-field"></span>
                    </div>
                    <div class="flex">
                      <label class="block font-semibold">Occupation:</label>
                      <span class="underline-field"></span>
                    </div>
                    <div class="flex items-center gap-3 md:col-span-2">
                      <label class="block font-semibold">Status:</label>
                      <div class="flex items-center gap-4 mt-1">
                        <label class="flex items-center gap-1">
                          <input type="checkbox" name="status" value="single" disabled />
                          Single
                        </label>
                        <label class="flex items-center gap-1">
                          <input type="checkbox" name="status" value="married" disabled />
                          Married
                        </label>
                      </div>
                    </div>
                  </div>

                  <!-- Declaration -->
                  <div class="mt-4 text-sm">
                    <h4 class="font-semibold underline mb-1">DECLARATION</h4>
                    <p>
                      I hereby, declaring that I will obey all the rules and regulations
                      of the institution and be fully responsible for violating the
                      rules.
                    </p>
                  </div>

                  <!-- Signatures -->
                  <div class="grid grid-cols-2 mt-6 text-center text-sm">
                    <div>
                      <p class="border-t border-black inline-block px-4 pt-1">
                        Student's Signature
                      </p>
                    </div>
                    <div>
                      <p class="border-t border-black inline-block px-4 pt-1">
                        Authorised Signature
                      </p>
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
    }
  };

  const handleDownloadPDF = async () => {
  try {
    // Create a container div with proper dimensions and styles
    const container = document.createElement("div");
    container.id = "pdf-container";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "210mm"; // A4 width
    container.style.height = "297mm"; // A4 height
    container.style.padding = "10mm";
    container.style.backgroundColor = "white";
    container.style.border = "none";
    container.style.boxSizing = "border-box";
    container.style.overflow = "hidden";
    container.style.zIndex = "9999";
    container.style.visibility = "visible";

    // Set the HTML content
    container.innerHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admission Form</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-family: sans-serif;
              margin: 0;
              padding: 0;
              background: white;
            }
            .certificate-container {
              width: 100%;
              height: 100%;
              color: black;
              font-family: sans-serif;
              position: relative;
              border: 6px solid white;
              padding: 1px;
              margin: 0;
              box-sizing: border-box;
            }
            .content-border {
              border: 2px solid #004d5c;
              padding: 15px;
              height: calc(100% - 30px);
            }
            .underline-field {
              border-bottom: 1px solid black;
              display: inline-block;
              min-width: 200px;
              padding-bottom: 2px;
            }
            .text-center {
              text-align: center;
            }
            .font-bold {
              font-weight: bold;
            }
            .font-semibold {
              font-weight: 600;
            }
            .underline {
              text-decoration: underline;
            }
            .text-sm {
              font-size: 0.875rem;
            }
            .text-lg {
              font-size: 1.125rem;
            }
            .text-xl {
              font-size: 1.25rem;
            }
            .text-2xl {
              font-size: 1.5rem;
            }
            .mt-1 {
              margin-top: 0.25rem;
            }
            .mt-2 {
              margin-top: 0.5rem;
            }
            .mt-4 {
              margin-top: 1rem;
            }
            .mt-6 {
              margin-top: 1.5rem;
            }
            .mb-4 {
              margin-bottom: 1rem;
            }
            .mb-1 {
              margin-bottom: 0.25rem;
            }
            .gap-4 {
              gap: 1rem;
            }
            .gap-5 {
              gap: 1.25rem;
            }
            .grid {
              display: grid;
            }
            .grid-cols-2 {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            .flex {
              display: flex;
            }
            .items-center {
              align-items: center;
            }
            .space-y-4 > * + * {
              margin-top: 1rem;
            }
            .inline-block {
              display: inline-block;
            }
            .px-4 {
              padding-left: 1rem;
              padding-right: 1rem;
            }
            .pt-1 {
              padding-top: 0.25rem;
            }
            .border-t {
              border-top-width: 1px;
            }
            .border-black {
              border-color: black;
            }
            .bg-white {
              background-color: white;
            }
            .text-gray-700 {
              color: #374151;
            }
            .-mt-1 {
              margin-top: -0.25rem;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="content-border">
              <div class="text-center mb-4">
                <h1 class="text-2xl font-bold text-gray-700">
                  ${branchInfo?.schoolName}
                </h1>
                <p class="text-sm -mt-1">${branchInfo?.schoolAddress}</p>
               
                <h3 class="text-lg font-semibold underline mt-1">
                  ADMISSION FORM
                </h3>
              </div>

              <div class="space-y-4 text-sm text-gray-700">
                <!-- Student Info -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex">
                    <label class="block font-semibold">Student's Name:</label>
                    <span class="underline-field"></span>
                  </div>
                  <div class="flex">
                    <label class="block font-semibold">Father's Name:</label>
                    <span class="underline-field"></span>
                  </div>
                  <div class="flex">
                    <label class="block font-semibold">Mother's Name:</label>
                    <span class="underline-field"></span>
                  </div>
                  <div class="flex">
                    <label class="block font-semibold">Birth Date:</label>
                    <span class="underline-field"></span>
                  </div>
                </div>

                <!-- Academic Info -->
                <div class="grid grid-cols-2 gap-4 mt-4">
                  <div class="flex">
                    <label class="block font-semibold">Session:</label>
                    <span class="underline-field"></span>
                  </div>
                  <div class="flex">
                    <label class="block font-semibold">Section:</label>
                    <span class="underline-field"></span>
                  </div>
                  <div class="flex">
                    <label class="block font-semibold">Class:</label>
                    <span class="underline-field"></span>
                  </div>
                  <div class="flex">
                    <label class="block font-semibold">Group:</label>
                    <span class="underline-field"></span>
                  </div>
                </div>

                <!-- Gender -->
                <div class="flex items-center gap-5">
                  <label class="block font-semibold">Gender:</label>
                  <div class="flex items-center gap-4 mt-1">
                    <label class="flex items-center gap-1">
                      <input type="checkbox" name="gender" value="male" disabled />
                      Male
                    </label>
                    <label class="flex items-center gap-1">
                      <input type="checkbox" name="gender" value="female" disabled />
                      Female
                    </label>
                    <label class="flex items-center gap-1">
                      <input type="checkbox" name="gender" value="christian" disabled />
                      Christian
                    </label>
                    <label class="flex items-center gap-1">
                      <input type="checkbox" name="gender" value="other" disabled />
                      Other
                    </label>
                  </div>
                </div>

                <!-- Present Address -->
                <div>
                  <h4 class="font-semibold underline">Present Address</h4>
                  <div class="grid grid-cols-2 gap-4 mt-2">
                    <div class="flex">
                      <label class="block font-semibold">Division:</label>
                      <span class="underline-field"></span>
                    </div>
                    <div class="flex">
                      <label class="block font-semibold">District:</label>
                      <span class="underline-field"></span>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4 mt-2">
                    <div class="mt-2 flex">
                      <label class="block font-semibold">Address:</label>
                      <span class="underline-field"></span>
                    </div>
                    <div class="mt-2 flex">
                      <label class="block font-semibold">Previous School:</label>
                      <span class="underline-field"></span>
                    </div>
                  </div>
                </div>

                <!-- Permanent Address -->
                <div>
                  <h4 class="font-semibold underline">Permanent Address</h4>
                  <div class="grid grid-cols-2 gap-4 mt-2">
                    <div class="flex">
                      <label class="block font-semibold">Division:</label>
                      <span class="underline-field"></span>
                    </div>
                    <div class="flex">
                      <label class="block font-semibold">District:</label>
                      <span class="underline-field"></span>
                    </div>
                  </div>
                  <div class="mt-2 flex">
                    <label class="block font-semibold">Address:</label>
                    <div class="underline-field" style="min-width: 100%;"></div>
                  </div>
                </div>

                <!-- Other Details -->
                 <h4 class="font-semibold underline mt-2">Other Details</h4>
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex">
                    <label class="block font-semibold">Religion:</label>
                    <span class="underline-field"></span>
                  </div>
                  <div class="flex">
                    <label class="block font-semibold">Nationality:</label>
                    <span class="underline-field"></span>
                  </div>
                  <div class="flex">
                    <label class="block font-semibold">Phone Number:</label>
                    <span class="underline-field"></span>
                  </div>
                  <div class="flex">
                    <label class="block font-semibold">Blood Group:</label>
                    <span class="underline-field"></span>
                  </div>
                  <div class="flex">
                    <label class="block font-semibold">NID Number:</label>
                    <span class="underline-field"></span>
                  </div>
                  <div class="flex">
                    <label class="block font-semibold">Email Address:</label>
                    <span class="underline-field"></span>
                  </div>
                  <div class="flex">
                    <label class="block font-semibold">Occupation:</label>
                    <span class="underline-field"></span>
                  </div>
                  <div class="flex items-center gap-3" style="grid-column: span 2;">
                    <label class="block font-semibold">Status:</label>
                    <div class="flex items-center gap-4 mt-1">
                      <label class="flex items-center gap-1">
                        <input type="checkbox" name="status" value="single" disabled />
                        Single
                      </label>
                      <label class="flex items-center gap-1">
                        <input type="checkbox" name="status" value="married" disabled />
                        Married
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Declaration -->
                <div class="mt-4 text-sm">
                  <h4 class="font-semibold underline mb-1">DECLARATION</h4>
                  <p>
                    I hereby, declaring that I will obey all the rules and regulations
                    of the institution and be fully responsible for violating the
                    rules.
                  </p>
                </div>

                <!-- Signatures -->
                <div class="grid grid-cols-2 mt-6 text-center text-sm">
                  <div>
                    <p class="border-t border-black inline-block px-4 pt-1">
                      Student's Signature
                    </p>
                  </div>
                  <div>
                    <p class="border-t border-black inline-block px-4 pt-1">
                      Authorised Signature
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Append to document body
    document.body.appendChild(container);

    // Wait for fonts to load
    await document.fonts.ready;

    // Generate canvas
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

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Add image to PDF
    pdf.addImage(
      canvas.toDataURL("image/png", 1.0),
      "PNG",
      0,
      0,
      210,
      297,
      undefined,
      "FAST"
    );

    // Clean up
    document.body.removeChild(container);

    // Save PDF
    pdf.save("Admission_Form.pdf");
  } catch (error) {
    console.error("PDF generation failed:", error);
    alert(
      `Failed to generate PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

  return (
   <div className="flex gap-3">
     <SubmitButton
      onClick={handlePrint}
    >
      Print
    </SubmitButton>
     <CancelButton
      onClick={handleDownloadPDF}
    >
      PDF
    </CancelButton>
   </div>
  );
};