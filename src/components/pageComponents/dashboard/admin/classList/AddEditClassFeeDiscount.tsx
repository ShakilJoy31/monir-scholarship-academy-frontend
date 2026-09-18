"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  TextField,
  Typography,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  InputAdornment,
  Autocomplete,
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
} from "@mui/material";
import {
  useForm,
  FormProvider,
  SubmitHandler,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XCircle } from "lucide-react";
import { theStar } from "@/lib/requiredJSX";
import Image from "next/image";
import {
  ClassFeeDiscountFormValues,
  ClassFeeDiscountSchema,
} from "@/app/super-admin/schemas/studentClassDiscount";
import { useAddThumbnailMutation } from "@/app/store/api/file/fileApi";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { useGetStudentByUniqueIdQuery, useGetStudentByIdQuery } from "@/app/store/api/student/studentApi";

interface Class {
  id: number;
  name: string;
}

interface Section {
  id: number;
  name: string;
}

interface Session {
  id: number;
  name: string;
}

interface Stream {
  id: number;
  name: string;
}

interface Student {
  id: number;
  name: string;
  classRoll: number;
  session: Session;
  class: Class;
  section: Section;
  stream: Stream;
  studentUniqueId: string;
}

interface AddEditClassFeeDiscountProps {
  open: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<ClassFeeDiscountFormValues>;
  currentData: { id: number | null; data: ClassFeeDiscountFormValues } | null;
  isLoading: boolean;
  error: string | null;
  onErrorDismiss: () => void;
  title: string;
}

const AddEditClassFeeDiscount = ({
  open,
  onClose,
  onSubmit,
  currentData,
  isLoading,
  error,
  onErrorDismiss,
  title,
}: AddEditClassFeeDiscountProps) => {
  const methods = useForm<ClassFeeDiscountFormValues>({
    resolver: zodResolver(ClassFeeDiscountSchema),
    defaultValues: {
      studentId: 0,
      discountType: "Fixed",
      discount: 0,
      image: "",
      note: "",
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
    register,
    watch,
    setValue,
    control,
  } = methods;

  const [uploadedImage, setUploadedImage] = React.useState<File | undefined>(
    undefined
  );
  const [preview, setPreview] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [addThumbnail] = useAddThumbnailMutation();
  const [uniqueId, setUniqueId] = useState("");
  
  // Add state for the current student
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  
  // Query for student by unique ID (used when adding new)
  const { data: studentResponseByUniqueId, isLoading: uniqueStudentLoading } =
    useGetStudentByUniqueIdQuery({ uniqueId }, { skip: !uniqueId });

  // Query for student by ID (used when editing)
  const { data: studentByIdResponse, isLoading: studentByIdLoading } = 
    useGetStudentByIdQuery(currentData?.data.studentId || 0, { 
      skip: !currentData?.data.studentId || !open 
    });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setUploadedImage(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
      setValue("image", previewUrl);
    }
  };

  const handleRemoveImage = () => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setUploadedImage(undefined);
    setValue("image", "");
  };

  const handleFormSubmit = async (data: ClassFeeDiscountFormValues) => {
    try {
      let imageUrl = data.image || "";

      if (uploadedImage) {
        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append("photo", uploadedImage);
          const response = await addThumbnail(formData).unwrap();
          imageUrl = response?.data?.[0] || "";
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          methods.setError("image", {
            type: "manual",
            message: "Failed to upload image",
          });
          return;
        } finally {
          setIsUploading(false);
        }
      }

      onSubmit({
        ...data,
        note: data?.note || undefined,
        image: imageUrl || undefined,
      });
    } catch (err) {
      console.error("Error in form submission:", err);
    }
  };

  useEffect(() => {
    if (currentData) {
      methods.reset({
        ...currentData.data,
        discount: Number(currentData.data.discount),
      });

      if (currentData.data.image) {
        setPreview(currentData.data.image);
      }
    } else {
      reset({
        studentId: 0,
        discountType: "Fixed",
        discount: 0,
        image: "",
        note: "",
      });
      setPreview(null);
      setUploadedImage(undefined);
      setCurrentStudent(null);
      setUniqueId("");
    }
  }, [currentData, methods, reset]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Set current student when editing
  useEffect(() => {
    if (studentByIdResponse?.data) {
      setCurrentStudent(studentByIdResponse.data);
      setUniqueId(studentByIdResponse.data.studentUniqueId);
    }
  }, [studentByIdResponse]);

  // Set student ID when student is selected (for both add and edit)
  useEffect(() => {
    if (studentResponseByUniqueId?.data) {
      setCurrentStudent(studentResponseByUniqueId.data);
      setValue("studentId", studentResponseByUniqueId.data.id, {
        shouldValidate: true,
      });
    }
  }, [studentResponseByUniqueId, setValue]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          fontWeight: 600,
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

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={onErrorDismiss}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        <FormProvider {...methods}>
          <Box
            component="form"
            noValidate
            sx={{ mt: 2 }}
          >
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth error={!!errors.studentId}>
                <Autocomplete
                  id="student-autocomplete"
                  options={currentStudent ? [currentStudent] : studentResponseByUniqueId?.data ? [studentResponseByUniqueId.data] : []}
                  getOptionLabel={(option: Student) =>
                    `${option.name} - Roll: ${option.classRoll} (${option.studentUniqueId})`
                  }
                  value={
                    currentStudent || 
                    (studentResponseByUniqueId?.data && watch("studentId") === studentResponseByUniqueId.data.id
                      ? studentResponseByUniqueId.data
                      : null)
                  }
                  onChange={(
                    event: React.SyntheticEvent,
                    value: Student | null,
                    reason: AutocompleteChangeReason,
                    details?: AutocompleteChangeDetails<Student>
                  ) => {
                    console.log(event, reason, details)
                    if (value) {
                      setValue("studentId", value.id, {
                        shouldValidate: true,
                      });
                      setCurrentStudent(value);
                    } else {
                      setValue("studentId", 0, {
                        shouldValidate: true,
                      });
                      setCurrentStudent(null);
                      setUniqueId("");
                    }
                  }}
                  onInputChange={(event, newInputValue) => {
                    setUniqueId(newInputValue);
                  }}
                  loading={uniqueStudentLoading || studentByIdLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<>Student Unique ID {theStar}</>}
                      error={!!errors.studentId}
                      helperText={errors.studentId?.message as string}
                      placeholder="Enter student unique ID (e.g., STU-00001)"
                      value={uniqueId}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  filterOptions={(options) => options}
                  clearOnBlur={false}
                  fullWidth
                />
              </FormControl>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                mb: 3,
              }}
            >
              <FormControl fullWidth error={!!errors.discountType}>
                <InputLabel id="discount-type-label">
                  Discount Type {theStar}
                </InputLabel>
                <Select
                  labelId="discount-type-label"
                  label="Discount Type"
                  {...register("discountType")}
                  defaultValue={currentData?.data.discountType || "Fixed"}
                >
                  <MenuItem value="Fixed">Fixed Amount</MenuItem>
                  <MenuItem value="Percentage">Percentage</MenuItem>
                </Select>
                {errors.discountType && (
                  <Typography variant="caption" color="error">
                    {errors.discountType.message as string}
                  </Typography>
                )}
              </FormControl>

              <TextField
                label={
                  <>
                    Discount Amount
                    {theStar}
                  </>
                }
                type="number"
                fullWidth
                {...register("discount", { valueAsNumber: true })}
                error={!!errors.discount}
                helperText={errors.discount?.message as string}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {watch("discountType") === "Percentage" ? "%" : "৳"}
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                label="Note"
                fullWidth
                multiline
                rows={3}
                {...register("note")}
                error={!!errors.note}
                helperText={errors.note?.message as string}
              />
            </Box>

            <Box sx={{ mt: 4 }}>
              <label className="block text-sm font-medium text-gray-700">
                Upload Photo
              </label>
              <div className="flex gap-3">
                {preview && (
                  <div className="relative w-20 h-20 border rounded-md overflow-hidden mt-2">
                    <Image
                      width={80}
                      height={80}
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      onClick={handleRemoveImage}
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div>
                  <div className="border-2 border-dashed rounded-md py-3 px-3">
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
              <Controller
                name="image"
                control={control}
                render={({ fieldState }) =>
                  fieldState.error?.message ? (
                    <Typography variant="caption" color="error">
                      {fieldState.error.message}
                    </Typography>
                  ) : (
                    <></>
                  )
                }
              />
            </Box>
          </Box>
        </FormProvider>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <CancelButton
          onClick={onClose}
          disabled={isLoading || isUploading}
        >
          Cancel
        </CancelButton>
        <SubmitButton
          type="submit"
          disabled={isLoading || isUploading}
          onClick={handleSubmit(handleFormSubmit)}
        >
          {currentData?.id
            ? isLoading || isUploading
              ? "Updating..."
              : "Update"
            : isLoading || isUploading
              ? "Submitting..."
              : "Submit"}
        </SubmitButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditClassFeeDiscount;