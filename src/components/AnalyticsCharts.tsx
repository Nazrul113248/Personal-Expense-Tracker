import React from 'react';
import { Transaction, TransactionCategory } from '../types';
import { formatCurrency } from '../lib/currency';
import {
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Film,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Layers,
  PieChart,
  BarChart3,
} from 'lucide-react';

interface AnalyticsChartsProps {
  transactions: Transaction[];
}

export const CATEGORY_COLORS: Record<TransactionCategory, { bg: string; text: string; bar: string }> = {
  Food: { bg: 'bg-orange-100 dark:bg-orange-950/60', text: 'text-orange-700 dark:text-orange-400', bar: 'bg-orange-500' },
  Transport: { bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-400', bar: 'bg-blue-500' },
  Shopping: { bg: 'bg-pink-100 dark:bg-pink-950/60', text: 'text-pink-700 dark:text-pink-400', bar: 'bg-pink-500' },
  Bills: { bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-400', bar: 'bg-amber-500' },
  Entertainment: { bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-400', bar: 'bg-purple-500' },
  Health: { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-400', bar: 'bg-emerald-500' },
  Education: { bg: 'bg-cyan-100 dark:bg-cyan-950/60', text: 'text-cyan-700 dark:text-cyan-400', bar: 'bg-cyan-500' },
  Salary: { bg: 'bg-teal-100 dark:bg-teal-950/60', text: 'text-teal-700 dark:text-teal-400', bar: 'bg-teal-500' },
  Other: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', bar: 'bg-slate-500' },
};

export const CATEGORY_ICONS: Record<TransactionCategory, React.ElementType> = {
  Food: Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: Zap,
  Entertainment: Film,
  Health: HeartPulse,
  Education: GraduationCap,
  Salary: Briefcase,
  Other: Layers,
};

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ transactions }) => {
  const expensesOnly = transactions.filter((t) => t.type === 'Expense');
  const totalExpenseAmount = expensesOnly.reduce((acc, t) => acc + t.amount, 0);

  // Group by category
  const categoryTotals: Record<string, number> = {};
  expensesOnly.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const categorySorted = Object.entries(categoryTotals)
    .map(([cat, amount]) => ({
      category: cat as TransactionCategory,
      amount,
      percentage: totalExpenseAmount > 0 ? Math.round((amount / totalExpenseAmount) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Group by Month (Last 6 Months)
  const monthlyData: Record<string, { income: number; expense: number }> = {};
  transactions.forEach((t) => {
    if (!t.date) return;
    const dateObj = new Date(t.date);
    const monthKey = dateObj.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0 };
    }
    if (t.type === 'Income') {
      monthlyData[monthKey].income += t.amount;
    } else {
      monthlyData[monthKey].expense += t.amount;
    }
  });

  const monthlyList = Object.entries(monthlyData).slice(-6);
  const maxMonthlyVal = Math.max(
    1,
    ...monthlyList.map(([_, data]) => Math.max(data.income, data.expense))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Expense Distribution */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Category Breakdown
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Expenses Only
            </span>
          </div>

          {categorySorted.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
              No expense records found to generate category analytics.
            </div>
          ) : (
            <div className="space-y-4 my-2">
              {categorySorted.slice(0, 5).map(({ category, amount, percentage }) => {
                const Icon = CATEGORY_ICONS[category] || Layers;
                const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;

                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.text}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(amount)}
                        </span>
                        <span className="text-slate-400 font-mono w-9 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors.bar} transition-all duration-500 rounded-full`}
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Cash Flow Comparison */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Summary
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Expense
              </span>
            </div>
          </div>

          {monthlyList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
              No transactions recorded for monthly analysis.
            </div>
          ) : (
            <div className="pt-6 pb-2 flex items-end justify-between gap-2 h-48 border-b border-slate-100 dark:border-slate-800">
              {monthlyList.map(([month, data]) => {
                const incomePct = Math.round((data.income / maxMonthlyVal) * 100);
                const expensePct = Math.round((data.expense / maxMonthlyVal) * 100);

                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex justify-center items-end gap-1.5 h-36">
                      {/* Income Bar */}
                      <div
                        className="w-3.5 sm:w-5 bg-emerald-500 hover:bg-emerald-600 transition-all rounded-t-md relative group/bar"
                        style={{ height: `${Math.max(incomePct, 6)}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 bg-slate-900 text-white text-[10px] py-1 px-1.5 rounded shadow whitespace-nowrap pointer-events-none transition-opacity z-10">
                          +{formatCurrency(data.income)}
                        </div>
                      </div>
                      {/* Expense Bar */}
                      <div
                        className="w-3.5 sm:w-5 bg-rose-500 hover:bg-rose-600 transition-all rounded-t-md relative group/bar"
                        style={{ height: `${Math.max(expensePct, 6)}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 bg-slate-900 text-white text-[10px] py-1 px-1.5 rounded shadow whitespace-nowrap pointer-events-none transition-opacity z-10">
                          -{formatCurrency(data.expense)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {month}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
