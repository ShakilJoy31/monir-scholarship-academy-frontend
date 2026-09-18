import { useGetSuperAdminByIdQuery } from "@/app/store/api/branch/branchApi";
import { getUserInfoFromToken, loader } from "@/app/utils/helper/tokenHelper";
import { Alert, Avatar, Box, Chip, Paper, Typography } from "@mui/material";
import Image from "next/image";

// Super Admin Profile Card Component
export const SuperAdminProfileCard = () => {
    const userInfo = getUserInfoFromToken();
    const {
        data: superAdminData,
        isLoading: isSuperAdminLoading,
        isError: isSuperAdminError
    } = useGetSuperAdminByIdQuery(userInfo?.id);

    if (isSuperAdminLoading) {
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

    if (isSuperAdminError || !superAdminData?.data) {
        return (
            <Alert
                severity="error"
                sx={{
                    m: 1.5,
                    borderRadius: "8px",
                    alignItems: "center",
                }}
            >
                Failed to load super admin profile
            </Alert>
        );
    }

    const {
        name,
        email,
        avatar,
    } = superAdminData.data;


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
                            label={`Email: ${email}`}
                            size="small"
                            sx={{
                                bgcolor: "rgba(255, 255, 255, 0.15)",
                                color: "white",
                                fontWeight: 500,
                                height: "24px",
                            }}
                        />
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
                    </Box>

                    {/* <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <SubmitButton onClick={() => router.push(`/super-admin/pages/super-admin-profile/${userInfo?.id}`)}
                            sx={{
                                bgcolor: "rgba(255, 255, 255, 0.1)",
                                color: "white",
                                mb: '10px',
                                border: "1px solid rgba(255, 255, 255, 0.3)",
                                "&:hover": {
                                    bgcolor: "rgba(255, 255, 255, 0.2)",
                                },
                            }}
                        >
                            Profile
                        </SubmitButton>

                        <CancelButton onClick={() => router.push('/super-admin/pages/change-password')}
                            
                            sx={{

                                bgcolor: "transparent",
                                color: "white",
                                border: "1px solid rgba(255, 255, 255, 0.3)",
                                "&:hover": {
                                    bgcolor: "rgba(255, 255, 255, 0.1)",
                                },
                            }}
                        >
                            Change Password
                        </CancelButton>
                    </Box> */}


                </Box>
            </Box>
        </Paper>
    );
};