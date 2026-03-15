import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import ShopDashboard from './pages/ShopDashboard';
import AdminDashboard from './pages/AdminDashboard';

const AppRouter: React.FC = () => {
  const { auth, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-body">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!auth.isLoggedIn) return <LoginPage />;
  if (auth.role === 'admin') return <AdminDashboard />;
  return <ShopDashboard />;
};

const App: React.FC = () => (
  <AppProvider>
    <AppRouter />
  </AppProvider>
);

export default App;
