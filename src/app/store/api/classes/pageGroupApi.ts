import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { baseApi } from "../../rootApi/apiSlice";

export const pageGroupApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new page group
    createPageGroup: builder.mutation({
      query: (data) => ({
        url: "/page-group/create-page-group",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["pageGroup"],
    }),

    // Get all page groups with pagination and search
    getAllPageGroups: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        const branchIdFromUser = getUserInfoFromToken();
        const branchId = JSON.parse(localStorage?.getItem("selectedBranch"))?.id
        return (`/page-group/get-page-group-all?${params.toString()}&branchId=${branchIdFromUser ? branchIdFromUser?.branchId : branchId}`);
      },
      providesTags: ["pageGroup"],
    }),

    // Get single page group by ID
    getPageGroupById: builder.query({
      query: (id) => `/page-group/get-page-group-by-id/${id}`,
      providesTags: ["pageGroup"],
    }),

    // Update page group by ID
    updatePageGroup: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/page-group/update-page-group/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["pageGroup"],
    }),

    // Delete page group by ID
    deletePageGroup: builder.mutation({
      query: (id) => ({
        url: `/page-group/delete-page-group/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["pageGroup"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreatePageGroupMutation,
  useGetAllPageGroupsQuery,
  useGetPageGroupByIdQuery,
  useUpdatePageGroupMutation,
  useDeletePageGroupMutation,
} = pageGroupApi;