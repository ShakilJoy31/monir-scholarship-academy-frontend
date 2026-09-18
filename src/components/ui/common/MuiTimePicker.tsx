import React from "react";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";


export interface MuiTimePickerProps {
    label?: string;
    value: Dayjs | null;
    onChange: (value: Dayjs | null) => void;
    size?: "small" | "medium";
    fullWidth?: boolean;
    defaultValue?: Dayjs | string | null;
    width?: string | number;
}

const MuiTimePicker: React.FC<MuiTimePickerProps> = ({
    label = "Select Time",
    value,
    onChange,
    size = "small",
    fullWidth = true,
    width = "182px",
}) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
                label={label}
                value={value}
                onChange={onChange}
                slotProps={{
                    textField: {
                        size,
                        fullWidth,
                        sx: {
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "8px",
                                // marginTop: "-8px",
                                backgroundColor: "#fff",
                                "&:hover fieldset": {
                                    borderColor: "#035140",
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: "#035140",
                                },
                            },
                            "& .MuiInputLabel-root": {
                                fontWeight: 600,
                            },
                            "& .MuiPickersOutlinedInput-sectionsContainer": {
                                width,
                            },
                        },
                    },
                }}
            />
        </LocalizationProvider>
    );
};

export default MuiTimePicker;
