import { baseApi } from "../../rootApi/apiSlice";

export const designationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new designation
    createDesignation: builder.mutation({
      query: (data) => ({
        url: "/designation/create-designation",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["designation"],
    }),

    // Get all designations with pagination and search
    getAllDesignations: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/designation/get-designation-all?${params.toString()}`;
      },
      providesTags: ["designation"],
    }),

    // Get single designation by ID
    getDesignationById: builder.query({
      query: (id) => `/designation/get-designation-by-id/${id}`,
      providesTags: ["designation"],
    }),

    // Update designation by ID
    updateDesignation: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/designation/update-designation/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["designation"],
    }),

    // Delete designation by ID
    deleteDesignation: builder.mutation({
      query: (id) => ({
        url: `/designation/delete-designation/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["designation"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateDesignationMutation,
  useGetAllDesignationsQuery,
  useGetDesignationByIdQuery,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,
} = designationApi;