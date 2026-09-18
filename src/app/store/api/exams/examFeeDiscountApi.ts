import { ExamBulkFeeAssignFormValues } from "@/app/super-admin/schemas/examFees/examBulkFeeAssignSchema";
import { baseApi } from "../../rootApi/apiSlice";

export const examFeeDiscountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ✅ Create exam fee discount
    createExamFeeDiscount: builder.mutation({
      query: (data) => ({
        url: "/exam-fee-discount/create-exam-fee-discount",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["exam-fee"],
    }),

    // ✅ Get all exam fee discounts with optional query
    getAllExamFeeDiscounts: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/exam-fee-discount/get-exam-fee-discount-all?${params.toString()}`;
      },
      providesTags: ["exam-fee"],
    }),

    // ✅ Get single exam fee discount by ID
    getExamFeeDiscountById: builder.query({
      query: (id) => `/exam-fee-discount/get-exam-fee-discount-by-id/${id}`,
      providesTags: ["exam-fee"],
    }),

    // ✅ Update exam fee discount
    updateExamFeeDiscount: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/exam-fee-discount/update-exam-fee-discount/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["exam-fee"],
    }),

    // ✅ Delete exam fee discount
    deleteExamFeeDiscount: builder.mutation({
      query: (id) => ({
        url: `/exam-fee-discount/delete-exam-fee-discount/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["exam-fee"],
    }),

    //exam fee assign
    // ✅ Create exam fee assign
    createExamFeeAssign: builder.mutation({
      query: (data) => ({
        url: "/exam-fee-assign/create-exam-fee-assign",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["exam-fee"],
    }),

    // ✅ Create bulk exam fee assign
    createBulkExamFeeAssign: builder.mutation({
      query: (data: ExamBulkFeeAssignFormValues) => ({
        url: "/exam-fee-assign/bulk-exam-fee-assign",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["exam-fee"],
    }),

    // ✅ Get all exam fee assigns (paginated + searchable)
    getAllExamFeeAssigns: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/exam-fee-assign/get-exam-fee-assign-all?${params.toString()}`;
      },
      providesTags: ["exam-fee"],
    }),

    // ✅ Get unpaid exam fees by student ID
    getUnpaidExamFeesByStudentId: builder.query({
      query: (studentId) =>
        `/exam-fee-assign/get-exam-fee-assign-unpaid/${studentId}`,
      providesTags: ["exam-fee"],
    }),

    // ✅ Get paid exam fees by student ID
    getPaidExamFeesByStudentId: builder.query({
      query: (studentId) =>
        `/exam-fee-assign/get-exam-fee-assign-paid/${studentId}`,
      providesTags: ["exam-fee"],
    }),

    // ✅ Get single exam fee assign by ID
    getExamFeeAssignById: builder.query({
      query: (id) => `/exam-fee-assign/get-exam-fee-assign-by-id/${id}`,
      providesTags: ["exam-fee"],
    }),

    // ✅ Update exam fee assign
    updateExamFeeAssign: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/exam-fee-assign/update-exam-fee-assign/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["exam-fee"],
    }),

    // ✅ Delete exam fee assign
    deleteExamFeeAssign: builder.mutation({
      query: (id) => ({
        url: `/exam-fee-assign/delete-exam-fee-assign/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["exam-fee"],
    }),

    // exam pay apis
    // ✅ Create exam fee payment
    createExamFeePay: builder.mutation({
      query: (data) => ({
        url: "/exam-fee-pay/create-exam-fee-pay",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["exam-fee"],
    }),

    // ✅ Get all exam fee payments (with pagination and search)
    getAllExamFeePays: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/exam-fee-pay/get-exam-fee-pay-all?${params.toString()}`;
      },
      providesTags: ["exam-fee"],
    }),

    // ✅ Get single exam fee payment by ID
    getExamFeePayById: builder.query({
      query: (id) => `/exam-fee-pay/get-exam-fee-pay-by-id/${id}`,
      providesTags: ["exam-fee"],
    }),

    // ✅ Update exam fee payment
    updateExamFeePay: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/exam-fee-pay/update-exam-fee-pay/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["exam-fee"],
    }),

    // ✅ Accept payment
    acceptExamFeePay: builder.mutation({
      query: (id) => ({
        url: `/exam-fee-pay/accept-exam-fee-pay/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["exam-fee"],
    }),

    // ✅ Cancel payment
    cancelExamFeePay: builder.mutation({
      query: (id) => ({
        url: `/exam-fee-pay/cancel-exam-fee-pay/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["exam-fee"],
    }),
    // ✅ Accept bulk payment
    bulkAcceptExamFeePay: builder.mutation({
      query: (ids: number[]) => ({
        url: "/exam-fee-pay/bulk-accept-exam-fee-pay",
        method: "PUT",
        body: { ids },
      }),
      invalidatesTags: ["exam-fee"],
    }),
    // ✅ Cancel bulk payment
    bulkCancelExamFeePay: builder.mutation({
      query: (ids: number[]) => ({
        url: "/exam-fee-pay/bulk-cancel-exam-fee-pay",
        method: "PUT",
        body: { ids },
      }),
      invalidatesTags: ["exam-fee"],
    }),

    // ✅ Delete payment
    deleteExamFeePay: builder.mutation({
      query: (id) => ({
        url: `/exam-fee-pay/delete-exam-fee-pay/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["exam-fee"],
    }),

  }),
});

export const {
  useCreateExamFeeDiscountMutation,
  useGetAllExamFeeDiscountsQuery,
  useGetExamFeeDiscountByIdQuery,
  useUpdateExamFeeDiscountMutation,
  useDeleteExamFeeDiscountMutation,
  // exam fee assign
  useCreateExamFeeAssignMutation,
  useGetAllExamFeeAssignsQuery,
  useGetUnpaidExamFeesByStudentIdQuery,
  useGetPaidExamFeesByStudentIdQuery,
  useGetExamFeeAssignByIdQuery,
  useUpdateExamFeeAssignMutation,
  useDeleteExamFeeAssignMutation,
  useCreateBulkExamFeeAssignMutation,
  // exam fee
  useCreateExamFeePayMutation,
  useGetAllExamFeePaysQuery,
  useGetExamFeePayByIdQuery,
  useUpdateExamFeePayMutation,
  useAcceptExamFeePayMutation,
  useCancelExamFeePayMutation,
  useDeleteExamFeePayMutation,
  useBulkAcceptExamFeePayMutation,
  useBulkCancelExamFeePayMutation,
} = examFeeDiscountApi;