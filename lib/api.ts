const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

console.log('[v0] Frontend API initialized - API_URL:', API_URL);

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  console.log('[v0] fetchAPI - Endpoint:', endpoint);
  console.log('[v0] fetchAPI - Full URL:', url);
  console.log('[v0] fetchAPI - Method:', options.method || 'GET');
  console.log('[v0] fetchAPI - Options:', options);
  
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('[v0] fetchAPI - Response status:', response.status);
    console.log('[v0] fetchAPI - Response headers:', response.headers);

    if (!response.ok) {
      const error = await response.json();
      console.error('[v0] fetchAPI - API error response:', error);
      throw new Error(error.error || error.details || 'API request failed');
    }

    const data = await response.json();
    console.log('[v0] fetchAPI - Response data:', data);
    return data;
  } catch (error) {
    console.error('[v0] fetchAPI - Catch error:', error);
    throw error;
  }
}

export async function getProducts() {
  return fetchAPI('/api/products');
}

export async function getProduct(id: string) {
  return fetchAPI(`/api/products/${id}`);
}

export async function createProduct(data: FormData) {
  return fetch(`${API_URL}/api/products`, {
    method: 'POST',
    credentials: 'include',
    body: data,
  }).then(res => res.json());
}

export async function updateProduct(id: string, data: FormData) {
  return fetch(`${API_URL}/api/products/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: data,
  }).then(res => res.json());
}

export async function deleteProduct(id: string) {
  return fetchAPI(`/api/products/${id}`, { method: 'DELETE' });
}

export async function getCategories() {
  console.log('[v0] getCategories - Fetching all categories');
  return fetchAPI('/api/categories');
}

export async function createCategory(data: { name: string; description?: string; slug?: string }) {
  console.log('[v0] createCategory - Creating with data:', data);
  return fetchAPI('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: string, data: { name?: string; description?: string; slug?: string }) {
  console.log('[v0] updateCategory - Updating ID:', id, 'with data:', data);
  return fetchAPI(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string) {
  console.log('[v0] deleteCategory - Deleting ID:', id);
  return fetchAPI(`/api/categories/${id}`, { method: 'DELETE' });
}
