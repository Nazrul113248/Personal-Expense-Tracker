import React from 'react';
import { Transaction } from '../types';
import { TransactionTable } from '../components/TransactionTable';
import { Receipt, Plus } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  isLoading,
  onEditTransaction,
  onDeleteTransaction,
  onOpenAddModal,
}) => {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Transaction History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Filter, search, sort, and export all recorded income and expenses.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      <TransactionTable
        transactions={transactions}
        onEdit={onEditTransaction}
        onDelete={onDeleteTransaction}
        onOpenAddModal={onOpenAddModal}
        isLoading={isLoading}
      />
    </div>
  );
};
