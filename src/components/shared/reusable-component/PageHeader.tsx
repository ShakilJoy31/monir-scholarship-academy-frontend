"use client";
import { Box, Typography, Button } from "@mui/material";
import { Plus } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  buttonText?: string;
  buttonIcon?: ReactNode;
  onButtonClick?: () => void;
  children?: ReactNode;
}

export const PageHeader = ({
  title,
  buttonText,
  buttonIcon = <Plus size={20} />,
  onButtonClick,
  children,
}: PageHeaderProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 4,
        flexWrap: "wrap",
        gap: 2,
        mt: 5,
        width: "100%",
      }}
    >
      <Typography variant="h5" component="h1" fontWeight="bold" className="mr-auto">
        {title}
      </Typography>
      
      {buttonText && onButtonClick ? (
        <Button
          variant="contained"
          startIcon={buttonIcon}
          onClick={onButtonClick}
          sx={{
            backgroundColor: '#035140',
            '&:hover': {
              backgroundColor: '#024030', // Slightly darker shade for hover state
            },
          }}
        >
          {buttonText}
        </Button> 
      ) : (
        children
      )}
    </Box>
  );
};