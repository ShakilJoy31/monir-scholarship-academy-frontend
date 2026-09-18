import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import { baseApi } from "../../rootApi/apiSlice";

export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // Create a new student
    createStudent: builder.mutation({
      query: (data) => ({
        url: "/student/create-student",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["student"],
    }),

    // Student login
    loginStudent: builder.mutation({
      query: (credentials) => ({
        url: "/student/login-student",
        method: "POST",
        body: credentials,
      }),
    }),

    // Get all students with 
    getAllStudentsbyFilter: builder.query({
      query: ({
        page = 1,
        size = 10,
        search = "",
        sessionYear = "",
        className = "",
        section = "",
        stream = ""
      }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        if (sessionYear) params.append("sessionYear", sessionYear);
        if (className) params.append("className", className);
        if (section) params.append("section", section);
        if (stream) params.append("stream", stream);

        return `/student/get-student-filter?${params.toString()}`;
      },
      providesTags: ["student"],
    }),


    getAllStudents: builder.query({
      query: ({
        page = 1,
        size = 10,
        search = "",
        sessionId = null,
        classId = null
      }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        if (sessionId) params.append("sessionYearId", sessionId);
        if (classId) params.append("classNameId", classId);

        return `/student/get-student-all?${params.toString()}`;
      },
      providesTags: ["student"],
    }),

    getTopStudentsAll: builder.query({
      query: ({
        page = 1,
        size = 10,
        search = "",
      }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        const branchIdFromUser = getUserInfoFromToken();
        const branchId = JSON.parse(localStorage?.getItem("selectedBranch"))?.id
        return (`/student/get-top-student-all?${params.toString()}&branchId=${branchIdFromUser ? branchIdFromUser?.branchId : branchId}`);
      },
      providesTags: ["student"],
    }),

    // ✅ NEW: Get students with filters (sessionYear, section, className, stream)
    getFilteredStudents: builder.query({
      query: ({ page = 1, size = 10, sessionYear = "", section = "", className = "", stream = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (sessionYear) params.append("sessionYear", sessionYear);
        if (section) params.append("section", section);
        if (className) params.append("className", className);
        if (stream) params.append("stream", stream);
        return `/student/get-student-filter?${params.toString()}`;
      },
      providesTags: ["student"],
    }),

    // Get single student by ID
    getStudentById: builder.query({
      query: (id) => `/student/get-student-by-id/${id}`,
      providesTags: ["student"],
    }),

    // Update student by ID
    updateStudent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/student/update-student/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["student"],
    }),

    // Delete student by ID
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `/student/delete-student/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["student"],
    }),

    migrateStudent: builder.mutation({
      query: (data) => ({
        url: "/student/migrate-student",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["student"],
    }),

        // ✅ NEW: Get home page statistics
    getHomePageStatics: builder.query({
      query: () => {
        const branchId = JSON.parse(localStorage?.getItem("selectedBranch"))?.id
       return (`/dashboard/home-page-statics?branchId=${branchId}`)
      },
      providesTags: ["home-page-statics"]
    }),

     branchDashboardPageStatics: builder.query({
      query: () => "/dashboard/branch-admin-statics",
    }),

    getStudentsByClassForResult: builder.query({
      query: ({ classId, examId }) => {
        const params = new URLSearchParams();
        if (classId) params.append("classId", classId);
        if (examId) params.append("examId", examId);
        return `/result/get-result-by-class?${params.toString()}`;
      },
      providesTags: ["student"],
    }),

    getStudentByUniqueId: builder.query({
      query: ({ uniqueId }) => {
        return `/student/get-student-by-unique-id/${uniqueId}`;
      },
      providesTags: ["student"],
    }),



  }),
});

// Export hooks for usage in components
export const {
  useCreateStudentMutation,
  useLoginStudentMutation,
  useGetAllStudentsQuery,
  useGetTopStudentsAllQuery,
  useGetFilteredStudentsQuery, 
  useLazyGetFilteredStudentsQuery,
  useGetStudentByIdQuery,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useMigrateStudentMutation,
  useGetAllStudentsbyFilterQuery,
  useGetHomePageStaticsQuery,
  useGetStudentsByClassForResultQuery,
  useGetStudentByUniqueIdQuery,
  useBranchDashboardPageStaticsQuery
} = studentApi;
