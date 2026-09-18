// components/pageComponents/dashboard/admin/event/AddEditEvent.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Typography,
  IconButton,
  Box,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { XCircle } from "lucide-react";
import { useAddThumbnailMutation } from "@/app/store/api/file/fileApi";
import { theStar } from "@/lib/requiredJSX";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { EventFormValues } from "@/app/super-admin/schemas/event/eventSchema";
import { ZodType } from "zod";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import Image from "next/image";
import { zodCustomResolver } from "../admission/AddEditAdmissionOnlineFee";



interface FormField {
  name: keyof EventFormValues;
  label: string;
  gridWidth: number;
  type?: "text" | "number" | "date" | "select" | "checkbox";
  options?: { value: string | number; label: string }[];
  onChange?: (value: string | number) => void;
  disabled?: boolean;
  required?: boolean;
}

interface AddEditEventProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormValues) => void;
  currentData: { id: number | null; data: EventFormValues } | null;
  isLoading: boolean;
  error: string | null;
  onErrorDismiss: () => void;
  title: string;
  schema: ZodType<EventFormValues>;
  defaultValues: EventFormValues;
  formFields: FormField[];
  additionalContent?: React.ReactNode;
}

const AddEditEvent = ({
  open,
  onClose,
  onSubmit,
  currentData,
  isLoading,
  error,
  onErrorDismiss,
  title,
  schema,
  defaultValues,
  formFields,
  additionalContent,
}: AddEditEventProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EventFormValues>({
    resolver: zodCustomResolver(schema),
    defaultValues: currentData?.data || defaultValues,
  });

  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [localUploadedImage, setLocalUploadedImage] = useState<File | undefined>(undefined);
  const [addThumbnail] = useAddThumbnailMutation();
  const [isUploading, setIsUploading] = useState(false);

  const startDate = watch("startDate");
  const endDate = watch("endDate");
console.log(endDate)
  // Initialize form with current data or defaults
  useEffect(() => {
    if (currentData) {
      reset(currentData.data);
      if (currentData.data.image) {
        setLocalPreview(currentData.data.image);
      }
    } else {
      reset(defaultValues);
      setLocalPreview(null);
    }
  }, [currentData, reset, defaultValues]);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (localPreview && localPreview.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setLocalUploadedImage(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setLocalPreview(previewUrl);
      // Only update the image field, leave other fields unchanged
      setValue("image", previewUrl, { shouldDirty: true });
    }
  }, [setValue]);

  const handleRemoveImage = useCallback(() => {
    if (localPreview && localPreview.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(null);
    setLocalUploadedImage(undefined);
    // Only update the image field, leave other fields unchanged
    setValue("image", "", { shouldDirty: true });
  }, [localPreview, setValue]);

  const handleFormSubmit = async (data: EventFormValues) => {
    try {
      // Validate date range
      if (new Date(data.startDate) > new Date(data.endDate)) {
        toastShowing(
          "End date must be after start date",
          "bottom-right",
          2000,
          "red",
          "white"
        );
        return;
      }

      // Handle image upload if there's a new image
      let imageUrl = currentData?.data.image || "";
      if (localUploadedImage) {
        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append("photo", localUploadedImage);
          const response = await addThumbnail(formData).unwrap();
          imageUrl = response?.data?.[0] || "";
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          toastShowing(
            "Failed to upload image",
            "bottom-right",
            2000,
            "red",
            "white"
          );
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // Submit the form with all data including the image URL
      onSubmit({
        ...data,
        image: imageUrl,
      });
    } catch (err) {
      console.error("Error in form submission:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: "white",
          color: "black",
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <IconButton onClick={onClose} sx={{ color: "red" }}>
          <XCircle />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" onClose={onErrorDismiss} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Special row for title, description, and location */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {formFields
                .filter((field) =>
                  ["title", "description", "location"].includes(field.name)
                )
                .map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <Controller
                      name={field.name}
                      control={control}
                      render={({ field: { onChange, value, ref } }) => (
                        <div>
                          <label className="font-semibold text-sm md:text-base block mb-1">
                            {field.label}
                            {field.required && theStar}
                          </label>
                          <input
                            ref={ref}
                            type="text"
                            value={String(value || "")}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={field.label}
                            className="w-full p-2 text-sm md:text-base rounded border border-gray-300"
                          />
                          {errors[field.name]?.message && (
                            <div className="text-red-500 text-xs md:text-sm mt-1">
                              {errors[field.name]?.message as string}
                            </div>
                          )}
                        </div>
                      )}
                    />
                  </div>
                ))}
            </div>

            {/* Render the rest of the fields */}
            {formFields
              .filter(
                (field) =>
                  !["title", "description", "location"].includes(field.name)
              )
              .map((field) => (
                <div
                  key={field.name}
                  className={`${
                    field.gridWidth === 12
                      ? "col-span-1 md:col-span-2"
                      : "col-span-1"
                  }`}
                >
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: { onChange, value, ref } }) => (
                      <div>
                        {field.type === "checkbox" ? (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={Boolean(value)}
                                onChange={(e) => onChange(e.target.checked)}
                                color="primary"
                              />
                            }
                            label={
                              <span className="font-semibold text-sm md:text-base">
                                {field.label}
                                {field.required && theStar}
                              </span>
                            }
                          />
                        ) : (
                          <>
                            <label className="font-semibold text-sm md:text-base">
                              {field.label}
                              {field.required && theStar}
                            </label>
                            {field.type === "select" ? (
                              <select
                                ref={ref}
                                value={value?.toString() || ""}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  onChange(newValue);
                                  if (field.onChange) field.onChange(newValue);
                                }}
                                disabled={field.disabled}
                                className={`w-full p-2 text-sm md:text-base rounded border border-gray-300 mt-1 ${
                                  field.disabled ? "bg-gray-100" : "bg-white"
                                }`}
                              >
                                <option value="">Select {field.label}</option>
                                {field.options?.map((option) => (
                                  <option
                                    key={option.value.toString()}
                                    value={option.value.toString()}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : field.type === "date" ? (
                              <input
                                type="date"
                                value={value?.toString().substring(0, 10) || ""}
                                onChange={(e) => {
                                  const dateValue = e.target.value
                                    ? new Date(e.target.value)
                                        .toISOString()
                                        .split("T")[0]
                                    : "";
                                  onChange(dateValue);
                                }}
                                min={
                                  field.name === "endDate" && startDate
                                    ? startDate.substring(0, 10)
                                    : undefined
                                }
                                className="w-full p-2 text-sm md:text-base rounded border border-gray-300 mt-1"
                              />
                            ) : field.type === "text" ? (
                              <input
                                type="text"
                                value={String(value || "")}
                                onChange={(e) => onChange(e.target.value)}
                                placeholder={field.label}
                                className="w-full p-2 text-sm md:text-base rounded border border-gray-300 mt-1"
                              />
                            ) : null}
                          </>
                        )}
                        {errors[field.name]?.message && (
                          <div className="text-red-500 text-xs md:text-sm">
                            {errors[field.name]?.message as string}
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>
              ))}

            {/* Image upload section */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photo
              </label>
              <div className="flex gap-4 items-center">
                {localPreview && (
                  <div className="relative w-20 h-20 border rounded-md overflow-hidden">
                    <Image
                      width={80}
                      height={80}
                      src={localPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      onClick={handleRemoveImage}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <div className="border-2 border-dashed rounded-md p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#035140] file:text-white
                      hover:file:bg-[#035140]"
                    />
                  </div>
                </div>
              </div>
              {errors.image?.message && (
                <div className="text-red-500 text-xs md:text-sm mt-1">
                  {errors.image?.message as string}
                </div>
              )}
            </div>
          </div>

          {additionalContent && <Box mt={3}>{additionalContent}</Box>}
        </DialogContent>

        <DialogActions sx={{ px: { xs: 1, sm: 3 }, pb: 2 }}>
          <CancelButton onClick={onClose} disabled={isLoading || isUploading} />
          <SubmitButton disabled={isLoading || isUploading} />
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddEditEvent;