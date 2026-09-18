"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
import {
    Box,
    Button,
    Typography,
    Paper,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    SelectChangeEvent
} from "@mui/material";
import { Download } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRange } from "@mui/x-date-pickers-pro";
import dayjs, { Dayjs } from "dayjs";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import {
    useGetExpenseReportDateWiseQuery,
    useGetExpenseReportCategoryWiseQuery
} from "@/app/store/api/expense/expense";
import { useGetAllExpenseCategoriesQuery } from "@/app/store/api/expense/expenseCategoryApi";
import { useGetAllExpenseSubcategoriesQuery } from "@/app/store/api/expense/expenseSubCategoryApi";
import CancelButton from "@/components/shared/reusable-component/CancelButton";

interface ExpenseItem {
    id: number;
    date: string;
    status: string;
    note: string;
    totalAmount: number;
    expenseCategory: {
        id: number;
        name: string;
    };
    expenseSubcategory: {
        id: number;
        name: string;
    };
}

interface CategoryWiseItem {
    categoryId: number;
    categoryName: string;
    totalAmount: number;
    [key: string]: unknown;
}

interface Category {
    id: number;
    name: string;
}

interface Subcategory {
    id: number;
    name: string;
    expenseCategoryId: number;
}

interface ExpenseReportDateWiseProps {
    dateRange: DateRange<Dayjs>;
    setDateRange: (value: DateRange<Dayjs>) => void;
    selectedCategory: number | null;
    setSelectedCategory: (value: number | null) => void;
    selectedSubcategory: number | null;
    setSelectedSubcategory: (value: number | null) => void;
    filteredSubcategories: Subcategory[];
    categories: Category[];
}

const ExpenseReportDateWise: React.FC<ExpenseReportDateWiseProps> = ({
    dateRange,
    setDateRange,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    filteredSubcategories,
    categories
}) => {
    const tableRef = useRef<HTMLDivElement>(null);
    const { data: responseData, isLoading, isError, refetch } = useGetExpenseReportDateWiseQuery({
        fromDate: dateRange[0]?.format('YYYY-MM-DD') || '',
        toDate: dateRange[1]?.format('YYYY-MM-DD') || '',
        category: selectedCategory || undefined,
        subcategory: selectedSubcategory || undefined
    });

    const handleResetDateFilter = () => {
        setDateRange([dayjs().startOf('month'), dayjs()]);
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        refetch();
    };

    const handleCategoryChange = (event: SelectChangeEvent<number | "all">) => {
        const value = event.target.value;
        setSelectedCategory(value === "all" ? null : Number(value));
    };

    const handleSubcategoryChange = (event: SelectChangeEvent<number | "all">) => {
        const value = event.target.value;
        setSelectedSubcategory(value === "all" ? null : Number(value));
    };

    const formatDate = (dateString: string) => {
        return dayjs(dateString).format('DD MMM YYYY');
    };

    const calculateTotal = () => {
        if (!responseData?.data) return 0;
        return responseData.data.reduce((sum: number, item: ExpenseItem) => sum + item.totalAmount, 0);
    };

  const handleDownloadPDF = async () => {
  if (!tableRef.current) return;

  try {
    // Step 1: Setup clean container
    const printDiv = document.createElement('div');
    printDiv.id = "print-pdf-container";
    printDiv.style.padding = '20px';
    printDiv.style.fontFamily = 'Arial, sans-serif';
    printDiv.innerHTML = ''; // Ensure it's clean

    // Step 2: Header section
    const header = document.createElement('div');
    header.style.marginBottom = '20px';
    header.style.textAlign = 'center';

    const schoolName = document.createElement('h1');
    schoolName.textContent = 'School Name';
    schoolName.style.fontSize = '24px';
    schoolName.style.fontWeight = 'bold';
    schoolName.style.marginBottom = '10px';

    const reportTitle = document.createElement('h2');
    reportTitle.textContent = 'Expense Report (Date Wise)';
    reportTitle.style.fontSize = '20px';
    reportTitle.style.marginBottom = '10px';

    const address = document.createElement('p');
    address.textContent = 'School Address, City, Country';
    address.style.marginBottom = '10px';

    const dateRangeText = document.createElement('p');
    dateRangeText.textContent = `${dateRange[0]?.format('DD MMM YYYY')} to ${dateRange[1]?.format('DD MMM YYYY')} | Generated on ${dayjs().format('DD MMM YYYY')}`;
    dateRangeText.style.marginBottom = '20px';

    header.appendChild(schoolName);
    header.appendChild(reportTitle);
    header.appendChild(address);
    header.appendChild(dateRangeText);

    // Step 3: Rebuild table (new, clean)
    const originalTable = tableRef.current.querySelector('table');
    if (!originalTable) return;

    const newTable = document.createElement('table');
    newTable.style.border = '1px solid #000';
    newTable.style.borderCollapse = 'collapse';
    newTable.style.width = '100%';

    const originalThead = originalTable.querySelector('thead');
    if (originalThead && originalThead.querySelector('tr')) {
      const newThead = document.createElement('thead');
      newThead.style.backgroundColor = '#f0f0f0';

      originalThead.querySelectorAll('tr').forEach(row => {
        if (row.querySelector('th')) {
          const newRow = document.createElement('tr');
          row.querySelectorAll('th').forEach(cell => {
            const newCell = document.createElement('th');
            newCell.textContent = cell.textContent;
            newCell.style.border = '1px solid #000';
            newCell.style.padding = '8px';
            newCell.style.fontWeight = 'bold';
            newCell.style.textAlign = 'center';
            newCell.style.backgroundColor = '#f0f0f0';
            newRow.appendChild(newCell);
          });
          newThead.appendChild(newRow);
        }
      });

      if (newThead.querySelector('tr')) {
        newTable.appendChild(newThead);
      }
    }

    const originalTbody = originalTable.querySelector('tbody');
    if (originalTbody && originalTbody.querySelector('tr')) {
      const newTbody = document.createElement('tbody');
      let hasDataRows = false;

      originalTbody.querySelectorAll('tr').forEach(row => {
        if (row.querySelector('td')) {
          hasDataRows = true;
          const newRow = document.createElement('tr');
          row.querySelectorAll('td').forEach(cell => {
            const newCell = document.createElement('td');
            newCell.textContent = cell.textContent;
            newCell.style.border = '1px solid #000';
            newCell.style.padding = '8px';
            newCell.style.textAlign = 'center';
            newRow.appendChild(newCell);
          });
          newTbody.appendChild(newRow);
        }
      });

      // Total row if there are data rows
      if (hasDataRows) {
        const totalRow = document.createElement('tr');
        totalRow.style.fontWeight = 'bold';
        totalRow.style.backgroundColor = '#f0f0f0';

        const emptyCells = Array(4).fill(null).map(() => {
          const cell = document.createElement('td');
          cell.textContent = '';
          cell.style.border = '1px solid #000';
          cell.style.padding = '8px';
          cell.style.textAlign = 'center';
          return cell;
        });

        const totalLabelCell = document.createElement('td');
        totalLabelCell.textContent = 'Total';
        totalLabelCell.style.border = '1px solid #000';
        totalLabelCell.style.padding = '8px';
        totalLabelCell.style.textAlign = 'center';

        const totalAmountCell = document.createElement('td');
        totalAmountCell.textContent = `৳ ${calculateTotal().toFixed(2)}/-`;
        totalAmountCell.style.border = '1px solid #000';
        totalAmountCell.style.padding = '8px';
        totalAmountCell.style.textAlign = 'center';

        const emptyStatusCell = document.createElement('td');
        emptyStatusCell.textContent = '';
        emptyStatusCell.style.border = '1px solid #000';
        emptyStatusCell.style.padding = '8px';
        emptyStatusCell.style.textAlign = 'center';

        emptyCells.forEach(cell => totalRow.appendChild(cell));
        totalRow.appendChild(totalLabelCell);
        totalRow.appendChild(totalAmountCell);
        totalRow.appendChild(emptyStatusCell);

        newTbody.appendChild(totalRow);
      }

      newTable.appendChild(newTbody);
    }

    // Step 4: Add to container
    const tableContainer = document.createElement('div');
    tableContainer.appendChild(newTable);

    printDiv.appendChild(header);
    if (newTable.querySelector('thead') || newTable.querySelector('tbody')) {
      printDiv.appendChild(tableContainer);
    } else {
      printDiv.appendChild(document.createTextNode('No data available'));
    }

    // Step 5: Append, generate canvas, then remove
    document.body.appendChild(printDiv);

    const canvas = await html2canvas(printDiv, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#fff',
      windowWidth: printDiv.scrollWidth,
    });

    document.body.removeChild(printDiv);

    // Step 6: Generate PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
    pdf.save(`expense_report_date_wise_${dayjs().format('YYYY-MM-DD')}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};


    const handleDownloadExcel = () => {
        if (!responseData?.data) return;

        const excelData = responseData.data.map((item: ExpenseItem, index: number) => ({
            "SL": index + 1,
            "Date": formatDate(item.date),
            "Category": item.expenseCategory.name,
            "Subcategory": item.expenseSubcategory.name,
            "Status": item.status,
            "Note": item.note || '-',
            "Amount": item.totalAmount
        }));

        excelData.push({
            "SL": "",
            "Date": "",
            "Category": "",
            "Subcategory": "",
            "Status": "",
            "Note": "Total",  // "Total" moved to Note column
            "Amount": calculateTotal()  // Total amount remains in Amount column
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Set column width for Amount column (optional, remove alignment as it's not supported)
        if (!worksheet['!cols']) worksheet['!cols'] = [];
        worksheet['!cols'][6] = { wch: 15 }; // Amount is now the 7th column (0-based index 6)

        // Add styling to the Total row (last row)
        const lastRow = excelData.length - 1;
        const totalNoteCell = XLSX.utils.encode_cell({ r: lastRow, c: 5 }); // Note column
        const totalAmountCell = XLSX.utils.encode_cell({ r: lastRow, c: 6 }); // Amount column

        worksheet[totalNoteCell].s = {
            font: { bold: true }
        };

        worksheet[totalAmountCell].s = {
            alignment: { horizontal: 'right' },
            font: { bold: true }
        };

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Expense Report");
        XLSX.writeFile(workbook, `expense_report_date_wise_${dayjs().format('YYYY-MM-DD')}.xlsx`);
    };

    const columns = [
        {
            key: 'sl',
            header: 'SL',
            render: (row: Record<string, unknown>, index: number) => index + 1
        },
        {
            key: 'date',
            header: 'Date',
            render: (row: Record<string, unknown>) => formatDate((row as unknown as ExpenseItem).date)
        },
        {
            key: 'category',
            header: 'Category',
            render: (row: Record<string, unknown>) => ((row as unknown) as ExpenseItem).expenseCategory.name
        },
        {
            key: 'subcategory',
            header: 'Subcategory',
            render: (row: Record<string, unknown>) => ((row as unknown) as ExpenseItem).expenseSubcategory.name
        },
        {
            key: 'note',
            header: 'Note',
            render: (row: Record<string, unknown>) => ((row as unknown) as ExpenseItem).note || '-'
        },
        {
            key: 'amount',
            header: 'Amount',
            render: (row: Record<string, unknown>) => `৳ ${((row as unknown) as ExpenseItem).totalAmount.toFixed(2)}/-`
        },
    ];

    return (
        <Box>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <FormControl sx={{ minWidth: 200 }} size="small">
                        <InputLabel id="category-filter-label">Category</InputLabel>
                        <Select
                            labelId="category-filter-label"
                            value={selectedCategory || "all"}
                            onChange={handleCategoryChange}
                            label="Category"
                        >
                            <MenuItem value="all">All Categories</MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 200 }} size="small" disabled={!selectedCategory && filteredSubcategories.length === 0}>
                        <InputLabel id="subcategory-filter-label">Subcategory</InputLabel>
                        <Select
                            labelId="subcategory-filter-label"
                            value={selectedSubcategory || "all"}
                            onChange={handleSubcategoryChange}
                            label="Subcategory"
                        >
                            <MenuItem value="all">All Subcategories</MenuItem>
                            {filteredSubcategories.map((subcategory) => (
                                <MenuItem key={subcategory.id} value={subcategory.id}>
                                    {subcategory.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>

                <div className="pb-6">
                    <h1 className="text-xl mb-2">Select Date range</h1>
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        height: 36
                    }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateRangePicker
                                value={dateRange}
                                onChange={(newValue) => {
                                    const safeRange: [Dayjs | null, Dayjs | null] = [
                                        newValue[0] ? dayjs(newValue[0]) : null,
                                        newValue[1] ? dayjs(newValue[1]) : null
                                    ];
                                    setDateRange(safeRange);
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        height: 36,
                                        '& input': {
                                            padding: '8px 12px',
                                            fontSize: '0.875rem'
                                        },
                                        '& fieldset': {
                                            top: 0 // Fixes alignment of the border
                                        }
                                    },
                                    '& .MuiInputAdornment-root': {
                                        marginTop: '0 !important' // Fixes icon alignment
                                    },
                                    '& .MuiButtonBase-root': {
                                        padding: '6px' // Adjusts calendar icon button size
                                    }
                                }}
                                slotProps={{
                                    textField: {
                                        size: 'small'
                                    },
                                    inputAdornment: {
                                        sx: {
                                            height: 36 // Makes sure the calendar icon aligns properly
                                        }
                                    }
                                }}
                            />
                        </LocalizationProvider>

                        <Button
                            variant="outlined"
                            onClick={handleResetDateFilter}
                            sx={{
                                height: 36,
                                minWidth: 'auto',
                                padding: '6px 12px'
                            }}
                        >
                            Reset
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<Download size={16} />}
                            onClick={handleDownloadPDF}
                            sx={{
                                bgcolor: 'error.main',
                                '&:hover': { bgcolor: 'error.dark' },
                                height: 36,
                                minWidth: 'auto',
                                padding: '6px 12px',
                                fontSize: '0.875rem'
                            }}
                        >
                            PDF
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Download size={16} />}
                            onClick={handleDownloadExcel}
                            sx={{
                                bgcolor: 'success.main',
                                '&:hover': { bgcolor: 'success.dark' },
                                height: 36,
                                minWidth: 'auto',
                                padding: '6px 12px',
                                fontSize: '0.875rem'
                            }}
                        >
                            Excel
                        </Button>
                    </Box>
                </div>
            </div>

            <Paper>
                {isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>
                        Error loading data
                    </Typography>
                ) : responseData?.data?.length === 0 ? (
                    <Typography color="textSecondary" sx={{ mt: 4, textAlign: "center" }}>
                        No data available
                    </Typography>
                ) : (
                    <div ref={tableRef}>
                        <ReusableTable
                            columns={columns}
                            data={responseData?.data || []}
                        />
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            p: 2,
                            backgroundColor: '#f5f5f5',
                            borderTop: '1px solid #e0e0e0'
                        }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Total: ৳ {calculateTotal().toFixed(2)}/-
                            </Typography>
                        </Box>
                    </div>
                )}
            </Paper>
        </Box>
    );
};

interface ExpenseReportCategoryWiseProps {
    dateRange: DateRange<Dayjs>;
    setDateRange: (value: DateRange<Dayjs>) => void;
    categories: Category[];
    selectedCategory: number | null;
    setSelectedCategory: (value: number | null) => void;
}

const ExpenseReportCategoryWise: React.FC<ExpenseReportCategoryWiseProps> = ({
    dateRange,
    setDateRange,
    setSelectedCategory
}) => {
    const tableRef = useRef<HTMLDivElement>(null);
    const { data: responseData, isLoading, isError, refetch } = useGetExpenseReportCategoryWiseQuery({
        fromDate: dateRange[0]?.format('YYYY-MM-DD') || '',
        toDate: dateRange[1]?.format('YYYY-MM-DD') || '',
       
    });

    const handleResetDateFilter = () => {
        setDateRange([dayjs(), dayjs()]);
        setSelectedCategory(null);
        refetch();
    };

    const calculateTotal = () => {
        if (!responseData?.data) return 0;
        return responseData.data.reduce((sum: number, item: CategoryWiseItem) => sum + item.totalAmount, 0);
    };

    const handleDownloadPDF = async () => {
    if (!tableRef.current) return;

    try {
        const printDiv = document.createElement('div');
        printDiv.style.padding = '20px';
        printDiv.style.fontFamily = 'Arial, sans-serif';

        const header = document.createElement('div');
        header.style.marginBottom = '20px';
        header.style.textAlign = 'center';

        const schoolName = document.createElement('h1');
        schoolName.textContent = 'School Name';
        schoolName.style.fontSize = '24px';
        schoolName.style.fontWeight = 'bold';
        schoolName.style.marginBottom = '10px';
        schoolName.style.textAlign = 'center';

        const reportTitle = document.createElement('h2');
        reportTitle.textContent = 'Expense Report (Category Wise)';
        reportTitle.style.fontSize = '20px';
        reportTitle.style.marginBottom = '10px';
        reportTitle.style.textAlign = 'center';

        const address = document.createElement('p');
        address.textContent = 'School Address, City, Country';
        address.style.marginBottom = '10px';
        address.style.textAlign = 'center';

        const dateRangeText = document.createElement('p');
        dateRangeText.textContent = `${dateRange[0]?.format('DD MMM YYYY')} to ${dateRange[1]?.format('DD MMM YYYY')} | Generated on ${dayjs().format('DD MMM YYYY')}`;
        dateRangeText.style.marginBottom = '20px';
        dateRangeText.style.textAlign = 'center';

        header.appendChild(schoolName);
        header.appendChild(reportTitle);
        header.appendChild(address);
        header.appendChild(dateRangeText);

        const originalTable = tableRef.current.querySelector('table');
        if (!originalTable) return;

        const newTable = document.createElement('table');
        newTable.style.border = '1px solid #000';
        newTable.style.borderCollapse = 'collapse';
        newTable.style.width = '100%';
        newTable.style.borderRadius = '0';
        newTable.style.overflow = 'hidden';

        // Create table header
        const newThead = document.createElement('thead');
        newThead.style.backgroundColor = '#f0f0f0';
        newThead.style.color = '#000';

        const headerRow = document.createElement('tr');
        headerRow.style.textAlign = 'center'; // Center header row content

        const slHeader = document.createElement('th');
        slHeader.textContent = 'SL';
        slHeader.style.border = '1px solid #000';
        slHeader.style.padding = '8px';
        slHeader.style.fontWeight = 'bold';
        headerRow.appendChild(slHeader);

        const categoryHeader = document.createElement('th');
        categoryHeader.textContent = 'Category';
        categoryHeader.style.border = '1px solid #000';
        categoryHeader.style.padding = '8px';
        categoryHeader.style.fontWeight = 'bold';
        headerRow.appendChild(categoryHeader);

        const amountHeader = document.createElement('th');
        amountHeader.textContent = 'Amount';
        amountHeader.style.border = '1px solid #000';
        amountHeader.style.padding = '8px';
        amountHeader.style.fontWeight = 'bold';
        headerRow.appendChild(amountHeader);

        newThead.appendChild(headerRow);
        newTable.appendChild(newThead);

        // Create table body
        const newTbody = document.createElement('tbody');

        if (responseData?.data) {
            responseData.data.forEach((item: CategoryWiseItem, index: number) => {
                const row = document.createElement('tr');
                row.style.textAlign = 'center'; // Center body row content

                const slCell = document.createElement('td');
                slCell.textContent = (index + 1).toString();
                slCell.style.border = '1px solid #000';
                slCell.style.padding = '8px';
                row.appendChild(slCell);

                const categoryCell = document.createElement('td');
                categoryCell.textContent = item.categoryName;
                categoryCell.style.border = '1px solid #000';
                categoryCell.style.padding = '8px';
                row.appendChild(categoryCell);

                const amountCell = document.createElement('td');
                amountCell.textContent = `৳ ${item.totalAmount.toFixed(2)}/-`;
                amountCell.style.border = '1px solid #000';
                amountCell.style.padding = '8px';
                row.appendChild(amountCell);

                newTbody.appendChild(row);
            });

            // Add total row
            const totalRow = document.createElement('tr');
            totalRow.style.fontWeight = 'bold';
            totalRow.style.backgroundColor = '#f0f0f0';
            totalRow.style.textAlign = 'center'; // Center total row content

            const emptyCell1 = document.createElement('td');
            emptyCell1.style.border = '1px solid #000';
            emptyCell1.style.padding = '8px';
            emptyCell1.textContent = '';

            const totalLabelCell = document.createElement('td');
            totalLabelCell.style.border = '1px solid #000';
            totalLabelCell.style.padding = '8px';
            totalLabelCell.textContent = 'Total';
            totalLabelCell.style.fontWeight = 'bold';

            const totalAmountCell = document.createElement('td');
            totalAmountCell.textContent = `৳ ${calculateTotal().toFixed(2)}/-`;
            totalAmountCell.style.border = '1px solid #000';
            totalAmountCell.style.padding = '8px';
            totalAmountCell.style.fontWeight = 'bold';

            totalRow.appendChild(emptyCell1);
            totalRow.appendChild(totalLabelCell);
            totalRow.appendChild(totalAmountCell);

            newTbody.appendChild(totalRow);
            newTable.appendChild(newTbody);
        }

        const tableContainer = document.createElement('div');
        tableContainer.appendChild(newTable);

        printDiv.appendChild(header);
        printDiv.appendChild(tableContainer);

        document.body.appendChild(printDiv);

        const canvas = await html2canvas(printDiv, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            ignoreElements: (element) => {
                return element.classList.contains('MuiTable-root');
            }
        });
        document.body.removeChild(printDiv);

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
        pdf.save(`expense_report_category_wise_${dayjs().format('YYYY-MM-DD')}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
};

    const handleDownloadExcel = () => {
        if (!responseData?.data) return;

        const excelData = responseData.data.map((item: CategoryWiseItem, index: number) => ({
            "SL": index + 1,
            "Category": item.categoryName,
            "Amount": item.totalAmount
        }));

        excelData.push({
            "SL": "",
            "Category": "Total",
            "Amount": calculateTotal()
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Expense Report (Category Wise)");
        XLSX.writeFile(workbook, `expense_report_category_wise_${dayjs().format('YYYY-MM-DD')}.xlsx`);
    };

    return (
        <Box>
            <div className="flex justify-end items-center">

                <div className="pb-6">
                    <h1 className="text-xl mb-2">Select Date range</h1>
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        height: 36
                    }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateRangePicker
                                value={dateRange}
                                onChange={(newValue) => {
                                    const safeRange: [Dayjs | null, Dayjs | null] = [
                                        newValue[0] ? dayjs(newValue[0]) : null,
                                        newValue[1] ? dayjs(newValue[1]) : null
                                    ];
                                    setDateRange(safeRange);
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        height: 36,
                                        '& input': {
                                            padding: '8px 12px',
                                            fontSize: '0.875rem'
                                        },
                                        '& fieldset': {
                                            top: 0 // Fixes alignment of the border
                                        }
                                    },
                                    '& .MuiInputAdornment-root': {
                                        marginTop: '0 !important' // Fixes icon alignment
                                    },
                                    '& .MuiButtonBase-root': {
                                        padding: '6px' // Adjusts calendar icon button size
                                    }
                                }}
                                slotProps={{
                                    textField: {
                                        size: 'small'
                                    },
                                    inputAdornment: {
                                        sx: {
                                            height: 36 // Makes sure the calendar icon aligns properly
                                        }
                                    }
                                }}
                            />
                        </LocalizationProvider>

                        <CancelButton
                            onClick={handleResetDateFilter}
                            sx={{
                                height: 36,
                                minWidth: 'auto',
                                padding: '6px 12px'
                            }}
                        >
                            Reset
                        </CancelButton>

                        <Button
                            variant="contained"
                            startIcon={<Download size={16} />}
                            onClick={handleDownloadPDF}
                            sx={{
                                bgcolor: 'error.main',
                                '&:hover': { bgcolor: 'error.dark' },
                                height: 36,
                                minWidth: 'auto',
                                padding: '6px 12px',
                                fontSize: '0.875rem'
                            }}
                        >
                            PDF
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Download size={16} />}
                            onClick={handleDownloadExcel}
                            sx={{
                                bgcolor: 'success.main',
                                '&:hover': { bgcolor: 'success.dark' },
                                height: 36,
                                minWidth: 'auto',
                                padding: '6px 12px',
                                fontSize: '0.875rem'
                            }}
                        >
                            Excel
                        </Button>
                    </Box>
                </div>
            </div>

            <Paper>
                {isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>
                        Error loading data
                    </Typography>
                ) : responseData?.data?.length === 0 ? (
                    <Typography color="textSecondary" sx={{ mt: 4, textAlign: "center" }}>
                        No data available
                    </Typography>
                ) : (
                    <div ref={tableRef}>
                        <ReusableTable<CategoryWiseItem>
                            columns={[
                                {
                                    key: 'sl',
                                    header: 'SL',
                                    render: (_row, index: number) => index + 1
                                },
                                {
                                    key: 'category',
                                    header: 'Category',
                                    render: (row) => row.categoryName
                                },
                                {
                                    key: 'amount',
                                    header: 'Amount',
                                    render: (row) => `৳ ${row.totalAmount.toFixed(2)}/-`
                                }
                            ]}
                            data={responseData?.data || []}
                        />
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            p: 2,
                            backgroundColor: '#f5f5f5',
                            borderTop: '1px solid #e0e0e0'
                        }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Total: ৳ {calculateTotal().toFixed(2)}/-
                            </Typography>
                        </Box>
                    </div>
                )}
            </Paper>
        </Box>
    );
};

const ExpenseReport = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [dateRange, setDateRange] = useState<DateRange<Dayjs>>([
        dayjs().startOf('month'),
        dayjs()
    ]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
    const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);

    // Fetch categories
    const { data: categoriesData } = useGetAllExpenseCategoriesQuery({});
    const categories = categoriesData?.data || [];

    // Fetch subcategories
    const { data: subcategoriesData } = useGetAllExpenseSubcategoriesQuery({});
    const allSubcategories = useMemo(() => subcategoriesData?.data || [], [subcategoriesData?.data]);

    // Filter subcategories based on selected category
    useEffect(() => {
        if (selectedCategory) {
            const filtered = allSubcategories.filter(
                (subcat: Subcategory) => subcat.expenseCategoryId === selectedCategory
            );
            setFilteredSubcategories(filtered);
            setSelectedSubcategory(null);
        } else {
            setFilteredSubcategories(allSubcategories);
        }
    }, [selectedCategory, allSubcategories]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Box>
            <PageHeader title="Expense Report" />

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Date Wise" />
                    <Tab label="Category Wise" />
                </Tabs>
            </Box>

            {activeTab === 0 ? (
                <ExpenseReportDateWise
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedSubcategory={selectedSubcategory}
                    setSelectedSubcategory={setSelectedSubcategory}
                    filteredSubcategories={filteredSubcategories}
                    categories={categories}
                />
            ) : (
                <ExpenseReportCategoryWise
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />
            )}
        </Box>
    );
};

export default ExpenseReport;