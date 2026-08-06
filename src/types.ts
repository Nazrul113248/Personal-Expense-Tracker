export type TransactionType = 'Income' | 'Expense';

export type TransactionCategory =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Health'
  | 'Education'
  | 'Salary'
  | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description?: string;
  date: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: { category: TransactionCategory; amount: number; percentage: number }[];
  monthlyBreakdown: { month: string; income: number; expense: number }[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
