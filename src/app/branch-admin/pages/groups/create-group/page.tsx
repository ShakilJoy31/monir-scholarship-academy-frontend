"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCreateGroupSubjectMutation } from "@/app/store/api/classes/groupApi";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSubjectsQuery } from "@/app/store/api/classes/subjectApi";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";

interface Class {
  id: number;
  name: string;
  branchId: number;
  createdAt: string;
  updatedAt: string;
}

interface Subject {
  id: number;
  name: string;
  // Add other subject properties if needed
}

interface CreateGroupPayload {
  classNameId: number;
  subjectNameId: number[];
}

const CreateGroupPage = () => {
  const router = useRouter();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [createGroup] = useCreateGroupSubjectMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Using RTK Query hooks to fetch data with proper typing
  const { data: classesData, isLoading: classesLoading } = useGetAllClassQuery(
    {}
  );
  const { data: subjectsData, isLoading: subjectsLoading } =
    useGetAllSubjectsQuery({});

  const classes: Class[] = classesData?.data || [];
  const subjects: Subject[] = subjectsData?.data || [];
  const loadingDropdowns = classesLoading || subjectsLoading;

  const handleSubjectToggle = (subjectId: number) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = async () => {
    if (isSubmitting || !selectedClassId) return;

    setIsSubmitting(true);
    try {
      if (selectedSubjectIds.length === 0) {
        toastShowing(
          "Please select at least one subject",
          "bottom-right",
          2000,
          "red",
          "white"
        );
        return;
      }

      const payload: CreateGroupPayload = {
        classNameId: selectedClassId,
        subjectNameId: selectedSubjectIds,
      };

      const response = await createGroup(payload).unwrap();

      if (response) {
        toastShowing(
          "Group created successfully",
          "bottom-right",
          2000,
          "green",
          "white"
        );
        router.push("/branch-admin/pages/groups");
      }
    } catch (err: unknown) {
      console.error("Error creating group:", err);
      let errorMessage = "Failed to create group";
      if (typeof err === "object" && err !== null && "data" in err) {
        const errorData = err as { data?: { message?: string } };
        errorMessage = errorData?.data?.message || errorMessage;
      }
      toastShowing(errorMessage, "bottom-right", 2000, "red", "white");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant="h4" component="h1">
          Add New Group
        </Typography>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ flex: 1, marginBottom: "1rem" }}
          >
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={selectedClassId || ""}
                onChange={(e) => setSelectedClassId(Number(e.target.value))}
                label="Class"
                disabled={loadingDropdowns}
              >
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </motion.div>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Select Subjects
          </Typography>

          <List
            sx={{
              maxHeight: 400,
              overflow: "auto",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              p: 0,
            }}
          >
            {subjects.map((subject) => (
              <ListItem
                key={subject.id}
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedSubjectIds.includes(subject.id)}
                      onChange={() => handleSubjectToggle(subject.id)}
                      color="primary"
                      disabled={loadingDropdowns}
                    />
                  }
                  label={subject.name}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <CancelButton
            onClick={() => router.push("/branch-admin/pages/groups")}
          >Cancel</CancelButton>

          <SubmitButton onClick={handleSubmit}
          >Submit</SubmitButton>
        </Box>
      </motion.div>
    </Box>
  );
};

export default CreateGroupPage;
