import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { baseApi } from "../../rootApi/apiSlice";

export const pageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new page
    createPage: builder.mutation({
      query: (data) => ({
        url: "/page/create-page",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["page"],
    }),

    // Get all pages with pagination and search
    getAllPages: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        const branchIdFromUser = getUserInfoFromToken();
        const branchId = JSON.parse(localStorage?.getItem("selectedBranch"))?.id
        return (`/page/get-page-all?${params.toString()}&branchId=${branchIdFromUser ? branchIdFromUser?.branchId : branchId}`);
      },
      providesTags: ["page"],
    }),

    // Get single page by ID
    getPageById: builder.query({
      query: (id) => `/page/get-page-by-id/${id}`,
      providesTags: ["page"],
    }),

    // Update page by ID
    updatePage: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/page/update-page/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["page"],
    }),

    // Delete page by ID
    deletePage: builder.mutation({
      query: (id) => ({
        url: `/page/delete-page/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["page"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreatePageMutation,
  useGetAllPagesQuery,
  useGetPageByIdQuery,
  useUpdatePageMutation,
  useDeletePageMutation,
} = pageApi;