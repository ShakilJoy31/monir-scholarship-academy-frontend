import { baseApi } from "../../rootApi/apiSlice";

export const expenseCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // (POST) Create a new expense category
    createExpenseCategory: builder.mutation({
      query: (data) => ({
        url: "/expense-category/create-expense-category",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["expense-category"],
    }),

    // (GET) Get all expense categories with pagination and search
    getAllExpenseCategories: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/expense-category/get-expense-category-all?${params.toString()}`;
      },
      providesTags: ["expense-category"],
    }),

    // (GET) Get expense category by ID
    getExpenseCategoryById: builder.query({
      query: (id) => `/expense-category/get-expense-category-by-id/${id}`,
      providesTags: ["expense-category"],
    }),

    // (PUT) Update expense category by ID
    updateExpenseCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/expense-category/update-expense-category/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["expense-category"],
    }),

    // (DELETE) Delete expense category by ID
    deleteExpenseCategory: builder.mutation({
      query: (id) => ({
        url: `/expense-category/delete-expense-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["expense-category"],
    }),
  }),
});

// Export hooks
export const {
  useCreateExpenseCategoryMutation,
  useGetAllExpenseCategoriesQuery,
  useGetExpenseCategoryByIdQuery,
  useUpdateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
} = expenseCategoryApi;
