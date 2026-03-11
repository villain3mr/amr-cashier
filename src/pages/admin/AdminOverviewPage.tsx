import React from 'react';
import { useApp } from '@/context/AppContext';
import { Store, Package, Users, FileText } from 'lucide-react';

const AdminOverviewPage: React.FC = () => {
  const { shops, products, customers, invoices } = useApp();

  const stats = [
    { label: 'المحلات', value: shops.length, icon: Store, color: 'text-primary' },
    { label: 'المنتجات', value: products.length, icon: Package, color: 'text-primary' },
    { label: 'العملاء', value: customers.length, icon: Users, color: 'text-primary' },
    { label: 'الفواتير', value: invoices.length, icon: FileText, color: 'text-primary' },
  ];

  return (
    <div className="h-full overflow-auto p-6">
      <h1 className="font-heading text-xl font-bold text-foreground mb-6">لوحة تحكم الأدمن</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm font-body">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} strokeWidth={1.5} />
            </div>
            <p className="text-2xl font-body font-medium text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="font-heading text-base font-semibold text-foreground mb-3">آخر المحلات المضافة</h2>
        {shops.length === 0 ? (
          <p className="text-muted-foreground text-sm font-body">لا توجد محلات بعد. اذهب لقسم المحلات لإضافة محل جديد.</p>
        ) : (
          <div className="space-y-2">
            {shops.slice(-5).reverse().map(shop => (
              <div key={shop.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-body text-foreground">{shop.name}</p>
                  <p className="text-xs text-muted-foreground font-body">{shop.username}</p>
                </div>
                <span className={`text-xs font-body px-2 py-1 rounded-full ${shop.active ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                  {shop.active ? 'نشط' : 'معطل'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverviewPage;
