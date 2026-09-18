// features/bookIssue/bookIssueApi.ts
import { baseApi } from "../../rootApi/apiSlice";

export const bookIssueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new book issue
    createBookIssue: builder.mutation({
      query: (data) => ({
        url: "/book-issue/create-book-issue",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["bookIssue"],
    }),

    // Get all book issues with pagination and search
    getAllBookIssues: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/book-issue/get-book-issue-all?${params.toString()}`;
      },
      providesTags: ["bookIssue"],
    }),


    // Create fine
    //  getAllBookIssues: builder.query({
    //   query: ({ page = 1, size = 10, search = "" }) => {
    //     const params = new URLSearchParams();
    //     params.append("page", page.toString());
    //     params.append("size", size.toString());
    //     if (search) params.append("search", search);
    //     return `/book-issue/get-fine-book-issue?${params.toString()}`;
    //   },
    //   providesTags: ["bookIssue"],
    // }),

    // Getting fine. 

    // Get all book issues with fine
    getFineBookIssues: builder.query({
      query: () => "/book-issue/get-fine-book-issue",
      providesTags: ["bookIssue"],
    }),

    // Pay fine for a book issue
    payBookFine: builder.mutation({
      query: ({ id, data }) => ({
        url: `/book-issue/book-fine-pay/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["bookIssue"],
    }),

    // Return a book issue
    returnBookIssue: builder.mutation({
      query: (id) => ({
        url: `/book-issue/return-book-issue/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["bookIssue"],
    }),

    // Get book issue by ID
    getBookIssueById: builder.query({
      query: (id) => `/book-issue/get-book-issue-by-id/${id}`,
      providesTags: ["bookIssue"],
    }),

    // Update a book issue
    updateBookIssue: builder.mutation({
      query: ({ id, data }) => ({
        url: `/book-issue/update-book-issue/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["bookIssue"],
    }),

    // Delete a book issue
    deleteBookIssue: builder.mutation({
      query: (id) => ({
        url: `/book-issue/delete-book-issue/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["bookIssue"],
    }),

    // Update a book issue
    returnBook: builder.mutation({
      query: ({ id, data }) => ({
        url: `/book-issue/return-book-issue/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["bookIssue"],
    }),
    
  }),
});

export const {
  useCreateBookIssueMutation,
  useGetAllBookIssuesQuery,
  useGetFineBookIssuesQuery,
  usePayBookFineMutation,
  useReturnBookIssueMutation,
  useGetBookIssueByIdQuery,
  useUpdateBookIssueMutation,
  useDeleteBookIssueMutation,
  useReturnBookMutation
} = bookIssueApi;
