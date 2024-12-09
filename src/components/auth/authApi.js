const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const authApi = {
  async login(email, password) {
    console.log('Sending login request:', { email, password });  // Legg til denne
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {  // Fjern /api/
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        // Fjern credentials: 'include' foreløpig
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      // La oss logge responsen for å se hva vi får
      console.log('Login response:', data);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {  // Fjern /api/
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async getProfile() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {  // Fjern /api/
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          throw new Error('Session expired');
        }
        throw new Error('Failed to fetch profile');
      }

      return response.json();
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('authToken');
  },

  getAuthToken() {
    return localStorage.getItem('authToken');
  },

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }
};