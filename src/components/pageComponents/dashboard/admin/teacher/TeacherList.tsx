// import {
//   Box,
//   Button,
//   MenuItem,
//   Paper,
//   TextField,
//   Typography,
// } from "@mui/material";
// import React from "react";
// import ReusableTable from "../../../../ui/common/ReusableTable";
// import CustomizedDialogs from "../../../../ui/common/modal";
// import TeacherDetails from "./TeacherDetails";
// import Link from "next/link";

// // Define interfaces for your data structure
// interface Teacher {
//   id: string;
//   name: string;
//   class: string;
//   section: string;
//   stream: string;
//   phone: string;
//   address: string;
// }

// interface Column {
//   label: string;
//   field: keyof Teacher;
// }

// const TeacherList: React.FC = () => {
//   // Define columns with proper typing
//   const columns: Column[] = [
//     { label: "ID", field: "id" },
//     { label: "Name", field: "name" },
//     { label: "Class", field: "class" },
//     { label: "Section", field: "section" },
//     { label: "Stream", field: "stream" },
//     { label: "Phone", field: "phone" },
//     { label: "Address", field: "address" },
//   ];

//   // Sample Data with proper typing
//   const data: Teacher[] = Array.from({ length: 20 }, (_, index) => ({
//     id: `#1110${index + 1}`,
//     name: "Md. Minaj akin",
//     class: "10",
//     section: "A",
//     stream: "Science",
//     phone: "+8801644958456",
//     address: "House 12, Road 7, Dhanmondi, Dhaka",
//   }));

//   const [open, setOpen] = React.useState(false);
//   const [detailId, setDetailId] = React.useState<Teacher | null>(null);

//   console.log(detailId);
  
//   const handleEdit = (row: Teacher) => {
//     console.log("Edit clicked for:", row);
//   };

//   const handleDelete = (row: Teacher) => {
//     console.log("Delete clicked for:", row);
//   };

//   const handleDetails = (row: Teacher) => {
//     setDetailId(row);
//     setOpen(true);
//   };

//   return (
//     <section>
//       <Box sx={{ padding: 4, backgroundColor: "#f9f9f9" }}>
//         {/* Header */}
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: 3,
//           }}
//         >
//           <Typography variant="h6" fontWeight="bold">
//             Home / teacher
//           </Typography>
//           <Box sx={{ display: "flex", gap: 2 }}>
//             <Button
//               variant="outlined"
//               sx={{
//                 borderColor: "#1A3C34",
//                 color: "#1A3C34",
//                 textTransform: "none",
//                 fontSize: "14px",
//               }}
//             >
//               Export
//             </Button>
//             <Link href={"/admin/add-teacher"}>
//               <Button
//                 variant="contained"
//                 sx={{
//                   backgroundColor: "#1A3C34",
//                   color: "#fff",
//                   textTransform: "none",
//                   fontSize: "14px",
//                   "&:hover": { backgroundColor: "#145D4A" },
//                 }}
//               >
//                 + Add teacher
//               </Button>
//             </Link>
//           </Box>
//         </Box>

//         {/* Filters */}
//         <Paper
//           sx={{
//             padding: 2,
//             marginBottom: 3,
//             display: "flex",
//             alignItems: "center",
//             gap: 2,
//           }}
//         >
//           <TextField
//             label="All student"
//             fullWidth
//             size="small"
//             variant="outlined"
//           />
//           <TextField
//             label="ID type here"
//             fullWidth
//             size="small"
//             variant="outlined"
//             InputProps={{
//               endAdornment: (
//                 <Box sx={{ marginRight: "-10px", color: "#6b6b6b" }}>🔍</Box>
//               ),
//             }}
//           />
//           <TextField
//             label="Class"
//             select
//             fullWidth
//             size="small"
//             variant="outlined"
//           >
//             <MenuItem value="10">Class 10</MenuItem>
//             <MenuItem value="11">Class 11</MenuItem>
//           </TextField>
//           <TextField
//             label="Section"
//             select
//             fullWidth
//             size="small"
//             variant="outlined"
//           >
//             <MenuItem value="A">Section A</MenuItem>
//             <MenuItem value="B">Section B</MenuItem>
//           </TextField>
//           <TextField
//             label="Stream"
//             select
//             fullWidth
//             size="small"
//             variant="outlined"
//           >
//             <MenuItem value="Science">Science</MenuItem>
//             <MenuItem value="Commerce">Commerce</MenuItem>
//             <MenuItem value="Arts">Arts</MenuItem>
//           </TextField>
//         </Paper>

//         {/* Table */}
//         <ReusableTable<Teacher>
//           columns={columns}
//           data={data}
//           onEdit={handleEdit}
//           onDelete={handleDelete}
//           onDetails={handleDetails}
//         />
//       </Box>
//       <CustomizedDialogs
//         title="Student Information"
//         open={open}
//         setOpen={setOpen}
//       >
//         <TeacherDetails teacher={detailId} />
//       </CustomizedDialogs>
//     </section>
//   );
// };

// export default TeacherList;