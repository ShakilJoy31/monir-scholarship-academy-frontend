// components/shared/reusable-component/DeleteConfirmationModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { X } from "lucide-react";

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  isLoading: boolean;
  confirmText?: string;
  cancelText?: string;
}

export const DeleteConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  isLoading,
  confirmText = "Delete",
  cancelText = "Cancel",
}: DeleteConfirmationModalProps) => {
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
              padding: "1.5rem",
              borderRadius: "6px",
              outline: "none",
              width: "480px",
              maxWidth: "95%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: `
                linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,252,251,0.98)),
                radial-gradient(circle at top left, rgba(220,38,38,0.03), transparent 60%)
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
                  backgroundColor: "#DC2626",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
                  "&:hover": {
                    backgroundColor: "#B91C1C",
                  },
                }}
              >
                <X size={18} />
              </IconButton>
            </motion.div>

            {/* Header with decorative accent */}
            <Box sx={{ position: "relative", mb: 2 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: "#DC2626",
                  position: "relative",
                  display: "inline-block",
                  "&:after": {
                    content: '""',
                    position: "absolute",
                    bottom: "-8px",
                    left: 0,
                    width: "48px",
                    height: "4px",
                    background: "linear-gradient(90deg, #DC2626, rgba(220,38,38,0.3))",
                    borderRadius: "2px",
                  },
                }}
              >
                {title}
              </Typography>
            </Box>

            {/* Description */}
            <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>
              {description}
            </Typography>

            {/* Warning note */}
            <Box
              sx={{
                backgroundColor: "rgba(220, 38, 38, 0.05)",
                borderLeft: "3px solid #DC2626",
                p: 2,
                mb: 3,
                borderRadius: "0 4px 4px 0",
              }}
            >
              <Typography variant="body2" sx={{ color: "#DC2626" }}>
                This action cannot be undone.
              </Typography>
            </Box>

            {/* Action buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 2,
                position: "relative",
              }}
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outlined"
                  onClick={onClose}
                  sx={{
                    color: "#1A3C34",
                    borderColor: "rgba(26,60,52,0.3)",
                    borderRadius: "6px",
                    px: 3,
                    py: 1,
                    fontWeight: 500,
                    "&:hover": {
                      borderColor: "#1A3C34",
                      backgroundColor: "rgba(26, 60, 52, 0.04)",
                    },
                  }}
                >
                  {cancelText}
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  onClick={onConfirm}
                  disabled={isLoading}
                  sx={{
                    backgroundColor: "#DC2626",
                    borderRadius: "6px",
                    px: 3,
                    py: 1,
                    fontWeight: 500,
                    boxShadow: "0 4px 16px rgba(220, 38, 38, 0.3)",
                    "&:hover": {
                      backgroundColor: "#B91C1C",
                      boxShadow: "0 6px 20px rgba(220, 38, 38, 0.4)",
                    },
                    "&:disabled": {
                      backgroundColor: "rgba(220, 38, 38, 0.5)",
                    },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    confirmText
                  )}
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};