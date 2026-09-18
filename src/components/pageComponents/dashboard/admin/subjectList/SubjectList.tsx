import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";


// Define interface for subject data


const SubjectList: React.FC = () => {


  return (
    <Box sx={{ padding: 4, backgroundColor: "#f9f9f9" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 3,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Home / Subject
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
          >
            Export
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
            + Add Subject
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper
        sx={{
          padding: 2,
          marginBottom: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <TextField
          label="All student"
          fullWidth
          size="small"
          variant="outlined"
        />
        <TextField
          label="ID type here"
          fullWidth
          size="small"
          variant="outlined"
          InputProps={{
            endAdornment: (
              <Box sx={{ marginRight: "-10px", color: "#6b6b6b" }}>🔍</Box>
            ),
          }}
        />
        <TextField
          label="Class"
          select
          fullWidth
          size="small"
          variant="outlined"
        >
          <MenuItem value="10">Class 10</MenuItem>
          <MenuItem value="11">Class 11</MenuItem>
        </TextField>
        <TextField
          label="Section"
          select
          fullWidth
          size="small"
          variant="outlined"
        >
          <MenuItem value="A">Section A</MenuItem>
          <MenuItem value="B">Section B</MenuItem>
        </TextField>
        <TextField
          label="Stream"
          select
          fullWidth
          size="small"
          variant="outlined"
        >
          <MenuItem value="Science">Science</MenuItem>
          <MenuItem value="Commerce">Commerce</MenuItem>
          <MenuItem value="Arts">Arts</MenuItem>
        </TextField>
      </Paper>

    
    </Box>
  );
};

export default SubjectList;