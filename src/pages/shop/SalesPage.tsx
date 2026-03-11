import React, { useState, useMemo } from 'react';
import { useApp, InvoiceItem } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Trash2, Printer, Search } from 'lucide-react';

const SalesPage: React.FC = () => {
  const { auth, products, customers, addInvoice } = useApp();
  const shopProducts = useMemo(() => products.filter(p => p.shopId === auth.shopId), [products, auth.shopId]);
  const shopCustomers = useMemo(() => customers.filter(c => c.shopId === auth.shopId), [customers, auth.shopId]);

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'visa' | 'mixed'>('cash');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState('');
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (!search) return shopProducts;
    const s = search.toLowerCase();
    return shopProducts.filter(p =>
      p.name.toLowerCase().includes(s) || p.barcode.includes(s)
    );
  }, [shopProducts, search]);

  const addItem = (productId: string) => {
    const product = shopProducts.find(p => p.id === productId);
    if (!product || product.quantity <= 0) return;

    const existing = items.find(i => i.productId === productId);
    if (existing) {
      if (existing.quantity >= product.quantity) return;
      setItems(items.map(i => i.productId === productId
        ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
        : i
      ));
    } else {
      const newItem: InvoiceItem = {
        id: Date.now().toString(36),
        productId,
        productName: product.name,
        quantity: 1,
        unitPrice: product.sellPrice,
        total: product.sellPrice,
      };
      setItems([...items, newItem]);
      setAnimatingId(newItem.id);
      setTimeout(() => setAnimatingId(null), 300);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems(items.map(i => {
      if (i.id !== itemId) return i;
      const product = shopProducts.find(p => p.id === i.productId);
      const newQty = Math.max(1, Math.min(i.quantity + delta, product?.quantity || 1));
      return { ...i, quantity: newQty, total: newQty * i.unitPrice };
    }));
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const total = subtotal - discount;
  const remaining = total - paid;

  const handleSave = () => {
    if (items.length === 0) return;
    const customer = shopCustomers.find(c => c.id === selectedCustomerId);
    addInvoice({
      shopId: auth.shopId!,
      customerId: selectedCustomerId || undefined,
      customerName: customer?.name,
      items,
      subtotal,
      discount,
      total,
      paid,
      remaining: Math.max(0, remaining),
      paymentMethod,
      notes,
    });
    // Reset
    setItems([]);
    setDiscount(0);
    setPaid(0);
    setSelectedCustomerId('');
    setNotes('');
  };

  const handlePrint = () => {
    handleSave();
    setTimeout(() => window.print(), 300);
  };

  return (
    <div className="h-full flex">
      {/* Middle: Product selection */}
      <div className="flex-1 flex flex-col overflow-hidden border-l border-border">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو الباركود..."
              className="pr-10 bg-card border-border h-10 font-body"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {filteredProducts.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm font-body py-8">لا توجد منتجات. أضف منتجات من قسم المخزون.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addItem(product.id)}
                  disabled={product.quantity <= 0}
                  className="bg-card border border-border rounded-lg p-3 text-right hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <p className="font-body text-sm font-medium text-foreground truncate">{product.name}</p>
                  <p className="font-body text-lg font-medium text-primary mt-1">{product.sellPrice.toLocaleString()} ج.م</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">المتاح: {product.quantity}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Invoice items */}
        {items.length > 0 && (
          <div className="border-t border-border max-h-64 overflow-auto">
            <table className="w-full text-sm font-body">
              <thead className="bg-card text-muted-foreground sticky top-0">
                <tr>
                  <th className="text-right p-2 font-medium">المنتج</th>
                  <th className="text-center p-2 font-medium">الكمية</th>
                  <th className="text-center p-2 font-medium">السعر</th>
                  <th className="text-center p-2 font-medium">الإجمالي</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className={`border-t border-border ${animatingId === item.id ? 'animate-slide-in' : ''}`}>
                    <td className="p-2 text-foreground">{item.productName}</td>
                    <td className="p-2">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-muted-foreground hover:text-foreground">
                          <Minus className="w-3 h-3" strokeWidth={1.5} />
                        </button>
                        <span className="text-foreground w-8 text-center font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-muted-foreground hover:text-foreground">
                          <Plus className="w-3 h-3" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                    <td className="p-2 text-center text-foreground">{item.unitPrice.toLocaleString()}</td>
                    <td className="p-2 text-center text-primary font-medium">{item.total.toLocaleString()}</td>
                    <td className="p-2">
                      <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right panel: Invoice summary */}
      <div className="w-72 lg:w-80 bg-card border-r border-border h-full flex flex-col overflow-auto p-4">
        <h2 className="font-heading font-semibold text-foreground mb-4">ملخص الفاتورة</h2>

        {/* Customer selection */}
        <div className="mb-3">
          <label className="text-xs text-muted-foreground font-body mb-1 block">العميل (اختياري)</label>
          <select
            value={selectedCustomerId}
            onChange={e => setSelectedCustomerId(e.target.value)}
            className="w-full h-10 bg-background border border-border rounded-md px-3 text-sm font-body text-foreground"
          >
            <option value="">بدون عميل</option>
            {shopCustomers.map(c => (
              <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
            ))}
          </select>
        </div>

        {/* Payment method - segmented control */}
        <div className="mb-3">
          <label className="text-xs text-muted-foreground font-body mb-1 block">طريقة الدفع</label>
          <div className="flex border border-border rounded-md overflow-hidden">
            {(['cash', 'visa'] as const).map(method => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 py-2 text-xs font-body transition-colors ${
                  paymentMethod === method ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                {method === 'cash' ? 'كاش' : method === 'visa' ? 'انستاباي' : 'مختلط'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm font-body">
            <span className="text-muted-foreground">المجموع</span>
            <span className="text-foreground font-medium">{subtotal.toLocaleString()} ج.م</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-body shrink-0">الخصم</span>
            <Input
              type="number"
              min={0}
              value={discount || ''}
              onChange={e => setDiscount(Number(e.target.value) || 0)}
              className="h-8 bg-background border-border font-body text-sm"
            />
          </div>
          <div className="flex justify-between text-sm font-body border-t border-border pt-2">
            <span className="text-foreground font-heading font-semibold">الإجمالي</span>
            <span className="text-primary font-heading font-bold text-lg animate-flip-number" key={total}>
              {total.toLocaleString()} ج.م
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-body shrink-0">المدفوع</span>
            <Input
              type="number"
              min={0}
              value={paid || ''}
              onChange={e => setPaid(Number(e.target.value) || 0)}
              className="h-8 bg-background border-border font-body text-sm"
            />
          </div>
          {remaining > 0 && (
            <div className="flex justify-between text-sm font-body">
              <span className="text-destructive">المتبقي</span>
              <span className="text-destructive font-medium">{remaining.toLocaleString()} ج.م</span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="text-xs text-muted-foreground font-body mb-1 block">ملاحظات</label>
          <Input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="bg-background border-border h-10 font-body text-sm"
            placeholder="ملاحظات اختيارية..."
          />
        </div>

        <div className="mt-auto space-y-2">
          <Button onClick={handleSave} className="w-full h-10 font-heading font-semibold" disabled={items.length === 0}>
            حفظ الفاتورة
          </Button>
          <Button onClick={handlePrint} variant="outline" className="w-full h-10 font-heading font-semibold" disabled={items.length === 0}>
            <Printer className="w-4 h-4 ml-1" strokeWidth={1.5} />
            طباعة
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
