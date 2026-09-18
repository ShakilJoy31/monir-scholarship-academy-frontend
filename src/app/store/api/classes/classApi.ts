import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { baseApi } from "../../rootApi/apiSlice";

export const classApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new teacher
    createClass: builder.mutation({
      query: (data) => ({
        url: "/class/create-class",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["class"],
    }),

    // Get all teachers with pagination and search
    getAllClass: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        const branchIdFromUser = getUserInfoFromToken();
        const branchId = JSON.parse(localStorage?.getItem("selectedBranch"))?.id
        return (`/class/get-class-all?${params.toString()}&branchId=${branchIdFromUser ? branchIdFromUser?.branchId : branchId}`);
      },
      providesTags: ["teacher"],
    }),

    // Get single teacher by ID
    getTeacherById: builder.query({
      query: (id) => `/teacher/get-teacher-by-id/${id}`,
      providesTags: ["teacher"],
    }),

    // Update teacher by ID
    updateClass: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/class/update-class/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["teacher"],
    }),

    // Delete teacher by ID
    deleteClass: builder.mutation({
      query: (id) => ({
        url: `/class/delete-class/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["class"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateClassMutation,
  useGetAllClassQuery,
  useGetTeacherByIdQuery,
  useUpdateClassMutation,
  useDeleteClassMutation,
} = classApi;