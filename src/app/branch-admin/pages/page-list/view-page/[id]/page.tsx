"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Select, MenuItem, InputLabel, FormControl, TextField, CircularProgress } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";
import { useGetAllPageGroupsQuery } from "@/app/store/api/classes/pageGroupApi";
import { useGetPageByIdQuery } from "@/app/store/api/classes/PageApi";
import CancelButton from "@/components/shared/reusable-component/CancelButton";


const SunEditor = dynamic(() => import("suneditor-react"), {
    ssr: false,
});

const ViewPage = () => {
    const router = useRouter();
    const params = useParams();
    const pageId = params.id as string;

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");
    const [status, setStatus] = useState("Draft");
    const [groupId, setGroupId] = useState("");

    const { data: pageGroups } = useGetAllPageGroupsQuery({});
    const { data: existingPage, isLoading: isPageLoading } = useGetPageByIdQuery(pageId, { skip: !pageId });

    useEffect(() => {
        if (existingPage) {
            setTitle(existingPage.data.title);
            setSlug(existingPage.data.slug);
            setContent(existingPage.data.content);
            setSeoTitle(existingPage.data.seoTitle || "");
            setSeoDescription(existingPage.data.seoDescription || "");
            setStatus(existingPage.data.status);
            setGroupId(existingPage.data.groupId.toString());
        }
    }, [existingPage]);

    if (isPageLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Box sx={{ mb: 4 }}>
                <CancelButton
                    onClick={() => window.history.back()}
                    sx={{
                        textTransform: 'none',
                        color: '#d32f2f',

                        py: { xs: 0.5, sm: 1 },
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                >
                    Back
                </CancelButton>

                <Typography variant="h4" sx={{ fontWeight: 600, color: '#1A3C34' }}>
                    View Page
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                <FormControl fullWidth>
                    <InputLabel id="page-group-label">Page Group</InputLabel>
                    <Select
                        labelId="page-group-label"
                        value={groupId}
                        label="Page Group"
                        disabled
                    >
                        {pageGroups?.data?.map((group: { id: number, title: string }) => (
                            <MenuItem key={group.id} value={group.id}>
                                {group.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                        labelId="status-label"
                        value={status}
                        label="Status"
                        disabled
                    >
                        <MenuItem value="Published">Published</MenuItem>
                        <MenuItem value="Draft">Draft</MenuItem>
                        <MenuItem value="Trust">Trust</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TextField
                fullWidth
                label="Title"
                value={title}
                disabled
                sx={{ mb: 3 }}
            />

            <TextField
                fullWidth
                label="Slug"
                value={slug}
                disabled
                sx={{ mb: 3 }}
            />

            <Box sx={{ mb: 3 }}>
                <SunEditor
                    setContents={content}
                    onChange={() => { }}
                    setOptions={{
                        defaultStyle: "font-size: 16px; font-family: arial; font-weight: normal;",
                        buttonList: [],
                        mode: 'balloon',
                    }}
                    height="400px"
                    disable={true}
                />
            </Box>

            <TextField
                fullWidth
                label="SEO Title"
                value={seoTitle}
                disabled
                sx={{ mb: 3 }}
            />

            <TextField
                fullWidth
                label="SEO Description"
                value={seoDescription}
                disabled
                multiline
                rows={3}
                sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <CancelButton
                    onClick={() => router.push('/branch-admin/pages/page-list')}
                >Back</CancelButton>
            </Box>
        </motion.div>
    );
};

export default ViewPage;