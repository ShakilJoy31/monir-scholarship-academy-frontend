import { baseApi } from "../../rootApi/apiSlice";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create User
    createUser: builder.mutation({
      query: (data) => ({
        url: "/user/create-user",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["user"],
    }),

    // Get All Users
    getAllUsers: builder.query({
      query: ({ page, size, search }) => ({
        url: "/user/get-user-all",
        method: "GET",
        params: { page, size, search },
      }),
      providesTags: ["user"],
    }),

    // Get User by ID
    getUserById: builder.query({
      query: (id) => ({
        url: `/user/get-user-by-id/${id}`,
        method: "GET",
      }),
      providesTags: ["user"],
    }),

    // Update User
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/user/update-user/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["user"],
    }),

    // Delete User
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/user/delete-user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["user"],
    }),
  }),
});

// Export hooks
export const {
  useCreateUserMutation,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;