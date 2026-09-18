// features/event/a.ts
import { baseApi } from "../../rootApi/apiSlice";

export const allReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // class fee
    getUnpaidClassFee: builder.query({
      query: (id) => `/report/get-class-fee-unpaid-report/${id}`,
      providesTags: ["event"],
    }),

    getPaidClassFee: builder.query({
      query: (id) => `/report/get-class-fee-paid-report/${id}`,
      providesTags: ["event"],
    }),

    getSingleUnpaidClassFee: builder.query({
      query: (id) => `/report/get-class-fee-unpaid-report-by-student/${id}`,
      providesTags: ["event"],
    }),

    getSinglePaidClassFee: builder.query({
      query: (id) => `/report/get-class-fee-paid-report-by-student/${id}`,
      providesTags: ["event"],
    }),

    //exam fee
     getUnpaidExamFee: builder.query({
      query: (id) => `/report/get-exam-fee-unpaid-report/${id}`,
      providesTags: ["event"],
    }),

    getPaidExamFee: builder.query({
      query: (id) => `/report/get-exam-fee-paid-report/${id}`,
      providesTags: ["event"],
    }),

    getSingleUnpaidExamFee: builder.query({
      query: (id) => `/report/get-exam-fee-unpaid-report-by-student/${id}`,
      providesTags: ["event"],
    }),

    getSinglePaidExamFee: builder.query({
      query: (id) => `/report/get-exam-fee-paid-report-by-student/${id}`,
      providesTags: ["event"],
    }),

    // hostel
     getUnpaidHostelFee: builder.query({
      query: (id) => `/report/get-hostel-fee-unpaid-report/${id}`,
      providesTags: ["event"],
    }),

    getPaidHostelFee: builder.query({
      query: (id) => `/report/get-hostel-fee-paid-report/${id}`,
      providesTags: ["event"],
    }),

    getSingleUnpaidHostelFee: builder.query({
      query: (id) => `/report/get-hostel-fee-unpaid-report-by-student/${id}`,
      providesTags: ["event"],
    }),

    getSinglePaidHostelFee: builder.query({
      query: (id) => `/report/get-hostel-fee-paid-report-by-student/${id}`,
      providesTags: ["event"],
    }),

    // teacher
     getUnpaidTeacherFee: builder.query({
      query: () => `/report/get-teacher-salary-unpaid-report`,
      providesTags: ["event"],
    }),

    getPaidTeacherFee: builder.query({
      query: () => `/report/get-teacher-salary-paid-report`,
      providesTags: ["event"],
    }),

    getSingleUnpaidTeacherFee: builder.query({
      query: (id) => `/report/get-teacher-salary-unpaid-report-by-teacher/${id}`,
      providesTags: ["event"],
    }),

    getSinglePaidTeacherFee: builder.query({
      query: (id) => `/report/get-teacher-salary-paid-report-by-teacher/${id}`,
      providesTags: ["event"],
    }),

    // statics
getStaticsReport: builder.query({
  query: ({ startDate, endDate }) => {
    let url = `/report/get-statics-report`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return url;
  },
  providesTags: ["event"],
}),


  }),
});

export const {
    useGetUnpaidClassFeeQuery,
    useGetSingleUnpaidClassFeeQuery,
    useGetPaidClassFeeQuery,
    useGetSinglePaidClassFeeQuery,
    // exam fee
    useGetPaidExamFeeQuery,
    useGetSinglePaidExamFeeQuery,
    useGetUnpaidExamFeeQuery,
    useGetSingleUnpaidExamFeeQuery,
    //hotel fee
    useGetPaidHostelFeeQuery,
    useGetSinglePaidHostelFeeQuery,
    useGetUnpaidHostelFeeQuery,
    useGetSingleUnpaidHostelFeeQuery,
    //teacher fee
    useGetPaidTeacherFeeQuery,
    useGetSinglePaidTeacherFeeQuery,
    useGetUnpaidTeacherFeeQuery,
    useGetSingleUnpaidTeacherFeeQuery,
    // statics
    useGetStaticsReportQuery,
    useLazyGetStaticsReportQuery
} = allReportApi;
