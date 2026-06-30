'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Save, X, Edit2, LogOut, Plus, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  modelo: string;
  marca: string;
  categoria: string;
  precio: number;
  stock_visible: boolean;
  imagen_url: string;
}

const CATEGORIAS = [
  'Armazones de Receta',
  'Lentes de Sol',
  'Lentes de Contacto',
  'Cristales',
  'Accesorios'
];

export default function AdminProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ precio: 0, categoria: '' });
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ modelo: '', marca: '', categoria: CATEGORIAS[0], precio: 0 });
  const [addImage, setAddImage] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/armazones?page=${page}&limit=50&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditForm({ precio: product.precio, categoria: product.categoria });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveProduct = async (id: number) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/armazones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, precio: editForm.precio, categoria: editForm.categoria })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.map(p => p.id === id ? { ...p, precio: editForm.precio, categoria: editForm.categoria } : p));
        setEditingId(null);
      } else {
        alert('Error al guardar: ' + data.error);
      }
    } catch (error) {
      alert('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAddImage(file);
      setAddImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.modelo || !addForm.marca) return alert('Modelo y marca son obligatorios');
    
    setAdding(true);
    try {
      const formData = new FormData();
      formData.append('modelo', addForm.modelo);
      formData.append('marca', addForm.marca);
      formData.append('categoria', addForm.categoria);
      formData.append('precio', addForm.precio.toString());
      if (addImage) {
        formData.append('image', addImage);
      }

      const res = await fetch('/api/admin/armazones', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setProducts([data.data, ...products]);
        setShowAddModal(false);
        setAddForm({ modelo: '', marca: '', categoria: CATEGORIAS[0], precio: 0 });
        setAddImage(null);
        setAddImagePreview(null);
      } else {
        alert('Error al crear producto: ' + data.error);
      }
    } catch (error) {
      alert('Error al crear producto');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por modelo o marca..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex items-center space-x-4 ml-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Producto
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm">
              <th className="p-4 border-b">ID</th>
              <th className="p-4 border-b">Imagen</th>
              <th className="p-4 border-b">Modelo</th>
              <th className="p-4 border-b">Marca</th>
              <th className="p-4 border-b">Categoría</th>
              <th className="p-4 border-b">Precio</th>
              <th className="p-4 border-b text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-gray-500">Cargando...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-gray-500">No se encontraron productos</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm">{product.id}</td>
                  <td className="p-4">
                    {product.imagen_url ? (
                      <img src={product.imagen_url} alt={product.modelo} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">N/A</div>
                    )}
                  </td>
                  <td className="p-4 font-medium">{product.modelo}</td>
                  <td className="p-4 text-sm">{product.marca}</td>
                  <td className="p-4">
                    {editingId === product.id ? (
                      <select
                        value={editForm.categoria}
                        onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                        className="border p-1 rounded text-sm w-full"
                      >
                        {CATEGORIAS.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded-full">{product.categoria}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingId === product.id ? (
                      <div className="flex items-center">
                        <span className="mr-1">$</span>
                        <input
                          type="number"
                          value={editForm.precio}
                          onChange={(e) => setEditForm({ ...editForm, precio: parseFloat(e.target.value) || 0 })}
                          className="border p-1 rounded text-sm w-24"
                        />
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-gray-900">${product.precio}</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {editingId === product.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => saveProduct(product.id)}
                          disabled={saving}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded transition"
                          title="Guardar"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded transition"
                          title="Cancelar"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(product)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition inline-flex"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Página {page} de {totalPages || 1}
        </span>
        <div className="flex space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal Agregar Producto */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Agregar Nuevo Producto</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                  <input required type="text" value={addForm.modelo} onChange={e => setAddForm({...addForm, modelo: e.target.value})} className="w-full border rounded-md p-2 text-sm" placeholder="Ej. RB3025" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                  <input required type="text" value={addForm.marca} onChange={e => setAddForm({...addForm, marca: e.target.value})} className="w-full border rounded-md p-2 text-sm" placeholder="Ej. Ray-Ban" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                  <select value={addForm.categoria} onChange={e => setAddForm({...addForm, categoria: e.target.value})} className="w-full border rounded-md p-2 text-sm">
                    {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                  <input type="number" min="0" value={addForm.precio} onChange={e => setAddForm({...addForm, precio: parseFloat(e.target.value) || 0})} className="w-full border rounded-md p-2 text-sm" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen (Foto)</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                  {addImagePreview ? (
                    <div className="relative inline-block">
                      <img src={addImagePreview} alt="Preview" className="max-h-32 rounded mx-auto object-contain" />
                      <div className="absolute top-1 right-1 bg-white rounded-full p-1 shadow">
                        <Edit2 className="w-3 h-3 text-gray-600" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <span className="text-sm">Haz clic para subir una foto</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={adding} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {adding ? 'Guardando...' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
