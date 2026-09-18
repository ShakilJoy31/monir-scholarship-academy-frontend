/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState } from "react";
import { Box } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import dayjs, { Dayjs } from "dayjs";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { useLazyGetStaticsReportQuery } from "@/app/store/api/allReport/allReportApi";

const StaticsAllReports = () => {
  // 🗓️ Default date range = today
  const today = dayjs();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([today, today]);

  // 🧠 API call (manual trigger)
  const [getStaticsReport, { data, isLoading }] = useLazyGetStaticsReportQuery();

  // 🧩 Extract formatted dates
  const startDate = dateRange[0]?.format("YYYY-MM-DD") || "";
  const endDate = dateRange[1]?.format("YYYY-MM-DD") || "";

  // 🔍 Handle search button
  const handleSearch = () => {
    if (startDate && endDate) {
      getStaticsReport({ startDate, endDate });
    }
  };

  // 🔄 Handle reset button (sets today and fetches default data)
  const handleReset = () => {
    const today = dayjs();
    const defaultRange: [Dayjs, Dayjs] = [today, today];
    setDateRange(defaultRange);
    getStaticsReport({
      startDate: today.format("YYYY-MM-DD"),
      endDate: today.format("YYYY-MM-DD"),
    });
  };

  // ⚡ Fetch today's data on first render
  React.useEffect(() => {
    handleReset();
  }, []);

  const stats = [
    { title: "Class Fee Collection", value: data?.data?.monthlyFeeCollection || 0 },
    { title: "Exam Fee Collection", value: data?.data?.examFeeCollection || 0 },
    { title: "Hostel Fee Collection", value: data?.data?.hostelFeeCollection || 0 },
    { title: "Admission Fee Collection", value: data?.data?.admissionFeeCollection || 0 },
    { title: "Teacher Fee Collection", value: data?.data?.teacherSalary || 0 },
    { title: "Expense Fee Collection", value: data?.data?.expense || 0 },
    { title: "Cash On Hand Collection", value: data?.data?.cashOnHand || 0 },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* 🗓️ Date Range Picker + Buttons */}
      <h1 className="text-xl mb-2 font-semibold">Select Date Range</h1>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateRangePicker
            value={dateRange}
            onChange={(newValue) => {
              const safeRange: [Dayjs | null, Dayjs | null] = [
                newValue[0] ? dayjs(newValue[0]) : null,
                newValue[1] ? dayjs(newValue[1]) : null,
              ];
              setDateRange(safeRange);
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 36,
                "& input": {
                  padding: "8px 12px",
                  fontSize: "0.875rem",
                },
                "& fieldset": { top: 0 },
              },
              "& .MuiInputAdornment-root": { marginTop: "0 !important" },
              "& .MuiButtonBase-root": { padding: "6px" },
            }}
            slotProps={{
              textField: { size: "small" },
              inputAdornment: { sx: { height: 36 } },
            }}
          />
        </LocalizationProvider>

        {/* 🔍 Search Button */}
        <SubmitButton
          onClick={handleSearch}
          sx={{
            backgroundColor: "#035140",
            textTransform: "none",
            height: 36,
            "&:hover": { backgroundColor: "#046e57" },
          }}
        >
          Search
        </SubmitButton>

        {/* 🔄 Reset Button */}
        <CancelButton
          onClick={handleReset}
          sx={{
            textTransform: "none",
            color: "#035140",
            borderColor: "#035140",
            height: 36,
            "&:hover": { borderColor: "#046e57", color: "#046e57" },
          }}
        >
          Reset
        </CancelButton>
      </Box>

      {/* 📊 Stat Cards */}
      {isLoading ? (
        <main className="flex justify-center items-center h-40">{buttonLoader}</main>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition duration-200 flex justify-between items-start"
            >
              <div>
                <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-2">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaticsAllReports;
