import { baseApi } from "../../rootApi/apiSlice";

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ---------------- Teacher Time Endpoints ----------------
    createTeacherTime: builder.mutation({
      query: (data) => ({
        url: "/teacher-time/create-teacher-time",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["teacherTime"],
    }),

    getAllTeacherTime: builder.query({
      query: ({ page, size, search, }) => {
        return (
          `/teacher-time/get-teacher-time-all?page=${page}&size=${size}&search=${search ?? ""}`
        )
      },
      providesTags: ["teacherTime"],
    }),

    getTeacherTimeById: builder.query({
      query: (id) => `/teacher-time/get-teacher-time-by-id/${id}`,
      providesTags: ["teacherTime"],
    }),

    updateTeacherTime: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/teacher-time/update-teacher-time/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["teacherTime"],
    }),

    deleteTeacherTime: builder.mutation({
      query: (id) => ({
        url: `/teacher-time/delete-teacher-time/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["teacherTime"],
    }),

    // ---------------- Teacher Attendance Endpoints ----------------
    createTeacherAttendance: builder.mutation({
      query: (data) => ({
        url: "/teacher-attendance/create-multiple-teacher-attendance",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["teacherAttendance"],
    }),

    // ---------------- Student Time Endpoints ----------------
    createStudentTime: builder.mutation({
      query: (data) => ({
        url: "/student-time/create-student-time",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["studentTime"],
    }),

    getAllStudentTime: builder.query({
      query: ({ page, size, search, }) => `/student-time/get-student-time-all?page=${page}&size=${size}&search=${search ?? ""}`,
      providesTags: ["studentTime"],
    }),

    getStudentTimeById: builder.query({
      query: (id) => `/student-time/get-student-time-by-id/${id}`,
      providesTags: ["studentTime"],
    }),

    updateStudentTime: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/student-time/update-student-time/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["studentTime"],
    }),

    deleteStudentTime: builder.mutation({
      query: (id) => ({
        url: `/student-time/delete-student-time/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["studentTime"],
    }),

    // ---------------- Stidents Attendance Endpoints ----------------
    createStudentsAttendance: builder.mutation({
      query: (data) => ({
        url: "/student-attendance/create-multiple-student-attendance",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["studentsAttendance"],
    }),

    // ---------------- Student Attendance Reports ----------------
    getStudentAttendanceDailyReport: builder.query({
      query: ({date, sessionId, classId}) => `/student-attendance/get-student-attendance-daily-report?date=${date}&sessionYearId=${sessionId}&classNameId=${classId}`,
      providesTags: ["studentsAttendance"],
    }),
    getStudentAttendanceMonthlyReport: builder.query({
      query: ({fromDate,toDate, sessionYearId, classNameId}) => `/student-attendance/get-student-attendance-monthly-report?fromDate=${fromDate}&toDate=${toDate}&sessionYearId=${sessionYearId}&classNameId=${classNameId}`,
      providesTags: ["studentsAttendance"],
    }),
    getStudentAttendanceIndividualReport: builder.query({
      query: ({ studentId, fromDate, toDate }) =>
        `/student-attendance/get-student-attendance-individual-report?studentId=${studentId}&fromDate=${fromDate}&toDate=${toDate}`,
      providesTags: ["studentsAttendance"],
    }),

    // ---------------- Teacher Attendance Reports ----------------
    getTeacherAttendanceDailyReport: builder.query({
      query: ({date}) => `/teacher-attendance/get-teacher-attendance-daily-report?date=${date}`,
      providesTags: ["teacherAttendance"],
    }),
    getTeacherAttendanceMonthlyReport: builder.query({
      query: ({fromDate, toDate}) => `/teacher-attendance/get-teacher-attendance-monthly-report?fromDate=${fromDate}&toDate=${toDate}`,
      providesTags: ["teacherAttendance"],
    }),
    getTeacherAttendanceIndividualReport: builder.query({
      query: ({ teacherId, fromDate, toDate, page, size }) =>
        `/teacher-attendance/get-teacher-attendance-individual-report?teacherId=${teacherId}&fromDate=${fromDate}&toDate=${toDate}&page=${page}&size=${size}`,
      providesTags: ["teacherAttendance"],
    }),

  }),
});

// Export hooks for usage in components
export const {
  // ---------------- Teacher Time ---------------- //
  useCreateTeacherTimeMutation,
  useGetAllTeacherTimeQuery,
  useGetTeacherTimeByIdQuery,
  useUpdateTeacherTimeMutation,
  useDeleteTeacherTimeMutation,

  // ---------------- Teacher Attendance  ---------------- //
  useCreateTeacherAttendanceMutation,

  // ---------------- Student Time ---------------- //
  useCreateStudentTimeMutation,
  useGetAllStudentTimeQuery,
  useGetStudentTimeByIdQuery,
  useUpdateStudentTimeMutation,
  useDeleteStudentTimeMutation,

  // ---------------- Students Attendance ---------------- //
  useCreateStudentsAttendanceMutation,

  // ---------------- Student Attendance Reports ----------------
  useLazyGetStudentAttendanceDailyReportQuery,
  useLazyGetStudentAttendanceIndividualReportQuery,
  useLazyGetStudentAttendanceMonthlyReportQuery,

  // ---------------- Teacher Attendance Reports ----------------
  useLazyGetTeacherAttendanceDailyReportQuery,
  useLazyGetTeacherAttendanceMonthlyReportQuery,
  useLazyGetTeacherAttendanceIndividualReportQuery,

} = attendanceApi;
