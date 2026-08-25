import { API_URL, getValidAccessToken } from "./api/client";

export async function phase1Request(path: string, options: RequestInit = {}, retry = true): Promise<any> {
  const token = await getValidAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (response.status === 401 && retry) {
    const fresh = await getValidAccessToken();
    if (fresh && fresh !== token) return phase1Request(path, options, false);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `API ${response.status}`);
  return data;
}
