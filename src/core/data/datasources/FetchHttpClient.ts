/**
 * Fetch HTTP Client Implementation
 * @module core/data/datasources
 * 
 * HTTP client using native fetch API
 * Provides error handling and response transformation
 * Now includes automatic retry logic for transient failures
 */

import { NetworkError, ApiError } from '../../domain/entities/Errors';
import { withRetry, isNetworkError } from '@shared/utils/retryLogic';
import type { 
  IHttpClient, 
  HttpClientConfig, 
  HttpRequestConfig, 
  HttpResponse 
} from './IHttpClient';

export class FetchHttpClient implements IHttpClient {
  private readonly baseURL: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly timeout: number;
  private readonly enableRetry: boolean;

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = config.baseURL || '';
    this.defaultHeaders = config.headers || {};
    this.timeout = config.timeout || 30000;
    this.enableRetry = config.enableRetry ?? true; // Enable retry by default
  }

  async request<T = unknown>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    // Wrap request in retry logic if enabled
    if (this.enableRetry) {
      return withRetry(
        () => this.executeRequest<T>(config),
        {
          maxAttempts: 3,
          baseDelay: 1000,
          shouldRetry: isNetworkError,
        }
      );
    }
    
    return this.executeRequest<T>(config);
  }

  private async executeRequest<T = unknown>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    const url = this.buildURL(config.url, config.params);
    const headers = { ...this.defaultHeaders, ...config.headers };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: config.method,
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }

      // Handle HTTP errors
      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data
        );
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: this.parseHeaders(response.headers),
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new NetworkError(`Request timeout after ${this.timeout}ms`);
        }
        throw new NetworkError(error.message);
      }

      throw new NetworkError('Unknown network error');
    }
  }

  async get<T = unknown>(
    url: string,
    config?: Partial<HttpRequestConfig>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'GET', url, ...config });
  }

  async post<T = unknown>(
    url: string,
    body?: unknown,
    config?: Partial<HttpRequestConfig>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'POST', url, body, ...config });
  }

  private buildURL(url: string, params?: Record<string, string>): string {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    if (!params || Object.keys(params).length === 0) {
      return fullURL;
    }

    const searchParams = new URLSearchParams(params);
    return `${fullURL}?${searchParams.toString()}`;
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}
