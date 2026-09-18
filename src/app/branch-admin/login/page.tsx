'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  TextField,
  Typography,
  InputAdornment,
  IconButton
} from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import 'react-toastify/dist/ReactToastify.css';
import { toastShowing } from '@/components/shared/reusable-component/toastShowing';
import { useAppDispatch } from '@/app/hooks/hooks';
import { setUser } from '@/app/features/auth/authSlice';
import { useLoginBranchAdminMutation } from '@/app/store/api/auth/authApi';
import { getUserInfoFromToken, saveTokenToCookie } from '@/app/utils/helper/tokenHelper';

export default function LoginPage() {
  const [email, setIdOrNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loginBranchAdmin] = useLoginBranchAdminMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      [email.charAt(0).toLowerCase() === 'a' ? 'ID' : 'phone']: email,
      password
    };

    try {
      const response = await loginBranchAdmin(payload).unwrap();

      if (response?.accessToken) {
        const token = response?.accessToken;
        saveTokenToCookie(token);
        const userInfo = getUserInfoFromToken();
        if (userInfo) {
          dispatch(setUser(userInfo));
          toastShowing('Login successful!', 'bottom-right', 2000, 'green', 'white');
        }

        setTimeout(() => {
          router.push('/branch-admin/pages/dashboard');
        }, 1000);
      }
    } catch (error: unknown) {
      let errorMessage = 'Login failed';

      if (typeof error === 'object' && error !== null && 'data' in error) {
        const apiError = error as { data?: { message?: string } };
        errorMessage = apiError.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toastShowing(errorMessage, 'bottom-right', 2000, 'red', 'white');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // ✅ Allow ID or phone number, validate only if phone starts with "01"
  const handleEmailOrPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    if (/^\d*$/.test(input)) {
      // If numeric, treat as phone number
      if (input.startsWith("01")) {
        if (input.length <= 11) {
          setIdOrNumber(input);
        }
      } else {
        // Allow typing numbers before "01" is complete
        if (input.length <= 2) {
          setIdOrNumber(input);
        }
      }
    } else {
      // Allow any string (IDs)
      setIdOrNumber(input);
    }
  };

  return (
    <Container className="bg-white flex h-screen items-center" component="main" maxWidth="xs">
      <Box className="border border-gray-400 rounded-md p-4"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <LockOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
        <Typography component="h1" variant="h5">
          Sign in to Branch Admin
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Enter Phone Number or ID"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleEmailOrPhoneChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                value="remember"
                color="primary"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            }
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              mt: 2, textTransform: "none",
              color: "white !important",
              backgroundColor: "#035140",
              "&:disabled": {
                backgroundColor: "#cccccc",
                color: "#666666 !important"
              },
              "&:hover": {
                backgroundColor: "#024030",
              },
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
