import { baseApi } from "../../rootApi/apiSlice";

export const galleryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new gallery entry
    createGallery: builder.mutation({
      query: (data) => ({
        url: "/gallery/create-gallery",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["gallery"],
    }),

    // Get all gallery entries with pagination and search
    getAllGalleries: builder.query({
      query: ({ page = 1, size = 10, search = "", branchId }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/gallery/get-gallery-all?${params.toString()}&branchId=${branchId}`;
      },
      providesTags: ["gallery"],
    }),

    // Get single gallery entry by ID
    getGalleryById: builder.query({
      query: (id) => `/gallery/get-gallery-by-id/${id}`,
      providesTags: ["gallery"],
    }),

    // Update gallery entry by ID
    updateGallery: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/gallery/update-gallery/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["gallery"],
    }),

    // Delete gallery entry by ID
    deleteGallery: builder.mutation({
      query: (id) => ({
        url: `/gallery/delete-gallery/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["gallery"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateGalleryMutation,
  useGetAllGalleriesQuery,
  useGetGalleryByIdQuery,
  useUpdateGalleryMutation,
  useDeleteGalleryMutation,
} = galleryApi;