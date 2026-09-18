import React, { useEffect, useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Autocomplete, { AutocompleteRenderOptionState } from "@mui/material/Autocomplete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export interface OptionType {
  id: string | number;
  label: string;
}

export interface MuiMultiSelectProps {
  options: OptionType[];
  label?: string;
  placeholder?: string;
  selectedIds?: (string | number)[];
  onChange?: (selectedIds: (string | number)[]) => void;
  width?: number | string;
  size?: "small" | "medium";
  textSize?: string;
}

const MuiMultiSelect: React.FC<MuiMultiSelectProps> = ({
  options,
  label = "Select",
  placeholder = "Choose options",
  selectedIds = [],
  onChange,
  width = 300,
  size = "small",
  textSize = "16px"
}) => {
  const [value, setValue] = useState<OptionType[]>(
    options?.find((option) => option.id === "all")
      ? options
      : options.filter((option) => selectedIds.includes(option.id))
  );
  useEffect(() => {
    if (selectedIds?.length < 1) {
      setValue([])
    }
  }, [selectedIds])

  const handleChange = (event: React.SyntheticEvent, newValue: OptionType[]) => {
    const actualOptions = options.filter((o) => o.id !== "all");

    // Check if "all" option was clicked
    const isAllClicked = newValue.some((v) => v.id === "all");

    if (isAllClicked) {
      // If all items are already selected → unselect all
      if (value.length === actualOptions.length) {
        setValue([]);
        onChange?.([]);
      } else {
        // Otherwise → select all items
        setValue(actualOptions);
        onChange?.(actualOptions.map((o) => o.id));
      }
    } else {
      // Normal selection (individual items)
      setValue(newValue);
      onChange?.(newValue.map((v) => v.id));
    }
  };

  return (
    <Autocomplete
      multiple
      size={size}
      options={options.length > 0 ? [{ id: "all", label: "Select All" }, ...options] : options}
      disableCloseOnSelect
      value={value}
      onChange={handleChange}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      renderOption={(props, option: OptionType, { selected }: AutocompleteRenderOptionState) => {
        const isAllOption = option.id === "all";
        const allOptionChecked = isAllOption ? value.length === options.length : selected;

        return (
          <li {...props} style={{ fontSize: textSize, padding: "4px 8px" }}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8, padding: 0 }}
              checked={allOptionChecked}
              size={size}
            />
            {option.label}
          </li>
        );
      }}
      style={{ width }}
      renderInput={(params) => {

        return (
          <>
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
                  minHeight: size === "small" ? "40px" : "48px"
                },
                "& .MuiInputLabel-root": {
                  fontSize: textSize
                }
              }}
            />
          </>
        )
      }}
    />
  );
};

export default MuiMultiSelect;
