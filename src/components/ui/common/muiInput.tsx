import React from "react";
import { TextField } from "@mui/material";

export interface MuiTextInputProps {
  name: string;
  label: string;
  type?: "text" | "number" | "email" | "password";
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fullWidth?: boolean;
  size?: "small" | "medium";
  placeholder?: string;
  className?: string;
}

const MuiTextInput: React.FC<MuiTextInputProps> = ({
  name,
  label,
  type = "text",
  value,
  onChange,
  fullWidth = true,
  size = "small",
  placeholder,
  className,
}) => {
  return (
    <TextField
      className={className}
      fullWidth={fullWidth}
      size={size}
      type={type}
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      variant="outlined"
      sx={{
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
          fontWeight: 600,
        },
      }}
    />
  );
};

export default MuiTextInput;
