import { baseApi } from "../../rootApi/apiSlice";

export const shelfApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new shelf
    createShelf: builder.mutation({
      query: (data) => ({
        url: "/shelf/create-shelf",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["shelf"],
    }),

    // Get all shelves with pagination and search
    getAllShelves: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/shelf/get-shelf-all?${params.toString()}`;
      },
      providesTags: ["shelf"],
    }),

    // Get single shelf by ID
    getShelfById: builder.query({
      query: (id) => `/shelf/get-shelf-by-id/${id}`,
      providesTags: ["shelf"],
    }),

    // Update shelf by ID
    updateShelf: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/shelf/update-shelf/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["shelf"],
    }),

    // Delete shelf by ID
    deleteShelf: builder.mutation({
      query: (id) => ({
        url: `/shelf/delete-shelf/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["shelf"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateShelfMutation,
  useGetAllShelvesQuery,
  useGetShelfByIdQuery,
  useUpdateShelfMutation,
  useDeleteShelfMutation,
} = shelfApi;