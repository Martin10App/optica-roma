import AdminProductList from '@/components/AdminProductList';

export const metadata = {
  title: 'Panel de Administración | Óptica Roma',
};

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administración de Productos</h1>
          <p className="mt-2 text-gray-600">
            Aquí puedes ver todo el catálogo, cambiar precios y asignar productos a diferentes categorías (como "Lentes de Sol").
          </p>
        </header>

        <AdminProductList />
      </div>
    </div>
  );
}
