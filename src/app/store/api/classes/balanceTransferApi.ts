// balanceTransferApi.ts
import { baseApi } from "../../rootApi/apiSlice";

export const balanceTransferApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new balance transfer
    createBalanceTransfer: builder.mutation({
      query: (data) => ({
        url: "/balance-transfer/create-balance-transfer",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["balanceTransfer"],
    }),

    // Get all balance transfers with pagination and search
    getAllBalanceTransfers: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/balance-transfer/get-balance-transfer-all?${params.toString()}`;
      },
      providesTags: ["balanceTransfer"],
    }),

    // Get single balance transfer by ID
    getBalanceTransferById: builder.query({
      query: (id) => `/balance-transfer/get-balance-transfer-by-id/${id}`,
      providesTags: ["balanceTransfer"],
    }),

    // Update balance transfer by ID
    updateBalanceTransfer: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/balance-transfer/update-balance-transfer/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["balanceTransfer"],
    }),

    // Accept balance transfer
    acceptBalanceTransfer: builder.mutation({
      query: (id) => ({
        url: `/balance-transfer/accept-balance-transfer/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["balanceTransfer"],
    }),

    // Cancel balance transfer
    cancelBalanceTransfer: builder.mutation({
      query: (id) => ({
        url: `/balance-transfer/cancel-balance-transfer/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["balanceTransfer"],
    }),

    // Delete balance transfer by ID
    deleteBalanceTransfer: builder.mutation({
      query: (id) => ({
        url: `/balance-transfer/delete-balance-transfer/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["balanceTransfer"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateBalanceTransferMutation,
  useGetAllBalanceTransfersQuery,
  useGetBalanceTransferByIdQuery,
  useUpdateBalanceTransferMutation,
  useAcceptBalanceTransferMutation,
  useCancelBalanceTransferMutation,
  useDeleteBalanceTransferMutation,
} = balanceTransferApi;