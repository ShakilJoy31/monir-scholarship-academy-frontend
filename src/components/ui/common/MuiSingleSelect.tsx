import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

export interface OptionType {
  id: string | number;
  label: string;
}

export interface MuiSingleSelectProps {
  options: OptionType[];
  label?: string;
  placeholder?: string;
  selectedId?: string | number | null;
  onChange?: (selectedId: string | number | null) => void;
  width?: number | string;
  size?: "small" | "medium";
  textSize?: string;
}

const MuiSingleSelect: React.FC<MuiSingleSelectProps> = ({
  options,
  label = "Select",
  placeholder = "Choose option",
  selectedId = null,
  onChange,
  width = 300,
  size = "small",
  textSize = "16px",
}) => {
  const [value, setValue] = useState<OptionType | null>(
    options?.find((option) => option?.id === selectedId) || null
  );

  const handleChange = (event: React.SyntheticEvent, newValue: OptionType | null) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue ? newValue.id : null);
    }
  };

  return (
    <Autocomplete
      size={size}
      options={options}
      value={value}
      onChange={handleChange}
      getOptionLabel={(option) => option?.label}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      renderOption={(
        props,
        option: OptionType,
        // state: AutocompleteRenderOptionState
      ) => (
        <li {...props} style={{ fontSize: textSize, padding: "6px 8px" }}>
          {option.label}
        </li>
      )}
      sx={{ width }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label={label}
          placeholder={placeholder}
          fullWidth
          size={size}
          sx={{
            "& .MuiInputBase-root": {
              fontSize: textSize,
              minHeight: size === "small" ? "40px" : "48px",
            },
            "& .MuiInputLabel-root": {
              fontSize: textSize,
            },
          }}
        />
      )}
    />
  );
};

export default MuiSingleSelect;
