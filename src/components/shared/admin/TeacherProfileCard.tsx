import { useGetTeacherByIdQuery } from "@/app/store/api/classes/classApi";
import { getUserInfoFromToken, loader } from "@/app/utils/helper/tokenHelper";
import { ContentCopy } from "@mui/icons-material";
import { Alert, Avatar, Box, Chip, IconButton, Paper, Typography } from "@mui/material";
import Image from "next/image";

// Teacher card
export const TeacherProfileCard = () => {
    const userInfo = getUserInfoFromToken();
    const {
        data: teachers,
        isLoading: isStudentLoading,
        isError: isStudentError
    } = useGetTeacherByIdQuery(userInfo?.id, {
        skip: userInfo?.role !== "TEACHER",
    });

    if (isStudentLoading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "120px",
                    width: "100%",
                }}
            >
                {loader}
            </Box>
        );
    }

    if (isStudentError || !teachers?.data) {
        return (
            <Alert
                severity="error"
                sx={{
                    m: 1.5,
                    borderRadius: "8px",
                    alignItems: "center",
                }}
            >
                Failed to load student profile
            </Alert>
        );
    }

    const {
        name,
        avatar,
        phone,
        class: studentClass,
        teacherUniqueId,
    } = teachers.data;

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: "12px",
                bgcolor: "rgba(255, 255, 255, 0.1)",
                p: 2,
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background:
                    "linear-gradient(135deg, rgba(26, 60, 52, 0.9), rgba(26, 60, 52, 0.7))",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
                },
            }}
        >
            <Box display="grid" gap={2} flexDirection="column">
                <Avatar
                    sx={{
                        width: 80,
                        height: 80,
                        border: "3px solid rgba(255, 255, 255, 0.2)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                    className="block mx-auto"
                >
                    <Image
                        src={avatar || "/default-avatar.png"}
                        alt={`${name}'s profile`}
                        width={80}
                        height={80}
                        style={{
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                        }}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/default-avatar.png";
                        }}
                    />
                </Avatar>

                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        color="white"
                        sx={{
                            mb: 0.5,
                            lineHeight: 1.3,
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        {name}
                    </Typography>

                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={1}
                        flexWrap="wrap"
                        sx={{ mb: 1 }}
                    >
                        <Chip
                            label={`${phone}`}
                            size="small"
                            sx={{
                                bgcolor: "rgba(255, 255, 255, 0.15)",
                                color: "white",
                                fontWeight: 500,
                                height: "24px",
                            }}
                        />

                        {studentClass?.name && (
                            <Chip
                                label={`${studentClass.name}`}
                                size="small"
                                sx={{
                                    bgcolor: "rgba(255, 255, 255, 0.15)",
                                    color: "white",
                                    fontWeight: 500,
                                    height: "24px",
                                }}
                            />
                        )}
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            mb: 1.5,
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                color: "rgba(255, 255, 255, 0.7)",
                                fontFamily: "monospace",
                            }}
                        >
                            ID: {teacherUniqueId}
                        </Typography>
                        <IconButton
                            size="small"

                            sx={{
                                color: "rgba(255, 255, 255, 0.7)",
                                "&:hover": {
                                    color: "white",
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                },
                            }}
                        >
                            <ContentCopy fontSize="inherit" />
                        </IconButton>
                    </Box>

                </Box>
            </Box>
        </Paper>
    );
};