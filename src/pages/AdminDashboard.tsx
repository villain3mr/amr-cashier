import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AdminShopsPage from '@/pages/admin/AdminShopsPage';
import AdminOverviewPage from '@/pages/admin/AdminOverviewPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';

export type AdminTab = 'overview' | 'shops' | 'settings';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverviewPage />;
      case 'shops': return <AdminShopsPage />;
      case 'settings': return <AdminSettingsPage />;
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
