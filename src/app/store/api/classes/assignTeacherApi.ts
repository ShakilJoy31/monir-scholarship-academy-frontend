import { baseApi } from "../../rootApi/apiSlice";

export const assignTeacherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create new assign teacher
    createAssignTeacher: builder.mutation({
      query: (data) => ({
        url: "/assign-teacher/create-assign-teacher",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["assign-teacher"],
    }),

    // Get all assign teachers with pagination and search
    getAllAssignTeachers: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/assign-teacher/get-assign-teacher-all?${params.toString()}`;
      },
      providesTags: ["assign-teacher"],
    }),

    // Get assign teacher by ID
    getAssignTeacherById: builder.query({
      query: (id) => `/assign-teacher/get-assign-teacher-by-id/${id}`,
      providesTags: ["assign-teacher"],
    }),

    // Update assign teacher by ID
    updateAssignTeacher: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/assign-teacher/update-assign-teacher/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["assign-teacher"],
    }),

    // Delete assign teacher by ID
    deleteAssignTeacher: builder.mutation({
      query: (id) => ({
        url: `/assign-teacher/delete-assign-teacher/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["assign-teacher"],
    }),
  }),
});

export const {
  useCreateAssignTeacherMutation,
  useGetAllAssignTeachersQuery,
  useGetAssignTeacherByIdQuery,
  useUpdateAssignTeacherMutation,
  useDeleteAssignTeacherMutation,
} = assignTeacherApi;