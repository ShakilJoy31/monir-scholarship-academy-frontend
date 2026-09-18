import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Button,
  Paper,
} from "@mui/material";

const Timetable = () => {
  const slots = [
    "Slot-1",
    "Slot-2",
    "Slot-3",
    "Slot-4",
    "Slot-5",
    "Slot-6",
    "Slot-7",
    "Slot-8",
  ];
  const days = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];
  const timeSlots = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
  ];

  return (
    <Paper elevation={3} sx={{ margin: 3 }}>
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{padding:3}}
      >
        <Typography variant="h6" fontWeight="bold">
          Weekly Class Timetable
        </Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" color="secondary">
            Export
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box display="flex" gap={2} mb={3} sx={{paddingLeft:3}}>
        <Select size="small" defaultValue="Class-10">
          <MenuItem value="Class-10">Class-10</MenuItem>
          <MenuItem value="Class-9">Class-9</MenuItem>
        </Select>
        <Select size="small" defaultValue="Section-A">
          <MenuItem value="Section-A">Section-A</MenuItem>
          <MenuItem value="Section-B">Section-B</MenuItem>
        </Select>
        <Select size="small" defaultValue="Science">
          <MenuItem value="Science">Science</MenuItem>
          <MenuItem value="Arts">Arts</MenuItem>
        </Select>
        <Select size="small" defaultValue="2023-2024">
          <MenuItem value="2023-2024">2023-2024</MenuItem>
          <MenuItem value="2022-2023">2022-2023</MenuItem>
        </Select>
      </Box>

      {/* Timetable */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1A3C34" }}>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "white",
                  borderRight: "1px solid white", 
                }}
              >
                Day
              </TableCell>

              {slots.map((slot, index) => (
                <TableCell
                  key={index}
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    borderRight: "1px solid white", 
                  }}
                >
                  {slot}
                </TableCell>
              ))}
            </TableRow>
            <TableRow sx={{ backgroundColor: "#1A3C34" }}>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "white",
                  borderRight: "1px solid white", 
                }}
              >
                Time Slot
              </TableCell>

              {timeSlots.map((timeSlot, index) => (
                <TableCell
                  key={index}
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    borderRight: "1px solid white",
                  }}
                >
                  {timeSlot}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {days.map((day, dayIndex) => (
              <TableRow key={dayIndex}>
                <TableCell sx={{borderRight: "1px solid rgb(172, 170, 170)",}}>{day}</TableCell>
              
                {slots.map((_, slotIndex) => (
                  <TableCell
                    key={slotIndex}
                    align="center"
                    sx={{
                      backgroundColor:
                        dayIndex === 0 && slotIndex === 0
                          ? "#DCFCE7"
                          : "transparent",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "#E5E7EB",
                      },
                      borderRight: "1px solid rgb(172, 170, 170)",
                    }}
                  >
                    {dayIndex === 0 && slotIndex === 0 ? (
                      <Button variant="contained" color="primary" size="small">
                        Assign
                      </Button>
                    ) : (
                      ""
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Timetable;
