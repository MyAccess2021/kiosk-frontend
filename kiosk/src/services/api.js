const BASE_URL = 'https://kiosk-backend.myaccess.cloud';

function getToken() {
  return localStorage.getItem('accessToken') || '';
}

export async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      throw data || { status: response.status, message: response.statusText };
    }
    return data;
  } catch (err) {
    console.error(`API request failed for ${path}:`, err);
    throw err;
  }
}