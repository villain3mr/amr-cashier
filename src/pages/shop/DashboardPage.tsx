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
  const lowStockProducts = shopProducts.filter(p => p.quantity <= p.minStock);

  // Net profit = sum of (sellPrice - buyPrice) * quantity for each sold item
  const netProfit = useMemo(() => {
    let profit = 0;
    salesInvoices.forEach(inv => {
      inv.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const buyPrice = product?.buyPrice || 0;
        profit += (item.unitPrice - buyPrice) * item.quantity;
      });
      profit -= inv.discount || 0;
    });
    return profit;
  }, [salesInvoices, products]);

  // Today's stats
  const today = new Date().toDateString();
  const todaySales = salesInvoices.filter(i => new Date(i.date).toDateString() === today);
  const todayTotal = todaySales.reduce((sum, i) => sum + i.total, 0);
  const todayCount = todaySales.length;

  const todayProfit = useMemo(() => {
    let profit = 0;
    todaySales.forEach(inv => {
      inv.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const buyPrice = product?.buyPrice || 0;
        profit += (item.unitPrice - buyPrice) * item.quantity;
      });
      profit -= inv.discount || 0;
    });
    return profit;
  }, [todaySales, products]);

  const cur = settings.currency;

  return (
    <div className="h-full overflow-auto p-6">
      <h1 className="font-heading text-xl font-bold text-foreground mb-6">لوحة التحكم</h1>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard icon={TrendingUp} label="إجمالي المبيعات" value={`${totalSales.toLocaleString()} ${cur}`} color="text-primary" />
        <StatCard icon={TrendingDown} label="إجمالي المشتريات" value={`${totalPurchases.toLocaleString()} ${cur}`} color="text-accent-foreground" />
        <StatCard icon={DollarSign} label={netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة'} value={`${Math.abs(netProfit).toLocaleString()} ${cur}`} color={netProfit >= 0 ? 'text-primary' : 'text-destructive'} />
        <StatCard icon={ShoppingCart} label="مبيعات اليوم" value={`${todayTotal.toLocaleString()} ${cur}`} subtitle={`${todayCount} فاتورة • ربح ${todayProfit.toLocaleString()} ${cur}`} color="text-primary" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard icon={Package} label="المنتجات" value={shopProducts.length.toString()} color="text-primary" />
        <StatCard icon={Users} label="العملاء" value={shopCustomers.length.toString()} color="text-primary" />
        <StatCard icon={FileText} label="الديون المستحقة" value={`${totalDebt.toLocaleString()} ${cur}`} color="text-destructive" />
        <StatCard icon={AlertTriangle} label="منتجات تحت الحد" value={lowStockProducts.length.toString()} color={lowStockProducts.length > 0 ? 'text-destructive' : 'text-primary'} />
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
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
