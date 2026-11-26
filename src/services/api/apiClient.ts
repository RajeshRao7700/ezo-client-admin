import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Configured for future Laravel REST API backend with Sanctum authentication
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    // Request Interceptor: Attach Sanctum Bearer token if present
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Handle 401 Unauthorized
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn('[ApiClient] 401 Unauthorized - Admin session expired');
          this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  public setToken(token: string): void {
    this.token = token;
    try {
      sessionStorage.setItem('ezo_admin_token', token);
    } catch (e) {}
  }

  public clearToken(): void {
    this.token = null;
    try {
      sessionStorage.removeItem('ezo_admin_token');
    } catch (e) {}
  }

  public getToken(): string | null {
    if (!this.token) {
      try {
        this.token = sessionStorage.getItem('ezo_admin_token');
      } catch (e) {}
    }
    return this.token;
  }

  public get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
