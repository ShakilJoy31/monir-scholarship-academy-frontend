"use client";


import { usePathname } from 'next/navigation';
import React from 'react';

interface Column<T> {
  key: keyof T | string;
  header: string | React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
  cellClassName?: string;
}

interface TableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  pagination?: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

const ReusableTable = <T extends Record<string, unknown>>({
  columns,
  data,
  className = '',
  pagination,
  isLoading = false,
  emptyState = <div className="py-8 text-center text-gray-500">No data available</div>
}: TableProps<T>) => {
  const totalPages = pagination ? Math.ceil(pagination.totalItems / pagination.itemsPerPage) : 1;
  const pathname = usePathname(); 

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="overflow-x-auto">
        <div className="rounded-lg overflow-hidden relative">
          {/* Table container with fixed header and hidden scrollbar */}
          <div className={`max-h-[calc(100vh-200px)] overflow-y-auto ${(pathname === '/branch-admin/pages/class-wise-result' || pathname === '/teacher/pages/teacher-class-wise-result') ? '' : 'scrollbar-hide'}`}>
            <table className="min-w-full">
              <thead className="sticky top-0 z-10">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key as string}
                      className={`px-3 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-white bg-[#035140] ${column.className || ''}`}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-600">
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-3 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#035140]"></div>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-3 py-4 text-center">
                      {emptyState}
                    </td>
                  </tr>
                ) : (
                  data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map((column) => (
                        <td
                          key={column.key as string}
                          className={`px-3 py-4 text-sm ${column.cellClassName || ''}`}
                        >
                          {column.render ? column.render(row, rowIndex) : (row[column.key as keyof T] as React.ReactNode)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination controls */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span>{' '}
                to <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                </span>{' '}
                of <span className="font-medium">{pagination.totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  &larr; Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => pagination.onPageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === pagination.currentPage
                        ? 'z-10 bg-[#035140] border-[#035140] text-white'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  Next &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReusableTable;