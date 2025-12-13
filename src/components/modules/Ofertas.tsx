import { useMemo, useState } from 'react';
import { AppContextType, Product } from '../../App';
import { Tag, AlertTriangle, Calendar, DollarSign, Package, Percent, Save } from 'lucide-react';

export function Ofertas({ appContext }: { appContext: AppContextType }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningData, setWarningData] = useState<{
    product: Product;
    newPrice: number;
    costPrice: number;
  } | null>(null);

  // Calcular días hasta la fecha de caducidad
  const getDaysUntilExpiration = (expirationDate?: string) => {
    if (!expirationDate) return null;
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Productos con fecha de caducidad
  const productsWithExpiration = useMemo(() => {
    return appContext.products
      .filter(p => p.expirationDate)
      .map(p => ({
        ...p,
        daysUntilExpiration: getDaysUntilExpiration(p.expirationDate),
      }))
      .sort((a, b) => (a.daysUntilExpiration || 999) - (b.daysUntilExpiration || 999));
  }, [appContext.products]);

  // Productos próximos a vencer (30 días o menos)
  const expiringProducts = useMemo(() => {
    return productsWithExpiration.filter(p => 
      p.daysUntilExpiration !== null && p.daysUntilExpiration <= 30 && p.daysUntilExpiration >= 0
    );
  }, [productsWithExpiration]);

  // Productos ya vencidos
  const expiredProducts = useMemo(() => {
    return productsWithExpiration.filter(p => 
      p.daysUntilExpiration !== null && p.daysUntilExpiration < 0
    );
  }, [productsWithExpiration]);

  // Productos ya en oferta
  const onSaleProducts = useMemo(() => {
    return appContext.products.filter(p => p.isOnSale);
  }, [appContext.products]);

  const handleApplyDiscount = (product: Product) => {
    if (discountPercentage <= 0 || discountPercentage > 100) {
      alert('El descuento debe estar entre 1% y 100%');
      return;
    }

    const discountAmount = product.price * (discountPercentage / 100);
    const newPrice = product.price - discountAmount;

    // Validar que el precio con descuento no sea menor al costo
    if (newPrice < (product.costPrice || 0)) {
      setWarningData({
        product,
        newPrice,
        costPrice: product.costPrice || 0,
      });
      setShowWarningModal(true);
      return;
    }

    const updatedProduct: Product = {
      ...product,
      originalPrice: product.isOnSale ? product.originalPrice : product.price,
      price: newPrice,
      isOnSale: true,
    };

    appContext.setProducts(
      appContext.products.map(p => p.id === product.id ? updatedProduct : p)
    );

    setSelectedProduct(null);
    setDiscountPercentage(0);
  };

  const handleRemoveDiscount = (product: Product) => {
    const updatedProduct: Product = {
      ...product,
      price: product.originalPrice || product.price,
      originalPrice: undefined,
      isOnSale: false,
    };

    appContext.setProducts(
      appContext.products.map(p => p.id === product.id ? updatedProduct : p)
    );
  };

  const getExpirationBadge = (daysUntilExpiration: number | null) => {
    if (daysUntilExpiration === null) return null;
    
    if (daysUntilExpiration < 0) {
      return (
        <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium">
          VENCIDO
        </span>
      );
    } else if (daysUntilExpiration <= 7) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full text-sm font-medium">
          {daysUntilExpiration} días
        </span>
      );
    } else if (daysUntilExpiration <= 15) {
      return (
        <span className="px-3 py-1 bg-orange-100 text-orange-800 border border-orange-300 rounded-full text-sm font-medium">
          {daysUntilExpiration} días
        </span>
      );
    } else if (daysUntilExpiration <= 30) {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-full text-sm font-medium">
          {daysUntilExpiration} días
        </span>
      );
    }
    
    return null;
  };

  return (
    <div className="h-full bg-gray-900 p-4 overflow-hidden">
      <div className="h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl mb-1 tracking-tight">Ofertas y Descuentos</h2>
              <p className="text-gray-500 text-base">Gestión de productos próximos a caducar</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div className="text-sm text-orange-700">Próximos a Vencer</div>
              </div>
              <div className="text-3xl text-orange-900 font-semibold">{expiringProducts.length}</div>
              <div className="text-xs text-orange-700 mt-1">≤ 30 días</div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-red-600" />
                <div className="text-sm text-red-700">Vencidos</div>
              </div>
              <div className="text-3xl text-red-900 font-semibold">{expiredProducts.length}</div>
              <div className="text-xs text-red-700 mt-1">Requieren atención</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="w-5 h-5 text-green-600" />
                <div className="text-sm text-green-700">En Oferta</div>
              </div>
              <div className="text-3xl text-green-900 font-semibold">{onSaleProducts.length}</div>
              <div className="text-xs text-green-700 mt-1">Actualmente con descuento</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Productos Vencidos */}
          {expiredProducts.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl overflow-hidden">
              <div className="p-4 bg-red-100 border-b border-red-300">
                <h3 className="text-lg font-medium text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Productos Vencidos - Retirar Inmediatamente
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-50 border-b border-red-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm text-red-900 font-medium">Producto</th>
                      <th className="px-4 py-3 text-left text-sm text-red-900 font-medium">Categoría</th>
                      <th className="px-4 py-3 text-center text-sm text-red-900 font-medium">Fecha de Caducidad</th>
                      <th className="px-4 py-3 text-center text-sm text-red-900 font-medium">Stock</th>
                      <th className="px-4 py-3 text-right text-sm text-red-900 font-medium">Valor en Riesgo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-200">
                    {expiredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-red-100 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-red-900">{product.name}</div>
                        </td>
                        <td className="px-4 py-3 text-red-800">{product.category}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-sm text-red-800">
                            {product.expirationDate && new Date(product.expirationDate).toLocaleDateString('es-MX')}
                          </div>
                          {getExpirationBadge(product.daysUntilExpiration)}
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-red-900">{product.stock}</td>
                        <td className="px-4 py-3 text-right font-bold text-red-900">
                          ${(product.price * product.stock).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Productos Próximos a Vencer */}
          {expiringProducts.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Productos Próximos a Vencer (30 días o menos)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm text-gray-600 font-medium">Producto</th>
                      <th className="px-4 py-3 text-left text-sm text-gray-600 font-medium">Categoría</th>
                      <th className="px-4 py-3 text-center text-sm text-gray-600 font-medium">Caducidad</th>
                      <th className="px-4 py-3 text-center text-sm text-gray-600 font-medium">Días</th>
                      <th className="px-4 py-3 text-right text-sm text-gray-600 font-medium">Precio</th>
                      <th className="px-4 py-3 text-center text-sm text-gray-600 font-medium">Stock</th>
                      <th className="px-4 py-3 text-center text-sm text-gray-600 font-medium">Estado</th>
                      <th className="px-4 py-3 text-center text-sm text-gray-600 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expiringProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium">{product.name}</div>
                          {product.isOnSale && (
                            <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                              <Tag className="w-3 h-3" />
                              En oferta
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{product.category}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">
                          {product.expirationDate && new Date(product.expirationDate).toLocaleDateString('es-MX')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getExpirationBadge(product.daysUntilExpiration)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {product.isOnSale && product.originalPrice ? (
                            <div>
                              <div className="text-sm text-gray-400 line-through">
                                ${product.originalPrice.toFixed(2)}
                              </div>
                              <div className="font-bold text-green-600">
                                ${product.price.toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <div className="font-medium">${product.price.toFixed(2)}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{product.stock}</td>
                        <td className="px-4 py-3 text-center">
                          {product.isOnSale ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded-full text-xs font-medium">
                              Con oferta
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-xs font-medium">
                              Sin oferta
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {product.isOnSale ? (
                              <button
                                onClick={() => handleRemoveDiscount(product)}
                                className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                              >
                                <Tag className="w-3 h-3" />
                                Quitar Oferta
                              </button>
                            ) : (
                              <button
                                onClick={() => setSelectedProduct(product)}
                                className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                              >
                                <Percent className="w-3 h-3" />
                                Poner en Oferta
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Productos en Oferta Activa */}
          {onSaleProducts.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Tag className="w-5 h-5 text-green-600" />
                  Productos Actualmente en Oferta
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm text-gray-600 font-medium">Producto</th>
                      <th className="px-4 py-3 text-right text-sm text-gray-600 font-medium">Precio Original</th>
                      <th className="px-4 py-3 text-right text-sm text-gray-600 font-medium">Precio en Oferta</th>
                      <th className="px-4 py-3 text-center text-sm text-gray-600 font-medium">Descuento</th>
                      <th className="px-4 py-3 text-center text-sm text-gray-600 font-medium">Stock</th>
                      <th className="px-4 py-3 text-center text-sm text-gray-600 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {onSaleProducts.map((product) => {
                      const discountPercent = product.originalPrice 
                        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                        : 0;
                      
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.category}</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-gray-400 line-through">
                              ${(product.originalPrice || product.price).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-bold text-green-600 text-lg">
                              ${product.price.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold">
                              -{discountPercent}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-medium">{product.stock}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleRemoveDiscount(product)}
                              className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
                            >
                              Quitar Oferta
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sin productos para mostrar */}
          {expiringProducts.length === 0 && expiredProducts.length === 0 && onSaleProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <Tag className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-500 text-base">No hay productos próximos a vencer ni ofertas activas</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Aplicar Descuento */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Percent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-green-900">Aplicar Descuento</h3>
                  <p className="text-sm text-green-700">{selectedProduct.name}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio actual:</span>
                    <span className="font-bold text-lg">${selectedProduct.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock disponible:</span>
                    <span className="font-medium">{selectedProduct.stock} unidades</span>
                  </div>
                  {selectedProduct.expirationDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Caduca en:</span>
                      {getExpirationBadge(getDaysUntilExpiration(selectedProduct.expirationDate))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  Porcentaje de Descuento
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={discountPercentage || ''}
                    onChange={(e) => setDiscountPercentage(parseInt(e.target.value) || 0)}
                    className="flex-1 px-4 py-3 text-lg font-medium bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-green-600"
                    placeholder="0"
                    autoFocus
                  />
                  <span className="text-2xl font-bold text-gray-700">%</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[10, 20, 30, 50].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => setDiscountPercentage(percent)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              </div>

              {discountPercentage > 0 && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="text-green-900 font-medium mb-2">Nuevo precio:</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500 line-through">
                        ${selectedProduct.price.toFixed(2)}
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        ${(selectedProduct.price * (1 - discountPercentage / 100)).toFixed(2)}
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-xl">
                      -{discountPercentage}%
                    </div>
                  </div>
                  <div className="text-sm text-green-700 mt-2">
                    Ahorro por unidad: ${(selectedProduct.price * (discountPercentage / 100)).toFixed(2)}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleApplyDiscount(selectedProduct)}
                  disabled={discountPercentage <= 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 rounded-xl hover:shadow-lg transition-all text-base font-medium disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  Aplicar Descuento
                </button>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setDiscountPercentage(0);
                  }}
                  className="px-6 bg-gray-100 text-gray-700 py-3.5 rounded-xl hover:bg-gray-200 transition-all text-base font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Advertencia */}
      {showWarningModal && warningData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-red-50 to-red-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-red-900">Advertencia</h3>
                  <p className="text-sm text-red-700">Venta con pérdida</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 rounded-xl p-5 border-2 border-red-300">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-900 font-medium text-base leading-relaxed">
                      El precio con descuento (<span className="font-bold">${warningData.newPrice.toFixed(2)}</span>) 
                      es menor al costo de compra (<span className="font-bold">${warningData.costPrice.toFixed(2)}</span>).
                    </p>
                    <p className="text-red-800 mt-2 text-sm">
                      Aún puedes aplicar el descuento, pero estarás vendiendo con pérdida.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="text-gray-700 font-medium mb-3">Detalle del Producto:</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Producto:</span>
                    <span className="font-medium">{warningData.product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio actual:</span>
                    <span className="font-bold text-lg">${warningData.product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio con descuento:</span>
                    <span className="font-bold text-lg text-green-600">${warningData.newPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 pt-2">
                    <span className="text-gray-600">Costo de compra:</span>
                    <span className="font-bold text-lg text-red-600">${warningData.costPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between bg-red-100 -mx-4 -mb-4 px-4 py-3 mt-3 rounded-b-xl border-t-2 border-red-300">
                    <span className="text-red-900 font-medium">Pérdida por unidad:</span>
                    <span className="font-bold text-lg text-red-900">
                      -${(warningData.costPrice - warningData.newPrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    const updatedProduct: Product = {
                      ...warningData.product,
                      originalPrice: warningData.product.isOnSale ? warningData.product.originalPrice : warningData.product.price,
                      price: warningData.newPrice,
                      isOnSale: true,
                    };

                    appContext.setProducts(
                      appContext.products.map(p => p.id === warningData.product.id ? updatedProduct : p)
                    );

                    setSelectedProduct(null);
                    setDiscountPercentage(0);
                    setShowWarningModal(false);
                    setWarningData(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl hover:shadow-lg transition-all text-base font-medium"
                >
                  <Save className="w-5 h-5" />
                  Aplicar de Todas Formas
                </button>
                <button
                  onClick={() => {
                    setShowWarningModal(false);
                    setWarningData(null);
                  }}
                  className="px-6 bg-gray-100 text-gray-700 py-3.5 rounded-xl hover:bg-gray-200 transition-all text-base font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}