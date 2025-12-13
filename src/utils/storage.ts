import { Product, Sale, User } from '../App';

const STORAGE_KEYS = {
  PRODUCTS: 'laFavorita_products',
  SALES: 'laFavorita_sales',
  USERS: 'laFavorita_users',
  INITIALIZED: 'laFavorita_initialized',
};

// Productos por defecto
const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: 'Coca-Cola 600ml', costPrice: 10, price: 15, stock: 50, category: 'Bebidas', unitType: 'unit' },
  { id: '2', name: 'Agua Purificada', costPrice: 5, price: 8, priceWholesale: 90, stock: 240, category: 'Bebidas', unitType: 'package', unitsPerPackage: 12 },
  { id: '3', name: 'Pan Blanco', costPrice: 20, price: 35, stock: 30, category: 'Panadería', unitType: 'unit' },
  { id: '4', name: 'Arroz 1kg', costPrice: 15, price: 22, priceWholesale: 250, stock: 100, category: 'Granos', unitType: 'box', unitsPerPackage: 12 },
  { id: '5', name: 'Leche Entera 1L', costPrice: 18, price: 25, stock: 45, category: 'Lácteos', unitType: 'unit' },
  { id: '6', name: 'Aceite Vegetal 1L', costPrice: 35, price: 42, stock: 25, category: 'Aceites', unitType: 'unit' },
];

// Usuarios por defecto
const DEFAULT_USERS: User[] = [
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

// Guardar en LocalStorage
export const saveToStorage = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error guardando ${key}:`, error);
  }
};

// Cargar desde LocalStorage
export const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error cargando ${key}:`, error);
    return defaultValue;
  }
};

// Inicializar base de datos local
export const initializeStorage = (): void => {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  
  if (!isInitialized) {
    // Primera vez que se usa la app - cargar datos por defecto
    saveToStorage(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    saveToStorage(STORAGE_KEYS.SALES, []);
    saveToStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    saveToStorage(STORAGE_KEYS.INITIALIZED, 'true');
    console.log('✅ Base de datos local inicializada con datos por defecto');
  } else {
    console.log('✅ Base de datos local cargada');
  }
};

// Funciones específicas para cada entidad
export const storageHelpers = {
  // Productos
  getProducts: (): Product[] => {
    return loadFromStorage(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  },
  saveProducts: (products: Product[]): void => {
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
  },

  // Ventas
  getSales: (): Sale[] => {
    const sales = loadFromStorage<any[]>(STORAGE_KEYS.SALES, []);
    // Convertir fechas de string a Date
    return sales.map(sale => ({
      ...sale,
      date: new Date(sale.date),
    }));
  },
  saveSales: (sales: Sale[]): void => {
    saveToStorage(STORAGE_KEYS.SALES, sales);
  },

  // Usuarios
  getUsers: (): User[] => {
    return loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
  },
  saveUsers: (users: User[]): void => {
    saveToStorage(STORAGE_KEYS.USERS, users);
  },

  // Resetear todo (útil para pruebas)
  resetDatabase: (): void => {
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    initializeStorage();
    console.log('🔄 Base de datos reseteada');
  },

  // Exportar datos (backup)
  exportData: (): string => {
    const data = {
      products: storageHelpers.getProducts(),
      sales: storageHelpers.getSales(),
      users: storageHelpers.getUsers(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  // Importar datos (restore)
  importData: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.products) saveToStorage(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.sales) saveToStorage(STORAGE_KEYS.SALES, data.sales);
      if (data.users) saveToStorage(STORAGE_KEYS.USERS, data.users);
      console.log('✅ Datos importados correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error importando datos:', error);
      return false;
    }
  },
};