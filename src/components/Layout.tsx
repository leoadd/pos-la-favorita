import { useState } from 'react';
import { AppContextType } from '../App';
import { Store, Package, ShoppingCart, BarChart3, Users, LogOut, DollarSign, Tag } from 'lucide-react';
import { Inventario } from './modules/Inventario';
import { Ventas } from './modules/Ventas';
import { Reportes } from './modules/Reportes';
import { Empleados } from './modules/Empleados';
import { CorteCaja } from './modules/CorteCaja';
import { Ofertas } from './modules/Ofertas';

type LayoutProps = {
  appContext: AppContextType;
  onLogout: () => void;
};

type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<{ appContext?: AppContextType }>;
  adminOnly?: boolean;
};

const menuItems: MenuItem[] = [
  { id: 'ventas', label: 'Punto de Venta', icon: ShoppingCart, component: Ventas },
  { id: 'inventario', label: 'Inventario', icon: Package, component: Inventario },
  { id: 'ofertas', label: 'Ofertas y Descuentos', icon: Tag, component: Ofertas },
  { id: 'reportes', label: 'Reportes de Ventas', icon: BarChart3, component: Reportes },
  { id: 'corte_caja', label: 'Corte de Caja', icon: DollarSign, component: CorteCaja },
  { id: 'empleados', label: 'Gestión de Empleados', icon: Users, component: Empleados, adminOnly: true },
];

export function Layout({ appContext, onLogout }: LayoutProps) {
  const [activeModule, setActiveModule] = useState('ventas');

  const ActiveComponent = menuItems.find((item) => item.id === activeModule)?.component || Ventas;

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar - More Compact */}
      <div className="w-16 bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center py-4 border-r border-gray-800">
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-6 shadow-lg">
          <Store className="w-5 h-5 text-gray-900" />
        </div>

        {/* Menu Items */}
        <nav className="flex-1 flex flex-col gap-1 w-full px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            
            // Hide admin-only items for non-admin users
            if (item.adminOnly && appContext.currentUser?.role !== 'admin') {
              return null;
            }
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`group relative w-full h-11 flex items-center justify-center rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-50 border border-gray-700">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-11 h-11 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-red-600/20 transition-all group relative"
          title="Cerrar Sesión"
        >
          <LogOut className="w-5 h-5" />
          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-50 border border-gray-700">
            Cerrar Sesión
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
          </div>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ActiveComponent appContext={appContext} />
      </div>
    </div>
  );
}