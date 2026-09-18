// hostelFeePayApi.ts
import { baseApi } from "../../rootApi/apiSlice";

export const hostelFeePayApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new hostel fee payment
    createHostelFeePay: builder.mutation({
      query: (data) => ({
        url: "/hostel-fee-pay/create-hostel-fee-pay",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["hostelFeePay"],
    }),

    // Get all hostel fee payments with pagination and search
    getAllHostelFeePays: builder.query({
      query: ({ page, size, search }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (size) params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/hostel-fee-pay/get-hostel-fee-pay-all?${params.toString()}`;
      },
      providesTags: ["hostelFeePay"],
    }),

    // Get single hostel fee payment by ID
    getHostelFeePayById: builder.query({
      query: (id) => `/hostel-fee-pay/get-hostel-fee-pay-by-id/${id}`,
      providesTags: ["hostelFeePay"],
    }),

    // Update hostel fee payment by ID
    updateHostelFeePay: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/hostel-fee-pay/update-hostel-fee-pay/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["hostelFeePay"],
    }),

    // Accept hostel fee payment by ID
    acceptHostelFeePay: builder.mutation({
      query: (id) => ({
        url: `/hostel-fee-pay/accept-hostel-fee-pay/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["hostelFeePay", "account"],
    }),

    // Cancel hostel fee payment by ID
    cancelHostelFeePay: builder.mutation({
      query: (id) => ({
        url: `/hostel-fee-pay/cancel-hostel-fee-pay/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["hostelFeePay"],
    }),

    // Accept bulk payment
    bulkAcceptHotelFeePay: builder.mutation({
      query: (ids: number[]) => ({
        url: "/hostel-fee-pay/bulk-accept-hostel-fee-pay",
        method: "PUT",
        body: { ids },
      }),
      invalidatesTags: ["hostelFeePay"],
    }),

    // Cancel bulk payment
    bulkCancelHotelFeePay: builder.mutation({
      query: (ids: number[]) => ({
        url: "/hostel-fee-pay/bulk-cancel-hostel-fee-pay",
        method: "PUT",
        body: { ids },
      }),
      invalidatesTags: ["hostelFeePay"],
    }),

    // Delete hostel fee payment by ID
    deleteHostelFeePay: builder.mutation({
      query: (id) => ({
        url: `/hostel-fee-pay/delete-hostel-fee-pay/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["hostelFeePay"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateHostelFeePayMutation,
  useGetAllHostelFeePaysQuery,
  useGetHostelFeePayByIdQuery,
  useUpdateHostelFeePayMutation,
  useAcceptHostelFeePayMutation,
  useCancelHostelFeePayMutation,
  useDeleteHostelFeePayMutation,
  useBulkAcceptHotelFeePayMutation,
  useBulkCancelHotelFeePayMutation,
} = hostelFeePayApi;