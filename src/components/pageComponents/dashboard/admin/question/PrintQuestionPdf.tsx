"use client";

import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

interface PrintQuestionPdfProps {
  questionImage: string;
  answerImage: string | null;
  questionType: string;
  teacherName: string;
  className: string;
  sessionName: string;
}

export const usePrintQuestionPdf = ({
  questionImage,
  answerImage,
  questionType,
  teacherName,
  className,
  sessionName,
}: PrintQuestionPdfProps) => {
  // Common function to generate print content
  const generatePrintContent = (title: string, image: string, isAnswer = false) => {
    return `
      <html>
        <head>
          <title>${title}</title>
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
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .question-info {
                margin-bottom: 20px;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
              }
              .info-label {
                font-weight: bold;
              }
              .image-container {
                margin: 20px 0;
                text-align: center;
              }
              .image-container img {
                max-width: 100%;
                max-height: 80vh;
                object-fit: contain;
              }
              .image-label {
                font-weight: bold;
                margin-bottom: 8px;
                font-size: 18px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>COMPLEX ACADEMY</h1>
            <p>Another way to Education</p>
            <h2>${title}</h2>
          </div>

          <div class="question-info">
            <div class="info-row">
              <span class="info-label">Question Type:</span>
              <span>${questionType}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Teacher:</span>
              <span>${teacherName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Class:</span>
              <span>${className}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Session:</span>
              <span>${sessionName}</span>
            </div>
          </div>

          <div class="image-container">
            <div class="image-label">${isAnswer ? "Answer" : "Question"}:</div>
            <img src="${image}" alt="${isAnswer ? "Answer" : "Question"}" />
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
    `;
  };

  // Print functions
  const handlePrintQuestion = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(generatePrintContent("Question Details", questionImage));
      printWindow.document.close();
    }
  };

  const handlePrintAnswer = () => {
    if (!answerImage) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(generatePrintContent("Answer Details", answerImage, true));
      printWindow.document.close();
    }
  };

  // PDF functions
  const handleDownloadQuestionPDF = async () => {
    await generatePDF("Question Details", questionImage);
  };

  const handleDownloadAnswerPDF = async () => {
    if (!answerImage) return;
    await generatePDF("Answer Details", answerImage, true);
  };

  const generatePDF = async (title: string, image: string, isAnswer = false) => {
    try {
      const container = document.createElement("div");
      container.id = "pdf-container";
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "210mm";
      container.style.height = "297mm";
      container.style.padding = "20mm";
      container.style.backgroundColor = "white";
      container.style.boxSizing = "border-box";
      container.style.overflow = "hidden";
      container.style.zIndex = "9999";
      container.style.visibility = "visible";

      container.innerHTML = `
        <div style="font-family: sans-serif; color: black;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-size: 24px; margin-bottom: 5px;">COMPLEX ACADEMY</h1>
            <p style="margin-bottom: 15px;">Another way to Education</p>
            <h2 style="font-size: 20px; text-decoration: underline;">${title}</h2>
          </div>

          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: bold;">Question Type:</span>
              <span>${questionType}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: bold;">Teacher:</span>
              <span>${teacherName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: bold;">Class:</span>
              <span>${className}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: bold;">Session:</span>
              <span>${sessionName}</span>
            </div>
          </div>

          <div style="margin: 20px 0; text-align: center;">
            <div style="font-weight: bold; margin-bottom: 8px; font-size: 18px;">
              ${isAnswer ? "Answer" : "Question"}:
            </div>
            <div style="text-align: center; width: 100%;">
    <img src="${image}" alt="${isAnswer ? "Answer" : "Question"}" 
         style="max-width: 100%; max-height: 400px; object-fit: contain; display: block; margin: 0 auto;" />
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

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

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

      document.body.removeChild(container);
      pdf.save(`${title.replace(" ", "_")}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  return {
    handlePrintQuestion,
    handlePrintAnswer,
    handleDownloadQuestionPDF,
    handleDownloadAnswerPDF,
    hasAnswer: !!answerImage
  };
};