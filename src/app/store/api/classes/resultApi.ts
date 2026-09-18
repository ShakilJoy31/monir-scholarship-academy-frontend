// resultApi.ts
import { baseApi } from "../../rootApi/apiSlice";

export const resultApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new result
    createResult: builder.mutation({
      query: (data) => ({
        url: "/result/create-result",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["result"],
    }),

    createBulkResult: builder.mutation({
      query: (data) => ({
        url: "/result/create-bulk-result",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["result"],
    }),

    // Get all results with pagination and filters
    getAllResults: builder.query({
      query: ({ examId, classId, subjectId }) => {
        const params = new URLSearchParams();
        if (examId) params.append("examId", examId.toString());
        if (classId) params.append("classId", classId.toString());
        if (subjectId) params.append("subjectId", subjectId.toString());
        return `/result/get-result-all?${params.toString()}`;
      },
      providesTags: ["result"],
    }),

    // Get result by class
    getResultByClass: builder.query({
      query: ({ examId, classId }) => {
        const params = new URLSearchParams();
        if (examId) params.append("examId", examId.toString());
        if (classId) params.append("classId", classId.toString());
        return `/result/get-result-by-class?${params.toString()}`;
      },
      providesTags: ["result"],
    }),

    // Get result by student
    getResultByStudent: builder.query({
      query: ({ examId, classId, sessionId, roll }) => {
        const params = new URLSearchParams();
        if (examId) params.append("examId", examId.toString());
        if (classId) params.append("classId", classId.toString());
        if (sessionId) params.append("sessionId", sessionId.toString());
        if (roll) params.append("roll", roll.toString());
        return `/result/get-result-by-student?${params.toString()}`;
      },
      providesTags: ["result"],
    }),

    // Get single result by ID
    getResultById: builder.query({
      query: (id) => `/result/get-result-by-id/${id}`,
      providesTags: ["result"],
    }),

    // Get result by currently authenticated student (based on token/session)
getResultByMe: builder.query({
  query: ({ examId }) => {
    const params = new URLSearchParams();
    if (examId) params.append("examId", examId.toString());
    return `/result/get-result-by-me?${params.toString()}`;
  },
  providesTags: ["result"],
}),

    // Update result by ID
    updateResult: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/result/update-result/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["result"],
    }),

    // Delete result by ID
    deleteResult: builder.mutation({
      query: (id) => ({
        url: `/result/delete-result/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["result"],
    }),


      getStudentsForResult: builder.query({
      query: ({ classNameId, sessionId, subjectId }) => {
        const params = new URLSearchParams();
        if (classNameId) params.append("classNameId", classNameId.toString());
        if (sessionId) params.append("sessionId", sessionId.toString());
        if (subjectId) params.append("subjectId", subjectId.toString());
        return `/student/get-student-by-class?${params.toString()}`;
      },
      providesTags: ["result"],
    }),



  }),
});

export const {
  useCreateResultMutation,
  useGetAllResultsQuery,
  useGetResultByClassQuery,
  useGetResultByStudentQuery,
  useGetResultByMeQuery,
  useGetResultByIdQuery,
  useUpdateResultMutation,
  useDeleteResultMutation,
  useCreateBulkResultMutation,
  useGetStudentsForResultQuery
} = resultApi;