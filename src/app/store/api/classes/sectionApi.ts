import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { baseApi } from "../../rootApi/apiSlice";

export const sectionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new section
    createSection: builder.mutation({
      query: (data) => ({
        url: "/section/create-section",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["section"],
    }),

    // Get all sections with pagination and search
    getAllSections: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        const branchIdFromUser = getUserInfoFromToken();
        const branchId = JSON.parse(localStorage?.getItem("selectedBranch"))?.id
        return (`/section/get-section-all?${params.toString()}&branchId=${branchIdFromUser ? branchIdFromUser?.branchId : branchId}`);
      },
      providesTags: ["section"],
    }),

    // Get single section by ID
    getSectionById: builder.query({
      query: (id) => `/section/get-section-by-id/${id}`,
      providesTags: ["section"],
    }),

    // Update section by ID
    updateSection: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/section/update-section/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["section"],
    }),

    // Delete section by ID
    deleteSection: builder.mutation({
      query: (id) => ({
        url: `/section/delete-section/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["section"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateSectionMutation,
  useGetAllSectionsQuery,
  useGetSectionByIdQuery,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
} = sectionApi;