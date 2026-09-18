import { baseApi } from "../../rootApi/apiSlice";

export const schoolApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new school
    createSchool: builder.mutation({
      query: (data) => ({
        url: "/school/create-school",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["create-school"],
    }),

    // School login
    loginSchool: builder.mutation({
      query: (credentials) => ({
        url: "/school/login-school",
        method: "POST",
        body: credentials,
      }),
    }),

    // Change school password
    changeSchoolPassword: builder.mutation({
      query: (data) => ({
        url: "/school/change-password",
        method: "POST",
        body: data,
      }),
    }),

    // Get all schools with pagination and search
    getAllSchools: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/school/get-school-all?${params.toString()}`;
      },
      providesTags: ["create-school"],
    }),

    // Get a school by ID
    getSchoolById: builder.query({
      query: (id) => `/school/get-school-by-id/${id}`,
      providesTags: ["create-school"],
    }),

    // Update a school by ID
    updateSchool: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/school/update-school/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["create-school"],
    }),

    // Delete a school by ID
    deleteSchool: builder.mutation({
      query: (id) => ({
        url: `/school/delete-school/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["create-school"],
    }),
  }),
});

export const {
  useCreateSchoolMutation,
  useLoginSchoolMutation,
  useChangeSchoolPasswordMutation,
  useGetAllSchoolsQuery,
  useGetSchoolByIdQuery,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
} = schoolApi;