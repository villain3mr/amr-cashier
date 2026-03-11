import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';

const ShopSettingsPage: React.FC = () => {
  const { auth, products, customers, invoices } = useApp();
  const shopProducts = useMemo(() => products.filter(p => p.shopId === auth.shopId), [products, auth.shopId]);
  const shopCustomers = useMemo(() => customers.filter(c => c.shopId === auth.shopId), [customers, auth.shopId]);
  const shopInvoices = useMemo(() => invoices.filter(i => i.shopId === auth.shopId), [invoices, auth.shopId]);

  const totalSales = shopInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalDebt = shopCustomers.reduce((sum, c) => sum + c.balance, 0);
  const lowStockProducts = shopProducts.filter(p => p.quantity <= p.minStock);

  return (
    <div className="h-full overflow-auto p-6">
      <h1 className="font-heading text-xl font-bold text-foreground mb-6">إعدادات المحل</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm font-body mb-1">إجمالي المبيعات</p>
          <p className="text-2xl font-body font-medium text-primary">{totalSales.toLocaleString()} ج.م</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm font-body mb-1">إجمالي الديون</p>
          <p className="text-2xl font-body font-medium text-destructive">{totalDebt.toLocaleString()} ج.م</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm font-body mb-1">منتجات تحت الحد</p>
          <p className="text-2xl font-body font-medium text-foreground">{lowStockProducts.length}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <h2 className="font-heading text-base font-semibold text-foreground mb-2">معلومات الحساب</h2>
        <p className="text-sm text-muted-foreground font-body">اسم المحل: {auth.shopName}</p>
        <p className="text-sm text-muted-foreground font-body mt-1">عدد المنتجات: {shopProducts.length}</p>
        <p className="text-sm text-muted-foreground font-body mt-1">عدد العملاء: {shopCustomers.length}</p>
        <p className="text-sm text-muted-foreground font-body mt-1">عدد الفواتير: {shopInvoices.length}</p>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="font-heading text-base font-semibold text-foreground mb-2">تنبيهات المخزون</h2>
          <div className="space-y-2">
            {lowStockProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm font-body text-foreground">{p.name}</span>
                <span className="text-sm font-body text-destructive">{p.quantity} متبقي</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopSettingsPage;
