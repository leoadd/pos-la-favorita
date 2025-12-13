import { useState } from 'react';
import { AppContextType } from '../../App';
import { Package } from 'lucide-react';

export function ProductoNuevo({ appContext }: { appContext: AppContextType }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    barcode: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct = {
      id: Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      barcode: formData.barcode || undefined,
    };

    appContext.setProducts([...appContext.products, newProduct]);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl mb-2">Producto Nuevo</h2>
          <p className="text-gray-500">Agrega un nuevo producto al inventario</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400" />
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
                placeholder="Ej: Coca-Cola 600ml"
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
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label htmlFor="stock" className="block mb-2 text-gray-700">
                  Stock Inicial *
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  placeholder="0"
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
                placeholder="Ej: Bebidas, Granos, Lácteos"
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
                placeholder="Ej: 1234567890123"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Crear Producto
            </button>

            {showSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg text-center">
                ¡Producto creado exitosamente!
              </div>
            )}
          </form>
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg mb-4">Últimos Productos Agregados</h3>
          <div className="space-y-3">
            {appContext.products.slice(-5).reverse().map((product) => (
              <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div>{product.name}</div>
                  <div className="text-sm text-gray-500">{product.category}</div>
                </div>
                <div className="text-right">
                  <div>${product.price.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">Stock: {product.stock}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
