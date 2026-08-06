import React from 'react';
import { Transaction } from '../types';
import { SummaryCards } from '../components/SummaryCards';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { TransactionTable } from '../components/TransactionTable';
import { ArrowRight, Receipt, PlusCircle, Sparkles } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  isLoading: boolean;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
  onNavigateToHistory: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  isLoading,
  onEditTransaction,
  onDeleteTransaction,
  onOpenAddModal,
  onNavigateToHistory,
}) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Empty state banner */}
      {!isLoading && transactions.length === 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-100">
                No transactions found
              </h3>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
                Add your first transaction to get started with tracking your budget and expenses.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAddModal}
            className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-stretch sm:self-auto justify-center"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add First Transaction</span>
          </button>
        </div>
      )}

      {/* KPI Cards Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Overview Summary
          </h2>
        </div>
        <SummaryCards transactions={transactions} isLoading={isLoading} />
      </section>

      {/* Analytics & Charts Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Financial Analytics
          </h2>
        </div>
        <AnalyticsCharts transactions={transactions} />
      </section>

      {/* Recent Transactions List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h2>
          </div>
          <button
            onClick={onNavigateToHistory}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group"
          >
            <span>View All Transactions</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <TransactionTable
          transactions={transactions}
          onEdit={onEditTransaction}
          onDelete={onDeleteTransaction}
          onOpenAddModal={onOpenAddModal}
          isLoading={isLoading}
        />
      </section>
    </div>
  );
};
