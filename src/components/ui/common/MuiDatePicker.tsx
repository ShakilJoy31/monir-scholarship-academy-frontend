import * as React from 'react';
import { Dayjs } from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateView } from '@mui/x-date-pickers';

export interface MuiDatePickerProps {
    label?: string;
    value: Dayjs | null;
    onChange: (value: Dayjs | null) => void;
    size?: "small" | "medium";
    fullWidth?: boolean;
    width?: number | string;
    views?: readonly DateView[];
}

const MuiDatePicker: React.FC<MuiDatePickerProps> = ({
    label = "Select Date",
    value,
    onChange,
    size = "small",
    fullWidth = true,
    width = 300,
    views = ['year', 'month', 'day']
}) => {

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker', 'DatePicker']}>
                <DatePicker
                    label={label}
                    value={value}
                    onChange={onChange}
                    views={views}
                    sx={{ width }}
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
                            },
                        },
                    }}
                />
            </DemoContainer>
        </LocalizationProvider>
    );
}

export default MuiDatePicker;