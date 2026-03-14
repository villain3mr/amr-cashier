import React, { useMemo, useState } from 'react';
import { useApp, Invoice } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Printer, Trash2, Edit2, X, Check, Calendar, Clock } from 'lucide-react';

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
  

  // Get available dates (unique dates that have invoices)
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    shopInvoices.forEach(i => {
      dates.add(new Date(i.date).toISOString().split('T')[0]);
    });
    return [...dates].sort();
  }, [shopInvoices]);

  const minDate = availableDates.length > 0 ? availableDates[0] : '';
  const maxDate = availableDates.length > 0 ? availableDates[availableDates.length - 1] : '';

  const filteredInvoices = useMemo(() => {
    let result = shopInvoices;
    if (typeFilter !== 'all') result = result.filter(i => i.type === typeFilter);
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
  const periodSales = useMemo(() => filteredInvoices.filter(i => i.type === 'sale').reduce((sum, i) => sum + i.total, 0), [filteredInvoices]);
  const periodPurchases = useMemo(() => filteredInvoices.filter(i => i.type === 'purchase').reduce((sum, i) => sum + i.total, 0), [filteredInvoices]);

  const selected = shopInvoices.find(i => i.id === selectedInvoice);

  // Quick date filters
  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setDateFrom(today);
    setDateTo(today);
  };
  const setThisWeek = () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    setDateFrom(start.toISOString().split('T')[0]);
    setDateTo(now.toISOString().split('T')[0]);
  };
  const setThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    setDateFrom(start.toISOString().split('T')[0]);
    setDateTo(now.toISOString().split('T')[0]);
  };

  const cur = settings.currency;

  const handlePrint = () => {
    if (!selected) return;
    const shopName = auth.shopName || settings.appName;
    const itemsHtml = selected.items.map(item => `
      <tr>
        <td>${item.productName}</td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-center">${item.unitPrice.toLocaleString()}</td>
        <td class="text-left">${item.total.toLocaleString()}</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة #${selected.id.slice(-6)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Cairo', 'IBM Plex Sans Arabic', Arial, sans-serif; padding: 24px; font-size: 13px; color: #111; direction: rtl; max-width: 400px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #333; padding-bottom: 12px; }
          .header h1 { font-size: 20px; font-weight: 700; }
          .header .sub { font-size: 13px; color: #555; margin-top: 2px; }
          .header .num { font-size: 11px; color: #888; margin-top: 4px; }
          .info { margin-bottom: 12px; }
          .info-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 12px; }
          .info-row .lbl { color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; }
          th { background: #f5f5f5; padding: 6px 8px; text-align: right; font-size: 11px; border-bottom: 2px solid #ddd; }
          td { padding: 5px 8px; border-bottom: 1px solid #eee; font-size: 12px; }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .totals { border-top: 2px solid #333; padding-top: 8px; margin-top: 4px; }
          .t-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 13px; }
          .t-row.grand { font-size: 16px; font-weight: 700; border-top: 1px solid #ccc; padding-top: 6px; margin-top: 4px; }
          .t-row.red { color: #c00; }
          .notes { margin-top: 12px; padding: 8px; background: #f9f9f9; border-radius: 4px; font-size: 11px; color: #555; }
          .footer { text-align: center; margin-top: 24px; font-size: 10px; color: #aaa; border-top: 1px dashed #ccc; padding-top: 8px; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${shopName}</h1>
          <div class="sub">فاتورة ${selected.type === 'sale' ? 'مبيعات' : 'مشتريات'}</div>
          <div class="num">#${selected.id.slice(-6)}</div>
        </div>
        <div class="info">
          <div class="info-row"><span class="lbl">التاريخ</span><span>${new Date(selected.date).toLocaleString('ar-EG')}</span></div>
          ${selected.customerName ? `<div class="info-row"><span class="lbl">${selected.type === 'sale' ? 'المباع إليه' : 'المشترى منه'}</span><span><strong>${selected.customerName}</strong></span></div>` : ''}
          <div class="info-row"><span class="lbl">طريقة الدفع</span><span>${selected.paymentMethod}</span></div>
        </div>
        <table>
          <thead><tr><th>المنتج</th><th class="text-center">الكمية</th><th class="text-center">السعر</th><th class="text-left">الإجمالي</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div class="totals">
          <div class="t-row"><span>المجموع</span><span>${selected.subtotal.toLocaleString()} ${cur}</span></div>
          ${selected.discount > 0 ? `<div class="t-row"><span>الخصم</span><span>-${selected.discount.toLocaleString()} ${cur}</span></div>` : ''}
          <div class="t-row grand"><span>الإجمالي</span><span>${selected.total.toLocaleString()} ${cur}</span></div>
          <div class="t-row"><span>المدفوع</span><span>${selected.paid.toLocaleString()} ${cur}</span></div>
          ${selected.remaining > 0 ? `<div class="t-row red"><span>المتبقي</span><span>${selected.remaining.toLocaleString()} ${cur}</span></div>` : ''}
        </div>
        ${selected.notes ? `<div class="notes">ملاحظات: ${selected.notes}</div>` : ''}
        <div class="footer">شكراً لتعاملكم معنا - ${shopName}</div>
      </body>
      </html>`;

    // Use hidden iframe to avoid popup blockers
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '400px';
    iframe.style.height = '600px';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
    
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 250);
    };
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟ سيتم استعادة الكميات والأرصدة.')) {
      deleteInvoice(id);
      if (selectedInvoice === id) setSelectedInvoice(null);
    }
  };

  const startEdit = (invoice: Invoice) => { setEditingInvoice({ ...invoice }); };
  const saveEdit = () => {
    if (editingInvoice) { updateInvoice(editingInvoice); setEditingInvoice(null); }
  };

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو المنتج..." className="pr-10 bg-card border-border h-10 font-body" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex border border-border rounded-md overflow-hidden">
              {([['all', 'الكل'], ['sale', 'بيع'], ['purchase', 'شراء']] as const).map(([val, label]) => (
                <button key={val} onClick={() => setTypeFilter(val as any)}
                  className={`px-3 py-1.5 text-xs font-body transition-colors ${typeFilter === val ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Quick date buttons */}
            <div className="flex border border-border rounded-md overflow-hidden">
              <button onClick={setToday} className="px-2.5 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">اليوم</button>
              <button onClick={setThisWeek} className="px-2.5 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border-r border-border">الأسبوع</button>
              <button onClick={setThisMonth} className="px-2.5 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border-r border-border">الشهر</button>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <Input type="date" value={dateFrom} min={minDate} max={maxDate} onChange={e => setDateFrom(e.target.value)} className="bg-card border-border h-8 font-body text-xs w-32" />
              <span className="text-xs text-muted-foreground">إلى</span>
              <Input type="date" value={dateTo} min={minDate} max={maxDate} onChange={e => setDateTo(e.target.value)} className="bg-card border-border h-8 font-body text-xs w-32" />
            </div>

            {(dateFrom || dateTo || typeFilter !== 'all') && (
              <button onClick={() => { setDateFrom(''); setDateTo(''); setTypeFilter('all'); }} className="text-xs text-destructive hover:underline font-body">مسح الفلاتر</button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs font-body text-muted-foreground">
            <span>{filteredInvoices.length} فاتورة</span>
            <div className="flex items-center gap-3">
              {typeFilter === 'all' && periodSales > 0 && periodPurchases > 0 && (
                <>
                  <span>بيع: <span className="text-primary">{periodSales.toLocaleString()}</span></span>
                  <span>شراء: <span className="text-accent-foreground">{periodPurchases.toLocaleString()}</span></span>
                </>
              )}
              <span>الإجمالي: <span className="text-primary font-medium">{periodTotal.toLocaleString()} {cur}</span></span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredInvoices.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm font-body py-16">لا توجد فواتير.</p>
          ) : (
            <div className="space-y-2 p-4">
              {filteredInvoices.map(invoice => (
                <div key={invoice.id} onClick={() => { setSelectedInvoice(invoice.id); setEditingInvoice(null); }}
                  className={`bg-card border rounded-lg p-4 cursor-pointer transition-colors ${selectedInvoice === invoice.id ? 'border-primary' : 'border-border hover:border-muted-foreground'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-body text-sm font-medium text-foreground">فاتورة #{invoice.id.slice(-6)}</h3>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-body ${invoice.type === 'sale' ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'}`}>
                          {invoice.type === 'sale' ? 'بيع' : 'شراء'}
                        </span>
                        {invoice.remaining > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-body">آجل</span>}
                      </div>
                      <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" strokeWidth={1.5} />
                        {new Date(invoice.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {invoice.customerName && <> - {invoice.customerName}</>}
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
        <div className="w-80 lg:w-96 border-r border-border bg-card h-full overflow-auto p-6 animate-slide-in">
          <div className="flex items-center justify-between mb-4">
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
            <div>

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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
