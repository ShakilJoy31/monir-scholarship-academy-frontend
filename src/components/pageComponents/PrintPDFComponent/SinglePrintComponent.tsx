/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from 'react';

interface SinglePrintComponentProps<T> {
  data: T;
  columns: {
    key: string;
    header: string | React.ReactElement;
    render?: (row: T, index?: number) => React.ReactNode;
  }[];
  title?: string;
  orientation?: 'portrait' | 'landscape';
  summary?: (data: T) => React.ReactNode;
  headerInfo?: (data: T) => React.ReactNode;
}

export const useSinglePrint = <T,>() => {
  const printSingleData = (
    data: T,
    columns: SinglePrintComponentProps<T>['columns'],
    title?: string,
    headerInfo?: (data: T) => string,
    summary?: (data: T) => string
  ) => {
    if (!data) {
      alert('No data selected for printing');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for printing');
      return;
    }

    const printDocument = printWindow.document;

    // Process header texts - handle both string and React element headers
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

    printDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title || 'Details'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #000;
            }
            .print-container {
              max-width: 100%;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .print-title {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
              color: #035140;
            }
            .print-date {
              font-size: 14px;
              color: #666;
              margin-top: 5px;
            }
            .header-info {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 4px;
              margin-bottom: 20px;
              border: 1px solid #ddd;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .print-table th {
              background-color: #f5f5f5;
              border: 1px solid #ddd;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              font-size: 14px;
            }
            .print-table td {
              border: 1px solid #ddd;
              padding: 10px 8px;
              font-size: 13px;
            }
            .print-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .print-summary {
              margin-top: 20px;
              padding: 15px;
              background-color: #f5f5f5;
              border-radius: 4px;
              border: 1px solid #ddd;
            }
            .text-center {
              text-align: center;
            }
            .no-print {
              display: none;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              @page { margin: 1cm; }
            }
          </style>
          <script>
            // Auto-close after print
            window.addEventListener('afterprint', function() {
              setTimeout(function() {
                window.close();
              }, 100);
            });

            // Close if user cancels print
            window.addEventListener('beforeunload', function() {
              if (!window.closed) {
                setTimeout(function() {
                  if (!window.closed) {
                    window.close();
                  }
                }, 500);
              }
            });
          </script>
        </head>
        <body>
          <div class="print-container">
            <div class="print-header">
              <h1 class="print-title">${title || 'Details'}</h1>
              <div class="print-date">Generated on: ${new Date().toLocaleDateString()}</div>
            </div>
            
            ${headerInfoHTML ? `<div class="header-info">${headerInfoHTML}</div>` : ''}

            <table class="print-table">
              <thead>
                <tr>
                  ${processedColumns.map(col => `<th>${col.header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                <tr>
                  ${processedColumns.map(col => {
                    let cellContent = '';
                    if (col.render) {
                      const rendered = col.render(data, 0);
                      cellContent = rendered !== null && rendered !== undefined ? String(rendered) : '';
                    } else {
                      const value = (data as any)[col.key];
                      cellContent = value !== null && value !== undefined ? String(value) : '';
                    }
                    return `<td>${cellContent}</td>`;
                  }).join('')}
                </tr>
              </tbody>
            </table>

            ${summaryHTML ? `<div class="print-summary">${summaryHTML}</div>` : ''}

            <div class="print-summary">
              <strong>Summary:</strong> Single record printed • Generated on ${new Date().toLocaleString()}
            </div>
          </div>

          <script>
            // Auto print and setup close handlers
            setTimeout(function() {
              window.print();
              
              // Fallback close in case afterprint doesn't fire
              setTimeout(function() {
                if (!window.closed) {
                  window.close();
                }
              }, 3000);
            }, 500);
          </script>
        </body>
      </html>
    `);

    printDocument.close();

    // Focus the window for printing
    printWindow.focus();
  };

  return { printSingleData };
};

// Export a default component for backward compatibility
const SinglePrintComponent = <T,>(props: SinglePrintComponentProps<T>) => {
  return null;
};

export default SinglePrintComponent;