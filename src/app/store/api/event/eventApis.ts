// features/event/eventApi.ts
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { baseApi } from "../../rootApi/apiSlice";

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Event
    createEvent: builder.mutation({
      query: (data) => ({
        url: "/event/create-event",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["event"],
    }),

    // Get All Events
    getAllEvents: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        const branchIdFromUser = getUserInfoFromToken();
        const branchId = JSON.parse(localStorage?.getItem("selectedBranch"))?.id
        return (`/event/get-event-all?${params.toString()}&branchId=${branchIdFromUser ? branchIdFromUser?.branchId : branchId}`);
      },
      providesTags: ["event"],
    }),

    // Get Event by ID
    getEventById: builder.query({
      query: (id) => `/event/get-event-by-id/${id}`,
      providesTags: ["event"],
    }),

    // Update Event
    updateEvent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/event/update-event/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["event"],
    }),

    // Delete Event
    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/event/delete-event/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["event"],
    }),
  }),
});

export const {
  useCreateEventMutation,
  useGetAllEventsQuery,
  useGetEventByIdQuery,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventApi;
