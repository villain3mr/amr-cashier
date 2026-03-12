import React, { useState } from 'react';
import { useApp, AppSettings } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Check, Settings } from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings, paymentMethods: settings.paymentMethods.map(m => ({ ...m })) });
  const [newMethodLabel, setNewMethodLabel] = useState('');
  const [saved, setSaved] = useState(false);

  const addMethod = () => {
    if (!newMethodLabel.trim()) return;
    const id = newMethodLabel.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString(36);
    setLocalSettings(s => ({
      ...s,
      paymentMethods: [...s.paymentMethods, { id, label: newMethodLabel.trim(), active: true }],
    }));
    setNewMethodLabel('');
  };

  const removeMethod = (id: string) => {
    setLocalSettings(s => ({
      ...s,
      paymentMethods: s.paymentMethods.filter(m => m.id !== id),
    }));
  };

  const toggleMethod = (id: string) => {
    setLocalSettings(s => ({
      ...s,
      paymentMethods: s.paymentMethods.map(m => m.id === id ? { ...m, active: !m.active } : m),
    }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-primary" strokeWidth={1.5} />
        <h1 className="font-heading text-xl font-bold text-foreground">إعدادات البرنامج</h1>
      </div>

      <div className="max-w-lg space-y-6">
        {/* App name */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="font-heading text-base font-semibold text-foreground mb-3">معلومات عامة</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 block">اسم التطبيق</label>
              <Input value={localSettings.appName} onChange={e => setLocalSettings(s => ({ ...s, appName: e.target.value }))} className="bg-background border-border h-10 font-body" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 block">العملة</label>
              <Input value={localSettings.currency} onChange={e => setLocalSettings(s => ({ ...s, currency: e.target.value }))} className="bg-background border-border h-10 font-body" />
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="font-heading text-base font-semibold text-foreground mb-3">طرق الدفع</h2>
          <div className="space-y-2 mb-3">
            {localSettings.paymentMethods.map(method => (
              <div key={method.id} className="flex items-center justify-between bg-background rounded-md p-3 border border-border">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleMethod(method.id)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${method.active ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${method.active ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                  <span className={`text-sm font-body ${method.active ? 'text-foreground' : 'text-muted-foreground'}`}>{method.label}</span>
                </div>
                <button onClick={() => removeMethod(method.id)} className="p-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newMethodLabel}
              onChange={e => setNewMethodLabel(e.target.value)}
              placeholder="اسم طريقة الدفع..."
              className="bg-background border-border h-9 font-body text-sm flex-1"
              onKeyDown={e => e.key === 'Enter' && addMethod()}
            />
            <Button onClick={addMethod} size="sm" variant="outline" className="h-9">
              <Plus className="w-4 h-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>

        {/* Save */}
        <Button onClick={handleSave} className="w-full h-10 font-heading font-semibold">
          <Check className="w-4 h-4 ml-1" strokeWidth={1.5} />
          {saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
