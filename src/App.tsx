import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { api } from './lib/api';
import { Transaction } from './types';

import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { TransactionModal } from './components/TransactionModal';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { TransactionHistory } from './pages/TransactionHistory';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading, addToast } = useAuth();

  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTxLoading, setIsTxLoading] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  // Delete modal states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingTx, setIsDeletingTx] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsTxLoading(true);
    try {
      const res = await api.getTransactions();
      setTransactions(res.transactions);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to load transaction history');
    } finally {
      setIsTxLoading(false);
    }
  }, [isAuthenticated, addToast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated, fetchTransactions]);

  // Handle Add/Edit Form submission
  const handleSaveTransaction = async (data: any) => {
    setIsSubmittingTx(true);
    try {
      if (editingTransaction) {
        await api.updateTransaction(editingTransaction.id, data);
        addToast('success', 'Transaction updated successfully');
      } else {
        await api.createTransaction(data);
        addToast('success', 'New transaction added successfully');
      }
      setIsModalOpen(false);
      setEditingTransaction(null);
      await fetchTransactions();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to save transaction');
      throw err;
    } finally {
      setIsSubmittingTx(false);
    }
  };

  // Delete Trigger & Confirm
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeletingTx(true);
    try {
      await api.deleteTransaction(deletingId);
      addToast('success', 'Transaction deleted successfully');
      setDeletingId(null);
      await fetchTransactions();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to delete transaction');
    } finally {
      setIsDeletingTx(false);
    }
  };

  // Render Auth screens if not logged in
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Loading Personal Expense Tracker...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {authView === 'login' ? (
          <LoginPage onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
        )}
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsModalOpen(true);
        }}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          currentTab={currentTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsModalOpen(true);
          }}
          onRefreshData={fetchTransactions}
          isRefreshing={isTxLoading}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              transactions={transactions}
              isLoading={isTxLoading}
              onEditTransaction={(tx) => {
                setEditingTransaction(tx);
                setIsModalOpen(true);
              }}
              onDeleteTransaction={(id) => setDeletingId(id)}
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setIsModalOpen(true);
              }}
              onNavigateToHistory={() => setCurrentTab('transactions')}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionHistory
              transactions={transactions}
              isLoading={isTxLoading}
              onEditTransaction={(tx) => {
                setEditingTransaction(tx);
                setIsModalOpen(true);
              }}
              onDeleteTransaction={(id) => setDeletingId(id)}
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setIsModalOpen(true);
              }}
            />
          )}

          {currentTab === 'profile' && <ProfilePage />}

          {currentTab === '404' && (
            <NotFoundPage onGoHome={() => setCurrentTab('dashboard')} />
          )}
        </main>
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleSaveTransaction}
        initialData={editingTransaction}
        isLoading={isSubmittingTx}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Transaction"
        message="Are you sure you want to delete this financial record? This action cannot be undone."
        confirmLabel="Delete"
        isDanger={true}
        isLoading={isDeletingTx}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
