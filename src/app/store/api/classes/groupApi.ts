import { baseApi } from "../../rootApi/apiSlice";

export const groupSubjectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new group subject
    createGroupSubject: builder.mutation({
      query: (data) => ({
        url: "/group-subject/create-group-subject",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["groupSubject"],
    }),

    // Get all group subjects with pagination and search
  getAllGroupSubjects: builder.query({
  query: ({ page = 1, size = 10, search = "", classId }) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString());
    if (search) params.append("search", search);
    if (classId && classId !== 0) params.append("classId", classId.toString()); // Explicitly check for 0
    return `/group-subject/get-group-subject-all?${params.toString()}`;
  },
  providesTags: ["groupSubject"],
}),

    // Get single group subject by ID
    getGroupSubjectById: builder.query({
      query: (id) => `/group-subject/get-group-subject-by-id/${id}`,
      providesTags: ["groupSubject"],
    }),

    // Update group subject by ID
    updateGroupSubject: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/group-subject/update-group-subject/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["groupSubject"],
    }),

    // Delete group subject by ID
    deleteGroupSubject: builder.mutation({
      query: (id) => ({
        url: `/group-subject/delete-group-subject/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["groupSubject"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateGroupSubjectMutation,
  useGetAllGroupSubjectsQuery,
  useGetGroupSubjectByIdQuery,
  useUpdateGroupSubjectMutation,
  useDeleteGroupSubjectMutation,
} = groupSubjectApi;