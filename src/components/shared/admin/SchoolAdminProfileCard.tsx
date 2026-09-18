import { useGetSchoolByIdQuery } from "@/app/store/api/createSchool/createSchoolApi";
import { getUserInfoFromToken, loader } from "@/app/utils/helper/tokenHelper";
import { Alert, Box, Paper } from "@mui/material";
import Image from "next/image";

// School Admin Profile Card Component
export const SchoolAdminProfileCard = () => {
  const userInfo = getUserInfoFromToken();
  const {
    data: superAdminData,
    isLoading: isSuperAdminLoading,
    isError: isSuperAdminError,
  } = useGetSchoolByIdQuery(userInfo?.id);

  const {
    data: schoolData,
    isLoading: isSchoolLoading,
    isError: isSchoolError,
  } = useGetSchoolByIdQuery(userInfo?.id);

  if (isSuperAdminLoading || isSchoolLoading) {
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

  if (
    isSuperAdminError ||
    !superAdminData?.data ||
    isSchoolError ||
    !schoolData?.data
  ) {
    return (
      <Alert
        severity="error"
        sx={{
          m: 1.5,
          borderRadius: "8px",
          alignItems: "center",
        }}
      >
        Failed to load profile data
      </Alert>
    );
  }

  const {
    name: schoolName,
    email: schoolEmail,
    avatar: schoolAvatar,
    branchPermission,
  } = schoolData.data;

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
      <Box display="flex" gap={2} alignItems="center">
        {/* Image */}
        <Image
          src={schoolAvatar || "/default-avatar.png"}
          alt={`${schoolName}'s profile`}
          width={80}
          height={80}
          className="w-12 h-12 rounded-full flex-shrink-0"
          style={{ objectFit: "cover" }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/default-avatar.png";
          }}
        />

        {/* Text container */}
        <div className="flex-1 min-w-0">
          <h1 className="text-white text-md font-semibold break-words">
            {schoolName}
          </h1>
          <p className="text-white text-sm break-words whitespace-normal">
            {schoolEmail}
          </p>
          <p className="text-white text-sm">Branch Limit: {branchPermission}</p>
        </div>
      </Box>
    </Paper>
  );
};
