import { baseApi } from "../../rootApi/apiSlice";

export const scheduleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new schedule
    createSchedule: builder.mutation({
      query: (data) => ({
        url: "/schedule/create-schedule",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["schedule"],
    }),

    // Get all schedules with pagination and search
    getAllSchedules: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/schedule/get-schedule-all?${params.toString()}`;
      },
      providesTags: ["schedule"],
    }),

    // Get single schedule by ID
    getScheduleById: builder.query({
      query: (id) => `/schedule/get-schedule-by-id/${id}`,
      providesTags: ["schedule"],
    }),

    // Update schedule by ID
    updateSchedule: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/schedule/update-schedule/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["schedule"],
    }),

    // Delete schedule by ID
    deleteSchedule: builder.mutation({
      query: (id) => ({
        url: `/schedule/delete-schedule/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["schedule"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateScheduleMutation,
  useGetAllSchedulesQuery,
  useGetScheduleByIdQuery,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} = scheduleApi;