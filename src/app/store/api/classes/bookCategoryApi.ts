import { baseApi } from "../../rootApi/apiSlice";

export const bookCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new book category
    createBookCategory: builder.mutation({
      query: (data) => ({
        url: "/book-category/create-book-category",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["bookCategory"],
    }),

    // Get all book categories with pagination and search
    getAllBookCategories: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/book-category/get-book-category-all?${params.toString()}`;
      },
      providesTags: ["bookCategory"],
    }),

    // Get single book category by ID
    getBookCategoryById: builder.query({
      query: (id) => `/book-category/get-book-category-by-id/${id}`,
      providesTags: ["bookCategory"],
    }),

    // Update book category by ID
    updateBookCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/book-category/update-book-category/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["bookCategory"],
    }),

    // Delete book category by ID
    deleteBookCategory: builder.mutation({
      query: (id) => ({
        url: `/book-category/delete-book-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["bookCategory"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateBookCategoryMutation,
  useGetAllBookCategoriesQuery,
  useGetBookCategoryByIdQuery,
  useUpdateBookCategoryMutation,
  useDeleteBookCategoryMutation,
} = bookCategoryApi;