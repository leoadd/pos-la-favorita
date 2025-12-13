import { useMemo, useState } from 'react';
import { AppContextType } from '../../App';
import { BarChart3, TrendingUp, Calendar, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const COLORS = ['#9333ea', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899', '#8b5cf6'];

export function Reportes({ appContext }: { appContext: AppContextType }) {
  const [dateRange, setDateRange] = useState('today');

  const filteredSales = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return appContext.sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      
      if (dateRange === 'today') {
        return saleDate >= today;
      } else if (dateRange === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return saleDate >= weekAgo;
      } else if (dateRange === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return saleDate >= monthAgo;
      }
      return true;
    });
  }, [appContext.sales, dateRange]);

  const productsSold = useMemo(() => {
    const productsMap = new Map<string, { 
      name: string; 
      quantity: number; 
      total: number; 
      profit: number;
      profitMargin: number; // Margen de ganancia promedio
      unitsSold: number; // Unidades individuales vendidas
      packagesSold: number; // Paquetes vendidos
    }>();
    
    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const product = item.product;
        const costPrice = product.costPrice || 0;
        const unitsPerPackage = product.unitsPerPackage || 1;
        
        // Calcular costo unitario
        const unitCost = costPrice / unitsPerPackage;
        
        // Determinar si se vendió por paquete o por unidad
        const soldByPackage = item.sellByPackage;
        
        let profit = 0;
        let profitMargin = 0;
        
        if (soldByPackage) {
          // Venta por paquete: margen = precio paquete - costo total del paquete
          const packagePrice = product.price;
          profitMargin = packagePrice - costPrice;
          profit = profitMargin * item.quantity;
        } else {
          // Venta por unidad: margen = precio unitario - costo unitario
          const unitPrice = product.price;
          profitMargin = unitPrice - unitCost;
          profit = profitMargin * item.quantity;
        }
        
        const existing = productsMap.get(product.id);
        if (existing) {
          existing.quantity += item.quantity;
          existing.total += product.price * item.quantity;
          existing.profit += profit;
          // Actualizar margen promedio ponderado
          const totalItems = existing.quantity + item.quantity;
          existing.profitMargin = ((existing.profitMargin * existing.quantity) + (profitMargin * item.quantity)) / totalItems;
          
          if (soldByPackage) {
            existing.packagesSold += item.quantity;
          } else {
            existing.unitsSold += item.quantity;
          }
        } else {
          productsMap.set(product.id, {
            name: product.name,
            quantity: item.quantity,
            total: product.price * item.quantity,
            profit: profit,
            profitMargin: profitMargin,
            unitsSold: soldByPackage ? 0 : item.quantity,
            packagesSold: soldByPackage ? item.quantity : 0,
          });
        }
      });
    });

    return Array.from(productsMap.values()).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  const totalVentas = useMemo(() => {
    return filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  }, [filteredSales]);

  const totalGanancias = useMemo(() => {
    return filteredSales.reduce((sum, sale) => {
      const saleProfit = sale.items.reduce((itemSum, item) => {
        const product = item.product;
        const costPrice = product.costPrice || 0;
        const unitsPerPackage = product.unitsPerPackage || 1;
        const unitCost = costPrice / unitsPerPackage;
        const soldByPackage = item.sellByPackage;
        
        let profit = 0;
        if (soldByPackage) {
          // Venta por paquete
          profit = (product.price - costPrice) * item.quantity;
        } else {
          // Venta por unidad
          profit = (product.price - unitCost) * item.quantity;
        }
        
        return itemSum + profit;
      }, 0);
      return sum + saleProfit;
    }, 0);
  }, [filteredSales]);

  const totalProductosVendidos = useMemo(() => {
    return filteredSales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
  }, [filteredSales]);

  const ventaPromedio = useMemo(() => {
    return filteredSales.length > 0 ? totalVentas / filteredSales.length : 0;
  }, [totalVentas, filteredSales]);

  const ventasPorHora = useMemo(() => {
    const horasMap = new Map<number, { ventas: number; total: number }>();
    
    // Inicializar todas las horas
    for (let i = 0; i < 24; i++) {
      horasMap.set(i, { ventas: 0, total: 0 });
    }
    
    filteredSales.forEach((sale) => {
      const saleDate = new Date(sale.date);
      const hour = saleDate.getHours();
      const existing = horasMap.get(hour);
      if (existing) {
        existing.ventas += 1;
        existing.total += sale.total;
      }
    });

    return Array.from(horasMap.entries())
      .map(([hour, data]) => ({
        hora: `${hour.toString().padStart(2, '0')}:00`,
        ventas: data.ventas,
        total: data.total,
      }))
      .filter(item => item.ventas > 0); // Solo mostrar horas con ventas
  }, [filteredSales]);

  const topProductsChartData = productsSold.slice(0, 7).map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    ventas: p.total,
    unidades: p.quantity,
  }));

  const topProfitProductsChartData = productsSold
    .sort((a, b) => b.profitMargin - a.profitMargin) // Ordenar por MARGEN de ganancia
    .slice(0, 7)
    .map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      margen: p.profitMargin,
      unidades: p.quantity,
    }));

  return (
    <div className="h-full bg-gray-900 p-4 overflow-hidden">
      <div className="h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl mb-1 tracking-tight">Reportes de Ventas</h2>
              <p className="text-gray-500 text-base">Análisis y estadísticas</p>
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
            >
              <option value="today">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="all">Todo</option>
            </select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5" />
                <div className="text-sm opacity-90">Total Vendido</div>
              </div>
              <div className="text-3xl font-semibold">${totalVentas.toFixed(2)}</div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5" />
                <div className="text-sm opacity-90">Ganancias</div>
              </div>
              <div className="text-3xl font-semibold">${totalGanancias.toFixed(2)}</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5" />
                <div className="text-sm opacity-90">Ventas</div>
              </div>
              <div className="text-3xl font-semibold">{filteredSales.length}</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5" />
                <div className="text-sm opacity-90">Promedio</div>
              </div>
              <div className="text-3xl font-semibold">${ventaPromedio.toFixed(2)}</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Filter className="w-5 h-5" />
                <div className="text-sm opacity-90">Productos</div>
              </div>
              <div className="text-3xl font-semibold">{totalProductosVendidos}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Bar Chart */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <h3 className="text-lg font-medium mb-4">Top Productos</h3>
              {topProductsChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topProductsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        fontSize: '14px'
                      }} 
                    />
                    <Bar dataKey="ventas" fill="#9333ea" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-400 text-sm">
                  No hay datos
                </div>
              )}
            </div>

            {/* Line Chart - Ventas por Hora */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <h3 className="text-lg font-medium mb-4">Productos con Más Ganancia</h3>
              {topProfitProductsChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topProfitProductsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'margen') return [`$${value.toFixed(2)}`, 'Margen'];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="margen" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-400 text-sm">
                  No hay datos
                </div>
              )}
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-white">
              <h3 className="text-lg font-medium">Productos Más Vendidos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-left text-base text-gray-600 font-medium">#</th>
                    <th className="px-5 py-3 text-left text-base text-gray-600 font-medium">Producto</th>
                    <th className="px-5 py-3 text-center text-base text-gray-600 font-medium">Unidades</th>
                    <th className="px-5 py-3 text-right text-base text-gray-600 font-medium">Total Vendido</th>
                    <th className="px-5 py-3 text-right text-base text-gray-600 font-medium">Ganancia Total</th>
                    <th className="px-5 py-3 text-right text-base text-gray-600 font-medium">Margen/Unidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productsSold.slice(0, 10).map((product, index) => (
                    <tr key={index} className="hover:bg-white transition-colors">
                      <td className="px-5 py-3 text-gray-500 text-base">{index + 1}</td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-base">{product.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {product.unitsSold > 0 && `${product.unitsSold} unid.`}
                          {product.unitsSold > 0 && product.packagesSold > 0 && ' • '}
                          {product.packagesSold > 0 && `${product.packagesSold} paq.`}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center text-base">{product.quantity}</td>
                      <td className="px-5 py-3 text-right text-base font-semibold">${product.total.toFixed(2)}</td>
                      <td className="px-5 py-3 text-right text-base font-bold text-green-600">${product.profit.toFixed(2)}</td>
                      <td className="px-5 py-3 text-right text-base font-bold text-emerald-700">${product.profitMargin.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {productsSold.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-base">
                No hay datos para este período
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}