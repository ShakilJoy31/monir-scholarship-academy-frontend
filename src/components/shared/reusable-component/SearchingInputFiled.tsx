"use client";
import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import { Search } from "lucide-react";
import { debounce } from "lodash";

interface SearchingInputFieldProps {
  placeholder?: string;
  onSearch: (term: string) => void;
  debounceTime?: number;
  fullWidth?: boolean;
  maxWidth?: number | string;
  height?: number | string;
  fontSize?: number | string;
  paddingY?: number | string;
}

const SearchingInputField: React.FC<SearchingInputFieldProps> = ({
  placeholder = "Search...",
  onSearch,
  debounceTime = 500,
  fullWidth = true,
  maxWidth = 400,
  height = "35px",
  fontSize = "14px",
  paddingY = "8px",
}) => {
  const handleSearch = debounce((term: string) => {
    onSearch(term);
  }, debounceTime);

  return (
    <TextField
      fullWidth={fullWidth}
      variant="outlined"
      placeholder={placeholder}
      onChange={(e) => handleSearch(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search size={20} />
          </InputAdornment>
        ),
      }}
      sx={{
        maxWidth: maxWidth,
        "& .MuiOutlinedInput-root": {
          borderRadius: "4px",
          height: height,
        },
        "& .MuiOutlinedInput-input": {
          py: paddingY,
          fontSize: fontSize,
        },
      }}
    />
  );
};

export default SearchingInputField;