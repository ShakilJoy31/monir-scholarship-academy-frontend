import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { baseApi } from "../../rootApi/apiSlice";

export const noticeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Create a new notice
        createNotice: builder.mutation({
            query: (data) => ({
                url: "/notice/create-notice",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["notice"],
        }),

        // Get all notices with pagination and search
        getAllNotices: builder.query({
            query: ({ page = 1, size = 10, search = "", noticeType = "" }) => {
                const params = new URLSearchParams();
                params.append("page", page.toString());
                params.append("size", size.toString());
                if (search) params.append("search", search);
                if (noticeType) params.append("noticeType", noticeType);
                const branchIdFromUser = getUserInfoFromToken();
                const branchId = JSON.parse(localStorage?.getItem("selectedBranch"))?.id
                return (`/notice/get-notice-all?${params.toString()}&branchId=${branchIdFromUser ? branchIdFromUser?.branchId : branchId}`);
            },
            providesTags: ["notice"],
        }),

        // Get single notice by ID
        getNoticeById: builder.query({
            query: (id) => `/notice/get-notice-by-id/${id}`,
            providesTags: ["notice"],
        }),

        // Update notice by ID
        updateNotice: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/notice/update-notice/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["notice"],
        }),

        // Delete notice by ID
        deleteNotice: builder.mutation({
            query: (id) => ({
                url: `/notice/delete-notice/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["notice"],
        }),

        // Upload file endpoint
        uploadFile: builder.mutation({
            query: (formData) => ({
                url: "/document/upload",
                method: "POST",
                body: formData,
                headers: {
                    // Let browser set Content-Type with boundary automatically
                },
            }),
            transformResponse: (response: { success: boolean; data: string[] }) => {
                return {
                    success: response.success,
                    data: response.data // This will be the array of URLs
                };
            },
        }),

        
    }),
});

// Export hooks for usage in components
export const {
    useCreateNoticeMutation,
    useGetAllNoticesQuery,
    useGetNoticeByIdQuery,
    useUpdateNoticeMutation,
    useDeleteNoticeMutation,
    useUploadFileMutation, // Add the new hook export
} = noticeApi;