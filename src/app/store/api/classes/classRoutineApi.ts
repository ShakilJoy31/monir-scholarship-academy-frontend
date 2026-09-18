import { baseApi } from "../../rootApi/apiSlice";

export const classRoutingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create new class routine
    createClassRouting: builder.mutation({
      query: (data) => ({
        url: "/class-routing/create-class-routing",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["class-routine"],
    }),

    // Get all class routines with pagination and search
    getAllClassRoutings: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/class-routing/get-class-routing-all?${params.toString()}`;
      },
      providesTags: ["class-routine"],
    }),

    // Get filtered class routines
    getClassRoutingFilter: builder.query({
      query: ({ 
        page = 1, 
        size = 10, 
        sessionYear = "", 
        section = "", 
        className = "", 
        stream = "" 
      }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (sessionYear) params.append("sessionYear", sessionYear);
        if (section) params.append("section", section);
        if (className) params.append("className", className);
        if (stream) params.append("stream", stream);
        return `/class-routing/get-class-routing-filter?${params.toString()}`;
      },
      providesTags: ["class-routine"],
    }),

    // Get class routine by ID
    getClassRoutingById: builder.query({
      query: (id) => `/class-routing/get-class-routing-by-id/${id}`,
      providesTags: ["class-routine"],
    }),

    // Update class routine by ID
    updateClassRouting: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/class-routing/update-class-routing/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["class-routine"],
    }),

    // Delete class routine by ID
    deleteClassRouting: builder.mutation({
      query: (id) => ({
        url: `/class-routing/delete-class-routing/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["class-routine"],
    }),
  }),
});

export const {
  useCreateClassRoutingMutation,
  useGetAllClassRoutingsQuery,
  useGetClassRoutingFilterQuery,
  useGetClassRoutingByIdQuery,
  useUpdateClassRoutingMutation,
  useDeleteClassRoutingMutation,
} = classRoutingApi;