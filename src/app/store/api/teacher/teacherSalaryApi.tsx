import { TeacherSalaryAssignFormValues } from "@/app/super-admin/schemas/teacherSalaryAssign";
import { baseApi } from "../../rootApi/apiSlice";

export const teacherSalaryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new teacher salary
    createTeacherSalary: builder.mutation({
      query: (data) => ({
        url: "/teacher-salary/create-teacher-salary",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["teacherSalary"],
    }),

    // Get all teacher salaries with pagination and search
    getAllTeacherSalaries: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/teacher-salary/get-teacher-salary-all?${params.toString()}`;
      },
      providesTags: ["teacherSalary"],
    }),

    // Get a single teacher salary by ID
    getTeacherSalaryById: builder.query({
      query: (id) => `/teacher-salary/get-teacher-salary-by-id/${id}`,
      providesTags: ["teacherSalary"],
    }),

    // Update a teacher salary by ID
    updateTeacherSalary: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/teacher-salary/update-teacher-salary/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["teacherSalary"],
    }),

    // Delete a teacher salary by ID
    deleteTeacherSalary: builder.mutation({
      query: (id) => ({
        url: `/teacher-salary/delete-teacher-salary/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["teacherSalary"],
    }),

    // teacher salary assign
     createTeacherSalaryAssign: builder.mutation({
      query: (data) => ({
        url: "/teacher-salary-assign/create-teacher-salary-assign",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["teacherSalary"],
    }),

    // bulk teacher salary assign
     createBulkTeacherSalaryAssign: builder.mutation({
      query: (data: TeacherSalaryAssignFormValues) => ({
        url: "/teacher-salary-assign/bulk-teacher-salary-assign",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["teacherSalary"],
    }),

    // Get all with pagination and search
    getAllTeacherSalaryAssigns: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/teacher-salary-assign/get-teacher-salary-assign-all?${params.toString()}`;
      },
      providesTags: ["teacherSalary"],
    }),

    // Get all unpaid salary assigns for a teacher
    getUnpaidTeacherSalaryAssigns: builder.query({
      query: (teacherId) => `/teacher-salary-assign/get-teacher-salary-assign-unpaid/${teacherId}`,
      providesTags: ["teacherSalary"],
    }),

    // Get all paid salary assigns for a teacher
    getPaidTeacherSalaryAssigns: builder.query({
      query: (teacherId) => `/teacher-salary-assign/get-teacher-salary-assign-paid/${teacherId}`,
      providesTags: ["teacherSalary"],
    }),

    // Get single by ID
    getTeacherSalaryAssignById: builder.query({
      query: (id) => `/teacher-salary-assign/get-teacher-salary-assign-by-id/${id}`,
      providesTags: ["teacherSalary"],
    }),

    // Update
    updateTeacherSalaryAssign: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/teacher-salary-assign/update-teacher-salary-assign/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["teacherSalary"],
    }),

    // Delete
    deleteTeacherSalaryAssign: builder.mutation({
      query: (id) => ({
        url: `/teacher-salary-assign/delete-teacher-salary-assign/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["teacherSalary"],
    }),


    //teacher advance

      createTeacherSalaryAdvance: builder.mutation({
      query: (data) => ({
        url: "/teacher-salary-advance/create-teacher-salary-advance",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["teacherSalary"],
    }),

    // Get all with pagination and search
    getAllTeacherSalaryAdvances: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (search) params.append("search", search);
        return `/teacher-salary-advance/get-teacher-salary-advance-all?${params.toString()}`;
      },
      providesTags: ["teacherSalary"],
    }),

    // Get single by ID
    getTeacherSalaryAdvanceById: builder.query({
      query: (id) => `/teacher-salary-advance/get-teacher-salary-advance-by-id/${id}`,
      providesTags: ["teacherSalary"],
    }),

    // Update salary advance
    updateTeacherSalaryAdvance: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/teacher-salary-advance/update-teacher-salary-advance/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["teacherSalary"],
    }),

    // Accept salary advance
    acceptTeacherSalaryAdvance: builder.mutation({
      query: (id) => ({
        url: `/teacher-salary-advance/accept-teacher-salary-advance/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["teacherSalary"],
    }),

    // Cancel salary advance
    cancelTeacherSalaryAdvance: builder.mutation({
      query: (id) => ({
        url: `/teacher-salary-advance/cancel-teacher-salary-advance/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["teacherSalary"],
    }),

    // Delete salary advance
    deleteTeacherSalaryAdvance: builder.mutation({
      query: (id) => ({
        url: `/teacher-salary-advance/delete-teacher-salary-advance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["teacherSalary"],
    }),

  }),
});

// Export hooks for usage in components
export const {
  useCreateTeacherSalaryMutation,
  useGetAllTeacherSalariesQuery,
  useGetTeacherSalaryByIdQuery,
  useUpdateTeacherSalaryMutation,
  useDeleteTeacherSalaryMutation,
  //teacher salary assign apis
  useCreateTeacherSalaryAssignMutation,
  useGetAllTeacherSalaryAssignsQuery,
  useGetUnpaidTeacherSalaryAssignsQuery,
  useGetPaidTeacherSalaryAssignsQuery,
  useGetTeacherSalaryAssignByIdQuery,
  useUpdateTeacherSalaryAssignMutation,
  useDeleteTeacherSalaryAssignMutation,
  //teacher salary advance apis
  useCreateTeacherSalaryAdvanceMutation,
  useGetAllTeacherSalaryAdvancesQuery,
  useGetTeacherSalaryAdvanceByIdQuery,
  useUpdateTeacherSalaryAdvanceMutation,
  useAcceptTeacherSalaryAdvanceMutation,
  useCancelTeacherSalaryAdvanceMutation,
  useDeleteTeacherSalaryAdvanceMutation,
  useCreateBulkTeacherSalaryAssignMutation,
} = teacherSalaryApi;
