"use client";
import React from "react";
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useParams } from "next/navigation";
import { useGetPageByIdQuery } from "../store/api/classes/PageApi";
import { buttonLoader } from "../utils/helper/tokenHelper";
import PublicNavigation from "@/components/pageComponents/publicComponent/publicNavigation/page";
import Footer from "@/components/pageComponents/publicComponent/footer/page";
import CancelButton from "@/components/shared/reusable-component/CancelButton";

const PageContent = () => {
    const params = useParams();
    const id = params.id as string;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const { data: responseData } = useGetPageByIdQuery(id, { skip: !id });
    const isLoading = false;
    const isError = false;
    const data = responseData?.data;

    return (
        <Box sx={{
            maxWidth: '100%',
            overflowX: 'hidden'
        }}>
            <div className="bg-[#035140]">
                <PublicNavigation />
            </div>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : isError ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                    Failed to load page content
                </Alert>
            ) : data ? (
                <Paper sx={{
                    p: { xs: 2, sm: 3 },
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    

                    <Typography
                        variant={isMobile ? "h4" : "h3"}
                        component="h1"
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            textAlign: 'center',
                            px: { xs: 1, sm: 0 },
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                        }}
                        gutterBottom
                    >
                        {data.title}
                    </Typography>

                    <Box sx={{
                        mt: { xs: 2, sm: 3 },
                        maxWidth: 1260,
                        mx: 'auto',
                        px: { xs: 1, sm: 2 },
                        '& img': {
                            maxWidth: '100%',
                            height: 'auto'
                        }
                    }}>
                         <CancelButton onClick={() => window.history.back()}>Back</CancelButton>
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {data.content}
                        </ReactMarkdown>
                    </Box>
                </Paper>
            ) : (
                <Typography variant="body1" color="textSecondary" sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh"
                }}>
                    {buttonLoader}
                </Typography>
            )}
            <Footer />
        </Box>
    );
};

export default PageContent;