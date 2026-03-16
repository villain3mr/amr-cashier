import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Sidebar from '@/components/layout/Sidebar';
import DashboardPage from '@/pages/shop/DashboardPage';
import SalesPage from '@/pages/shop/SalesPage';
import InventoryPage from '@/pages/shop/InventoryPage';
import CustomersPage from '@/pages/shop/CustomersPage';
import InvoicesPage from '@/pages/shop/InvoicesPage';
import ShopSettingsPage from '@/pages/shop/ShopSettingsPage';
import LockScreen from '@/components/LockScreen';
import { supabase } from '@/integrations/supabase/client';

export type ShopTab = 'dashboard' | 'sales' | 'inventory' | 'customers' | 'invoices' | 'settings';

const ShopDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ShopTab>('dashboard');
  const { auth } = useApp();

  // Lock state per session - re-lock when leaving the tab
  const [dashboardUnlocked, setDashboardUnlocked] = useState(false);
  const [inventoryUnlocked, setInventoryUnlocked] = useState(false);
  const [dashboardHasLock, setDashboardHasLock] = useState(false);
  const [inventoryHasLock, setInventoryHasLock] = useState(false);

  useEffect(() => {
    if (!auth.shopId) return;
    const checkLocks = async () => {
      const [dRes, iRes] = await Promise.all([
        supabase.rpc('has_lock', { p_shop_id: auth.shopId!, p_lock_type: 'dashboard' }),
        supabase.rpc('has_lock', { p_shop_id: auth.shopId!, p_lock_type: 'inventory' }),
      ]);
      setDashboardHasLock(!!dRes.data);
      setInventoryHasLock(!!iRes.data);
    };
    checkLocks();
  }, [auth.shopId]);

  // Re-lock sections when navigating away from them
  useEffect(() => {
    if (activeTab !== 'dashboard' && dashboardHasLock) {
      setDashboardUnlocked(false);
    }
    if (activeTab !== 'inventory' && inventoryHasLock) {
      setInventoryUnlocked(false);
    }
  }, [activeTab, dashboardHasLock, inventoryHasLock]);

  const renderContent = () => {
    if (activeTab === 'dashboard' && dashboardHasLock && !dashboardUnlocked) {
      return <LockScreen shopId={auth.shopId!} lockType="dashboard" title="لوحة التحكم مقفلة" onUnlock={() => setDashboardUnlocked(true)} />;
    }
    if (activeTab === 'inventory' && inventoryHasLock && !inventoryUnlocked) {
      return <LockScreen shopId={auth.shopId!} lockType="inventory" title="المخزون مقفل" onUnlock={() => setInventoryUnlocked(true)} />;
    }

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
