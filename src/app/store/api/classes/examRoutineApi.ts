import { baseApi } from "../../rootApi/apiSlice";

export const examRoutingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create new exam routine
    createExamRouting: builder.mutation({
      query: (data) => ({
        url: "/exam-routing/create-exam-routing",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["exam-routine"],
    }),

    // Get all exam routines with pagination and search
    getAllExamRoutings: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/exam-routing/get-exam-routing-all?${params.toString()}`;
      },
      providesTags: ["exam-routine"],
    }),

    // Get filtered exam routines
    getExamRoutingFilter: builder.query({
      query: ({ 
        page = 1, 
        size = 10, 
        examName = "", 
        sessionYear = "", 
        section = "", 
        className = "", 
        stream = "" 
      }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (examName) params.append("examName", examName);
        if (sessionYear) params.append("sessionYear", sessionYear);
        if (section) params.append("section", section);
        if (className) params.append("className", className);
        if (stream) params.append("stream", stream);
        return `/exam-routing/get-exam-routing-filter?${params.toString()}`;
      },
      providesTags: ["exam-routine"],
    }),

    // Get exam routine by ID
    getExamRoutingById: builder.query({
      query: (id) => `/exam-routing/get-exam-routing-by-id/${id}`,
      providesTags: ["exam-routine"],
    }),

    // Update exam routine by ID
    updateExamRouting: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/exam-routing/update-exam-routing/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["exam-routine"],
    }),

    // Delete exam routine by ID
    deleteExamRouting: builder.mutation({
      query: (id) => ({
        url: `/exam-routing/delete-exam-routing/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["exam-routine"],
    }),
  }),
});

export const {
  useCreateExamRoutingMutation,
  useGetAllExamRoutingsQuery,
  useGetExamRoutingFilterQuery,
  useGetExamRoutingByIdQuery,
  useUpdateExamRoutingMutation,
  useDeleteExamRoutingMutation,
} = examRoutingApi;