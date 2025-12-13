import { useState } from 'react';
import { AppContextType } from '../../App';
import { Search, Plus } from 'lucide-react';

export function AgregarStock({ appContext }: { appContext: AppContextType }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredProducts = appContext.products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStock = () => {
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) return;

    const updatedProducts = appContext.products.map((p) =>
      p.id === selectedProduct
        ? { ...p, stock: p.stock + parseInt(quantity) }
        : p
    );

    appContext.setProducts(updatedProducts);
    setSelectedProduct(null);
    setQuantity('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-3xl mb-8">Agregar Stock</h2>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <label className="block mb-2 text-gray-700">Buscar Producto</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {searchTerm && (
          <div className="bg-white border border-gray-200 rounded-lg mb-6 max-h-64 overflow-y-auto">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product.id);
                  setSearchTerm('');
                }}
                className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="mb-1">{product.name}</div>
                    <div className="text-sm text-gray-500">Stock actual: {product.stock}</div>
                  </div>
                  <div className="text-gray-400">${product.price.toFixed(2)}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedProduct && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Producto seleccionado</div>
              <div className="text-xl">
                {appContext.products.find((p) => p.id === selectedProduct)?.name}
              </div>
              <div className="text-gray-500">
                Stock actual: {appContext.products.find((p) => p.id === selectedProduct)?.stock}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="quantity" className="block mb-2 text-gray-700">
                Cantidad a agregar
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                placeholder="Ingresa la cantidad"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddStock}
                disabled={!quantity || parseInt(quantity) <= 0}
                className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Agregar Stock
              </button>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setQuantity('');
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:border-black transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
            ¡Stock agregado exitosamente!
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg mb-4">Productos con Stock Bajo</h3>
          <div className="space-y-2">
            {appContext.products
              .filter((p) => p.stock < 20)
              .map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center p-3 bg-white rounded-lg"
                >
                  <div>
                    <div>{product.name}</div>
                    <div className="text-sm text-red-600">Stock: {product.stock}</div>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(product.id)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:border-black transition-colors text-sm"
                  >
                    Agregar
                  </button>
                </div>
              ))}
            {appContext.products.filter((p) => p.stock < 20).length === 0 && (
              <div className="text-gray-500 text-center py-4">
                No hay productos con stock bajo
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
