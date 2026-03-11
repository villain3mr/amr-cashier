import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import ShopDashboard from './pages/ShopDashboard';
import AdminDashboard from './pages/AdminDashboard';

const AppRouter = () => {
  const { auth } = useApp();

  if (!auth.isLoggedIn) return <LoginPage />;
  if (auth.role === 'admin') return <AdminDashboard />;
  return <ShopDashboard />;
};

const App = () => (
  <AppProvider>
    <AppRouter />
  </AppProvider>
);

export default App;
