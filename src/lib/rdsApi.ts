const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let authToken: string | null = null;

function initAuthToken() {
  if (typeof window !== 'undefined' && !authToken) {
    authToken = localStorage.getItem('auth_token');
  }
}

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
}

export function getAuthToken() {
  initAuthToken();
  return authToken || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Backend API is not responding. Please use offline credentials: admin@icecube.com / admin123');
    }
    throw error;
  }
}

export const rdsApi = {
  auth: {
    async signUp(email: string, password: string, fullName: string) {
      const response = await fetchWithAuth('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      setAuthToken(response.access_token);
      return { data: response, error: null };
    },

    async signIn(email: string, password: string) {
      try {
        const response = await fetchWithAuth('/auth/signin', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        setAuthToken(response.access_token);
        return { data: response, error: null };
      } catch (error: any) {
        return { data: null, error: error.message };
      }
    },

    async signOut() {
      setAuthToken(null);
      return { error: null };
    },

    async getUser() {
      try {
        const user = await fetchWithAuth('/auth/me');
        return { data: { user }, error: null };
      } catch (error: any) {
        return { data: null, error: error.message };
      }
    },
  },

  workspaces: {
    async getAll() {
      return fetchWithAuth('/workspaces');
    },

    async create(data: any) {
      return fetchWithAuth('/workspaces', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(id: string, data: any) {
      return fetchWithAuth(`/workspaces/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async delete(id: string) {
      return fetchWithAuth(`/workspaces/${id}`, {
        method: 'DELETE',
      });
    },
  },

  dataSources: {
    async getAll() {
      return fetchWithAuth('/data-sources');
    },

    async create(data: any) {
      return fetchWithAuth('/data-sources', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(id: string, data: any) {
      return fetchWithAuth(`/data-sources/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async delete(id: string) {
      return fetchWithAuth(`/data-sources/${id}`, {
        method: 'DELETE',
      });
    },
  },

  pipelines: {
    async getAll() {
      return fetchWithAuth('/pipelines');
    },

    async create(data: any) {
      return fetchWithAuth('/pipelines', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(id: string, data: any) {
      return fetchWithAuth(`/pipelines/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async delete(id: string) {
      return fetchWithAuth(`/pipelines/${id}`, {
        method: 'DELETE',
      });
    },
  },

  cloudProfiles: {
    async getAll() {
      return fetchWithAuth('/cloud-profiles');
    },

    async create(data: any) {
      return fetchWithAuth('/cloud-profiles', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(id: string, data: any) {
      return fetchWithAuth(`/cloud-profiles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async delete(id: string) {
      return fetchWithAuth(`/cloud-profiles/${id}`, {
        method: 'DELETE',
      });
    },
  },

  computeClusters: {
    async getAll() {
      return fetchWithAuth('/compute-clusters');
    },

    async create(data: any) {
      return fetchWithAuth('/compute-clusters', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(id: string, data: any) {
      return fetchWithAuth(`/compute-clusters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async delete(id: string) {
      return fetchWithAuth(`/compute-clusters/${id}`, {
        method: 'DELETE',
      });
    },
  },

  notebooks: {
    async getAll() {
      return fetchWithAuth('/notebooks');
    },

    async create(data: any) {
      return fetchWithAuth('/notebooks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(id: string, data: any) {
      return fetchWithAuth(`/notebooks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async delete(id: string) {
      return fetchWithAuth(`/notebooks/${id}`, {
        method: 'DELETE',
      });
    },
  },

  savedQueries: {
    async getAll() {
      return fetchWithAuth('/saved-queries');
    },

    async create(data: any) {
      return fetchWithAuth('/saved-queries', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(id: string, data: any) {
      return fetchWithAuth(`/saved-queries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async delete(id: string) {
      return fetchWithAuth(`/saved-queries/${id}`, {
        method: 'DELETE',
      });
    },
  },

  etlPipelines: {
    async getAll() {
      return fetchWithAuth('/etl-pipelines');
    },

    async getById(id: string) {
      return fetchWithAuth(`/etl-pipelines/${id}`);
    },

    async create(data: any) {
      return fetchWithAuth('/etl-pipelines', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(id: string, data: any) {
      return fetchWithAuth(`/etl-pipelines/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async delete(id: string) {
      return fetchWithAuth(`/etl-pipelines/${id}`, {
        method: 'DELETE',
      });
    },
  },
};
