"use client";
import React, { useState } from "react";
import { Dayjs } from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    IconButton,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from "@mui/material";
import { Edit, Trash2,} from "lucide-react";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { buttonLoader } from "@/app/utils/helper/tokenHelper";
import { useDeleteConfirmation } from "@/app/utils/helper/useDeleteConfirmation";
import PaginationComponent from "@/components/shared/reusable-component/PaginationComponent";
// import SearchingInputField from "@/components/shared/reusable-component/SearchingInputFiled";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

interface Class {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    branchId: number;
    [key: string]: unknown;
}


const AddTeachersAttendance = () => {
    // states start **************************************************
    const [addClassModalOpen, setAddClassModalOpen] = useState<boolean>(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, ] = useState("");
    const [filters, setFilters] = useState({
        designation: "",
        teacher: "",
        selectedDate: "",
        inTime: null as Dayjs | null,
        outTime: null as Dayjs | null,
    });
    console.log(addClassModalOpen)
    // const [value, setValue] = React.useState<Dayjs | null>();
    // states end **************************************************

    // data start **************************************************
    const {
        data: responseData,
        isLoading,
        isError,
    } = useGetAllClassQuery({
        page: page + 1,
        size: rowsPerPage,
        search: searchTerm,
    });

    const {
        itemToDelete,
        isDeleting,
        openDeleteModal,
    } = useDeleteConfirmation();


    const totalPages = responseData?.meta?.totalPage || 1;

    const classes: Class[] = Array.isArray(responseData?.data)
        ? responseData.data
        : responseData?.data || [];
    // data end **************************************************

    // handlers start ***********************************************

    const handleOpenEditClassModal = (classItem: Class) => {
        // setCurrentClass(classItem);
        // setClassName(classItem.name);
        console.log(classItem)
        setAddClassModalOpen(true);
    };



    const handleFilterChange = (e: {
        target: { name: string; value: string };
    }) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    // handlers end ***********************************************

    const columns = [
        {
            key: "sl",
            header: "SL",
            render: (row: Class, index?: number) => (index !== undefined ? index + 1 : null),
        },
        {
            key: 'name',
            header: 'Name'
        },
        {
            key: 'designation',
            header: 'Designation'
        },
        {
            key: 'inTime',
            header: 'In Time'
        },
        {
            key: 'outTime',
            header: 'Out Time'
        },
        {
            key: 'maxDelay',
            header: 'Max Delay'
        },
        {
            key: 'maxEarly',
            header: 'Max Early',
        },
        // {
        //     key: 'createdAt',
        //     header: 'Created On',
        //     render: (row: Class) => {
        //         const date = new Date(row.createdAt);
        //         const formattedDate = date.toLocaleDateString('en-US', {
        //             year: 'numeric',
        //             month: 'short',
        //             day: 'numeric',
        //             hour: '2-digit',
        //             minute: '2-digit'
        //         });
        //         return formattedDate;
        //     }
        // },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: Class) => (
                <div className="flex space-x-2 items-center">
                    <IconButton onClick={() => handleOpenEditClassModal(row)}>
                        <Edit color="#035140" size={18} />
                    </IconButton>
                    <IconButton
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            openDeleteModal(row.id);
                        }}
                        disabled={isDeleting && itemToDelete === row.id}
                        sx={{
                            color: "#DC2626",
                            p: 1,
                            borderRadius: "8px",
                            "&:hover": {
                                backgroundColor: "rgba(220, 38, 38, 0.1)",
                            },
                        }}
                    >
                        {isDeleting && itemToDelete === row.id ? (
                            <span>{buttonLoader}</span>
                        ) : (
                            <Trash2 size={18} />
                        )}
                    </IconButton>
                </div>
            )
        }
    ];

    return (
        <Box>
            <div className="flex flex-col-reverse items-end w-full gap-4">

                <Box sx={{ mb: 2 }} className={" w-full"}>
                    <Paper sx={{ p: 0, mb: 0, backgroundColor: "transparent", border: "none", boxShadow: "none" }} >
                        <div className="flex  gap-4">
                            <FormControl fullWidth size="small">
                                <InputLabel>Session Year</InputLabel>
                                <Select
                                    name="Designation"
                                    value={filters.designation}
                                    onChange={handleFilterChange}
                                    label="Session Year"
                                >
                                    <MenuItem value="">Web Developer</MenuItem>
                                    {({ data: [{id: 1, name: "Web Developer"}] }?.data)?.map((session) => (
                                        <MenuItem key={session.id} value={session.name}>
                                            {session.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel>Teachers</InputLabel>
                                <Select
                                    name="sessionYear"
                                    value={filters.teacher}
                                    onChange={handleFilterChange}
                                    label="Session Year"
                                >
                                    <MenuItem value="">Select Teacher</MenuItem>
                                    {({ data: [{id: 2, name: "Nayem"}] }?.data)?.map((session) => (
                                        <MenuItem key={session.id} value={session.name}>
                                            {session.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {/* in time  */}
                            <FormControl fullWidth size="small" sx={{ mt: -1 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['TimePicker']}>
                                        <TimePicker
                                            label="Controlled picker"
                                            value={filters.inTime}
                                            onChange={(newValue: Dayjs | null) => setFilters((prev) => ({...prev, inTime: newValue}))}
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    sx: {
                                                        "& .MuiOutlinedInput-root": {
                                                            borderRadius: "8px",
                                                            marginTop: "-8px",
                                                            backgroundColor: "#fff",
                                                            "&:hover fieldset": {
                                                                borderColor: "#035140",
                                                            },
                                                            "&.Mui-focused fieldset": {
                                                                borderColor: "#035140",
                                                            },
                                                        },
                                                        "& .MuiInputLabel-root": {
                                                            // color: "#035140",
                                                            fontWeight: 600,
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </FormControl>
                            {/* out time  */}
                            <FormControl fullWidth size="small" sx={{ mt: -1 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['TimePicker']}>
                                        <TimePicker
                                            label="Controlled picker"
                                            value={filters.outTime}
                                            onChange={(newValue: Dayjs | null) => setFilters((prev) => ({...prev, outTime: newValue}))}
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    sx: {
                                                        "& .MuiOutlinedInput-root": {
                                                            borderRadius: "8px",
                                                            backgroundColor: "#fff",
                                                            "&:hover fieldset": {
                                                                borderColor: "#035140",
                                                            },
                                                            "&.Mui-focused fieldset": {
                                                                borderColor: "#035140",
                                                            },
                                                        },
                                                        "& .MuiInputLabel-root": {
                                                            // color: "red",
                                                            // color: "#035140",
                                                            fontWeight: 600,
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </FormControl>
                            <div className="">
                                <Button
                                    variant="contained"
                                    onClick={() => ""}
                                    className="max-h-fit w-fit"

                                    sx={{
                                        backgroundColor: '#035140',
                                        '&:hover': {
                                            backgroundColor: '#024030',
                                        },
                                    }}
                                >
                                    {"Add"}
                                </Button>
                            </div>
                        </div>
                    </Paper>
                </Box>

            </div>

            <Paper>
                {isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        Failed to load classes
                    </Alert>
                ) : classes.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mt: 4, textAlign: "center" }}
                    >
                        No classes found. {searchTerm ? "Try a different search term." : "Create your first class."}
                    </Typography>
                ) : (
                    <>
                        <ReusableTable<Class>
                            columns={columns}
                            data={classes}
                        />
                        <PaginationComponent
                            currentPage={page + 1}
                            totalPages={totalPages}
                            onPageChange={(newPage) => setPage(newPage - 1)} // Convert back to 0-based index
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={setRowsPerPage}
                        />
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default AddTeachersAttendance;