import { baseApi } from "../../rootApi/apiSlice";

export const expenseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // (POST) Create a new expense
    createExpense: builder.mutation({
      query: (data) => ({
        url: "/expense/create-expense",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["expense"],
    }),

    // (GET) Get all expenses with pagination and search
    getAllExpenses: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/expense/get-expense-all?${params.toString()}`;
        // return `/expense/expense-report-category-wise`;
      },
      providesTags: ["expense"],
    }),

    // (GET) Get single expense by ID
    getExpenseById: builder.query({
      query: (id) => `/expense/get-expense-by-id/${id}`,
      providesTags: ["expense"],
    }),

    // (GET) Report: Category-wise summary
    // getExpenseReportCategoryWise: builder.query({
    //   query: ({ category }) => ({
    //     url: `/expense/expense-report-category-wise`,
    //     params: {
    //       ...(category && { category })
    //     }
    //   }),
    //   providesTags: ["expense"],
    // }),

    // (GET) Report: Filtered by date/category/subcategory
    getExpenseReport: builder.query({
      query: ({ fromDate, toDate, category = null, subcategory = null }) => {
        const params = new URLSearchParams();
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        params.append("category", category);
        params.append("subcategory", subcategory);
        return `/expense/expense-report?${params.toString()}`;
      },
      providesTags: ["expense"],
    }),

    // (PUT) Update an expense
    updateExpense: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/expense/update-expense/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["expense"],
    }),

    // (PUT) Accept expense
    acceptExpense: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/expense/accept-expense/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["expense"],
    }),

    // (PUT) Cancel expense
    cancelExpense: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/expense/cancel-expense/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["expense"],
    }),

    // (DELETE) Delete expense
    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `/expense/delete-expense/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["expense"],
    }),

    getExpenseReportCategoryWise: builder.query({
    query: ({ fromDate, toDate = null }) => {
        const params = new URLSearchParams();
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        return `/expense/expense-report-category-wise?${params.toString()}`;
    },
    providesTags: ["expense"],
}),



    // Expense Report
    getExpensesReport: builder.query({
      query: () => `/expense/expense-report-category-wise`,
      providesTags: ["expense"],
    }),

    // (GET) Report: Filtered by date/category/subcategory
    getExpenseReportDateWise: builder.query({
      query: ({ fromDate, toDate, category = null, subcategory = null }) => {
        const params = new URLSearchParams();
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        params.append("category", category);
        params.append("subcategory", subcategory);
        return `/expense/expense-report?${params.toString()}`;
      },
      providesTags: ["expense"],
    }),

  }),
});

// Export hooks
export const {
  useCreateExpenseMutation,
  useGetAllExpensesQuery,
  useGetExpenseByIdQuery,
  useGetExpenseReportCategoryWiseQuery,
  useGetExpenseReportQuery,
  useUpdateExpenseMutation,
  useAcceptExpenseMutation,
  useCancelExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpensesReportQuery,
  useGetExpenseReportDateWiseQuery
} = expenseApi;
