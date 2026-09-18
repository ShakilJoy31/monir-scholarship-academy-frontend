/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from 'react';
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

interface SinglePDFComponentProps<T> {
  data: T;
  columns: {
    key: string;
    header: string | React.ReactElement;
    render?: (row: T, index?: number) => React.ReactNode;
  }[];
  title?: string;
  fileName?: string;
  orientation?: 'portrait' | 'landscape';
  summary?: (data: T) => React.ReactNode;
  headerInfo?: (data: T) => React.ReactNode;
}

export const useSinglePDF = <T,>() => {
  const generateSinglePDF = async (
    data: T,
    columns: SinglePDFComponentProps<T>['columns'],
    title?: string,
    fileName?: string,
    headerInfo?: (data: T) => string,
    summary?: (data: T) => string
  ) => {
    if (!data) {
      alert('No data selected for PDF export');
      return;
    }

    try {
      // Process header texts
      const processedColumns = columns.map(col => {
        let headerText: string = col.key; // Default to column key
        
        // If header is a string, use it directly
        if (typeof col.header === 'string') {
          headerText = col.header;
        }
        // If header is a React element with children, extract the text
        else if (React.isValidElement(col.header)) {
          const element = col.header as React.ReactElement;
          const propsWithChildren = element.props as React.PropsWithChildren<any>;
          if (propsWithChildren && propsWithChildren.children) {
            if (typeof propsWithChildren.children === 'string') {
              headerText = propsWithChildren.children;
            } else if (Array.isArray(propsWithChildren.children)) {
              // Handle array of children - join them
              headerText = propsWithChildren.children
                .map((child: React.ReactNode) => 
                  typeof child === 'string' ? child : ''
                )
                .filter(Boolean)
                .join(' ');
            }
          }
        }
        
        return {
          ...col,
          header: headerText
        };
      });

      // Generate header info HTML if provided
      const headerInfoHTML = headerInfo ? headerInfo(data) : '';

      // Generate summary HTML if provided
      const summaryHTML = summary ? summary(data) : '';

      // Create a temporary container for PDF generation
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '210mm';
      tempContainer.style.padding = '20mm 0';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.fontFamily = 'Arial, sans-serif';

      // Build the PDF content
      tempContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #035140; padding-bottom: 15px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; color: #035140;">${title || 'Details'}</h1>
          <div style="font-size: 14px; color: #666;">
            Generated on: ${new Date().toLocaleDateString()}
          </div>
        </div>

        ${headerInfoHTML ? `
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #ddd;">
            ${headerInfoHTML}
          </div>
        ` : ''}

        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              ${processedColumns.map(col => `
                <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: left; font-weight: bold; font-size: 12px;">
                  ${col.header}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            <tr style="background-color: #ffffff;">
              ${processedColumns.map(col => {
                let cellContent = '';
                if (col.render) {
                  const rendered = col.render(data, 0);
                  cellContent = rendered !== null && rendered !== undefined ? String(rendered) : '';
                } else {
                  const value = (data as any)[col.key];
                  cellContent = value !== null && value !== undefined ? String(value) : '';
                }
                return `
                  <td style="border: 1px solid #ddd; padding: 10px 8px; font-size: 11px;">
                    ${cellContent}
                  </td>
                `;
              }).join('')}
            </tr>
          </tbody>
        </table>

        ${summaryHTML ? `
          <div style="margin-top: 20px; padding: 15px; background-color: #f0f7f5; border-radius: 4px; border: 1px solid #ddd; font-size: 12px;">
            ${summaryHTML}
          </div>
        ` : ''}

        <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 4px; border: 1px solid #ddd; font-size: 12px; text-align: center;">
          <strong>Summary:</strong> Single record exported to PDF • Generated on ${new Date().toLocaleString()}
        </div>
      `;

      document.body.appendChild(tempContainer);

      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = imgWidth / imgHeight;
      let imgFinalWidth = pdfWidth - 20;
      let imgFinalHeight = imgFinalWidth / ratio;
      
      if (imgFinalHeight > pdfHeight - 40) {
        imgFinalHeight = pdfHeight - 40;
        imgFinalWidth = imgFinalHeight * ratio;
      }

      const xPos = (pdfWidth - imgFinalWidth) / 2;
      const yPos = 10;

      pdf.addImage(imgData, 'PNG', xPos, yPos, imgFinalWidth, imgFinalHeight);
      pdf.save(`${fileName || 'details'}_${new Date().getTime()}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return { generateSinglePDF };
};

// Export a default component for backward compatibility
const SinglePDFComponent = <T,>(props: SinglePDFComponentProps<T>) => {
  return null;
};

export default SinglePDFComponent;