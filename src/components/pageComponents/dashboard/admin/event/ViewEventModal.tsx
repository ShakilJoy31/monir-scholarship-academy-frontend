"use client";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Divider,
  CircularProgress,
  DialogActions,
} from "@mui/material";
import { XCircle } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import CancelButton from "@/components/shared/reusable-component/CancelButton";

interface ViewEventModalProps {
  open: boolean;
  onClose: () => void;
  eventData?: {
    id: number;
    title: string;
    description: string;
    location?: string;
    startDate: string;
    endDate: string;
    image?: string;
    isPublic: boolean;
  };
  isLoading: boolean;
  onEditClick: () => void;
}

const ViewEventModal = ({
  open,
  onClose,
  eventData,
  isLoading,
  onEditClick,
}: ViewEventModalProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
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
        <Typography variant="h6">Event Details</Typography>
        <IconButton onClick={onClose} sx={{ color: "red" }}>
          <XCircle />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : !eventData ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ textAlign: "center" }}
          >
            No event data available
          </Typography>
        ) : (
          <Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h5" fontWeight={600}>
                {eventData.title}
              </Typography>
              <Chip
                label={eventData.isPublic ? "Public" : "Private"}
                color={eventData.isPublic ? "success" : "default"}
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {eventData.image && (
              <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
                <Image
                  src={eventData.image}
                  alt="Event"
                  width={400}
                  height={300}
                  style={{ objectFit: "cover", borderRadius: "8px" }}
                />
              </Box>
            )}

            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Description:
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {eventData.description}
              </Typography>
            </Box>

            {eventData.location && (
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Location:
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {eventData.location}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Date Range:
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {formatDate(eventData.startDate)} -{" "}
                {formatDate(eventData.endDate)}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <CancelButton onClick={onClose}>Close</CancelButton>
        {eventData && (
          <Button
            variant="contained"
            onClick={() => {
              onClose();
              onEditClick();
            }}
            sx={{
              backgroundColor: "#035140",
              "&:hover": {
                backgroundColor: "#024235",
              },
            }}
          >
            Edit Event
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ViewEventModal;
