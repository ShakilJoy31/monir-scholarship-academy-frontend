import { baseApi } from "../../rootApi/apiSlice";

export const examFeesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create new exam fees
    createExamFees: builder.mutation({
      query: (data) => ({
        url: "/exam-fees/create-exam-fees",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["examFees"],
    }),

    // Get all exam fees with pagination and search
    getAllExamFees: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/exam-fees/get-exam-fees-all?${params.toString()}`;
      },
      providesTags: ["examFees"],
    }),

    // Get exam fees by ID
    getExamFeesById: builder.query({
      query: (id) => `/exam-fees/get-exam-fees-by-id/${id}`,
      providesTags: ["examFees"],
    }),

    // Update exam fees by ID
    updateExamFees: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/exam-fees/update-exam-fees/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["examFees"],
    }),

    // Delete exam fees by ID
    deleteExamFees: builder.mutation({
      query: (id) => ({
        url: `/exam-fees/delete-exam-fees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["examFees"],
    }),
  }),
});

export const {
  useCreateExamFeesMutation,
  useGetAllExamFeesQuery,
  useGetExamFeesByIdQuery,
  useUpdateExamFeesMutation,
  useDeleteExamFeesMutation,
} = examFeesApi;