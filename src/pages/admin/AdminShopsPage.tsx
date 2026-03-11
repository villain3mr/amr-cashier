import React, { useState } from 'react';
import { useApp, Shop } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';

const AdminShopsPage: React.FC = () => {
  const { shops, addShop, updateShop, deleteShop } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [form, setForm] = useState({ name: '', username: '', password: '', phone: '', address: '', active: true });

  const resetForm = () => {
    setForm({ name: '', username: '', password: '', phone: '', address: '', active: true });
    setEditingShop(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) return;
    if (editingShop) {
      updateShop({ ...editingShop, ...form });
    } else {
      addShop(form);
    }
    resetForm();
  };

  const startEdit = (shop: Shop) => {
    setEditingShop(shop);
    setForm({ name: shop.name, username: shop.username, password: shop.password, phone: shop.phone, address: shop.address, active: shop.active });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المحل؟')) {
      deleteShop(id);
    }
  };

  return (
    <div className="h-full flex">
      {/* Main list */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-xl font-bold text-foreground">إدارة المحلات</h1>
          <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm">
            <Plus className="w-4 h-4 ml-1" strokeWidth={1.5} />
            إضافة محل
          </Button>
        </div>

        {shops.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground font-body">لا توجد محلات. أضف محل جديد للبدء.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {shops.map(shop => (
              <div key={shop.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-semibold text-foreground">{shop.name}</h3>
                  <p className="text-sm text-muted-foreground font-body">المستخدم: {shop.username} | الهاتف: {shop.phone || '-'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-body px-2 py-1 rounded-full ${shop.active ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                    {shop.active ? 'نشط' : 'معطل'}
                  </span>
                  <button onClick={() => startEdit(shop)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => handleDelete(shop.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side form panel */}
      {showForm && (
        <div className="w-80 border-r border-border bg-card h-full overflow-auto p-6 animate-slide-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-foreground">{editingShop ? 'تعديل محل' : 'إضافة محل'}</h2>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 block">اسم المحل *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-background border-border h-10 font-body" required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 block">اسم المستخدم *</label>
              <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className="bg-background border-border h-10 font-body" required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 block">كلمة المرور *</label>
              <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="bg-background border-border h-10 font-body" required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 block">الهاتف</label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="bg-background border-border h-10 font-body" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 block">العنوان</label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="bg-background border-border h-10 font-body" />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                className={`w-10 h-6 rounded-full transition-colors relative ${form.active ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-foreground transition-transform ${form.active ? 'right-1' : 'left-1'}`} />
              </button>
              <span className="text-sm text-muted-foreground font-body">{form.active ? 'نشط' : 'معطل'}</span>
            </div>
            <Button type="submit" className="w-full h-10 font-heading font-semibold mt-4">
              <Check className="w-4 h-4 ml-1" strokeWidth={1.5} />
              {editingShop ? 'حفظ التعديلات' : 'إضافة المحل'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminShopsPage;
