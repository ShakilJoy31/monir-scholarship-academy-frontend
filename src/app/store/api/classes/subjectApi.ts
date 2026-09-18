import { baseApi } from "../../rootApi/apiSlice";

export const subjectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new subject
    createSubject: builder.mutation({
      query: (data) => ({
        url: "/subject/create-subject",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["subject"],
    }),

    // Get all subjects with pagination and search
    getAllSubjects: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/subject/get-subject-all?${params.toString()}`;
      },
      providesTags: ["subject"],
    }),

    // Get single subject by ID
    getSubjectById: builder.query({
      query: (id) => `/subject/get-subject-by-id/${id}`,
      providesTags: ["subject"],
    }),

    // Update subject by ID
    updateSubject: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/subject/update-subject/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["subject"],
    }),

    // Delete subject by ID
    deleteSubject: builder.mutation({
      query: (id) => ({
        url: `/subject/delete-subject/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["subject"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateSubjectMutation,
  useGetAllSubjectsQuery,
  useGetSubjectByIdQuery,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectApi;