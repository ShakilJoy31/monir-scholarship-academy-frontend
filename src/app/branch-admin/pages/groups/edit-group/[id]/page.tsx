"use client";
import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Checkbox,
    FormControlLabel,
    List,
    ListItem,
    IconButton,
    InputAdornment,
} from "@mui/material";
import { BookOpen, ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useUpdateGroupSubjectMutation, useGetGroupSubjectByIdQuery } from "@/app/store/api/classes/groupApi";
import { useGetAllSubjectsQuery } from "@/app/store/api/classes/subjectApi";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";

interface Subject {
    id: number;
    branchId: number;
    name: string;
    code: string;
    createdAt: string;
    updatedAt: string;
}

interface Class {
    id: number;
    branchId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

interface GroupSubjectData {
    id: number;
    branchId: number;
    classNameId: number;
    subjectNameId: number;
    createdAt: string;
    updatedAt: string;
    class: Class;
    subject: Subject;
}

interface GroupResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: GroupSubjectData;
}

const EditGroupPage = () => {
    const router = useRouter();
    const [className, setClassName] = useState("");
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
    const [updateGroup, ] = useUpdateGroupSubjectMutation();
    const pathname = usePathname();
    const groupId = pathname.split('/').pop();

    const { data: groupData } = useGetGroupSubjectByIdQuery(Number(groupId));
    const { data: subjectsData } = useGetAllSubjectsQuery({});
    const subjects: Subject[] = subjectsData?.data || [];

    useEffect(() => {
        if (groupData) {
            const data = (groupData as GroupResponse).data;
            setClassName(data.class.name);
            setSelectedSubjectId(data.subject.id);
        }
    }, [groupData]);

    const handleSubjectToggle = (subjectId: number) => {
        setSelectedSubjectId(subjectId);
    };

    const handleSubmit = async () => {
        try {
            if (!className.trim()) {
                toast.error("Class name cannot be empty");
                return;
            }

            if (!selectedSubjectId) {
                toast.error("Please select a subject");
                return;
            }

            const payload = {
                id: Number(groupId),
                classNameId: (groupData as GroupResponse).data.class.id,
                subjectNameId: selectedSubjectId,
            }

            console.log("Payload for update:", payload);
            await updateGroup(payload).unwrap();
            toastShowing('Group subject updated successfully', 'bottom-right', 2000, 'green', 'white');
            router.push("/branch-admin/pages/groups");
        } catch (err) {
            toast.error("Failed to update group subject");
            console.error("Error updating group subject:", err);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                <IconButton onClick={() => router.push("/branch-admin/pages/groups")} sx={{ mr: 2 }}>
                    <ArrowLeft size={24} />
                </IconButton>
                <Typography variant="h4" component="h1">
                    Edit Group Subject
                </Typography>
            </Box>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Box sx={{ mb: 4 }}>
                    <TextField
                        fullWidth
                        label="Class Name"
                        variant="outlined"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        disabled // Class name should be read-only as it's referenced by ID
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <BookOpen size={20} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Select Subject
                    </Typography>

                    <List sx={{
                        maxHeight: 400,
                        overflow: 'auto',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        p: 0
                    }}>
                        {subjects.map((subject) => (
                            <ListItem key={subject.id} sx={{
                                borderBottom: '1px solid #f0f0f0',
                                '&:last-child': { borderBottom: 'none' }
                            }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={selectedSubjectId === subject.id}
                                            onChange={() => handleSubjectToggle(subject.id)}
                                            color="primary"
                                        />
                                    }
                                    label={`${subject.name} (${subject.code})`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <CancelButton
                        onClick={() => router.push("/branch-admin/pages/groups")}
                    >Cancel</CancelButton>

                    <SubmitButton onClick={handleSubmit}
                    >Update</SubmitButton>
                </Box>
            </motion.div>
        </Box>
    );
};

export default EditGroupPage;