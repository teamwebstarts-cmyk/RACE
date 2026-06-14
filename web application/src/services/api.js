const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchFromApi(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}
