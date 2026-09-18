import { baseApi } from "../../rootApi/apiSlice";

export const accountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new account
    createAccount: builder.mutation({
      query: (data) => ({
        url: "/account/create-account",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["account"],
    }),

    // Get all accounts with pagination and search
    getAllAccounts: builder.query({
      query: ({ type }) => {
        const params = new URLSearchParams();
        if (type) params.append("type", type);
        return `/account/get-account-all?${params.toString()}`;
      },
      providesTags: ["account"],
    }),

    // Get single account by ID
    getAccountById: builder.query({
      query: (id) => `/account/get-account-by-id/${id}`,
      providesTags: ["account"],
    }),

    // Update account by ID
    updateAccount: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/account/update-account/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["account"],
    }),

    // Delete account by ID
    deleteAccount: builder.mutation({
      query: (id) => ({
        url: `/account/delete-account/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["account"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateAccountMutation,
  useGetAllAccountsQuery,
  useGetAccountByIdQuery,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} = accountApi;