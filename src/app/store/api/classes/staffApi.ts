import { baseApi } from "../../rootApi/apiSlice";

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new staff
    createStaff: builder.mutation({
      query: (data) => ({
        url: "/staff/create-staff",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["staff"],
    }),

    // Get all staff with pagination and search
    getAllStaff: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/staff/get-staff-all?${params.toString()}`;
      },
      providesTags: ["staff"],
    }),

    // Get single staff by ID
    getStaffById: builder.query({
      query: (id) => `/staff/get-staff-by-id/${id}`,
      providesTags: ["staff"],
    }),

    // Update staff by ID
    updateStaff: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/staff/update-staff/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["staff"],
    }),

    // Delete staff by ID
    deleteStaff: builder.mutation({
      query: (id) => ({
        url: `/staff/delete-staff/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["staff"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateStaffMutation,
  useGetAllStaffQuery,
  useGetStaffByIdQuery,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} = staffApi;