import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import ShopDashboard from './pages/ShopDashboard';
import AdminDashboard from './pages/AdminDashboard';

const AppRouter: React.FC = () => {
  const { auth } = useApp();

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
