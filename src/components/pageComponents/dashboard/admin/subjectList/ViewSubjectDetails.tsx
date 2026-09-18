import { Box, Button, Divider, Paper, Typography } from "@mui/material";
import { FiEdit, FiTrash } from "react-icons/fi";



const ViewSubjectDetails = () => {
  
  return (
    <Box sx={{ padding: 4, backgroundColor: "#f9f9f9" }}>
      {/* Back Button */}
      <Button
        variant="text"
        sx={{
          color: "#1A3C34",
          marginBottom: 2,
          fontWeight: "bold",
          textTransform: "none",
        }}
      >
        Back / View Subject
      </Button>

      <Paper sx={{ padding: 3, borderRadius: 2 }}>
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Subject Information
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              sx={{
                borderColor: "#1A3C34",
                color: "#1A3C34",
                textTransform: "none",
                fontSize: "14px",
              }}
              startIcon={<FiEdit />}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderColor: "#FF5252",
                color: "#FF5252",
                textTransform: "none",
                fontSize: "14px",
              }}
              startIcon={<FiTrash />}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#1A3C34",
                color: "#fff",
                textTransform: "none",
                fontSize: "14px",
                "&:hover": { backgroundColor: "#145D4A" },
              }}
            >
              Export
            </Button>
          </Box>
        </Box>

        <Divider sx={{ marginY: 3 }} />

        {/* Subject Information */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            columnGap: "180px",
            marginBottom: 4,
          }}
        >
          {/* Subject */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              Subject:
            </Typography>
            <Typography variant="body2">Mathematics</Typography>
          </Box>

          {/* Stream */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              Stream:
            </Typography>
            <Typography variant="body2">Science</Typography>
          </Box>

          {/* Max Student */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              Max student:
            </Typography>
            <Typography variant="body2">120 students</Typography>
          </Box>

          {/* Subject Code */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              Subject Code:
            </Typography>
            <Typography variant="body2">#MATH101</Typography>
          </Box>

          {/* Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              Section:
            </Typography>
            <Typography variant="body2">Section-A</Typography>
          </Box>

          {/* Academic Year */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              Academic year:
            </Typography>
            <Typography variant="body2">2022-2024</Typography>
          </Box>
        </Box>

        {/* Subject Overview Section */}
        <Box sx={{ marginTop: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Subject Teachers
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#1A3C34",
                color: "#fff",
                textTransform: "none",
                fontSize: "14px",
                "&:hover": { backgroundColor: "#145D4A" },
              }}
            >
              + Assign Teacher
            </Button>
          </Box>

       
        </Box>
      </Paper>
    </Box>
  );
};

export default ViewSubjectDetails;