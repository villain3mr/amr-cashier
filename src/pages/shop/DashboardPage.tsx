import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { TrendingUp, TrendingDown, Users, Package, FileText, AlertTriangle, DollarSign, ShoppingCart } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { auth, products, customers, invoices, settings } = useApp();

  const shopProducts = useMemo(() => products.filter(p => p.shopId === auth.shopId), [products, auth.shopId]);
  const shopCustomers = useMemo(() => customers.filter(c => c.shopId === auth.shopId), [customers, auth.shopId]);
  const shopInvoices = useMemo(() => invoices.filter(i => i.shopId === auth.shopId), [invoices, auth.shopId]);

  const salesInvoices = useMemo(() => shopInvoices.filter(i => i.type === 'sale' || !i.type), [shopInvoices]);
  const purchaseInvoices = useMemo(() => shopInvoices.filter(i => i.type === 'purchase'), [shopInvoices]);

  const totalSales = salesInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalPurchases = purchaseInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalDebt = shopCustomers.reduce((sum, c) => sum + Math.max(0, c.balance), 0);
  const totalCredit = shopCustomers.reduce((sum, c) => sum + Math.max(0, -c.balance), 0);
  const lowStockProducts = shopProducts.filter(p => p.quantity <= p.minStock);
  const profit = totalSales - totalPurchases;

  // Today's stats
  const today = new Date().toDateString();
  const todaySales = salesInvoices.filter(i => new Date(i.date).toDateString() === today);
  const todayTotal = todaySales.reduce((sum, i) => sum + i.total, 0);
  const todayCount = todaySales.length;

  // Last 7 days chart data
  const last7Days = useMemo(() => {
    const days: { label: string; sales: number; purchases: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const daySales = salesInvoices.filter(inv => new Date(inv.date).toDateString() === dateStr).reduce((s, inv) => s + inv.total, 0);
      const dayPurchases = purchaseInvoices.filter(inv => new Date(inv.date).toDateString() === dateStr).reduce((s, inv) => s + inv.total, 0);
      days.push({
        label: d.toLocaleDateString('ar-EG', { weekday: 'short' }),
        sales: daySales,
        purchases: dayPurchases,
      });
    }
    return days;
  }, [salesInvoices, purchaseInvoices]);

  const maxDayValue = Math.max(...last7Days.map(d => Math.max(d.sales, d.purchases)), 1);

  // Top selling products
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    salesInvoices.forEach(inv => {
      inv.items.forEach(item => {
        const existing = map.get(item.productId) || { name: item.productName, qty: 0, revenue: 0 };
        existing.qty += item.quantity;
        existing.revenue += item.total;
        map.set(item.productId, existing);
      });
    });
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [salesInvoices]);

  const cur = settings.currency;

  return (
    <div className="h-full overflow-auto p-6">
      <h1 className="font-heading text-xl font-bold text-foreground mb-6">لوحة التحكم</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={TrendingUp} label="إجمالي المبيعات" value={`${totalSales.toLocaleString()} ${cur}`} color="text-primary" />
        <StatCard icon={TrendingDown} label="إجمالي المشتريات" value={`${totalPurchases.toLocaleString()} ${cur}`} color="text-accent-foreground" />
        <StatCard icon={DollarSign} label={profit >= 0 ? 'صافي الربح' : 'صافي الخسارة'} value={`${Math.abs(profit).toLocaleString()} ${cur}`} color={profit >= 0 ? 'text-primary' : 'text-destructive'} />
        <StatCard icon={ShoppingCart} label="مبيعات اليوم" value={`${todayTotal.toLocaleString()} ${cur}`} subtitle={`${todayCount} فاتورة`} color="text-primary" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Package} label="المنتجات" value={shopProducts.length.toString()} color="text-primary" />
        <StatCard icon={Users} label="العملاء" value={shopCustomers.length.toString()} color="text-primary" />
        <StatCard icon={FileText} label="الديون المستحقة" value={`${totalDebt.toLocaleString()} ${cur}`} color="text-destructive" />
        <StatCard icon={AlertTriangle} label="منتجات تحت الحد" value={lowStockProducts.length.toString()} color={lowStockProducts.length > 0 ? 'text-destructive' : 'text-primary'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mini bar chart */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="font-heading text-base font-semibold text-foreground mb-4">آخر 7 أيام</h2>
          <div className="flex items-end gap-2 h-32">
            {last7Days.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5 items-end" style={{ height: '100px' }}>
                  <div
                    className="flex-1 bg-primary/80 rounded-t-sm transition-all"
                    style={{ height: `${(day.sales / maxDayValue) * 100}%`, minHeight: day.sales > 0 ? '4px' : '0' }}
                  />
                  <div
                    className="flex-1 bg-muted-foreground/40 rounded-t-sm transition-all"
                    style={{ height: `${(day.purchases / maxDayValue) * 100}%`, minHeight: day.purchases > 0 ? '4px' : '0' }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-body">{day.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs font-body text-muted-foreground">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-primary/80" /> مبيعات</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-muted-foreground/40" /> مشتريات</div>
          </div>
        </div>

        {/* Top products */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="font-heading text-base font-semibold text-foreground mb-4">أكثر المنتجات مبيعاً</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body">لا توجد مبيعات بعد.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-body w-5">{idx + 1}.</span>
                    <span className="text-sm font-body text-foreground">{p.name}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-body text-primary font-medium">{p.revenue.toLocaleString()} {cur}</p>
                    <p className="text-xs text-muted-foreground font-body">{p.qty} قطعة</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 mt-6">
          <h2 className="font-heading text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" strokeWidth={1.5} />
            تنبيهات المخزون
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 px-3 bg-background rounded-md border border-border">
                <span className="text-sm font-body text-foreground">{p.name}</span>
                <span className="text-sm font-body text-destructive font-medium">{p.quantity} متبقي</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string; subtitle?: string; color: string }> = ({ icon: Icon, label, value, subtitle, color }) => (
  <div className="bg-card border border-border rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-muted-foreground text-xs font-body">{label}</span>
      <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.5} />
    </div>
    <p className={`text-xl font-body font-medium ${color}`}>{value}</p>
    {subtitle && <p className="text-xs text-muted-foreground font-body mt-0.5">{subtitle}</p>}
  </div>
);

export default DashboardPage;
