"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Select, MenuItem, InputLabel, FormControl, TextField, CircularProgress } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";
import { useGetAllPageGroupsQuery } from "@/app/store/api/classes/pageGroupApi";
import { useGetPageByIdQuery, useUpdatePageMutation } from "@/app/store/api/classes/PageApi";
import { useAddThumbnailMutation } from "@/app/store/api/file/fileApi";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";


const SunEditor = dynamic(() => import("suneditor-react"), {
    ssr: false,
});

const EditPage = () => {
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
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const { data: pageGroups } = useGetAllPageGroupsQuery({});
    const [updatePage] = useUpdatePageMutation();
    const [addThumbnail] = useAddThumbnailMutation();
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

    const handleImageUploadBefore = (
        files: File[],
        info: object,
        uploadHandler: (response: { result?: Array<{ url: string; name: string; size: number }>; error?: { message: string } }) => void
    ) => {
        const file = files[0];
        setIsUploadingImage(true);

        (async () => {
            try {
                const formData = new FormData();
                formData.append("photo", file);

                const response = await addThumbnail(formData).unwrap();

                if (response?.data?.[0]) {
                    uploadHandler({
                        result: [{
                            url: response.data[0],
                            name: file.name,
                            size: file.size,
                        }],
                    });
                } else {
                    throw new Error('Image upload failed');
                }
            } catch (error) {
                console.error('Image upload error:', error);
                toastShowing(
                    'Failed to upload image',
                    'bottom-right',
                    2000,
                    'red',
                    'white'
                );
                uploadHandler({
                    error: {
                        message: 'Image upload failed'
                    }
                });
            } finally {
                setIsUploadingImage(false);
            }
        })();

        return false;
    };

    const handleSubmit = async () => {
        console.log(existingPage?.data?.id)
        setIsLoading(true);
        try {
            const pageData = {
                groupId: Number(groupId),
                title,
                slug,
                content,
                seoTitle: seoTitle || null,
                seoDescription: seoDescription || null,
                status
            };

            await updatePage({ id: Number(existingPage?.data?.id), ...pageData }).unwrap();
            toastShowing('Page updated successfully', 'bottom-right', 2000, 'green', 'white');
            router.push('/branch-admin/pages/page-list');
        } catch (err) {
            toastShowing(
                (err as { data?: { message?: string } })?.data?.message || "Failed to update page",
                'bottom-right',
                2000,
                'red',
                'white'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-');
    };

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
                    Edit Page
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                <FormControl fullWidth>
                    <InputLabel id="page-group-label">Page Group</InputLabel>
                    <Select
                        labelId="page-group-label"
                        value={groupId}
                        label="Page Group"
                        onChange={(e) => setGroupId(e.target.value)}
                        required
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
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <MenuItem value="Published">Published</MenuItem>
                        <MenuItem value="Draft">Draft</MenuItem>
                        <MenuItem value="Trust">Trust</MenuItem>
                    </Select>
                </FormControl>
            </Box>

             <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => {
                    setTitle(e.target.value);
                    setSlug(generateSlug(e.target.value));
                }}
                sx={{ mb: 3 }}
                required
            />

            <TextField
                fullWidth
                label="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                sx={{ mb: 3 }}
                required
            />
            </Box>

            

            <Box sx={{ mb: 3, position: 'relative' }}>
                {isUploadingImage && (
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10
                    }}>
                        <CircularProgress />
                        <Typography variant="body2" sx={{ ml: 2 }}>
                            Uploading image...
                        </Typography>
                    </Box>
                )}
                <SunEditor
                    setContents={content}
                    onChange={setContent}
                    onImageUploadBefore={handleImageUploadBefore}
                    onImageUploadError={(errorMessage: string) => {
                        toastShowing(
                            `Image upload error: ${errorMessage}`,
                            'bottom-right',
                            2000,
                            'red',
                            'white'
                        );
                    }}
                    setOptions={{
                        defaultStyle: "font-size: 16px; font-family: arial; font-weight: normal;",
                        buttonList: [
                            ["undo", "redo"],
                            ["font", "fontSize", "formatBlock"],
                            ["bold", "underline", "italic", "strike", "subscript", "superscript"],
                            ["removeFormat"],
                            ["fontColor", "hiliteColor"],
                            ["outdent", "indent"],
                            ["align", "horizontalRule", "list", "table"],
                            ["link", "image", "video"],
                            ["fullScreen", "showBlocks", "codeView"],
                            ["preview", "print"],
                        ]
                    }}
                    height="400px"
                    placeholder="Write your page content here..."
                />
            </Box>

            <TextField
                fullWidth
                label="SEO Title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                sx={{ mb: 3 }}
            />

            <TextField
                fullWidth
                label="SEO Description"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                multiline
                rows={3}
                sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <CancelButton
                    onClick={() => router.push('/branch-admin/pages/page-list')}
                >Cancel</CancelButton>

                <SubmitButton
                    onClick={handleSubmit}
                    disabled={isLoading || isUploadingImage}
                >
                    {isLoading ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        <>
                             Update Page
                        </>
                    )}
                </SubmitButton>
            </Box>
        </motion.div>
    );
};

export default EditPage;