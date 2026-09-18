import React from 'react';
import { Box, Button, Typography, Select, MenuItem, FormControl } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationComponentProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    rowsPerPage?: number;
    onRowsPerPageChange?: (rows: number) => void;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    rowsPerPage,
    onRowsPerPageChange,
}) => {
    if (totalPages <= 1 && !onRowsPerPageChange) return null;

    const handlePrev = () => onPageChange(Math.max(1, currentPage - 1));
    const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            mt: 2,
            p: 2,
            borderTop: '1px solid rgba(224, 224, 224, 1)'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {onRowsPerPageChange && rowsPerPage && (
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                            value={rowsPerPage}
                            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                            displayEmpty
                        >
                            {[5, 10, 25, 50, 100].map((size) => (
                                <MenuItem key={size} value={size}>
                                    {size} per page
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Box>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={handlePrev}
                        disabled={currentPage === 1}
                        startIcon={<ChevronLeft size={20} />}
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            color: '#035140',
                            borderColor: '#035140',
                            '&:hover': {
                                borderColor: '#035140',
                                backgroundColor: 'rgba(3, 81, 64, 0.04)'
                            },
                            '&:disabled': {
                                borderColor: 'rgba(0, 0, 0, 0.12)',
                            }
                        }}
                    >
                        Previous
                    </Button>
                    
                    <Typography variant="body1" sx={{ mx: 1 }}>
                        Page {currentPage} of {totalPages}
                    </Typography>
                    
                    <Button
                        variant="outlined"
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        endIcon={<ChevronRight size={20} />}
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            color: '#035140',
                            borderColor: '#035140',
                            '&:hover': {
                                borderColor: '#035140',
                                backgroundColor: 'rgba(3, 81, 64, 0.04)'
                            },
                            '&:disabled': {
                                borderColor: 'rgba(0, 0, 0, 0.12)',
                            }
                        }}
                    >
                        Next
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default PaginationComponent;