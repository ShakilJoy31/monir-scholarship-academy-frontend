// import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from "@mui/material";
// import Grid from "@mui/material/Grid2";
// import AddIcon from "@mui/icons-material/Add";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";

// const TeacherDetails = () => {
//   return (
//     <Paper elevation={3} sx={{ padding: 4, margin: 4 }}>
//       {/* Header Section */}
//       <Box display="flex" alignItems="center" gap={2}>
//         <img
//           src="https://via.placeholder.com/80"
//           alt="Teacher"
//           style={{ borderRadius: "8px" }}
//         />
//         <Box>
//           <Typography variant="h5" fontWeight="bold">
//             Md. Minhaz Akin
//           </Typography>
//           <Typography variant="body1">Senior Teacher</Typography>
//           <Typography variant="body2">ID: #1101</Typography>
//         </Box>
//       </Box>

//       {/* Personal Information */}
//       <Box mt={4}>
//         <Typography variant="h6" fontWeight="bold">
//           Personal Information
//         </Typography>
//         <Grid container spacing={2} mt={2}>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>Gender:</strong> Male</Typography>
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>Blood Group:</strong> A+ (ve)</Typography>
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>Date of Birth:</strong> 15th March 2012</Typography>
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>Email:</strong> minhaz@gmail.com</Typography>
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>NID:</strong> 01029382733</Typography>
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>Religion:</strong> Islam</Typography>
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>Address:</strong> House 12, Road 7, Dhanmondi, Dhaka-1205</Typography>
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>Phone:</strong> +880164695646</Typography>
//           </Grid>
//         </Grid>
//       </Box>

//       {/* Professional Information */}
//       <Box mt={4}>
//         <Typography variant="h6" fontWeight="bold">
//           Professional Information
//         </Typography>
//         <Grid container spacing={2} mt={2}>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>University/Institute:</strong> MIST</Typography>
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>Start Date:</strong> 10th January 2025</Typography>
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>Qualification:</strong> M.Sc in Mathematics</Typography>
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>End Date:</strong> Updating</Typography>
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>Specialization:</strong> Mathematics</Typography>
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>City:</strong> Dhaka</Typography>
//           </Grid>
//         </Grid>
//       </Box>

//       {/* Employee Details */}
//       <Box mt={4}>
//         <Typography variant="h6" fontWeight="bold">
//           Employment Details
//         </Typography>
//         <Grid container spacing={2} mt={2}>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>Stream:</strong> Science</Typography>
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>Assigned Section:</strong> A</Typography>
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>Assigned Class:</strong> Class 9, Class 10</Typography>
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Typography variant="body2"><strong>Start Date:</strong> 15th March 2024</Typography>
//           </Grid>
//         </Grid>
//       </Box>

//       {/* Timetable Overview */}
//       <Box mt={4}>
//         <Typography variant="h6" fontWeight="bold">
//           Timetable Overview
//         </Typography>
//         <Box mt={2}>
//           <TableContainer>
//             <Table>
//               <TableHead>
//                 <TableRow>
//                   <TableCell><strong>Day</strong></TableCell>
//                   <TableCell><strong>Timeslot</strong></TableCell>
//                   <TableCell><strong>Class</strong></TableCell>
//                   <TableCell><strong>Stream</strong></TableCell>
//                   <TableCell><strong>Section</strong></TableCell>
//                   <TableCell><strong>Subject</strong></TableCell>
//                   <TableCell><strong>Action</strong></TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {[1, 2, 3, 4].map((_, index) => (
//                   <TableRow key={index}>
//                     <TableCell>Monday</TableCell>
//                     <TableCell>9:00 AM - 10:00 AM</TableCell>
//                     <TableCell>Class 10</TableCell>
//                     <TableCell>Science</TableCell>
//                     <TableCell>Section-A</TableCell>
//                     <TableCell>Mathematics</TableCell>
//                     <TableCell>
//                       <IconButton color="primary"><EditIcon /></IconButton>
//                       <IconButton color="secondary"><DeleteIcon /></IconButton>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//           <Box mt={2} display="flex" justifyContent="flex-end">
//             <Button variant="contained" color="primary" startIcon={<AddIcon />}>
//               Add more
//             </Button>
//           </Box>
//         </Box>
//       </Box>
//     </Paper>
//   );
// };

// export default TeacherDetails;
