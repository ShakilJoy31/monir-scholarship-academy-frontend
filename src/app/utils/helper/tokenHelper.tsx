// Get token from localStorage
  import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';







// Using Cookie instead of localStorage
// Function to save token to cookie
export const saveTokenToCookie = (token: string): void => {
  Cookies.set('token', token, { 
    expires: 7, // 7 days expiration
    secure: true, 
    sameSite: 'strict',
    path: '/' // Available across the entire site
  });
};

export const removeTokenFromCookie = (): void => {
  Cookies.remove('token', { 
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });
};

// Function to get user info from token
export interface UserInfo {
  stream: {
    id: number;
    name: string;
  };
  section: {
    id: number;
    name: string;
  };
  class: {
    id: number;
    name: string;
  };
  session: {
    id: number;
    name: string;
  };
  id: number;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  branchId: number;
}
export const getUserInfoFromToken = (): UserInfo | null => {
  const token = Cookies.get('token');
  if (!token) return null;
  
  try {
    const decoded: UserInfo = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};


export const getTokenFromCookie = (): string | null => {
  return Cookies.get('token') || null;
};


export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return getTokenFromCookie();
  }
  return null;
};

// Store token in localStorage
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

// Remove token from localStorage
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

// Get user data from localStorage
export const getUserData = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};








export const loader = <div className="loader_global_template_2"></div>

export const buttonLoader = <div className="buttonLoader"></div>


// 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