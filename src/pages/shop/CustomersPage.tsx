import React, { useState, useMemo } from 'react';
import { useApp, Customer } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, X, Check, Search, DollarSign } from 'lucide-react';

const CustomersPage: React.FC = () => {
  const { auth, customers, addCustomer, updateCustomer, deleteCustomer, transactions, addTransaction, invoices } = useApp();
  const shopCustomers = useMemo(() => customers.filter(c => c.shopId === auth.shopId), [customers, auth.shopId]);

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNote, setPaymentNote] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', address: '', balance: 0, notes: '' });

  const filteredCustomers = useMemo(() => {
    if (!search) return shopCustomers;
    const s = search.toLowerCase();
    return shopCustomers.filter(c => c.name.toLowerCase().includes(s) || c.phone.includes(s));
  }, [shopCustomers, search]);

  const resetForm = () => {
    setForm({ name: '', phone: '', address: '', balance: 0, notes: '' });
    setEditingCustomer(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingCustomer) {
      updateCustomer({ ...editingCustomer, ...form });
    } else {
      addCustomer({ ...form, shopId: auth.shopId! });
    }
    resetForm();
  };

  const startEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({ name: customer.name, phone: customer.phone, address: customer.address, balance: customer.balance, notes: customer.notes });
    setShowForm(true);
    setSelectedCustomer(null);
  };

  const handlePayment = () => {
    if (!selectedCustomer || paymentAmount <= 0) return;
    addTransaction({
      shopId: auth.shopId!,
      customerId: selectedCustomer.id,
      type: 'payment',
      amount: paymentAmount,
      notes: paymentNote,
    });
    setPaymentAmount(0);
    setPaymentNote('');
    // Refresh selected customer data
    const updated = customers.find(c => c.id === selectedCustomer.id);
    if (updated) setSelectedCustomer(updated);
  };

  const customerTransactions = useMemo(() => {
    if (!selectedCustomer) return [];
    return transactions.filter(t => t.customerId === selectedCustomer.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedCustomer, transactions]);

  const customerInvoices = useMemo(() => {
    if (!selectedCustomer) return [];
    return invoices.filter(i => i.customerId === selectedCustomer.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedCustomer, invoices]);

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن عميل..." className="pr-10 bg-card border-border h-10 font-body" />
          </div>
          <Button onClick={() => { resetForm(); setShowForm(true); setSelectedCustomer(null); }} size="sm">
            <Plus className="w-4 h-4 ml-1" strokeWidth={1.5} />
            إضافة عميل
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredCustomers.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm font-body py-16">لا يوجد عملاء.</p>
          ) : (
            <div className="space-y-2 p-4">
              {filteredCustomers.map(customer => (
                <div
                  key={customer.id}
                  onClick={() => { setSelectedCustomer(customer); setShowForm(false); }}
                  className={`bg-card border rounded-lg p-4 cursor-pointer transition-colors ${selectedCustomer?.id === customer.id ? 'border-primary' : 'border-border hover:border-muted-foreground'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading font-semibold text-foreground">{customer.name}</h3>
                      <p className="text-sm text-muted-foreground font-body">{customer.phone || 'بدون رقم'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-body font-medium ${customer.balance > 0 ? 'text-destructive' : 'text-primary'}`}>
                        {customer.balance.toLocaleString()} ج.م
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); startEdit(customer); }} className="p-1.5 text-muted-foreground hover:text-foreground">
                        <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); if (confirm('حذف العميل؟')) deleteCustomer(customer.id); }} className="p-1.5 text-muted-foreground hover:text-destructive">
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

      {/* Right panel */}
      {(showForm || selectedCustomer) && (
        <div className="w-80 border-r border-border bg-card h-full overflow-auto p-6 animate-slide-in">
          {showForm ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-foreground">{editingCustomer ? 'تعديل عميل' : 'إضافة عميل'}</h2>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" strokeWidth={1.5} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground font-body mb-1 block">الاسم *</label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-background border-border h-10 font-body" required />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-body mb-1 block">الهاتف</label>
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="bg-background border-border h-10 font-body" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-body mb-1 block">العنوان</label>
                  <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="bg-background border-border h-10 font-body" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-body mb-1 block">رصيد مبدئي</label>
                  <Input type="number" value={form.balance || ''} onChange={e => setForm(f => ({ ...f, balance: Number(e.target.value) }))} className="bg-background border-border h-10 font-body" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-body mb-1 block">ملاحظات</label>
                  <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-background border-border h-10 font-body" />
                </div>
                <Button type="submit" className="w-full h-10 font-heading font-semibold mt-4">
                  <Check className="w-4 h-4 ml-1" strokeWidth={1.5} />
                  {editingCustomer ? 'حفظ' : 'إضافة'}
                </Button>
              </form>
            </>
          ) : selectedCustomer && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-foreground">{selectedCustomer.name}</h2>
                <button onClick={() => setSelectedCustomer(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" strokeWidth={1.5} /></button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="bg-background rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground font-body">الرصيد المستحق</p>
                  <p className={`text-xl font-body font-medium ${selectedCustomer.balance > 0 ? 'text-destructive' : 'text-primary'}`}>
                    {selectedCustomer.balance.toLocaleString()} ج.م
                  </p>
                </div>
                {selectedCustomer.phone && <p className="text-sm text-muted-foreground font-body">📞 {selectedCustomer.phone}</p>}
                {selectedCustomer.address && <p className="text-sm text-muted-foreground font-body">📍 {selectedCustomer.address}</p>}
              </div>

              {/* Payment form */}
              {selectedCustomer.balance > 0 && (
                <div className="mb-6 p-3 bg-background rounded-lg border border-border">
                  <h3 className="font-heading text-sm font-semibold text-foreground mb-2">تسجيل دفعة</h3>
                  <div className="space-y-2">
                    <Input type="number" min={0} placeholder="المبلغ" value={paymentAmount || ''} onChange={e => setPaymentAmount(Number(e.target.value))} className="bg-card border-border h-9 font-body text-sm" />
                    <Input placeholder="ملاحظة" value={paymentNote} onChange={e => setPaymentNote(e.target.value)} className="bg-card border-border h-9 font-body text-sm" />
                    <Button onClick={handlePayment} size="sm" className="w-full font-heading" disabled={paymentAmount <= 0}>
                      <DollarSign className="w-3 h-3 ml-1" strokeWidth={1.5} />
                      تسجيل الدفعة
                    </Button>
                  </div>
                </div>
              )}

              {/* History */}
              <div>
                <h3 className="font-heading text-sm font-semibold text-foreground mb-2">السجل</h3>
                <div className="space-y-1 max-h-60 overflow-auto">
                  {[...customerInvoices.map(i => ({ type: 'invoice' as const, date: i.date, amount: i.total, label: `فاتورة #${i.id.slice(-4)}` })),
                    ...customerTransactions.map(t => ({ type: 'payment' as const, date: t.date, amount: t.amount, label: t.notes || 'دفعة' }))
                  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-xs font-body">
                      <div>
                        <p className="text-foreground">{item.label}</p>
                        <p className="text-muted-foreground">{new Date(item.date).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <span className={item.type === 'payment' ? 'text-primary' : 'text-destructive'}>
                        {item.type === 'payment' ? '-' : '+'}{item.amount.toLocaleString()} ج.م
                      </span>
                    </div>
                  ))}
                  {customerInvoices.length === 0 && customerTransactions.length === 0 && (
                    <p className="text-muted-foreground text-xs">لا توجد معاملات.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
