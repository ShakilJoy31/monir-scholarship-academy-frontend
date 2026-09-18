import Button from '@mui/material/Button';
import { SxProps, Theme } from '@mui/material/styles';

interface SubmitButtonProps {
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    size?: { xs: string; sm: string };
    padding?: { xs: string; sm: string };
    backgroundColor?: string;
    hoverBackgroundColor?: string;
    color?: string;
    addText?: string;
    updateText?: string;
    sx?: SxProps<Theme>;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    children?: React.ReactNode;
}

const SubmitButton = ({
    type = 'submit',
    disabled = false,
    children = 'Submit',
    onClick,
    size = { xs: '0.75rem', sm: '0.875rem' },
    padding = { xs: '6px 8px', sm: '6px 12px' },
    backgroundColor = '#035140',
    hoverBackgroundColor = '#023a2d',
    color = 'white',
    sx = {},
}: SubmitButtonProps) => {
    return (
        <Button
            type={type}
            onClick={onClick}
            sx={{
                backgroundColor,
                color,
                '&:hover': {
                    backgroundColor: hoverBackgroundColor,
                },
                fontSize: size,
                padding,
                ...sx,
            }}
            variant="contained"
            disabled={disabled}
        >
           {children}
        </Button>
    );
};

export default SubmitButton;