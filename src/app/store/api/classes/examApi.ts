import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { baseApi } from "../../rootApi/apiSlice";

export const examApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new exam
    createExam: builder.mutation({
      query: (data) => ({
        url: "/exam/create-exam",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["exam"],
    }),

    // Get all exams with pagination and search
    getAllExams: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        const branchIdFromUser = getUserInfoFromToken();
        const branchId = JSON.parse(localStorage?.getItem("selectedBranch"))?.id
        return `/exam/get-exam-all?${params.toString()}&branchId=${branchIdFromUser ? branchIdFromUser?.branchId : branchId}`;
      },
      providesTags: ["exam"],
    }),

    // Get single exam by ID
    getExamById: builder.query({
      query: (id) => `/exam/get-exam-by-id/${id}`,
      providesTags: ["exam"],
    }),

    // Update exam by ID
    updateExam: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/exam/update-exam/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["exam"],
    }),

    // Delete exam by ID
    deleteExam: builder.mutation({
      query: (id) => ({
        url: `/exam/delete-exam/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["exam"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateExamMutation,
  useGetAllExamsQuery,
  useGetExamByIdQuery,
  useUpdateExamMutation,
  useDeleteExamMutation,
} = examApi;