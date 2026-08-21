import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://api.amoramatch.one';

async function token() { return SecureStore.getItemAsync('accessToken'); }

async function request(path: string, options: RequestInit = {}) {
  const accessToken = await token();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `API ${response.status}`);
  return data;
}

export const api = {
  register: (body: unknown) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: unknown) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  nextMatch: () => request('/matches/next'),
  acceptMatch: (targetUserId: string) => request('/matches/accept', { method: 'POST', body: JSON.stringify({ targetUserId }) }),
  skipMatch: (targetUserId: string) => request('/matches/skip', { method: 'POST', body: JSON.stringify({ targetUserId }) }),
  conversations: () => request('/messages/conversations'),
  messages: (userId: string) => request(`/messages/${userId}`),
  sendMessage: (userId: string, content: string) => request(`/messages/${userId}`, { method: 'POST', body: JSON.stringify({ content }) }),
  wallet: () => request('/wallet/me'),
  walletTransactions: () => request('/wallet/transactions'),
  gifts: () => request('/gifts/catalog'),
  sendGift: (body: unknown) => request('/gifts/send', { method: 'POST', body: JSON.stringify(body) }),
  liveRooms: () => request('/live'),
  liveRoom: (roomId: string) => request(`/live/${roomId}`),
  membership: () => request('/membership/me')
};
