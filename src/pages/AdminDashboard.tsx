import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Sidebar from '@/components/layout/Sidebar';
import AdminShopsPage from '@/pages/admin/AdminShopsPage';
import AdminOverviewPage from '@/pages/admin/AdminOverviewPage';

export type AdminTab = 'overview' | 'shops';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverviewPage />;
      case 'shops': return <AdminShopsPage />;
      default: return <AdminOverviewPage />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} role="admin" shopName="Admin" />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
