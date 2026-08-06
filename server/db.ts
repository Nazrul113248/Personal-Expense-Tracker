import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

export interface DBUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface DBTransaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Entertainment' | 'Health' | 'Education' | 'Salary' | 'Other';
  description: string;
  date: string;
  createdAt: string;
}

const supabaseUrl = process.env.SUPABASE_URL || 'https://ytunkfdcqpxhugiudmop.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0dW5rZmRjcXB4aHVnaXVkbW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzI3ODYsImV4cCI6MjEwMTYwODc4Nn0.ByfVrIyU5R8S4lhIG6J2jAAy69RTV-jyGVr_ZBsUagY';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const db = {
  getUsers: async (): Promise<DBUser[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    return data || [];
  },

  findUserByEmail: async (email: string): Promise<DBUser | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    if (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
    return data || null;
  },

  findUserById: async (id: string): Promise<DBUser | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.error('Error finding user by id:', error);
      throw error;
    }
    return data || null;
  },

  createUser: async (user: DBUser): Promise<DBUser> => {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    return data;
  },

  updateUser: async (id: string, updates: Partial<DBUser>): Promise<DBUser | null> => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
    return data || null;
  },

  getTransactionsByUser: async (userId: string): Promise<DBTransaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('userId', userId);
    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
    return data || [];
  },

  findTransactionById: async (id: string, userId: string): Promise<DBTransaction | null> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('userId', userId)
      .maybeSingle();
    if (error) {
      console.error('Error finding transaction:', error);
      throw error;
    }
    return data || null;
  },

  createTransaction: async (tx: DBTransaction): Promise<DBTransaction> => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([tx])
      .select()
      .single();
    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
    return data;
  },

  updateTransaction: async (id: string, userId: string, updates: Partial<DBTransaction>): Promise<DBTransaction | null> => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .eq('userId', userId)
      .select()
      .maybeSingle();
    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
    return data || null;
  },

  deleteTransaction: async (id: string, userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('userId', userId)
      .select();
    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
    return data !== null && data.length > 0;
  },
};
