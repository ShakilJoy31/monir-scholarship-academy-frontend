import { baseApi } from "../../rootApi/apiSlice";

export const expenseSubcategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // (POST) Create a new expense subcategory
    createExpenseSubcategory: builder.mutation({
      query: (data) => ({
        url: "/expense-subcategory/create-expense-subcategory",
        method: "POST",
        body: data, // expects: { name: string, expenseCategoryId: number }
      }),
      invalidatesTags: ["expense-subcategory"],
    }),

    // (GET) Get all expense subcategories with pagination and search
    getAllExpenseSubcategories: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/expense-subcategory/get-expense-subcategory-all?${params.toString()}`;
      },
      providesTags: ["expense-subcategory"],
    }),

    // (GET) Get a single expense subcategory by ID
    getExpenseSubcategoryById: builder.query({
      query: (id) => `/expense-subcategory/get-expense-subcategory-by-id/${id}`,
      providesTags: ["expense-subcategory"],
    }),

    // (PUT) Update an expense subcategory by ID
    updateExpenseSubcategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/expense-subcategory/update-expense-subcategory/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["expense-subcategory"],
    }),

    // (DELETE) Delete an expense subcategory by ID
    deleteExpenseSubcategory: builder.mutation({
      query: (id) => ({
        url: `/expense-subcategory/delete-expense-subcategory/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["expense-subcategory"],
    }),
  }),
});

// Export hooks
export const {
  useCreateExpenseSubcategoryMutation,
  useGetAllExpenseSubcategoriesQuery,
  useGetExpenseSubcategoryByIdQuery,
  useUpdateExpenseSubcategoryMutation,
  useDeleteExpenseSubcategoryMutation,
} = expenseSubcategoryApi;
