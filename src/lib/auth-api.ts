import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://52.66.228.92:8000';

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
    const response = await axios.post(`${AUTH_API_URL}/auth/signup`, {
      username: email,
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  async signIn(email: string, password: string): Promise<SignInResponse> {
    const response = await axios.post(`${AUTH_API_URL}/auth/signin`, {
      email,
      password,
    });
    return response.data;
  },

  async getUser(token: string): Promise<AuthUser> {
    const response = await axios.get(`${AUTH_API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async signOut(token: string): Promise<void> {
    await axios.post(
      `${AUTH_API_URL}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('auth_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};
