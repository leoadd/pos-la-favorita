import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { initializeStorage, storageHelpers } from './utils/storage';

export type Product = {
  id: string;
  name: string;
  costPrice: number; // Precio de compra
  price: number; // Precio de venta
  priceWholesale?: number; // Precio por mayoreo
  stock: number;
  category: string;
  barcode?: string;
  unitType: 'unit' | 'package' | 'box'; // Tipo de unidad
  unitsPerPackage?: number; // Unidades por paquete/caja
  expirationDate?: string; // Fecha de caducidad opcional (ISO string)
  isOnSale?: boolean; // Marcador si está en oferta
  originalPrice?: number; // Precio original antes de la oferta
};

export type Sale = {
  id: string;
  date: Date;
  items: { product: Product; quantity: number; discount?: number }[];
  total: number;
  paymentMethod: string;
  amountPaid?: number;
  change?: number;
};

export type User = {
  username: string;
  password: string;
  role: 'admin' | 'employee';
  name: string;
  securityQuestions?: {
    question1: string;
    answer1: string;
    question2: string;
    answer2: string;
    question3: string;
    answer3: string;
  };
};

export type AppContextType = {
  products: Product[];
  setProducts: (products: Product[]) => void;
  sales: Sale[];
  setSales: (sales: Sale[]) => void;
  currentUser: User | null;
  users: User[];
  setUsers: (users: User[]) => void;
};

const mockProducts: Product[] = [
  { id: '1', name: 'Coca-Cola 600ml', costPrice: 10, price: 15, stock: 50, category: 'Bebidas', unitType: 'unit' },
  { id: '2', name: 'Agua Purificada', costPrice: 5, price: 8, priceWholesale: 90, stock: 240, category: 'Bebidas', unitType: 'package', unitsPerPackage: 12 },
  { id: '3', name: 'Pan Blanco', costPrice: 20, price: 35, stock: 30, category: 'Panadería', unitType: 'unit' },
  { id: '4', name: 'Arroz 1kg', costPrice: 15, price: 22, priceWholesale: 250, stock: 100, category: 'Granos', unitType: 'box', unitsPerPackage: 12 },
  { id: '5', name: 'Leche Entera 1L', costPrice: 18, price: 25, stock: 45, category: 'Lácteos', unitType: 'unit' },
  { id: '6', name: 'Aceite Vegetal 1L', costPrice: 35, price: 42, stock: 25, category: 'Aceites', unitType: 'unit' },
];

const mockUsers: User[] = [
  { 
    username: 'admin', 
    password: 'admin123', 
    role: 'admin', 
    name: 'Administrador Principal',
    securityQuestions: {
      question1: '¿Cuál es tu fruta favorita?',
      answer1: 'mango',
      question2: '¿En qué ciudad naciste?',
      answer2: 'guadalajara',
      question3: '¿Cuál es el nombre de tu mascota?',
      answer3: 'firulais',
    }
  },
  { username: 'empleado1', password: 'emp123', role: 'employee', name: 'Juan Pérez' },
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Inicializar y cargar datos desde LocalStorage
  useEffect(() => {
    initializeStorage();
    setProducts(storageHelpers.getProducts());
    setSales(storageHelpers.getSales());
    setUsers(storageHelpers.getUsers());
    console.log('📦 Datos cargados desde base de datos local');
  }, []);

  // Guardar productos cuando cambien
  useEffect(() => {
    if (products.length > 0) {
      storageHelpers.saveProducts(products);
    }
  }, [products]);

  // Guardar ventas cuando cambien
  useEffect(() => {
    if (sales.length > 0) {
      storageHelpers.saveSales(sales);
    }
  }, [sales]);

  // Guardar usuarios cuando cambien
  useEffect(() => {
    if (users.length > 0) {
      storageHelpers.saveUsers(users);
    }
  }, [users]);

  const handleLogin = (username: string, password: string) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const appContext: AppContextType = {
    products,
    setProducts,
    sales,
    setSales,
    currentUser,
    users,
    setUsers,
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} users={users} setUsers={setUsers} />;
  }

  return <Layout appContext={appContext} onLogout={handleLogout} />;
}

export default App;