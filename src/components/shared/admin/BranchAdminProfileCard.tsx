import { useGetBranchAdminByIdQuery } from "@/app/store/api/branch/branchApi";
import { getUserInfoFromToken, loader } from "@/app/utils/helper/tokenHelper";
import { Alert, Box, Paper } from "@mui/material";
import Image from "next/image";

// Branch Admin Profile Card Component
export const BranchAdminProfileCard = () => {
    const userInfo = getUserInfoFromToken();
    const {
        data: adminData,
        isLoading: isAdminLoading,
        isError: isAdminError,
    } = useGetBranchAdminByIdQuery(userInfo?.id, {
        skip: userInfo?.role !== "ADMIN",
    });

    if (isAdminLoading) {
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

    if (isAdminError || !adminData?.data) {
        return (
            <Alert
                severity="error"
                sx={{
                    m: 1.5,
                    borderRadius: "8px",
                    alignItems: "center",
                }}
            >
                Failed to load admin profile
            </Alert>
        );
    }

    const {
        name,
        avatar,
        branch,
        branchId
    } = adminData.data;

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
                <div className="flex gap-x-4">
                    <Image
                        src={avatar || "/default-avatar.png"}
                        alt={`${name}'s profile`}
                        width={80}
                        height={80}
                        className="w-12 h-12 rounded-full "
                        style={{
                            objectFit: "cover",

                        }}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/default-avatar.png";
                        }}
                    />

                    <div>
                        <p className="text-white text-md">Branch ID: {branchId}</p>
                        <h1 className="text-white text-md">{name}</h1>
                    </div>
                </div>

                {branch?.name && (
                    <h1 className="text-white text-sm w-64 break-words whitespace-normal pr-2">{branch.name}</h1>
                )}

            </Box>
        </Paper>
    );
};