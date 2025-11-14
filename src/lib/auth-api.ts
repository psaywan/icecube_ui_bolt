import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://52.66.228.92:8000';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    const response = await axios.post(`${AUTH_API_URL}/auth/signup`, {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post(`${AUTH_API_URL}/auth/signin`, {
      email,
      password,
    });
    return response.data;
  },

  async getUser(token: string): Promise<AuthUser> {
    const response = await axios.get(`${AUTH_API_URL}/auth/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async signOut(token: string): Promise<void> {
    await axios.post(
      `${AUTH_API_URL}/auth/signout`,
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
