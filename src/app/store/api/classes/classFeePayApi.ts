// classFeePayApi.ts
import { baseApi } from "../../rootApi/apiSlice";

export const classFeePayApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new class fee payment
    createClassFeePay: builder.mutation({
      query: (data) => ({
        url: "/class-fee-pay/create-class-fee-pay",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["classFeePay"],
    }),

    // Get all class fee payments with pagination and search
    getAllClassFeePays: builder.query({
      query: ({ page, size, search }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (size) params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/class-fee-pay/get-class-fee-pay-all?${params.toString()}`;
      },
      providesTags: ["classFeePay"],
    }),

    // Get single class fee payment by ID
    getClassFeePayById: builder.query({
      query: (id) => `/class-fee-pay/get-class-fee-pay-by-id/${id}`,
      providesTags: ["classFeePay"],
    }),

    // Update class fee payment by ID
    updateClassFeePay: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/class-fee-pay/update-class-fee-pay/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["classFeePay"],
    }),

    // Accept class fee payment by ID
    acceptClassFeePay: builder.mutation({
      query: (id) => ({
        url: `/class-fee-pay/accept-class-fee-pay/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["classFeePay"],
    }),

    // Cancel class fee payment by ID
    cancelClassFeePay: builder.mutation({
      query: (id) => ({
        url: `/class-fee-pay/cancel-class-fee-pay/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["classFeePay"],
    }),

    bulkAcceptClassFeePay: builder.mutation({
      query: (ids: number[]) => ({
        url: "/class-fee-pay/bulk-accept-class-fee-pay",
        method: "PUT",
        body: { ids },
      }),
      invalidatesTags: ["classFeePay"],
    }),
    bulkCancelClassFeePay: builder.mutation({
      query: (ids: number[]) => ({
        url: "/class-fee-pay/bulk-cancel-class-fee-pay",
        method: "PUT",
        body: { ids },
      }),
      invalidatesTags: ["classFeePay"],
    }),

    // Delete class fee payment by ID
    deleteClassFeePay: builder.mutation({
      query: (id) => ({
        url: `/class-fee-pay/delete-class-fee-pay/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["classFeePay"],
    }),


  }),
});

// Export hooks for usage in components
export const {
  useCreateClassFeePayMutation,
  useGetAllClassFeePaysQuery,
  useGetClassFeePayByIdQuery,
  useUpdateClassFeePayMutation,
  useAcceptClassFeePayMutation,
  useCancelClassFeePayMutation,
  useDeleteClassFeePayMutation,
  useBulkAcceptClassFeePayMutation,
  useBulkCancelClassFeePayMutation,
} = classFeePayApi;