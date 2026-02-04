/**
 * FetchHttpClient Tests
 * @module tests/unit/core
 */

import { FetchHttpClient } from '../../../src/core/data/datasources/FetchHttpClient';
import { ApiError, NetworkError } from '../../../src/core/domain/entities/Errors';

// Mock globalThis fetch
globalThis.fetch = jest.fn();

describe('FetchHttpClient', () => {
  let client: FetchHttpClient;

  beforeEach(() => {
    client = new FetchHttpClient({
      baseURL: 'https://api.example.com',
      headers: { 'X-Custom': 'test' },
      timeout: 5000
    });
    jest.clearAllMocks();
  });

  describe('request()', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData
      });

      const response = await client.get('/users');

      expect(response.data).toEqual(mockData);
      expect(response.status).toBe(200);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'GET',
          headers: { 'X-Custom': 'test' }
        })
      );
    });

    it('should make successful POST request with body', async () => {
      const mockResponse = { success: true };
      const postData = { name: 'New User' };

      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse
      });

      const response = await client.post('/users', postData);

      expect(response.data).toEqual(mockResponse);
      expect(response.status).toBe(201);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData)
        })
      );
    });

    it('should build URL with query parameters', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => []
      });

      await client.get('/search', { params: { q: 'test', page: '1' } });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.example.com/search?q=test&page=1',
        expect.any(Object)
      );
    });

    it('should throw ApiError on HTTP error', async () => {
      const errorData = { error: 'Not found' };
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: {
          get: jest.fn(() => 'application/json'),
          forEach: jest.fn()
        },
        json: async () => errorData
      });

      await expect(client.get('/users/999')).rejects.toThrow(ApiError);
    });

    it('should throw NetworkError on fetch failure', async () => {
      (globalThis.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

      await expect(client.get('/users')).rejects.toThrow(NetworkError);
    });

    it('should handle absolute URLs', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({})
      });

      await client.get('https://other-api.com/data');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://other-api.com/data',
        expect.any(Object)
      );
    });

    it('should handle non-JSON responses', async () => {
      const textData = 'Plain text response';
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => textData
      });

      const response = await client.get('/text');

      expect(response.data).toBe(textData);
    });
  });
});
