import { useMemo, useState } from 'react';
import { AppContextType, Product } from '../../App';
import { Package, TrendingUp, TrendingDown, DollarSign, Search, Filter, Plus, Edit3, Trash2, X, PackagePlus } from 'lucide-react';

type ProductForm = {
  id?: string;
  name: string;
  costPrice: number; // Precio de compra
  price: number; // Precio de venta
  priceWholesale: number;
  stock: number;
  category: string;
  barcode: string;
  unitType: 'unit' | 'package' | 'box';
  unitsPerPackage: number;
  stockInPackages: number; // Para ingresar stock por paquetes/cajas
  expirationDate: string; // Fecha de caducidad opcional
};

export function Inventario({ appContext }: { appContext: AppContextType }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [showForm, setShowForm] = useState(false);
  const [showStockEntry, setShowStockEntry] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockEntryAmount, setStockEntryAmount] = useState(0);
  const [stockEntryExpirationDate, setStockEntryExpirationDate] = useState('');
  const [stockEntryCreateNew, setStockEntryCreateNew] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    costPrice: 0,
    price: 0,
    priceWholesale: 0,
    stock: 0,
    category: '',
    barcode: '',
    unitType: 'unit',
    unitsPerPackage: 1,
    stockInPackages: 0,
    expirationDate: '',
  });

  const categories = useMemo(() => {
    const cats = new Set(appContext.products.map((p) => p.category));
    return Array.from(cats);
  }, [appContext.products]);

  const filteredProducts = useMemo(() => {
    let products = appContext.products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    products.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return b.price - a.price;
      if (sortBy === 'stock') return b.stock - a.stock;
      return 0;
    });

    return products;
  }, [appContext.products, searchTerm, filterCategory, sortBy]);

  const totalStock = useMemo(() => {
    return appContext.products.reduce((sum, p) => sum + p.stock, 0);
  }, [appContext.products]);

  const totalValue = useMemo(() => {
    return appContext.products.reduce((sum, p) => sum + p.price * p.stock, 0);
  }, [appContext.products]);

  const lowStock = useMemo(() => {
    return appContext.products.filter((p) => p.stock < 20 && p.stock > 0).length;
  }, [appContext.products]);

  const handleOpenForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        id: product.id,
        name: product.name,
        costPrice: product.costPrice || 0,
        price: product.price,
        priceWholesale: product.priceWholesale || 0,
        stock: product.stock,
        category: product.category,
        barcode: product.barcode || '',
        unitType: product.unitType,
        unitsPerPackage: product.unitsPerPackage || 1,
        stockInPackages: product.unitType !== 'unit' ? Math.floor(product.stock / (product.unitsPerPackage || 1)) : product.stock,
        expirationDate: product.expirationDate || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        costPrice: 0,
        price: 0,
        priceWholesale: 0,
        stock: 0,
        category: '',
        barcode: '',
        unitType: 'unit',
        unitsPerPackage: 1,
        stockInPackages: 0,
        expirationDate: '',
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calcular stock en unidades
    const totalUnits = formData.unitType === 'unit' 
      ? formData.stockInPackages 
      : formData.stockInPackages * formData.unitsPerPackage;

    const productData: Product = {
      id: formData.id || Date.now().toString(),
      name: formData.name,
      costPrice: formData.costPrice,
      price: formData.price,
      priceWholesale: formData.unitType !== 'unit' && formData.priceWholesale > 0 ? formData.priceWholesale : undefined,
      stock: totalUnits,
      category: formData.category,
      barcode: formData.barcode || undefined,
      unitType: formData.unitType,
      unitsPerPackage: formData.unitType !== 'unit' ? formData.unitsPerPackage : undefined,
      expirationDate: formData.expirationDate || undefined,
    };

    if (editingProduct) {
      // Actualizar producto existente
      appContext.setProducts(
        appContext.products.map((p) => (p.id === editingProduct.id ? productData : p))
      );
    } else {
      // Agregar nuevo producto
      appContext.setProducts([...appContext.products, productData]);
    }

    handleCloseForm();
  };

  const handleDelete = (productId: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      appContext.setProducts(appContext.products.filter((p) => p.id !== productId));
    }
  };

  const handleOpenStockEntry = (product: Product) => {
    setSelectedProduct(product);
    setStockEntryAmount(0);
    setStockEntryExpirationDate('');
    setStockEntryCreateNew(false);
    setShowStockEntry(true);
  };

  const handleCloseStockEntry = () => {
    setShowStockEntry(false);
    setSelectedProduct(null);
  };

  const handleAddStock = () => {
    if (selectedProduct) {
      const totalUnits = selectedProduct.unitType === 'unit' 
        ? stockEntryAmount 
        : stockEntryAmount * (selectedProduct.unitsPerPackage || 1);

      // Si tiene fecha de caducidad diferente y el usuario marca "crear nuevo lote"
      if (stockEntryCreateNew && stockEntryExpirationDate && stockEntryExpirationDate !== selectedProduct.expirationDate) {
        // Crear un nuevo producto con la misma información pero diferente fecha de caducidad
        const newProduct: Product = {
          ...selectedProduct,
          id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
          stock: totalUnits,
          expirationDate: stockEntryExpirationDate,
        };
        
        appContext.setProducts([...appContext.products, newProduct]);
      } else {
        // Actualizar el producto existente
        const updatedProduct: Product = {
          ...selectedProduct,
          stock: selectedProduct.stock + totalUnits,
          expirationDate: stockEntryExpirationDate || selectedProduct.expirationDate,
        };

        appContext.setProducts(
          appContext.products.map((p) => (p.id === selectedProduct.id ? updatedProduct : p))
        );
      }

      handleCloseStockEntry();
    }
  };

  return (
    <div className="h-full bg-gray-900 p-4 overflow-hidden">
      <div className="h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl mb-1 tracking-tight">Inventario</h2>
              <p className="text-gray-500 text-base">Gestión de productos</p>
            </div>
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-2 px-5 py-2.5 text-base bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Nuevo Producto
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-5 h-5 text-purple-600" />
                <div className="text-sm text-purple-700">Productos</div>
              </div>
              <div className="text-3xl text-purple-900 font-semibold">{appContext.products.length}</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div className="text-sm text-green-700">Unidades</div>
              </div>
              <div className="text-3xl text-green-900 font-semibold">{totalStock}</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <div className="text-sm text-blue-700">Valor Total</div>
              </div>
              <div className="text-3xl text-blue-900 font-semibold">${totalValue.toFixed(2)}</div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <div className="text-sm text-red-700">Stock Bajo</div>
              </div>
              <div className="text-3xl text-red-900 font-semibold">{lowStock}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-3 py-2.5 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 appearance-none transition-all"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'stock')}
              className="px-3 py-2.5 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all"
            >
              <option value="name">Ordenar por Nombre</option>
              <option value="price">Ordenar por Precio</option>
              <option value="stock">Ordenar por Stock</option>
            </select>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                <h3 className="text-2xl font-medium">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <button
                  onClick={handleCloseForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div className="col-span-2">
                    <label className="block mb-2 text-gray-700 font-medium">Nombre del Producto *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                      required
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block mb-2 text-gray-700 font-medium">Categoría *</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                      placeholder="ej: Bebidas, Lácteos, etc."
                      required
                    />
                  </div>

                  {/* Código de Barras */}
                  <div>
                    <label className="block mb-2 text-gray-700 font-medium">Código de Barras</label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                      placeholder="Opcional"
                    />
                  </div>

                  {/* Tipo de Venta */}
                  <div className="col-span-2">
                    <label className="block mb-2 text-gray-700 font-medium">Tipo de Venta *</label>
                    <select
                      value={formData.unitType}
                      onChange={(e) => {
                        const newType = e.target.value as 'unit' | 'package' | 'box';
                        setFormData({ 
                          ...formData, 
                          unitType: newType,
                          unitsPerPackage: newType === 'unit' ? 1 : formData.unitsPerPackage,
                          priceWholesale: newType === 'unit' ? 0 : formData.priceWholesale,
                        });
                      }}
                      className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                    >
                      <option value="unit">Por Unidad (ventas individuales)</option>
                      <option value="package">Por Paquete (con opción mayoreo)</option>
                      <option value="box">Por Caja (con opción mayoreo)</option>
                    </select>
                  </div>

                  {/* Unidades por Paquete/Caja */}
                  {formData.unitType !== 'unit' && (
                    <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <label className="block mb-2 text-blue-900 font-medium">
                        ¿Cuántas unidades tiene cada {formData.unitType === 'package' ? 'paquete' : 'caja'}? *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.unitsPerPackage}
                        onChange={(e) => setFormData({ ...formData, unitsPerPackage: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2.5 text-base bg-white border border-blue-300 rounded-xl focus:outline-none focus:border-blue-600"
                        placeholder="ej: 12 botellas por paquete"
                        required
                      />
                      <p className="text-sm text-blue-700 mt-2">
                        Ejemplo: Si vendes agua en paquetes de 12 botellas, ingresa 12
                      </p>
                    </div>
                  )}

                  {/* Precio de Compra */}
                  <div>
                    <label className="block mb-2 text-gray-700 font-medium">
                      Precio de Compra *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-8 pr-4 py-2.5 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Precio al que adquieres el producto</p>
                  </div>

                  {/* Precio por Unidad */}
                  <div>
                    <label className="block mb-2 text-gray-700 font-medium">
                      Precio por Unidad *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-8 pr-4 py-2.5 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Precio de venta individual</p>
                  </div>

                  {/* Precio de Mayoreo */}
                  {formData.unitType !== 'unit' && (
                    <div>
                      <label className="block mb-2 text-gray-700 font-medium">
                        Precio por {formData.unitType === 'package' ? 'Paquete' : 'Caja'} (Mayoreo)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.priceWholesale}
                          onChange={(e) => setFormData({ ...formData, priceWholesale: parseFloat(e.target.value) || 0 })}
                          className="w-full pl-8 pr-4 py-2.5 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Precio cuando se vende el {formData.unitType === 'package' ? 'paquete' : 'caja'} completo</p>
                    </div>
                  )}

                  {/* Stock Inicial */}
                  <div className="col-span-2 bg-green-50 border border-green-200 rounded-xl p-4">
                    <label className="block mb-2 text-green-900 font-medium">
                      Stock Inicial - Ingresar en {formData.unitType === 'unit' ? 'Unidades' : formData.unitType === 'package' ? 'Paquetes' : 'Cajas'} *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stockInPackages}
                      onChange={(e) => setFormData({ ...formData, stockInPackages: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 text-base bg-white border border-green-300 rounded-xl focus:outline-none focus:border-green-600"
                      placeholder={formData.unitType === 'unit' ? 'ej: 50 unidades' : formData.unitType === 'package' ? 'ej: 8 paquetes' : 'ej: 5 cajas'}
                      required
                    />
                    {formData.unitType !== 'unit' && formData.stockInPackages > 0 && (
                      <p className="text-sm text-green-700 mt-2 font-medium">
                        = {formData.stockInPackages * formData.unitsPerPackage} unidades totales
                        ({formData.stockInPackages} {formData.unitType === 'package' ? 'paquetes' : 'cajas'} × {formData.unitsPerPackage} unidades)
                      </p>
                    )}
                  </div>

                  {/* Fecha de Caducidad */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <label className="block mb-2 text-red-900 font-medium text-lg">
                      Fecha de Caducidad (Opcional)
                    </label>
                    <input
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                      className="w-full px-4 py-3 text-lg bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-600"
                    />
                    <p className="text-sm text-red-700 mt-2 font-medium">
                      Ingrese la fecha de caducidad si es aplicable
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3 text-base rounded-xl hover:shadow-lg transition-all font-medium"
                  >
                    {editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-8 py-3 text-base border border-gray-300 rounded-xl hover:border-gray-900 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stock Entry Modal */}
        {showStockEntry && selectedProduct && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-2xl font-medium">Entrada de Mercancía</h3>
                  <p className="text-gray-500 text-sm mt-1">{selectedProduct.name}</p>
                </div>
                <button
                  onClick={handleCloseStockEntry}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Info del Producto */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Categoría:</span>
                      <span className="ml-2 font-medium">{selectedProduct.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tipo:</span>
                      <span className="ml-2 font-medium">
                        {selectedProduct.unitType === 'unit' ? 'Unidad' : selectedProduct.unitType === 'package' ? 'Paquete' : 'Caja'}
                        {selectedProduct.unitsPerPackage && ` (${selectedProduct.unitsPerPackage} uds)`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Stock Actual:</span>
                      <span className="ml-2 font-semibold text-lg">
                        {selectedProduct.stock} unidades
                      </span>
                      {selectedProduct.unitType !== 'unit' && selectedProduct.unitsPerPackage && (
                        <span className="text-gray-500 text-xs ml-1">
                          ({Math.floor(selectedProduct.stock / selectedProduct.unitsPerPackage)} {selectedProduct.unitType === 'package' ? 'paquetes' : 'cajas'})
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-600">Precio:</span>
                      <span className="ml-2 font-medium">${selectedProduct.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Cantidad a Agregar */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <label className="block mb-2 text-green-900 font-medium text-lg">
                    Cantidad a Agregar en {selectedProduct.unitType === 'unit' ? 'Unidades' : selectedProduct.unitType === 'package' ? 'Paquetes' : 'Cajas'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stockEntryAmount || ''}
                    onChange={(e) => setStockEntryAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 text-lg bg-white border border-green-300 rounded-xl focus:outline-none focus:border-green-600"
                    placeholder={selectedProduct.unitType === 'unit' ? 'ej: 50 unidades' : selectedProduct.unitType === 'package' ? 'ej: 8 paquetes' : 'ej: 5 cajas'}
                    autoFocus
                  />
                  {selectedProduct.unitType !== 'unit' && selectedProduct.unitsPerPackage && stockEntryAmount > 0 && (
                    <p className="text-sm text-green-700 mt-2 font-medium">
                      = {stockEntryAmount * selectedProduct.unitsPerPackage} unidades
                      ({stockEntryAmount} {selectedProduct.unitType === 'package' ? 'paquetes' : 'cajas'} × {selectedProduct.unitsPerPackage} unidades)
                    </p>
                  )}
                </div>

                {/* Fecha de Caducidad */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <label className="block mb-2 text-red-900 font-medium text-lg">
                    Fecha de Caducidad (Opcional)
                  </label>
                  <input
                    type="date"
                    value={stockEntryExpirationDate}
                    onChange={(e) => setStockEntryExpirationDate(e.target.value)}
                    className="w-full px-4 py-3 text-lg bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-600"
                  />
                  {selectedProduct.expirationDate && (
                    <p className="text-sm text-red-700 mt-2">
                      Fecha actual: {new Date(selectedProduct.expirationDate).toLocaleDateString('es-MX')}
                    </p>
                  )}
                  
                  {/* Opción para crear nuevo lote */}
                  {stockEntryExpirationDate && stockEntryExpirationDate !== selectedProduct.expirationDate && (
                    <div className="mt-3 pt-3 border-t border-red-300">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={stockEntryCreateNew}
                          onChange={(e) => setStockEntryCreateNew(e.target.checked)}
                          className="w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-red-900 font-medium">
                          Crear nuevo lote con diferente fecha de caducidad
                        </span>
                      </label>
                      <p className="text-xs text-red-700 mt-1 ml-6">
                        {stockEntryCreateNew 
                          ? '✓ Se creará una nueva entrada del producto con esta fecha de caducidad'
                          : 'Se actualizará la fecha del producto existente'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Resumen */}
                {stockEntryAmount > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="text-blue-900 font-medium mb-2">Resumen:</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Stock actual:</span>
                        <span className="font-medium">{selectedProduct.stock} unidades</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Agregar:</span>
                        <span className="font-medium">
                          {selectedProduct.unitType === 'unit' 
                            ? stockEntryAmount 
                            : stockEntryAmount * (selectedProduct.unitsPerPackage || 1)} unidades
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-blue-300">
                        <span className="text-blue-900 font-semibold">Stock nuevo:</span>
                        <span className="font-bold text-lg">
                          {selectedProduct.stock + (selectedProduct.unitType === 'unit' 
                            ? stockEntryAmount 
                            : stockEntryAmount * (selectedProduct.unitsPerPackage || 1))} unidades
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAddStock}
                    disabled={stockEntryAmount <= 0}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 text-base rounded-xl hover:shadow-lg transition-all font-medium disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed"
                  >
                    Confirmar Entrada
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseStockEntry}
                    className="px-8 py-3 text-base border border-gray-300 rounded-xl hover:border-gray-900 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-base text-gray-600 font-medium">Producto</th>
                <th className="px-6 py-3 text-left text-base text-gray-600 font-medium">Categoría</th>
                <th className="px-6 py-3 text-left text-base text-gray-600 font-medium">Tipo</th>
                <th className="px-6 py-3 text-right text-base text-gray-600 font-medium">Precio</th>
                <th className="px-6 py-3 text-right text-base text-gray-600 font-medium">Stock</th>
                <th className="px-6 py-3 text-right text-base text-gray-600 font-medium">Valor</th>
                <th className="px-6 py-3 text-center text-base text-gray-600 font-medium">Estado</th>
                <th className="px-6 py-3 text-center text-base text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => {
                const stockStatus =
                  product.stock === 0
                    ? 'Sin stock'
                    : product.stock < 20
                    ? 'Bajo'
                    : 'Normal';
                const stockColor =
                  product.stock === 0
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : product.stock < 20
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-green-100 text-green-800 border border-green-200';

                // Calcular si está próximo a vencer (30 días o menos)
                let isNearExpiration = false;
                let daysUntilExpiration = 0;
                if (product.expirationDate) {
                  const today = new Date();
                  const expDate = new Date(product.expirationDate);
                  daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  isNearExpiration = daysUntilExpiration <= 30;
                }

                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-base font-medium">{product.name}</div>
                      {product.barcode && (
                        <div className="text-sm text-gray-500">{product.barcode}</div>
                      )}
                      {product.expirationDate && (
                        <div className={`text-xs mt-1 font-medium ${isNearExpiration ? 'text-red-600' : 'text-green-600'}`}>
                          Cad: {new Date(product.expirationDate).toLocaleDateString('es-MX')}
                          {isNearExpiration && daysUntilExpiration > 0 && (
                            <span className="ml-1">({daysUntilExpiration} días)</span>
                          )}
                          {daysUntilExpiration <= 0 && (
                            <span className="ml-1 font-bold">(¡VENCIDO!)</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-base">{product.category}</td>
                    <td className="px-6 py-4 text-base">
                      <div>
                        {product.unitType === 'unit' ? 'Unidad' : product.unitType === 'package' ? 'Paquete' : 'Caja'}
                      </div>
                      {product.unitsPerPackage && (
                        <div className="text-sm text-gray-500">({product.unitsPerPackage} uds)</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-base font-medium">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-base font-semibold">{product.stock}</div>
                      {product.unitType !== 'unit' && product.unitsPerPackage && (
                        <div className="text-sm text-gray-500">
                          ({Math.floor(product.stock / product.unitsPerPackage)} {product.unitType === 'package' ? 'paq' : 'caj'})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-base font-medium">
                      ${(product.price * product.stock).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockColor}`}>
                          {stockStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenForm(product)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                        <button
                          onClick={() => handleOpenStockEntry(product)}
                          className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                          title="Ingresar Stock"
                        >
                          <PackagePlus className="w-4 h-4 text-green-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-base">
              No se encontraron productos
            </div>
          )}
        </div>
      </div>
    </div>
  );
}