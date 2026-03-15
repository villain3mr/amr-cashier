import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Shop {
  id: string;
  name: string;
  username: string;
  password: string;
  phone: string;
  address: string;
  active: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  barcode: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  minStock: number;
  description: string;
  imei?: string;
}

export interface Customer {
  id: string;
  shopId: string;
  name: string;
  phone: string;
  address: string;
  balance: number;
  notes: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  shopId: string;
  customerId?: string;
  customerName?: string;
  type: 'sale' | 'purchase';
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  remaining: number;
  paymentMethod: string;
  date: string;
  notes: string;
}

export interface Transaction {
  id: string;
  shopId: string;
  customerId: string;
  type: 'payment' | 'purchase';
  amount: number;
  date: string;
  notes: string;
}

export interface AppSettings {
  id?: string;
  paymentMethods: { id: string; label: string; active: boolean }[];
  categories: string[];
  currency: string;
  appName: string;
}

type UserRole = 'admin' | 'shop';

interface AuthState {
  isLoggedIn: boolean;
  role: UserRole | null;
  shopId: string | null;
  shopName: string | null;
}

interface AppContextType {
  auth: AuthState;
  login: (username: string, password: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
  shops: Shop[];
  addShop: (shop: Omit<Shop, 'id' | 'createdAt'>) => Promise<void>;
  updateShop: (shop: Shop) => Promise<void>;
  deleteShop: (id: string) => Promise<void>;
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'date'>) => Promise<void>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => Promise<void>;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

const defaultSettings: AppSettings = {
  paymentMethods: [
    { id: 'cash', label: 'كاش', active: true },
    { id: 'instapay', label: 'انستاباي', active: true },
  ],
  categories: ['هاتف', 'اكسسوارات', 'شاحن', 'سماعات', 'كفر', 'سكرينة', 'أخرى'],
  currency: 'ج.م',
  appName: 'Amr Cashier',
};

// DB row mappers
function mapShop(r: any): Shop {
  return { id: r.id, name: r.name, username: r.username, password: r.password || '', phone: r.phone || '', address: r.address || '', active: r.active ?? true, createdAt: r.created_at || '' };
}
function mapProduct(r: any): Product {
  return { id: r.id, shopId: r.shop_id, name: r.name, barcode: r.barcode || '', category: r.category || '', buyPrice: Number(r.buy_price) || 0, sellPrice: Number(r.sell_price) || 0, quantity: Number(r.quantity) || 0, minStock: Number(r.min_stock) || 5, description: r.description || '', imei: r.imei || '' };
}
function mapCustomer(r: any): Customer {
  return { id: r.id, shopId: r.shop_id, name: r.name, phone: r.phone || '', address: r.address || '', balance: Number(r.balance) || 0, notes: r.notes || '' };
}
function mapInvoice(r: any, items: InvoiceItem[]): Invoice {
  return { id: r.id, shopId: r.shop_id, customerId: r.customer_id || undefined, customerName: r.customer_name || undefined, type: r.type as 'sale' | 'purchase', items, subtotal: Number(r.subtotal) || 0, discount: Number(r.discount) || 0, total: Number(r.total) || 0, paid: Number(r.paid) || 0, remaining: Number(r.remaining) || 0, paymentMethod: r.payment_method || '', date: r.date || '', notes: r.notes || '' };
}
function mapTransaction(r: any): Transaction {
  return { id: r.id, shopId: r.shop_id, customerId: r.customer_id, type: r.type as 'payment' | 'purchase', amount: Number(r.amount) || 0, date: r.date || '', notes: r.notes || '' };
}
function mapSettings(r: any): AppSettings {
  return { id: r.id, paymentMethods: (r.payment_methods as any[]) || defaultSettings.paymentMethods, categories: (r.categories as string[]) || defaultSettings.categories, currency: r.currency || defaultSettings.currency, appName: r.app_name || defaultSettings.appName };
}

function loadAuth(): AuthState {
  try {
    const saved = localStorage.getItem('amr_auth') || sessionStorage.getItem('amr_auth');
    return saved ? JSON.parse(saved) : { isLoggedIn: false, role: null, shopId: null, shopName: null };
  } catch { return { isLoggedIn: false, role: null, shopId: null, shopName: null }; }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadAuth);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    try {
      const [shopsRes, productsRes, customersRes, invoicesRes, itemsRes, transactionsRes, settingsRes] = await Promise.all([
        supabase.from('shops').select('*'),
        supabase.from('products').select('*'),
        supabase.from('customers').select('*'),
        supabase.from('invoices').select('*').order('date', { ascending: false }),
        supabase.from('invoice_items').select('*'),
        supabase.from('transactions').select('*'),
        supabase.from('app_settings').select('*').limit(1),
      ]);

      if (shopsRes.data) setShops(shopsRes.data.map(mapShop));
      if (productsRes.data) setProducts(productsRes.data.map(mapProduct));
      if (customersRes.data) setCustomers(customersRes.data.map(mapCustomer));
      if (transactionsRes.data) setTransactions(transactionsRes.data.map(mapTransaction));
      if (settingsRes.data && settingsRes.data.length > 0) setSettings(mapSettings(settingsRes.data[0]));

      // Map invoice items to invoices
      if (invoicesRes.data && itemsRes.data) {
        const itemsByInvoice: Record<string, InvoiceItem[]> = {};
        itemsRes.data.forEach((item: any) => {
          if (!itemsByInvoice[item.invoice_id]) itemsByInvoice[item.invoice_id] = [];
          itemsByInvoice[item.invoice_id].push({ id: item.id, productId: item.product_id || '', productName: item.product_name, quantity: item.quantity, unitPrice: Number(item.unit_price), total: Number(item.total) });
        });
        setInvoices(invoicesRes.data.map((inv: any) => mapInvoice(inv, itemsByInvoice[inv.id] || [])));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const login = useCallback(async (username: string, password: string, remember: boolean): Promise<boolean> => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const state: AuthState = { isLoggedIn: true, role: 'admin', shopId: null, shopName: null };
      setAuth(state);
      if (remember) localStorage.setItem('amr_auth', JSON.stringify(state));
      else sessionStorage.setItem('amr_auth', JSON.stringify(state));
      return true;
    }
    const { data } = await supabase.rpc('verify_shop_login', { p_username: username, p_password: password });
    if (data && data.length > 0) {
      const shop = data[0];
      const state: AuthState = { isLoggedIn: true, role: 'shop', shopId: shop.shop_id, shopName: shop.shop_name };
      setAuth(state);
      if (remember) localStorage.setItem('amr_auth', JSON.stringify(state));
      else sessionStorage.setItem('amr_auth', JSON.stringify(state));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuth({ isLoggedIn: false, role: null, shopId: null, shopName: null });
    localStorage.removeItem('amr_auth');
    sessionStorage.removeItem('amr_auth');
  }, []);

  // SHOPS
  const addShop = useCallback(async (shop: Omit<Shop, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('shops').insert({ name: shop.name, username: shop.username, password: shop.password, phone: shop.phone, address: shop.address, active: shop.active }).select().single();
    if (data && !error) setShops(prev => [...prev, mapShop(data)]);
  }, []);
  const updateShop = useCallback(async (shop: Shop) => {
    const { error } = await supabase.from('shops').update({ name: shop.name, username: shop.username, password: shop.password, phone: shop.phone, address: shop.address, active: shop.active }).eq('id', shop.id);
    if (!error) setShops(prev => prev.map(s => s.id === shop.id ? shop : s));
  }, []);
  const deleteShop = useCallback(async (id: string) => {
    const { error } = await supabase.from('shops').delete().eq('id', id);
    if (!error) setShops(prev => prev.filter(s => s.id !== id));
  }, []);

  // PRODUCTS
  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    const { data, error } = await supabase.from('products').insert({ shop_id: product.shopId, name: product.name, barcode: product.barcode, category: product.category, buy_price: product.buyPrice, sell_price: product.sellPrice, quantity: product.quantity, min_stock: product.minStock, description: product.description, imei: product.imei || '' }).select().single();
    if (data && !error) setProducts(prev => [...prev, mapProduct(data)]);
  }, []);
  const updateProduct = useCallback(async (product: Product) => {
    const { error } = await supabase.from('products').update({ name: product.name, barcode: product.barcode, category: product.category, buy_price: product.buyPrice, sell_price: product.sellPrice, quantity: product.quantity, min_stock: product.minStock, description: product.description, imei: product.imei || '' }).eq('id', product.id);
    if (!error) setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  }, []);
  const deleteProduct = useCallback(async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // CUSTOMERS
  const addCustomer = useCallback(async (customer: Omit<Customer, 'id'>) => {
    const { data, error } = await supabase.from('customers').insert({ shop_id: customer.shopId, name: customer.name, phone: customer.phone, address: customer.address, balance: customer.balance, notes: customer.notes }).select().single();
    if (data && !error) setCustomers(prev => [...prev, mapCustomer(data)]);
  }, []);
  const updateCustomer = useCallback(async (customer: Customer) => {
    const { error } = await supabase.from('customers').update({ name: customer.name, phone: customer.phone, address: customer.address, balance: customer.balance, notes: customer.notes }).eq('id', customer.id);
    if (!error) setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
  }, []);
  const deleteCustomer = useCallback(async (id: string) => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (!error) setCustomers(prev => prev.filter(c => c.id !== id));
  }, []);

  // INVOICES
  const addInvoice = useCallback(async (invoice: Omit<Invoice, 'id' | 'date'>) => {
    const { data: invData, error: invError } = await supabase.from('invoices').insert({
      shop_id: invoice.shopId, customer_id: invoice.customerId || null, customer_name: invoice.customerName || '', type: invoice.type, subtotal: invoice.subtotal, discount: invoice.discount, total: invoice.total, paid: invoice.paid, remaining: invoice.remaining, payment_method: invoice.paymentMethod, notes: invoice.notes,
    }).select().single();

    if (!invData || invError) return;

    // Insert items
    const itemsToInsert = invoice.items.map(item => ({ invoice_id: invData.id, product_id: item.productId, product_name: item.productName, quantity: item.quantity, unit_price: item.unitPrice, total: item.total }));
    const { data: itemsData } = await supabase.from('invoice_items').insert(itemsToInsert).select();
    const mappedItems: InvoiceItem[] = (itemsData || []).map((it: any) => ({ id: it.id, productId: it.product_id || '', productName: it.product_name, quantity: it.quantity, unitPrice: Number(it.unit_price), total: Number(it.total) }));

    setInvoices(prev => [mapInvoice(invData, mappedItems), ...prev]);

    // Update product quantities
    const isSale = invoice.type === 'sale';
    for (const item of invoice.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const newQty = isSale ? product.quantity - item.quantity : product.quantity + item.quantity;
        await supabase.from('products').update({ quantity: newQty }).eq('id', item.productId);
        setProducts(prev => prev.map(p => p.id === item.productId ? { ...p, quantity: newQty } : p));
      }
    }

    // Update customer balance
    if (invoice.customerId && invoice.remaining > 0) {
      const customer = customers.find(c => c.id === invoice.customerId);
      if (customer) {
        const newBalance = isSale ? customer.balance + invoice.remaining : customer.balance - invoice.remaining;
        await supabase.from('customers').update({ balance: newBalance }).eq('id', invoice.customerId);
        setCustomers(prev => prev.map(c => c.id === invoice.customerId ? { ...c, balance: newBalance } : c));
      }
    }
  }, [products, customers]);

  const updateInvoice = useCallback(async (invoice: Invoice) => {
    const { error } = await supabase.from('invoices').update({ customer_id: invoice.customerId || null, customer_name: invoice.customerName || '', subtotal: invoice.subtotal, discount: invoice.discount, total: invoice.total, paid: invoice.paid, remaining: invoice.remaining, payment_method: invoice.paymentMethod, notes: invoice.notes }).eq('id', invoice.id);
    if (!error) setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i));
  }, []);

  const deleteInvoice = useCallback(async (id: string) => {
    const invoice = invoices.find(i => i.id === id);
    if (invoice) {
      const isSale = invoice.type === 'sale';
      for (const item of invoice.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const newQty = isSale ? product.quantity + item.quantity : product.quantity - item.quantity;
          await supabase.from('products').update({ quantity: newQty }).eq('id', item.productId);
          setProducts(prev => prev.map(p => p.id === item.productId ? { ...p, quantity: newQty } : p));
        }
      }
      if (invoice.customerId && invoice.remaining > 0) {
        const customer = customers.find(c => c.id === invoice.customerId);
        if (customer) {
          const newBalance = isSale ? customer.balance - invoice.remaining : customer.balance + invoice.remaining;
          await supabase.from('customers').update({ balance: newBalance }).eq('id', invoice.customerId);
          setCustomers(prev => prev.map(c => c.id === invoice.customerId ? { ...c, balance: newBalance } : c));
        }
      }
    }
    await supabase.from('invoice_items').delete().eq('invoice_id', id);
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (!error) setInvoices(prev => prev.filter(i => i.id !== id));
  }, [invoices, products, customers]);

  // TRANSACTIONS
  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id' | 'date'>) => {
    const { data, error } = await supabase.from('transactions').insert({ shop_id: tx.shopId, customer_id: tx.customerId, type: tx.type, amount: tx.amount, notes: tx.notes }).select().single();
    if (data && !error) setTransactions(prev => [...prev, mapTransaction(data)]);
    if (tx.type === 'payment') {
      const customer = customers.find(c => c.id === tx.customerId);
      if (customer) {
        const newBalance = customer.balance - tx.amount;
        await supabase.from('customers').update({ balance: newBalance }).eq('id', tx.customerId);
        setCustomers(prev => prev.map(c => c.id === tx.customerId ? { ...c, balance: newBalance } : c));
      }
    }
  }, [customers]);

  // SETTINGS
  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    const updateData = { payment_methods: newSettings.paymentMethods as any, categories: newSettings.categories as any, currency: newSettings.currency, app_name: newSettings.appName };
    if (settings.id) {
      await supabase.from('app_settings').update(updateData).eq('id', settings.id);
    } else {
      const { data } = await supabase.from('app_settings').insert(updateData).select().single();
      if (data) newSettings.id = data.id;
    }
    setSettings(newSettings);
  }, [settings.id]);

  return (
    <AppContext.Provider value={{
      auth, login, logout,
      shops, addShop, updateShop, deleteShop,
      products, addProduct, updateProduct, deleteProduct,
      customers, addCustomer, updateCustomer, deleteCustomer,
      invoices, addInvoice, updateInvoice, deleteInvoice,
      transactions, addTransaction,
      settings, updateSettings,
      loading, refreshData: fetchAllData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
