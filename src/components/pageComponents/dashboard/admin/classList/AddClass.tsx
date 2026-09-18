import {
  Box,
  Button,
  Divider,
  Paper,
  Typography,
} from "@mui/material";

const AddClass = () => {
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
        Back / Add Class
      </Button>

      <Paper sx={{ padding: 3, borderRadius: 2 }}>
        {/* Class Information */}
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ marginBottom: 1, marginTop: 1 }}
        >
          Class Information
        </Typography>
        <Divider sx={{ marginBottom: 3 }} />

        {/* <Grid container spacing={2}>
        
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Class
            </Typography>
            <TextField fullWidth size="medium" select variant="outlined">
              <MenuItem value="10">Class 10</MenuItem>
              <MenuItem value="11">Class 11</MenuItem>
              <MenuItem value="12">Class 12</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Academic year
            </Typography>
            <TextField fullWidth size="medium" select variant="outlined">
              <MenuItem value="2023">2023</MenuItem>
              <MenuItem value="2024">2024</MenuItem>
              <MenuItem value="2025">2025</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Max student
            </Typography>
            <TextField
              fullWidth
              size="medium"
              variant="outlined"
              placeholder="Input"
            />
          </Grid>

        
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Class Code
            </Typography>
            <TextField
              fullWidth
              size="medium"
              variant="outlined"
              placeholder='Input Example: "10A"'
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Section
            </Typography>
            <TextField fullWidth size="medium" select variant="outlined">
              <MenuItem value="A">Section A</MenuItem>
              <MenuItem value="B">Section B</MenuItem>
              <MenuItem value="C">Section C</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Stream
            </Typography>
            <TextField fullWidth size="medium" select variant="outlined">
              <MenuItem value="Science">Science</MenuItem>
              <MenuItem value="Commerce">Commerce</MenuItem>
              <MenuItem value="Arts">Arts</MenuItem>
            </TextField>
          </Grid>
        </Grid> */}

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 4,
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            sx={{
              borderColor: "#1A3C34",
              color: "#1A3C34",
              textTransform: "none",
              fontSize: "14px",
            }}
          >
            Cancel
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
            Save
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddClass;
