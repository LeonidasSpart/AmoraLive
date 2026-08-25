import { api, API_URL, getValidAccessToken } from "./api/client";

export { api, API_URL };

export async function phase2Request(path: string, options: RequestInit = {}): Promise<any> {
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
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `API ${response.status}`);
  return data;
}
