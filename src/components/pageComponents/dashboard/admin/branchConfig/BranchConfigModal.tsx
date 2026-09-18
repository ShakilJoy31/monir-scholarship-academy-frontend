"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal, Box, IconButton } from "@mui/material";
import { Upload, X } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { useAddThumbnailMutation } from "@/app/store/api/file/fileApi";
import { useUpdateBranchConfigMutation } from "@/app/store/api/branch/branchApi";
import Image from "next/image";

interface SchoolConfigModalProps {
  open: boolean;
  onClose: () => void;
  sectionType:
  | "logo"
  | "iDCard"
  | "schoolInfo"
  | "principalInfo"
  | "vicePrincipalInfo"
  | "socialAndContact"
  | null;
  configData?: Record<string, string>;
}

// ---------------- Single Schema for all fields ----------------
const sectionSchemas = {
  logo: z.object({
    logo: z.string().optional().nullable(),
    footerLogo: z.string().optional().nullable(),
  }),
  iDCard: z.object({
    idCardBackground: z.string().optional().nullable(),
    idCardBackSide: z.string().optional().nullable(),
  }),
  schoolInfo: z.object({
    schoolName: z.string().min(1, "School name is required").optional().nullable(),
    schoolEmail: z.string().email("Invalid email").optional().nullable(),
    schoolAddress: z.string().optional().nullable(),
    schoolPhone: z.string().optional().nullable(),
    schoolMobile: z.string().optional().nullable(),
    eiinNumber: z.string().optional().nullable(),
  }),
  principalInfo: z.object({
    principalName: z.string().optional().nullable(),
    principalImage: z.string().optional().nullable(),
    principalSignature: z.string().optional().nullable(),
    principalVoice: z.string().optional().nullable(),
  }),
  vicePrincipalInfo: z.object({
    vicePrincipalName: z.string().optional().nullable(),
    vicePrincipalImage: z.string().optional().nullable(),
    vicePrincipalSignature: z.string().optional().nullable(),
    vicePrincipalVoice: z.string().optional().nullable(),
  }),
  socialAndContact: z.object({
    facebook: z.string().url("Invalid URL").optional().nullable(),
    
    instagram: z.string().url("Invalid URL").optional().nullable(),
    twitter: z.string().url("Invalid URL").optional().nullable(),
    whatsapp: z.string().optional().nullable(),
    linkedin: z.string().url("Invalid URL").optional().nullable(),
    locationMap: z.string().optional().nullable(),
  }),
} as const;

const BranchConfigModal: React.FC<SchoolConfigModalProps> = ({
  open,
  onClose,
  sectionType,
  configData = {},
}) => {
  const activeSchema = sectionType
    ? sectionSchemas[sectionType]
    : z.object({});
  type FormValues = z.infer<(typeof sectionSchemas)[keyof typeof sectionSchemas]>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(activeSchema),
  });
  console.log("errors", errors)

  const [updateBranchConfig, { isLoading: updateLoading }] =
    useUpdateBranchConfigMutation();
  const [addThumbnail, { isLoading: uploadLoading }] =
    useAddThumbnailMutation();

  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    reset(configData as FormValues);
    const newPreviews: Record<string, string> = {};
    Object.keys(configData).forEach((key) => {
      newPreviews[key] = configData[key];
    });
    setPreviews(newPreviews);
  }, [configData, reset]);

  const handleFileUpload = async (
    file: File,
    fieldName: keyof FormValues
  ) => {
    setPreviews((prev) => ({
      ...prev,
      [fieldName as string]: URL.createObjectURL(file),
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await addThumbnail(formData).unwrap();
      if (response?.data) {
        // setValue(fieldName, response.data[0] as any);
        setValue(fieldName as keyof FormValues, response.data[0] as unknown as FormValues[keyof FormValues]);

        setPreviews((prev) => ({
          ...prev,
          [fieldName as string]: response.data[0],
        }));
        toastShowing(
          "Image uploaded successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      }
    } catch {
      toastShowing(
        "Image upload failed",
        "bottom-right",
        2000,
        "red",
        "white"
      );
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await updateBranchConfig(data).unwrap();
      toastShowing(
        "Configuration updated successfully",
        "bottom-right",
        2000,
        "green",
        "white"
      );
      onClose();
    } catch {
      toastShowing(
        "Update failed",
        "bottom-right",
        2000,
        "red",
        "white"
      );
    }
  };

  if (!sectionType) return null;

  const commonInput =
    "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary text-sm";

  const renderFileInput = (label: string, name: keyof FormValues) => (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-gray-700 text-sm mb-1">{label}</label>

      <div className="relative group">
        <input
          type="file"
          id={`file-input-${String(name)}`}
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, name);
          }}
          className="absolute inset-0 opacity-0 cursor-pointer z-20"
        />

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:border-primary transition-all duration-200 cursor-pointer min-h-[140px] relative overflow-hidden group">
          {previews[name as string] ? (
            <div className="relative w-full flex flex-col items-center">
              <div className="w-24 h-24 rounded overflow-hidden border border-gray-200 shadow-sm">
                <Image
                  src={previews[name as string]}
                  alt={label}
                  className="w-full h-full object-cover"
                  width={96}
                  height={96}
                />
              </div>

              <p className="text-xs text-gray-600 truncate max-w-[150px] mt-2 text-center">
                {previews[name as string].split("/").pop()}
              </p>

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 rounded-lg">
                <button
                  type="button"
                  className="flex items-center gap-2 bg-primary text-white text-xs px-3 py-1.5 rounded shadow-md hover:bg-primary/90"
                >
                  <Upload className="w-4 h-4" />
                  Change Image
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Upload className="w-7 h-7 mb-2 text-gray-400 group-hover:text-primary" />
              <p className="text-sm text-gray-500 text-center leading-tight">
                Click or drag <br /> an image to upload
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFields = () => {
    switch (sectionType) {
      case "logo":
        return (
          <>
            {renderFileInput("Logo", "logo" as keyof FormValues)}
            {renderFileInput("Footer Logo", "footerLogo" as keyof FormValues)}
          </>
        );
      case "iDCard":
        return (
          <>
            {renderFileInput("ID Card Background", "idCardBackground" as keyof FormValues)}
            {renderFileInput("ID Card Back Side", "idCardBackSide" as keyof FormValues)}
          </>
        );
      case "schoolInfo":
        return (
          <>
            <label>School Name</label>
            <input
              {...register("schoolName" as keyof FormValues)}
              placeholder="School Name"
              className={commonInput}
            />
            <label>School Email</label>
            <input
              {...register("schoolEmail" as keyof FormValues)}
              placeholder="School Email"
              className={commonInput}
            />
            <label>Address</label>
            <input
              {...register("schoolAddress" as keyof FormValues)}
              placeholder="Address"
              className={commonInput}
            />
            <label>Phone</label>
            <input
              {...register("schoolPhone" as keyof FormValues)}
              placeholder="Phone"
              className={commonInput}
            />
            <label>Mobile</label>
            <input
              {...register("schoolMobile" as keyof FormValues)}
              placeholder="Mobile"
              className={commonInput}
            />
            <label>EIIN Number</label>
            <input
              {...register("eiinNumber" as keyof FormValues)}
              placeholder="EIIN Number"
              className={commonInput}
            />
          </>
        );
      case "principalInfo":
        return (
          <>
            <label>Principal Name</label>
            <input
              {...register("principalName" as keyof FormValues)}
              placeholder="Principal Name"
              className={commonInput}
            />
            {renderFileInput("Principal Image", "principalImage" as keyof FormValues)}
            {renderFileInput("Principal Signature", "principalSignature" as keyof FormValues)}
            <label>Principal Voice</label>
            <textarea
              {...register("principalVoice" as keyof FormValues)}
              rows={3}
              placeholder="Principal Voice"
              className={commonInput}
            />
          </>
        );
      case "vicePrincipalInfo":
        return (
          <>
            <label>Vice Principal Name</label>
            <input
              {...register("vicePrincipalName" as keyof FormValues)}
              placeholder="Vice Principal Name"
              className={commonInput}
            />
            {renderFileInput("Vice Principal Image", "vicePrincipalImage" as keyof FormValues)}
            {renderFileInput("Vice Principal Signature", "vicePrincipalSignature" as keyof FormValues)}
            <label>Vice Principal Voice</label>
            <input
              {...register("vicePrincipalVoice" as keyof FormValues)}
              placeholder="Vice Principal Voice"
              className={commonInput}
            />
            <textarea
              rows={3}
              {...register("vicePrincipalVoice" as keyof FormValues)}
              placeholder="Vice Principal Voice"
              className={commonInput}
            />
          </>
        );
      case "socialAndContact":
        return (
          <>
            <label>Facebook URL</label>
            <input
              {...register("facebook" as keyof FormValues)}
              placeholder="Facebook URL"
              className={commonInput}
            />
            <label>Instagram URL</label>
            <input
              {...register("instagram" as keyof FormValues)}
              placeholder="Instagram URL"
              className={commonInput}
            />
            <label>Twitter URL</label>
            <input
              {...register("twitter" as keyof FormValues)}
              placeholder="Twitter URL"
              className={commonInput}
            />
            <label>WhatsApp Number</label>
            <input
              {...register("whatsapp" as keyof FormValues)}
              placeholder="WhatsApp Number"
              className={commonInput}
            />
            <label>LinkedIn URL</label>
            <input
              {...register("linkedin" as keyof FormValues)}
              placeholder="LinkedIn URL"
              className={commonInput}
            />
            <label>Location Map Embed Link</label>
            <textarea
              rows={3}
              {...register("locationMap" as keyof FormValues)}
              placeholder="Location Map Embed Link"
              className={commonInput}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Modal
          open={open}
          onClose={onClose}
          closeAfterTransition
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
          >
            <Box
              sx={{
                position: "relative",
                bgcolor: "white",
                borderRadius: 2,
                boxShadow: 4,
                p: 4,
                width: "90vw",
                maxWidth: 500,
                maxHeight: "90vh",

              }}
            >
              <IconButton
                onClick={onClose}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  color: "#555",
                  "&:hover": { color: "#e53935" },
                }}
              >
                <X size={20} />
              </IconButton>

              <h3 className="text-xl font-semibold mb-4 capitalize text-primary">
                Edit {sectionType.replace(/([A-Z])/g, " $1")}
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-scroll scrollbar-hide">
                {renderFields()}

                <div className="flex justify-end gap-2 mt-4">
                  <CancelButton onClick={onClose}>Cancel</CancelButton>
                  <SubmitButton disabled={updateLoading || uploadLoading}>
                    {updateLoading ? "Saving..." : "Save"}
                  </SubmitButton>
                </div>
              </form>
            </Box>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default BranchConfigModal;
