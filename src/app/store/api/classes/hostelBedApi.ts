import { baseApi } from "../../rootApi/apiSlice";

export const hostelBedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new hostel bed
    createHostelBed: builder.mutation({
      query: (data) => ({
        url: "/hostel-bed/create-hostel-bed",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["hostelBed"],
    }),

    // Get all hostel beds with pagination and search
    getAllHostelBeds: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/hostel-bed/get-hostel-bed-all?${params.toString()}`;
      },
      providesTags: ["hostelBed"],
    }),

    // Get single hostel bed by ID
    getHostelBedById: builder.query({
      query: (id) => `/hostel-bed/get-hostel-bed-by-id/${id}`,
      providesTags: ["hostelBed"],
    }),

    // Update hostel bed by ID
    updateHostelBed: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/hostel-bed/update-hostel-bed/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["hostelBed"],
    }),

    // Delete hostel bed by ID
    deleteHostelBed: builder.mutation({
      query: (id) => ({
        url: `/hostel-bed/delete-hostel-bed/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["hostelBed"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateHostelBedMutation,
  useGetAllHostelBedsQuery,
  useGetHostelBedByIdQuery,
  useUpdateHostelBedMutation,
  useDeleteHostelBedMutation,
} = hostelBedApi;