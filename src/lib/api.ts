import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://100.30.101.62:8000';
const API_URL = import.meta.env.VITE_API_URL || 'http://100.30.101.62:8000';
const CALLBACK_API_URL = import.meta.env.VITE_CALLBACK_API_URL;
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

const authClient = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const callbackClient = axios.create({
  baseURL: `${CALLBACK_API_URL}/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

authClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

callbackClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const api = {
  auth: {
    signUp: (username: string, email: string, password: string, fullName?: string) =>
      authClient.post('/auth/signup', { username, email, password, full_name: fullName }),

    signIn: (email: string, password: string) =>
      authClient.post('/auth/signin', { email, password }),

    signOut: () => authClient.post('/auth/logout'),

    getUser: () => authClient.get('/auth/me'),
  },

  cloudProfiles: {
    list: () => apiClient.get('/cloud-profiles'),
    get: (id: string) => apiClient.get(`/cloud-profiles/${id}`),
    create: (data: any) => apiClient.post('/cloud-profiles', data),
    update: (id: string, data: any) => apiClient.put(`/cloud-profiles/${id}`, data),
    delete: (id: string) => apiClient.delete(`/cloud-profiles/${id}`),
  },

  computeClusters: {
    list: () => apiClient.get('/compute-clusters'),
    get: (id: string) => apiClient.get(`/compute-clusters/${id}`),
    create: (data: any) => apiClient.post('/compute-clusters', data),
    update: (id: string, data: any) => apiClient.put(`/compute-clusters/${id}`, data),
    delete: (id: string) => apiClient.delete(`/compute-clusters/${id}`),
    start: (id: string) => apiClient.post(`/compute-clusters/${id}/start`),
    stop: (id: string) => apiClient.post(`/compute-clusters/${id}/stop`),
  },

  workspaces: {
    list: () => apiClient.get('/workspaces'),
    get: (id: string) => apiClient.get(`/workspaces/${id}`),
    create: (data: any) => apiClient.post('/workspaces', data),
    update: (id: string, data: any) => apiClient.put(`/workspaces/${id}`, data),
    delete: (id: string) => apiClient.delete(`/workspaces/${id}`),
  },

  notebooks: {
    list: (workspaceId: string) => apiClient.get(`/notebooks?workspace_id=${workspaceId}`),
    get: (id: string) => apiClient.get(`/notebooks/${id}`),
    create: (data: any) => apiClient.post('/notebooks', data),
    update: (id: string, data: any) => apiClient.put(`/notebooks/${id}`, data),
    delete: (id: string) => apiClient.delete(`/notebooks/${id}`),
    execute: (id: string, cellId: string, code: string) =>
      apiClient.post(`/notebooks/${id}/execute`, { cellId, code }),
  },

  dataSources: {
    list: () => apiClient.get('/data-sources'),
    get: (id: string) => apiClient.get(`/data-sources/${id}`),
    create: (data: any) => apiClient.post('/data-sources', data),
    update: (id: string, data: any) => apiClient.put(`/data-sources/${id}`, data),
    delete: (id: string) => apiClient.delete(`/data-sources/${id}`),
    testConnection: (data: any) => apiClient.post('/data-sources/test', data),
  },

  dataCatalog: {
    list: (workspaceId: string) => apiClient.get(`/data-catalog?workspace_id=${workspaceId}`),
    getDatabases: () => apiClient.get('/data-catalog/databases'),
    getTables: (database: string) => apiClient.get(`/data-catalog/databases/${database}/tables`),
    getSchema: (database: string, table: string) =>
      apiClient.get(`/data-catalog/databases/${database}/tables/${table}/schema`),
  },

  queries: {
    list: (workspaceId: string) => apiClient.get(`/queries?workspace_id=${workspaceId}`),
    get: (id: string) => apiClient.get(`/queries/${id}`),
    create: (data: any) => apiClient.post('/queries', data),
    update: (id: string, data: any) => apiClient.put(`/queries/${id}`, data),
    delete: (id: string) => apiClient.delete(`/queries/${id}`),
    execute: (query: string, clusterId?: string) =>
      apiClient.post('/queries/execute', { query, cluster_id: clusterId }),
  },

  jobs: {
    list: (workspaceId: string) => apiClient.get(`/jobs?workspace_id=${workspaceId}`),
    get: (id: string) => apiClient.get(`/jobs/${id}`),
    create: (data: any) => apiClient.post('/jobs', data),
    update: (id: string, data: any) => apiClient.put(`/jobs/${id}`, data),
    delete: (id: string) => apiClient.delete(`/jobs/${id}`),
    run: (id: string) => apiClient.post(`/jobs/${id}/run`),
    getRuns: (id: string) => apiClient.get(`/jobs/${id}/runs`),
  },

  pipelines: {
    list: (workspaceId: string) => apiClient.get(`/pipelines?workspace_id=${workspaceId}`),
    get: (id: string) => apiClient.get(`/pipelines/${id}`),
    create: (data: any) => apiClient.post('/pipelines', data),
    update: (id: string, data: any) => apiClient.put(`/pipelines/${id}`, data),
    delete: (id: string) => apiClient.delete(`/pipelines/${id}`),
    deploy: (id: string) => apiClient.post(`/pipelines/${id}/deploy`),
  },
};

export const callbackApi = {
  execute: (endpoint: string, data: any) =>
    callbackClient.post(endpoint, data),
};

export default api;
