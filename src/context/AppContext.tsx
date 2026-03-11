import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  remaining: number;
  paymentMethod: 'cash' | 'visa' | 'mixed';
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

type UserRole = 'admin' | 'shop';

interface AuthState {
  isLoggedIn: boolean;
  role: UserRole | null;
  shopId: string | null;
  shopName: string | null;
}

interface AppContextType {
  auth: AuthState;
  login: (username: string, password: string, remember: boolean) => boolean;
  logout: () => void;
  shops: Shop[];
  addShop: (shop: Omit<Shop, 'id' | 'createdAt'>) => void;
  updateShop: (shop: Shop) => void;
  deleteShop: (id: string) => void;
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'date'>) => void;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = loadFromStorage<AuthState | null>('amr_auth', null);
    return saved || { isLoggedIn: false, role: null, shopId: null, shopName: null };
  });

  const [shops, setShops] = useState<Shop[]>(() => loadFromStorage('amr_shops', []));
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('amr_products', []));
  const [customers, setCustomers] = useState<Customer[]>(() => loadFromStorage('amr_customers', []));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadFromStorage('amr_invoices', []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadFromStorage('amr_transactions', []));

  useEffect(() => { saveToStorage('amr_shops', shops); }, [shops]);
  useEffect(() => { saveToStorage('amr_products', products); }, [products]);
  useEffect(() => { saveToStorage('amr_customers', customers); }, [customers]);
  useEffect(() => { saveToStorage('amr_invoices', invoices); }, [invoices]);
  useEffect(() => { saveToStorage('amr_transactions', transactions); }, [transactions]);

  const login = useCallback((username: string, password: string, remember: boolean) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const state: AuthState = { isLoggedIn: true, role: 'admin', shopId: null, shopName: null };
      setAuth(state);
      if (remember) saveToStorage('amr_auth', state);
      else sessionStorage.setItem('amr_auth', JSON.stringify(state));
      return true;
    }
    const shop = shops.find(s => s.username === username && s.password === password && s.active);
    if (shop) {
      const state: AuthState = { isLoggedIn: true, role: 'shop', shopId: shop.id, shopName: shop.name };
      setAuth(state);
      if (remember) saveToStorage('amr_auth', state);
      else sessionStorage.setItem('amr_auth', JSON.stringify(state));
      return true;
    }
    return false;
  }, [shops]);

  const logout = useCallback(() => {
    setAuth({ isLoggedIn: false, role: null, shopId: null, shopName: null });
    localStorage.removeItem('amr_auth');
    sessionStorage.removeItem('amr_auth');
  }, []);

  const addShop = useCallback((shop: Omit<Shop, 'id' | 'createdAt'>) => {
    setShops(prev => [...prev, { ...shop, id: generateId(), createdAt: new Date().toISOString() }]);
  }, []);
  const updateShop = useCallback((shop: Shop) => {
    setShops(prev => prev.map(s => s.id === shop.id ? shop : s));
  }, []);
  const deleteShop = useCallback((id: string) => {
    setShops(prev => prev.filter(s => s.id !== id));
  }, []);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...product, id: generateId() }]);
  }, []);
  const updateProduct = useCallback((product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  }, []);
  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const addCustomer = useCallback((customer: Omit<Customer, 'id'>) => {
    setCustomers(prev => [...prev, { ...customer, id: generateId() }]);
  }, []);
  const updateCustomer = useCallback((customer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
  }, []);
  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  }, []);

  const addInvoice = useCallback((invoice: Omit<Invoice, 'id' | 'date'>) => {
    const newInvoice = { ...invoice, id: generateId(), date: new Date().toISOString() };
    setInvoices(prev => [...prev, newInvoice]);
    // Update product quantities
    invoice.items.forEach(item => {
      setProducts(prev => prev.map(p =>
        p.id === item.productId ? { ...p, quantity: p.quantity - item.quantity } : p
      ));
    });
    // Update customer balance if applicable
    if (invoice.customerId && invoice.remaining > 0) {
      setCustomers(prev => prev.map(c =>
        c.id === invoice.customerId ? { ...c, balance: c.balance + invoice.remaining } : c
      ));
    }
  }, []);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'date'>) => {
    setTransactions(prev => [...prev, { ...tx, id: generateId(), date: new Date().toISOString() }]);
    if (tx.type === 'payment') {
      setCustomers(prev => prev.map(c =>
        c.id === tx.customerId ? { ...c, balance: c.balance - tx.amount } : c
      ));
    }
  }, []);

  return (
    <AppContext.Provider value={{
      auth, login, logout,
      shops, addShop, updateShop, deleteShop,
      products, addProduct, updateProduct, deleteProduct,
      customers, addCustomer, updateCustomer, deleteCustomer,
      invoices, addInvoice,
      transactions, addTransaction,
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
