
import {
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";

const FeesStructure = () => {
  // const [feesData, setFeesData] = useState([
  //   { id: 1, component: "Tuition Fee", amount: "৳6,000", checked: true },
  //   { id: 2, component: "Lab Fee", amount: "৳2,000", checked: true },
  //   { id: 3, component: "Exam Fee", amount: "৳2,000", checked: true },
  // ]);

  // const handleDelete = (id:any) => {
  //   setFeesData(feesData.filter((fee) => fee.id !== id));
  // };

  return (
    <Box sx={{ padding: "24px", fontFamily: "'Roboto', sans-serif" }}>
      {/* Tabs Header */}
      <Typography
        variant="h6"
        sx={{
          fontSize: "18px",
          fontWeight: "500",
          display: "flex",
          marginBottom: "16px",
          gap: "24px",
        }}
      >
        <span style={{ cursor: "pointer", color: "#333" }}>All Fees</span>
        <span style={{ cursor: "pointer", color: "#006D37" }}>
          Fees Structure
        </span>
      </Typography>

      {/* Main Paper */}
      <Paper elevation={1} sx={{ padding: "16px" }}>
{/*         
        <Grid container spacing={2}>
         
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              borderRight: "1px solid #ccc",
              paddingRight: "16px",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: "18px",
                fontWeight: "500",
                marginBottom: "16px",
              }}
            >
              Add new structure
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
           
              <Box sx={{ display: "flex", gap: "8px" }}>
                <TextField
                  select
                  label="Class"
                  variant="outlined"
                  size="small"
                  fullWidth
                >
                  {[9, 10, 11, 12].map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="To"
                  variant="outlined"
                  size="small"
                  fullWidth
                >
                  {[9, 10, 11, 12].map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

             
              <TextField
                select
                label="Section"
                variant="outlined"
                size="small"
                fullWidth
              >
                {["A", "B", "C", "D"].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>

              
              <TextField
                select
                label="Stream"
                variant="outlined"
                size="small"
                fullWidth
              >
                {["Science", "Commerce", "Arts"].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>

             
              <TextField
                select
                label="Fees Duration"
                variant="outlined"
                size="small"
                fullWidth
              >
                {["Monthly", "Quarterly", "Yearly"].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>

              
              <TextField
                label="Start Month"
                type="date"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
                fullWidth
              />
              <TextField
                label="End Month"
                type="date"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Box>
          </Grid>

         
          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              sx={{
                fontSize: "18px",
                fontWeight: "500",
                marginBottom: "16px",
              }}
            >
              Set Fees amount
            </Typography>

          
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: "16px",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <TextField
                label="Component Name"
                variant="outlined"
                size="small"
                fullWidth
              />
              <TextField
                label="Set Amount"
                variant="outlined"
                size="small"
                fullWidth
              />
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#006D37",
                  "&:hover": { backgroundColor: "#00582E" },
                }}
              >
                Save
              </Button>
            </Box>

           
            <Typography
              variant="h6"
              sx={{
                fontSize: "18px",
                fontWeight: "500",
                marginBottom: "8px",
              }}
            >
              Set Fees based on component
            </Typography>
            <TableContainer>
              <Table
                sx={{
                  minWidth: "100%",
                  border: "1px solid #ccc",
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: "500",
                        backgroundColor: "#f9f9f9",
                        border: "1px solid #ccc",
                      }}
                    >
                      Fees Component
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "500",
                        backgroundColor: "#f9f9f9",
                        border: "1px solid #ccc",
                      }}
                    >
                      Amount
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "500",
                        backgroundColor: "#f9f9f9",
                        border: "1px solid #ccc",
                        textAlign: "center",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feesData.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell sx={{ border: "1px solid #ccc" }}>
                        <Checkbox
                          checked={fee.checked}
                          sx={{
                            color: "#006D37",
                            "&.Mui-checked": { color: "#006D37" },
                          }}
                        />
                        {fee.component}
                      </TableCell>
                      <TableCell sx={{ border: "1px solid #ccc" }}>
                        {fee.amount}
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "1px solid #ccc",
                          textAlign: "center",
                        }}
                      >
                        <IconButton
                          color="primary"
                          size="small"
                          sx={{
                            color: "#006D37",
                            marginRight: "8px",
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          size="small"
                          onClick={() => handleDelete(fee.id)}
                          sx={{ color: "#D32F2F" }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid> */}

        
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "16px",
            marginTop: "16px",
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            sx={{ minWidth: "120px" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{
              minWidth: "120px",
              backgroundColor: "#006D37",
              "&:hover": { backgroundColor: "#00582E" },
            }}
          >
            Save
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default FeesStructure;
