import { getUserData, removeToken, setToken } from "@/app/utils/helper/tokenHelper";
import { baseApi } from "../../rootApi/apiSlice";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Super Admin Login
    loginSuperAdmin: builder.mutation({
      query: (credentials) => ({
        url: "/super-admin/login-super-admin",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          setToken(data.accessToken);
          localStorage.setItem("user", JSON.stringify(data.data));
        } catch (error) {
          console.error(error);
        }
      },
    }),

    // School Admin Login
    loginSchoolAdmin: builder.mutation({
      query: (credentials) => ({
        url: "/school/login-school",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          setToken(data.accessToken);
          localStorage.setItem("user", JSON.stringify(data.data));
        } catch (error) {
          console.error(error);
        }
      },
    }),

    // Branch Admin Login
    loginBranchAdmin: builder.mutation({
      query: (credentials) => ({
        url: "/user/login-user",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          setToken(data.accessToken);
          localStorage.setItem("user", JSON.stringify(data.data));
        } catch (error) {
          console.error(error);
        }
      },
    }),

    // Teacher Login
    loginTeacher: builder.mutation({
      query: (credentials) => ({
        url: "/teacher/login-teacher",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          setToken(data.accessToken);
          localStorage.setItem("user", JSON.stringify(data.data));
        } catch (error) {
          console.error(error);
        }
      },
    }),

    // Student Login
    loginStudent: builder.mutation({
      query: (credentials) => ({
        url: "/student/login-student",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          setToken(data.accessToken);
          localStorage.setItem("user", JSON.stringify(data.data));
        } catch (error) {
          console.error(error);
        }
      },
    }),

    // Logout
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          removeToken();
          localStorage.removeItem("user");
        } catch (error) {
          console.error(error);
        }
      },
    }),

    // Get current user
    getCurrentUser: builder.query({
      query: () => "/me",
      transformResponse: (response) => {
        if (response?.data) {
          return response.data;
        }
        return getUserData();
      },
    }),
  }),
});

export const {
  useLoginSuperAdminMutation,
  useLoginSchoolAdminMutation,
  useLoginBranchAdminMutation,
  useLoginTeacherMutation,
  useLoginStudentMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
} = authApi;