import { baseApi } from "../../rootApi/apiSlice";

export const hostelRoomApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new hostel room
    createHostelRoom: builder.mutation({
      query: (data) => ({
        url: "/hostel-room/create-hostel-room",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["hostelRoom"],
    }),

    // Get all hostel rooms with pagination and search
    getAllHostelRooms: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/hostel-room/get-hostel-room-all?${params.toString()}`;
      },
      providesTags: ["hostelRoom"],
    }),

    // Get single hostel room by ID
    getHostelRoomById: builder.query({
      query: (id) => `/hostel-room/get-hostel-room-by-id/${id}`,
      providesTags: ["hostelRoom"],
    }),

    // Update hostel room by ID
    updateHostelRoom: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/hostel-room/update-hostel-room/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["hostelRoom"],
    }),

    // Delete hostel room by ID
    deleteHostelRoom: builder.mutation({
      query: (id) => ({
        url: `/hostel-room/delete-hostel-room/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["hostelRoom"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateHostelRoomMutation,
  useGetAllHostelRoomsQuery,
  useGetHostelRoomByIdQuery,
  useUpdateHostelRoomMutation,
  useDeleteHostelRoomMutation,
} = hostelRoomApi;