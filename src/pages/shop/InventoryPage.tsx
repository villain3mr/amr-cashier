import React, { useState, useMemo } from 'react';
import { useApp, Product } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, X, Check, Search, AlertTriangle, Smartphone } from 'lucide-react';

// Categories now come from settings

const InventoryPage: React.FC = () => {
  const { auth, products, addProduct, updateProduct, deleteProduct, settings } = useApp();
  const shopProducts = useMemo(() => products.filter(p => p.shopId === auth.shopId), [products, auth.shopId]);
  const CATEGORIES = settings.categories;

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [form, setForm] = useState({
    name: '', barcode: '', category: 'هاتف', buyPrice: 0, sellPrice: 0, quantity: 0, minStock: 5, description: '', imei: ''
  });

  const filteredProducts = useMemo(() => {
    let result = shopProducts;
    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(s) || p.barcode.includes(s) || p.category.includes(s) || (p.imei && p.imei.toLowerCase().includes(s)));
    }
    return result;
  }, [shopProducts, search, categoryFilter]);

  const resetForm = () => {
    setForm({ name: '', barcode: '', category: 'هاتف', buyPrice: 0, sellPrice: 0, quantity: 0, minStock: 5, description: '', imei: '' });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...form });
    } else {
      addProduct({ ...form, shopId: auth.shopId! });
    }
    resetForm();
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name, barcode: product.barcode, category: product.category,
      buyPrice: product.buyPrice, sellPrice: product.sellPrice, quantity: product.quantity,
      minStock: product.minStock, description: product.description, imei: product.imei || ''
    });
    setShowForm(true);
  };

  const isPhoneCategory = form.category === 'هاتف';

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم، الباركود أو IMEI..." className="pr-10 bg-card border-border h-10 font-body" />
            </div>
            <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm">
              <Plus className="w-4 h-4 ml-1" strokeWidth={1.5} />
              إضافة منتج
            </Button>
          </div>
          
          {/* Category filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => setCategoryFilter('')}
              className={`px-3 py-1 rounded-md text-xs font-body transition-colors ${!categoryFilter ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground border border-border hover:text-foreground'}`}>
              الكل
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-md text-xs font-body transition-colors ${categoryFilter === cat ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground border border-border hover:text-foreground'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredProducts.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm font-body py-16">لا توجد منتجات.</p>
          ) : (
            <table className="w-full text-sm font-body">
              <thead className="bg-card text-muted-foreground sticky top-0">
                <tr>
                  <th className="text-right p-3 font-medium">المنتج</th>
                  <th className="text-center p-3 font-medium">الفئة</th>
                  <th className="text-center p-3 font-medium">سعر الشراء</th>
                  <th className="text-center p-3 font-medium">سعر البيع</th>
                  <th className="text-center p-3 font-medium">الكمية</th>
                  <th className="p-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className="border-t border-border hover:bg-accent/50 transition-colors">
                    <td className="p-3">
                      <p className="text-foreground font-medium">{product.name}</p>
                      <div className="flex items-center gap-2">
                        {product.barcode && <p className="text-xs text-muted-foreground">{product.barcode}</p>}
                        {product.imei && (
                          <p className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Smartphone className="w-3 h-3" strokeWidth={1.5} />
                            {product.imei}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center text-muted-foreground">{product.category}</td>
                    <td className="p-3 text-center text-foreground">{product.buyPrice.toLocaleString()}</td>
                    <td className="p-3 text-center text-primary font-medium">{product.sellPrice.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <span className={`font-medium ${product.quantity <= product.minStock ? 'text-destructive' : 'text-foreground'}`}>
                        {product.quantity <= product.minStock && <AlertTriangle className="w-3 h-3 inline ml-1" strokeWidth={1.5} />}
                        {product.quantity}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(product)} className="p-1.5 text-muted-foreground hover:text-foreground"><Edit2 className="w-4 h-4" strokeWidth={1.5} /></button>
                        <button onClick={() => { if (confirm('حذف المنتج؟')) deleteProduct(product.id); }} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" strokeWidth={1.5} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <div className="w-80 border-r border-border bg-card h-full overflow-auto p-6 animate-slide-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-foreground">{editingProduct ? 'تعديل منتج' : 'إضافة منتج'}</h2>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" strokeWidth={1.5} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 block">اسم المنتج *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-background border-border h-10 font-body" required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 block">الباركود</label>
              <Input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} className="bg-background border-border h-10 font-body" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 block">الفئة</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button" onClick={() => setForm(f => ({ ...f, category: cat }))}
                    className={`px-3 py-1.5 rounded-md text-xs font-body transition-colors ${form.category === cat ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground border border-border hover:text-foreground'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            {/* IMEI field - shown for phones */}
            {isPhoneCategory && (
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block flex items-center gap-1">
                  <Smartphone className="w-3 h-3" strokeWidth={1.5} />
                  IMEI
                </label>
                <Input value={form.imei} onChange={e => setForm(f => ({ ...f, imei: e.target.value }))} className="bg-background border-border h-10 font-body" placeholder="رقم IMEI للهاتف" />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">سعر الشراء</label>
                <Input type="number" min={0} value={form.buyPrice || ''} onChange={e => setForm(f => ({ ...f, buyPrice: Number(e.target.value) }))} className="bg-background border-border h-10 font-body" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">سعر البيع *</label>
                <Input type="number" min={0} value={form.sellPrice || ''} onChange={e => setForm(f => ({ ...f, sellPrice: Number(e.target.value) }))} className="bg-background border-border h-10 font-body" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">الكمية</label>
                <Input type="number" min={0} value={form.quantity || ''} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} className="bg-background border-border h-10 font-body" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">حد التنبيه</label>
                <Input type="number" min={0} value={form.minStock || ''} onChange={e => setForm(f => ({ ...f, minStock: Number(e.target.value) }))} className="bg-background border-border h-10 font-body" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 block">وصف</label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-background border-border h-10 font-body" />
            </div>
            <Button type="submit" className="w-full h-10 font-heading font-semibold mt-4">
              <Check className="w-4 h-4 ml-1" strokeWidth={1.5} />
              {editingProduct ? 'حفظ' : 'إضافة'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
