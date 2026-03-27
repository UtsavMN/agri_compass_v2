const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function getAuthHeaders(isFormData = false): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Development mode: No token required
  return headers;
}

export async function apiGet(endpoint: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
  });
  if (!response.ok) {
    throw new Error(`API GET request failed: ${response.statusText}`);
  }
  return response.json();
}

export async function apiPost(endpoint: string, body: any, options?: RequestInit) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    ...options
  });
  if (!response.ok) {
    throw new Error(`API POST request failed: ${response.statusText}`);
  }
  return response.json();
}

export async function apiPut(endpoint: string, body: any) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`API PUT request failed: ${response.statusText}`);
  }
  return response.json();
}

export async function apiDelete(endpoint: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    throw new Error(`API DELETE request failed: ${response.statusText}`);
  }
  return response.json();
}

export async function apiUpload(endpoint: string, formData: FormData) {
  const headers = await getAuthHeaders(true); // Omit Content-Type to let browser set boundary automatically
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`API UPLOAD request failed: ${response.statusText}`);
  }
  return response.json();
}
