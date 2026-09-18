// components/pageComponents/dashboard/admin/expense/ViewExpenseModal.tsx
"use client";
import React from "react";
import {
  Modal,
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import {
  AttachMoney as AmountIcon,
  Notes as NoteIcon,
  CalendarToday as DateIcon,
  Category as CategoryIcon,
  AccountBalance as AccountIcon,
} from '@mui/icons-material';
import CancelButton from "@/components/shared/reusable-component/CancelButton";

interface Payment {
  id: number;
  paymentAmount: number;
  account: {
    id: number;
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
}

interface ExpenseCategory {
  id: number;
  name: string;
}

interface ExpenseSubcategory {
  id: number;
  name: string;
}

interface ExpenseData {
  id: number;
  note: string;
  expenseCategoryId: number;
  expenseSubcategoryId: number;
  expenseCategory: ExpenseCategory;
  expenseSubcategory: ExpenseSubcategory;
  date: string;
  image: string;
  totalAmount: number;
  status: 'Pending' | 'Accepted' | 'Canceled';
  Payment: Payment[];
}

interface ViewExpenseModalProps {
  open: boolean;
  onClose: () => void;
  expenseData: ExpenseData | null;
  isLoading: boolean;
  onEditClick: () => void;
}

const ViewExpenseModal: React.FC<ViewExpenseModalProps> = ({
  open,
  onClose,
  expenseData,
  isLoading,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Canceled':
        return 'error';
      case 'Accepted':
        return 'success';
      default:
        return 'warning';
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
          duration: 0.3
        }}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          position: 'relative',
          borderRadius: '6px',
          outline: 'none',
          width: '600px',
          maxWidth: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: `
            linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,252,251,0.98)),
            radial-gradient(circle at top left, rgba(26,60,52,0.03), transparent 60%)
          `,
        }}
      >
        {/* Header section */}
        <Box sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '2rem 2rem 1rem 2rem',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          {/* Floating close button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
            }}
          >
            <IconButton
              onClick={onClose}
              sx={{
                backgroundColor: '#1A3C34',
                color: 'white',
                boxShadow: '0 4px 12px rgba(26, 60, 52, 0.2)',
                '&:hover': {
                  backgroundColor: '#0F2922',
                }
              }}
            >
              <X size={18} />
            </IconButton>
          </motion.div>

          {/* Header with decorative accent */}
          <Box sx={{ position: 'relative' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#1A3C34',
                position: 'relative',
                display: 'inline-block',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-8px',
                  left: 0,
                  width: '48px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #1A3C34, rgba(26,60,52,0.3))',
                  borderRadius: '2px',
                }
              }}
            >
              Expense Details
            </Typography>
            {expenseData?.status && (
              <Chip
                label={expenseData.status}
                color={getStatusColor(expenseData.status)}
                variant="outlined"
                sx={{
                  height: 32,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textTransform: 'capitalize',
                  pl: 1,
                  ml: 4
                }}
              />
            )}
          </Box>
        </Box>

        {/* Scrollable content */}
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 2rem 2rem 2rem',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : expenseData ? (
            <>
              {/* Main Content */}
              <Stack spacing={3.5}>
                {/* Category & Subcategory Section */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CategoryIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
                  <div>
                    <Typography variant="subtitle2" color="text.secondary">
                      Category Information
                    </Typography>
                    <Stack direction="row" spacing={4} mt={1}>
                      <div>
                        <Typography variant="caption" color="text.secondary">
                          Category
                        </Typography>
                        <Typography variant="body1">
                          {expenseData.expenseCategory?.name || 'N/A'}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="caption" color="text.secondary">
                          Subcategory
                        </Typography>
                        <Typography variant="body1">
                          {expenseData.expenseSubcategory?.name || 'N/A'}
                        </Typography>
                      </div>
                    </Stack>
                  </div>
                </Box>

                {/* Date & Amount Section */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DateIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
                  <div>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date & Amount
                    </Typography>
                    <Stack direction="row" spacing={4} mt={1}>
                      <div>
                        <Typography variant="caption" color="text.secondary">
                          Date
                        </Typography>
                        <Typography variant="body1">
                          {expenseData.date ? new Date(expenseData.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'N/A'}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="caption" color="text.secondary">
                          Total Amount
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="primary">
                          {expenseData.totalAmount?.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'BDT',
                            minimumFractionDigits: 2
                          })}
                        </Typography>
                      </div>
                    </Stack>
                  </div>
                </Box>

                {/* Image Section */}
                {expenseData.image && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <AmountIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem', mt: 0.5 }} />
                    <div>
                      <Typography variant="subtitle2" color="text.secondary">
                        Expense Image
                      </Typography>
                      <Box mt={1}>
                        <Image
                          src={expenseData.image}
                          alt="Expense Receipt"
                          width={200}
                          height={150}
                          style={{
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #eee'
                          }}
                        />
                      </Box>
                    </div>
                  </Box>
                )}

                {/* Note Section */}
                {expenseData.note && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <NoteIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem', mt: 0.5 }} />
                    <div>
                      <Typography variant="subtitle2" color="text.secondary">
                        Note
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {expenseData.note}
                      </Typography>
                    </div>
                  </Box>
                )}

                {/* Payment Details Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccountIcon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Payment Details
                    </Typography>
                  </Box>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Account</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {expenseData.Payment?.map((payment, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {payment.account ? (
                                <>
                                  {payment.account.bankName} - {payment.account.accountName}
                                  <Typography variant="body2" color="textSecondary">
                                    {payment.account.accountNumber}
                                  </Typography>
                                </>
                              ) : 'Unknown Account'}
                            </TableCell>
                            <TableCell align="right">
                              {payment.paymentAmount?.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'BDT',
                                minimumFractionDigits: 2
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Total</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>
                            {expenseData.Payment?.reduce((sum, payment) => sum + payment.paymentAmount, 0)?.toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'BDT',
                              minimumFractionDigits: 2
                            })}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Stack>
            </>
          ) : (
            <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
              No expense data available
            </Typography>
          )}
        </Box>

        {/* Fixed footer with buttons */}
        <Box sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '1.5rem 2rem',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2
        }}>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <CancelButton
              onClick={onClose}
              sx={{
                color: '#1A3C34',
                borderColor: 'rgba(26,60,52,0.3)',
                borderRadius: '6px',
                px: 3,
                py: 1,
                fontWeight: 500,
                '&:hover': {
                  borderColor: '#1A3C34',
                  backgroundColor: 'rgba(26, 60, 52, 0.04)',
                },
              }}
            >
              Close
            </CancelButton>
          </motion.div>

          {/* {expenseData?.status === 'Pending' && (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                onClick={onEditClick}
                sx={{
                  backgroundColor: '#1A3C34',
                  borderRadius: '6px',
                  px: 3,
                  py: 1,
                  fontWeight: 500,
                  boxShadow: '0 4px 16px rgba(26, 60, 52, 0.3)',
                  '&:hover': {
                    backgroundColor: '#0F2922',
                    boxShadow: '0 6px 20px rgba(26, 60, 52, 0.4)',
                  },
                }}
              >
                Edit Expense
              </Button>
            </motion.div>
          )} */}
        </Box>
      </motion.div>
    </Modal>
  );
};

export default ViewExpenseModal;