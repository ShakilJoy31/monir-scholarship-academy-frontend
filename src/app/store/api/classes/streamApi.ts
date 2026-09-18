import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { baseApi } from "../../rootApi/apiSlice";

export const streamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new stream
    createStream: builder.mutation({
      query: (data) => ({
        url: "/stream/create-stream",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["stream"],
    }),

    // Get all streams with pagination and search
    getAllStreams: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        const branchIdFromUser = getUserInfoFromToken();
        const branchId = JSON.parse(localStorage?.getItem("selectedBranch"))?.id
        return (`/stream/get-stream-all?${params.toString()}&branchId=${branchIdFromUser ? branchIdFromUser?.branchId : branchId}`);
      },
      providesTags: ["stream"],
    }),

    // Get single stream by ID
    getStreamById: builder.query({
      query: (id) => `/stream/get-stream-by-id/${id}`,
      providesTags: ["stream"],
    }),

    // Update stream by ID
    updateStream: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/stream/update-stream/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["stream"],
    }),

    // Delete stream by ID
    deleteStream: builder.mutation({
      query: (id) => ({
        url: `/stream/delete-stream/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["stream"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateStreamMutation,
  useGetAllStreamsQuery,
  useGetStreamByIdQuery,
  useUpdateStreamMutation,
  useDeleteStreamMutation,
} = streamApi;