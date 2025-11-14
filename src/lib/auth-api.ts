import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://52.66.228.92:8000';

const axiosInstance = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export interface AuthUser {
  icecube_id: string;
  username: string;
  email: string;
  full_name: string | null;
  is_verified: boolean;
  last_login?: string | null;
}

export interface SignUpResponse {
  message: string;
  user: AuthUser;
  cognito_user_sub: string;
}

export interface SignInResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

export const authApi = {
  async signUp(email: string, password: string, fullName: string): Promise<SignUpResponse> {
    try {
      console.log('Calling signup API:', `${AUTH_API_URL}/auth/signup`);
      const response = await axiosInstance.post('/auth/signup', {
        username: email,
        email,
        password,
        full_name: fullName,
      });
      console.log('Signup response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Signup error:', error.response?.data || error.message);
      throw error;
    }
  },

  async signIn(email: string, password: string): Promise<SignInResponse> {
    try {
      console.log('Calling signin API:', `${AUTH_API_URL}/auth/signin`);
      const response = await axiosInstance.post('/auth/signin', {
        email,
        password,
      });
      console.log('Signin response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Signin error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getUser(token: string): Promise<AuthUser> {
    try {
      const response = await axiosInstance.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get user error:', error.response?.data || error.message);
      throw error;
    }
  },

  async signOut(token: string): Promise<void> {
    try {
      await axiosInstance.post(
        '/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error: any) {
      console.error('Signout error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('auth_token', token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('auth_token');
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};
