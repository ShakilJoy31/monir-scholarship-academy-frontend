// features/admissionPeriod/admissionPeriodApi.ts
import { baseApi } from "../../rootApi/apiSlice";

export const admissionPeriodApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new admission period
    createAdmissionPeriod: builder.mutation({
      query: (data) => ({
        url: "/admission-period/create-admission-period",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["admissionPeriod"],
    }),

    // Get all admission periods with pagination and search
    getAllAdmissionPeriods: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/admission-period/get-admission-period-all?${params.toString()}`;
      },
      providesTags: ["admissionPeriod"],
    }),

    // Get admission period by ID
    getAdmissionPeriodById: builder.query({
      query: (id) => `/admission-period/get-admission-period-by-id/${id}`,
      providesTags: ["admissionPeriod"],
    }),

    // Get active admission period
    getActiveAdmissionPeriod: builder.query({
      query: () => {
        const branchId = JSON.parse(localStorage?.getItem("selectedBranch"))?.id

        return (
          `/admission-period/get-active-admission-period?branchId=${branchId}`
        )
      },
      providesTags: ["admissionPeriod"],
    }),

    // Update admission period by ID
    updateAdmissionPeriod: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admission-period/update-admission-period/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["admissionPeriod"],
    }),

    // Delete admission period by ID
    deleteAdmissionPeriod: builder.mutation({
      query: (id) => ({
        url: `/admission-period/delete-admission-period/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["admissionPeriod"],
    }),

    //online admission
    createOnlineAdmission: builder.mutation({
      query: (data) => ({
        url: "/online-admission/create-online-admission",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["admissionPeriod"],
    }),

    // Get all admissions with pagination and search
    getAllOnlineAdmissions: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/online-admission/get-online-admission-all?${params.toString()}`;
      },
      providesTags: ["admissionPeriod"],
    }),

    // Get a single admission by ID
    getOnlineAdmissionById: builder.query({
      query: (id) => `/online-admission/get-online-admission-by-id/${id}`,
      providesTags: ["admissionPeriod"],
    }),

    // Update admission by ID
    updateOnlineAdmission: builder.mutation({
      query: ({ id, data }) => ({
        url: `/online-admission/update-online-admission/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["admissionPeriod"],
    }),

    // Delete admission by ID
    deleteOnlineAdmission: builder.mutation({
      query: (id) => ({
        url: `/online-admission/delete-online-admission/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["admissionPeriod"],
    }),

    //admission fee
    createAdmissionFeePay: builder.mutation({
      query: (data) => ({
        url: "/admission-fee-pay/create-admission-fee-pay",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["admissionPeriod"],
    }),

    getAllAdmissionFeePay: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/admission-fee-pay/get-admission-fee-pay-all?${params.toString()}`;
      },
      providesTags: ["admissionPeriod"],
    }),

    getAdmissionFeePayById: builder.query({
      query: (id) => `/admission-fee-pay/get-admission-fee-pay-by-id/${id}`,
      providesTags: ["admissionPeriod"],
    }),

    updateAdmissionFeePay: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admission-fee-pay/update-admission-fee-pay/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["admissionPeriod"],
    }),

    acceptAdmissionFeePay: builder.mutation({
      query: (id) => ({
        url: `/admission-fee-pay/accept-admission-fee-pay/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["admissionPeriod"],
    }),

    cancelAdmissionFeePay: builder.mutation({
      query: (id) => ({
        url: `/admission-fee-pay/cancel-admission-fee-pay/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["admissionPeriod"],
    }),

    deleteAdmissionFeePay: builder.mutation({
      query: (id) => ({
        url: `/admission-fee-pay/delete-admission-fee-pay/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["admissionPeriod"],
    }),

    getAllUnpaidOnlineAdmissions: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/online-admission/get-unpaid-online-admission-all?${params.toString()}`;
      },
      providesTags: ["admissionPeriod"],
    }),

  }),
});

export const {
  useCreateAdmissionPeriodMutation,
  useGetAllAdmissionPeriodsQuery,
  useGetAdmissionPeriodByIdQuery,
  useGetActiveAdmissionPeriodQuery,
  useUpdateAdmissionPeriodMutation,
  useDeleteAdmissionPeriodMutation,
  //online admission
  useCreateOnlineAdmissionMutation,
  useGetAllOnlineAdmissionsQuery,
  useGetOnlineAdmissionByIdQuery,
  useUpdateOnlineAdmissionMutation,
  useDeleteOnlineAdmissionMutation,
  //online admission fee
  useCreateAdmissionFeePayMutation,
  useGetAllAdmissionFeePayQuery,
  useGetAdmissionFeePayByIdQuery,
  useUpdateAdmissionFeePayMutation,
  useAcceptAdmissionFeePayMutation,
  useCancelAdmissionFeePayMutation,
  useDeleteAdmissionFeePayMutation,
  useGetAllUnpaidOnlineAdmissionsQuery,
} = admissionPeriodApi;
