'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Button, 
  Container, 
  Typography,
  Divider
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import 'react-toastify/dist/ReactToastify.css';
import { toastShowing } from '@/components/shared/reusable-component/toastShowing';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRoleLogin = (role: string) => {
    setLoading(true);
    
    // Show loading toast
    toastShowing(`Redirecting to ${role} login...`, 'bottom-right', 1500, '#5b2c6f', 'white');
    
    // Simulate API call delay (replace with actual login logic)
    setTimeout(() => {
      switch(role.toLowerCase()) {
        case 'super admin':
          router.push('/super-admin/login');
          break;
        case 'school admin':
          router.push('/school-admin/login');
          break;
        case 'branch admin':
          router.push('/branch-admin/login');
          break;
        case 'teacher':
          router.push('/teacher/login');
          break;
        case 'student':
          router.push('/student/login');
          break;
        default:
          router.push('/login');
      }
      setLoading(false);
    }, 5);
  };

  return (
    <Container className='bg-white flex h-screen items-center' component="main" maxWidth="xs">
      <Box className='border border-gray-400 rounded-md p-4'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%'
        }}
      >
        <LockOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
        <Typography component="h1" variant="h5">
          Select Your Role
        </Typography>
        
        <Box sx={{ width: '100%', mt: 3 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mb: 2, py: 1.5 }}
            onClick={() => handleRoleLogin('Super Admin')}
            disabled={loading}
          >
            Super Admin
          </Button>
          
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ mb: 2, py: 1.5 }}
            onClick={() => handleRoleLogin('school admin')}
            disabled={loading}
          >
            School Admin
          </Button>
          
          <Button
            fullWidth
            variant="contained"
            color="success"
            sx={{ mb: 2, py: 1.5 }}
            onClick={() => handleRoleLogin('branch admin')}
            disabled={loading}
          >
            Branch Admin
          </Button>
          
          <Button
            fullWidth
            variant="contained"
            color="warning"
            sx={{ mb: 2, py: 1.5 }}
            onClick={() => handleRoleLogin('Teacher')}
            disabled={loading}
          >
            Teacher
          </Button>
          
          <Button
            fullWidth
            variant="contained"
            color="info"
            sx={{ mb: 2, py: 1.5 }}
            onClick={() => handleRoleLogin('Student')}
            disabled={loading}
          >
            Student
          </Button>
        </Box>
        
        <Divider sx={{ width: '100%', my: 2 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          Select your role to proceed to the appropriate login page
        </Typography>
      </Box>
    </Container>
  );
}