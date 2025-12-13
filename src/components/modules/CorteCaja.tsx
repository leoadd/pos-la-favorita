import { useMemo } from 'react';
import { AppContextType } from '../../App';
import { DollarSign, TrendingUp, CreditCard, Calendar, Printer } from 'lucide-react';

export function CorteCaja({ appContext }: { appContext?: AppContextType }) {
  if (!appContext) return null;
  
  const today = useMemo(() => new Date().toLocaleDateString('es-MX'), []);

  const todaySales = useMemo(() => {
    const todayDate = new Date().toDateString();
    return appContext.sales.filter(
      (sale) => new Date(sale.date).toDateString() === todayDate
    );
  }, [appContext.sales]);

  const totalToday = useMemo(() => {
    return todaySales.reduce((sum, sale) => sum + sale.total, 0);
  }, [todaySales]);

  const totalCash = useMemo(() => {
    return todaySales
      .filter((sale) => sale.paymentMethod === 'Efectivo')
      .reduce((sum, sale) => sum + sale.total, 0);
  }, [todaySales]);

  const totalCard = useMemo(() => {
    return todaySales
      .filter((sale) => sale.paymentMethod === 'Tarjeta')
      .reduce((sum, sale) => sum + sale.total, 0);
  }, [todaySales]);

  const totalTransfer = useMemo(() => {
    return todaySales
      .filter((sale) => sale.paymentMethod === 'Transferencia')
      .reduce((sum, sale) => sum + sale.total, 0);
  }, [todaySales]);

  const allSalesTotal = useMemo(() => {
    return appContext.sales.reduce((sum, sale) => sum + sale.total, 0);
  }, [appContext.sales]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full bg-gray-900 p-4 overflow-hidden">
      <div className="h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl mb-2">Corte de Caja</h2>
                <p className="text-gray-500">Resumen de ventas del día</p>
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:border-black transition-colors"
              >
                <Printer className="w-5 h-5" />
                Imprimir
              </button>
            </div>

            {/* Header Info */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl">La Favorita</h3>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {today}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Usuario: {appContext.currentUser?.name}
              </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-black text-white rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6" />
                  <div className="text-sm opacity-80">Total del Día</div>
                </div>
                <div className="text-4xl mb-2">${totalToday.toFixed(2)}</div>
                <div className="text-sm opacity-80">{todaySales.length} ventas realizadas</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-gray-400" />
                  <div className="text-sm text-gray-500">Total Histórico</div>
                </div>
                <div className="text-4xl mb-2">${allSalesTotal.toFixed(2)}</div>
                <div className="text-sm text-gray-500">{appContext.sales.length} ventas totales</div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 mb-6">
              <h3 className="text-xl mb-6">Ventas en Efectivo</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div>Efectivo</div>
                      <div className="text-sm text-gray-500">
                        {todaySales.length} transacciones
                      </div>
                    </div>
                  </div>
                  <div className="text-xl">${totalToday.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Recent Sales */}
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl">Ventas de Hoy</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm text-gray-500">Hora</th>
                      <th className="px-6 py-3 text-left text-sm text-gray-500">Productos</th>
                      <th className="px-6 py-3 text-left text-sm text-gray-500">Método</th>
                      <th className="px-6 py-3 text-right text-sm text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {todaySales.slice().reverse().map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(sale.date).toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {sale.items.map((item, idx) => (
                              <div key={idx} className="text-gray-600">
                                {item.quantity}x {item.product.name}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{sale.paymentMethod}</td>
                        <td className="px-6 py-4 text-right">${sale.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {todaySales.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No hay ventas registradas hoy
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DollarSign({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}