"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Modal,
  Tooltip,
} from "@mui/material";
import { Plus, X } from "lucide-react";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import {
  useCreateSmsTemplateMutation,
  useDeleteSmsTemplateMutation,
  useGetAllSmsTemplatesQuery,
  useUpdateSmsTemplateMutation,
} from "@/app/store/api/sms/smsApi";
import AddEditSMSTemplate from "@/components/pageComponents/dashboard/admin/teacher/AddEditSMSTemplate";
import { AnimatePresence, motion } from "framer-motion";
import { BsThreeDotsVertical } from "react-icons/bs";
import CancelButton from "@/components/shared/reusable-component/CancelButton";

interface SMSTemplate {
  id: number;
  title: string;
  message: string;
  [key: string]: unknown;
}

interface ApiResponse {
  data?: SMSTemplate[];
}

const SMSTemplate = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  const [templateToView, setTemplateToView] = useState<SMSTemplate | null>(
    null
  );
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<{
    id: number | null;
    data: { title: string; message: string };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch SMS templates data
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllSmsTemplatesQuery({});

  const smsTemplates: SMSTemplate[] = Array.isArray(responseData)
    ? responseData
    : (responseData as ApiResponse)?.data || [];

  const [createTemplate, { isLoading: createLoading }] =
    useCreateSmsTemplateMutation();
  const [updateTemplate, { isLoading: updateLoading }] =
    useUpdateSmsTemplateMutation();
  const [deleteTemplate, { data: deleteData }] = useDeleteSmsTemplateMutation();

  const handleOpenModal = (template: SMSTemplate | null = null) => {
    if (template) {
      setCurrentTemplate({
        id: template.id,
        data: {
          title: template.title,
          message: template.message,
        },
      });
    } else {
      setCurrentTemplate(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentTemplate(null);
    setError(null);
  };

  const handleSubmit = async (data: { title: string; message: string }) => {
    try {
      if (currentTemplate?.id) {
        await updateTemplate({ id: currentTemplate.id, data }).unwrap();
        toastShowing(
          "SMS template updated successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      } else {
        await createTemplate(data).unwrap();
        toastShowing(
          "SMS template created successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        (err as Error).message ||
        "An error occurred";

      toastShowing(errorMessage, "bottom-right", 2000, "red", "white");
      setError(errorMessage);
      console.error("Error saving SMS template:", err);
    }
  };

  const handleDeleteClick = (id: number) => {
    setTemplateToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;

    try {
      setIsDeleting(true);
      await deleteTemplate(templateToDelete).unwrap();
      toastShowing(
        deleteData?.message || "SMS template deleted",
        "bottom-right",
        2000,
        "green",
        "white"
      );
      refetch();
    } catch (err) {
      toastShowing(
        "Failed to delete SMS template",
        "bottom-right",
        2000,
        "red",
        "white"
      );
      console.error("Error deleting SMS template:", err);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setTemplateToDelete(null);
    }
  };

 const columns = [
  {
    key: "serial",
    header: "SL.",
    render: (_row: SMSTemplate, index?: number) =>
      index !== undefined ? index + 1 : "",
  },
  {
    key: "title",
    header: "Title",
  },
  {
    key: "message",
    header: "Message",
    render: (row: SMSTemplate) => (
      <Typography
        sx={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "300px",
        }}
      >
        {row.message}
      </Typography>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    render: (row: SMSTemplate) => {
      return (
        <Box sx={{ display: "flex", justifyContent: "flex-center" }}>
          <Tooltip
            title={
              <Paper
                elevation={3}
                sx={{
                  backgroundColor: "white",
                  padding: "8px 0",
                  borderRadius: "8px",
                  display: "grid",
                  gap: "4px",
                  minWidth: "120px",
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Button
                  onClick={() => {
                    setTemplateToView(row);
                    setViewModalOpen(true);
                    setOpenMenuId(null);
                  }}
                  size="small"
                  sx={{
                    color: "#035140",
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 400,
                    justifyContent: "flex-start",
                    padding: "6px 16px",
                    "&:hover": {
                      backgroundColor: "rgba(3, 81, 64, 0.08)",
                    },
                  }}
                >
                  View
                </Button>

                <Button
                  onClick={() => {
                    handleOpenModal(row);
                    setOpenMenuId(null);
                  }}
                  size="small"
                  sx={{
                    color: "#035140",
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 400,
                    justifyContent: "flex-start",
                    padding: "6px 16px",
                    "&:hover": {
                      backgroundColor: "rgba(3, 81, 64, 0.08)",
                    },
                  }}
                >
                  Edit
                </Button>

                <Button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleDeleteClick(row.id);
                    setOpenMenuId(null);
                  }}
                  size="small"
                  disabled={isDeleting && templateToDelete === row.id}
                  sx={{
                    color: "#DC2626",
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 400,
                    justifyContent: "flex-start",
                    padding: "6px 16px",
                    "&:hover": {
                      backgroundColor: "rgba(220, 38, 38, 0.08)",
                    },
                    "&.Mui-disabled": {
                      color: "rgba(220, 38, 38, 0.5)",
                    },
                  }}
                >
                  {isDeleting && templateToDelete === row.id ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <CircularProgress
                        size={14}
                        thickness={5}
                        color="inherit"
                      />
                      Deleting...
                    </Box>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </Paper>
            }
            placement="bottom-end"
            open={openMenuId === row.id}
            onOpen={() => setOpenMenuId(row.id)}
            onClose={() => setOpenMenuId(null)}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: "transparent",
                  padding: 0,
                  boxShadow: "none",
                },
              },
            }}
            PopperProps={{
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -10],
                  },
                },
              ],
            }}
          >
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === row.id ? null : row.id);
              }}
              sx={{
                color: "#64748B",
                p: 1,
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "rgba(100, 116, 139, 0.1)",
                },
              }}
            >
              <BsThreeDotsVertical size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
  },
];

  function onErrorDismiss(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <Box>
      <PageHeader
        title="SMS Templates"
        buttonText="Add Template"
        buttonIcon={<Plus size={20} />}
        onButtonClick={() => handleOpenModal()}
      />

      <AddEditSMSTemplate
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentTemplate}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={onErrorDismiss}
        title={
          currentTemplate?.id ? "Edit SMS Template" : "Add SMS Template"
        }
      />

      {/* View Template Modal */}
      <AnimatePresence>
        {viewModalOpen && templateToView && (
          <Modal
            open={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
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
                  onClick={() => setViewModalOpen(false)}
                  sx={{
                    backgroundColor: "#1A3C34",
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
                      background:
                        "linear-gradient(90deg, #1A3C34, rgba(26,60,52,0.3))",
                      borderRadius: "2px",
                    },
                  }}
                >
                  SMS Template Details
                </Typography>
              </Box>

              {/* Template details - styled exactly like the example */}
              <Box sx={{ display: "grid", gap: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" color="textSecondary">
                    Title:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {templateToView.title || "N/A"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "10px",
                  }}
                >
                  <Typography variant="body1" color="textSecondary">
                    Message:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {templateToView.message || "N/A"}
                  </Typography>
                </Box>
              </Box>

              {/* Close button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                <CancelButton
                  onClick={() => setViewModalOpen(false)}
                  sx={{
                    backgroundColor: "#1A3C34",
                    borderRadius: "6px",
                    px: 3,
                    py: 1,
                    fontWeight: 500,
                    boxShadow: "0 4px 16px rgba(26, 60, 52, 0.3)",
                    "&:hover": {
                      backgroundColor: "#0F2922",
                      boxShadow: "0 6px 20px rgba(26, 60, 52, 0.4)",
                    },
                  }}
                >
                  Close
                </CancelButton>
              </Box>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete SMS Template"
        description="Are you sure you want to delete this SMS template? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load SMS templates
          </Alert>
        ) : smsTemplates.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No SMS templates found. Click Add New Template to create one.
          </Typography>
        ) : (
          <ReusableTable<SMSTemplate> columns={columns} data={smsTemplates} />
        )}
      </Paper>
    </Box>
  );
};

export default SMSTemplate;
