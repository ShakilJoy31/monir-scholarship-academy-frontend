'use client';

import { useState } from 'react';
import { School as SchoolIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  Typography,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  OutlinedInput
} from '@mui/material';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SchoolFormValues, SchoolSchema } from '../../schemas/schoolSchema';
import { FormInput } from '../../../formInput/FormInput';
import { useCreateSchoolMutation } from '@/app/store/api/createSchool/createSchoolApi';
import { toastShowing } from '@/components/shared/reusable-component/toastShowing';
import { ApiError } from '../../../../../types/error';

const CreateSchool = () => {
  const [createSchool, { isLoading }] = useCreateSchoolMutation();
  const [showPassword, setShowPassword] = useState(false);
  const methods = useForm<SchoolFormValues>({
    resolver: zodResolver(SchoolSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      branchPermission: 1
    }
  });

  const onSubmit: SubmitHandler<SchoolFormValues> = async (data) => {
    try {
      const result = await createSchool(data).unwrap();
      if (result?.success) {
        toastShowing(result?.message, 'bottom-right', 2000, 'green', 'white');
        methods.reset({
          name: '',
          email: '',
          password: '',
          branchPermission: 1
        });
        setShowPassword(false);
      }
    } catch (error: unknown) {
      const err = error as ApiError; // Type assertion
      toastShowing(err?.message, 'bottom-right', 2000, 'red', 'white');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleBranchPermissionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    methods.setValue('branchPermission', (value), { shouldValidate: true });
  };

  return (
    <Container className='bg-white flex h-screen items-center mt-5' component="main" maxWidth="sm">
      <Box className='border border-gray-400 rounded-md p-6 relative'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          position: 'relative'
        }}
      >
        <Button
          onClick={() => window.history.back()}
          sx={{
            textTransform: 'none',
            color: '#d32f2f',
            position: 'absolute',
            left: 16,
            top: 16,
            py: { xs: 0.5, sm: 1 },
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
          size={'medium'}
        >
          Back
        </Button>

        <SchoolIcon sx={{
          fontSize: 40, textTransform: "none",
          backgroundColor: "#fff",
          "&:hover": {
            backgroundColor: "#fff",
          }, color: "#024030", mb: 2
        }} />
        <Typography component="h1" variant="h5">
          Create New School
        </Typography>

        <FormProvider {...methods}>
          <Box
            component="form"
            onSubmit={methods.handleSubmit(onSubmit)}
            noValidate
            sx={{ mt: 3, width: '100%' }}
          >
            <FormInput
              name="name"
              label="School Name"
              fullWidth
              required
              autoComplete="school-name"
            />

            <FormInput
              name="email"
              label="School Email"
              type="email"
              fullWidth
              required
              autoComplete="email"
              sx={{ mt: 2 }}
            />

            <FormInput
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              autoComplete="new-password"
              helperText="Password must be 6-12 characters"
              sx={{ mt: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel htmlFor="branch-permission-input">Branch Permission</InputLabel>
              <OutlinedInput
                id="branch-permission-input"
                type="number"
                value={methods.watch('branchPermission')}
                onChange={handleBranchPermissionChange}
                label="Branch Permission"
                error={!!methods.formState.errors.branchPermission}
                aria-describedby="branch-permission-helper-text"
              />
              {methods.formState.errors.branchPermission && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {methods.formState.errors.branchPermission.message}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Enter the number of branch permissions (minimum 1)
              </Typography>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              sx={{
                my: 2, textTransform: "none",
                color: "white !important",
                backgroundColor: "#035140",
                "&:hover": {
                  backgroundColor: "#024030",
                },
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Adding School...' : 'Add School'}
            </Button>
          </Box>
        </FormProvider>
      </Box>
    </Container>
  );
};

export default CreateSchool;