import { Transaction, TransactionType, TransactionCategory, User } from '../types';

const TOKEN_KEY = 'pet_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (name: string, email: string, password: string) =>
    request<{ message: string; user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ message: string; user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // User
  getProfile: () => request<{ user: User }>('/api/user/profile'),

  updateProfile: (name: string, email: string) =>
    request<{ message: string; user: User }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/api/user/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // Transactions
  getTransactions: (filters?: { type?: string; category?: string; search?: string; sortBy?: string }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request<{ transactions: Transaction[]; count: number }>(`/api/transactions${query}`);
  },

  getTransactionById: (id: string) =>
    request<{ transaction: Transaction }>(`/api/transactions/${id}`),

  createTransaction: (data: {
    title: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    description?: string;
    date: string;
  }) =>
    request<{ message: string; transaction: Transaction }>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTransaction: (
    id: string,
    data: Partial<{
      title: string;
      amount: number;
      type: TransactionType;
      category: TransactionCategory;
      description: string;
      date: string;
    }>
  ) =>
    request<{ message: string; transaction: Transaction }>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTransaction: (id: string) =>
    request<{ message: string }>(`/api/transactions/${id}`, {
      method: 'DELETE',
    }),
};
