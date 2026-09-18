'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff, LockReset } from '@mui/icons-material';
import { toastShowing } from '@/components/shared/reusable-component/toastShowing';
import { useSuperAdminChangePasswordMutation, } from '@/app/store/api/branch/branchApi';
import SubmitButton from '@/components/shared/reusable-component/SubmitButton';



const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [error, setError] = useState('');
  

  // RTK Query mutation hook
  const [superAdminChangePassword, { isLoading }] = useSuperAdminChangePasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      // Using RTK Query mutation
      const response = await superAdminChangePassword({
        oldPassword,
        newPassword,
        confirmPassword
      }).unwrap();

      if (response.success) {
        toastShowing('Password changed successfully!', 'bottom-right', 2000, 'green', 'white');
      }
    } catch (error: unknown) {
        console.error("Submission error:", error);
        const errorMessage = (() => {
          if (error instanceof Error) {
            return error.message;
          }
          if (typeof error === "object" && error !== null && "data" in error) {
            const errorData = error as { data?: { message?: string } };
            return errorData.data?.message;
          }
          return "Failed to create teacher";
        })();

        toastShowing(
          errorMessage || "Failed to create teacher",
          "bottom-right",
          2000,
          "red",
          "white"
        );
      }
  };

  const toggleShowPassword = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Container className='bg-white flex h-screen items-center' component="main" maxWidth="xs">
      <Box className='border border-gray-400 rounded-md p-4'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <LockReset sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
        <Typography component="h1" variant="h5">
          Change Super Admin Password
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="oldPassword"
            label="Current Password"
            type={showPassword.oldPassword ? 'text' : 'password'}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => toggleShowPassword('oldPassword')}
                    edge="end"
                  >
                    {showPassword.oldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="New Password"
            type={showPassword.newPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => toggleShowPassword('newPassword')}
                    edge="end"
                  >
                    {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type={showPassword.confirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => toggleShowPassword('confirmPassword')}
                    edge="end"
                  >
                    {showPassword.confirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <SubmitButton
            type="submit"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2, width: '100%' }}
          >
            {isLoading ? 'Updating Password...' : 'Change Password'}
          </SubmitButton>
        </Box>
      </Box>
    </Container>
  );
};

export default ChangePassword;