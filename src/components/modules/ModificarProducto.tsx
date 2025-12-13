import { useState } from 'react';
import { AppContextType, Product } from '../../App';
import { Search, Edit3 } from 'lucide-react';

export function ModificarProducto({ appContext }: { appContext: AppContextType }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    barcode: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredProducts = appContext.products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      barcode: product.barcode || '',
    });
    setSearchTerm('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const updatedProducts = appContext.products.map((p) =>
      p.id === selectedProduct.id
        ? {
            ...p,
            name: formData.name,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            category: formData.category,
            barcode: formData.barcode || undefined,
          }
        : p
    );

    appContext.setProducts(updatedProducts);
    setSelectedProduct(null);
    setFormData({
      name: '',
      price: '',
      stock: '',
      category: '',
      barcode: '',
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl mb-2">Modificar Producto</h2>
          <p className="text-gray-500">Selecciona un producto para editar</p>
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
                onClick={() => selectProduct(product)}
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
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl">Editando Producto</h3>
                <p className="text-gray-500 text-sm">ID: {selectedProduct.id}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block mb-2 text-gray-700">
                  Nombre del Producto *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block mb-2 text-gray-700">
                    Precio *
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="block mb-2 text-gray-700">
                    Stock *
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block mb-2 text-gray-700">
                  Categoría *
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label htmlFor="barcode" className="block mb-2 text-gray-700">
                  Código de Barras (Opcional)
                </label>
                <input
                  id="barcode"
                  name="barcode"
                  type="text"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    setFormData({
                      name: '',
                      price: '',
                      stock: '',
                      category: '',
                      barcode: '',
                    });
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:border-black transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {showSuccess && (
          <div className="mt-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg text-center">
            ¡Producto modificado exitosamente!
          </div>
        )}
      </div>
    </div>
  );
}
