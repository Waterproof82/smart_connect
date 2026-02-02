/**
 * HTTP Client Interface
 * @module core/data/datasources
 * 
 * Generic abstraction for HTTP communication
 * Can be implemented with fetch, axios, or any HTTP library
 */

export interface HttpClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
  enableRetry?: boolean; // Enable automatic retry on transient failures
}

export interface HttpRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface IHttpClient {
  /**
   * Performs an HTTP request
   */
  request<T = unknown>(config: HttpRequestConfig): Promise<HttpResponse<T>>;

  /**
   * GET request shorthand
   */
  get<T = unknown>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;

  /**
   * POST request shorthand
   */
  post<T = unknown>(url: string, body?: unknown, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
}
