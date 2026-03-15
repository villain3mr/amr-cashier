import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Smartphone, Lock, User } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login(username.trim(), password, remember);
      if (!success) setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    } catch {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {loading && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-muted overflow-hidden z-50">
          <div className="h-full w-1/3 bg-primary animate-progress" />
        </div>
      )}
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border mb-4">
            <Smartphone className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Amr Cashier</h1>
          <p className="text-muted-foreground text-sm mt-1 font-body">نظام كاشير لمحلات الموبايلات</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="اسم المستخدم" className="pr-10 bg-card border-border text-foreground placeholder:text-muted-foreground h-11 font-body" autoComplete="username" required />
          </div>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" className="pr-10 bg-card border-border text-foreground placeholder:text-muted-foreground h-11 font-body" autoComplete="current-password" required />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
            <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer font-body">تذكرني</label>
          </div>
          {error && <p className="text-destructive text-sm font-body">{error}</p>}
          <Button type="submit" className="w-full h-11 font-heading font-semibold" disabled={loading}>
            تسجيل الدخول
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
