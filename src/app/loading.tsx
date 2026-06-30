export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-700 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm font-medium">Cargando Óptica Roma...</p>
      </div>
    </div>
  );
}
