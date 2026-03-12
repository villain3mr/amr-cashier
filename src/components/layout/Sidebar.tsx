import React from 'react';
import {
  ShoppingCart, Package, Users, FileText, Settings, LogOut,
  LayoutDashboard, Store, Smartphone, Cog
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  role: 'admin' | 'shop';
  shopName: string;
}

const shopNavItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { id: 'sales', icon: ShoppingCart, label: 'المبيعات' },
  { id: 'inventory', icon: Package, label: 'المخزون' },
  { id: 'customers', icon: Users, label: 'العملاء' },
  { id: 'invoices', icon: FileText, label: 'الفواتير' },
  { id: 'settings', icon: Settings, label: 'الإعدادات' },
];

const adminNavItems = [
  { id: 'overview', icon: LayoutDashboard, label: 'نظرة عامة' },
  { id: 'shops', icon: Store, label: 'المحلات' },
  { id: 'settings', icon: Cog, label: 'إعدادات البرنامج' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, role, shopName }) => {
  const { logout } = useApp();
  const navItems = role === 'admin' ? adminNavItems : shopNavItems;

  return (
    <aside className="w-16 lg:w-56 h-screen bg-card border-l border-border flex flex-col shrink-0">
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-4 border-b border-border">
        <Smartphone className="w-6 h-6 text-primary shrink-0" strokeWidth={1.5} />
        <span className="hidden lg:block mr-2 font-heading font-bold text-foreground text-sm truncate">
          {shopName || 'Amr Cashier'}
        </span>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-body',
                isActive
                  ? 'bg-accent text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon
                className="w-5 h-5 shrink-0"
                strokeWidth={1.5}
                fill={isActive ? 'currentColor' : 'none'}
              />
              <span className="hidden lg:block">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-destructive hover:bg-accent transition-colors text-sm font-body"
        >
          <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.5} />
          <span className="hidden lg:block">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
