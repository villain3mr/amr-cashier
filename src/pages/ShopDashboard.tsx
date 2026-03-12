import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Sidebar from '@/components/layout/Sidebar';
import DashboardPage from '@/pages/shop/DashboardPage';
import SalesPage from '@/pages/shop/SalesPage';
import InventoryPage from '@/pages/shop/InventoryPage';
import CustomersPage from '@/pages/shop/CustomersPage';
import InvoicesPage from '@/pages/shop/InvoicesPage';
import ShopSettingsPage from '@/pages/shop/ShopSettingsPage';

export type ShopTab = 'dashboard' | 'sales' | 'inventory' | 'customers' | 'invoices' | 'settings';

const ShopDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ShopTab>('dashboard');
  const { auth } = useApp();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage />;
      case 'sales': return <SalesPage />;
      case 'inventory': return <InventoryPage />;
      case 'customers': return <CustomersPage />;
      case 'invoices': return <InvoicesPage />;
      case 'settings': return <ShopSettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} role="shop" shopName={auth.shopName || ''} />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default ShopDashboard;
