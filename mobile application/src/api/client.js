import { API_CONFIG, API_ENDPOINTS } from '../config/api';

async function request(path) {
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

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkApiHealth() {
  return request(API_ENDPOINTS.health);
}

export async function fetchServiceCatalog() {
  const result = await request(API_ENDPOINTS.services);
  return result.data;
}

export async function fetchBrand() {
  const result = await request(API_ENDPOINTS.brand);
  return result.data;
}
