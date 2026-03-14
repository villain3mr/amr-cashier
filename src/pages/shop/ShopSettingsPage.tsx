import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, X, Check } from 'lucide-react';

const DEFAULT_CATEGORIES = ['هاتف', 'اكسسوارات', 'شاحن', 'سماعات', 'كفر', 'سكرينة', 'أخرى'];

const ShopSettingsPage: React.FC = () => {
  const { auth, settings, updateSettings } = useApp();
  const categories = settings.categories || DEFAULT_CATEGORIES;
  const [newCategory, setNewCategory] = useState('');
  const [newPaymentLabel, setNewPaymentLabel] = useState('');

  const addCategory = () => {
    const cat = newCategory.trim();
    if (!cat || settings.categories.includes(cat)) return;
    updateSettings({ ...settings, categories: [...settings.categories, cat] });
    setNewCategory('');
  };

  const removeCategory = (cat: string) => {
    updateSettings({ ...settings, categories: settings.categories.filter(c => c !== cat) });
  };

  const addPaymentMethod = () => {
    const label = newPaymentLabel.trim();
    if (!label) return;
    const id = label.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString(36);
    updateSettings({
      ...settings,
      paymentMethods: [...settings.paymentMethods, { id, label, active: true }],
    });
    setNewPaymentLabel('');
  };

  const togglePaymentMethod = (id: string) => {
    updateSettings({
      ...settings,
      paymentMethods: settings.paymentMethods.map(m => m.id === id ? { ...m, active: !m.active } : m),
    });
  };

  const removePaymentMethod = (id: string) => {
    if (settings.paymentMethods.length <= 1) return;
    updateSettings({
      ...settings,
      paymentMethods: settings.paymentMethods.filter(m => m.id !== id),
    });
  };

  return (
    <div className="h-full overflow-auto p-6">
      <h1 className="font-heading text-xl font-bold text-foreground mb-6">إعدادات المحل</h1>

      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <h2 className="font-heading text-base font-semibold text-foreground mb-2">معلومات الحساب</h2>
        <p className="text-sm text-muted-foreground font-body">اسم المحل: {auth.shopName}</p>
      </div>

      {/* Categories management */}
      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <h2 className="font-heading text-base font-semibold text-foreground mb-3">فئات المنتجات</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {settings.categories.map(cat => (
            <span key={cat} className="flex items-center gap-1 px-3 py-1.5 bg-background border border-border rounded-md text-sm font-body text-foreground">
              {cat}
              <button onClick={() => removeCategory(cat)} className="text-muted-foreground hover:text-destructive mr-1">
                <X className="w-3 h-3" strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            placeholder="اسم فئة جديدة..."
            className="bg-background border-border h-9 font-body text-sm flex-1"
            onKeyDown={e => e.key === 'Enter' && addCategory()}
          />
          <Button onClick={addCategory} size="sm" disabled={!newCategory.trim()}>
            <Plus className="w-4 h-4 ml-1" strokeWidth={1.5} />
            إضافة
          </Button>
        </div>
      </div>

      {/* Payment methods management */}
      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <h2 className="font-heading text-base font-semibold text-foreground mb-3">طرق الدفع</h2>
        <div className="space-y-2 mb-3">
          {settings.paymentMethods.map(method => (
            <div key={method.id} className="flex items-center justify-between py-2 px-3 bg-background border border-border rounded-md">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePaymentMethod(method.id)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    method.active ? 'bg-primary border-primary' : 'border-muted-foreground'
                  }`}
                >
                  {method.active && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={2} />}
                </button>
                <span className={`text-sm font-body ${method.active ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                  {method.label}
                </span>
              </div>
              <button onClick={() => removePaymentMethod(method.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={newPaymentLabel}
            onChange={e => setNewPaymentLabel(e.target.value)}
            placeholder="اسم طريقة دفع جديدة..."
            className="bg-background border-border h-9 font-body text-sm flex-1"
            onKeyDown={e => e.key === 'Enter' && addPaymentMethod()}
          />
          <Button onClick={addPaymentMethod} size="sm" disabled={!newPaymentLabel.trim()}>
            <Plus className="w-4 h-4 ml-1" strokeWidth={1.5} />
            إضافة
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShopSettingsPage;
