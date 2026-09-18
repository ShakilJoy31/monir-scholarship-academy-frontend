// features/hostelFeeDiscount/hostelFeeDiscountApi.ts
import { baseApi } from "../../rootApi/apiSlice";

export const hostelFeeDiscountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create hostel fee discount
    createHostelFeeDiscount: builder.mutation({
      query: (data) => ({
        url: "/hostel-fee-discount/create-hostel-fee-discount",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["hostelFeeDiscount"],
    }),

    // Get all hostel fee discounts with pagination and search
    getAllHostelFeeDiscounts: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/hostel-fee-discount/get-hostel-fee-discount-all?${params.toString()}`;
      },
      providesTags: ["hostelFeeDiscount"],
    }),

    // Get hostel fee discount by ID
    getHostelFeeDiscountById: builder.query({
      query: (id) => `/hostel-fee-discount/get-hostel-fee-discount-by-id/${id}`,
      providesTags: ["hostelFeeDiscount"],
    }),

    // Update hostel fee discount
    updateHostelFeeDiscount: builder.mutation({
      query: ({ id, data }) => ({
        url: `/hostel-fee-discount/update-hostel-fee-discount/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["hostelFeeDiscount"],
    }),

    // Delete hostel fee discount
    deleteHostelFeeDiscount: builder.mutation({
      query: (id) => ({
        url: `/hostel-fee-discount/delete-hostel-fee-discount/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["hostelFeeDiscount"],
    }),

    //hostel fee assign

    createHostelFeeAssign: builder.mutation({
      query: (data) => ({
        url: "/hostel-fee-assign/create-hostel-fee-assign",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["hostelFeeDiscount"],
    }),

    //hostel bulk fee assign
    createHostelBulkFeeAssign: builder.mutation({
      query: (data) => ({
        url: "/hostel-fee-assign/bulk-hostel-fee-assign",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["hostelFeeDiscount"],
    }),

    // Get all hostel fee assigns with pagination and search
    getAllHostelFeeAssigns: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/hostel-fee-assign/get-hostel-fee-assign-all?${params.toString()}`;
      },
      providesTags: ["hostelFeeDiscount"],
    }),

    // Get hostel fee assign by ID
    getHostelFeeAssignById: builder.query({
      query: (id) => `/hostel-fee-assign/get-hostel-fee-assign-by-id/${id}`,
      providesTags: ["hostelFeeDiscount"],
    }),

    // Update hostel fee assign
    updateHostelFeeAssign: builder.mutation({
      query: ({ id, data }) => ({
        url: `/hostel-fee-assign/update-hostel-fee-assign/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["hostelFeeDiscount"],
    }),

    // Delete hostel fee assign
    deleteHostelFeeAssign: builder.mutation({
      query: (id) => ({
        url: `/hostel-fee-assign/delete-hostel-fee-assign/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["hostelFeeDiscount"],
    }),

  }),
});

export const {
  useCreateHostelFeeDiscountMutation,
  useGetAllHostelFeeDiscountsQuery,
  useGetHostelFeeDiscountByIdQuery,
  useUpdateHostelFeeDiscountMutation,
  useDeleteHostelFeeDiscountMutation,
  // hostel fee assign
  useCreateHostelFeeAssignMutation,
  useGetAllHostelFeeAssignsQuery,
  useGetHostelFeeAssignByIdQuery,
  useUpdateHostelFeeAssignMutation,
  useDeleteHostelFeeAssignMutation,
  useCreateHostelBulkFeeAssignMutation,
} = hostelFeeDiscountApi;
