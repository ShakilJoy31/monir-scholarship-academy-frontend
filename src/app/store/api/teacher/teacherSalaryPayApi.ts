import { baseApi } from "../../rootApi/apiSlice";

export const teacherSalaryPayApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new teacher salary payment
    createTeacherSalaryPay: builder.mutation({
      query: (data) => ({
        url: "/teacher-salary-pay/create-teacher-salary-pay",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["teacherSalaryPay"],
    }),

    // Get all teacher salary payments with pagination and search
    getAllTeacherSalaryPays: builder.query({
      query: ({ page, size, search }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (size) params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/teacher-salary-pay/get-teacher-salary-pay-all?${params.toString()}`;
      },
      providesTags: ["teacherSalaryPay"],
    }),

    // Get single teacher salary payment by ID
    getTeacherSalaryPayById: builder.query({
      query: (id) => `/teacher-salary-pay/get-teacher-salary-pay-by-id/${id}`,
      providesTags: ["teacherSalaryPay"],
    }),

    // Update teacher salary payment by ID
    updateTeacherSalaryPay: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/teacher-salary-pay/update-teacher-salary-pay/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["teacherSalaryPay"],
    }),

    // Accept teacher salary payment by ID
    acceptTeacherSalaryPay: builder.mutation({
      query: (id) => ({
        url: `/teacher-salary-pay/accept-teacher-salary-pay/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["teacherSalaryPay", "account"],
    }),

    // Cancel teacher salary payment by ID
    cancelTeacherSalaryPay: builder.mutation({
      query: (id) => ({
        url: `/teacher-salary-pay/cancel-teacher-salary-pay/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["teacherSalaryPay"],
    }),

    // Accept bulk payment
    bulkAcceptTeacherSalaryPay: builder.mutation({
      query: (ids: number[]) => ({
        url: "/teacher-salary-pay/bulk-accept-teacher-salary-pay",
        method: "PUT",
        body: { ids },
      }),
      invalidatesTags: ["teacherSalaryPay", "account"],
    }),
    // Cancel bulk payment
    bulkCancelTeacherSalaryPay: builder.mutation({
      query: (ids: number[]) => ({
        url: "/teacher-salary-pay/bulk-cancel-teacher-salary-pay",
        method: "PUT",
        body: { ids },
      }),
      invalidatesTags: ["teacherSalaryPay"],
    }),

    // Delete teacher salary payment by ID
    deleteTeacherSalaryPay: builder.mutation({
      query: (id) => ({
        url: `/teacher-salary-pay/delete-teacher-salary-pay/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["teacherSalaryPay"],
    }),

    getTeacherUnpaidSalaryAssign: builder.query({
      query: (teacherId) => `/teacher-salary-assign/get-teacher-salary-assign-unpaid/${teacherId}`,
      providesTags: ["teacherSalaryAssign"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateTeacherSalaryPayMutation,
  useGetAllTeacherSalaryPaysQuery,
  useGetTeacherSalaryPayByIdQuery,
  useUpdateTeacherSalaryPayMutation,
  useAcceptTeacherSalaryPayMutation,
  useCancelTeacherSalaryPayMutation,
  useDeleteTeacherSalaryPayMutation,
  useGetTeacherUnpaidSalaryAssignQuery,
  useBulkAcceptTeacherSalaryPayMutation,
  useBulkCancelTeacherSalaryPayMutation,
} = teacherSalaryPayApi;