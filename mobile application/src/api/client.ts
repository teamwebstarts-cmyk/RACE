import { API_CONFIG, API_ENDPOINTS } from '../config/api';

async function request<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkApiHealth(): Promise<unknown> {
  return request(API_ENDPOINTS.health);
}

export async function fetchServiceCatalog(): Promise<unknown> {
  const result = await request<{ data: unknown }>(API_ENDPOINTS.services);
  return result.data;
}

export async function fetchBrand(): Promise<unknown> {
  const result = await request<{ data: unknown }>(API_ENDPOINTS.brand);
  return result.data;
}
