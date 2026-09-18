import { SxProps, Theme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import React from 'react';

interface CancelButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  size?: { xs: string; sm: string };
  padding?: { xs: string; sm: string };
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  color?: string;
   sx?: SxProps<Theme>;
  children?: React.ReactNode;
}

const CancelButton = ({
  onClick,
  disabled = false,
  size = { xs: '0.75rem', sm: '0.875rem' },
  padding = { xs: '6px 8px', sm: '6px 12px' },
  backgroundColor = '#d32f2f',
  hoverBackgroundColor = '#b71c1c',
  color = 'white',
  children = 'Cancel',
}: CancelButtonProps) => {
  return (
    <Button
      onClick={onClick}
      sx={{
        backgroundColor,
        color,
        '&:hover': {
          backgroundColor: hoverBackgroundColor,
        },
        fontSize: size,
        padding,
      }}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

export default CancelButton;