import { baseApi } from "../../rootApi/apiSlice";

export const hostelResidentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new hostel resident
    createHostelResident: builder.mutation({
      query: (data) => ({
        url: "/hostel-resident/create-hostel-resident",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["hostelResident", "hostelBed"],
    }),

    // Get all hostel residents with pagination and search
    getAllHostelResidents: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/hostel-resident/get-hostel-resident-all?${params.toString()}`;
      },
      providesTags: ["hostelResident"],
    }),

    // Get single hostel resident by ID
    getHostelResidentById: builder.query({
      query: (id) => `/hostel-resident/get-hostel-resident-by-id/${id}`,
      providesTags: ["hostelResident"],
    }),

    // Update hostel resident by ID
    updateHostelResident: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/hostel-resident/update-hostel-resident/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["hostelResident"],
    }),

    // Delete hostel resident by ID
    deleteHostelResident: builder.mutation({
      query: (id) => ({
        url: `/hostel-resident/delete-hostel-resident/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["hostelResident"],
    }),

    // Delete hostel resident by ID
    exitHostelResident: builder.mutation({
      query: (id) => ({
        url: `/hostel-resident/exit-hostel-resident/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["hostelResident"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateHostelResidentMutation,
  useGetAllHostelResidentsQuery,
  useGetHostelResidentByIdQuery,
  useUpdateHostelResidentMutation,
  useDeleteHostelResidentMutation,
  useExitHostelResidentMutation,
} = hostelResidentApi;