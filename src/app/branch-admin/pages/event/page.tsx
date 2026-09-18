// app/(dashboard)/dashboard/admin/event/page.tsx
"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Tooltip,
  Button,
} from "@mui/material";
import { Plus } from "lucide-react";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { PageHeader } from "@/components/shared/reusable-component/PageHeader";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { DeleteConfirmationModal } from "@/components/shared/reusable-component/DeleteModal";
import AddEditEvent from "@/components/pageComponents/dashboard/admin/event/AddEditEvent";
// import Image from "next/image";
// import { XCircle } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useAddThumbnailMutation } from "@/app/store/api/file/fileApi";
import ViewEventModal from "@/components/pageComponents/dashboard/admin/event/ViewEventModal";
import { EventFormValues, EventSchema } from "@/app/super-admin/schemas/event/eventSchema";
import { useCreateEventMutation, useDeleteEventMutation, useGetAllEventsQuery, useGetEventByIdQuery, useUpdateEventMutation } from "@/app/store/api/event/eventApis";

interface Event extends EventFormValues {
  id: number;
  [key: string]: unknown;
}

interface ApiResponse {
  data?: Event[];
}

const Event = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);
  const [currentEvent, setCurrentEvent] = useState<{
    id: number | null;
    data: EventFormValues;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [ , setPreview] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | undefined>(undefined);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [id, setSelectedEventId] = useState<number | null>(null);

  // Fetch events
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetAllEventsQuery({ page: 1, size: 10, search: "" });

  // Fetch single event for view modal
  const { data: singleEventData, isLoading: isSingleEventLoading } = useGetEventByIdQuery(
    id,
    { skip: !id }
  );

  // Mutation hooks
  const [createEvent, { isLoading: createLoading }] = useCreateEventMutation();
  const [updateEvent, { isLoading: updateLoading }] = useUpdateEventMutation();
  const [deleteEvent, { data: deleteData }] = useDeleteEventMutation();
  const [addThumbnail] = useAddThumbnailMutation();

  const events: Event[] = Array.isArray(responseData)
    ? responseData
    : (responseData as ApiResponse)?.data || [];

  const handleOpenModal = (event: Event | null = null) => {
    if (event) {
      // Format the dates to YYYY-MM-DD format
      const formattedStartDate = event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '';
      const formattedEndDate = event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '';

      setCurrentEvent({
        id: event.id,
        data: {
          title: event.title || "",
          description: event.description || "",
          location: event.location || "",
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          image: event.image || "",
          isPublic: event.isPublic || false
        }
      });
      if (event.image) {
        setPreview(event.image);
      }
    } else {
      setCurrentEvent({
        id: null,
        data: {
          title: "",
          description: "",
          location: "",
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          image: "",
          isPublic: false
        }
      });
      setPreview(null);
      setUploadedImage(undefined);
    }
    setModalOpen(true);
  };

  const handleOpenViewModal = (eventId: number) => {
    setSelectedEventId(eventId);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedEventId(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentEvent(null);
    setError(null);
    setPreview(null);
    setUploadedImage(undefined);
  };

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files?.[0];
//     if (selectedFile) {
//       setUploadedImage(selectedFile);
//       setPreview(URL.createObjectURL(selectedFile));
//     }
//   };

const handleSubmit = async (data: EventFormValues) => {
  try {
    let imageUrl = data.image || "";

    if (uploadedImage) {
      try {
        const formData = new FormData();
        formData.append("photo", uploadedImage);
        const response = await addThumbnail(formData).unwrap();
        imageUrl = response?.data?.[0] || "";
      } catch (error) {
        console.log(error)
        toastShowing("Photo upload error", 'bottom-right', 2000, 'red', 'white');
        return;
      }
    }

    // Convert date strings to ISO format or Date objects
    const payload = {
      title: data.title,
          description: data.description,
      startDate: new Date(data.startDate).toISOString(), // Convert to ISO string
      endDate: new Date(data.endDate).toISOString(),     // Convert to ISO string
      image: imageUrl || undefined,
       location: data.location || "",
       isPublic: data.isPublic
    };

    if (currentEvent?.id) {
      await updateEvent({ id: currentEvent.id, ...payload }).unwrap();
      toastShowing("Event updated successfully", 'bottom-right', 2000, 'green', 'white');
    } else {
      await createEvent(payload).unwrap();
      toastShowing("Event created successfully", 'bottom-right', 2000, 'green', 'white');
    }
    handleCloseModal();
    refetch();
  } catch (err) {
    const errorMessage = (err as { data?: { message?: string } })?.data?.message ||
      (err as Error).message ||
      'An error occurred';

    toastShowing(errorMessage, 'bottom-right', 2000, 'red', 'white');
    setError(errorMessage);
    console.error("Error saving event:", err);
  }
};

  const handleDeleteClick = (id: number) => {
    setEventToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      setIsDeleting(true);
      await deleteEvent(eventToDelete).unwrap();
      toastShowing(deleteData?.message || "Event deleted", 'bottom-right', 2000, 'green', 'white');
      refetch();
    } catch (err) {
      toastShowing('Failed to delete event', 'bottom-right', 2000, 'red', 'white');
      console.error("Error deleting event:", err);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  const columns = [
    {
      key: "serial",
      header: "SL",
      render: (_row: Event, index?: number) => index !== undefined ? index + 1 : '',
    },
    {
      key: "title",
      header: "Title",
      render: (row: Event) => row.title || "N/A",
    },
    {
      key: "description",
      header: "Description",
      render: (row: Event) => row.description ? `${row.description.substring(0, 50)}${row.description.length > 50 ? '...' : ''}` : "N/A",
    },
    {
      key: "location",
      header: "Location",
      render: (row: Event) => row.location || "N/A",
    },
    {
      key: "dateRange",
      header: "Date Range",
      render: (row: Event) => {
        if (!row.startDate || !row.endDate) return "N/A";
        const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          return date.toLocaleDateString();
        };
        return `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Event) => (
        <Chip
          label={row.isPublic ? 'Public' : 'Private'}
          color={row.isPublic ? 'success' : 'default'}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Event) => {
        return (
          <Tooltip
            title={
              <Paper
                elevation={3}
                sx={{
                  backgroundColor: 'white',
                  padding: '8px 0',
                  borderRadius: '8px',
                  display: 'grid',
                  gap: '4px',
                  minWidth: '120px',
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Button
                  onClick={() => {
                    handleOpenViewModal(row.id);
                    setOpenMenuId(null);
                  }}
                  size="small"
                  sx={{
                    color: "#035140",
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 400,
                    justifyContent: 'flex-start',
                    padding: '6px 16px',
                    "&:hover": {
                      backgroundColor: "rgba(3, 81, 64, 0.08)",
                    },
                  }}
                >
                  View
                </Button>

                <Button
                  onClick={() => {
                    handleOpenModal(row)
                    setOpenMenuId(null);
                  }}
                  size="small"
                  sx={{
                    color: "#035140",
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 400,
                    justifyContent: 'flex-start',
                    padding: '6px 16px',
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
                    handleDeleteClick(row.id)
                    setOpenMenuId(null);
                  }}
                  size="small"
                  sx={{
                    color: "#DC2626",
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 400,
                    justifyContent: 'flex-start',
                    padding: '6px 16px',
                    "&:hover": {
                      backgroundColor: "rgba(220, 38, 38, 0.08)",
                    },
                    "&.Mui-disabled": {
                      color: "rgba(220, 38, 38, 0.5)"
                    }
                  }}
                >
                  Delete
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
                  backgroundColor: 'transparent',
                  padding: 0,
                  boxShadow: 'none'
                }
              }
            }}
            PopperProps={{
              modifiers: [
                {
                  name: 'offset',
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
        );
      },
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Events"
        buttonText="Add Event"
        buttonIcon={<Plus size={20} />}
        onButtonClick={() => handleOpenModal()}
      />

      <AddEditEvent
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentData={currentEvent}
        isLoading={createLoading || updateLoading}
        error={error}
        onErrorDismiss={() => setError(null)}
        title={currentEvent?.id ? "Edit Event" : "Add Event"}
        schema={EventSchema}
        defaultValues={{
          title: "",
          description: "",
          location: "",
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          image: "",
          isPublic: false,
        }}
        formFields={[
          {
            name: "title",
            label: "Title",
            gridWidth: 12,
            type: "text",
            required: true,
          },
          {
            name: "description",
            label: "Description",
            gridWidth: 12,
            type: "text",
            required: true,
          },
          {
            name: "location",
            label: "Location",
            gridWidth: 12,
            type: "text",
          },
          {
            name: "startDate",
            label: "Start Date",
            gridWidth: 6,
            type: "date",
            required: true,
          },
          {
            name: "endDate",
            label: "End Date",
            gridWidth: 6,
            type: "date",
            required: true,
          },
          {
            name: "isPublic",
            label: "Public Event",
            gridWidth: 6,
            type: "checkbox",
          },
        ]}
        // additionalContent={
        //   <div className="mt-4">
        //     <label className="block text-sm font-medium text-gray-700">
        //       Upload Photo
        //     </label>
        //     <div className="flex gap-3">
        //       {preview && (
        //         <div className="relative w-20 h-20 border rounded-md overflow-hidden mt-2">
        //           <Image
        //             src={preview}
        //             alt="Preview"
        //             width={"80"}
        //             height={"80"}
        //             className="w-full h-full object-cover"
        //           />
        //           <button
        //             type="button"
        //             className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
        //             onClick={() => {
        //               setPreview(null);
        //               setUploadedImage(undefined);
        //             }}
        //           >
        //             <XCircle className="w-5 h-5" />
        //           </button>
        //         </div>
        //       )}
        //       <div>
        //         <div className="border-2 border-dashed rounded-md py-3 px-3">
        //           <input
        //             type="file"
        //             accept="image/*"
        //             onChange={handleImageUpload}
        //             className="block w-full text-sm text-gray-500
        //                               file:mr-4 file:py-2 file:px-4
        //                               file:rounded-md file:border-0
        //                               file:text-sm file:font-semibold
        //                               file:bg-[#035140] file:text-white
        //                               hover:file:bg-[#035140]"
        //           />
        //         </div>
        //       </div>
        //     </div>
        //   </div>
        // }
      />

      {/* View Event Modal */}
      <ViewEventModal
        open={viewModalOpen}
        onClose={handleCloseViewModal}
        eventData={singleEventData?.data}
        isLoading={isSingleEventLoading}
        onEditClick={() => {
          if (singleEventData?.data) {
            handleCloseViewModal();
            handleOpenModal(singleEventData.data);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Paper>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load events
          </Alert>
        ) : events.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No events found. Click Add New Event to create one.
          </Typography>
        ) : (
          <ReusableTable<Event>
            columns={columns}
            data={events}
          />
        )}
      </Paper>
    </Box>
  );
};

export default Event;