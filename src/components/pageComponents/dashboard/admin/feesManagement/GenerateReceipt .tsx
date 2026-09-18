// /* eslint-disable @typescript-eslint/ban-ts-comment */
// import {
//   Box,
//   Button,
//   Checkbox,
//   Divider,
//   Grid,
//   InputAdornment,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
//   Typography,
// } from "@mui/material";
// import { useState } from "react";
// import { IoSearchCircleOutline } from "react-icons/io5";

// const GenerateReceipt = () => {
//   const [checkedItems, setCheckedItems] = useState({
//     tuitionFee: true,
//     labFee: false,
//     examFee: true,
//   });

//   const handleCheckboxChange = (name: any) => {
//     setCheckedItems((prev) => ({
//       ...prev,
//       //@ts-ignore
//       [name]: !prev[name],
//     }));
//   };

//   return (
//     <Box sx={{ padding: "24px", fontFamily: "'Roboto', sans-serif" }}>
//       {/* Title */}
//       <Typography
//         variant="body1"
//         sx={{ fontSize: "18px", fontWeight: "400", marginBottom: "16px" }}
//       >
//         Home / Generate receipt
//       </Typography>

//       {/* Main Paper */}
//       <Paper elevation={1} sx={{ padding: "16px" }}>
//         <Grid container spacing={2}>
//           {/* Left Column: Student Information */}
//           <Grid
//             item
//             xs={12}
//             md={6}
//             sx={{
//               borderRight: "1px solid #ccc",
//               paddingRight: "16px",
//             }}
//           >
//             <Typography
//               variant="h6"
//               sx={{
//                 fontSize: "18px",
//                 fontWeight: "500",
//                 marginBottom: "8px",
//               }}
//             >
//               Student Information
//             </Typography>
//             <Divider sx={{ marginBottom: "16px" }} />

//             {/* Search Input */}
//             <TextField
//               variant="outlined"
//               placeholder="Search by Student ID"
//               size="small"
//               fullWidth
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IoSearchCircleOutline
//                       style={{ fontSize: "20px", color: "#999" }}
//                     />
//                   </InputAdornment>
//                 ),
//               }}
//               sx={{
//                 marginBottom: "24px",
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: "8px",
//                   fontSize: "14px",
//                 },
//               }}
//             />

//             {/* Student Details */}
//             <Typography
//               variant="body1"
//               sx={{
//                 fontSize: "16px",
//                 fontWeight: "500",
//                 marginBottom: "16px",
//               }}
//             >
//               Student information
//             </Typography>

//             <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                 }}
//               >
//                 <Typography
//                   variant="body2"
//                   sx={{ fontSize: "14px", fontWeight: "500", color: "#333" }}
//                 >
//                   Student Name:
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   sx={{ fontSize: "14px", fontWeight: "400", color: "#555" }}
//                 >
//                   Md Fahim Hasan
//                 </Typography>
//               </Box>

//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                 }}
//               >
//                 <Typography
//                   variant="body2"
//                   sx={{ fontSize: "14px", fontWeight: "500", color: "#333" }}
//                 >
//                   Class:
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   sx={{ fontSize: "14px", fontWeight: "400", color: "#555" }}
//                 >
//                   Class-10
//                 </Typography>
//               </Box>

//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                 }}
//               >
//                 <Typography
//                   variant="body2"
//                   sx={{ fontSize: "14px", fontWeight: "500", color: "#333" }}
//                 >
//                   Section:
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   sx={{ fontSize: "14px", fontWeight: "400", color: "#555" }}
//                 >
//                   Section-A
//                 </Typography>
//               </Box>

//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                 }}
//               >
//                 <Typography
//                   variant="body2"
//                   sx={{ fontSize: "14px", fontWeight: "500", color: "#333" }}
//                 >
//                   Stream:
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   sx={{ fontSize: "14px", fontWeight: "400", color: "#555" }}
//                 >
//                   Science
//                 </Typography>
//               </Box>
//             </Box>
//           </Grid>

//           {/* Right Column: Payment Information */}
//           <Grid item xs={12} md={6}>
//             <Typography
//               variant="h6"
//               sx={{
//                 fontSize: "18px",
//                 fontWeight: "500",
//                 marginBottom: "8px",
//               }}
//             >
//               Payment Information
//             </Typography>
//             <Divider sx={{ marginBottom: "16px" }} />
//             <Grid container>
//               {/* First Column */}
//               <Grid item xs={6} sx={{ paddingRight: "10px" }}>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     marginBottom: "8px",
//                   }}
//                 >
//                   <Typography
//                     variant="body2"
//                     sx={{
//                       fontSize: "14px",
//                       fontWeight: "500",
//                       color: "#333",
//                     }}
//                   >
//                     Receipt ID:
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     sx={{
//                       fontSize: "14px",
//                       fontWeight: "400",
//                       color: "#555",
//                     }}
//                   >
//                     #16485426
//                   </Typography>
//                 </Box>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     marginBottom: "8px",
//                   }}
//                 >
//                   <Typography
//                     variant="body2"
//                     sx={{
//                       fontSize: "14px",
//                       fontWeight: "500",
//                       color: "#333",
//                     }}
//                   >
//                     Payment Method:
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     sx={{
//                       fontSize: "14px",
//                       fontWeight: "400",
//                       color: "#555",
//                     }}
//                   >
//                     Bank Transfer
//                   </Typography>
//                 </Box>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     marginBottom: "8px",
//                   }}
//                 >
//                   <Typography
//                     variant="body2"
//                     sx={{
//                       fontSize: "14px",
//                       fontWeight: "500",
//                       color: "#333",
//                     }}
//                   >
//                     Payment Date:
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     sx={{
//                       fontSize: "14px",
//                       fontWeight: "400",
//                       color: "#555",
//                     }}
//                   >
//                     15 Dec, 2024
//                   </Typography>
//                 </Box>
//               </Grid>

//               {/* Second Column */}
//               <Grid item xs={6}>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     marginBottom: "8px",
//                   }}
//                 >
//                   <Typography
//                     variant="body2"
//                     sx={{
//                       fontSize: "14px",
//                       fontWeight: "500",
//                       color: "#333",
//                     }}
//                   >
//                     Total Amount:
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     sx={{
//                       fontSize: "14px",
//                       fontWeight: "400",
//                       color: "#555",
//                     }}
//                   >
//                     ৳10,000
//                   </Typography>
//                 </Box>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     marginBottom: "8px",
//                   }}
//                 >
//                   <Typography
//                     variant="body2"
//                     sx={{
//                       fontSize: "14px",
//                       fontWeight: "500",
//                       color: "#333",
//                     }}
//                   >
//                     Paid Amount:
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     sx={{
//                       fontSize: "14px",
//                       fontWeight: "400",
//                       color: "#555",
//                     }}
//                   >
//                     ৳8,000
//                   </Typography>
//                 </Box>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     marginBottom: "8px",
//                   }}
//                 >
//                   <Typography
//                     variant="body2"
//                     sx={{
//                       fontSize: "14px",
//                       fontWeight: "500",
//                       color: "#333",
//                     }}
//                   >
//                     Due Amount:
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     sx={{
//                       fontSize: "14px",
//                       fontWeight: "400",
//                       color: "#555",
//                     }}
//                   >
//                     ৳2,000
//                   </Typography>
//                 </Box>
//               </Grid>
//             </Grid>

//             {/* Payment Summary */}
//             <Box sx={{ marginTop: "24px" }}>
//               <Typography
//                 variant="h6"
//                 sx={{
//                   fontSize: "18px",
//                   fontWeight: "500",
//                   marginBottom: "8px",
//                 }}
//               >
//                 Payment Summary
//               </Typography>
//               <Divider sx={{ marginBottom: "16px" }} />

//               <TableContainer>
//                 <Table
//                   sx={{
//                     minWidth: "100%",
//                     border: "1px solid #ccc",
//                   }}
//                 >
//                   <TableHead>
//                     <TableRow>
//                       <TableCell
//                         sx={{
//                           fontWeight: "500",
//                           backgroundColor: "#f9f9f9",
//                           border: "1px solid #ccc",
//                         }}
//                       >
//                         Fees Component
//                       </TableCell>
//                       <TableCell
//                         sx={{
//                           fontWeight: "500",
//                           backgroundColor: "#f9f9f9",
//                           border: "1px solid #ccc",
//                         }}
//                       >
//                         Amount
//                       </TableCell>
//                       <TableCell
//                         sx={{
//                           fontWeight: "500",
//                           backgroundColor: "#f9f9f9",
//                           border: "1px solid #ccc",
//                         }}
//                       >
//                         Paid
//                       </TableCell>
//                       <TableCell
//                         sx={{
//                           fontWeight: "500",
//                           backgroundColor: "#f9f9f9",
//                           border: "1px solid #ccc",
//                         }}
//                       >
//                         Remaining
//                       </TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     <TableRow>
//                       <TableCell sx={{ border: "1px solid #ccc" }}>
//                         <Checkbox
//                           checked={checkedItems.tuitionFee}
//                           onChange={() => handleCheckboxChange("tuitionFee")}
//                           sx={{
//                             color: "#006D37",
//                             "&.Mui-checked": { color: "#006D37" },
//                           }}
//                         />
//                         Tuition Fee
//                       </TableCell>
//                       <TableCell sx={{ border: "1px solid #ccc" }}>
//                         ৳6,000
//                       </TableCell>
//                       <TableCell sx={{ border: "1px solid #ccc" }}>
//                         ৳6,000
//                       </TableCell>
//                       <TableCell sx={{ border: "1px solid #ccc" }}>
//                         ৳0.00
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell sx={{ border: "1px solid #ccc" }}>
//                         <Checkbox
//                           checked={checkedItems.labFee}
//                           onChange={() => handleCheckboxChange("labFee")}
//                           sx={{
//                             color: "#006D37",
//                             "&.Mui-checked": { color: "#006D37" },
//                           }}
//                         />
//                         Lab Fee
//                       </TableCell>
//                       <TableCell sx={{ border: "1px solid #ccc" }}>
//                         ৳2,000
//                       </TableCell>
//                       <TableCell sx={{ border: "1px solid #ccc" }}>
//                         ৳0.00
//                       </TableCell>
//                       <TableCell sx={{ border: "1px solid #ccc" }}>
//                         ৳2,000
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell sx={{ border: "1px solid #ccc" }}>
//                         <Checkbox
//                           checked={checkedItems.examFee}
//                           onChange={() => handleCheckboxChange("examFee")}
//                           sx={{
//                             color: "#006D37",
//                             "&.Mui-checked": { color: "#006D37" },
//                           }}
//                         />
//                         Exam Fee
//                       </TableCell>
//                       <TableCell sx={{ border: "1px solid #ccc" }}>
//                         ৳2,000
//                       </TableCell>
//                       <TableCell sx={{ border: "1px solid #ccc" }}>
//                         ৳2,000
//                       </TableCell>
//                       <TableCell sx={{ border: "1px solid #ccc" }}>
//                         ৳0.00
//                       </TableCell>
//                     </TableRow>
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             </Box>
//           </Grid>
//         </Grid>

//         {/* Buttons */}
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "flex-end",
//             gap: "16px",
//             marginTop: "16px",
//           }}
//         >
//           <Button
//             variant="outlined"
//             color="secondary"
//             sx={{ minWidth: "120px" }}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             color="primary"
//             sx={{
//               minWidth: "120px",
//               backgroundColor: "#006D37",
//               "&:hover": { backgroundColor: "#00582E" },
//             }}
//           >
//             Generate
//           </Button>
//         </Box>
//       </Paper>
//     </Box>
//   );
// };

// export default GenerateReceipt;
