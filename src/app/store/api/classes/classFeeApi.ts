import { ClassBulkFeeAssignFormValues } from "@/app/super-admin/schemas/studentBulkClassFeeAssign";
import { baseApi } from "../../rootApi/apiSlice";

export const classFeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // (POST) Create a new class fee
    createClassFee: builder.mutation({
      query: (data) => ({
        url: "/class-fee/create-class-fee",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["class-fee"],
    }),

    // (GET) Get all class fees with pagination and search
    getAllClassFees: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/class-fee/get-class-fee-all?${params.toString()}`;
      },
      providesTags: ["class-fee"],
    }),

    // (GET) Get class fee by ID
    getClassFeeById: builder.query({
      query: (id) => `/class-fee/get-class-fee-by-id/${id}`,
      providesTags: ["class-fee"],
    }),

    // (PUT) Update class fee by ID
    updateClassFee: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/class-fee/update-class-fee/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["class-fee"],
    }),

    // (DELETE) Delete class fee by ID
    deleteClassFee: builder.mutation({
      query: (id) => ({
        url: `/class-fee/delete-class-fee/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["class-fee"],
    }),


    // class fee discount
    createClassFeeDiscount: builder.mutation({
      query: (data) => ({
        url: "/class-fee-discount/create-class-fee-discount",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["class-fee"],
    }),

    // (GET) Get all class fee discounts with pagination and search
    getAllClassFeeDiscounts: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/class-fee-discount/get-class-fee-discount-all?${params.toString()}`;
      },
      providesTags: ["class-fee"],
    }),

    // (GET) Get class fee discount by ID
    getClassFeeDiscountById: builder.query({
      query: (id) => `/class-fee-discount/get-class-fee-discount-by-id/${id}`,
      providesTags: ["class-fee"],
    }),

    // (PUT) Update class fee discount by ID
    updateClassFeeDiscount: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/class-fee-discount/update-class-fee-discount/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["class-fee"],
    }),

    // (DELETE) Delete class fee discount by ID
    deleteClassFeeDiscount: builder.mutation({
      query: (id) => ({
        url: `/class-fee-discount/delete-class-fee-discount/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["class-fee"],
    }),

    //class fee assign

    createClassFeeAssign: builder.mutation({
      query: (data) => ({
        url: "/class-fee-assign/create-class-fee-assign",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["class-fee"],
    }),

    createBulkClassFeeAssign: builder.mutation({
      query: (data: ClassBulkFeeAssignFormValues) => ({
        url: "/class-fee-assign/bulk-class-fee-assign",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["class-fee"],
    }),

    // (GET) Get all class fee assignments with pagination and search
    getAllClassFeeAssigns: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/class-fee-assign/get-class-fee-assign-all?${params.toString()}`;
      },
      providesTags: ["class-fee"],
    }),

    // (GET) Get all unpaid class fee assignments by teacher ID
    getUnpaidClassFeeAssignsByTeacher: builder.query({
      query: (studentId) => `/class-fee-assign/get-class-fee-assign-unpaid/${studentId}`,
      providesTags: ["class-fee"],
    }),

    // (GET) Get all paid class fee assignments by teacher ID
    getPaidClassFeeAssignsByTeacher: builder.query({
      query: (studentId) => `/class-fee-assign/get-class-fee-assign-paid/${studentId}`,
      providesTags: ["class-fee"],
    }),

    // (GET) Get class fee assign by ID
    getClassFeeAssignById: builder.query({
      query: (id) => `/class-fee-assign/get-class-fee-assign-by-id/${id}`,
      providesTags: ["class-fee"],
    }),

    // (PUT) Update class fee assign by ID
    updateClassFeeAssign: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/class-fee-assign/update-class-fee-assign/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["class-fee"],
    }),

    // (DELETE) Delete class fee assign by ID
    deleteClassFeeAssign: builder.mutation({
      query: (id) => ({
        url: `/class-fee-assign/delete-class-fee-assign/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["class-fee"],
    }),


  }),
});

// Export hooks
export const {
  useCreateClassFeeMutation,
  useGetAllClassFeesQuery,
  useGetClassFeeByIdQuery,
  useUpdateClassFeeMutation,
  useDeleteClassFeeMutation,
  //class fee discount
  useCreateClassFeeDiscountMutation,
  useGetAllClassFeeDiscountsQuery,
  useGetClassFeeDiscountByIdQuery,
  useUpdateClassFeeDiscountMutation,
  useDeleteClassFeeDiscountMutation,
  // class fee assign
  useCreateClassFeeAssignMutation,
  useGetAllClassFeeAssignsQuery,
  useGetUnpaidClassFeeAssignsByTeacherQuery,
  useGetPaidClassFeeAssignsByTeacherQuery,
  useGetClassFeeAssignByIdQuery,
  useUpdateClassFeeAssignMutation,
  useDeleteClassFeeAssignMutation,
  useCreateBulkClassFeeAssignMutation,
} = classFeeApi;
