import React from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, Scale, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../lib/currency';

interface SummaryCardsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ transactions, isLoading }) => {
  const totalIncome = transactions
    .filter((t) => t.type === 'Income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'Expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const incomeCount = transactions.filter((t) => t.type === 'Income').length;
  const expenseCount = transactions.filter((t) => t.type === 'Expense').length;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse p-6"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Total Income Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-emerald-900/10 dark:to-slate-900/50 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Total Income
          </span>
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalIncome)}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>{incomeCount} total income entries</span>
          </p>
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent dark:from-rose-950/40 dark:via-rose-900/10 dark:to-slate-900/50 p-6 rounded-2xl border border-rose-200 dark:border-rose-800/60 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            Total Expenses
          </span>
          <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalExpenses)}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            <span>{expenseCount} recorded expenses</span>
          </p>
        </div>
      </div>

      {/* Current Net Balance Card */}
      <div
        className={`relative overflow-hidden p-6 rounded-2xl border shadow-xs ${
          balance >= 0
            ? 'bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent dark:from-indigo-950/40 dark:via-indigo-900/10 dark:to-slate-900/50 border-indigo-200 dark:border-indigo-800/60'
            : 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-amber-900/10 dark:to-slate-900/50 border-amber-200 dark:border-amber-800/60'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              balance >= 0 ? 'text-indigo-700 dark:text-indigo-400' : 'text-amber-700 dark:text-amber-400'
            }`}
          >
            Net Balance
          </span>
          <div
            className={`p-2.5 rounded-xl ${
              balance >= 0
                ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
            }`}
          >
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <h3
            className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${
              balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {formatCurrency(balance)}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Scale className="w-3.5 h-3.5" />
            <span>
              {totalIncome > 0
                ? `${Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)}% savings margin`
                : 'Net available funds'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
