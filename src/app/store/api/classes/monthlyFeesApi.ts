import { baseApi } from "../../rootApi/apiSlice";

export const monthlyFeesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create new monthly fees
    createMonthlyFees: builder.mutation({
      query: (data) => ({
        url: "/monthly-fees/create-monthly-fees",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["monthlyFees"],
    }),

    // Get all monthly fees with pagination and search
    getAllMonthlyFees: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/monthly-fees/get-monthly-fees-all?${params.toString()}`;
      },
      providesTags: ["monthlyFees"],
    }),

    // Get monthly fees by ID
    getMonthlyFeesById: builder.query({
      query: (id) => `/monthly-fees/get-monthly-fees-by-id/${id}`,
      providesTags: ["monthlyFees"],
    }),

    // Update monthly fees by ID
    updateMonthlyFees: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/monthly-fees/update-monthly-fees/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["monthlyFees"],
    }),

    // Delete monthly fees by ID
    deleteMonthlyFees: builder.mutation({
      query: (id) => ({
        url: `/monthly-fees/delete-monthly-fees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["monthlyFees"],
    }),
  }),
});

export const {
  useCreateMonthlyFeesMutation,
  useGetAllMonthlyFeesQuery,
  useGetMonthlyFeesByIdQuery,
  useUpdateMonthlyFeesMutation,
  useDeleteMonthlyFeesMutation,
} = monthlyFeesApi;
