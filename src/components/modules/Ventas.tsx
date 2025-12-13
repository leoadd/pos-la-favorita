import { useState } from 'react';
import { AppContextType, Product } from '../../App';
import { Plus, Minus, Trash2, Search, ShoppingCart, Percent, DollarSign, Package, Printer, X } from 'lucide-react';

type CartItem = {
  product: Product;
  quantity: number;
  sellByPackage: boolean;
  discount: number;
};

export function Ventas({ appContext }: { appContext: AppContextType }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastSale, setLastSale] = useState<any>(null);

  const filteredProducts = appContext.products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = (product: Product, byPackage: boolean = false) => {
    const existingItem = cart.find((item) => item.product.id === product.id && item.sellByPackage === byPackage);
    if (existingItem) {
      const unitsToAdd = byPackage ? (product.unitsPerPackage || 1) : 1;
      if (existingItem.quantity * (byPackage ? (product.unitsPerPackage || 1) : 1) + unitsToAdd <= product.stock) {
        setCart(
          cart.map((item) =>
            item.product.id === product.id && item.sellByPackage === byPackage
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      }
    } else {
      const unitsNeeded = byPackage ? (product.unitsPerPackage || 1) : 1;
      if (product.stock >= unitsNeeded) {
        setCart([...cart, { product, quantity: 1, sellByPackage: byPackage, discount: 0 }]);
      }
    }
  };

  const updateQuantity = (productId: string, delta: number, sellByPackage: boolean) => {
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.product.id === productId && i.sellByPackage === sellByPackage);
      if (!item) return prevCart;

      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        return prevCart.filter((i) => !(i.product.id === productId && i.sellByPackage === sellByPackage));
      }
      
      const unitsPerItem = sellByPackage ? (item.product.unitsPerPackage || 1) : 1;
      if (newQuantity * unitsPerItem > item.product.stock) {
        return prevCart;
      }

      return prevCart.map((i) =>
        i.product.id === productId && i.sellByPackage === sellByPackage 
          ? { ...i, quantity: newQuantity } 
          : i
      );
    });
  };

  const updateDiscount = (productId: string, sellByPackage: boolean, discount: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && item.sellByPackage === sellByPackage
          ? { ...item, discount: Math.max(0, Math.min(100, discount)) }
          : item
      )
    );
  };

  const removeFromCart = (productId: string, sellByPackage: boolean) => {
    setCart(cart.filter((item) => !(item.product.id === productId && item.sellByPackage === sellByPackage)));
  };

  const calculateItemPrice = (item: CartItem) => {
    const basePrice = item.sellByPackage && item.product.priceWholesale
      ? item.product.priceWholesale
      : item.product.price * (item.sellByPackage ? (item.product.unitsPerPackage || 1) : 1);
    
    const discountAmount = basePrice * (item.discount / 100);
    return (basePrice - discountAmount) * item.quantity;
  };

  const subtotal = cart.reduce((sum, item) => sum + calculateItemPrice(item), 0);
  const total = subtotal;
  const change = amountPaid ? Math.max(0, parseFloat(amountPaid) - total) : 0;

  const completeSale = () => {
    if (cart.length === 0) return;
    
    if (!amountPaid || parseFloat(amountPaid) < total) {
      const paid = parseFloat(amountPaid) || 0;
      const missing = total - paid;
      setErrorMessage(`Faltan $${missing.toFixed(2)} para completar el pago`);
      setShowErrorModal(true);
      return;
    }

    const sale = {
      id: Date.now().toString(),
      date: new Date(),
      items: cart.map(item => ({
        product: item.product,
        quantity: item.quantity * (item.sellByPackage ? (item.product.unitsPerPackage || 1) : 1),
        discount: item.discount,
      })),
      total,
      paymentMethod: 'Efectivo',
      amountPaid: parseFloat(amountPaid) || total,
      change,
    };

    const updatedProducts = appContext.products.map((p) => {
      const totalUnits = cart
        .filter((item) => item.product.id === p.id)
        .reduce((sum, item) => {
          const unitsPerItem = item.sellByPackage ? (item.product.unitsPerPackage || 1) : 1;
          return sum + (item.quantity * unitsPerItem);
        }, 0);
      
      if (totalUnits > 0) {
        return { ...p, stock: p.stock - totalUnits };
      }
      return p;
    });

    appContext.setProducts(updatedProducts);
    appContext.setSales([...appContext.sales, sale]);
    setCart([]);
    setAmountPaid('');
    setLastSale(sale);
    setShowPrintModal(true);
  };

  return (
    <div className="h-full bg-gray-900 p-4 overflow-hidden">
      <div className="h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        {/* Products Section */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-3xl mb-4 tracking-tight">Punto de Venta</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o código de barras..."
                className="w-full pl-12 pr-4 py-3.5 text-base bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product, index) => {
                const colors = [
                  'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
                  'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
                  'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200',
                  'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
                ];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div key={product.id} className={`rounded-2xl border ${colorClass} overflow-hidden ${product.stock === 0 ? 'opacity-50' : ''}`}>
                    <button
                      onClick={() => addToCart(product, false)}
                      disabled={product.stock === 0}
                      className="w-full p-4 text-left hover:shadow-lg transition-all duration-200"
                    >
                      <div className="text-base mb-2 line-clamp-2 font-medium">{product.name}</div>
                      <div className="text-2xl mb-2">${product.price.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Stock: {product.stock}</div>
                      {product.unitType !== 'unit' && (
                        <div className="text-xs text-gray-500 mt-1">
                          {product.unitsPerPackage} uds/{product.unitType === 'package' ? 'paquete' : 'caja'}
                        </div>
                      )}
                    </button>
                    
                    {product.unitType !== 'unit' && product.priceWholesale && product.stock >= (product.unitsPerPackage || 1) && (
                      <button
                        onClick={() => addToCart(product, true)}
                        className="w-full px-4 py-2.5 bg-white/50 backdrop-blur-sm border-t border-gray-200 hover:bg-white transition-all flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>Mayoreo</span>
                        </div>
                        <span className="font-medium">${product.priceWholesale.toFixed(2)}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-[420px] bg-gray-50 border-l border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200 bg-white">
            <h3 className="text-xl tracking-tight">Carrito</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 mt-12">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 opacity-30" />
                </div>
                <p className="text-base">Carrito vacío</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, idx) => {
                  const itemTotal = calculateItemPrice(item);
                  const unitLabel = item.sellByPackage 
                    ? (item.product.unitType === 'package' ? 'paquete' : 'caja') 
                    : 'unidad';
                  
                  return (
                    <div key={`${item.product.id}-${item.sellByPackage}-${idx}`} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="text-base mb-1 font-medium">{item.product.name}</div>
                          <div className="text-xs text-gray-500">
                            {item.sellByPackage ? `${item.product.unitsPerPackage} uds/${unitLabel}` : 'Por unidad'}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.sellByPackage)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mb-3 flex items-center gap-2">
                        <Percent className="w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) => updateDiscount(item.product.id, item.sellByPackage, parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                          placeholder="0"
                        />
                        <span className="text-xs text-gray-500">% desc</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1, item.sellByPackage)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-900 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center text-base font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1, item.sellByPackage)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-900 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-lg font-semibold">
                          ${itemTotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 space-y-3 bg-white">
            {cart.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="Monto recibido en efectivo"
                    className="flex-1 px-3 py-2.5 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all"
                  />
                </div>
                {amountPaid && parseFloat(amountPaid) >= total && (
                  <div className="text-right text-green-600 font-medium text-base">
                    Cambio: ${change.toFixed(2)}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center text-2xl pt-3 border-t border-gray-200">
              <span>Total</span>
              <span className="font-bold">${total.toFixed(2)}</span>
            </div>

            <button
              onClick={completeSale}
              disabled={cart.length === 0}
              className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white text-base py-3.5 rounded-xl hover:shadow-lg transition-all duration-200 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed font-medium"
            >
              Completar Venta
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Impresión */}
      {showPrintModal && lastSale && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-green-900">¡Venta Completada!</h3>
                    <p className="text-sm text-green-700">Cambio: ${lastSale.change.toFixed(2)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-center text-base text-gray-700 mb-6">
                ¿Deseas imprimir el ticket de venta?
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    window.print();
                    setShowPrintModal(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3.5 rounded-xl hover:shadow-lg transition-all text-base font-medium"
                >
                  <Printer className="w-5 h-5" />
                  Sí, Imprimir Ticket
                </button>

                <button
                  onClick={() => setShowPrintModal(false)}
                  className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl hover:bg-gray-200 transition-all text-base font-medium"
                >
                  No, Continuar sin Imprimir
                </button>
              </div>

              {/* Preview del ticket */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-center mb-3">
                  <p className="font-medium">La Favorita</p>
                  <p className="text-xs text-gray-500">
                    {new Date(lastSale.date).toLocaleString('es-MX')}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  {lastSale.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-gray-600">{item.quantity}x {item.product.name}</span>
                      <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-300 pt-2 flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${lastSale.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Pagado:</span>
                    <span>${lastSale.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Cambio:</span>
                    <span>${lastSale.change.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Error */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-red-50 to-red-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-red-900">Pago Insuficiente</h3>
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total a pagar:</span>
                    <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monto recibido:</span>
                    <span className="text-lg font-medium text-gray-700">${(parseFloat(amountPaid) || 0).toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Falta:</span>
                      <span className="text-xl font-bold text-red-600">${(total - (parseFloat(amountPaid) || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3.5 rounded-xl hover:shadow-lg transition-all text-base font-medium"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}