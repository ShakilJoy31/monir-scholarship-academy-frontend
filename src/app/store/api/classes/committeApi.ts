import { baseApi } from "../../rootApi/apiSlice";

export const committeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new committee
    createCommittee: builder.mutation({
      query: (data) => ({
        url: "/committee/create-committee",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["committee"],
    }),

    // Get all committees with pagination and search
    getAllCommittees: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/committee/get-committee-all?${params.toString()}`;
      },
      providesTags: ["committee"],
    }),

    // Get single committee by ID
    getCommitteeById: builder.query({
      query: (id) => `/committee/get-committee-by-id/${id}`,
      providesTags: ["committee"],
    }),

    // Update committee by ID
    updateCommittee: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/committee/update-committee/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["committee"],
    }),

    // Delete committee by ID
    deleteCommittee: builder.mutation({
      query: (id) => ({
        url: `/committee/delete-committee/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["committee"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateCommitteeMutation,
  useGetAllCommitteesQuery,
  useGetCommitteeByIdQuery,
  useUpdateCommitteeMutation,
  useDeleteCommitteeMutation,
} = committeeApi;