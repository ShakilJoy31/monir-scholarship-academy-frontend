// features/smsTemplate/smsTemplateApi.ts
import { baseApi } from "../../rootApi/apiSlice";

export const smsTemplateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create SMS Template
    createSmsTemplate: builder.mutation({
      query: (data) => ({
        url: "/sms-template/create-sms-template",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["sms-template"],
    }),

    // Get All SMS Templates (with pagination and search)
    getAllSmsTemplates: builder.query({
      query: ({ page = 1, size = 10 }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        return `/sms-template/get-sms-template-all?${params.toString()}`;
      },
      providesTags: ["sms-template"],
    }),

    // Get Template by ID
    getSmsTemplateById: builder.query({
      query: (id) => `/sms-template/get-sms-template-by-id/${id}`,
      providesTags: ["sms-template"],
    }),

    // Update Template
    updateSmsTemplate: builder.mutation({
      query: ({ id, data }) => ({
        url: `/sms-template/update-sms-template/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["sms-template"],
    }),

    // Delete Template
    deleteSmsTemplate: builder.mutation({
      query: (id) => ({
        url: `/sms-template/delete-sms-template/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["sms-template"],
    }),
  }),
});

export const {
  useCreateSmsTemplateMutation,
  useGetAllSmsTemplatesQuery,
  useGetSmsTemplateByIdQuery,
  useUpdateSmsTemplateMutation,
  useDeleteSmsTemplateMutation,
} = smsTemplateApi;
