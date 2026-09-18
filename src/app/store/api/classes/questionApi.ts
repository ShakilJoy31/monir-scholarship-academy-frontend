import { baseApi } from "../../rootApi/apiSlice";

export const questionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new question
    createQuestion: builder.mutation({
      query: (data) => ({
        url: "/question/create-question",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["question"],
    }),

    // Get all questions with pagination and search
    getAllQuestions: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/question/get-question-all?${params.toString()}`;
      },
      providesTags: ["question"],
    }),

    // Get single question by ID
    getQuestionById: builder.query({
      query: (id) => `/question/get-question-by-id/${id}`,
      providesTags: ["question"],
    }),

    // Update question by ID
    updateQuestion: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/question/update-question/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["question"],
    }),

    // Delete question by ID
    deleteQuestion: builder.mutation({
      query: (id) => ({
        url: `/question/delete-question/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["question"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateQuestionMutation,
  useGetAllQuestionsQuery,
  useGetQuestionByIdQuery,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} = questionApi;