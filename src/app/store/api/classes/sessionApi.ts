import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { baseApi } from "../../rootApi/apiSlice";

export const sessionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new session
    createSession: builder.mutation({
      query: (data) => ({
        url: "/session/create-session",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["session"],
    }),

    // Get all sessions with pagination and search
    getAllSessions: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        const branchIdFromUser = getUserInfoFromToken();
        const branchId = JSON.parse(localStorage?.getItem("selectedBranch"))?.id
        return (`/session/get-session-all?${params.toString()}&branchId=${branchIdFromUser ? branchIdFromUser?.branchId : branchId}`);
      },
      providesTags: ["session"],
    }),

    // Get single session by ID
    getSessionById: builder.query({
      query: (id) => `/session/get-session-by-id/${id}`,
      providesTags: ["session"],
    }),

    // Update session by ID
    updateSession: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/session/update-session/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["session"],
    }),

    // Delete session by ID
    deleteSession: builder.mutation({
      query: (id) => ({
        url: `/session/delete-session/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["session"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateSessionMutation,
  useGetAllSessionsQuery,
  useGetSessionByIdQuery,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
} = sessionApi;