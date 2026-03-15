import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, X, Check, Lock, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_CATEGORIES = ['هاتف', 'اكسسوارات', 'شاحن', 'سماعات', 'كفر', 'سكرينة', 'أخرى'];

const ShopSettingsPage: React.FC = () => {
  const { auth, settings, updateSettings } = useApp();
  const categories = settings.categories || DEFAULT_CATEGORIES;
  const [newCategory, setNewCategory] = useState('');
  const [newPaymentLabel, setNewPaymentLabel] = useState('');

  // Lock password management
  const [lockSection, setLockSection] = useState<'dashboard' | 'inventory' | null>(null);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [lockMsg, setLockMsg] = useState('');
  const [lockLoading, setLockLoading] = useState(false);

  const addCategory = () => {
    const cat = newCategory.trim();
    if (!cat || categories.includes(cat)) return;
    updateSettings({ ...settings, categories: [...categories, cat] });
    setNewCategory('');
  };

  const removeCategory = (cat: string) => {
    updateSettings({ ...settings, categories: categories.filter((c: string) => c !== cat) });
  };

  const addPaymentMethod = () => {
    const label = newPaymentLabel.trim();
    if (!label) return;
    const id = label.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString(36);
    updateSettings({ ...settings, paymentMethods: [...settings.paymentMethods, { id, label, active: true }] });
    setNewPaymentLabel('');
  };

  const togglePaymentMethod = (id: string) => {
    updateSettings({ ...settings, paymentMethods: settings.paymentMethods.map(m => m.id === id ? { ...m, active: !m.active } : m) });
  };

  const removePaymentMethod = (id: string) => {
    if (settings.paymentMethods.length <= 1) return;
    updateSettings({ ...settings, paymentMethods: settings.paymentMethods.filter(m => m.id !== id) });
  };

  const handleLockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockSection || !auth.shopId) return;
    if (newPass !== confirmPass) { setLockMsg('كلمة المرور الجديدة غير متطابقة'); return; }
    if (newPass.length < 4) { setLockMsg('كلمة المرور يجب أن تكون 4 أحرف على الأقل'); return; }
    setLockLoading(true);
    setLockMsg('');
    try {
      const { data } = await supabase.rpc('change_lock_password', {
        p_shop_id: auth.shopId,
        p_lock_type: lockSection,
        p_current_password: currentPass,
        p_new_password: newPass,
      });
      if (data) {
        setLockMsg('✓ تم تحديث كلمة المرور بنجاح');
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        setLockMsg('كلمة المرور الحالية غير صحيحة');
      }
    } catch {
      setLockMsg('حدث خطأ');
    } finally {
      setLockLoading(false);
    }
  };

  return (
    <div className="h-full overflow-auto p-6">
      <h1 className="font-heading text-xl font-bold text-foreground mb-6">إعدادات المحل</h1>

      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <h2 className="font-heading text-base font-semibold text-foreground mb-2">معلومات الحساب</h2>
        <p className="text-sm text-muted-foreground font-body">اسم المحل: {auth.shopName}</p>
      </div>

      {/* Lock passwords */}
      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <h2 className="font-heading text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" strokeWidth={1.5} />
          قفل الأقسام بكلمة مرور
        </h2>
        <p className="text-xs text-muted-foreground font-body mb-3">حماية لوحة التحكم والمخزون بكلمة مرور منفصلة</p>
        <div className="flex gap-2 mb-3">
          <Button onClick={() => { setLockSection('dashboard'); setLockMsg(''); setCurrentPass(''); setNewPass(''); setConfirmPass(''); }} size="sm" variant={lockSection === 'dashboard' ? 'default' : 'outline'}>
            قفل لوحة التحكم
          </Button>
          <Button onClick={() => { setLockSection('inventory'); setLockMsg(''); setCurrentPass(''); setNewPass(''); setConfirmPass(''); }} size="sm" variant={lockSection === 'inventory' ? 'default' : 'outline'}>
            قفل المخزون
          </Button>
        </div>
        {lockSection && (
          <form onSubmit={handleLockSubmit} className="space-y-2 bg-background p-3 rounded-md border border-border">
            <p className="text-xs font-body text-foreground font-medium mb-1">
              {lockSection === 'dashboard' ? 'كلمة مرور لوحة التحكم' : 'كلمة مرور المخزون'}
            </p>
            <Input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="كلمة المرور الحالية (اتركها فارغة لأول مرة)" className="bg-card border-border h-9 font-body text-sm" />
            <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="كلمة المرور الجديدة" className="bg-card border-border h-9 font-body text-sm" required />
            <Input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="تأكيد كلمة المرور الجديدة" className="bg-card border-border h-9 font-body text-sm" required />
            {lockMsg && <p className={`text-xs font-body ${lockMsg.startsWith('✓') ? 'text-primary' : 'text-destructive'}`}>{lockMsg}</p>}
            <Button type="submit" size="sm" className="w-full" disabled={lockLoading}>
              <ShieldCheck className="w-4 h-4 ml-1" strokeWidth={1.5} />
              حفظ كلمة المرور
            </Button>
          </form>
        )}
      </div>

      {/* Categories management */}
      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <h2 className="font-heading text-base font-semibold text-foreground mb-3">فئات المنتجات</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map((cat: string) => (
            <span key={cat} className="flex items-center gap-1 px-3 py-1.5 bg-background border border-border rounded-md text-sm font-body text-foreground">
              {cat}
              <button onClick={() => removeCategory(cat)} className="text-muted-foreground hover:text-destructive mr-1">
                <X className="w-3 h-3" strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="اسم فئة جديدة..." className="bg-background border-border h-9 font-body text-sm flex-1" onKeyDown={e => e.key === 'Enter' && addCategory()} />
          <Button onClick={addCategory} size="sm" disabled={!newCategory.trim()}>
            <Plus className="w-4 h-4 ml-1" strokeWidth={1.5} />
            إضافة
          </Button>
        </div>
      </div>

      {/* Payment methods */}
      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <h2 className="font-heading text-base font-semibold text-foreground mb-3">طرق الدفع</h2>
        <div className="space-y-2 mb-3">
          {settings.paymentMethods.map(method => (
            <div key={method.id} className="flex items-center justify-between py-2 px-3 bg-background border border-border rounded-md">
              <div className="flex items-center gap-2">
                <button onClick={() => togglePaymentMethod(method.id)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${method.active ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                  {method.active && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={2} />}
                </button>
                <span className={`text-sm font-body ${method.active ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{method.label}</span>
              </div>
              <button onClick={() => removePaymentMethod(method.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input value={newPaymentLabel} onChange={e => setNewPaymentLabel(e.target.value)} placeholder="اسم طريقة دفع جديدة..." className="bg-background border-border h-9 font-body text-sm flex-1" onKeyDown={e => e.key === 'Enter' && addPaymentMethod()} />
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
