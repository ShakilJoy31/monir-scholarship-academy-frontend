// import {
//   Box,
//   Button,
//   Divider,
//   Grid,
//   IconButton,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
// } from "@mui/material";
// import { FiEdit, FiTrash } from "react-icons/fi";

// const TeacherDetails = () => {
//   return (
//     <Box sx={{ padding: 4, backgroundColor: "#f9f9f9" }}>
//       <Box
//         sx={{
//           marginTop: 2,
//           paddingY: 4,
//           display: "flex",
//           justifyContent: "space-between", // Properly spaces the button and the group of buttons
//           alignItems: "center", // Ensures vertical alignment
//         }}
//       >
//         {/* Left Button */}
//         <Button
//           variant="text"
//           sx={{
//             color: "#1A3C34",
//             fontWeight: "bold",
//             textTransform: "none",
//           }}
//         >
//           Back / Teacher details
//         </Button>

//         {/* Right Group of Buttons */}
//         <Box
//           sx={{
//             display: "flex",
//             gap: 2, // Adds consistent spacing between buttons
//           }}
//         >
//           <Button
//             variant="outlined"
//             startIcon={<FiEdit />}
//             sx={{
//               borderColor: "#1A3C34",
//               color: "#1A3C34",
//               fontSize: "14px",
//               textTransform: "none",
//             }}
//           >
//             Edit
//           </Button>
//           <Button
//             variant="outlined"
//             startIcon={<FiTrash />}
//             sx={{
//               borderColor: "#FF5252",
//               color: "#FF5252",
//               fontSize: "14px",
//               textTransform: "none",
//             }}
//           >
//             Delete
//           </Button>
//           <Button
//             variant="contained"
//             sx={{
//               backgroundColor: "#1A3C34",
//               color: "#fff",
//               fontSize: "14px",
//               textTransform: "none",
//               "&:hover": {
//                 backgroundColor: "#145D4A",
//               },
//             }}
//           >
//             Export
//           </Button>
//         </Box>
//       </Box>
//       <Paper
//         sx={{
//           padding: 3,
//           borderRadius: 2,
//           border: "1px solid #e0e0e0",
//           backgroundColor: "#fff",
//         }}
//       >
//         {/* Header Section */}
//         <Grid container spacing={2} alignItems="center">
//           <Grid item xs={12} sm={3}>
//             <Box>
//               <img
//                 src="https://via.placeholder.com/150"
//                 alt="Teacher Avatar"
//                 style={{
//                   width: "100%",
//                   borderRadius: "8px",
//                   border: "1px solid #e0e0e0",
//                 }}
//               />
//             </Box>
//           </Grid>
//           <Grid item xs={12} sm={9}>
//             <Box>
//               <Typography variant="h6" fontWeight="bold">
//                 Md. Abdul Karim
//               </Typography>
//               <Typography variant="subtitle1" color="textSecondary">
//                 Senior Teacher
//               </Typography>
//               <Typography variant="body2" color="textSecondary">
//                 ID: #11101
//               </Typography>
//             </Box>
//           </Grid>
//         </Grid>

//         <Divider sx={{ marginY: 3 }} />

//         {/* Personal Information */}
//         <Box>
//           <Typography
//             variant="h6"
//             fontWeight="bold"
//             gutterBottom
//             sx={{ marginBottom: 2 }}
//           >
//             Personal Information
//           </Typography>
//           <Grid
//             container
//             spacing={2}
//             sx={{
//               padding: 2,
//             }}
//           >
//             <Grid item xs={12} sm={6}>
//               <Typography variant="body2" gutterBottom>
//                 <strong>Gender:</strong> Male
//               </Typography>
//               <Typography variant="body2" gutterBottom>
//                 <strong>Date of Birth:</strong> 15th March 1980
//               </Typography>
//               <Typography variant="body2" gutterBottom>
//                 <strong>Blood Group:</strong> A+ (ve)
//               </Typography>
//               <Typography variant="body2" gutterBottom>
//                 <strong>Religion:</strong> Islam
//               </Typography>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <Typography variant="body2" gutterBottom>
//                 <strong>Email:</strong> aminulhaq@gmail.com
//               </Typography>
//               <Typography variant="body2" gutterBottom>
//                 <strong>Address:</strong> House 12, Road 7, Dhanmondi,
//                 Dhaka-1205
//               </Typography>
//               <Typography variant="body2" gutterBottom>
//                 <strong>NID Number:</strong> 12345678901234567
//               </Typography>
//               <Typography variant="body2" gutterBottom>
//                 <strong>Phone:</strong> +8801644958456
//               </Typography>
//             </Grid>
//           </Grid>
//         </Box>
//         <Divider sx={{ marginY: 3 }} />
//         {/* Professional Information */}
//         <Box sx={{ marginTop: 4 }}>
//           <Typography
//             variant="h6"
//             fontWeight="bold"
//             gutterBottom
//             sx={{ marginBottom: 2 }}
//           >
//             Professional Information
//           </Typography>
//           <Grid
//             container
//             spacing={2}
//             sx={{
//               padding: 2,
//             }}
//           >
//             <Grid item xs={12} sm={6}>
//               <Typography variant="body2" gutterBottom>
//                 <strong>University/Institute:</strong> MIST
//               </Typography>
//               <Typography variant="body2" gutterBottom>
//                 <strong>Qualification:</strong> M.Sc in Mathematics
//               </Typography>
//               <Typography variant="body2" gutterBottom>
//                 <strong>Specialization/Subjects Taught:</strong> Mathematics,
//                 Physics, Statistics
//               </Typography>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <Typography variant="body2" gutterBottom>
//                 <strong>Start Date:</strong> 15th March 2020
//               </Typography>
//               <Typography variant="body2" gutterBottom>
//                 <strong>End Date:</strong> 15th March 2024
//               </Typography>
//               <Typography variant="body2" gutterBottom>
//                 <strong>City:</strong> Dhaka
//               </Typography>
//             </Grid>
//           </Grid>
//         </Box>
//         <Divider sx={{ marginY: 3 }} />
//         {/* Timetable Overview */}
//         <Box sx={{ marginTop: 4 }}>
//           <Box
//             sx={{
//               marginTop: 2,
//               paddingY: 2,
//               display: "flex",
//               justifyContent: "space-between", // Properly spaces the button and the group of buttons
//               alignItems: "center", // Ensures vertical alignment
//             }}
//           >
//             <Typography
//               variant="h6"
//               fontWeight="bold"
//               gutterBottom
//               sx={{ marginBottom: 2 }}
//             >
//               Timetable Overview
//             </Typography>
//             <Button
//               variant="contained"
//               sx={{
//                 marginTop: 2,
//                 backgroundColor: "#1A3C34",
//                 color: "#fff",
//                 "&:hover": {
//                   backgroundColor: "#145D4A",
//                 },
//               }}
//             >
//               + Add more
//             </Button>
//           </Box>

//           <TableContainer
//             component={Paper}
//             sx={{
//               border: "1px solid #e0e0e0",
//               borderRadius: "8px",
//             }}
//           >
//             <Table>
//               <TableHead>
//                 <TableRow>
//                   {[
//                     "Day",
//                     "Timeslot",
//                     "Class",
//                     "Stream",
//                     "Section",
//                     "Subject",
//                     "Action",
//                   ].map((header) => (
//                     <TableCell
//                       key={header}
//                       sx={{
//                         fontWeight: "bold",
//                         backgroundColor: "#f5f5f5",
//                         borderBottom: "1px solid #e0e0e0",
//                       }}
//                     >
//                       {header}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {["Monday", "Tuesday"].map((day, index) => (
//                   <TableRow key={index}>
//                     <TableCell>{day}</TableCell>
//                     <TableCell>9:00 AM - 11:00 AM</TableCell>
//                     <TableCell>Class 10</TableCell>
//                     <TableCell>Science</TableCell>
//                     <TableCell>Section-A</TableCell>
//                     <TableCell>Mathematics</TableCell>
//                     <TableCell>
//                       <IconButton color="primary">
//                         <FiEdit />
//                       </IconButton>
//                       <IconButton color="error">
//                         <FiTrash />
//                       </IconButton>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </Box>
//       </Paper>
//     </Box>
//   );
// };

// export default TeacherDetails;
