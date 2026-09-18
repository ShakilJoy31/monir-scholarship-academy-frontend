import { baseApi } from "../../rootApi/apiSlice";

export const slotApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new slot
    createSlot: builder.mutation({
      query: (data) => ({
        url: "/slot/create-slot",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["slot"],
    }),

    // Get all slots with pagination and search
    getAllSlots: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/slot/get-slot-all?${params.toString()}`;
      },
      providesTags: ["slot"],
    }),

    // Get single slot by ID
    getSlotById: builder.query({
      query: (id) => `/slot/get-slot-by-id/${id}`,
      providesTags: ["slot"],
    }),

    // Update slot by ID
    updateSlot: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/slot/update-slot/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["slot"],
    }),

    // Delete slot by ID
    deleteSlot: builder.mutation({
      query: (id) => ({
        url: `/slot/delete-slot/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["slot"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateSlotMutation,
  useGetAllSlotsQuery,
  useGetSlotByIdQuery,
  useUpdateSlotMutation,
  useDeleteSlotMutation,
} = slotApi;