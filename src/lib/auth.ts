import { getAuthToken, rdsApi } from './rdsApi';

export async function getCurrentUser() {
  const token = getAuthToken();

  if (!token) {
    return { user: null, error: 'Not authenticated' };
  }

  if (token === 'dummy-token-for-offline-use') {
    return {
      user: {
        id: 'dummy-admin-id',
        email: 'admin@icecube.com',
      },
      error: null,
    };
  }

  try {
    const { data, error } = await rdsApi.auth.getUser();
    if (error || !data) {
      return { user: null, error };
    }
    return { user: data.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}
