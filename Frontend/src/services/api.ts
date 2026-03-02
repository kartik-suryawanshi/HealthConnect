const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<{ success: boolean; data?: T; message?: string; count?: number }> {
    const { requiresAuth = true, ...fetchOptions } = options;

    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (requiresAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Auth methods
  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: 'patient' | 'doctor';
    dateOfBirth?: string;
    phone?: string;
    address?: string;
    licenseNumber?: string;
    specialty?: string;
    hospital?: string;
  }) {
    const response = await this.request<{ user: any; token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
        requiresAuth: false,
      }
    );
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ user: any; token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        requiresAuth: false,
      }
    );
    return response;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(data: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Health Records
  async getHealthRecords(params?: { type?: string; search?: string; status?: string }) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request(`/health-records${queryString}`);
  }

  async getHealthRecord(id: string) {
    return this.request(`/health-records/${id}`);
  }

  async createHealthRecord(formData: FormData) {
    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/health-records`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  }

  async updateHealthRecord(id: string, data: any) {
    return this.request(`/health-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHealthRecord(id: string) {
    return this.request(`/health-records/${id}`, {
      method: 'DELETE',
    });
  }

  async downloadHealthRecord(id: string) {
    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/health-records/${id}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-record-${id}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Access Requests
  async getAccessRequests(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/access-requests${query}`);
  }

  async getAccessRequest(id: string) {
    return this.request(`/access-requests/${id}`);
  }

  async createAccessRequest(data: {
    patientId: string;
    reason: string;
    duration: string;
    conditions?: string;
  }) {
    return this.request('/access-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveAccessRequest(id: string, conditions?: string) {
    return this.request(`/access-requests/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ conditions }),
    });
  }

  async rejectAccessRequest(id: string, rejectionReason?: string) {
    return this.request(`/access-requests/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectionReason }),
    });
  }

  async revokeAccess(id: string) {
    return this.request(`/access-requests/${id}/revoke`, {
      method: 'PUT',
    });
  }

  // Activity Logs
  async getActivityLogs(params?: { action?: string; entityType?: string; limit?: number }) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request(`/activity-logs${queryString}`);
  }

  async getEntityActivityLogs(entityType: string, entityId: string) {
    return this.request(`/activity-logs/entity/${entityType}/${entityId}`);
  }

  // Users
  async getDashboardStats() {
    return this.request('/users/stats');
  }

  async getUserProfile(id: string) {
    return this.request(`/users/${id}`);
  }

  async getAuthorizedPatients() {
    return this.request('/users/patients/authorized');
  }

  async getSharedAccess() {
    return this.request('/users/doctors/shared');
  }
  // Insurance
  async addInsurance(data: any) {
    return this.request('/insurance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyInsurance() {
    return this.request('/insurance/my-insurance');
  }

  async getPatientMaskedInsurance(patientId: string) {
    return this.request(`/insurance/patient/${patientId}`);
  }
  // Metrics
  async addHealthMetric(data: any) {
    return this.request('/metrics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getHealthMetrics(patientId: string, metricType?: string) {
    const query = metricType && metricType !== 'all' ? `?metricType=${metricType}` : '';
    return this.request(`/metrics/patient/${patientId}${query}`);
  }
}

export default new ApiService();

