import * as React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

interface Option {
    label: string;
    value: string;
}

interface ControlledRadioButtonsGroupProps {
    label?: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    row?: boolean;
}

const MuiRadioGroup: React.FC<ControlledRadioButtonsGroupProps> = ({
    label,
    options,
    value,
    onChange,
    row = false,
}) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    };

    return (
        <FormControl>
            {label && <FormLabel>{label}</FormLabel>}
            <RadioGroup row={row} value={value} onChange={handleChange}>
                {options.map((option) => (
                    <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio />}
                        label={option.label}
                    />
                ))}
            </RadioGroup>
        </FormControl>
    );
};

export default MuiRadioGroup;
