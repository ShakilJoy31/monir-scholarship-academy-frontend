import { baseApi } from "../../rootApi/apiSlice";

export const bookApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new book
    createBook: builder.mutation({
      query: (data) => ({
        url: "/book/create-book",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["book"],
    }),

    // Get all books with pagination and search
    getAllBooks: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/book/get-book-all?${params.toString()}`;
      },
      providesTags: ["book"],
    }),

    // Get single book by ID
    getBookById: builder.query({
      query: (id) => `/book/get-book-by-id/${id}`,
      providesTags: ["book"],
    }),

    // Update book by ID
    updateBook: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/book/update-book/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["book"],
    }),

    // Delete book by ID
    deleteBook: builder.mutation({
      query: (id) => ({
        url: `/book/delete-book/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["book"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateBookMutation,
  useGetAllBooksQuery,
  useGetBookByIdQuery,
  useUpdateBookMutation,
  useDeleteBookMutation,
} = bookApi;