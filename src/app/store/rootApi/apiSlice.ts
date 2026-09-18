import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { appConfiguration } from "@/app/utils/constant/appConfiguration";
import { getToken } from "@/app/utils/helper/tokenHelper";

const BASE_URL = appConfiguration.baseUrl;

const customBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    const token = getToken();
    // If we have a token, set the authorization header
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Set content type to JSON
    //   const contentType = headers.get("Content-Type");
    // if (contentType === "application/json") {
    //   headers.delete("Content-Type");
    // }
    
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: customBaseQuery,
  endpoints: () => ({}),
  tagTypes: [
    "branch",
    "home-page-statics",
    "user",
    "teacher",
    "student",
    "class",
    "subject",
    "section",
    "stream",
    "exam",
    "file",
    "monthlyFees",
    "examFees",
    "class-routine",
    "notice",
    "schedule",
    "slot",
    "session",
    "designation",
    "assign-teacher",
    "groupSubject",
    "banner",
    "gallery",
    "staff",
    "committee",
    "exam-routine",
    "create-school",
    "account",
    "expense-category",
    "expense-subcategory",
    "teacherSalaryAssign",
    "balanceTransfer",
    "expense-category",
    "expense-subcategory",
    "account",
    "expense",
    "teacherSalary",
    "teacherSalaryPay",
    "class-fee",
    "classFeePay",
    "group-subject",
    "bookCategory",
    "shelf",
    "book",
    "hostel",
    "hostelRoom",
    "admissionPeriod",
    "hostelBed",
    "result",
    "hostelResident",
    "bookIssue",
    "hostelFeeDiscount",
    "sms-template",
    "question",
    "hostelFeePay",
    "event",
    "pageGroup",
    "page",
    "exam-fee",
    "teacherTime",
    "studentTime",
    "teacherAttendance",
    "studentsAttendance",
    "branchConfig",
  ],
});