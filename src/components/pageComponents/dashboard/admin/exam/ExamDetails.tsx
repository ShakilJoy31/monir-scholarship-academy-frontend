import { Box, Paper, Typography } from "@mui/material";

const ExamDetails = () => {
  // Sample data
  const examDetails = {
    exam: "Mid-Term",
    subject: "English",
    date: "15 Dec, 2024",
    timeslot: "10:00 AM - 12:00 PM",
    examType: "Written",
    class: "Class-10",
    section: "Section-A",
    stream: "Science",
    academicYear: "2022-2024",
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, margin: 4 }}>
      <Box
        sx={{
          padding: 4,
          backgroundColor: "#fff",
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Content Grid */}
          {/* Content Grid */}
          <Box display="flex" alignItems="flex-start" gap={10}>
          {/* Left Column */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Exam:
              </Typography>
              <Typography variant="body2">{examDetails.exam}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Subject:
              </Typography>
              <Typography variant="body2">{examDetails.subject}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Date:
              </Typography>
              <Typography variant="body2">{examDetails.date}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Timeslot:
              </Typography> 
              <Typography variant="body2">{examDetails.timeslot}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Exam Type:
              </Typography>
              <Typography variant="body2">{examDetails.examType}</Typography>
            </Box>
          </Box>

          {/* Right Column */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Class:
              </Typography>
              <Typography variant="body2">{examDetails.class}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Section:
              </Typography>
              <Typography variant="body2">{examDetails.section}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Stream:
              </Typography>
              <Typography variant="body2">{examDetails.stream}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Academic Year:
              </Typography>
              <Typography variant="body2">{examDetails.academicYear}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ExamDetails;
