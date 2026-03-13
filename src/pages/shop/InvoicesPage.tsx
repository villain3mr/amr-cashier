import React, { useMemo, useState } from 'react';
import { useApp, Invoice } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Printer, Trash2, Edit2, X, Check, Calendar } from 'lucide-react';

const InvoicesPage: React.FC = () => {
  const { auth, invoices, updateInvoice, deleteInvoice, settings } = useApp();
  const shopInvoices = useMemo(
    () => invoices.filter(i => i.shopId === auth.shopId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [invoices, auth.shopId]
  );

  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'purchase'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = useMemo(() => {
    let result = shopInvoices;
    
    if (typeFilter !== 'all') {
      result = result.filter(i => i.type === typeFilter);
    }
    
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter(i => new Date(i.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter(i => new Date(i.date) <= to);
    }
    
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(i =>
        i.id.includes(s) || i.customerName?.toLowerCase().includes(s) || 
        i.items.some(item => item.productName.toLowerCase().includes(s))
      );
    }
    
    return result;
  }, [shopInvoices, search, dateFrom, dateTo, typeFilter]);

  const periodTotal = useMemo(() => filteredInvoices.reduce((sum, i) => sum + i.total, 0), [filteredInvoices]);

  const selected = shopInvoices.find(i => i.id === selectedInvoice);

  const handlePrint = () => { window.print(); };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟ سيتم استعادة الكميات والأرصدة.')) {
      deleteInvoice(id);
      if (selectedInvoice === id) setSelectedInvoice(null);
    }
  };

  const startEdit = (invoice: Invoice) => { setEditingInvoice({ ...invoice }); };

  const saveEdit = () => {
    if (editingInvoice) {
      updateInvoice(editingInvoice);
      setEditingInvoice(null);
    }
  };

  const cur = settings.currency;

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو المنتج..." className="pr-10 bg-card border-border h-10 font-body" />
          </div>
          
          {/* Filters row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type filter */}
            <div className="flex border border-border rounded-md overflow-hidden">
              {([['all', 'الكل'], ['sale', 'بيع'], ['purchase', 'شراء']] as const).map(([val, label]) => (
                <button key={val} onClick={() => setTypeFilter(val as any)}
                  className={`px-3 py-1.5 text-xs font-body transition-colors ${typeFilter === val ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}>
                  {label}
                </button>
              ))}
            </div>
            
            {/* Date filters */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-card border-border h-8 font-body text-xs w-32" />
              <span className="text-xs text-muted-foreground">إلى</span>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-card border-border h-8 font-body text-xs w-32" />
            </div>
            
            {(dateFrom || dateTo || typeFilter !== 'all') && (
              <button onClick={() => { setDateFrom(''); setDateTo(''); setTypeFilter('all'); }} className="text-xs text-destructive hover:underline font-body">مسح الفلاتر</button>
            )}
          </div>
          
          {/* Period summary */}
          <div className="flex items-center justify-between text-xs font-body text-muted-foreground">
            <span>{filteredInvoices.length} فاتورة</span>
            <span>الإجمالي: <span className="text-primary font-medium">{periodTotal.toLocaleString()} {cur}</span></span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredInvoices.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm font-body py-16">لا توجد فواتير.</p>
          ) : (
            <div className="space-y-2 p-4">
              {filteredInvoices.map(invoice => (
                <div
                  key={invoice.id}
                  onClick={() => { setSelectedInvoice(invoice.id); setEditingInvoice(null); }}
                  className={`bg-card border rounded-lg p-4 cursor-pointer transition-colors ${selectedInvoice === invoice.id ? 'border-primary' : 'border-border hover:border-muted-foreground'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-body text-sm font-medium text-foreground">فاتورة #{invoice.id.slice(-6)}</h3>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-body ${invoice.type === 'sale' ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'}`}>
                          {invoice.type === 'sale' ? 'بيع' : 'شراء'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-body">
                        {new Date(invoice.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} - {invoice.customerName || 'بدون عميل'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-left">
                        <p className="text-primary font-body font-medium">{invoice.total.toLocaleString()} {cur}</p>
                        <p className="text-xs text-muted-foreground font-body">{invoice.items.length} منتج</p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); handleDelete(invoice.id); }} className="p-1.5 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invoice detail */}
      {selected && (
        <div className="w-80 lg:w-96 border-r border-border bg-card h-full overflow-auto p-6 animate-slide-in print:w-full print:border-0">
          <div className="flex items-center justify-between mb-4 print:hidden">
            <h2 className="font-heading font-semibold text-foreground">تفاصيل الفاتورة</h2>
            <div className="flex items-center gap-1">
              {editingInvoice ? (
                <>
                  <button onClick={saveEdit} className="p-2 text-primary hover:text-primary/80"><Check className="w-5 h-5" strokeWidth={1.5} /></button>
                  <button onClick={() => setEditingInvoice(null)} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" strokeWidth={1.5} /></button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(selected)} className="p-2 text-muted-foreground hover:text-foreground"><Edit2 className="w-4 h-4" strokeWidth={1.5} /></button>
                  <button onClick={handlePrint} className="p-2 text-primary hover:text-primary/80"><Printer className="w-5 h-5" strokeWidth={1.5} /></button>
                </>
              )}
            </div>
          </div>

          <div className="hidden print:block text-center mb-4">
            <h1 className="font-heading text-lg font-bold">{settings.appName}</h1>
            <p className="text-sm">فاتورة {selected.type === 'sale' ? 'مبيعات' : 'مشتريات'}</p>
          </div>

          {editingInvoice ? (
            <div className="space-y-3 text-sm font-body">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">الخصم</label>
                <Input type="number" value={editingInvoice.discount || ''} onChange={e => {
                  const discount = Number(e.target.value) || 0;
                  const total = editingInvoice.subtotal - discount;
                  const remaining = total - editingInvoice.paid;
                  setEditingInvoice({ ...editingInvoice, discount, total, remaining: Math.max(0, remaining) });
                }} className="bg-background border-border h-9 font-body text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">المدفوع</label>
                <Input type="number" value={editingInvoice.paid || ''} onChange={e => {
                  const paid = Number(e.target.value) || 0;
                  const remaining = editingInvoice.total - paid;
                  setEditingInvoice({ ...editingInvoice, paid, remaining: Math.max(0, remaining) });
                }} className="bg-background border-border h-9 font-body text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">ملاحظات</label>
                <Input value={editingInvoice.notes} onChange={e => setEditingInvoice({ ...editingInvoice, notes: e.target.value })} className="bg-background border-border h-9 font-body text-sm" />
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3 text-sm font-body">
                <div className="flex justify-between"><span className="text-muted-foreground">رقم الفاتورة</span><span className="text-foreground">#{selected.id.slice(-6)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">النوع</span><span className="text-foreground">{selected.type === 'sale' ? 'بيع' : 'شراء من عميل'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">التاريخ</span><span className="text-foreground">{new Date(selected.date).toLocaleString('ar-EG')}</span></div>
                {selected.customerName && <div className="flex justify-between"><span className="text-muted-foreground">العميل</span><span className="text-foreground">{selected.customerName}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">طريقة الدفع</span><span className="text-foreground">{selected.paymentMethod}</span></div>
              </div>

              <div className="mt-4 border-t border-border pt-3">
                <table className="w-full text-xs font-body">
                  <thead><tr className="text-muted-foreground"><th className="text-right py-1 font-medium">المنتج</th><th className="text-center py-1 font-medium">الكمية</th><th className="text-center py-1 font-medium">السعر</th><th className="text-left py-1 font-medium">الإجمالي</th></tr></thead>
                  <tbody>
                    {selected.items.map(item => (
                      <tr key={item.id} className="border-t border-border">
                        <td className="py-1.5 text-foreground">{item.productName}</td>
                        <td className="py-1.5 text-center text-foreground">{item.quantity}</td>
                        <td className="py-1.5 text-center text-foreground">{item.unitPrice.toLocaleString()}</td>
                        <td className="py-1.5 text-left text-foreground">{item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 border-t border-border pt-3 space-y-2 text-sm font-body">
                <div className="flex justify-between"><span className="text-muted-foreground">المجموع</span><span className="text-foreground">{selected.subtotal.toLocaleString()} {cur}</span></div>
                {selected.discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">الخصم</span><span className="text-destructive">-{selected.discount.toLocaleString()} {cur}</span></div>}
                <div className="flex justify-between font-heading font-semibold text-base"><span className="text-foreground">الإجمالي</span><span className="text-primary">{selected.total.toLocaleString()} {cur}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">المدفوع</span><span className="text-foreground">{selected.paid.toLocaleString()} {cur}</span></div>
                {selected.remaining > 0 && <div className="flex justify-between"><span className="text-destructive">المتبقي</span><span className="text-destructive">{selected.remaining.toLocaleString()} {cur}</span></div>}
              </div>

              {selected.notes && (
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground font-body">ملاحظات: {selected.notes}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
