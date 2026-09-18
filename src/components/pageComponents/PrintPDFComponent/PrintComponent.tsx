/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from 'react';

interface PrintComponentProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string | React.ReactElement;
    render?: (row: T, index?: number) => React.ReactNode;
  }[];
  title?: string;
  orientation?: 'portrait' | 'landscape';
}

export const usePrint = <T,>() => {
  const printData = (
    data: T[],
    columns: PrintComponentProps<T>['columns'],
    title?: string
  ) => {
    if (data.length === 0) {
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

    printDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title || 'Report'}</title>
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
            // Auto close after print dialog closes
            window.addEventListener('afterprint', function() {
              setTimeout(function() {
                window.close();
              }, 100);
            });

            // Fallback: Close if user navigates away or closes manually
            window.addEventListener('beforeunload', function() {
              if (!window.closed) {
                setTimeout(function() {
                  if (!window.closed) {
                    window.close();
                  }
                }, 500);
              }
            });

            // Fallback: Close on page hide (when print dialog opens)
            window.addEventListener('pagehide', function() {
              setTimeout(function() {
                if (!window.closed) {
                  window.close();
                }
              }, 1000);
            });
          </script>
        </head>
        <body>
          <div class="print-container">
            <div class="print-header">
              <h1 class="print-title">${title || 'Report'}</h1>
              <div class="print-date">Generated on: ${new Date().toLocaleDateString()}</div>
              <div class="print-date">Total Records: ${data.length}</div>
            </div>
            <table class="print-table">
              <thead>
                <tr>
                  ${processedColumns.map(col => `<th>${col.header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.map((row, index) => `
                  <tr>
                    ${processedColumns.map(col => {
                      let cellContent = '';
                      if (col.render) {
                        const rendered = col.render(row, index);
                        cellContent = rendered !== null && rendered !== undefined ? String(rendered) : '';
                      } else {
                        const value = (row as any)[col.key];
                        cellContent = value !== null && value !== undefined ? String(value) : '';
                      }
                      return `<td>${cellContent}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="print-summary">
              <strong>Summary:</strong> ${data.length} record(s) printed • Generated on ${new Date().toLocaleString()}
            </div>
          </div>

          <script>
            // Auto print and setup close handlers
            setTimeout(function() {
              window.print();
              
              // Fallback: Close after 3 seconds if still open
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

  return { printData };
};

// Export a default component for backward compatibility (if needed)
const PrintComponent = <T,>(props: PrintComponentProps<T>) => {
  // This component is kept for compatibility but the logic is in usePrint
  return null;
};

export default PrintComponent;