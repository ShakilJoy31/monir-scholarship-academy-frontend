import { baseApi } from "../../rootApi/apiSlice";

export const branchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new branch
    createBranch: builder.mutation({
      query: (data) => ({
        url: "/branch/create-branch",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["branch"],
    }),

    // Get all branches with pagination and search
    getAllBranches: builder.query({
      query: ({ page = 1, size = 10, search = "", id }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/branch/get-branch-all?${params.toString()}&id=${id}`;
      },
      providesTags: ["branch"],
    }),

    // Get single branch by ID
    getBranchById: builder.query({
      query: (id) => `/branch/get-branch-by-id/${id}`,
      providesTags: ["branch"],
    }),

    // Update branch by ID
    updateBranch: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/branch/update-branch/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["branch"],
    }),

    // Get single branch config
    getBranchConfig: builder.query({
      query: (id) => `/branch/get-branch-config?branchId=${id}`,
      providesTags: ["branchConfig"],
    }),

    // Update branch config
    updateBranchConfig: builder.mutation({
      query: ({ ...data }) => ({
        url: `/branch/update-branch-config`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["branchConfig"],
    }),

    // Delete branch by ID
    deleteBranch: builder.mutation({
      query: (id) => ({
        url: `/branch/delete-branch/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["branch"],
    }),

    // Get branch admin by ID
    getBranchAdminById: builder.query({
      query: (id) => `/user/get-user-by-id/${id}`,
      providesTags: ["user"],
    }),

    // Update branch admin
    updateBranchAdmin: builder.mutation({
      query: ({ id, ...data }) => {
        console.log("updateBranchAdmin", data)
        return ({
          url: `/user/update-user/${id}`,
          method: "PUT",
          body: data,
        })
      },
      invalidatesTags: ["user"],
    }),

    changePassword: builder.mutation({
      query: (data) => ({
        url: "/user/change-password",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["user"],
    }),

    // Student password changing....
    studentChangePassword: builder.mutation({
      query: (data) => ({
        url: "/student/change-password",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["user"],
    }),

    // Teacher cahnging password
    teacherChangePassword: builder.mutation({
      query: (data) => ({
        url: "/teacher/change-password",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["user"],
    }),

    // School chaging password...
    schoolChangePassword: builder.mutation({
      query: (data) => ({
        url: "/school/change-password",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["user"],
    }),

    // School chaging password...
    superAdminChangePassword: builder.mutation({
      query: (data) => ({
        url: "/super-admin/change-password",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["user"],
    }),

    // Get super admin by ID
    getSuperAdminById: builder.query({
      query: (id) => `/super-admin/get-super-admin-by-id/${id}`,
      providesTags: ["user"],
    }),

    // Update super admin by ID
    updateSuperAdmin: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/super-admin/update-super-admin/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["user"],
    }),


  }),
});

// Export hooks for usage in components
export const {
  useCreateBranchMutation,
  useGetAllBranchesQuery,
  useGetBranchByIdQuery,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useGetBranchAdminByIdQuery,
  useUpdateBranchAdminMutation,
  useChangePasswordMutation,
  useStudentChangePasswordMutation,
  useTeacherChangePasswordMutation,
  useSchoolChangePasswordMutation,
  useSuperAdminChangePasswordMutation,
  useGetSuperAdminByIdQuery,
  useUpdateSuperAdminMutation,
  useGetBranchConfigQuery,
  useUpdateBranchConfigMutation,
} = branchApi;