import { baseApi } from "../../rootApi/apiSlice";

export const hostelApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new hostel
    createHostel: builder.mutation({
      query: (data) => ({
        url: "/hostel/create-hostel",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["hostel"],
    }),

    // Get all hostels with pagination and search
    getAllHostels: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/hostel/get-hostel-all?${params.toString()}`;
      },
      providesTags: ["hostel"],
    }),

    // Get single hostel by ID
    getHostelById: builder.query({
      query: (id) => `/hostel/get-hostel-by-id/${id}`,
      providesTags: ["hostel"],
    }),

    // Update hostel by ID
    updateHostel: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/hostel/update-hostel/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["hostel"],
    }),

    // Delete hostel by ID
    deleteHostel: builder.mutation({
      query: (id) => ({
        url: `/hostel/delete-hostel/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["hostel"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateHostelMutation,
  useGetAllHostelsQuery,
  useGetHostelByIdQuery,
  useUpdateHostelMutation,
  useDeleteHostelMutation,
} = hostelApi;