import { baseApi } from "../../rootApi/apiSlice";

export const bannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new banner
    createBanner: builder.mutation({
      query: (data) => ({
        url: "/banner/create-banner",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["banner"],
    }),

    // Get all banners with pagination and search
    getAllBanners: builder.query({
      query: ({ page = 1, size = 10, search = "", branchId }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        // const branchId = JSON.parse(localStorage?.getItem("selectedBranch"))?.id

        return (`/banner/get-banner-all?${params.toString()}&branchId=${branchId}`);
      },
      providesTags: ["banner"],
    }),

    // Get single banner by ID
    getBannerById: builder.query({
      query: (id) => `/banner/get-banner-by-id/${id}`,
      providesTags: ["banner"],
    }),

    // Update banner by ID
    updateBanner: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/banner/update-banner/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["banner"],
    }),

    // Delete banner by ID
    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `/banner/delete-banner/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["banner"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateBannerMutation,
  useGetAllBannersQuery,
  useGetBannerByIdQuery,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannerApi;