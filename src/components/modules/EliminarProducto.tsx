import { useState } from 'react';
import { AppContextType, Product } from '../../App';
import { Search, Trash2, AlertTriangle } from 'lucide-react';

export function EliminarProducto({ appContext }: { appContext: AppContextType }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredProducts = appContext.products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    if (!selectedProduct || confirmText !== 'ELIMINAR') return;

    const updatedProducts = appContext.products.filter(
      (p) => p.id !== selectedProduct.id
    );

    appContext.setProducts(updatedProducts);
    setSelectedProduct(null);
    setConfirmText('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl mb-2">Eliminar Producto</h2>
          <p className="text-gray-500">Selecciona un producto para eliminar del sistema</p>
        </div>

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
                  setSelectedProduct(product);
                  setSearchTerm('');
                }}
                className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="mb-1">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {product.category} • Stock: {product.stock}
                    </div>
                  </div>
                  <div className="text-gray-400">${product.price.toFixed(2)}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedProduct && (
          <div className="bg-white border-2 border-red-200 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl text-red-600">Advertencia</h3>
                <p className="text-gray-500 text-sm">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="text-sm text-gray-500 mb-2">Producto a eliminar:</div>
              <div className="text-xl mb-3">{selectedProduct.name}</div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Categoría</div>
                  <div>{selectedProduct.category}</div>
                </div>
                <div>
                  <div className="text-gray-500">Precio</div>
                  <div>${selectedProduct.price.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Stock</div>
                  <div>{selectedProduct.stock}</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="confirm" className="block mb-2 text-gray-700">
                Escribe <span className="font-mono bg-gray-100 px-2 py-1 rounded">ELIMINAR</span> para
                confirmar
              </label>
              <input
                id="confirm"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                placeholder="ELIMINAR"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={confirmText !== 'ELIMINAR'}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Eliminar Producto
              </button>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setConfirmText('');
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:border-black transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="mt-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg text-center">
            Producto eliminado exitosamente
          </div>
        )}

        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg mb-4">Información</h3>
          <div className="space-y-2 text-gray-600">
            <p>• Al eliminar un producto, se borrará permanentemente del sistema</p>
            <p>• Las ventas previas que incluyan este producto no se verán afectadas</p>
            <p>• Esta acción no se puede deshacer</p>
            <p>• Total de productos en el sistema: <span className="font-semibold text-black">{appContext.products.length}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
