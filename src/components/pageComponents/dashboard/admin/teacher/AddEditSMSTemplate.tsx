"use client";
import React from "react";
import {
  Box,
  Alert,
  AlertTitle,
  TextField,
  Typography,
  IconButton,
  Modal,
} from "@mui/material";
import {
  useForm,
  FormProvider,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { theStar } from "@/lib/requiredJSX";
import { z } from "zod";
import { SmsTemplateSchema } from "@/app/super-admin/schemas/smsSchema";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

type SmsTemplateFormValues = z.infer<typeof SmsTemplateSchema>;

interface AddEditSMSTemplateProps {
  open: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<SmsTemplateFormValues>;
  currentData: { id: number | null; data: SmsTemplateFormValues } | null;
  isLoading: boolean;
  error: string | null;
  onErrorDismiss: () => void;
  title: string;
}

const AddEditSMSTemplate = ({
  open,
  onClose,
  onSubmit,
  currentData,
  isLoading,
  error,
  onErrorDismiss,
  title,
}: AddEditSMSTemplateProps) => {
  const methods = useForm<SmsTemplateFormValues>({
    resolver: zodResolver(SmsTemplateSchema),
    defaultValues: {
      title: "",
      message: "",
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
    register,
  } = methods;

  const handleFormSubmit = async (data: SmsTemplateFormValues) => {
    try {
      onSubmit(data);
    } catch (err) {
      console.error("Error in form submission:", err);
    }
  };

  React.useEffect(() => {
    if (currentData) {
      methods.reset(currentData.data);
    } else {
      reset({
        title: "",
        message: "",
      });
    }
  }, [currentData, methods, reset]);

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
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.3,
        }}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          position: "relative",
          padding: "2rem",
          borderRadius: "6px",
          outline: "none",
          width: "480px",
          maxWidth: "95%",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          background: `
            linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,252,251,0.98)),
            radial-gradient(circle at top left, rgba(26,60,52,0.03), transparent 60%)
          `,
        }}
      >
        {/* Floating close button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: "absolute",
            top: "-12px",
            right: "-12px",
            zIndex: 1,
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              backgroundColor: "#d32f2f",
              color: "white",
              boxShadow: "0 4px 12px rgba(26, 60, 52, 0.2)",
              "&:hover": {
                backgroundColor: "#0F2922",
              },
            }}
          >
            <X size={18} />
          </IconButton>
        </motion.div>

        {/* Header with decorative accent */}
        <Box sx={{ position: "relative", mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "#1A3C34",
              position: "relative",
              display: "inline-block",
              "&:after": {
                content: '""',
                position: "absolute",
                bottom: "-8px",
                left: 0,
                width: "48px",
                height: "4px",
                background: "linear-gradient(90deg, #1A3C34, rgba(26,60,52,0.3))",
                borderRadius: "2px",
              },
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Content */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: "6px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }} 
            onClose={onErrorDismiss}
          >
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        <FormProvider {...methods}>
          <Box
            component="form"
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
          >
            <Box sx={{ display: "grid", gap: 3 }}>
              <TextField
                label={
                  <>
                    Title
                    {theStar}
                  </>
                }
                fullWidth
                {...register("title")}
                error={!!errors.title}
                helperText={errors.title?.message as string}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                    "& fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.1)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#1A3C34",
                    },
                  },
                }}
              />

              <TextField
                label={
                  <>
                    Message
                    {theStar}
                  </>
                }
                fullWidth
                multiline
                rows={6}
                {...register("message")}
                error={!!errors.message}
                helperText={errors.message?.message as string}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                    "& fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.1)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#1A3C34",
                    },
                  },
                }}
              />
            </Box>

            {/* Buttons */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
              <CancelButton
                onClick={onClose}
               
                disabled={isLoading}
              >
                Cancel
              </CancelButton>
              <SubmitButton
                type="submit"
                disabled={isLoading}
                
              >
                {currentData?.id
                  ? isLoading
                    ? "Updating..."
                    : "Update"
                  : isLoading
                  ? "Submitting..."
                  : "Submit"}
              </SubmitButton>
            </Box>
          </Box>
        </FormProvider>
      </motion.div>
    </Modal>
  )}
</AnimatePresence>
  );
};

export default AddEditSMSTemplate;