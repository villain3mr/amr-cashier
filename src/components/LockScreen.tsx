import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LockScreenProps {
  shopId: string;
  lockType: 'dashboard' | 'inventory';
  title: string;
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ shopId, lockType, title, onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await supabase.rpc('verify_lock_password', {
        p_shop_id: shopId,
        p_lock_type: lockType,
        p_password: password,
      });
      if (data) {
        onUnlock();
      } else {
        setError('كلمة المرور غير صحيحة');
      }
    } catch {
      setError('حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-background">
      <div className="w-full max-w-xs text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border mb-4">
          <Lock className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>
        <h2 className="font-heading text-lg font-bold text-foreground mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground font-body mb-6">أدخل كلمة مرور القفل للوصول</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="bg-card border-border h-11 font-body text-center"
            autoFocus
            required
          />
          {error && <p className="text-destructive text-sm font-body">{error}</p>}
          <Button type="submit" className="w-full h-11 font-heading font-semibold" disabled={loading}>
            <ShieldCheck className="w-4 h-4 ml-1" strokeWidth={1.5} />
            فتح القفل
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LockScreen;
